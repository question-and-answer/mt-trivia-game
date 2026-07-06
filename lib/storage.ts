import { kv } from "@vercel/kv";
import type { GameState } from "./types";

const memory = globalThis as typeof globalThis & {
  mtTriviaGames?: Map<string, GameState>;
};

if (!memory.mtTriviaGames) {
  memory.mtTriviaGames = new Map<string, GameState>();
}

const hasKv = Boolean(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN);
const key = (roomId: string) => `mt-trivia:${roomId.toUpperCase()}`;

export async function getGame(roomId: string): Promise<GameState | null> {
  const normalized = roomId.toUpperCase();
  if (hasKv) {
    return (await kv.get<GameState>(key(normalized))) ?? null;
  }
  return memory.mtTriviaGames!.get(normalized) ?? null;
}

export async function saveGame(state: GameState): Promise<GameState> {
  const normalized = state.roomId.toUpperCase();
  const next = { ...state, roomId: normalized };
  if (hasKv) {
    await kv.set(key(normalized), next);
  } else {
    memory.mtTriviaGames!.set(normalized, next);
  }
  return next;
}

export async function deleteGame(roomId: string) {
  const normalized = roomId.toUpperCase();
  if (hasKv) {
    await kv.del(key(normalized));
  } else {
    memory.mtTriviaGames!.delete(normalized);
  }
}
