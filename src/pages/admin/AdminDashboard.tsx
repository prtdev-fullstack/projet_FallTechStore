import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  Package,
  Plus,
  Settings,
  ShoppingBag,
  TrendingUp,
  Users,
  Wallet,
} from 'lucide-react';
import type { CategoryId, Order, Product } from '../../types';
import { ROUTES } from '../../constants/routes';
import { categories } from '../../data/catalog';
import { useOrdersStore } from '../../store/orders.store';
import { useCatalogStore, productBySlugMap } from '../../store/catalog.store';
import { formatPriceShort } from '../../utils/format';
import { cn } from '../../utils/cn';
import { Badge, Button } from '../../components/ui';
import { ProductImage } from '../../components/commerce/ProductImage';
import { Seo } from '../../components/seo/Seo';
import { RevenueChart, type RevenuePoint } from './RevenueChart';

/* ==========================================================================
   Tableau de bord — pilotage réel, pas un résumé statique.

   Un sélecteur de période scope tout ce qui suit (graphique, KPI, répartitions,
   meilleures ventes) : les chiffres racontent toujours la même tranche de
   temps, jamais un mélange de « total historique » et « aujourd'hui ». Voir
   le skill dataviz du dépôt pour les règles de couleur et de tracé
   appliquées ici (palette catégorielle validée, un trait de 2 px, grille
   récessive, survol au plus proche).
   ========================================================================== */

const STATUS_LABEL: Record<Order['status'], { label: string; tone: 'accent' | 'aurora' | 'success' }> = {
  'en-preparation': { label: 'En préparation', tone: 'accent' },
  expediee: { label: 'Expédiée', tone: 'aurora' },
  livree: { label: 'Livrée', tone: 'success' },
};

const STATUS_BAR: Record<Order['status'], string> = {
  'en-preparation': 'bg-accent-solid',
  expediee: 'bg-aurora',
  livree: 'bg-success',
};

/* Couleur catégorielle FIXE par identité, jamais par rang : une catégorie
   garde toujours la même couleur, que le tri par CA la place en premier ou
   en dernier. Palette validée (CVD + luminosité) — voir tokens.css §5b. */
const CATEGORY_COLOR: Record<CategoryId, string> = {
  smartphones: 'bg-viz-1',
  audio: 'bg-viz-2',
  accessoires: 'bg-viz-3',
  'objets-connectes': 'bg-viz-4',
};

const LOW_STOCK_THRESHOLD = 10;

type RangeId = '7d' | '30d' | 'all';
const RANGES: { id: RangeId; label: string; days: number | null }[] = [
  { id: '7d', label: '7 jours', days: 7 },
  { id: '30d', label: '30 jours', days: 30 },
  { id: 'all', label: 'Tout', days: null },
];

const dayLabelFormatter = new Intl.DateTimeFormat('fr-SN', { day: 'numeric', month: 'short' });

function startOfDay(date: Date): Date {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  return next;
}
function addDays(date: Date, amount: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + amount);
  return next;
}
function toISODate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function bucketByDay(orders: Order[], from: Date, to: Date): RevenuePoint[] {
  const days: RevenuePoint[] = [];
  let cursor = startOfDay(from);
  const end = startOfDay(to);
  while (cursor <= end) {
    days.push({ iso: toISODate(cursor), label: dayLabelFormatter.format(cursor), total: 0 });
    cursor = addDays(cursor, 1);
  }
  const indexByIso = new Map(days.map((day, index) => [day.iso, index]));
  for (const order of orders) {
    const index = indexByIso.get(toISODate(new Date(order.date)));
    if (index !== undefined) days[index].total += order.total;
  }
  return days;
}

function sumRevenue(orders: Order[]): number {
  return orders.reduce((total, order) => total + order.total, 0);
}

interface Delta {
  percent: number;
  direction: 'up' | 'down';
  isNew: boolean;
}

function computeDelta(current: number, previous: number | null): Delta | null {
  if (previous === null) return null;
  if (previous === 0) return current > 0 ? { percent: 0, direction: 'up', isNew: true } : null;
  const percent = ((current - previous) / previous) * 100;
  if (Math.round(percent) === 0) return null;
  return { percent: Math.round(Math.abs(percent)), direction: percent > 0 ? 'up' : 'down', isNew: false };
}

