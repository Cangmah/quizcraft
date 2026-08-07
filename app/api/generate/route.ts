import { NextResponse } from "next/server";
import { generateStudySet, type SourceContent } from "@/lib/anthropic";
import {
  MAX_FILE_BYTES,
  MAX_FILES,
  MAX_FLASHCARDS,
  MAX_QUIZ_QUESTIONS,
  type GenerateOptions,
} from "@/lib/types";

const SUPPORTED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
]);

export async function POST(request: Request) {
  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form data." }, { status: 400 });
  }

  const files = formData
    .getAll("file")
    .filter((f): f is File => f instanceof File && f.size > 0);
  const text = formData.get("text");

  const includeFlashcards = formData.get("includeFlashcards") === "true";
  const includeQuiz = formData.get("includeQuiz") === "true";
  const numFlashcards = Number(formData.get("numFlashcards") ?? 0);
  const numQuizQuestions = Number(formData.get("numQuizQuestions") ?? 0);

  if (!includeFlashcards && !includeQuiz) {
    return NextResponse.json(
      { error: "Select flashcards, quiz, or both." },
      { status: 400 }
    );
  }

  if (
    includeFlashcards &&
    (!Number.isInteger(numFlashcards) ||
      numFlashcards < 1 ||
      numFlashcards > MAX_FLASHCARDS)
  ) {
    return NextResponse.json(
      { error: `Flashcard count must be between 1 and ${MAX_FLASHCARDS}.` },
      { status: 400 }
    );
  }

  if (
    includeQuiz &&
    (!Number.isInteger(numQuizQuestions) ||
      numQuizQuestions < 1 ||
      numQuizQuestions > MAX_QUIZ_QUESTIONS)
  ) {
    return NextResponse.json(
      { error: `Quiz question count must be between 1 and ${MAX_QUIZ_QUESTIONS}.` },
      { status: 400 }
    );
  }

  const hasText = typeof text === "string" && text.trim().length > 0;

  if (files.length === 0 && !hasText) {
    return NextResponse.json(
      { error: "Upload a file or paste some text to generate from." },
      { status: 400 }
    );
  }

  if (files.length > MAX_FILES) {
    return NextResponse.json(
      { error: `You can upload at most ${MAX_FILES} files.` },
      { status: 400 }
    );
  }

  const sources: SourceContent[] = [];

  for (const uploadedFile of files) {
    if (uploadedFile.size > MAX_FILE_BYTES) {
      return NextResponse.json(
        { error: `"${uploadedFile.name}" is too large. Max size is 20MB per file.` },
        { status: 400 }
      );
    }

    const arrayBuffer = await uploadedFile.arrayBuffer();

    if (uploadedFile.type === "application/pdf") {
      sources.push({
        kind: "pdf",
        base64: Buffer.from(arrayBuffer).toString("base64"),
      });
    } else if (SUPPORTED_IMAGE_TYPES.has(uploadedFile.type)) {
      sources.push({
        kind: "image",
        base64: Buffer.from(arrayBuffer).toString("base64"),
        mediaType: uploadedFile.type as
          | "image/jpeg"
          | "image/png"
          | "image/gif"
          | "image/webp",
      });
    } else if (uploadedFile.type === "text/plain") {
      sources.push({
        kind: "text",
        text: Buffer.from(arrayBuffer).toString("utf-8"),
      });
    } else {
      return NextResponse.json(
        {
          error: `Unsupported file type for "${uploadedFile.name}". Upload PDFs, images (JPEG/PNG/GIF/WEBP), or .txt files.`,
        },
        { status: 400 }
      );
    }
  }

  if (hasText) {
    sources.push({ kind: "text", text: (text as string).trim() });
  }

  const options: GenerateOptions = {
    includeFlashcards,
    includeQuiz,
    numFlashcards,
    numQuizQuestions,
  };

  try {
    const studySet = await generateStudySet(sources, options);
    return NextResponse.json(studySet);
  } catch (error) {
    console.error("Failed to generate study set:", error);
    const message =
      error instanceof Error ? error.message : "Failed to generate study materials.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
