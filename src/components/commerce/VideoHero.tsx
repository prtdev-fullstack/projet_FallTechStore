import { Link } from 'react-router-dom';
import { ROUTES } from '../../constants/routes';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';

/* ==========================================================================
   Bannière vidéo plein écran en tête de l'accueil.

   Source : la vidéo promotionnelle déposée par l'utilisateur dans public/
   (4072×2036, 12,7 Mo, sans son). Recompressée par ffmpeg avant intégration :
   servir 12,7 Mo sur chaque chargement de l'accueil aurait ruiné tout le
   travail de performance fait ailleurs sur le site.

     scripts source → public/video/hero.mp4   (984 Ko, H.264)
                    → public/video/hero.webm  (1,4 Mo, VP9 — servi en priorité,
                      plus léger à qualité égale sur les navigateurs qui le
                      supportent)
                    → public/video/hero-poster.jpg (92 Ko — première image,
                      affichée le temps du chargement et alternative statique)

   Pleine largeur (`w-screen` recentré) même à l'intérieur d'une page dont le
   reste du contenu est contraint par `container-page`. Ratio d'origine 2:1
   conservé tel quel (`w-full h-auto`) plutôt que rogné en `object-cover` :
   la vidéo contient du texte et des éléments jusque dans les coins — un
   recadrage aurait coupé le message sur les écrans étroits.
   ========================================================================== */

export function VideoHero() {
  const prefersReducedMotion = usePrefersReducedMotion();

  return (
    <Link
      to={ROUTES.shop}
      aria-label="Découvrir les promotions FallTech Store"
      className="relative left-1/2 right-1/2 -mx-[50vw] block w-screen overflow-hidden bg-canvas"
    >
      {prefersReducedMotion ? (
        // La vidéo défile et scintille en continu : exactement ce que
        // prefers-reduced-motion demande d'éviter. L'affiche statique porte
        // le même message sans aucun mouvement.
        <img
          src="/video/hero-poster.jpg"
          alt="Vos articles au meilleur prix chez FallTech Store"
          width={1920}
          height={960}
          className="block h-auto w-full"
        />
      ) : (
        <video
          className="block h-auto w-full"
          width={1920}
          height={960}
          poster="/video/hero-poster.jpg"
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          aria-hidden="true"
        >
          <source src="/video/hero.webm" type="video/webm" />
          <source src="/video/hero.mp4" type="video/mp4" />
        </video>
      )}
    </Link>
  );
}
