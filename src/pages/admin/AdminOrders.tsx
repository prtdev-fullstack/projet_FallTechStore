import { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { useOrdersStore } from '../../store/orders.store';
import type { Order } from '../../types';
import { formatDate, formatPrice } from '../../utils/format';
import { Badge, EmptyState, Input, Select } from '../../components/ui';
import { toast } from '../../components/ui/Toast';
import { Seo } from '../../components/seo/Seo';

const STATUS_OPTIONS: { value: Order['status']; label: string }[] = [
  { value: 'en-preparation', label: 'En préparation' },
  { value: 'expediee', label: 'Expédiée' },
  { value: 'livree', label: 'Livrée' },
];

const STATUS_TONE = {
  'en-preparation': 'accent' as const,
  expediee: 'aurora' as const,
  livree: 'success' as const,
};

export function AdminOrders() {
  const orders = useOrdersStore((state) => state.orders);
  const updateOrderStatus = useOrdersStore((state) => state.updateOrderStatus);
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return orders;
    return orders.filter(
      (order) =>
        order.id.toLowerCase().includes(q) ||
        `${order.customer.firstName} ${order.customer.lastName}`.toLowerCase().includes(q) ||
        order.customer.email.toLowerCase().includes(q),
    );
  }, [orders, query]);

  return (
    <div>
      <Seo title="Commandes — Admin" description="Liste des commandes passées sur la boutique." noIndex />
      <h1 className="text-h2 text-ink">Commandes</h1>
      <p className="mt-1 text-body-s text-ink-secondary">{orders.length} commandes passées sur la boutique.</p>

      <Input
        iconLeft={<Search className="h-4 w-4" aria-hidden="true" />}
        placeholder="Rechercher par numéro, client ou e-mail…"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        wrapperClassName="mt-6 max-w-sm"
      />

      {filtered.length === 0 ? (
        <EmptyState
          className="mt-6 rounded-xl border border-border bg-elevated"
          title="Aucune commande"
          description={query ? 'Aucun résultat pour cette recherche.' : 'Aucune commande pour l’instant.'}
        />
      ) : (
        <div className="mt-6 flex flex-col gap-4">
          {filtered.map((order) => (
            <article key={order.id} className="rounded-xl border border-border bg-elevated p-5">
              <header className="flex flex-wrap items-start justify-between gap-4 border-b border-border-subtle pb-4">
                <div>
                  <p className="font-mono text-body-s font-semibold text-ink">{order.id}</p>
                  <p className="mt-1 text-caption text-ink-tertiary">{formatDate(order.date)}</p>
                  <p className="mt-1 text-body-s text-ink-secondary">
                    {order.customer.firstName} {order.customer.lastName} · {order.customer.email}
                  </p>
                  <p className="text-caption text-ink-tertiary">
                    {order.customer.phone} · {order.customer.address}, {order.customer.city}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge tone={STATUS_TONE[order.status]}>
                    {STATUS_OPTIONS.find((o) => o.value === order.status)?.label}
                  </Badge>
                  <Select
                    aria-label={`Statut de la commande ${order.id}`}
                    value={order.status}
                    onChange={(event) =>
                      updateOrderStatus(order.id, event.target.value as Order['status']).catch(() =>
                        toast.error('Échec de la mise à jour du statut'),
                      )
                    }
                    options={STATUS_OPTIONS}
                    className="h-9 w-44"
                  />
                </div>
              </header>

              <ul className="mt-4 flex flex-col gap-2">
                {order.lines.map((line) => (
                  <li key={line.slug} className="flex items-center justify-between text-body-s">
                    <span className="text-ink-secondary">
                      {line.name} <span className="tabular text-ink-tertiary">× {line.quantity}</span>
                    </span>
                    <span className="tabular text-ink">{formatPrice(line.price * line.quantity)}</span>
                  </li>
                ))}
              </ul>

              <footer className="mt-4 flex items-baseline justify-between border-t border-border-subtle pt-4">
                <span className="text-body-s text-ink-secondary">Total</span>
                <span className="tabular font-display text-h4 text-ink">{formatPrice(order.total)}</span>
              </footer>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
