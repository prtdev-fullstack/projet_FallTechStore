import { useId, useMemo, useRef, useState } from 'react';
import { formatPriceShort } from '../../utils/format';

/* ==========================================================================
   Graphique de revenu — aire + ligne, jour par jour.

   Pas de bibliothèque de graphiques : un SVG construit à la main, aux
   spécifications du skill dataviz du dépôt — ligne 2 px, remplissage à
   ~10 % d'opacité, grille en trait fin récessif, survol au plus proche avec
   fil croisé + infobulle, étiquette directe au dernier point. Une seule
   série (le CA de la boutique) : pas de légende, le titre de la section
   porte déjà l'identité.
   ========================================================================== */

export interface RevenuePoint {
  iso: string;
  label: string;
  total: number;
}

const WIDTH = 720;
const HEIGHT = 220;
const PAD_TOP = 16;
const PAD_BOTTOM = 28;
const PAD_LEFT = 8;
const PAD_RIGHT = 8;

/** Arrondit une borne d'axe à un pas « rond » (5, 10, 25, 50, 100…). */
function niceCeil(value: number): number {
  if (value <= 0) return 10;
  const magnitude = 10 ** Math.floor(Math.log10(value));
  const steps = [1, 2, 2.5, 5, 10];
  for (const step of steps) {
    const candidate = step * magnitude;
    if (candidate >= value) return candidate;
  }
  return 10 * magnitude;
}

export function RevenueChart({ data }: { data: RevenuePoint[] }) {
  const gradientId = useId();
  const svgRef = useRef<SVGSVGElement>(null);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  const maxValue = niceCeil(Math.max(1, ...data.map((d) => d.total)));
  const plotWidth = WIDTH - PAD_LEFT - PAD_RIGHT;
  const plotHeight = HEIGHT - PAD_TOP - PAD_BOTTOM;
  const stepX = data.length > 1 ? plotWidth / (data.length - 1) : 0;

  const points = useMemo(
    () =>
      data.map((d, i) => ({
        ...d,
        x: PAD_LEFT + (data.length > 1 ? i * stepX : plotWidth / 2),
        y: PAD_TOP + plotHeight - (d.total / maxValue) * plotHeight,
      })),
    [data, stepX, maxValue, plotWidth, plotHeight],
  );

  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const areaPath =
    points.length > 0
      ? `${linePath} L ${points[points.length - 1].x} ${PAD_TOP + plotHeight} L ${points[0].x} ${PAD_TOP + plotHeight} Z`
      : '';

  const gridLines = [0, 0.25, 0.5, 0.75, 1].map((fraction) => ({
    y: PAD_TOP + plotHeight * (1 - fraction),
    value: maxValue * fraction,
  }));

  const total = data.reduce((sum, d) => sum + d.total, 0);
  const hasData = total > 0;
  const last = points[points.length - 1];
  const hovered = hoverIndex !== null ? points[hoverIndex] : null;

  const onMove = (event: React.MouseEvent<SVGSVGElement>) => {
    if (!svgRef.current || points.length === 0) return;
    const rect = svgRef.current.getBoundingClientRect();
    const scaleX = WIDTH / rect.width;
    const localX = (event.clientX - rect.left) * scaleX;
    let nearest = 0;
    let nearestDist = Infinity;
    points.forEach((p, i) => {
      const dist = Math.abs(p.x - localX);
      if (dist < nearestDist) {
        nearestDist = dist;
        nearest = i;
      }
    });
    setHoverIndex(nearest);
  };

  // Étiquettes de l'axe X : jamais une par jour (30 jours = 30 dates
  // illisibles) — au plus ~6, réparties régulièrement, toujours le premier
  // et le dernier point.
  const labelEvery = Math.max(1, Math.ceil(points.length / 6));

  return (
    <div className="relative">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className="block w-full touch-none"
        role="img"
        aria-label={`Chiffre d'affaires par jour, total ${formatPriceShort(total)} sur la période`}
        onMouseMove={onMove}
        onMouseLeave={() => setHoverIndex(null)}
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgb(var(--accent))" stopOpacity="0.22" />
            <stop offset="100%" stopColor="rgb(var(--accent))" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Grille — trait fin récessif, jamais pointillée */}
        {gridLines.map((line) => (
          <g key={line.value}>
            <line
              x1={PAD_LEFT}
              x2={WIDTH - PAD_RIGHT}
              y1={line.y}
              y2={line.y}
              stroke="rgb(var(--border-subtle))"
              strokeWidth="1"
            />
            <text
              x={PAD_LEFT}
              y={line.y - 4}
              fontSize="9"
              fill="rgb(var(--text-tertiary))"
              className="font-mono"
            >
              {formatPriceShort(Math.round(line.value))}
            </text>
          </g>
        ))}

        {hasData && (
          <>
            <path d={areaPath} fill={`url(#${gradientId})`} stroke="none" />
            <path
              d={linePath}
              fill="none"
              stroke="rgb(var(--accent))"
              strokeWidth="2"
              strokeLinejoin="round"
              strokeLinecap="round"
            />
          </>
        )}

        {/* Étiquettes de l'axe X */}
        {points.map((p, i) =>
          i % labelEvery === 0 || i === points.length - 1 ? (
            <text
              key={p.iso}
              x={p.x}
              y={HEIGHT - 8}
              fontSize="9"
              textAnchor={i === points.length - 1 ? 'end' : i === 0 ? 'start' : 'middle'}
              fill="rgb(var(--text-tertiary))"
            >
              {p.label}
            </text>
          ) : null,
        )}

        {/* Étiquette directe au dernier point — la valeur qui compte le plus */}
        {hasData && last && (
          <circle cx={last.x} cy={last.y} r="4" fill="rgb(var(--accent))" stroke="rgb(var(--elevated))" strokeWidth="2" />
        )}

        {/* Fil croisé + point survolé */}
        {hovered && (
          <g>
            <line
              x1={hovered.x}
              x2={hovered.x}
              y1={PAD_TOP}
              y2={PAD_TOP + plotHeight}
              stroke="rgb(var(--border-strong))"
              strokeWidth="1"
            />
            <circle
              cx={hovered.x}
              cy={hovered.y}
              r="5"
              fill="rgb(var(--accent))"
              stroke="rgb(var(--elevated))"
              strokeWidth="2"
            />
          </g>
        )}
      </svg>

      {!hasData && (
        <p className="absolute inset-0 flex items-center justify-center text-body-s text-ink-tertiary">
          Aucune vente sur cette période.
        </p>
      )}

      {hovered && (
        <div
          className="pointer-events-none absolute top-2 -translate-x-1/2 rounded-md border border-border bg-elevated px-3 py-2 shadow-2"
          style={{
            left: `${(hovered.x / WIDTH) * 100}%`,
            transform: hovered.x > WIDTH * 0.8 ? 'translateX(-100%)' : hovered.x < WIDTH * 0.2 ? 'none' : 'translateX(-50%)',
          }}
        >
          <p className="text-caption text-ink-tertiary">{hovered.label}</p>
          <p className="tabular text-body-s font-semibold text-ink">{formatPriceShort(hovered.total)}</p>
        </div>
      )}
    </div>
  );
}
