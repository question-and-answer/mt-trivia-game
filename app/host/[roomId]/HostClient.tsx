"use client";

import { useEffect, useMemo, useState } from "react";
import { categories, finalQuestion, getCategoryName, getQuestion, questions } from "@/lib/questions";
import type { PublicGameState, QuestionEvent } from "@/lib/types";

const dangerous = new Set(["resetGame", "resetScores", "endGame", "calculateFinalScores"]);

export default function HostClient({ roomId, initialToken }: { roomId: string; initialToken: string }) {
  const [token, setToken] = useState(initialToken);
  const [state, setState] = useState<PublicGameState | null>(null);
  const [custom, setCustom] = useState<Record<string, number>>({});
  const [manual, setManual] = useState<Record<string, number>>({});
  const [bets, setBets] = useState<Record<string, number>>({});
  const [eventTeam, setEventTeam] = useState("");
  const [eventTarget, setEventTarget] = useState("");
  const [eventAmount, setEventAmount] = useState(300);

  useEffect(() => {
    if (initialToken) window.localStorage.setItem(`host-token-${roomId}`, initialToken);
    if (!initialToken) setToken(window.localStorage.getItem(`host-token-${roomId}`) ?? "");
  }, [initialToken, roomId]);

  useEffect(() => {
    let active = true;
    async function load() {
      const response = await fetch(`/api/games/${roomId}`, { cache: "no-store" });
      if (response.ok && active) {
        const data = await response.json();
        setState(data.state);
        setBets((current) => Object.keys(current).length ? current : data.state.finalBets);
        setEventTeam((current) => current || data.state.teams[0]?.id || "");
        setEventTarget((current) => current || data.state.teams[1]?.id || "");
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
    if (dangerous.has(action) && !window.confirm("정말 실행할까요?")) return;
    const response = await fetch(`/api/games/${roomId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-host-token": token },
      body: JSON.stringify({ action, ...body })
    });
    const data = await response.json();
    if (!response.ok) {
      window.alert(data.error ?? "실패했습니다. Host token을 확인하세요.");
      return;
    }
    setState(data.state);
  }

  const selected = getQuestion(state?.selectedQuestionId);
  const opened = getQuestion(state?.openedQuestionId);
  const current = opened ?? selected;
  const currentPoints = current?.points ?? 0;
  const currentTeam = state?.teams[state.currentTeamIndex];
  const displayLink = typeof window !== "undefined" ? `${window.location.origin}/display/${roomId}` : "";
  const hostLink = typeof window !== "undefined" ? `${window.location.origin}/host/${roomId}?token=${token}` : "";

  const board = useMemo(() => categories.map((category) => ({
    category,
    items: questions.filter((question) => question.categoryId === category.id)
  })), []);

  if (!state) {
    return <main className="host-shell"><div className="host-card">게임 불러오는 중</div></main>;
  }

  return (
    <main className="host-shell">
      <section className="host-sticky">
        <div>
          <p>{roomId} · {roundLabel(state.currentRound)}</p>
          <strong>{currentTeam?.name ?? "팀 없음"}</strong>
        </div>
        <div className="host-row">
          <button onClick={() => act("previousTeam")}>이전 팀</button>
          <button onClick={() => act("nextTeam")}>다음 팀</button>
        </div>
        {current && (
          <div className="current-question-mini">
            <span>{getCategoryName(current.categoryId)} · {current.points || "FINAL"}점</span>
            <b>{current.q}</b>
          </div>
        )}
      </section>

      {!token && (
        <section className="host-card">
          <h2>Host Token</h2>
          <input value={token} onChange={(event) => setToken(event.target.value)} placeholder="생성 링크의 token" />
        </section>
      )}

      <section className="host-card">
        <h2>게임 상태</h2>
        <div className="button-grid">
          <button onClick={() => act("startPart1")}>Part 1 시작</button>
          <button onClick={() => act("startPart2")}>Part 2 시작</button>
          <button onClick={() => act("startFinal")}>Final 시작</button>
          <button className="danger" onClick={() => act("endGame")}>게임 종료</button>
        </div>
      </section>

      <section className="host-card">
        <h2>문제 선택</h2>
        <div className="host-board">
          {board.map(({ category, items }) => (
            <div key={category.id}>
              <h3>{category.name}</h3>
              <div className="question-buttons">
                {items.map((question) => (
                  <button
                    className={`${state.usedQuestionIds.includes(question.id) ? "used" : ""} ${state.selectedQuestionId === question.id ? "selected" : ""}`}
                    key={question.id}
                    onClick={() => act("selectQuestion", { questionId: question.id })}
                  >
                    {question.points}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="host-card">
        <h2>현재 문제 컨트롤</h2>
        {current ? (
          <div className="question-detail">
            <p><b>문제:</b> {current.q}</p>
            <p><b>정답:</b> {current.a}</p>
            {current.options && <p><b>보기:</b> {current.options.join(" / ")}</p>}
            {current.explanation && <p><b>해설:</b> {current.explanation}</p>}
            {current.hostNote && <p><b>호스트 노트:</b> {current.hostNote}</p>}
            {current.image && <p><b>이미지:</b> {current.image}</p>}
            <p><b>타입/이벤트:</b> {current.type} / {current.event ?? "none"}</p>
          </div>
        ) : <p>보드에서 문제를 선택하세요.</p>}
        <div className="button-grid">
          <button onClick={() => act("openQuestion", { questionId: current?.id })}>문제 열기</button>
          <button onClick={() => act("revealAnswer")}>정답 공개</button>
          <button onClick={() => act("closeQuestion")}>문제 닫기</button>
          <button onClick={() => act("markUsed", { questionId: current?.id })}>사용 처리</button>
          <button onClick={() => act("markUnused", { questionId: current?.id })}>미사용 처리</button>
        </div>
      </section>

      <section className="host-card">
        <h2>점수 컨트롤</h2>
        {state.teams.map((team) => (
          <div className="team-score-card" key={team.id}>
            <div className="team-title"><strong>{team.name}</strong><span>{team.score}점</span></div>
            <div className="score-buttons">
              {[50, 100, currentPoints].filter(Boolean).map((points) => (
                <button key={`p-${points}`} onClick={() => act("updateScore", { teamId: team.id, delta: points, reason: "score_add" })}>+{points}</button>
              ))}
              {[-50, -100, -currentPoints].filter(Boolean).map((points) => (
                <button key={`m-${points}`} onClick={() => act("updateScore", { teamId: team.id, delta: points, reason: "score_subtract" })}>{points}</button>
              ))}
            </div>
            <div className="input-row">
              <input type="number" value={custom[team.id] ?? ""} onChange={(event) => setCustom({ ...custom, [team.id]: Number(event.target.value) })} placeholder="커스텀" />
              <button onClick={() => act("updateScore", { teamId: team.id, delta: custom[team.id] || 0, reason: "custom" })}>적용</button>
              <input type="number" value={manual[team.id] ?? ""} onChange={(event) => setManual({ ...manual, [team.id]: Number(event.target.value) })} placeholder="직접 점수" />
              <button onClick={() => act("editScore", { teamId: team.id, score: manual[team.id] || 0 })}>수정</button>
            </div>
          </div>
        ))}
        <button className="wide" onClick={() => act("undoScore")}>마지막 점수 변경 되돌리기</button>
      </section>

      <section className="host-card">
        <h2>스틸 / 부분점수 / 이벤트</h2>
        <div className="input-row">
          <select value={eventTeam} onChange={(event) => setEventTeam(event.target.value)}>
            {state.teams.map((team) => <option key={team.id} value={team.id}>{team.name}</option>)}
          </select>
          <select value={eventTarget} onChange={(event) => setEventTarget(event.target.value)}>
            {state.teams.map((team) => <option key={team.id} value={team.id}>{team.name}</option>)}
          </select>
          <input type="number" value={eventAmount} onChange={(event) => setEventAmount(Number(event.target.value))} />
        </div>
        <div className="button-grid">
          <button onClick={() => act("applyEvent", { event: "steal_points", teamId: eventTeam })}>스틸 성공 +절반</button>
          <button onClick={() => act("updateScore", { teamId: eventTeam, delta: eventAmount, reason: "partial_credit" })}>부분점수 +</button>
          <button onClick={() => act("applyEvent", { event: "bonus", teamId: eventTeam, amount: eventAmount })}>보너스</button>
          <button onClick={() => act("applyEvent", { event: "penalty", teamId: eventTeam, amount: eventAmount })}>페널티</button>
          <button onClick={() => act("applyEvent", { event: "double_points", teamId: eventTeam })}>더블 포인트</button>
          <button onClick={() => confirmAndEvent("score_swap")}>점수 교환</button>
          <button onClick={() => confirmAndEvent("halve_score")}>점수 절반</button>
          <button onClick={() => confirmAndEvent("reset_score")}>팀 점수 리셋</button>
          <button onClick={() => act("applyEvent", { event: "laptop_lender_bonus", teamId: eventTeam, amount: eventAmount })}>노트북 보너스</button>
          <button onClick={() => act("applyEvent", { event: "performance_bonus", teamId: eventTeam, amount: eventAmount })}>공연 보너스</button>
          <button onClick={() => act("applyEvent", { event: "mine", teamId: eventTeam, amount: eventAmount })}>지뢰</button>
        </div>
      </section>

      <TeamControls state={state} act={act} displayLink={displayLink} hostLink={hostLink} />

      <section className="host-card">
        <h2>Final Question</h2>
        <div className="question-detail">
          <p><b>문제:</b> {finalQuestion.q}</p>
          <p><b>정답:</b> {finalQuestion.a}</p>
        </div>
        {state.teams.map((team) => (
          <div className="final-row" key={team.id}>
            <span>{team.name}</span>
            <input type="number" value={bets[team.id] ?? 0} onChange={(event) => setBets({ ...bets, [team.id]: Number(event.target.value) })} />
            <button onClick={() => act("markFinalResult", { teamId: team.id, result: "correct" })}>정답</button>
            <button onClick={() => act("markFinalResult", { teamId: team.id, result: "wrong" })}>오답</button>
            <b>{state.finalResults[team.id]}</b>
          </div>
        ))}
        <div className="button-grid">
          <button onClick={() => act("submitFinalBets", { bets })}>베팅 저장</button>
          <button onClick={() => act("openQuestion", { questionId: "final-1" })}>최종 문제 공개</button>
          <button onClick={() => act("revealAnswer")}>최종 정답 공개</button>
          <button className="danger" onClick={() => act("calculateFinalScores")}>최종 점수 계산</button>
          <button onClick={() => act("calculateWinner")}>우승팀 표시</button>
        </div>
      </section>
    </main>
  );

  function confirmAndEvent(event: QuestionEvent) {
    if (window.confirm("위험한 이벤트입니다. 진행할까요?")) {
      act("applyEvent", { event, teamId: eventTeam, targetTeamId: eventTarget, amount: eventAmount });
    }
  }
}

function TeamControls({ state, act, displayLink, hostLink }: { state: PublicGameState; act: (action: string, body?: Record<string, unknown>) => void; displayLink: string; hostLink: string }) {
  const [names, setNames] = useState<Record<string, string>>({});

  useEffect(() => {
    setNames(Object.fromEntries(state.teams.map((team) => [team.id, team.name])));
  }, [state.teams]);

  const csv = ["team,score", ...state.teams.map((team) => `${team.name},${team.score}`)].join("\n");

  return (
    <section className="host-card">
      <h2>팀 / 링크 / 내보내기</h2>
      {state.teams.map((team) => (
        <div className="input-row" key={team.id}>
          <input value={names[team.id] ?? team.name} onChange={(event) => setNames({ ...names, [team.id]: event.target.value })} />
          <span>{team.score}점</span>
        </div>
      ))}
      <div className="button-grid">
        <button onClick={() => act("updateTeams", { names })}>팀 이름 저장</button>
        <button className="danger" onClick={() => act("resetScores")}>전체 점수 리셋</button>
        <button className="danger" onClick={() => act("resetGame")}>게임 리셋</button>
        <button onClick={() => navigator.clipboard.writeText(displayLink)}>Display 링크 복사</button>
        <button onClick={() => navigator.clipboard.writeText(hostLink)}>Host 링크 복사</button>
        <button onClick={() => navigator.clipboard.writeText(JSON.stringify(state.teams, null, 2))}>JSON 복사</button>
        <button onClick={() => navigator.clipboard.writeText(csv)}>CSV 복사</button>
      </div>
    </section>
  );
}

function roundLabel(round: PublicGameState["currentRound"]) {
  if (round === "part1") return "Part 1";
  if (round === "part2") return "Part 2";
  if (round === "final") return "Final";
  if (round === "ended") return "Ended";
  return "Setup";
}
