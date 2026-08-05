import { useState } from 'react';
import { motion } from 'framer-motion';
import { Moon, Sun, ShoppingCart, Check, Zap, Star } from 'lucide-react';
import { useTheme } from '../hooks/useTheme';
import { cn } from '../utils/cn';
import { formatPrice, formatPriceCompact, formatRating } from '../utils/format';
import { EASE, DURATION, fadeUp, staggerContainer, VIEWPORT } from '../constants/motion';

/* ==========================================================================
   Page de démonstration du Design System « Carbon & Aurora ».
   Elle ne consomme QUE des tokens : si elle est juste dans les deux thèmes,
   le reste du site le sera aussi.
   ========================================================================== */

/* ── Briques de mise en page de la page elle-même ────────────────────────── */

function Section({
  index,
  title,
  subtitle,
  children,
}: {
  index: string;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <motion.section
      variants={fadeUp}
      initial="hidden"
      whileInView="visible"
      viewport={VIEWPORT}
      className="border-t border-border-subtle py-16 md:py-20"
    >
      <div className="mb-10 flex items-baseline gap-4">
        <span className="font-mono text-caption text-accent-text">{index}</span>
        <div>
          <h2 className="text-h2 text-ink">{title}</h2>
          {subtitle && <p className="mt-2 max-w-2xl text-body text-ink-secondary">{subtitle}</p>}
        </div>
      </div>
      {children}
    </motion.section>
  );
}

function Swatch({
  name,
  varName,
  contrast,
  note,
}: {
  name: string;
  varName: string;
  contrast?: string;
  note?: string;
}) {
  return (
    <div className="group">
      <div
        className="h-20 rounded-md border border-border-subtle transition-transform duration-fast ease-out-expo group-hover:scale-[1.03]"
        style={{ backgroundColor: `rgb(var(--${varName}))` }}
      />
      <p className="mt-3 text-body-s font-medium text-ink">{name}</p>
      <p className="font-mono text-caption text-ink-tertiary">--{varName}</p>
      {contrast && <p className="mt-1 font-mono text-caption text-success">{contrast}</p>}
      {note && <p className="mt-1 text-caption text-ink-tertiary">{note}</p>}
    </div>
  );
}

/* ── Aperçu des boutons : préfiguration du composant <Button> du lot 1 ───── */

const buttonBase =
  'inline-flex items-center justify-center gap-2 rounded-md px-5 py-3 text-body-s font-semibold ' +
  'transition-all duration-fast ease-out-expo active:scale-[0.97] disabled:pointer-events-none disabled:opacity-40';

const buttonVariants = {
  primary: 'bg-accent-solid text-accent-fg hover:bg-accent-solid-hover hover:shadow-glow',
  secondary: 'bg-elevated text-ink border border-border hover:border-border-strong hover:bg-elevated-hover',
  ghost: 'text-ink-secondary hover:bg-elevated hover:text-ink',
  promo: 'bg-promo text-promo-fg hover:brightness-110 hover:shadow-glow-promo',
  aurora:
    'relative text-ink border-aurora hover:shadow-glow before:absolute before:inset-0 before:rounded-md ' +
    'before:bg-aurora-soft before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-base',
} as const;

/* ── Démonstration des courbes d'accélération ────────────────────────────── */

