"use client";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { Shield, Play, Heart, Info, RotateCcw } from "lucide-react";
import { useSound } from '../../hooks/useSound';
import { useGlobalScore } from '../../hooks/useGlobalScore';

/* ─── data catalogue ─── */
interface DataItem {
  id: number;
  label: string;
  emoji: string;
  sensitive: boolean;
  x: number;
  y: number;
  speed: number;
}

const SAFE_ITEMS: { emoji: string; label: string }[] = [
  { emoji: "📰", label: "Artikel" },
  { emoji: "😄", label: "Meme" },
  { emoji: "💬", label: "Opini" },
  { emoji: "📊", label: "Data Publik" },
];

const SENSITIVE_ITEMS: { emoji: string; label: string }[] = [
  { emoji: "🔑", label: "Password" },
  { emoji: "💳", label: "PIN ATM" },
  { emoji: "🪪", label: "No. KTP" },
  { emoji: "📱", label: "No. HP" },
];

/* ─── constants ─── */
const GAME_W = 800;
const GAME_H = 500;
const PLAYER_W = 100;
const PLAYER_H = 44;
const ITEM_W = 110;
const ITEM_H = 36;
const BASE_SPEED = 1.6;
const SPAWN_INTERVAL_MS = 1000;
const SPEED_BUMP_EVERY = 50;
const INITIAL_LIVES = 3;

