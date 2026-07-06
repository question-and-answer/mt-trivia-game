import { NextResponse } from "next/server";
import { createInitialGame, publicState } from "@/lib/game";
import { getQuestionBank, saveGame } from "@/lib/storage";

export async function POST() {
  try {
    const game = await saveGame({ ...createInitialGame(), questions: await getQuestionBank() });
    return NextResponse.json({
      roomId: game.roomId,
      hostToken: game.hostToken,
      state: publicState(game)
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create game" },
      { status: 500 }
    );
  }
}
