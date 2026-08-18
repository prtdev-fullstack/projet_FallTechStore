import { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { useOrdersStore } from '../../store/orders.store';
import { formatDate, formatPrice } from '../../utils/format';
import { EmptyState, Input } from '../../components/ui';
import { Seo } from '../../components/seo/Seo';

/* ==========================================================================
   Clients — dérivés des commandes.

   Le site n'a pas de base de comptes multi-utilisateurs (authentification
   simulée à un seul profil, voir auth.store.ts) : la liste des « clients »
   est donc reconstituée à partir de l'instantané client enregistré sur
   chaque commande, regroupé par e-mail. C'est la même donnée qu'un vrai
   back-office afficherait, juste sans table Clients séparée à maintenir.
   ========================================================================== */

export function AdminClients() {
  const orders = useOrdersStore((state) => state.orders);
  const [query, setQuery] = useState('');

  const clients = useMemo(() => {
    const byEmail = new Map<
      string,
      { firstName: string; lastName: string; email: string; phone: string; city: string; orders: number; total: number; lastOrderDate: string }
    >();

    for (const order of orders) {
      const key = order.customer.email;
      const existing = byEmail.get(key);
      if (existing) {
        existing.orders += 1;
        existing.total += order.total;
        if (order.date > existing.lastOrderDate) existing.lastOrderDate = order.date;
      } else {
        byEmail.set(key, {
          firstName: order.customer.firstName,
          lastName: order.customer.lastName,
          email: order.customer.email,
          phone: order.customer.phone,
          city: order.customer.city,
          orders: 1,
          total: order.total,
          lastOrderDate: order.date,
        });
      }
    }

    return [...byEmail.values()].sort((a, b) => b.total - a.total);
  }, [orders]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return clients;
    return clients.filter(
      (client) => `${client.firstName} ${client.lastName}`.toLowerCase().includes(q) || client.email.toLowerCase().includes(q),
    );
  }, [clients, query]);

  return (
    <div>
      <Seo title="Clients — Admin" description="Liste des clients de la boutique." noIndex />
      <h1 className="text-h2 text-ink">Clients</h1>
      <p className="mt-1 text-body-s text-ink-secondary">
        {clients.length} clients, déduits des commandes passées sur la boutique.
      </p>

      <Input
        iconLeft={<Search className="h-4 w-4" aria-hidden="true" />}
        placeholder="Rechercher un client…"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        wrapperClassName="mt-6 max-w-sm"
      />

      {filtered.length === 0 ? (
        <EmptyState
          className="mt-6 rounded-xl border border-border bg-elevated"
          title="Aucun client"
          description={query ? 'Aucun résultat pour cette recherche.' : 'Aucune commande n’a encore été passée.'}
        />
      ) : (
        <div className="mt-6 overflow-x-auto rounded-xl border border-border bg-elevated">
          <table className="w-full min-w-[640px] border-collapse text-left">
            <thead>
              <tr className="border-b border-border-subtle text-caption text-ink-tertiary">
                <th className="px-4 py-3 font-medium">Client</th>
                <th className="px-4 py-3 font-medium">Ville</th>
                <th className="px-4 py-3 font-medium">Commandes</th>
                <th className="px-4 py-3 font-medium">Total dépensé</th>
                <th className="px-4 py-3 font-medium">Dernière commande</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {filtered.map((client) => (
                <tr key={client.email}>
                  <td className="px-4 py-3">
                    <span className="block text-body-s font-medium text-ink">
                      {client.firstName} {client.lastName}
                    </span>
                    <span className="block text-caption text-ink-tertiary">{client.email}</span>
                  </td>
                  <td className="px-4 py-3 text-body-s text-ink-secondary">{client.city}</td>
                  <td className="tabular px-4 py-3 text-body-s text-ink">{client.orders}</td>
                  <td className="tabular px-4 py-3 text-body-s font-semibold text-ink">
                    {formatPrice(client.total)}
                  </td>
                  <td className="px-4 py-3 text-body-s text-ink-secondary">{formatDate(client.lastOrderDate)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
