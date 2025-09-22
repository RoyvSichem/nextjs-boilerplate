// components/FavButton.tsx  (Server Component)
import { toggleFavoriteAction } from '@/lib/actions';

export default function FavButton({
  meditationId,
  isFav,
  path,
}: {
  meditationId: number;
  isFav: boolean;
  path: string;
}) {
  // Server Action binden zodat de juiste params meegaan
  const action = toggleFavoriteAction.bind(null, meditationId, path);

  return (
    <form action={action}>
      <button
        aria-label={isFav ? 'Verwijder uit favorieten' : 'Voeg toe aan favorieten'}
        title={isFav ? 'Verwijder uit favorieten' : 'Voeg toe aan favorieten'}
        className="btn ghost"
        style={{ minWidth: 44 }}
      >
        {isFav ? '❤️' : '♡'}
      </button>
    </form>
  );
}
