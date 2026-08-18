import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Pencil, Plus, Search, Trash2 } from 'lucide-react';
import { ROUTES } from '../../constants/routes';
import { categoryById } from '../../data/catalog';
import { useCatalogStore } from '../../store/catalog.store';
import { formatPriceShort } from '../../utils/format';
import { cn } from '../../utils/cn';
import { Badge, Button, EmptyState, IconButton, Input, Modal } from '../../components/ui';
import { toast } from '../../components/ui/Toast';
import { ProductImage } from '../../components/commerce/ProductImage';
import { Seo } from '../../components/seo/Seo';

export function AdminProducts() {
  const products = useCatalogStore((state) => state.products);
  const removeProduct = useCatalogStore((state) => state.removeProduct);
  const [query, setQuery] = useState('');
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return products;
    return products.filter((product) => product.name.toLowerCase().includes(q));
  }, [products, query]);

  const productToDelete = products.find((product) => product.slug === pendingDelete);

  return (
    <div>
      <Seo title="Produits — Admin" description="Gestion du catalogue de la boutique." noIndex />
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-h2 text-ink">Produits</h1>
          <p className="mt-1 text-body-s text-ink-secondary">{products.length} références au catalogue.</p>
        </div>
        <Button to={ROUTES.adminProductNew} iconLeft={<Plus className="h-4 w-4" aria-hidden="true" />}>
          Nouveau produit
        </Button>
      </div>

      <Input
        iconLeft={<Search className="h-4 w-4" aria-hidden="true" />}
        placeholder="Rechercher un produit…"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        wrapperClassName="mt-6 max-w-sm"
      />

      {filtered.length === 0 ? (
        <EmptyState
          className="mt-6 rounded-xl border border-border bg-elevated"
          title="Aucun produit"
          description={query ? 'Aucun résultat pour cette recherche.' : 'Le catalogue est vide.'}
        />
      ) : (
        <div className="mt-6 overflow-x-auto rounded-xl border border-border bg-elevated">
          <table className="w-full min-w-[720px] border-collapse text-left">
            <thead>
              <tr className="border-b border-border-subtle text-caption text-ink-tertiary">
                <th className="px-4 py-3 font-medium">Produit</th>
                <th className="px-4 py-3 font-medium">Catégorie</th>
                <th className="px-4 py-3 font-medium">Prix</th>
                <th className="px-4 py-3 font-medium">Stock</th>
                <th className="px-4 py-3 font-medium">Statut</th>
                <th className="px-4 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {filtered.map((product) => (
                <tr key={product.slug}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <span className="h-11 w-11 shrink-0 overflow-hidden rounded-md border border-border bg-sunken">
                        <ProductImage product={product} size="thumb" />
                      </span>
                      <span className="min-w-0">
                        <span className="block max-w-[220px] truncate text-body-s font-medium text-ink">
                          {product.name}
                        </span>
                        <span className="block truncate text-caption text-ink-tertiary">{product.slug}</span>
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-body-s text-ink-secondary">
                    {categoryById.get(product.category)?.name ?? product.category}
                  </td>
                  <td className="px-4 py-3">
                    <span className="tabular text-body-s font-semibold text-ink">
                      {formatPriceShort(product.price)}
                    </span>
                    {product.originalPrice && (
                      <span className="tabular ml-2 text-caption text-ink-tertiary line-through">
                        {formatPriceShort(product.originalPrice)}
                      </span>
                    )}
                  </td>
                  <td className={cn('tabular px-4 py-3 text-body-s', product.stock === 0 ? 'text-danger' : 'text-ink')}>
                    {product.stock}
                  </td>
                  <td className="px-4 py-3">
                    {product.stock === 0 ? (
                      <Badge tone="danger">Épuisé</Badge>
                    ) : product.originalPrice ? (
                      <Badge tone="promo">Promotion</Badge>
                    ) : (
                      <Badge tone="success">En stock</Badge>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <Link
                        to={ROUTES.adminProduct(product.slug)}
                        aria-label={`Modifier ${product.name}`}
                        title={`Modifier ${product.name}`}
                        className="tap-target flex h-9 w-9 items-center justify-center rounded-md text-ink-secondary transition-colors duration-fast hover:bg-elevated-hover hover:text-ink"
                      >
                        <Pencil className="h-4 w-4" aria-hidden="true" />
                      </Link>
                      <IconButton
                        label={`Supprimer ${product.name}`}
                        icon={<Trash2 className="h-4 w-4" aria-hidden="true" />}
                        size="sm"
                        onClick={() => setPendingDelete(product.slug)}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal
        open={!!productToDelete}
        onClose={() => setPendingDelete(null)}
        title="Supprimer ce produit ?"
        footer={
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setPendingDelete(null)}>
              Annuler
            </Button>
            <Button
              variant="primary"
              className="bg-danger hover:bg-danger/90"
              onClick={async () => {
                if (productToDelete) {
                  await removeProduct(productToDelete.slug).catch(() =>
                    toast.error('Échec de la suppression'),
                  );
                }
                setPendingDelete(null);
              }}
            >
              Supprimer
            </Button>
          </div>
        }
      >
        <p className="text-body-s text-ink-secondary">
          <strong className="text-ink">{productToDelete?.name}</strong> sera retiré du catalogue et de la
          boutique. Cette action est irréversible.
        </p>
      </Modal>
    </div>
  );
}
