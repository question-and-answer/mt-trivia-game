"use client";

import { useMemo, useState } from "react";
import { categories } from "@/lib/questions";
import type { PublicGameState, Question } from "@/lib/types";

type CreatedGame = {
  roomId: string;
  hostToken: string;
  state: PublicGameState;
};

export default function HomePage() {
  const [roomCode, setRoomCode] = useState("");
  const [created, setCreated] = useState<CreatedGame | null>(null);
  const [busy, setBusy] = useState(false);
  const origin = typeof window !== "undefined" ? window.location.origin : "";

  const links = useMemo(() => {
    if (!created) return null;
    const display = `${origin}/display/${created.roomId}`;
    const host = `${origin}/host/${created.roomId}?token=${created.hostToken}`;
    return { display, host };
  }, [created, origin]);

  async function createGame() {
    setBusy(true);
    const response = await fetch("/api/games", { method: "POST" });
    const data = await response.json();
    setCreated({ roomId: data.roomId, hostToken: data.hostToken, state: data.state });
    setBusy(false);
  }

  function joinGame(kind: "display" | "host") {
    const code = roomCode.trim().toUpperCase();
    if (!code) return;
    window.location.href = kind === "display" ? `/display/${code}` : `/host/${code}`;
  }

  return (
    <main className="home-shell">
      <section className="home-panel">
        <p className="eyebrow">LIVE MT GAME SHOW</p>
        <h1>MT 잡학지식: 이걸 왜 알아?</h1>
        <p className="home-copy">프로젝터에는 깨끗한 퀴즈 화면만, 휴대폰에는 강력한 진행 리모컨만.</p>
        <div className="home-actions">
          <button className="primary-action" onClick={createGame} disabled={busy}>
            {busy ? "생성 중..." : "새 게임 만들기"}
          </button>
        </div>

        <div className="join-box">
          <label htmlFor="room">기존 게임 참가</label>
          <div className="join-row">
            <input id="room" value={roomCode} onChange={(event) => setRoomCode(event.target.value)} placeholder="ROOM ID" />
            <button onClick={() => joinGame("display")}>Display</button>
            <button onClick={() => joinGame("host")}>Host</button>
          </div>
        </div>

        {created && links && (
          <div className="created-box">
            <div>
              <span>방 코드</span>
              <strong>{created.roomId}</strong>
            </div>
            <div className="link-stack">
              <a href={links.display} target="_blank">Display 열기</a>
              <a href={links.host} target="_blank">Host Controller 열기</a>
            </div>
            <img
              className="qr"
              alt="Host controller QR"
              src={`https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(links.host)}`}
            />
            <p className="small-note">휴대폰 카메라로 QR을 스캔하면 진행자 화면이 열립니다.</p>
          </div>
        )}

        {created && <QuestionQuickEditor created={created} onChange={setCreated} />}
      </section>
    </main>
  );
}

function QuestionQuickEditor({ created, onChange }: { created: CreatedGame; onChange: (game: CreatedGame) => void }) {
  const [selectedId, setSelectedId] = useState(created.state.questions[0]?.id ?? "");
  const selected = created.state.questions.find((question) => question.id === selectedId);
  const [draft, setDraft] = useState<Partial<Question>>(selected ?? {});
  const [message, setMessage] = useState("");

  function selectQuestion(questionId: string) {
    const question = created.state.questions.find((item) => item.id === questionId);
    setSelectedId(questionId);
    setDraft(question ?? {});
    setMessage("");
  }

  async function saveQuestion() {
    if (!selected) return;
    const response = await fetch(`/api/games/${created.roomId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-host-token": created.hostToken },
      body: JSON.stringify({
        action: "updateQuestion",
        questionId: selected.id,
        question: draft
      })
    });
    const data = await response.json();
    if (!response.ok) {
      setMessage(data.error ?? "저장 실패");
      return;
    }
    onChange({ ...created, state: data.state });
    setMessage("저장 완료");
  }

  return (
    <section className="home-editor">
      <h2>문제 빠른 수정</h2>
      <p>이 방에서만 적용됩니다. 사진은 `public/images`에 넣고 `/images/파일명.jpg`로 적으세요.</p>
      <div className="editor-layout">
        <div className="editor-list">
          {categories.map((category) => (
            <div key={category.id}>
              <h3>{category.name}</h3>
              <div className="editor-question-row">
                {created.state.questions
                  .filter((question) => question.categoryId === category.id)
                  .map((question, index) => (
                    <button
                      className={question.id === selectedId ? "selected" : ""}
                      key={question.id}
                      onClick={() => selectQuestion(question.id)}
                    >
                      {index + 1}
                    </button>
                  ))}
              </div>
            </div>
          ))}
        </div>
        {selected && (
          <div className="editor-form">
            <label>
              점수
              <input type="number" step={50} value={Number(draft.points ?? selected.points)} onChange={(event) => setDraft({ ...draft, points: Number(event.target.value) })} />
            </label>
            <label>
              문제
              <textarea value={String(draft.q ?? selected.q)} onChange={(event) => setDraft({ ...draft, q: event.target.value })} />
            </label>
            <label>
              정답
              <textarea value={String(draft.a ?? selected.a)} onChange={(event) => setDraft({ ...draft, a: event.target.value })} />
            </label>
            <label>
              사진 경로
              <input value={String(draft.image ?? selected.image ?? "")} onChange={(event) => setDraft({ ...draft, image: event.target.value })} placeholder="/images/example.jpg" />
            </label>
            <label>
              해설
              <textarea value={String(draft.explanation ?? selected.explanation ?? "")} onChange={(event) => setDraft({ ...draft, explanation: event.target.value })} />
            </label>
            <label>
              호스트 노트
              <textarea value={String(draft.hostNote ?? selected.hostNote ?? "")} onChange={(event) => setDraft({ ...draft, hostNote: event.target.value })} />
            </label>
            <button onClick={saveQuestion}>이 문제 저장</button>
            {message && <p className="small-note">{message}</p>}
          </div>
        )}
      </div>
    </section>
  );
}
