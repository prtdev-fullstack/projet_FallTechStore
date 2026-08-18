import { useRef, useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Loader2, Upload, X } from 'lucide-react';
import type { CategoryId } from '../../types';
import { ROUTES } from '../../constants/routes';
import { brands, categories } from '../../data/catalog';
import { useCatalogStore } from '../../store/catalog.store';
import { api, ApiError } from '../../lib/api';
import { Button, Checkbox, Input, Select, Textarea } from '../../components/ui';
import { toast } from '../../components/ui/Toast';
import { cn } from '../../utils/cn';
import { Seo } from '../../components/seo/Seo';

const MAX_PHOTOS = 3;

/* ── Photos : import depuis l'appareil, jusqu'à trois par produit ─────────
   Chaque case part directement vers POST /api/uploads (traité en WebP côté
   serveur, voir server/index.mjs) dès la sélection du fichier — pas d'étape
   « joindre puis valider le formulaire » : l'aperçu confirme tout de suite
   que l'import a marché, avant même d'enregistrer le produit. La première
   case sert de couverture (carte produit, panier) ; les trois alimentent la
   galerie de la fiche produit. */
function PhotoGalleryField({
  images,
  fallbackSrc,
  onChange,
}: {
  images: string[];
  fallbackSrc?: string;
  onChange: (images: string[]) => void;
}) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [uploadingSlot, setUploadingSlot] = useState<number | null>(null);

  const onFileSelected = async (index: number, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = ''; // permet de re-sélectionner le même fichier ensuite
    if (!file) return;

    setUploadingSlot(index);
    try {
      const formData = new FormData();
      formData.append('photo', file);
      const result = await api.upload<{ url: string }>('/uploads', formData);
      const next = [...images];
      next[index] = result.url;
      onChange(next.filter(Boolean));
      toast.success('Photo importée');
    } catch (error) {
      toast.error("Échec de l'import", {
        description: error instanceof ApiError ? error.message : undefined,
      });
    } finally {
      setUploadingSlot(null);
    }
  };

  const removeAt = (index: number) => {
    onChange(images.filter((_, i) => i !== index));
  };

  return (
    <div className="sm:col-span-2">
      <span className="text-body-s font-medium text-ink">Photos</span>
      <p className="mt-1 text-caption text-ink-tertiary">
        Jusqu'à {MAX_PHOTOS} photos — la première sert de couverture (carte produit, panier), les
        suivantes alimentent la galerie de la fiche produit.
      </p>

      <div className="mt-3 grid grid-cols-3 gap-3">
        {Array.from({ length: MAX_PHOTOS }, (_, index) => {
          const src = images[index] || (index === 0 ? fallbackSrc : undefined);
          const isUploading = uploadingSlot === index;

          return (
            <div key={index} className="relative">
              <input
                ref={(el) => {
                  inputRefs.current[index] = el;
                }}
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={(event) => onFileSelected(index, event)}
              />
              <button
                type="button"
                onClick={() => inputRefs.current[index]?.click()}
                disabled={uploadingSlot !== null}
                className={cn(
                  'flex aspect-square w-full cursor-pointer items-center justify-center overflow-hidden rounded-md border bg-sunken transition-colors duration-fast',
                  src ? 'border-border' : 'border-dashed border-border hover:border-border-strong',
                  uploadingSlot !== null && !isUploading && 'opacity-50',
                )}
              >
                {isUploading ? (
                  <Loader2 className="h-5 w-5 animate-spin text-ink-tertiary" aria-hidden="true" />
                ) : src ? (
                  <img src={src} alt="" className="h-full w-full object-contain" />
                ) : (
                  <span className="flex flex-col items-center gap-1 text-ink-tertiary">
                    <Upload className="h-5 w-5" aria-hidden="true" />
                    <span className="text-caption">Photo {index + 1}</span>
                  </span>
                )}
              </button>

              {images[index] && (
                <button
                  type="button"
                  onClick={() => removeAt(index)}
                  aria-label={`Retirer la photo ${index + 1}`}
                  className="tap-target absolute -right-1.5 -top-1.5 flex h-6 w-6 cursor-pointer items-center justify-center rounded-full border border-border bg-elevated text-ink-tertiary shadow-1 transition-colors duration-fast hover:text-danger"
                >
                  <X className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ==========================================================================
   Création / édition d'un produit.

   Volontairement limité aux champs qui pilotent la vente : nom, prix, stock,
   catégorie, description. Déclinaisons (couleur, stockage) et fiches
   techniques détaillées ne sont pas éditables ici — les modéliser dans un
   formulaire demanderait un éditeur à part entière, hors de portée d'un
   admin de démonstration ; un produit créé ici reste vendable (prix, panier,
   commande) mais sans variantes.
   ========================================================================== */

function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

interface FormValues {
  name: string;
  slug: string;
  brandId: string;
  category: CategoryId;
  price: string;
  originalPrice: string;
  stock: string;
  tagline: string;
  description: string;
  images: string[];
  featured: boolean;
}

export function AdminProductForm() {
  const { slug: editingSlug } = useParams<{ slug: string }>();
  const isEditing = Boolean(editingSlug);
  const navigate = useNavigate();

  const products = useCatalogStore((state) => state.products);
  const addProduct = useCatalogStore((state) => state.addProduct);
  const updateProduct = useCatalogStore((state) => state.updateProduct);

  const existing = editingSlug ? products.find((product) => product.slug === editingSlug) : undefined;

  const [values, setValues] = useState<FormValues>(() => ({
    name: existing?.name ?? '',
    slug: existing?.slug ?? '',
    brandId: existing?.brandId ?? brands[0].id,
    category: existing?.category ?? categories[0].id,
    price: existing ? String(existing.price) : '',
    originalPrice: existing?.originalPrice ? String(existing.originalPrice) : '',
    stock: existing ? String(existing.stock) : '',
    tagline: existing?.tagline ?? '',
    description: existing?.description ?? '',
    images: existing?.images ?? [],
    featured: existing?.featured ?? false,
  }));
  const [slugTouched, setSlugTouched] = useState(isEditing);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Slug connu mais absent du catalogue : on ne peut pas éditer ce qui n'existe pas.
  if (isEditing && !existing) return <Navigate to={ROUTES.adminProducts} replace />;

  const setField = <K extends keyof FormValues>(key: K, value: FormValues[K]) => {
    setValues((current) => {
      const next = { ...current, [key]: value };
      if (key === 'name' && !slugTouched) next.slug = slugify(String(value));
      return next;
    });
  };

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const nextErrors: Record<string, string> = {};

    if (values.name.trim().length < 2) nextErrors.name = 'Indiquez un nom de produit.';
    const slug = slugify(values.slug);
    if (!slug) nextErrors.slug = "L'identifiant ne peut pas être vide.";
    else if (!isEditing && products.some((product) => product.slug === slug)) {
      nextErrors.slug = 'Cet identifiant est déjà utilisé par un autre produit.';
    }
    const price = Number(values.price);
    if (!Number.isFinite(price) || price <= 0) nextErrors.price = 'Indiquez un prix valide.';
    const originalPrice = values.originalPrice ? Number(values.originalPrice) : undefined;
    if (values.originalPrice && (!Number.isFinite(originalPrice) || originalPrice! <= price)) {
      nextErrors.originalPrice = 'Le prix barré doit être supérieur au prix de vente.';
    }
    const stock = Number(values.stock);
    if (!Number.isInteger(stock) || stock < 0) nextErrors.stock = 'Indiquez un stock valide.';

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    try {
      if (isEditing && existing) {
        await updateProduct(existing.slug, {
          name: values.name,
          brandId: values.brandId,
          category: values.category,
          price,
          originalPrice,
          stock,
          tagline: values.tagline,
          description: values.description,
          images: values.images,
          featured: values.featured,
        });
        toast.success('Produit mis à jour', { description: values.name });
      } else {
        await addProduct({
          slug,
          name: values.name,
          brandId: values.brandId,
          category: values.category,
          price,
          originalPrice,
          tagline: values.tagline,
          description: values.description,
          highlights: [],
          specs: [],
          variantGroups: [],
          stock,
          rating: 0,
          reviewCount: 0,
          releasedAt: new Date().toISOString().slice(0, 10),
          featured: values.featured,
          sold: 0,
          images: values.images,
        });
        toast.success('Produit créé', { description: values.name });
      }
      navigate(ROUTES.adminProducts);
    } catch (error) {
      if (error instanceof ApiError && error.status === 409) {
        setErrors({ slug: error.message });
        return;
      }
      toast.error('Échec de l’enregistrement', {
        description: error instanceof ApiError ? error.message : undefined,
      });
    }
  };

  return (
    <div className="max-w-3xl">
      <Seo
        title={isEditing ? 'Modifier le produit — Admin' : 'Nouveau produit — Admin'}
        description="Formulaire de gestion du catalogue."
        noIndex
      />

      <button
        type="button"
        onClick={() => navigate(ROUTES.adminProducts)}
        className="flex min-h-[36px] cursor-pointer items-center gap-1.5 text-caption font-semibold text-ink-secondary hover:text-ink"
      >
        <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
        Retour aux produits
      </button>

      <h1 className="mt-3 text-h2 text-ink">{isEditing ? `Modifier « ${existing?.name} »` : 'Nouveau produit'}</h1>

      <form onSubmit={onSubmit} className="mt-6 flex flex-col gap-6" noValidate>
        <div className="grid gap-5 rounded-xl border border-border bg-elevated p-6 sm:grid-cols-2">
          <Input
            label="Nom du produit"
            required
            value={values.name}
            error={errors.name}
            onChange={(event) => setField('name', event.target.value)}
            wrapperClassName="sm:col-span-2"
          />
          <Input
            label="Identifiant (slug)"
            required
            hint={isEditing ? undefined : "Généré automatiquement, modifiable avant création."}
            disabled={isEditing}
            value={values.slug}
            error={errors.slug}
            onChange={(event) => {
              setSlugTouched(true);
              setField('slug', event.target.value);
            }}
          />
          <Select
            label="Marque"
            value={values.brandId}
            onChange={(event) => setField('brandId', event.target.value)}
            options={brands.map((brand) => ({ value: brand.id, label: brand.name }))}
          />
          <Select
            label="Catégorie"
            value={values.category}
            onChange={(event) => setField('category', event.target.value as CategoryId)}
            options={categories.map((category) => ({ value: category.id, label: category.name }))}
          />
          <PhotoGalleryField
            images={values.images}
            fallbackSrc={existing ? `/products/${existing.slug}-thumb.webp` : undefined}
            onChange={(images) => setField('images', images)}
          />
        </div>

        <div className="grid gap-5 rounded-xl border border-border bg-elevated p-6 sm:grid-cols-3">
          <Input
            label="Prix (F CFA)"
            type="number"
            inputMode="numeric"
            required
            min={0}
            value={values.price}
            error={errors.price}
            onChange={(event) => setField('price', event.target.value)}
          />
          <Input
            label="Prix barré (F CFA)"
            type="number"
            inputMode="numeric"
            min={0}
            hint="Optionnel — affiche une promotion."
            value={values.originalPrice}
            error={errors.originalPrice}
            onChange={(event) => setField('originalPrice', event.target.value)}
          />
          <Input
            label="Stock"
            type="number"
            inputMode="numeric"
            required
            min={0}
            value={values.stock}
            error={errors.stock}
            onChange={(event) => setField('stock', event.target.value)}
          />
        </div>

        <div className="grid gap-5 rounded-xl border border-border bg-elevated p-6">
          <Input
            label="Phrase d'accroche"
            placeholder="Une ligne qui vend le produit"
            value={values.tagline}
            onChange={(event) => setField('tagline', event.target.value)}
          />
          <Textarea
            label="Description"
            rows={5}
            value={values.description}
            onChange={(event) => setField('description', event.target.value)}
          />
          <Checkbox
            label="Mettre en avant sur la page d'accueil"
            checked={values.featured}
            onChange={(event) => setField('featured', event.target.checked)}
          />
        </div>

        <div className="flex justify-end gap-3">
          <Button type="button" variant="secondary" onClick={() => navigate(ROUTES.adminProducts)}>
            Annuler
          </Button>
          <Button type="submit" size="lg">
            {isEditing ? 'Enregistrer' : 'Créer le produit'}
          </Button>
        </div>
      </form>
    </div>
  );
}
