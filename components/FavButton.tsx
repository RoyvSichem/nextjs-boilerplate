// components/FavButton.tsx (Server Component)
import { toggleFavoriteAction } from '@/lib/actions';

export default function FavButton({
  meditationId,
  isFav,
  path
}: { meditationId:number; isFav:boolean; path:string }) {
  // Server Action direct als form action
  return (
    <form action={async () => { "use server"; await toggleFavoriteAction(meditationId, path); }}>
      <button
        aria-pressed={isFav}
        title={isFav ? 'Verwijder uit favorieten' : 'Voeg toe aan favorieten'}
        className={`heart ${isFav ? 'on' : ''}`}
        style={{
          width:40,height:40,borderRadius:999,border:'1px solid #e5e7eb',
          background:'#fff', cursor:'pointer'
        }}
      >
        <span style={{fontSize:18, lineHeight:'40px'}}>
          {isFav ? '♥' : '♡'}
        </span>
      </button>
      <style jsx>{`
        .heart.on { border-color: var(--brand); color: var(--brand); }
        .heart:hover { box-shadow: var(--shadow); }
      `}</style>
    </form>
  );
}
