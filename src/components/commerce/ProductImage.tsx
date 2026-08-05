import { useId, useMemo } from 'react';
import type { CategoryId, Product } from '../../types';
import { cn } from '../../utils/cn';

/* ==========================================================================
   Visuel produit.

   La version d'origine chargeait ses images depuis huit domaines tiers
   (gizmobo.com, anpoimages.com, chargeur-induction.fr…). Trois problèmes :
   liens morts à terme, aucune maîtrise du poids et du format, et hotlinking
   non autorisé.

   Ce composant produit à la place un rendu vectoriel cohérent avec l'identité :
   quelques kilo-octets, net à toutes les tailles, aucun risque juridique, et
   surtout un catalogue qui a l'air dessiné par une seule main.

   Si de vraies photos sont déposées dans /public/products/<slug>-<vue>.webp et
   que le produit porte `hasPhotos: true`, elles prennent le dessus
   automatiquement — le reste du site n'a rien à changer.
   ========================================================================== */

interface ProductImageProps {
  product: Product;
  /** Index de vue : 0 face, 1 dos, 2 trois-quarts, 3 détail. */
  view?: number;
  /** Couleur de coque, issue de la variante sélectionnée. */
  color?: string;
  className?: string;
  priority?: boolean;
  /** Halo Aurora derrière l'appareil. Désactivé dans les vignettes. */
  glow?: boolean;
}

type Shape = 'phone' | 'earbuds' | 'headphones' | 'speaker' | 'watch' | 'band' | 'charger' | 'powerbank' | 'case' | 'cable' | 'screen-protector';

/** Silhouette la plus proche du produit réel. */
function shapeFor(product: Product): Shape {
  const { slug, category } = product;
  if (slug.includes('airpods') || slug.includes('buds')) return 'earbuds';
  if (slug.includes('wh-1000') || slug.includes('tune')) return 'headphones';
  if (slug.includes('flip')) return 'speaker';
  if (slug.includes('watch')) return 'watch';
  if (slug.includes('band')) return 'band';
  if (slug.includes('chargeur')) return 'charger';
  if (slug.includes('batterie')) return 'powerbank';
  if (slug.includes('coque')) return 'case';
  if (slug.includes('cable')) return 'cable';
  if (slug.includes('verre')) return 'screen-protector';

  const byCategory: Record<CategoryId, Shape> = {
    smartphones: 'phone',
    audio: 'headphones',
    accessoires: 'charger',
    'objets-connectes': 'watch',
  };
  return byCategory[category];
}

/** Nombre de lentilles au dos, d'après la gamme. */
function lensCount(product: Product): number {
  if (product.price > 900_000) return 3;
  if (product.price > 400_000) return 2;
  return 2;
}

