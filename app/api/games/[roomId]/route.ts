import { NextRequest, NextResponse } from "next/server";
import {
  calculateWinner,
  createInitialGame,
  editScore,
  eventMessage,
  moveTeam,
  publicState,
  requireHost,
  setRound,
  touch,
  undoScore,
  updateScore
} from "@/lib/game";
import { getQuestion } from "@/lib/questions";
import { getGame, saveGame } from "@/lib/storage";
import type { GameState, QuestionEvent, Round } from "@/lib/types";

type Context = { params: Promise<{ roomId: string }> };

export async function GET(_request: NextRequest, context: Context) {
  try {
    const { roomId } = await context.params;
    const game = await getGame(roomId);
    if (!game) return NextResponse.json({ error: "Game not found" }, { status: 404 });
    return NextResponse.json({ state: publicState(game) });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to load game" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest, context: Context) {
  const { roomId } = await context.params;
  const body = await request.json().catch(() => ({}));
  const action = String(body.action ?? "");
  const token = request.headers.get("x-host-token") ?? body.hostToken;

  try {
    let state = await getGame(roomId);
    if (!state) return NextResponse.json({ error: "Game not found" }, { status: 404 });
    requireHost(state, token);

    state = reduceAction(state, action, body);
    const saved = await saveGame(state);
    return NextResponse.json({ state: publicState(saved) });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 403 });
  }
}

function reduceAction(state: GameState, action: string, body: Record<string, unknown>): GameState {
  if (action === "resetGame") {
    const reset = createInitialGame(state.roomId);
    return { ...reset, hostToken: state.hostToken };
  }
  if (action === "startPart1") return setRound(state, "part1");
  if (action === "startPart2") return setRound(state, "part2");
  if (action === "startFinal") return setRound(state, "final");
  if (action === "endGame") return setRound(calculateWinner(state), "ended");
  if (action === "setRound") return setRound(state, body.round as Round);
  if (action === "nextTeam") return moveTeam(state, 1);
  if (action === "previousTeam") return moveTeam(state, -1);
  if (action === "selectQuestion") return touch({ ...state, selectedQuestionId: String(body.questionId), gameMessage: undefined });
  if (action === "openQuestion") {
    const questionId = String(body.questionId ?? state.selectedQuestionId ?? "");
    return touch({ ...state, selectedQuestionId: questionId, openedQuestionId: questionId, revealedAnswer: false, gameMessage: undefined });
  }
  if (action === "revealAnswer") return touch({ ...state, revealedAnswer: true, gameMessage: "정답 공개!" });
  if (action === "closeQuestion") return touch({ ...state, openedQuestionId: undefined, revealedAnswer: false, gameMessage: undefined });
  if (action === "markUsed") {
    const questionId = String(body.questionId ?? state.openedQuestionId ?? state.selectedQuestionId);
    return touch({ ...state, usedQuestionIds: Array.from(new Set([...state.usedQuestionIds, questionId])).filter(Boolean) });
  }
  if (action === "markUnused") {
    const questionId = String(body.questionId ?? state.openedQuestionId ?? state.selectedQuestionId);
    return touch({ ...state, usedQuestionIds: state.usedQuestionIds.filter((id) => id !== questionId) });
  }
  if (action === "updateTeams") {
    const names = body.names as Record<string, string>;
    return touch({
      ...state,
      teams: state.teams.map((team) => ({ ...team, name: names?.[team.id]?.trim() || team.name }))
    });
  }
  if (action === "resetScores") {
    return touch({
      ...state,
      teams: state.teams.map((team) => ({ ...team, score: 0 })),
      scoreHistory: [],
      gameMessage: "전체 점수 리셋"
    });
  }
  if (action === "updateScore") {
    return updateScore(state, String(body.teamId), Number(body.delta || 0), String(body.reason ?? "score"));
  }
  if (action === "editScore") return editScore(state, String(body.teamId), Number(body.score || 0));
  if (action === "undoScore") return undoScore(state);
  if (action === "submitFinalBets") {
    return touch({ ...state, finalBets: body.bets as Record<string, number> });
  }
  if (action === "markFinalResult") {
    return touch({
      ...state,
      finalResults: { ...state.finalResults, [String(body.teamId)]: body.result as "correct" | "wrong" | "pending" }
    });
  }
  if (action === "calculateFinalScores") {
    let next = state;
    for (const team of state.teams) {
      const bet = Number(state.finalBets[team.id] || 0);
      const result = state.finalResults[team.id];
      if (result === "correct") next = updateScore(next, team.id, bet, "final_correct");
      if (result === "wrong") next = updateScore(next, team.id, -bet, "final_wrong");
    }
    return calculateWinner(next);
  }
  if (action === "calculateWinner") return calculateWinner(state);
  if (action === "applyEvent") return applyEvent(state, body);
  return touch(state);
}

function applyEvent(state: GameState, body: Record<string, unknown>) {
  const event = String(body.event ?? "none") as QuestionEvent;
  const teamId = String(body.teamId ?? state.teams[state.currentTeamIndex]?.id);
  const targetTeamId = String(body.targetTeamId ?? "");
  const amount = Number(body.amount || getQuestion(state.openedQuestionId)?.bonusPoints || 0);
  const team = state.teams.find((item) => item.id === teamId);

  if (event === "score_swap" && targetTeamId) {
    const other = state.teams.find((item) => item.id === targetTeamId);
    if (!team || !other) return state;
    return touch({
      ...state,
      teams: state.teams.map((item) => {
        if (item.id === team.id) return { ...item, score: other.score };
        if (item.id === other.id) return { ...item, score: team.score };
        return item;
      }),
      gameMessage: eventMessage(event)
    });
  }

  if (event === "halve_score" && team) return editScore({ ...state, gameMessage: undefined }, teamId, Math.floor(team.score / 2));
  if (event === "reset_score" && team) return editScore({ ...state, gameMessage: undefined }, teamId, 0);
  if (event === "bonus" || event === "laptop_lender_bonus" || event === "performance_bonus") return updateScore(state, teamId, amount || 300, event);
  if (event === "penalty" || event === "mine") return updateScore(state, teamId, -(amount || 300), event);
  if (event === "steal_points") return updateScore(state, teamId, Math.floor((getQuestion(state.openedQuestionId)?.points ?? 0) / 2), event);
  if (event === "double_points") return touch({ ...state, gameMessage: eventMessage(event, team?.name, amount) });
  return touch({ ...state, gameMessage: eventMessage(event, team?.name, amount) });
}
