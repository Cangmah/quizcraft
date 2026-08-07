"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { FlashcardDeck } from "@/components/flashcard-deck";
import { QuizView } from "@/components/quiz-view";
import { UploadForm, type GenerateFormValues } from "@/components/upload-form";
import type { StudySet } from "@/lib/types";

type Stage = "input" | "loading" | "results";

export default function Home() {
  const [stage, setStage] = useState<Stage>("input");
  const [error, setError] = useState<string | null>(null);
  const [studySet, setStudySet] = useState<StudySet | null>(null);

  async function handleGenerate(values: GenerateFormValues) {
    setError(null);

    if (!values.includeFlashcards && !values.includeQuiz) {
      setError("Select flashcards, quiz, or both.");
      return;
    }
    if (values.files.length === 0 && !values.text.trim()) {
      setError("Upload a file or paste some text to generate from.");
      return;
    }

    const formData = new FormData();
    for (const file of values.files) formData.append("file", file);
    if (values.text.trim()) formData.set("text", values.text.trim());
    formData.set("includeFlashcards", String(values.includeFlashcards));
    formData.set("includeQuiz", String(values.includeQuiz));
    formData.set("numFlashcards", String(values.numFlashcards));
    formData.set("numQuizQuestions", String(values.numQuizQuestions));

    setStage("loading");

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error ?? "Failed to generate study materials.");
      }

      setStudySet(data as StudySet);
      setStage("results");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setStage("input");
    }
  }

  function reset() {
    setStudySet(null);
    setError(null);
    setStage("input");
  }

  return (
    <div className="flex flex-1 flex-col items-center bg-zinc-50 px-4 py-12 dark:bg-black">
      <div className="flex w-full max-w-2xl flex-col gap-8">
        <header className="flex flex-col items-center gap-2 text-center">
          <h1 className="text-3xl font-semibold tracking-tight">QuizCraft</h1>
          <p className="text-muted-foreground">
            Turn your notes into flashcards and quizzes with Claude.
          </p>
        </header>

        {stage === "input" && (
          <UploadForm onGenerate={handleGenerate} error={error} />
        )}

        {stage === "loading" && (
          <div className="flex flex-col items-center gap-3 py-16">
            <div className="size-8 animate-spin rounded-full border-2 border-muted-foreground/30 border-t-foreground" />
            <p className="text-sm text-muted-foreground">
              Generating your study set...
            </p>
          </div>
        )}

        {stage === "results" && studySet && (
          <div className="flex flex-col gap-6">
            <ResultsView studySet={studySet} />
            <Button type="button" variant="outline" onClick={reset}>
              Start over
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

function ResultsView({ studySet }: { studySet: StudySet }) {
  const hasFlashcards = studySet.flashcards.length > 0;
  const hasQuiz = studySet.quiz.length > 0;

  if (hasFlashcards && hasQuiz) {
    return (
      <Tabs defaultValue="flashcards">
        <TabsList>
          <TabsTrigger value="flashcards">Flashcards</TabsTrigger>
          <TabsTrigger value="quiz">Quiz</TabsTrigger>
        </TabsList>
        <TabsContent value="flashcards" className="pt-4">
          <FlashcardDeck flashcards={studySet.flashcards} />
        </TabsContent>
        <TabsContent value="quiz" className="pt-4">
          <QuizView quiz={studySet.quiz} />
        </TabsContent>
      </Tabs>
    );
  }

  if (hasFlashcards) {
    return <FlashcardDeck flashcards={studySet.flashcards} />;
  }

  if (hasQuiz) {
    return <QuizView quiz={studySet.quiz} />;
  }

  return (
    <p className="text-center text-sm text-muted-foreground">
      No study materials were generated.
    </p>
  );
}
