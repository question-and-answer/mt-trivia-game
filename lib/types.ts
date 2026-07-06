export type QuestionType =
  | "normal"
  | "trick"
  | "math"
  | "image"
  | "emoji"
  | "song"
  | "multiple-choice"
  | "location"
  | "mission"
  | "event"
  | "final";

export type QuestionEvent =
  | "none"
  | "double_points"
  | "steal_points"
  | "score_swap"
  | "halve_score"
  | "reset_score"
  | "bonus"
  | "penalty"
  | "mine"
  | "laptop_lender_bonus"
  | "performance_bonus";

export type Question = {
  id: string;
  categoryId: string;
  points: number;
  type: QuestionType;
  q: string;
  a: string;
  explanation?: string;
  image?: string;
  options?: string[];
  hostNote?: string;
  partialCredit?: boolean;
  event?: QuestionEvent;
  bonusPoints?: number;
  penaltyPoints?: number;
};

export type Category = {
  id: string;
  name: string;
};

export type Team = {
  id: string;
  name: string;
  score: number;
};

export type ScoreHistoryItem = {
  id: string;
  teamId: string;
  delta: number;
  reason: string;
  createdAt: string;
  previousScore: number;
  nextScore: number;
};

export type Round = "setup" | "part1" | "part2" | "final" | "ended";

export type GameState = {
  roomId: string;
  hostToken: string;
  teams: Team[];
  currentTeamIndex: number;
  currentRound: Round;
  selectedQuestionId?: string;
  openedQuestionId?: string;
  revealedAnswer: boolean;
  usedQuestionIds: string[];
  scoreHistory: ScoreHistoryItem[];
  finalBets: Record<string, number>;
  finalResults: Record<string, "correct" | "wrong" | "pending">;
  gameMessage?: string;
  winnerTeamId?: string;
  updatedAt: string;
};

export type PublicGameState = Omit<GameState, "hostToken">;
