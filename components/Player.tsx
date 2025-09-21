'use client';
import { useEffect, useRef, useState } from 'react';

export default function Player({ src, duration, meditationId }:{
  src:string, duration:number, meditationId:string
}){
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing,setPlaying] = useState(false);
  const [progress,setProgress] = useState(0);
  const [current,setCurrent] = useState(0);

  useEffect(()=>{
    const a = audioRef.current;
    if(!a) return;
    const onTime = () => {
      setCurrent(a.currentTime);
      setProgress((a.currentTime / a.duration) * 100);
    };
    a.addEventListener('timeupdate', onTime);
    return () => a.removeEventListener('timeupdate', onTime);
  },[]);

  return (
    <div className="player">
      <audio ref={audioRef} src={src} preload="metadata"/>
      <div className="row">
        <button
          className="play"
          onClick={()=>{
            const a = audioRef.current!;
            if(playing){ a.pause(), setPlaying(false) }
            else{ a.play(), setPlaying(true) }
          }}
          aria-label={playing ? 'Pauzeer' : 'Speel af'}
        >
          {playing ? '❚❚' : '▶'}
        </button>

        <div className="bar" onClick={(e)=>{
          const rect = (e.target as HTMLDivElement).getBoundingClientRect();
          const pct = Math.min(1, Math.max(0, (e.clientX - rect.left)/rect.width));
          const a = audioRef.current!;
          a.currentTime = a.duration * pct;
          setProgress(pct*100);
        }}>
          <i style={{ width: `${progress}%` }} />
        </div>

        <div className="times">
          {format(current)} / {format(duration)}
        </div>
      </div>
    </div>
  );
}

function format(s:number){
  const m = Math.floor(s/60).toString().padStart(2,'0');
  const ss = Math.floor(s%60).toString().padStart(2,'0');
  return `${m}:${ss}`;
}
