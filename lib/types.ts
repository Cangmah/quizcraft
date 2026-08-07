export interface Flashcard {
  question: string;
  answer: string;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface StudySet {
  flashcards: Flashcard[];
  quiz: QuizQuestion[];
}

export interface GenerateOptions {
  includeFlashcards: boolean;
  includeQuiz: boolean;
  numFlashcards: number;
  numQuizQuestions: number;
}

export const MAX_FLASHCARDS = 30;
export const MAX_QUIZ_QUESTIONS = 30;
export const MAX_FILE_BYTES = 20 * 1024 * 1024;
export const MAX_FILES = 10;
