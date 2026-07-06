"use client";

import { useEffect, useMemo, useState } from "react";
import { categories, getCategoryName, getQuestion, questions } from "@/lib/questions";
import type { PublicGameState } from "@/lib/types";

export default function DisplayClient({ roomId }: { roomId: string }) {
  const [state, setState] = useState<PublicGameState | null>(null);

  useEffect(() => {
    let active = true;
    async function load() {
      const response = await fetch(`/api/games/${roomId}`, { cache: "no-store" });
      if (response.ok && active) {
        const data = await response.json();
        setState(data.state);
      }
    }
    load();
    const timer = window.setInterval(load, 1000);
    return () => {
      active = false;
      window.clearInterval(timer);
    };
  }, [roomId]);

  const opened = getQuestion(state?.openedQuestionId);
  const winner = state?.teams.find((team) => team.id === state.winnerTeamId);
  const currentTeam = state?.teams[state.currentTeamIndex];
  const board = useMemo(() => categories.map((category) => ({
    category,
    items: questions.filter((question) => question.categoryId === category.id)
  })), []);

  if (!state) {
    return <main className="display-screen"><div className="display-loading">게임 불러오는 중</div></main>;
  }

  if (state.currentRound === "ended" || winner) {
    return (
      <main className="display-screen winner-screen">
        <p className="display-kicker">WINNER</p>
        <h1>{winner?.name ?? "우승팀"}</h1>
        <div className="winner-score">{winner?.score ?? 0}점</div>
        <ScoreStrip state={state} />
      </main>
    );
  }

  if (opened) {
    return (
      <main className="display-screen question-screen">
        <header className="display-header">
          <div>
            <p>{getCategoryName(opened.categoryId)}</p>
            <h1>{opened.points > 0 ? `${opened.points}점` : "FINAL"}</h1>
          </div>
          <div className="room-badge">{roomId}</div>
        </header>
        {state.gameMessage && <div className="event-banner">{state.gameMessage}</div>}
        <section className="question-card">
          <h2>{opened.q}</h2>
          {opened.image && <ImageBox src={opened.image} />}
          {opened.options && <div className="display-options">{opened.options.map((option) => <span key={option}>{option}</span>)}</div>}
          {state.revealedAnswer && (
            <div className="answer-reveal">
              <span>정답</span>
              <strong>{opened.a}</strong>
            </div>
          )}
        </section>
        <ScoreStrip state={state} />
      </main>
    );
  }

  return (
    <main className="display-screen">
      <header className="display-header">
        <div>
          <p>{roundLabel(state.currentRound)}</p>
          <h1>MT 잡학지식: 이걸 왜 알아?</h1>
        </div>
        <div className="current-team">현재 {currentTeam?.name}</div>
      </header>
      {state.gameMessage && <div className="event-banner">{state.gameMessage}</div>}
      <section className="board-grid">
        {board.map(({ category, items }) => (
          <div className="board-column" key={category.id}>
            <h2>{category.name}</h2>
            {items.map((question) => {
              const used = state.usedQuestionIds.includes(question.id);
              return (
                <div className={`tile ${used ? "used" : ""}`} key={question.id}>
                  {question.points}
                </div>
              );
            })}
          </div>
        ))}
      </section>
      <ScoreStrip state={state} />
    </main>
  );
}

function ImageBox({ src }: { src: string }) {
  const [failed, setFailed] = useState(false);
  if (failed) return <div className="image-placeholder">이미지 준비 중</div>;
  return <img className="question-image" src={src} alt="" onError={() => setFailed(true)} />;
}

function ScoreStrip({ state }: { state: PublicGameState }) {
  return (
    <aside className="score-strip">
      {state.teams.map((team, index) => (
        <div className={index === state.currentTeamIndex ? "active" : ""} key={team.id}>
          <span>{team.name}</span>
          <strong>{team.score}</strong>
        </div>
      ))}
    </aside>
  );
}

function roundLabel(round: PublicGameState["currentRound"]) {
  if (round === "part1") return "PART 1";
  if (round === "part2") return "PART 2";
  if (round === "final") return "FINAL QUESTION";
  if (round === "ended") return "ENDED";
  return "SETUP";
}
