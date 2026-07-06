import type { GameState, Question } from "./types";
import { questions } from "./questions";

const memory = globalThis as typeof globalThis & {
  mtTriviaGames?: Map<string, GameState>;
  mtTriviaQuestions?: Question[];
};

if (!memory.mtTriviaGames) {
  memory.mtTriviaGames = new Map<string, GameState>();
}

if (!memory.mtTriviaQuestions) {
  memory.mtTriviaQuestions = questions;
}

const redisUrl = cleanEnv(process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL);
const redisToken = cleanEnv(process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN);
const hasRedis = Boolean(redisUrl && redisToken);
const key = (roomId: string) => `mt-trivia:${roomId.toUpperCase()}`;
const questionsKey = "mt-trivia:questions";

export async function getGame(roomId: string): Promise<GameState | null> {
  const normalized = roomId.toUpperCase();
  const questionBank = await getQuestionBank();
  if (hasRedis) {
    const value = await redisCommand<unknown>(["GET", key(normalized)]);
    if (!value) return null;
    return normalizeGame(typeof value === "string" ? JSON.parse(value) as GameState : value as GameState, questionBank);
  }
  const game = memory.mtTriviaGames!.get(normalized) ?? null;
  return game ? normalizeGame(game, questionBank) : null;
}

export async function saveGame(state: GameState): Promise<GameState> {
  const normalized = state.roomId.toUpperCase();
  const next = { ...state, roomId: normalized };
  if (hasRedis) {
    await redisCommand(["SET", key(normalized), JSON.stringify(next)]);
  } else {
    memory.mtTriviaGames!.set(normalized, next);
  }
  return next;
}

function normalizeGame(state: GameState, questionBank: Question[]): GameState {
  return {
    ...state,
    questions: questionBank
  };
}

export async function getQuestionBank(): Promise<Question[]> {
  if (hasRedis) {
    const value = await redisCommand<unknown>(["GET", questionsKey]);
    if (!value) return questions;
    return typeof value === "string" ? JSON.parse(value) as Question[] : value as Question[];
  }
  return memory.mtTriviaQuestions ?? questions;
}

export async function saveQuestionBank(nextQuestions: Question[]): Promise<Question[]> {
  if (hasRedis) {
    await redisCommand(["SET", questionsKey, JSON.stringify(nextQuestions)]);
  } else {
    memory.mtTriviaQuestions = nextQuestions;
  }
  return nextQuestions;
}

export async function deleteGame(roomId: string) {
  const normalized = roomId.toUpperCase();
  if (hasRedis) {
    await redisCommand(["DEL", key(normalized)]);
  } else {
    memory.mtTriviaGames!.delete(normalized);
  }
}

function cleanEnv(value?: string) {
  return value?.trim().replace(/^["']|["']$/g, "");
}

async function redisCommand<T>(command: string[]): Promise<T> {
  const response = await fetch(`${redisUrl}/pipeline`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${redisToken}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify([command])
  });

  if (!response.ok) {
    throw new Error(`Redis request failed: ${response.status}`);
  }

  const payload = await response.json() as Array<{ result?: T; error?: string }>;
  if (payload[0]?.error) {
    throw new Error(payload[0].error);
  }
  return payload[0]?.result as T;
}
