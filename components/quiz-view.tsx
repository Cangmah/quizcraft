"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { QuizQuestion } from "@/lib/types";

interface QuizViewProps {
  quiz: QuizQuestion[];
}

export function QuizView({ quiz }: QuizViewProps) {
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answers, setAnswers] = useState<(number | null)[]>(
    () => new Array(quiz.length).fill(null)
  );
  const [finished, setFinished] = useState(false);

  const question = quiz[index];

  function selectOption(optionIndex: number) {
    if (selected !== null) return;
    setSelected(optionIndex);
    const next = [...answers];
    next[index] = optionIndex;
    setAnswers(next);
  }

  function next() {
    if (index + 1 < quiz.length) {
      setIndex(index + 1);
      setSelected(answers[index + 1]);
    } else {
      setFinished(true);
    }
  }

  function restart() {
    setIndex(0);
    setSelected(null);
    setAnswers(new Array(quiz.length).fill(null));
    setFinished(false);
  }

  if (finished) {
    const score = answers.filter(
      (a, i) => a === quiz[i].correctIndex
    ).length;

    return (
      <div className="flex flex-col gap-4">
        <Card>
          <CardContent className="flex flex-col items-center gap-2 py-8 text-center">
            <p className="text-sm text-muted-foreground">Your score</p>
            <p className="text-4xl font-bold">
              {score} / {quiz.length}
            </p>
          </CardContent>
        </Card>

        <div className="flex flex-col gap-3">
          {quiz.map((q, i) => {
            const userAnswer = answers[i];
            const isCorrect = userAnswer === q.correctIndex;
            return (
              <Card key={i}>
                <CardContent className="flex flex-col gap-2 py-4">
                  <p className="text-sm font-medium">
                    {i + 1}. {q.question}
                  </p>
                  <p
                    className={`text-sm ${
                      isCorrect ? "text-green-600" : "text-destructive"
                    }`}
                  >
                    Your answer:{" "}
                    {userAnswer !== null ? q.options[userAnswer] : "—"}
                    {isCorrect ? " (Correct)" : ""}
                  </p>
                  {!isCorrect && (
                    <p className="text-sm text-muted-foreground">
                      Correct answer: {q.options[q.correctIndex]}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    {q.explanation}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Button type="button" onClick={restart} variant="outline">
          Retake quiz
        </Button>
      </div>
    );
  }

  if (!question) return null;

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-muted-foreground">
        Question {index + 1} of {quiz.length}
      </p>

      <Card>
        <CardContent className="flex flex-col gap-4 py-6">
          <p className="text-lg font-medium">{question.question}</p>

          <div className="flex flex-col gap-2">
            {question.options.map((option, optionIndex) => {
              const isSelected = selected === optionIndex;
              const isCorrectOption = optionIndex === question.correctIndex;
              let stateClass = "border-input hover:border-primary/50";
              if (selected !== null) {
                if (isCorrectOption) {
                  stateClass = "border-green-600 bg-green-50 dark:bg-green-950";
                } else if (isSelected) {
                  stateClass = "border-destructive bg-destructive/5";
                }
              }
              return (
                <button
                  key={optionIndex}
                  type="button"
                  onClick={() => selectOption(optionIndex)}
                  disabled={selected !== null}
                  className={`rounded-lg border p-3 text-left text-sm transition-colors ${stateClass}`}
                >
                  {option}
                </button>
              );
            })}
          </div>

          {selected !== null && (
            <p className="text-sm text-muted-foreground">
              {question.explanation}
            </p>
          )}
        </CardContent>
      </Card>

      <Button type="button" onClick={next} disabled={selected === null}>
        {index + 1 < quiz.length ? "Next question" : "See results"}
      </Button>
    </div>
  );
}
