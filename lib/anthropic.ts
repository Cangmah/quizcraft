import Anthropic from "@anthropic-ai/sdk";
import type { GenerateOptions, StudySet } from "./types";

export const MODEL = "claude-sonnet-5";

let client: Anthropic | null = null;

export function getAnthropicClient(): Anthropic {
  if (!client) {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error(
        "ANTHROPIC_API_KEY is not set. Add it to .env.local and restart the dev server."
      );
    }
    client = new Anthropic({ apiKey });
  }
  return client;
}

const STUDY_SET_TOOL: Anthropic.Tool = {
  name: "generate_study_materials",
  description:
    "Return the generated flashcards and/or quiz questions extracted from the provided study material.",
  input_schema: {
    type: "object",
    properties: {
      flashcards: {
        type: "array",
        description: "Flashcards covering key concepts from the material.",
        items: {
          type: "object",
          properties: {
            question: { type: "string" },
            answer: { type: "string" },
          },
          required: ["question", "answer"],
        },
      },
      quiz: {
        type: "array",
        description: "Multiple-choice quiz questions covering the material.",
        items: {
          type: "object",
          properties: {
            question: { type: "string" },
            options: {
              type: "array",
              items: { type: "string" },
              minItems: 4,
              maxItems: 4,
              description: "Exactly 4 answer options.",
            },
            correctIndex: {
              type: "integer",
              description: "Index (0-3) of the correct option.",
            },
            explanation: {
              type: "string",
              description: "Brief explanation of why the correct answer is right.",
            },
          },
          required: ["question", "options", "correctIndex", "explanation"],
        },
      },
    },
    required: ["flashcards", "quiz"],
  },
};

function buildPrompt(options: GenerateOptions): string {
  const parts: string[] = [
    "You are a study assistant. Read all of the attached material (which may span multiple files and/or pasted text) and generate study aids from it as a whole.",
  ];

  if (options.includeFlashcards) {
    parts.push(
      `Generate exactly ${options.numFlashcards} flashcards. Each flashcard should have a concise question (front) and a clear answer (back) covering a distinct key concept from the material.`
    );
  } else {
    parts.push("Return an empty array for flashcards.");
  }

  if (options.includeQuiz) {
    parts.push(
      `Generate exactly ${options.numQuizQuestions} multiple-choice quiz questions. Each question must have exactly 4 options, one correct answer (correctIndex), and a brief explanation of the correct answer. Avoid duplicate questions and make distractors plausible but clearly wrong.`
    );
  } else {
    parts.push("Return an empty array for quiz.");
  }

  parts.push(
    "Base all questions strictly on the content provided. Call the generate_study_materials tool with the result."
  );

  return parts.join("\n\n");
}

export type SourceContent =
  | { kind: "text"; text: string }
  | { kind: "pdf"; base64: string }
  | { kind: "image"; base64: string; mediaType: "image/jpeg" | "image/png" | "image/gif" | "image/webp" };

export async function generateStudySet(
  sources: SourceContent[],
  options: GenerateOptions
): Promise<StudySet> {
  const anthropic = getAnthropicClient();

  const contentBlocks: Anthropic.ContentBlockParam[] = [];

  for (const source of sources) {
    if (source.kind === "pdf") {
      contentBlocks.push({
        type: "document",
        source: { type: "base64", media_type: "application/pdf", data: source.base64 },
      });
    } else if (source.kind === "image") {
      contentBlocks.push({
        type: "image",
        source: { type: "base64", media_type: source.mediaType, data: source.base64 },
      });
    } else {
      contentBlocks.push({ type: "text", text: source.text });
    }
  }

  contentBlocks.push({ type: "text", text: buildPrompt(options) });

  const message = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 8192,
    tools: [STUDY_SET_TOOL],
    tool_choice: { type: "tool", name: "generate_study_materials" },
    messages: [{ role: "user", content: contentBlocks }],
  });

  const toolUse = message.content.find(
    (block): block is Anthropic.ToolUseBlock => block.type === "tool_use"
  );

  if (!toolUse) {
    throw new Error("Claude did not return structured study materials.");
  }

  const result = toolUse.input as StudySet;

  return {
    flashcards: result.flashcards ?? [],
    quiz: result.quiz ?? [],
  };
}