/* ─── component ─── */
export default function PrivacyDefender() {
  const { playSound } = useSound();
  const { addScore } = useGlobalScore();

  /* ── UI state (only things that change the DOM tree) ── */
  const [phase, setPhase] = useState<"menu" | "play" | "over">("menu");
  const [displayScore, setDisplayScore] = useState(0);
  const [displayLives, setDisplayLives] = useState(INITIAL_LIVES);
  const [leakedItems, setLeakedItems] = useState<string[]>([]);

  /* ── refs for the game loop (no re-renders) ── */
  const containerRef = useRef<HTMLDivElement>(null);
  const rafId = useRef(0);
  const spawnTimer = useRef(0);
  const lastTime = useRef(0);
  const nextId = useRef(0);

  const items = useRef<DataItem[]>([]);
  const playerX = useRef((GAME_W - PLAYER_W) / 2);
  const score = useRef(0);
  const lives = useRef(INITIAL_LIVES);
  const leaked = useRef<string[]>([]);
  const running = useRef(false);

  /* keyboard tracking */
  const keysDown = useRef<Set<string>>(new Set());

  /* ── DOM node pools ── */
  const itemEls = useRef<Map<number, HTMLDivElement>>(new Map());
  const playerEl = useRef<HTMLDivElement>(null);
  const scoreEl = useRef<HTMLSpanElement>(null);
  const livesEl = useRef<HTMLDivElement>(null);

  /* ─── helpers ─── */
  const clamp = (v: number, min: number, max: number) =>
    Math.max(min, Math.min(max, v));

  const pick = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

  const currentSpeed = () =>
    BASE_SPEED + Math.floor(score.current / SPEED_BUMP_EVERY) * 0.5;

  /* ─── spawn ─── */
  const spawn = useCallback(() => {
    const isSensitive = Math.random() < 0.4;
    const catalogue = isSensitive ? SENSITIVE_ITEMS : SAFE_ITEMS;
    const proto = pick(catalogue);
    const item: DataItem = {
      id: nextId.current++,
      emoji: proto.emoji,
      label: proto.label,
      sensitive: isSensitive,
      x: Math.random() * (GAME_W - ITEM_W),
      y: -ITEM_H,
      speed: currentSpeed(),
    };
    items.current.push(item);

    /* create DOM node */
    const el = document.createElement("div");
    el.className = "pd-item";
    el.style.cssText = `
      position:absolute;width:${ITEM_W}px;height:${ITEM_H}px;
      left:${item.x}px;top:${item.y}px;
      display:flex;align-items:center;justify-content:center;gap:4px;
      border-radius:8px;font-size:13px;font-weight:600;
      pointer-events:none;user-select:none;
      color:#fff;
      border:2px solid #4b5563;
      background:rgba(255,255,255,0.1);
      box-shadow:0 0 8px rgba(255,255,255,0.05);
      transition:none;
    `;
    el.textContent = `${item.emoji} ${item.label}`;
    containerRef.current?.appendChild(el);
    itemEls.current.set(item.id, el);
  }, []);

  /* ─── collision check ─── */
  const collides = (item: DataItem) => {
    const px = playerX.current;
    const py = GAME_H - PLAYER_H - 8;
    return (
      item.x < px + PLAYER_W &&
      item.x + ITEM_W > px &&
      item.y + ITEM_H > py &&
      item.y < py + PLAYER_H
    );
  };

  /* ─── update HUD (direct DOM, no setState) ─── */
  const syncHud = () => {
    if (scoreEl.current) scoreEl.current.textContent = String(score.current);
    if (livesEl.current) {
      livesEl.current.innerHTML = "";
      for (let i = 0; i < INITIAL_LIVES; i++) {
        const span = document.createElement("span");
        span.textContent = i < lives.current ? "❤️" : "🖤";
        span.style.fontSize = "18px";
        livesEl.current.appendChild(span);
      }
    }
  };

  /* ─── game loop ─── */
  const loop = useCallback(
    (time: number) => {
      if (!running.current) return;

      const dt = lastTime.current ? (time - lastTime.current) / 16 : 1;
      lastTime.current = time;

      /* keyboard movement */
      const KEYBOARD_SPEED = 6;
      if (keysDown.current.has("ArrowLeft")) {
        playerX.current = clamp(
          playerX.current - KEYBOARD_SPEED * dt,
          0,
          GAME_W - PLAYER_W
        );
      }
      if (keysDown.current.has("ArrowRight")) {
        playerX.current = clamp(
          playerX.current + KEYBOARD_SPEED * dt,
          0,
          GAME_W - PLAYER_W
        );
      }

      /* update player DOM */
      if (playerEl.current) {
        playerEl.current.style.left = `${playerX.current}px`;
      }

      /* spawn timer */
      spawnTimer.current += dt * 16;
      if (spawnTimer.current >= SPAWN_INTERVAL_MS) {
        spawnTimer.current -= SPAWN_INTERVAL_MS;
        spawn();
      }

      /* move items & check collisions */
      const surviving: DataItem[] = [];
      for (const item of items.current) {
        item.y += item.speed * dt;

        const el = itemEls.current.get(item.id);
        if (el) el.style.top = `${item.y}px`;

        if (collides(item)) {
          if (item.sensitive) {
            playSound('hit');
            lives.current -= 1;
            leaked.current.push(`${item.emoji} ${item.label}`);
            /* flash player red */
            if (playerEl.current) {
              playerEl.current.style.background =
                "rgba(239,68,68,0.6)";
              setTimeout(() => {
                if (playerEl.current)
                  playerEl.current.style.background =
                    "rgba(59,130,246,0.25)";
              }, 250);
            }
            syncHud();
            if (lives.current <= 0) {
              playSound('gameover');
              running.current = false;
              setDisplayScore(score.current);
              setDisplayLives(0);
              setLeakedItems([...leaked.current]);
              setPhase("over");
              return;
            }
          } else {
            playSound('catch');
            score.current += 10;
            addScore(10);
            syncHud();
          }
          /* remove item */
          el?.remove();
          itemEls.current.delete(item.id);
          continue;
        }

        if (item.y > GAME_H + ITEM_H) {
          el?.remove();
          itemEls.current.delete(item.id);
          continue;
        }

        surviving.push(item);
      }
      items.current = surviving;

      rafId.current = requestAnimationFrame(loop);
    },
    [spawn, playSound]
  );

  /* ─── start / restart ─── */
  const startGame = useCallback(() => {
    playSound('click');
    /* reset state */
    items.current = [];
    playerX.current = (GAME_W - PLAYER_W) / 2;
    score.current = 0;
    lives.current = INITIAL_LIVES;
    leaked.current = [];
    lastTime.current = 0;
    spawnTimer.current = 0;
    nextId.current = 0;

    /* clean leftover DOM nodes */
    itemEls.current.forEach((el) => el.remove());
    itemEls.current.clear();

    setDisplayScore(0);
    setDisplayLives(INITIAL_LIVES);
    setLeakedItems([]);
    setPhase("play");

    /* kick off loop next frame (container mounts first) */
    requestAnimationFrame(() => {
      running.current = true;
      syncHud();
      rafId.current = requestAnimationFrame(loop);
    });
  }, [loop, playSound]);

  /* ─── keyboard listeners ─── */
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
        e.preventDefault();
        keysDown.current.add(e.key);
      }
    };
    const up = (e: KeyboardEvent) => keysDown.current.delete(e.key);
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, []);

  /* cleanup on unmount */
  useEffect(() => {
    return () => {
      running.current = false;
      cancelAnimationFrame(rafId.current);
    };
  }, []);

  /* ─── pointer / touch handlers on the game container ─── */
  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!running.current) return;
      const rect = e.currentTarget.getBoundingClientRect();
      const relX = e.clientX - rect.left;
      playerX.current = clamp(relX - PLAYER_W / 2, 0, GAME_W - PLAYER_W);
    },
    []
  );

  /* ═══════════════════════════════════════════════════════ */
  /*                        RENDER                          */
  /* ═══════════════════════════════════════════════════════ */

  /* ── MENU ── */
  if (phase === "menu") {
    return (
      <div
        className="feature-card"
        style={{
          height: "100%",
          padding: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          backgroundColor: "#111827",
          color: "#fff",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            padding: "var(--spacing-xl)",
            flexGrow: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            maxWidth: GAME_W,
          }}
        >
          {/* icon */}
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: "50%",
              backgroundColor: "rgba(59,130,246,0.2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: "var(--spacing-md)",
              color: "#3b82f6",
            }}
          >
            <Shield size={32} />
          </div>

          <h3
            className="display-sm"
            style={{ marginBottom: "var(--spacing-sm)", color: "#fff" }}
          >
            Privacy Defender
          </h3>

          {/* tujuan badge */}
          <span
            className="badge-pill"
            style={{
              backgroundColor: "rgba(59,130,246,0.2)",
              color: "#60a5fa",
              border: "1px solid rgba(96,165,250,0.3)",
              marginBottom: "var(--spacing-lg)",
              fontSize: 12,
              padding: "4px 12px",
            }}
          >
            🎯 Tujuan: Lindungi data sensitif! Tangkap hanya data publik yang
            aman.
          </span>

          {/* instructions */}
          <div
            style={{
              backgroundColor: "rgba(255,255,255,0.05)",
              padding: "var(--spacing-base)",
              borderRadius: "var(--rounded-md)",
              textAlign: "left",
              marginBottom: "var(--spacing-lg)",
              border: "1px solid rgba(255,255,255,0.1)",
              width: "100%",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 12,
                fontWeight: 600,
              }}
            >
              <Info size={16} /> Instruksi Misi:
            </div>
            <ul
              className="body-sm"
              style={{
                paddingLeft: 20,
                color: "#9ca3af",
                display: "flex",
                flexDirection: "column",
                gap: 8,
              }}
            >
              <li>
                Gerakkan perisai dengan <b>mouse / sentuh</b> atau{" "}
                <b>← → keyboard</b>.
              </li>
              <li>
                <span style={{ color: "#22c55e" }}>🟢 TANGKAP</span> data
                publik (Artikel, Opini, Meme) → +10 poin
              </li>
              <li>
                <span style={{ color: "#ef4444" }}>🔴 HINDARI</span> data
                sensitif (Password, PIN, KTP) → −1 nyawa
              </li>
              <li>Tidak ada petunjuk warna! Baca labelnya baik-baik. Kecepatan naik setiap 50 poin!</li>
            </ul>
          </div>

          <button
            className="button-primary"
            onClick={startGame}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              backgroundColor: "#3b82f6",
              color: "#fff",
              border: "none",
            }}
          >
            <Play size={18} fill="currentColor" /> Mulai Misi
          </button>
        </div>
      </div>
    );
  }

  /* ── PLAY ── */
  if (phase === "play") {
    return (
      <div
        className="feature-card"
        style={{
          height: "100%",
          padding: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          backgroundColor: "#111827",
          color: "#fff",
          overflow: "hidden",
        }}
      >
        {/* HUD bar */}
        <div
          style={{
            width: GAME_W,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "6px 12px",
            backgroundColor: "rgba(0,0,0,0.4)",
            borderBottom: "1px solid rgba(255,255,255,0.08)",
            fontSize: 14,
            fontWeight: 600,
            userSelect: "none",
          }}
        >
          <span>
            🏆 <span ref={scoreEl}>0</span>
          </span>
          <div ref={livesEl} style={{ display: "flex", gap: 2 }}>
            {Array.from({ length: INITIAL_LIVES }).map((_, i) => (
              <span key={i} style={{ fontSize: 18 }}>
                ❤️
              </span>
            ))}
          </div>
        </div>

        {/* Legend bar */}
        <div
          style={{
            width: GAME_W,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 16,
            padding: "4px 8px",
            backgroundColor: "rgba(0,0,0,0.25)",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
            fontSize: 11,
            color: "#9ca3af",
            userSelect: "none",
          }}
        >
          <span><span style={{ color: '#22c55e', fontWeight: 'bold' }}>TANGKAP:</span> Artikel, Meme, Opini, Data Publik</span>
          <span style={{ color: 'rgba(255,255,255,0.2)' }}>|</span>
          <span><span style={{ color: '#ef4444', fontWeight: 'bold' }}>HINDARI:</span> Password, PIN ATM, No KTP, No HP</span>
        </div>

        {/* Game area */}
        <div
          ref={containerRef}
          onPointerMove={handlePointerMove}
          style={{
            position: "relative",
            width: GAME_W,
            height: GAME_H,
            backgroundColor: "#111827",
            overflow: "hidden",
            touchAction: "none",
            cursor: "none",
          }}
        >
          {/* player shield */}
          <div
            ref={playerEl}
            style={{
              position: "absolute",
              bottom: 8,
              left: (GAME_W - PLAYER_W) / 2,
              width: PLAYER_W,
              height: PLAYER_H,
              borderRadius: 10,
              background: "rgba(59,130,246,0.25)",
              border: "2px solid #3b82f6",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 4,
              fontSize: 14,
              fontWeight: 700,
              color: "#93c5fd",
              userSelect: "none",
              pointerEvents: "none",
              boxShadow: "0 0 14px rgba(59,130,246,0.35)",
              transition: "background 0.15s",
            }}
          >
            🛡️ PERISAI
          </div>

          {/* grid lines for arcade feel */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              backgroundImage:
                "linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)",
              backgroundSize: "40px 40px",
              pointerEvents: "none",
            }}
          />
        </div>
      </div>
    );
  }

  /* ── GAME OVER ── */
  return (
    <div
      className="feature-card"
      style={{
        height: "100%",
        padding: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        backgroundColor: "#111827",
        color: "#fff",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "var(--spacing-xl)",
          textAlign: "center",
          width: "100%",
          maxWidth: GAME_W,
        }}
      >
        <div style={{ fontSize: 48, marginBottom: "var(--spacing-md)" }}>
          🚨
        </div>
        <h3
          className="display-sm"
          style={{ color: "#ef4444", marginBottom: 4 }}
        >
          Data Sensitif Bocor!
        </h3>
        <p
          className="body-md"
          style={{ color: "#9ca3af", marginBottom: "var(--spacing-lg)" }}
        >
          Sistem terkompromi — 0 nyawa tersisa.
        </p>

        {/* score */}
        <div
          style={{
            fontSize: 40,
            fontWeight: 800,
            color: "#10b981",
            marginBottom: "var(--spacing-md)",
          }}
        >
          {displayScore}{" "}
          <span style={{ fontSize: 18, fontWeight: 400 }}>PTS</span>
        </div>

        {/* leaked list */}
        {leakedItems.length > 0 && (
          <div
            style={{
              backgroundColor: "rgba(239,68,68,0.1)",
              border: "1px solid rgba(239,68,68,0.25)",
              borderRadius: "var(--rounded-md)",
              padding: "var(--spacing-base)",
              marginBottom: "var(--spacing-lg)",
              width: "100%",
              textAlign: "left",
            }}
          >
            <p
              className="body-strong"
              style={{ color: "#f87171", marginBottom: 8 }}
            >
              Data yang bocor:
            </p>
            <ul
              className="body-sm"
              style={{
                paddingLeft: 20,
                color: "#fca5a5",
                display: "flex",
                flexDirection: "column",
                gap: 4,
              }}
            >
              {leakedItems.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          </div>
        )}

        <button
          className="button-primary"
          onClick={startGame}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            backgroundColor: "#3b82f6",
            border: "none",
            color: "#fff",
          }}
        >
          <RotateCcw size={16} /> Main Lagi
        </button>
      </div>
    </div>
  );
}
