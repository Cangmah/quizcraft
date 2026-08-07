# QuizCraft

An AI-powered studying tool that turns your course material into flashcards and quizzes. Upload a PDF, image, or `.txt` file — or just paste text — and Claude reads it and generates a study set you can work through right in the browser.

## What it does

- **Multiple input sources**: upload one or more PDFs, images (JPEG/PNG/GIF/WEBP), or `.txt` files, and/or paste text directly. All sources can be combined in a single generation — Claude reads everything together.
- **Flashcards**: choose how many to generate (up to 30), then review them as flip cards with question on the front and answer on the back.
- **Multiple-choice quiz**: choose how many questions (up to 30), answer them one at a time with instant right/wrong feedback and an explanation, then see a final score and full review.
- **Generate either or both** in the same request.
- No accounts, no database — everything lives in the browser for the session. Nothing is saved server-side.

## Tech stack

- [Next.js](https://nextjs.org) (App Router) + TypeScript
- [Tailwind CSS](https://tailwindcss.com) + [shadcn/ui](https://ui.shadcn.com)
- [Claude API](https://docs.anthropic.com) (`@anthropic-ai/sdk`) — reads uploaded PDFs/images natively and returns structured flashcards/quiz data via forced tool use

## How it works

1. The upload form (client-side) collects your files/text and generation options.
2. On submit, everything is sent to a server route (`app/api/generate/route.ts`), which builds a single Claude request combining all sources.
3. Claude is called with a forced tool call (`generate_study_materials`) so it returns structured JSON instead of freeform text.
4. The result is rendered as flip-card flashcards and/or an interactive quiz.

## Getting started

Install dependencies:

```bash
npm install
```

Add your [Anthropic API key](https://console.anthropic.com) to `.env.local` (copy `.env.local.example` if it doesn't exist):

```
ANTHROPIC_API_KEY=your-key-here
```

Run the dev server:

```bash
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000).

**Note:** every generation makes a real, billed call to the Claude API — nothing is charged until you click "Generate study set."
