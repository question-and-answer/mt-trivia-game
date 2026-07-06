"use client";

import { useEffect, useMemo, useState } from "react";
import { categories, getCategoryName } from "@/lib/questions";
import type { PublicGameState } from "@/lib/types";

export default function LaptopClient({ roomId, initialToken }: { roomId: string; initialToken: string }) {
  const [token, setToken] = useState(initialToken);
  const [state, setState] = useState<PublicGameState | null>(null);
  const [error, setError] = useState("");
  const [controlsOpen, setControlsOpen] = useState(true);
  const [selectedTeamId, setSelectedTeamId] = useState("");
  const [customPoints, setCustomPoints] = useState(100);

  useEffect(() => {
    if (initialToken) window.localStorage.setItem(`host-token-${roomId}`, initialToken);
    if (!initialToken) setToken(window.localStorage.getItem(`host-token-${roomId}`) ?? "");
  }, [initialToken, roomId]);

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const response = await fetch(`/api/games/${roomId}`, { cache: "no-store" });
        const data = await response.json().catch(() => ({}));
        if (!active) return;
        if (response.ok) {
          setState(data.state);
          setError("");
          setSelectedTeamId((current) => current || data.state.teams[0]?.id || "");
        } else {
          setError(data.error ?? `HTTP ${response.status}`);
        }
      } catch {
        if (active) setError("네트워크 연결 실패");
      }
    }
    load();
    const timer = window.setInterval(load, 1000);
    return () => {
      active = false;
      window.clearInterval(timer);
    };
  }, [roomId]);

  async function act(action: string, body: Record<string, unknown> = {}) {
    const dangerous = ["resetScores", "resetGame", "endGame", "calculateFinalScores"];
    if (dangerous.includes(action) && !window.confirm("정말 실행할까요?")) return;
    const response = await fetch(`/api/games/${roomId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-host-token": token },
      body: JSON.stringify({ action, ...body })
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      window.alert(data.error ?? "Host token을 확인하세요.");
      return;
    }
    setState(data.state);
  }

  const opened = state?.questions.find((question) => question.id === state.openedQuestionId);
  const currentTeam = state?.teams[state.currentTeamIndex];
  const winner = state?.teams.find((team) => team.id === state.winnerTeamId);
  const selectedTeam = state?.teams.find((team) => team.id === selectedTeamId) ?? currentTeam;
  const board = useMemo(() => categories.map((category) => ({
    category,
    items: (state?.questions ?? []).filter((question) => question.categoryId === category.id)
  })), [state?.questions]);

  if (!state) {
    return (
      <main className="laptop-mode">
        <div className="display-loading">{error ? `게임을 불러올 수 없습니다: ${error}` : "게임 불러오는 중"}</div>
      </main>
    );
  }

  return (
    <main className={`laptop-mode ${controlsOpen ? "with-controls" : ""}`}>
      <section className="laptop-stage">
        <header className="display-header">
          <div>
            <p>{roundLabel(state.currentRound)}</p>
            <h1>MT 잡학지식: 이걸 왜 알아?</h1>
          </div>
          <div className="current-team">현재 {currentTeam?.name}</div>
        </header>

        {state.gameMessage && <div className="event-banner">{state.gameMessage}</div>}

        {winner ? (
          <section className="laptop-winner">
            <p className="display-kicker">WINNER</p>
            <h2>{winner.name}</h2>
            <strong>{winner.score}점</strong>
          </section>
        ) : opened ? (
          <section className="question-card laptop-question-card">
            <p className="laptop-question-meta">{getCategoryName(opened.categoryId)} · {opened.points || "FINAL"}점</p>
            <h2>{opened.q}</h2>
            {opened.image && <LaptopImage src={opened.image} />}
            {opened.options && <div className="display-options">{opened.options.map((option) => <span key={option}>{option}</span>)}</div>}
            {state.revealedAnswer && (
              <div className="answer-reveal">
                <span>정답</span>
                <strong>{opened.a}</strong>
              </div>
            )}
          </section>
        ) : (
          <section className="board-grid laptop-board">
            {board.map(({ category, items }) => (
              <div className="board-column" key={category.id}>
                <h2>{category.name}</h2>
                {items.map((question, index) => (
                  <button
                    className={`tile laptop-tile ${state.usedQuestionIds.includes(question.id) ? "used" : ""}`}
                    key={question.id}
                    onClick={() => act("openQuestion", { questionId: question.id })}
                  >
                    {index + 1}
                  </button>
                ))}
              </div>
            ))}
          </section>
        )}

        <ScoreStrip state={state} />
      </section>

      <button className="laptop-control-toggle" onClick={() => setControlsOpen(!controlsOpen)}>
        {controlsOpen ? "컨트롤 숨기기" : "컨트롤 열기"}
      </button>

      {controlsOpen && (
        <aside className="laptop-controls">
          <div className="laptop-control-header">
            <strong>노트북 진행 모드</strong>
            <button onClick={() => document.documentElement.requestFullscreen?.()}>전체화면</button>
          </div>

          {!token && (
            <label>
              Host Token
              <input value={token} onChange={(event) => setToken(event.target.value)} />
            </label>
          )}

          <div className="laptop-control-grid">
            <button onClick={() => act("startPart1")}>Part 1</button>
            <button onClick={() => act("startPart2")}>Part 2</button>
            <button onClick={() => act("startFinal")}>Final</button>
            <button className="danger" onClick={() => act("endGame")}>종료</button>
          </div>

          <div className="laptop-control-grid">
            <button onClick={() => act("previousTeam")}>이전 팀</button>
            <button onClick={() => act("nextTeam")}>다음 팀</button>
            <button onClick={() => act("revealAnswer")}>정답 공개</button>
            <button onClick={() => act("closeQuestion")}>문제 닫기</button>
            <button onClick={() => act("markUsed", { questionId: opened?.id ?? state.selectedQuestionId })}>사용 처리</button>
            <button onClick={() => act("markUnused", { questionId: opened?.id ?? state.selectedQuestionId })}>미사용</button>
          </div>

          <div className="laptop-score-tools">
            <select value={selectedTeam?.id ?? ""} onChange={(event) => setSelectedTeamId(event.target.value)}>
              {state.teams.map((team) => <option key={team.id} value={team.id}>{team.name}</option>)}
            </select>
            <div className="laptop-control-grid">
              <button onClick={() => selectedTeam && act("updateScore", { teamId: selectedTeam.id, delta: opened?.points ?? 100, reason: "laptop_correct" })}>+문제점수</button>
              <button onClick={() => selectedTeam && act("applyEvent", { event: "steal_points", teamId: selectedTeam.id })}>스틸 +절반</button>
              <button onClick={() => selectedTeam && act("updateScore", { teamId: selectedTeam.id, delta: 100, reason: "laptop_quick" })}>+100</button>
              <button onClick={() => selectedTeam && act("updateScore", { teamId: selectedTeam.id, delta: -100, reason: "laptop_quick" })}>-100</button>
            </div>
            <div className="input-row laptop-custom-score">
              <input type="number" value={customPoints} onChange={(event) => setCustomPoints(Number(event.target.value))} />
              <button onClick={() => selectedTeam && act("updateScore", { teamId: selectedTeam.id, delta: customPoints, reason: "laptop_custom" })}>점수 적용</button>
              <button onClick={() => act("undoScore")}>되돌리기</button>
            </div>
          </div>

          <div className="laptop-control-grid">
            <button onClick={() => act("calculateWinner")}>우승 표시</button>
            <button className="danger" onClick={() => act("resetScores")}>점수 리셋</button>
          </div>
        </aside>
      )}
    </main>
  );
}

function LaptopImage({ src }: { src: string }) {
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
