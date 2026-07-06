"use client";

import { useMemo, useState } from "react";

type CreatedGame = {
  roomId: string;
  hostToken: string;
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
    setCreated({ roomId: data.roomId, hostToken: data.hostToken });
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
      </section>
    </main>
  );
}
