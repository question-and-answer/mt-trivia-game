import type { GameState, QuestionEvent, Round, ScoreHistoryItem, Team } from "./types";
import { questions } from "./questions";

export function makeRoomId() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return Array.from({ length: 5 }, () => alphabet[Math.floor(Math.random() * alphabet.length)]).join("");
}

export function makeToken() {
  return crypto.randomUUID().replaceAll("-", "");
}

export function createInitialGame(roomId = makeRoomId()): GameState {
  const teams: Team[] = Array.from({ length: 5 }, (_, index) => ({
    id: `team-${index + 1}`,
    name: `${index + 1}팀`,
    score: 0
  }));

  return {
    roomId,
    hostToken: makeToken(),
    questions,
    teams,
    currentTeamIndex: 0,
    currentRound: "setup",
    revealedAnswer: false,
    usedQuestionIds: [],
    scoreHistory: [],
    finalBets: Object.fromEntries(teams.map((team) => [team.id, 0])),
    finalResults: Object.fromEntries(teams.map((team) => [team.id, "pending"])),
    updatedAt: new Date().toISOString()
  };
}

export function touch(state: GameState): GameState {
  return { ...state, updatedAt: new Date().toISOString() };
}

export function publicState(state: GameState) {
  const { hostToken, ...safe } = state;
  return safe;
}

export function requireHost(state: GameState, token?: string) {
  if (!token || token !== state.hostToken) {
    throw new Error("Invalid host token");
  }
}

export function setRound(state: GameState, round: Round): GameState {
  return touch({
    ...state,
    currentRound: round,
    openedQuestionId: round === "final" ? "final-1" : state.openedQuestionId,
    selectedQuestionId: round === "final" ? "final-1" : state.selectedQuestionId,
    revealedAnswer: false,
    gameMessage: round === "ended" ? "게임 종료!" : undefined
  });
}

export function moveTeam(state: GameState, direction: 1 | -1): GameState {
  const count = state.teams.length;
  return touch({
    ...state,
    currentTeamIndex: (state.currentTeamIndex + direction + count) % count,
    gameMessage: undefined
  });
}

export function updateScore(state: GameState, teamId: string, delta: number, reason: string): GameState {
  const team = state.teams.find((item) => item.id === teamId);
  if (!team) return state;
  const item: ScoreHistoryItem = {
    id: crypto.randomUUID(),
    teamId,
    delta,
    reason,
    createdAt: new Date().toISOString(),
    previousScore: team.score,
    nextScore: team.score + delta
  };

  return touch({
    ...state,
    teams: state.teams.map((candidate) =>
      candidate.id === teamId ? { ...candidate, score: candidate.score + delta } : candidate
    ),
    scoreHistory: [item, ...state.scoreHistory].slice(0, 100),
    gameMessage: `${team.name} ${delta >= 0 ? "+" : ""}${delta}`
  });
}

export function editScore(state: GameState, teamId: string, score: number): GameState {
  const team = state.teams.find((item) => item.id === teamId);
  if (!team) return state;
  return updateScore(state, teamId, score - team.score, "manual_edit");
}

export function undoScore(state: GameState): GameState {
  const [last, ...rest] = state.scoreHistory;
  if (!last) return state;
  const team = state.teams.find((item) => item.id === last.teamId);
  return touch({
    ...state,
    teams: state.teams.map((candidate) =>
      candidate.id === last.teamId ? { ...candidate, score: last.previousScore } : candidate
    ),
    scoreHistory: rest,
    gameMessage: team ? `${team.name} 점수 되돌림` : "점수 되돌림"
  });
}

export function eventMessage(event: QuestionEvent, teamName?: string, amount?: number) {
  const name = teamName ? `${teamName} ` : "";
  if (event === "double_points") return "더블 포인트!";
  if (event === "steal_points") return "스틸 성공!";
  if (event === "score_swap") return "점수 교환!";
  if (event === "halve_score") return `${name}점수 절반!`;
  if (event === "reset_score") return `${name}점수 리셋!`;
  if (event === "bonus") return `${name}보너스 +${amount ?? 0}`;
  if (event === "penalty") return `${name}페널티 -${amount ?? 0}`;
  if (event === "mine") return "지뢰 발동!";
  if (event === "laptop_lender_bonus") return `${name}노트북 공로상!`;
  if (event === "performance_bonus") return `${name}공연 보너스!`;
  return "이벤트!";
}

export function calculateWinner(state: GameState): GameState {
  const max = Math.max(...state.teams.map((team) => team.score));
  const winner = state.teams.find((team) => team.score === max);
  return touch({
    ...state,
    winnerTeamId: winner?.id,
    gameMessage: winner ? `${winner.name} 우승!` : "우승팀 결정"
  });
}
