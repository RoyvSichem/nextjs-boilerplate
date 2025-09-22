'use client';
import { useEffect, useRef, useState } from 'react';

type Props = {
  src: string;
  duration?: number;     // optioneel, lezen we uit metadata als niet meegegeven
  meditationId: number;  // number graag (m.id)
};

export default function Player({ src, duration, meditationId }: Props){
  const audioRef = useRef<HTMLAudioElement>(null);
  const barRef   = useRef<HTMLDivElement>(null);

  const [playing, setPlaying] = useState(false);
  const [dur, setDur]         = useState<number>(duration ?? 0);
  const [current, setCurrent] = useState(0);
  const [progress, setProgress] = useState(0);
  const [halfLogged, setHalfLogged] = useState(false);
  const [scrubbing, setScrubbing] = useState(false);

  // simpele logger, matched met /api/log
  async function log(type: string, details: any){
    try{
      await fetch('/api/log', {
        method: 'POST',
        headers: { 'Content-Type':'application/json' },
        body: JSON.stringify({ type, details })
      });
    }catch{/* stilhouden */}
  }

  // metadata en tijd bijhouden
  useEffect(()=>{
    const a = audioRef.current;
    if(!a) return;

    const onLoaded = () => {
      if (!duration && Number.isFinite(a.duration)) setDur(a.duration);
    };
    const onTime = () => {
      if (scrubbing) return;
      const t = a.currentTime || 0;
      setCurrent(t);
      const d = Number.isFinite(a.duration) ? a.duration : (dur || 0);
      if (d > 0) setProgress((t / d) * 100);

      if (!halfLogged && d > 0 && t / d >= 0.5) {
        setHalfLogged(true);
        log('player.half', { meditationId, t });
      }
    };
    const onEnded = () => {
      setPlaying(false);
      setCurrent(0);
      setProgress(0);
      setHalfLogged(false);
      log('player.end', { meditationId });
    };
    const onPlay = () => { setPlaying(true); log('player.play', { meditationId }); };
    const onPause = () => setPlaying(false);

    a.addEventListener('loadedmetadata', onLoaded);
    a.addEventListener('timeupdate', onTime);
    a.addEventListener('ended', onEnded);
    a.addEventListener('play', onPlay);
    a.addEventListener('pause', onPause);
    return () => {
      a.removeEventListener('loadedmetadata', onLoaded);
      a.removeEventListener('timeupdate', onTime);
      a.removeEventListener('ended', onEnded);
      a.removeEventListener('play', onPlay);
      a.removeEventListener('pause', onPause);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [duration, dur, halfLogged, scrubbing, meditationId]);

  // scrub helpers
  function positionToPct(clientX: number){
    const el = barRef.current;
    const a  = audioRef.current;
    if(!el || !a) return 0;
    const rect = el.getBoundingClientRect();
    const pct = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
    const d = Number.isFinite(a.duration) ? a.duration : (dur || 0);
    if (d > 0) {
      a.currentTime = d * pct;
      setCurrent(a.currentTime);
      setProgress(pct * 100);
    }
    return pct;
  }
  function startScrub(e: React.PointerEvent<HTMLDivElement>){
    (e.currentTarget as HTMLDivElement).setPointerCapture(e.pointerId);
    setScrubbing(true);
    positionToPct(e.clientX);
  }
  function moveScrub(e: React.PointerEvent<HTMLDivElement>){
    if(!scrubbing) return;
    positionToPct(e.clientX);
  }
  function endScrub(e: React.PointerEvent<HTMLDivElement>){
    try{ (e.currentTarget as HTMLDivElement).releasePointerCapture(e.pointerId); }catch{}
    setScrubbing(false);
  }

  async function toggle(){
    const a = audioRef.current;
    if(!a) return;
    if(playing){
      a.pause();
      setPlaying(false);
    }else{
      try{
        await a.play();
        setPlaying(true);
      }catch(err){
        // autoplay-block of fout
        console.warn('play failed', err);
      }
    }
  }

  const shownDuration = dur || duration || 0;

  return (
    <div className="player">
      <audio ref={audioRef} src={src} preload="metadata" />
      <div className="row">
        <button
          className="play"
          onClick={toggle}
          aria-label={playing ? 'Pauzeer' : 'Speel af'}
        >
          {playing ? '❚❚' : '▶'}
        </button>

        <div
          className="bar"
          ref={barRef}
          onPointerDown={startScrub}
          onPointerMove={moveScrub}
          onPointerUp={endScrub}
          onPointerCancel={endScrub}
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(progress)}
          aria-label="Voortgang"
        >
          <i style={{ width: `${progress}%` }} />
        </div>

        <div className="times">
          {format(current)} / {format(shownDuration)}
        </div>
      </div>
    </div>
  );
}

function format(s:number){
  if(!Number.isFinite(s) || s <= 0) return '00:00';
  const m  = Math.floor(s/60).toString().padStart(2,'0');
  const ss = Math.floor(s%60).toString().padStart(2,'0');
  return `${m}:${ss}`;
}
