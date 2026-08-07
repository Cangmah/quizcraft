"use client";

import { useRef, useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { MAX_FILES, MAX_FLASHCARDS, MAX_QUIZ_QUESTIONS } from "@/lib/types";

export interface GenerateFormValues {
  files: File[];
  text: string;
  includeFlashcards: boolean;
  includeQuiz: boolean;
  numFlashcards: number;
  numQuizQuestions: number;
}

interface UploadFormProps {
  onGenerate: (values: GenerateFormValues) => void;
  error: string | null;
}

function isSameFile(a: File, b: File) {
  return a.name === b.name && a.size === b.size && a.lastModified === b.lastModified;
}

export function UploadForm({ onGenerate, error }: UploadFormProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [text, setText] = useState("");
  const [includeFlashcards, setIncludeFlashcards] = useState(true);
  const [includeQuiz, setIncludeQuiz] = useState(true);
  const [numFlashcards, setNumFlashcards] = useState(10);
  const [numQuizQuestions, setNumQuizQuestions] = useState(10);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function addFiles(selected: FileList | File[] | null) {
    if (!selected) return;
    const incoming = Array.from(selected);
    setFiles((prev) => {
      const next = [...prev];
      for (const file of incoming) {
        if (!next.some((existing) => isSameFile(existing, file))) {
          next.push(file);
        }
      }
      return next.slice(0, MAX_FILES);
    });
  }

  function removeFile(index: number) {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onGenerate({
      files,
      text,
      includeFlashcards,
      includeQuiz,
      numFlashcards,
      numQuizQuestions,
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <Card>
        <CardContent className="flex flex-col gap-4">
          <div
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragging(false);
              addFiles(e.dataTransfer.files);
            }}
            className={`flex cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed p-8 text-center transition-colors ${
              isDragging
                ? "border-primary bg-primary/5"
                : "border-input hover:border-primary/50"
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".pdf,.txt,image/jpeg,image/png,image/gif,image/webp"
              className="hidden"
              onChange={(e) => {
                addFiles(e.target.files);
                e.target.value = "";
              }}
            />
            <p className="text-sm font-medium">
              Drag & drop a PDF, image, or .txt file
            </p>
            <p className="text-xs text-muted-foreground">or click to browse</p>
          </div>

          {files.length > 0 && (
            <ul className="flex flex-col gap-1.5">
              {files.map((file, index) => (
                <li
                  key={`${file.name}-${file.size}-${file.lastModified}`}
                  className="flex items-center justify-between gap-2 rounded-md border bg-muted/40 px-3 py-1.5 text-sm"
                >
                  <span className="truncate">{file.name}</span>
                  <button
                    type="button"
                    onClick={() => removeFile(index)}
                    className="shrink-0 text-muted-foreground hover:text-foreground"
                    aria-label={`Remove ${file.name}`}
                  >
                    <X className="size-4" />
                  </button>
                </li>
              ))}
            </ul>
          )}

          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <div className="h-px flex-1 bg-border" />
            and / or paste text
            <div className="h-px flex-1 bg-border" />
          </div>

          <Textarea
            placeholder="Paste your study material here..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={6}
          />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <Checkbox
              id="include-flashcards"
              checked={includeFlashcards}
              onCheckedChange={(checked) => setIncludeFlashcards(checked === true)}
            />
            <Label htmlFor="include-flashcards" className="flex-1">
              Flashcards
            </Label>
            <Input
              type="number"
              min={1}
              max={MAX_FLASHCARDS}
              value={numFlashcards}
              disabled={!includeFlashcards}
              onChange={(e) => setNumFlashcards(Number(e.target.value))}
              className="w-20"
            />
          </div>

          <div className="flex items-center gap-2">
            <Checkbox
              id="include-quiz"
              checked={includeQuiz}
              onCheckedChange={(checked) => setIncludeQuiz(checked === true)}
            />
            <Label htmlFor="include-quiz" className="flex-1">
              Quiz questions
            </Label>
            <Input
              type="number"
              min={1}
              max={MAX_QUIZ_QUESTIONS}
              value={numQuizQuestions}
              disabled={!includeQuiz}
              onChange={(e) => setNumQuizQuestions(Number(e.target.value))}
              className="w-20"
            />
          </div>
        </CardContent>
      </Card>

      {error && (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}

      <Button type="submit" size="lg" className="w-full">
        Generate study set
      </Button>
    </form>
  );
}
