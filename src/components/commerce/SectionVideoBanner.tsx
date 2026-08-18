import { Link } from 'react-router-dom';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';

/* ==========================================================================
   Bannière vidéo intercalaire, en tête d'un rayon (Bons plans du jour,
   Nouveautés…) — même principe que VideoHero mais en plein milieu de page.

   Sources déposées par l'utilisateur dans public/, recompressées par ffmpeg
   avant intégration (voir les composants appelants pour le détail par
   vidéo). Pleine largeur (`w-screen` recentré). Toutes les sources sont au
   format 16:9 : affichées à leur hauteur naturelle, elles prendraient
   jusqu'à 720 px de haut sur desktop — bien plus qu'une bannière
   intermédiaire ne le justifie. La hauteur est donc plafonnée par palier
   (`h-*`), mais avec `object-contain` : la bande plein écran est bien plus
   large que 16:9, et `object-cover` y zoomerait la vidéo au point de rogner
   le haut et le bas — exactement le texte/les éléments dans le cadre que
   VideoHero prend soin de préserver. `object-contain` garde l'image
   entière, quitte à laisser un filet de fond de part et d'autre plutôt que
   de la dénaturer.
   ========================================================================== */

interface SectionVideoBannerProps {
  to: string;
  ariaLabel: string;
  poster: string;
  webm: string;
  mp4: string;
  fallbackAlt: string;
}

export function SectionVideoBanner({ to, ariaLabel, poster, webm, mp4, fallbackAlt }: SectionVideoBannerProps) {
  const prefersReducedMotion = usePrefersReducedMotion();

  return (
    <Link
      to={to}
      aria-label={ariaLabel}
      className="relative left-1/2 right-1/2 -mx-[50vw] block h-48 w-screen overflow-hidden bg-canvas sm:h-64 md:h-80 lg:h-96"
    >
      {prefersReducedMotion ? (
        <img src={poster} alt={fallbackAlt} width={1920} height={1080} className="block h-full w-full object-contain" />
      ) : (
        <video
          className="block h-full w-full object-contain"
          width={1920}
          height={1080}
          poster={poster}
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          aria-hidden="true"
        >
          <source src={webm} type="video/webm" />
          <source src={mp4} type="video/mp4" />
        </video>
      )}
    </Link>
  );
}
