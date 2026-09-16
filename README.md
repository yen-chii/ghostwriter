# Ghostwriter

**Say it messy. Post it clearly.** Ghostwriter turns an unfiltered spoken thought into publishable social content in three genuinely different voices.

![Demo placeholder — add product walkthrough GIF here](./docs/demo-placeholder.gif)

## What it does

Speak for up to 60 seconds (or paste a thought), review the live transcription, and receive Tech Bro, Academic, and Deeply Personal versions designed for X or LinkedIn. Each version can be copied or regenerated independently.

## Features

- Browser-native live speech recognition, interim transcription, timer, and permission/error handling
- Secure server-side OpenAI generation with typed request and response validation
- Three distinct editorial personalities and platform-aware writing
- Clipboard copy feedback, per-card regeneration, mobile-first UI, and reduced-motion support
- Clearly-labelled local demo mode when `OPENAI_API_KEY` is unavailable

## Architecture

```text
Browser → Web Speech API → transcript → Next.js API route → OpenAI → validated JSON → React UI
```

The client never receives the API key. `src/lib/validation.ts` owns runtime schemas, `src/lib/prompts.ts` owns the editorial instructions, and `src/app/api/generate/route.ts` handles the secure generation boundary.

## Tech stack

Next.js App Router, React, TypeScript, Zod, OpenAI Responses API, browser Web Speech API, ESLint, and Vitest.

## Getting started

```bash
npm install
cp .env.example .env.local
# add your OpenAI key to .env.local
npm run dev
```

Open `http://localhost:3000`. Without a key, the application stays usable in explicitly marked **Demo mode**; it never claims those samples came from OpenAI.

## Environment variables

| Variable | Required | Purpose |
| --- | --- | --- |
| `OPENAI_API_KEY` | For live generation | Used only by the server API route to call OpenAI |

## Testing and verification

```bash
npm run lint
npm test
npm run build
npm run test:e2e
```

Unit and API coverage verify transcript and response schemas, character counting, prompt construction, demo behavior, malformed model output, and input rejection. Playwright covers the typed-thought → results → copy journey. External OpenAI calls are not required for tests.

## Browser support

Speech recognition relies on the browser Web Speech API, which is most reliably available in Chromium browsers. Unsupported browsers and microphone failures show a useful message and retain the typed-input workflow.

## Design decisions

- **Web Speech API:** fast, privacy-respecting live text feedback without uploading audio.
- **Server-side OpenAI:** keeps credentials out of the browser and centralises validation.
- **Structured JSON:** provides a predictable boundary between model output and the UI.
- **Three voices:** makes the creative transformation tangible without turning the product into a chatbot.

## Future improvements

Audio upload, saved drafts, authentication, content history, analytics, additional platforms, voice controls, streaming generation, and persistent profiles.
# ghostwriter