function DeltaChip({ delta }: { delta: Delta | null }) {
  if (!delta) return null;
  if (delta.isNew) {
    return (
      <span className="inline-flex items-center rounded-full bg-accent/15 px-2 py-0.5 text-[0.6875rem] font-semibold text-accent-text">
        Nouveau
      </span>
    );
  }
  const Icon = delta.direction === 'up' ? ArrowUpRight : ArrowDownRight;
  return (
    <span
      className={cn(
        'inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[0.6875rem] font-semibold',
        delta.direction === 'up' ? 'bg-success/15 text-success' : 'bg-danger/15 text-danger',
      )}
    >
      <Icon className="h-3 w-3" aria-hidden="true" />
      {delta.percent}%
    </span>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  delta,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: React.ReactNode;
  delta?: Delta | null;
}) {
  return (
    <div className="rounded-xl border border-border bg-elevated p-5">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-ink-tertiary">
          <Icon className="h-4 w-4" aria-hidden="true" />
          <span className="text-caption">{label}</span>
        </div>
        <DeltaChip delta={delta ?? null} />
      </div>
      <p
        className="mt-2 truncate font-display text-h3 text-ink"
        title={typeof value === 'string' ? value : undefined}
      >
        {value}
      </p>
    </div>
  );
}

/** Barre horizontale — grille catégorielle ou statut, étiquette directe. */
function Bar({
  label,
  value,
  displayValue,
  ratio,
  barClassName,
}: {
  label: string;
  value: number;
  displayValue: string;
  ratio: number;
  barClassName: string;
}) {
  return (
    <li>
      <div className="flex items-baseline gap-2 text-body-s">
        <span className={cn('h-2 w-2 shrink-0 rounded-full', barClassName)} aria-hidden="true" />
        <span className="truncate text-ink-secondary">{label}</span>
        <span className="tabular ml-auto shrink-0 text-ink">{displayValue}</span>
      </div>
      <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-sunken">
        <div
          className={cn('h-full rounded-full transition-[width] duration-slow ease-out-expo', barClassName)}
          style={{ width: `${value === 0 ? 0 : Math.max(4, ratio * 100)}%` }}
        />
      </div>
    </li>
  );
}

