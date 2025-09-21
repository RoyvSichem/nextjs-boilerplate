'use client';
import { useRef, useState, useEffect } from 'react';

export default function Player({
  src,
  duration,
  meditationId
}: {
  src: string;
  duration?: number;
  meditationId: number;
}) {
  const a = useRef<HTMLAudioElement>(null);
  const [t, setT] = useState(0);
  const [rate, setRate] = useState(1);
  const fmt = (s: number) =>
    `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(Math.floor(s % 60)).padStart(2, '0')}`;

  useEffect(() => {
    const el = a.current;
    if (!el) return;
    const onTime = () => setT(el.currentTime);
    const onEnd = async () => {
      try {
        await fetch('/api/session/complete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            meditation_id: meditationId,
            seconds: Math.floor(el.currentTime),
            completed: true
          })
        });
      } catch {}
    };
    el.addEventListener('timeupdate', onTime);
    el.addEventListener('ended', onEnd);
    return () => {
      el.removeEventListener('timeupdate', onTime);
      el.removeEventListener('ended', onEnd);
    };
  }, [meditationId]);

  const seek = (d: number) => {
    const el = a.current;
    if (!el) return;
    el.currentTime = Math.max(0, Math.min(el.duration || duration || 0, el.currentTime + d));
  };

  return (
    <div>
      <audio ref={a} src={src} preload="metadata" />
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '12px 0' }}>
        <span>{fmt(t)}</span>
        <input
          type="range"
          min={0}
          max={duration || 0}
          value={t}
          onChange={(e) => {
            const el = a.current;
            if (el) el.currentTime = Number(e.target.value);
          }}
          style={{ flex: 1 }}
        />
        <span>{fmt(duration || 0)}</span>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', gap: 8 }}>
        <button onClick={() => seek(-30)} className="btn">⏪ 30</button>
        <button onClick={() => { const el = a.current; if (el) el.paused ? el.play() : el.pause(); }} className="btn">▶︎⏸</button>
        <button onClick={() => seek(30)} className="btn">30 ⏩</button>
        <button onClick={() => { const el = a.current; if (!el) return; const r = rate === 2 ? 0.75 : Number((rate + 0.25).toFixed(2)); el.playbackRate = r; setRate(r); }} className="btn">{rate}×</button>
      </div>
      <style jsx>{`.btn{background:#1E4E3A;color:#fff;border:0;border-radius:999px;padding:12px 18px;font-weight:700}`}</style>
    </div>
  );
}
