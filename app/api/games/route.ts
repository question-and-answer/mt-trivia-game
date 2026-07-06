import { NextResponse } from "next/server";
import { createInitialGame, publicState } from "@/lib/game";
import { saveGame } from "@/lib/storage";

export async function POST() {
  const game = await saveGame(createInitialGame());
  return NextResponse.json({
    roomId: game.roomId,
    hostToken: game.hostToken,
    state: publicState(game)
  });
}