export function AdminDashboard() {
  const products = useCatalogStore((state) => state.products);
  const orders = useOrdersStore((state) => state.orders);
  const [range, setRange] = useState<RangeId>('30d');

  const { from, to, previousFrom, previousTo } = useMemo(() => {
    const now = new Date();
    const config = RANGES.find((r) => r.id === range)!;

    if (config.days === null) {
      const earliestOrder =
        orders.length > 0
          ? new Date(Math.min(...orders.map((order) => new Date(order.date).getTime())))
          : now;
      const cappedFrom = new Date(Math.max(earliestOrder.getTime(), addDays(now, -90).getTime()));
      return { from: cappedFrom, to: now, previousFrom: null, previousTo: null };
    }

    const rangeFrom = addDays(startOfDay(now), -(config.days - 1));
    const prevTo = addDays(rangeFrom, -1);
    const prevFrom = addDays(prevTo, -(config.days - 1));
    return { from: rangeFrom, to: now, previousFrom: prevFrom, previousTo: prevTo };
  }, [range, orders]);

  const filteredOrders = useMemo(
    () => orders.filter((order) => { const d = new Date(order.date); return d >= from && d <= to; }),
    [orders, from, to],
  );
  const previousOrders = useMemo(() => {
    if (!previousFrom || !previousTo) return null;
    return orders.filter((order) => {
      const d = new Date(order.date);
      return d >= previousFrom && d <= previousTo;
    });
  }, [orders, previousFrom, previousTo]);

  const revenue = useMemo(() => sumRevenue(filteredOrders), [filteredOrders]);
  const avgOrderValue = filteredOrders.length > 0 ? revenue / filteredOrders.length : 0;
  const clientCount = useMemo(
    () => new Set(filteredOrders.map((order) => order.customer.email)).size,
    [filteredOrders],
  );

  const revenueDelta = computeDelta(revenue, previousOrders ? sumRevenue(previousOrders) : null);
  const ordersDelta = computeDelta(filteredOrders.length, previousOrders ? previousOrders.length : null);

  const chartData = useMemo(() => bucketByDay(filteredOrders, from, to), [filteredOrders, from, to]);

  const productBySlug = useMemo(() => productBySlugMap(products), [products]);

  const bestSellers = useMemo(() => {
    const qtyBySlug = new Map<string, number>();
    for (const order of filteredOrders) {
      for (const line of order.lines) qtyBySlug.set(line.slug, (qtyBySlug.get(line.slug) ?? 0) + line.quantity);
    }
    if (qtyBySlug.size === 0) {
      // Rien vendu sur la période sélectionnée : on retombe sur le volume
      // historique du catalogue plutôt que d'afficher une section vide.
      return [...products]
        .sort((a, b) => (b.sold ?? 0) - (a.sold ?? 0))
        .slice(0, 5)
        .map((product) => ({ product, qty: product.sold ?? 0, isAllTime: true }));
    }
    return [...qtyBySlug.entries()]
      .map(([slug, qty]) => ({ product: productBySlug.get(slug), qty, isAllTime: false }))
      .filter((entry): entry is { product: Product; qty: number; isAllTime: boolean } => Boolean(entry.product))
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 5);
  }, [filteredOrders, products, productBySlug]);

  const recentOrders = filteredOrders.slice(0, 6);

  const statusBreakdown = useMemo(() => {
    const counts: Record<Order['status'], number> = { 'en-preparation': 0, expediee: 0, livree: 0 };
    for (const order of filteredOrders) counts[order.status] += 1;
    return counts;
  }, [filteredOrders]);

  const categoryRevenue = useMemo(() => {
    const totals = new Map<CategoryId, number>();
    for (const order of filteredOrders) {
      for (const line of order.lines) {
        const category = productBySlug.get(line.slug)?.category;
        if (!category) continue;
        totals.set(category, (totals.get(category) ?? 0) + line.price * line.quantity);
      }
    }
    return categories
      .map((category) => ({ categoryId: category.id, label: category.name, total: totals.get(category.id) ?? 0 }))
      .sort((a, b) => b.total - a.total);
  }, [filteredOrders, productBySlug]);

  const outOfStock = useMemo(() => products.filter((product) => product.stock === 0), [products]);
  const lowStock = useMemo(
    () => products.filter((product) => product.stock > 0 && product.stock <= LOW_STOCK_THRESHOLD),
    [products],
  );
  const stockAlerts = [...outOfStock, ...lowStock].slice(0, 5);

  const maxStatusCount = Math.max(1, ...Object.values(statusBreakdown));
  const maxCategoryRevenue = Math.max(1, ...categoryRevenue.map((c) => c.total));

  return (
    <div>
      <Seo title="Tableau de bord — Admin" description="Vue d'ensemble de l'activité de la boutique." noIndex />

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-h2 text-ink">Tableau de bord</h1>
          <p className="mt-1 text-body-s text-ink-secondary">Vue d'ensemble de l'activité de la boutique.</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Sélecteur de période — scope tout ce qui suit, une seule ligne, en haut. */}
          <div role="group" aria-label="Période" className="flex rounded-md border border-border bg-elevated p-0.5">
            {RANGES.map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => setRange(option.id)}
                aria-pressed={range === option.id}
                className={cn(
                  'min-h-[36px] cursor-pointer rounded-[5px] px-3 text-caption font-semibold transition-colors duration-fast',
                  range === option.id
                    ? 'bg-accent-solid text-accent-fg'
                    : 'text-ink-secondary hover:bg-elevated-hover hover:text-ink',
                )}
              >
                {option.label}
              </button>
            ))}
          </div>

          <div className="flex gap-2">
            <Button to={ROUTES.adminProductNew} size="sm" variant="secondary" iconLeft={<Plus className="h-3.5 w-3.5" aria-hidden="true" />}>
              Produit
            </Button>
            <Button to={ROUTES.adminSettings} size="sm" variant="ghost" iconLeft={<Settings className="h-3.5 w-3.5" aria-hidden="true" />}>
              Paramètres
            </Button>
          </div>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard icon={TrendingUp} label="Chiffre d'affaires" value={formatPriceShort(revenue)} delta={revenueDelta} />
        <StatCard icon={Wallet} label="Panier moyen" value={formatPriceShort(avgOrderValue)} />
        <StatCard icon={ShoppingBag} label="Commandes" value={filteredOrders.length} delta={ordersDelta} />
        <StatCard icon={Users} label="Clients" value={clientCount} />
      </div>

      {/* Graphique — la pièce centrale : de vraies données jour par jour,
          pas un total isolé. */}
      <section className="mt-6 rounded-xl border border-border bg-elevated p-5">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="text-h4 text-ink">Chiffre d'affaires</h2>
          <p className="text-caption text-ink-tertiary">
            {RANGES.find((r) => r.id === range)?.label} · {formatPriceShort(revenue)} au total
          </p>
        </div>
        <div className="mt-4">
          <RevenueChart data={chartData} />
        </div>
      </section>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <section className="rounded-xl border border-border bg-elevated p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-h4 text-ink">Commandes récentes</h2>
            <Link to={ROUTES.adminOrders} className="text-caption font-semibold text-accent-text hover:underline">
              Tout voir
            </Link>
          </div>

          {recentOrders.length === 0 ? (
            <p className="mt-6 text-body-s text-ink-tertiary">Aucune commande sur cette période.</p>
          ) : (
            <ul className="mt-4 divide-y divide-border-subtle">
              {recentOrders.map((order) => (
                <li key={order.id} className="flex items-center justify-between gap-4 py-3">
                  <div className="min-w-0">
                    <p className="truncate font-mono text-body-s font-semibold text-ink">{order.id}</p>
                    <p className="truncate text-caption text-ink-tertiary">
                      {order.customer.firstName} {order.customer.lastName}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    <span className="tabular text-body-s font-semibold text-ink">
                      {formatPriceShort(order.total)}
                    </span>
                    <Badge tone={STATUS_LABEL[order.status].tone}>{STATUS_LABEL[order.status].label}</Badge>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-xl border border-border bg-elevated p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-h4 text-ink">Meilleures ventes</h2>
            <Link to={ROUTES.adminProducts} className="text-caption font-semibold text-accent-text hover:underline">
              Tout voir
            </Link>
          </div>
          {bestSellers[0]?.isAllTime && (
            <p className="mt-1 text-caption text-ink-tertiary">Historique complet — rien de vendu sur cette période.</p>
          )}

          <ul className="mt-4 flex flex-col gap-3">
            {bestSellers.map(({ product, qty }) => (
              <li key={product.slug} className="flex items-center gap-3">
                <span className="h-11 w-11 shrink-0 overflow-hidden rounded-md border border-border bg-sunken">
                  <ProductImage product={product} size="thumb" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-body-s font-medium text-ink">{product.name}</span>
                  <span className="tabular block text-caption text-ink-tertiary">{qty} vendus</span>
                </span>
                <span className="tabular shrink-0 text-body-s text-ink">{formatPriceShort(product.price)}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <section className="rounded-xl border border-border bg-elevated p-5">
          <h2 className="text-h4 text-ink">Statut des commandes</h2>
          {filteredOrders.length === 0 ? (
            <p className="mt-6 text-body-s text-ink-tertiary">Aucune commande sur cette période.</p>
          ) : (
            <ul className="mt-4 flex flex-col gap-3">
              {(Object.keys(STATUS_LABEL) as Order['status'][]).map((status) => (
                <Bar
                  key={status}
                  label={STATUS_LABEL[status].label}
                  value={statusBreakdown[status]}
                  displayValue={String(statusBreakdown[status])}
                  ratio={statusBreakdown[status] / maxStatusCount}
                  barClassName={STATUS_BAR[status]}
                />
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-xl border border-border bg-elevated p-5">
          <h2 className="text-h4 text-ink">Ventes par catégorie</h2>
          {categoryRevenue.every((c) => c.total === 0) ? (
            <p className="mt-6 text-body-s text-ink-tertiary">Aucune vente sur cette période.</p>
          ) : (
            <ul className="mt-4 flex flex-col gap-3">
              {categoryRevenue.map((entry) => (
                <Bar
                  key={entry.categoryId}
                  label={entry.label}
                  value={entry.total}
                  displayValue={formatPriceShort(entry.total)}
                  ratio={entry.total / maxCategoryRevenue}
                  barClassName={CATEGORY_COLOR[entry.categoryId]}
                />
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-xl border border-border bg-elevated p-5">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-h4 text-ink">
              <AlertTriangle className="h-4 w-4 text-danger" aria-hidden="true" />
              Alertes stock
            </h2>
            <Link to={ROUTES.adminProducts} className="text-caption font-semibold text-accent-text hover:underline">
              Tout voir
            </Link>
          </div>

          {stockAlerts.length === 0 ? (
            <p className="mt-6 text-body-s text-ink-tertiary">Aucun produit en stock faible.</p>
          ) : (
            <ul className="mt-4 flex flex-col gap-3">
              {stockAlerts.map((product) => (
                <li key={product.slug} className="flex items-center gap-3">
                  <span className="h-10 w-10 shrink-0 overflow-hidden rounded-md border border-border bg-sunken">
                    <ProductImage product={product} size="thumb" />
                  </span>
                  <span className="min-w-0 flex-1 truncate text-body-s text-ink">{product.name}</span>
                  <Badge tone={product.stock === 0 ? 'danger' : 'accent'} className="shrink-0">
                    {product.stock === 0 ? 'Épuisé' : `${product.stock} restants`}
                  </Badge>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <p className="mt-6 flex items-center gap-2 text-caption text-ink-tertiary">
        <Package className="h-3.5 w-3.5" aria-hidden="true" />
        {products.length} produits au catalogue
      </p>
    </div>
  );
}
