"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { Flashcard } from "@/lib/types";

interface FlashcardDeckProps {
  flashcards: Flashcard[];
}

export function FlashcardDeck({ flashcards }: FlashcardDeckProps) {
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);

  const card = flashcards[index];

  function goTo(newIndex: number) {
    setIndex(Math.max(0, Math.min(flashcards.length - 1, newIndex)));
    setFlipped(false);
  }

  if (!card) return null;

  return (
    <div className="flex flex-col items-center gap-4">
      <p className="text-sm text-muted-foreground">
        Card {index + 1} of {flashcards.length}
      </p>

      <button
        type="button"
        onClick={() => setFlipped((f) => !f)}
        className="flex h-64 w-full max-w-xl cursor-pointer items-center justify-center rounded-xl border bg-card p-8 text-center shadow-sm transition-transform hover:scale-[1.01]"
      >
        <div className="flex flex-col gap-2">
          <span className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
            {flipped ? "Answer" : "Question"}
          </span>
          <p className="text-lg font-medium">
            {flipped ? card.answer : card.question}
          </p>
          <span className="mt-2 text-xs text-muted-foreground">
            Click to flip
          </span>
        </div>
      </button>

      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => goTo(index - 1)}
          disabled={index === 0}
        >
          Previous
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => goTo(index + 1)}
          disabled={index === flashcards.length - 1}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