export function ProductImage({
  product,
  view = 0,
  color,
  className,
  priority = false,
  glow = true,
}: ProductImageProps) {
  const uid = useId().replace(/:/g, '');
  const shape = useMemo(() => shapeFor(product), [product]);
  const body = color ?? product.variantGroups[0]?.options[0]?.swatch ?? '#3A4150';

  const alt = `${product.name} — ${['vue de face', 'vue de dos', 'vue de trois quarts', 'détail'][view] ?? 'vue produit'}`;

  if (product.hasPhotos) {
    return (
      <picture className={cn('block', className)}>
        <source srcSet={`/products/${product.slug}-${view + 1}.avif`} type="image/avif" />
        <source srcSet={`/products/${product.slug}-${view + 1}.webp`} type="image/webp" />
        <img
          src={`/products/${product.slug}-${view + 1}.webp`}
          alt={alt}
          width={800}
          height={800}
          loading={priority ? 'eager' : 'lazy'}
          decoding={priority ? 'sync' : 'async'}
          fetchPriority={priority ? 'high' : 'auto'}
          className="h-full w-full object-contain"
        />
      </picture>
    );
  }

  /* Vue 2 : léger basculement pour suggérer le trois-quarts.
     Vue 3 : agrandissement centré sur le module photo. */
  const groupTransform =
    view === 2
      ? 'translate(200 200) rotate(-9) scale(0.92) translate(-200 -200)'
      : view === 3
        ? 'translate(200 200) scale(2.1) translate(-215 -230)'
        : undefined;

  return (
    <svg
      viewBox="0 0 400 400"
      role="img"
      aria-label={alt}
      className={cn('h-full w-full', className)}
      /* Réserve la place avant le rendu : aucun décalage de mise en page. */
      width={400}
      height={400}
    >
      <defs>
        <linearGradient id={`${uid}-body`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={body} stopOpacity="1" />
          <stop offset="55%" stopColor={body} stopOpacity="0.86" />
          <stop offset="100%" stopColor={body} stopOpacity="0.62" />
        </linearGradient>

        <linearGradient id={`${uid}-screen`} x1="0.2" y1="0" x2="0.8" y2="1">
          <stop offset="0%" stopColor="rgb(var(--aurora-violet))" stopOpacity="0.55" />
          <stop offset="45%" stopColor="rgb(var(--aurora-blue))" stopOpacity="0.42" />
          <stop offset="100%" stopColor="rgb(var(--carbon-950))" stopOpacity="0.92" />
        </linearGradient>

        <linearGradient id={`${uid}-sheen`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#fff" stopOpacity="0.22" />
          <stop offset="42%" stopColor="#fff" stopOpacity="0.04" />
          <stop offset="100%" stopColor="#fff" stopOpacity="0" />
        </linearGradient>

        <radialGradient id={`${uid}-glow`} cx="50%" cy="46%" r="52%">
          <stop offset="0%" stopColor="rgb(var(--aurora-blue))" stopOpacity="0.34" />
          <stop offset="52%" stopColor="rgb(var(--aurora-violet))" stopOpacity="0.14" />
          <stop offset="100%" stopColor="rgb(var(--aurora-violet))" stopOpacity="0" />
        </radialGradient>
      </defs>

      {glow && <circle cx="200" cy="188" r="150" fill={`url(#${uid}-glow)`} />}

      <g transform={groupTransform}>
        {shape === 'phone' && (
          <PhoneShape uid={uid} view={view} lenses={lensCount(product)} />
        )}
        {shape === 'earbuds' && <EarbudsShape uid={uid} view={view} />}
        {shape === 'headphones' && <HeadphonesShape uid={uid} />}
        {shape === 'speaker' && <SpeakerShape uid={uid} />}
        {shape === 'watch' && <WatchShape uid={uid} view={view} />}
        {shape === 'band' && <BandShape uid={uid} />}
        {shape === 'charger' && <ChargerShape uid={uid} />}
        {shape === 'powerbank' && <PowerbankShape uid={uid} />}
        {shape === 'case' && <CaseShape uid={uid} />}
        {shape === 'cable' && <CableShape uid={uid} />}
        {shape === 'screen-protector' && <ScreenProtectorShape uid={uid} />}
      </g>

      {/* Ombre portée au sol : ancre l'objet, évite l'effet « autocollant ». */}
      <ellipse cx="200" cy="356" rx="86" ry="9" fill="rgb(var(--carbon-950))" opacity="0.35" />
    </svg>
  );
}

/* ── Silhouettes ───────────────────────────────────────────────────────── */

function PhoneShape({ uid, view, lenses }: { uid: string; view: number; lenses: number }) {
  const showBack = view === 1 || view === 3;

  return (
    <g>
      <rect
        x="130"
        y="52"
        width="140"
        height="286"
        rx="30"
        fill={`url(#${uid}-body)`}
        stroke="rgb(var(--carbon-950))"
        strokeOpacity="0.5"
        strokeWidth="1.5"
      />

      {!showBack ? (
        <>
          <rect x="138" y="60" width="124" height="270" rx="24" fill={`url(#${uid}-screen)`} />
          {/* Dynamic Island */}
          <rect x="180" y="72" width="40" height="12" rx="6" fill="rgb(var(--carbon-950))" opacity="0.85" />
        </>
      ) : (
        <>
          <rect
            x="146"
            y="68"
            width="66"
            height="66"
            rx="20"
            fill="rgb(var(--carbon-950))"
            opacity="0.28"
          />
          {Array.from({ length: lenses }).map((_, index) => {
            const positions = [
              { cx: 168, cy: 90 },
              { cx: 194, cy: 112 },
              { cx: 168, cy: 116 },
            ];
            const pos = positions[index] ?? positions[0];
            return (
              <g key={index}>
                <circle cx={pos.cx} cy={pos.cy} r="13" fill="rgb(var(--carbon-950))" opacity="0.9" />
                <circle cx={pos.cx} cy={pos.cy} r="7" fill="rgb(var(--aurora-blue))" opacity="0.34" />
                <circle cx={pos.cx - 3} cy={pos.cy - 3} r="2.4" fill="#fff" opacity="0.55" />
              </g>
            );
          })}
          <circle cx="214" cy="82" r="5" fill="rgb(var(--carbon-950))" opacity="0.55" />
        </>
      )}

      {/* Boutons latéraux */}
      <rect x="127" y="112" width="3" height="22" rx="1.5" fill="rgb(var(--carbon-950))" opacity="0.5" />
      <rect x="127" y="144" width="3" height="34" rx="1.5" fill="rgb(var(--carbon-950))" opacity="0.5" />
      <rect x="270" y="132" width="3" height="46" rx="1.5" fill="rgb(var(--carbon-950))" opacity="0.5" />

      {/* Reflet oblique */}
      <path d="M130 82 L270 52 L270 118 L130 168 Z" fill={`url(#${uid}-sheen)`} opacity="0.5" />
    </g>
  );
}

function EarbudsShape({ uid, view }: { uid: string; view: number }) {
  return (
    <g>
      {/* Boîtier */}
      <rect
        x="118"
        y="168"
        width="164"
        height="128"
        rx="34"
        fill={`url(#${uid}-body)`}
        stroke="rgb(var(--carbon-950))"
        strokeOpacity="0.45"
        strokeWidth="1.5"
      />
      <line x1="118" y1="212" x2="282" y2="212" stroke="rgb(var(--carbon-950))" strokeOpacity="0.22" strokeWidth="2" />
      <circle cx="200" cy="278" r="4" fill="rgb(var(--aurora-mint))" opacity="0.8" />

      {view !== 1 && (
        <>
          {/* Écouteurs */}
          {[158, 242].map((cx) => (
            <g key={cx}>
              <ellipse cx={cx} cy="118" rx="21" ry="25" fill={`url(#${uid}-body)`} />
              <rect x={cx - 6} y="136" width="12" height="42" rx="6" fill={`url(#${uid}-body)`} />
              <ellipse cx={cx} cy="110" rx="10" ry="12" fill="rgb(var(--carbon-950))" opacity="0.28" />
            </g>
          ))}
        </>
      )}

      <path d="M118 200 L282 168 L282 212 L118 244 Z" fill={`url(#${uid}-sheen)`} opacity="0.45" />
    </g>
  );
}

function HeadphonesShape({ uid }: { uid: string }) {
  return (
    <g>
      {/* Arceau */}
      <path
        d="M118 208 C118 118, 282 118, 282 208"
        fill="none"
        stroke={`url(#${uid}-body)`}
        strokeWidth="20"
        strokeLinecap="round"
      />
      <path
        d="M118 208 C118 118, 282 118, 282 208"
        fill="none"
        stroke="rgb(var(--carbon-950))"
        strokeOpacity="0.2"
        strokeWidth="20"
        strokeLinecap="round"
        strokeDasharray="4 14"
      />

      {/* Écouteurs */}
      {[118, 282].map((cx) => (
        <g key={cx}>
          <rect
            x={cx - 32}
            y="196"
            width="64"
            height="86"
            rx="30"
            fill={`url(#${uid}-body)`}
            stroke="rgb(var(--carbon-950))"
            strokeOpacity="0.4"
            strokeWidth="1.5"
          />
          <ellipse cx={cx} cy="239" rx="21" ry="30" fill="rgb(var(--carbon-950))" opacity="0.32" />
          <ellipse cx={cx} cy="239" rx="13" ry="20" fill="rgb(var(--aurora-blue))" opacity="0.16" />
        </g>
      ))}

      <path d="M100 180 L300 132 L300 176 L100 224 Z" fill={`url(#${uid}-sheen)`} opacity="0.4" />
    </g>
  );
}

function SpeakerShape({ uid }: { uid: string }) {
  return (
    <g>
      <rect
        x="86"
        y="152"
        width="228"
        height="112"
        rx="56"
        fill={`url(#${uid}-body)`}
        stroke="rgb(var(--carbon-950))"
        strokeOpacity="0.42"
        strokeWidth="1.5"
      />
      {/* Grille tissée */}
      {Array.from({ length: 13 }).map((_, index) => (
        <line
          key={index}
          x1={110 + index * 15}
          y1="164"
          x2={110 + index * 15}
          y2="252"
          stroke="rgb(var(--carbon-950))"
          strokeOpacity="0.16"
          strokeWidth="4"
          strokeLinecap="round"
        />
      ))}
      <ellipse cx="86" cy="208" rx="14" ry="56" fill="rgb(var(--carbon-950))" opacity="0.24" />
      <ellipse cx="314" cy="208" rx="14" ry="56" fill="rgb(var(--carbon-950))" opacity="0.18" />
      <path d="M86 186 L314 152 L314 190 L86 224 Z" fill={`url(#${uid}-sheen)`} opacity="0.4" />
    </g>
  );
}

function WatchShape({ uid, view }: { uid: string; view: number }) {
  return (
    <g>
      {/* Bracelet */}
      <path d="M168 66 L232 66 L226 142 L174 142 Z" fill={`url(#${uid}-body)`} opacity="0.7" />
      <path d="M174 262 L226 262 L232 338 L168 338 Z" fill={`url(#${uid}-body)`} opacity="0.7" />

      {/* Boîtier */}
      <rect
        x="146"
        y="128"
        width="108"
        height="148"
        rx="34"
        fill={`url(#${uid}-body)`}
        stroke="rgb(var(--carbon-950))"
        strokeOpacity="0.45"
        strokeWidth="1.5"
      />
      <rect x="154" y="136" width="92" height="132" rx="28" fill={`url(#${uid}-screen)`} />

      {view !== 1 && (
        <>
          <text
            x="200"
            y="202"
            textAnchor="middle"
            fontSize="30"
            fontWeight="600"
            fill="#fff"
            opacity="0.82"
            fontFamily="var(--font-display)"
          >
            9:41
          </text>
          <circle cx="200" cy="230" r="16" fill="none" stroke="rgb(var(--aurora-mint))" strokeOpacity="0.6" strokeWidth="4" />
        </>
      )}

      {/* Couronne */}
      <rect x="254" y="170" width="8" height="24" rx="4" fill={`url(#${uid}-body)`} />
      <path d="M146 160 L254 128 L254 172 L146 204 Z" fill={`url(#${uid}-sheen)`} opacity="0.45" />
    </g>
  );
}

function BandShape({ uid }: { uid: string }) {
  return (
    <g>
      <path d="M176 62 L224 62 L220 150 L180 150 Z" fill={`url(#${uid}-body)`} opacity="0.7" />
      <path d="M180 254 L220 254 L224 342 L176 342 Z" fill={`url(#${uid}-body)`} opacity="0.7" />
      <rect
        x="164"
        y="140"
        width="72"
        height="124"
        rx="34"
        fill={`url(#${uid}-body)`}
        stroke="rgb(var(--carbon-950))"
        strokeOpacity="0.45"
        strokeWidth="1.5"
      />
      <rect x="172" y="150" width="56" height="104" rx="27" fill={`url(#${uid}-screen)`} />
      <path d="M164 168 L236 140 L236 180 L164 208 Z" fill={`url(#${uid}-sheen)`} opacity="0.4" />
    </g>
  );
}

function ChargerShape({ uid }: { uid: string }) {
  return (
    <g>
      <rect
        x="126"
        y="128"
        width="148"
        height="160"
        rx="30"
        fill={`url(#${uid}-body)`}
        stroke="rgb(var(--carbon-950))"
        strokeOpacity="0.42"
        strokeWidth="1.5"
      />
      {/* Broches */}
      <rect x="168" y="94" width="12" height="38" rx="6" fill="rgb(var(--carbon-500))" />
      <rect x="220" y="94" width="12" height="38" rx="6" fill="rgb(var(--carbon-500))" />
      {/* Ports */}
      {[172, 200, 228].map((cx, index) => (
        <rect
          key={cx}
          x={cx - 14}
          y="252"
          width="28"
          height={index === 2 ? 12 : 10}
          rx="5"
          fill="rgb(var(--carbon-950))"
          opacity="0.62"
        />
      ))}
      <circle cx="200" cy="180" r="5" fill="rgb(var(--aurora-mint))" opacity="0.7" />
      <path d="M126 168 L274 128 L274 176 L126 216 Z" fill={`url(#${uid}-sheen)`} opacity="0.42" />
    </g>
  );
}

function PowerbankShape({ uid }: { uid: string }) {
  return (
    <g>
      <rect
        x="132"
        y="88"
        width="136"
        height="224"
        rx="26"
        fill={`url(#${uid}-body)`}
        stroke="rgb(var(--carbon-950))"
        strokeOpacity="0.42"
        strokeWidth="1.5"
      />
      {/* Afficheur */}
      <rect x="164" y="126" width="72" height="46" rx="10" fill="rgb(var(--carbon-950))" opacity="0.72" />
      <text
        x="200"
        y="159"
        textAnchor="middle"
        fontSize="26"
        fontWeight="700"
        fill="rgb(var(--aurora-mint))"
        fontFamily="var(--font-mono)"
      >
        100
      </text>
      {/* Ports */}
      {[168, 200, 232].map((cx) => (
        <rect key={cx} x={cx - 13} y="272" width="26" height="10" rx="5" fill="rgb(var(--carbon-950))" opacity="0.6" />
      ))}
      <path d="M132 138 L268 88 L268 136 L132 186 Z" fill={`url(#${uid}-sheen)`} opacity="0.4" />
    </g>
  );
}

function CaseShape({ uid }: { uid: string }) {
  return (
    <g>
      <rect
        x="134"
        y="56"
        width="132"
        height="278"
        rx="32"
        fill={`url(#${uid}-body)`}
        stroke="rgb(var(--carbon-950))"
        strokeOpacity="0.42"
        strokeWidth="1.5"
      />
      <rect x="146" y="68" width="108" height="254" rx="24" fill="rgb(var(--carbon-950))" opacity="0.18" />
      {/* Découpe du module photo */}
      <rect x="152" y="76" width="66" height="66" rx="20" fill="rgb(var(--carbon-950))" opacity="0.42" />
      {/* Anneau MagSafe */}
      <circle cx="200" cy="216" r="42" fill="none" stroke="rgb(var(--carbon-950))" strokeOpacity="0.22" strokeWidth="7" />
      <path d="M134 92 L266 56 L266 104 L134 140 Z" fill={`url(#${uid}-sheen)`} opacity="0.4" />
    </g>
  );
}

function CableShape({ uid }: { uid: string }) {
  return (
    <g>
      <path
        d="M120 116 C260 116, 260 210, 200 210 C140 210, 140 300, 280 300"
        fill="none"
        stroke={`url(#${uid}-body)`}
        strokeWidth="17"
        strokeLinecap="round"
      />
      <path
        d="M120 116 C260 116, 260 210, 200 210 C140 210, 140 300, 280 300"
        fill="none"
        stroke="rgb(var(--carbon-950))"
        strokeOpacity="0.18"
        strokeWidth="17"
        strokeLinecap="round"
        strokeDasharray="3 9"
      />
      {/* Connecteurs USB-C */}
      <rect x="94" y="102" width="34" height="28" rx="10" fill={`url(#${uid}-body)`} />
      <rect x="272" y="286" width="34" height="28" rx="10" fill={`url(#${uid}-body)`} />
    </g>
  );
}

function ScreenProtectorShape({ uid }: { uid: string }) {
  return (
    <g>
      <rect
        x="120"
        y="72"
        width="130"
        height="256"
        rx="24"
        fill="rgb(var(--aurora-cyan))"
        opacity="0.1"
        stroke="rgb(var(--aurora-cyan))"
        strokeOpacity="0.42"
        strokeWidth="1.5"
      />
      <rect
        x="152"
        y="60"
        width="130"
        height="256"
        rx="24"
        fill={`url(#${uid}-screen)`}
        opacity="0.62"
        stroke="rgb(var(--aurora-blue))"
        strokeOpacity="0.5"
        strokeWidth="1.5"
      />
      <path d="M152 96 L282 60 L282 108 L152 144 Z" fill={`url(#${uid}-sheen)`} opacity="0.6" />
    </g>
  );
}
