import { useState } from 'react';
import { RotateCcw } from 'lucide-react';
import { useSettingsStore } from '../../store/settings.store';
import { ApiError } from '../../lib/api';
import { Button, Input } from '../../components/ui';
import { toast } from '../../components/ui/Toast';
import { Seo } from '../../components/seo/Seo';

/* ==========================================================================
   Paramètres de la boutique.

   Tout ce qui était figé dans constants/routes.ts (STORE) est désormais
   piloté ici : nom, coordonnées, seuils de livraison offerte, garantie,
   délai de retour. Un changement se reflète immédiatement sur le pied de
   page, les fiches produit, le panier et le tunnel de commande — voir
   settings.store.ts.
   ========================================================================== */

export function AdminSettings() {
  const settings = useSettingsStore((state) => state.settings);
  const updateSettings = useSettingsStore((state) => state.updateSettings);
  const resetSettings = useSettingsStore((state) => state.resetSettings);
  const [values, setValues] = useState(settings);

  const setField = <K extends keyof typeof values>(key: K, value: (typeof values)[K]) => {
    setValues((current) => ({ ...current, [key]: value }));
  };

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      await updateSettings(values);
      toast.success('Paramètres enregistrés');
    } catch (error) {
      toast.error('Échec de l’enregistrement', {
        description: error instanceof ApiError ? error.message : undefined,
      });
    }
  };

  return (
    <div className="max-w-3xl">
      <Seo title="Paramètres — Admin" description="Paramètres généraux de la boutique." noIndex />

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-h2 text-ink">Paramètres</h1>
          <p className="mt-1 text-body-s text-ink-secondary">
            Informations affichées sur la boutique — pied de page, fiches produit, tunnel de commande.
          </p>
        </div>
        <Button
          type="button"
          variant="secondary"
          iconLeft={<RotateCcw className="h-4 w-4" aria-hidden="true" />}
          onClick={async () => {
            await resetSettings();
            setValues(useSettingsStore.getState().settings);
            toast.info('Paramètres réinitialisés');
          }}
        >
          Réinitialiser
        </Button>
      </div>

      <form onSubmit={onSubmit} className="mt-6 flex flex-col gap-6">
        <div className="grid gap-5 rounded-xl border border-border bg-elevated p-6 sm:grid-cols-2">
          <Input
            label="Nom de la boutique"
            required
            value={values.name}
            onChange={(event) => setField('name', event.target.value)}
          />
          <Input
            label="Slogan"
            value={values.tagline}
            onChange={(event) => setField('tagline', event.target.value)}
          />
          <Input
            label="Ville"
            value={values.city}
            onChange={(event) => setField('city', event.target.value)}
          />
          <Input
            label="Pays"
            value={values.country}
            onChange={(event) => setField('country', event.target.value)}
          />
          <Input
            label="Adresse"
            value={values.address}
            onChange={(event) => setField('address', event.target.value)}
            wrapperClassName="sm:col-span-2"
          />
          <Input
            label="Téléphone"
            type="tel"
            value={values.phone}
            onChange={(event) => setField('phone', event.target.value)}
          />
          <Input
            label="E-mail"
            type="email"
            value={values.email}
            onChange={(event) => setField('email', event.target.value)}
          />
          <Input
            label="Horaires"
            value={values.hours}
            onChange={(event) => setField('hours', event.target.value)}
            wrapperClassName="sm:col-span-2"
          />
        </div>

        <div className="grid gap-5 rounded-xl border border-border bg-elevated p-6 sm:grid-cols-3">
          <Input
            label="Livraison offerte dès (F CFA)"
            type="number"
            inputMode="numeric"
            min={0}
            value={values.freeShippingThreshold}
            onChange={(event) => setField('freeShippingThreshold', Number(event.target.value))}
          />
          <Input
            label="Garantie (mois)"
            type="number"
            inputMode="numeric"
            min={0}
            value={values.warrantyMonths}
            onChange={(event) => setField('warrantyMonths', Number(event.target.value))}
          />
          <Input
            label="Retour possible sous (jours)"
            type="number"
            inputMode="numeric"
            min={0}
            value={values.returnDays}
            onChange={(event) => setField('returnDays', Number(event.target.value))}
          />
        </div>

        <div className="flex justify-end">
          <Button type="submit" size="lg">
            Enregistrer
          </Button>
        </div>
      </form>
    </div>
  );
}
