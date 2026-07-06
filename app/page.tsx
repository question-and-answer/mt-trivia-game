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
    const laptop = `${origin}/laptop/${created.roomId}?token=${created.hostToken}`;
    return { display, host, laptop };
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
              <a href={links.laptop} target="_blank">Laptop Only 열기</a>
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

  async function chooseImage(file?: File) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setMessage("이미지 파일만 선택할 수 있습니다.");
      return;
    }
    setMessage("이미지 준비 중...");
    const image = await resizeImage(file, 1600, 0.86);
    setDraft({ ...draft, image });
    setMessage("이미지 선택 완료. 저장을 눌러 모든 방에 적용하세요.");
  }

  return (
    <section className="home-editor">
      <h2>문제 빠른 수정</h2>
      <p>저장하면 모든 방의 문제 은행에 적용됩니다. 사진은 파일 선택으로 넣거나 `/images/파일명.jpg` 경로를 직접 적을 수 있습니다.</p>
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
              장치에서 사진 선택
              <input type="file" accept="image/*" onChange={(event) => chooseImage(event.target.files?.[0])} />
            </label>
            {String(draft.image ?? selected.image ?? "").startsWith("data:image/") && (
              <img className="editor-preview" src={String(draft.image ?? selected.image)} alt="선택한 문제 사진 미리보기" />
            )}
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

function resizeImage(file: File, maxSize: number, quality: number) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("이미지를 읽을 수 없습니다."));
    reader.onload = () => {
      const image = new Image();
      image.onerror = () => reject(new Error("이미지를 불러올 수 없습니다."));
      image.onload = () => {
        const scale = Math.min(1, maxSize / Math.max(image.width, image.height));
        const width = Math.max(1, Math.round(image.width * scale));
        const height = Math.max(1, Math.round(image.height * scale));
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const context = canvas.getContext("2d");
        if (!context) {
          reject(new Error("이미지를 처리할 수 없습니다."));
          return;
        }
        context.drawImage(image, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      image.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  });
}