function EasingDemo() {
  const [playKey, setPlayKey] = useState(0);
  const curves = [
    { name: 'out-expo', ease: EASE.outExpo, usage: 'Courbe signature — reveals, panneaux, transitions de page' },
    { name: 'spring', ease: EASE.spring, usage: 'Micro-interactions — hover, ajout au panier, boutons magnétiques' },
    { name: 'in-out', ease: EASE.inOut, usage: 'Boucles lentes — dérive Aurora, marquee' },
  ];

  return (
    <div>
      <button
        onClick={() => setPlayKey((k) => k + 1)}
        className={cn(buttonBase, buttonVariants.secondary, 'mb-8')}
      >
        <Zap className="h-4 w-4" aria-hidden="true" />
        Rejouer les courbes
      </button>

      <div className="space-y-6">
        {curves.map((curve) => (
          <div key={curve.name}>
            <div className="mb-2 flex flex-wrap items-baseline gap-x-3">
              <span className="font-mono text-body-s text-accent-text">{curve.name}</span>
              <span className="text-caption text-ink-tertiary">{curve.usage}</span>
            </div>
            <div className="relative h-10 overflow-hidden rounded-sm bg-sunken">
              <motion.div
                key={`${curve.name}-${playKey}`}
                initial={{ x: '0%' }}
                animate={{ x: 'calc(100% - 2.5rem)' }}
                transition={{ duration: DURATION.cinematic, ease: curve.ease }}
                className="absolute top-1 h-8 w-8 rounded-sm bg-aurora"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Aperçu commerce : la carte produit telle qu'elle existera au lot 2 ──── */

function ProductPreview() {
  const [added, setAdded] = useState(false);

  return (
    <div className="group max-w-xs overflow-hidden rounded-lg border border-border bg-elevated shadow-1 transition-all duration-base ease-out-expo hover:-translate-y-1 hover:border-border-strong hover:shadow-2">
      <div className="relative aspect-square overflow-hidden bg-sunken">
        <div className="glow-aurora absolute inset-0 flex items-center justify-center">
          <span className="font-display text-6xl text-ink-tertiary">F/</span>
        </div>
        <span className="absolute left-3 top-3 rounded-sm bg-promo px-2.5 py-1 text-caption font-bold text-promo-fg">
          −8 %
        </span>
      </div>

      <div className="p-5">
        <p className="text-overline uppercase text-ink-tertiary">Apple</p>
        <h3 className="mt-1 text-h4 text-ink">iPhone 15 Pro</h3>

        <div className="mt-2 flex items-center gap-1.5">
          <Star className="h-3.5 w-3.5 fill-promo text-promo" aria-hidden="true" />
          <span className="tabular text-caption text-ink-secondary">
            {formatRating(4.8)} · 342 avis
          </span>
        </div>

        <div className="mt-4 flex items-baseline gap-2">
          <span className="tabular font-display text-h4 text-ink">{formatPrice(780000)}</span>
          <span className="tabular text-caption text-ink-tertiary line-through">
            {formatPriceCompact(850000)}
          </span>
        </div>

        <button
          onClick={() => {
            setAdded(true);
            window.setTimeout(() => setAdded(false), 1600);
          }}
          className={cn(buttonBase, buttonVariants.primary, 'mt-4 w-full')}
        >
          {added ? (
            <>
              <Check className="h-4 w-4" aria-hidden="true" />
              Ajouté au panier
            </>
          ) : (
            <>
              <ShoppingCart className="h-4 w-4" aria-hidden="true" />
              Ajouter au panier
            </>
          )}
        </button>
      </div>
    </div>
  );
}

/* ── Page ────────────────────────────────────────────────────────────────── */

export default function DesignSystem() {
  const { isDark, toggleTheme } = useTheme();

  const typeScale = [
    { cls: 'text-display-xl font-display', label: 'display-xl', spec: 'clamp(3rem → 6.5rem) · 600 · −0.03em' },
    { cls: 'text-display-l font-display', label: 'display-l', spec: 'clamp(2.25rem → 4rem) · 600' },
    { cls: 'text-h2 font-display', label: 'h2', spec: 'clamp(1.75rem → 2.75rem) · 600' },
    { cls: 'text-h3 font-display', label: 'h3', spec: 'clamp(1.375rem → 1.75rem) · 600' },
    { cls: 'text-body-l', label: 'body-l', spec: '1.125rem · Inter · 1.65' },
    { cls: 'text-body', label: 'body', spec: '1rem · Inter · 1.65' },
    { cls: 'text-caption text-ink-secondary', label: 'caption', spec: '0.8125rem' },
    { cls: 'text-overline uppercase text-ink-tertiary', label: 'overline', spec: '0.75rem · +0.12em' },
  ];

  return (
    <div className="min-h-screen bg-canvas">
      {/* ── En-tête ── */}
      <header className="glass sticky top-0 z-50 border-x-0 border-t-0">
        <div className="container-page flex h-header items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="font-display text-h4 leading-none text-ink">
              F<span className="text-aurora">/</span>
            </span>
            <span className="hidden text-caption text-ink-tertiary sm:block">
              Design System · v0 — Tokens
            </span>
          </div>

          <button
            onClick={toggleTheme}
            aria-label={isDark ? 'Activer le thème clair' : 'Activer le thème sombre'}
            className={cn(buttonBase, buttonVariants.secondary, 'px-4')}
          >
            {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            <span className="hidden sm:inline">{isDark ? 'Thème clair' : 'Thème sombre'}</span>
          </button>
        </div>
      </header>

      <main className="container-page pb-32">
        {/* ── Hero d'identité ── */}
        <motion.div
          variants={staggerContainer(0.08)}
          initial="hidden"
          animate="visible"
          className="relative py-20 md:py-28"
        >
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-20 left-1/4 h-[420px] w-[420px] animate-aurora-drift rounded-full bg-aurora-radial blur-3xl"
          />
          <motion.p variants={fadeUp} className="text-overline uppercase text-accent-text">
            FallTech Store · Identité visuelle
          </motion.p>
          <motion.h1 variants={fadeUp} className="mt-4 text-display-xl text-ink">
            Carbon
            <span className="text-aurora"> &amp; </span>
            Aurora
          </motion.h1>
          <motion.p variants={fadeUp} className="mt-6 max-w-2xl text-body-l text-ink-secondary">
            L'ingénierie visible. Un fond carbone, une seule couleur qui signale l'action, un
            dégradé réservé aux moments forts et un ambre qui ne parle que d'argent. Trois règles,
            zéro bruit.
          </motion.p>
          <motion.p variants={fadeUp} className="mt-8 font-display text-h3 text-ink">
            « La tech, sans le superflu. »
          </motion.p>
        </motion.div>

        {/* ── 01 · Couleurs ── */}
        <Section
          index="01"
          title="Couleurs"
          subtitle="Tous les composants n'utilisent que les tokens sémantiques (canvas, surface, ink, accent…). Les primitives ci-dessous ne servent qu'à les alimenter — c'est ce qui rend le thème clair possible sans toucher à une seule ligne de composant."
        >
          <h3 className="mb-5 text-h4 text-ink">Neutres — Carbon</h3>
          <div className="grid grid-cols-2 gap-5 sm:grid-cols-4 lg:grid-cols-7">
            <Swatch name="950 · Canvas" varName="carbon-950" />
            <Swatch name="900 · Surface" varName="carbon-900" />
            <Swatch name="850 · Élevée" varName="carbon-850" />
            <Swatch name="700 · Bordure" varName="carbon-700" />
            <Swatch name="500 · Tertiaire" varName="carbon-500" />
            <Swatch name="300 · Secondaire" varName="carbon-300" contrast="8,4:1 · AAA" />
            <Swatch name="50 · Primaire" varName="carbon-50" contrast="18,2:1 · AAA" />
          </div>

          <h3 className="mb-5 mt-12 text-h4 text-ink">Accent — Ion</h3>
          <p className="mb-5 max-w-2xl text-body-s text-ink-secondary">
            Trois nuances, trois rôles. C'est ce découpage qui permet de tenir le contraste AA
            partout : le bleu d'identité est trop clair pour porter du texte blanc, on ne l'utilise
            donc jamais comme aplat de bouton.
          </p>
          <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-5">
            <Swatch name="400 · Texte & liens" varName="ion-400" contrast="7,5:1 · AAA" />
            <Swatch name="500 · Identité" varName="ion-500" note="Halos, bordures, focus" />
            <Swatch name="600 · Aplat bouton" varName="ion-600" contrast="5,2:1 · AA" />
            <Swatch name="700 · Pressé / clair" varName="ion-700" />
            <Swatch name="300 · Survol" varName="ion-300" />
          </div>

          <h3 className="mb-5 mt-12 text-h4 text-ink">Commerce — Amber</h3>
          <p className="mb-5 max-w-2xl text-body-s text-ink-secondary">
            Usage strictement réservé aux promotions, prix barrés, stock faible et urgence. C'est
            cette discipline qui apprend à l'œil que <strong className="text-ink">bleu = action</strong>{' '}
            et <strong className="text-ink">ambre = affaire</strong>.
          </p>
          <div className="grid grid-cols-2 gap-5 sm:grid-cols-4">
            <Swatch name="400" varName="amber-400" />
            <Swatch name="500 · Promo" varName="amber-500" contrast="10,9:1 · AAA" />
            <Swatch name="600 · Promo clair" varName="amber-600" />
          </div>

          <h3 className="mb-5 mt-12 text-h4 text-ink">Dégradé signature — Aurora</h3>
          <div className="h-28 rounded-lg bg-aurora" />
          <p className="mt-3 font-mono text-caption text-ink-tertiary">
            linear-gradient(115deg, #6D5DFC → #4F7DFF 38% → #00C2FF 70% → #12E1B0)
          </p>
          <p className="mt-2 max-w-2xl text-body-s text-ink-secondary">
            Décoratif uniquement : halos produit, bordures, remplissage de texte. Il ne porte jamais
            de contenu lisible, car son contraste varie sur toute sa longueur.
          </p>

          <h3 className="mb-5 mt-12 text-h4 text-ink">Sémantique</h3>
          <div className="grid grid-cols-2 gap-5 sm:grid-cols-4">
            <Swatch name="Succès" varName="success-500" contrast="11,9:1" />
            <Swatch name="Alerte" varName="warning-500" contrast="10,9:1" />
            <Swatch name="Erreur" varName="danger-500" contrast="6,6:1 · AA" />
          </div>
        </Section>

        {/* ── 02 · Typographie ── */}
        <Section
          index="02"
          title="Typographie"
          subtitle="Clash Display pour les titres, Inter Variable pour l'interface, JetBrains Mono pour les caractéristiques techniques. Les trois sont auto-hébergées : aucune requête vers Google Fonts."
        >
          <div className="space-y-8">
            {typeScale.map((item) => (
              <div key={item.label} className="border-b border-border-subtle pb-8 last:border-0">
                <div className="mb-3 flex flex-wrap items-baseline gap-x-4">
                  <span className="font-mono text-caption text-accent-text">{item.label}</span>
                  <span className="font-mono text-caption text-ink-tertiary">{item.spec}</span>
                </div>
                <p className={cn(item.cls, 'text-ink')}>La tech, sans le superflu</p>
              </div>
            ))}
          </div>

          <div className="mt-12 rounded-lg border border-border bg-elevated p-6">
            <p className="text-overline uppercase text-ink-tertiary">Chiffres tabulaires</p>
            <p className="mt-3 max-w-2xl text-body-s text-ink-secondary">
              Tous les prix et quantités utilisent <code className="font-mono text-accent-text">tabular-nums</code>.
              Chaque chiffre occupe la même largeur : le total ne tressaute plus quand on change une
              quantité dans le panier.
            </p>
            <div className="mt-5 grid gap-2 font-mono text-body-l text-ink sm:grid-cols-3">
              <span className="tabular">{formatPrice(780000)}</span>
              <span className="tabular">{formatPrice(1150000)}</span>
              <span className="tabular">{formatPrice(45000)}</span>
            </div>
          </div>
        </Section>

        {/* ── 03 · Rayons & ombres ── */}
        <Section
          index="03"
          title="Rayons & élévation"
          subtitle="Rayons plafonnés à 24 px : au-delà, une interface premium bascule dans l'enfantin. Sur fond sombre, l'ombre n'est pas un gris — c'est une absence de lumière, donc très opaque."
        >
          <div className="grid grid-cols-2 gap-5 sm:grid-cols-4">
            {[
              { r: 'rounded-sm', label: 'sm · 8px', usage: 'Badges, champs' },
              { r: 'rounded-md', label: 'md · 12px', usage: 'Boutons, inputs' },
              { r: 'rounded-lg', label: 'lg · 16px', usage: 'Cartes produit' },
              { r: 'rounded-xl', label: 'xl · 24px', usage: 'Modales, drawers' },
            ].map((item) => (
              <div key={item.label}>
                <div className={cn('h-24 border border-border bg-elevated', item.r)} />
                <p className="mt-3 font-mono text-caption text-ink">{item.label}</p>
                <p className="text-caption text-ink-tertiary">{item.usage}</p>
              </div>
            ))}
          </div>

          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { s: 'shadow-1', label: 'elev-1', usage: 'Carte au repos' },
              { s: 'shadow-2', label: 'elev-2', usage: 'Carte survolée' },
              { s: 'shadow-3', label: 'elev-3', usage: 'Modale, drawer' },
              { s: 'shadow-glow', label: 'glow', usage: 'Action primaire, focus' },
            ].map((item) => (
              <div key={item.label}>
                <div className={cn('flex h-24 items-center justify-center rounded-lg bg-elevated', item.s)}>
                  <span className="font-mono text-caption text-ink-tertiary">{item.label}</span>
                </div>
                <p className="mt-3 text-caption text-ink-tertiary">{item.usage}</p>
              </div>
            ))}
          </div>
        </Section>

        {/* ── 04 · Mouvement ── */}
        <Section
          index="04"
          title="Mouvement"
          subtitle="Trois courbes seulement, cinq durées. Les mêmes valeurs existent en CSS et en JavaScript, donc une transition Tailwind et une animation Framer Motion ne peuvent pas diverger. Tout est désactivé si le système demande la réduction du mouvement."
        >
          <EasingDemo />

          <div className="mt-12 grid gap-3 sm:grid-cols-5">
            {[
              ['instant', '120 ms', 'Retour tactile'],
              ['fast', '200 ms', 'Survol, focus'],
              ['base', '320 ms', 'Transition de page'],
              ['slow', '560 ms', 'Apparition au scroll'],
              ['cinematic', '900 ms', 'Hero, loader'],
            ].map(([name, ms, usage]) => (
              <div key={name} className="rounded-md border border-border bg-elevated p-4">
                <p className="font-mono text-caption text-accent-text">{name}</p>
                <p className="tabular mt-1 font-display text-h4 text-ink">{ms}</p>
                <p className="mt-1 text-caption text-ink-tertiary">{usage}</p>
              </div>
            ))}
          </div>
        </Section>

        {/* ── 05 · Aperçu ── */}
        <Section
          index="05"
          title="Premier aperçu"
          subtitle="Les tokens appliqués : boutons, badge promotionnel, prix en francs CFA et carte produit. Ces éléments deviendront de vrais composants réutilisables au lot 1."
        >
          <h3 className="mb-5 text-h4 text-ink">Boutons</h3>
          <div className="flex flex-wrap gap-4">
            <button className={cn(buttonBase, buttonVariants.primary)}>Acheter maintenant</button>
            <button className={cn(buttonBase, buttonVariants.secondary)}>Découvrir</button>
            <button className={cn(buttonBase, buttonVariants.ghost)}>Continuer mes achats</button>
            <button className={cn(buttonBase, buttonVariants.promo)}>
              <Zap className="h-4 w-4" aria-hidden="true" />
              Voir les promos
            </button>
            <button className={cn(buttonBase, buttonVariants.aurora)}>
              <span className="relative">Offre limitée</span>
            </button>
            <button className={cn(buttonBase, buttonVariants.primary)} disabled>
              Rupture de stock
            </button>
          </div>

          <h3 className="mb-5 mt-12 text-h4 text-ink">Carte produit</h3>
          <ProductPreview />
        </Section>

        {/* ── Pied de page ── */}
        <div className="border-t border-border-subtle pt-10 text-caption text-ink-tertiary">
          <p>
            Design System v0 — tokens, typographie, mouvement. Prochaine étape : les 28 primitives
            d'interface et les composants d'animation (lot 1).
          </p>
        </div>
      </main>
    </div>
  );
}
