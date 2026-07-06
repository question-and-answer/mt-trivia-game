# MT 잡학지식: 이걸 왜 알아?

Korean MT live trivia game show app built with Next.js App Router, TypeScript, and a Redis-ready storage abstraction.

## Run Locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## How To Use

1. Click `새 게임 만들기` on `/`.
2. Open the display link on the laptop, TV, or projector.
3. Scan the QR code or open the host controller link on your phone.
4. Use the host screen to start rounds, select/open/reveal questions, score teams, run events, and show the winner.

The display screen is read-only and polls state every second. It never shows host notes, answers before reveal, score controls, reset buttons, or admin UI.

## Deploy To Vercel

1. Push this folder to a Git repository.
2. Import the project in Vercel.
3. Add Vercel KV or Upstash Redis environment variables.
4. Deploy.

## Vercel KV / Upstash Redis

This app uses `lib/storage.ts`.

When these environment variables exist, it uses Vercel KV:

```bash
KV_REST_API_URL=...
KV_REST_API_TOKEN=...
```

Without those variables it uses an in-memory fallback. The fallback is fine for local testing, but it is not reliable for serverless production because instances can restart or scale separately.

## Edit Questions

Edit [lib/questions.ts](./lib/questions.ts).

Each question supports:

- category
- point value in 50-point increments
- type
- question text
- answer
- explanation
- image path
- multiple-choice options
- host note
- partial credit flag
- event metadata

The board has 10 categories and 5 questions per category. Point values are intentionally mixed inside each category so the board position does not reveal difficulty.

## Replace Images

Add files under `public/images`.

Example:

```text
public/images/placeholder-math.jpg
public/images/placeholder-skull.jpg
```

If an image file is missing, the display shows a clean `이미지 준비 중` fallback instead of breaking.

## Host Controller

Use `/host/[roomId]?token=HOST_TOKEN`.

The host can:

- start Part 1, Part 2, Final, and Ended states
- move previous/next team
- browse and select question tiles
- open, reveal, close, mark used, and mark unused
- see answer, explanation, host note, event type, and image path
- add/subtract score quickly
- enter custom or manual scores
- undo last score change
- apply steal, bonus, penalty, mine, swap, halve, reset, laptop bonus, and performance bonus
- edit team names
- reset scores or game
- copy display/host links
- export scores as JSON or CSV by copying to clipboard
- enter final bets, mark final results, calculate final scores, and show the winner

Dangerous actions ask for confirmation in the browser.

## Reset Game

On the host screen, use `게임 리셋` to recreate the room state. This keeps the same room ID but generates a new host token, so create a fresh host link from the landing page if needed. For most live use, prefer `전체 점수 리셋`.

## Export Scores

On the host screen, use:

- `JSON 복사`
- `CSV 복사`

The data is copied to your clipboard.
