# FallTech Store

Boutique e-commerce high-tech — refonte complète.
**« La tech, sans le superflu. »**

Smartphones, audio, accessoires et objets connectés, pour le marché sénégalais (Dakar, francs CFA).

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # génère le sitemap puis compile
npm run typecheck  # tsc --noEmit
```

---

## Ce que ce projet démontre

Une refonte totale d'une boutique React existante : nouvelle identité visuelle, nouveau modèle de données, nouvelle architecture, nouveau tunnel d'achat. La version d'origine est conservée dans l'historique Git (commit `063b447`), ce qui rend la comparaison avant/après vérifiable ligne à ligne.

| | Avant | Après |
|---|---|---|
| Recherche | `<input>` décoratif, sans `onChange` | Palette ⌘K + recherche filtrée dans l'URL |
| Favoris | Cœur affiché, sans état | Store persisté + page dédiée |
| Fiche produit | 1 image, 0 avis, 0 similaire | Galerie + zoom, variantes, 43 avis, suggestions |
| Tunnel d'achat | 1 page de 539 lignes, `alert()` final | 3 étapes, validation par champ, confirmation animée |
| Images | 8 domaines tiers hotlinkés | Rendus vectoriels locaux, ~2 Ko chacun |
| Routes | Aucune 404 → page blanche | 404 avec suggestions + redirections |
| SEO | 1 `<title>` statique | Métadonnées par page, JSON-LD, sitemap |
| Thème | Clair uniquement | Sombre par défaut + clair, sans FOUC |
| Bundle | 1 fichier, 406 Ko | 26 fichiers, chargement différé par route |

---

## Stack

React 18 · TypeScript · Vite 5 · TailwindCSS 3 · Framer Motion · Zustand · React Router 7 · Lenis

---

## Design System — « Carbon & Aurora »

Consultable en direct sur **`/design-system`**.

**Couleurs.** Tout passe par des tokens CSS en canaux RVB, ce qui permet à Tailwind de générer les variantes d'opacité (`bg-accent/20`) tout en gardant un thème pilotable par un seul attribut `data-theme`. Aucune couleur n'est écrite en dur dans un composant.

L'accent bleu est découpé en trois rôles pour tenir les contrastes WCAG :

| Token | Rôle | Contraste |
|---|---|---|
| `ion-400` | Texte et liens sur fond sombre | 7,5:1 — AAA |
| `ion-500` | Identité : halos, bordures, focus | — |
| `ion-600` | Aplat de bouton sous texte blanc | 5,2:1 — AA |

Le bleu d'identité seul échoue à AA sous du texte blanc : d'où la nuance dédiée aux aplats. L'ambre est réservé au commerce (promotions, prix barrés, stock faible), le dégradé Aurora est strictement décoratif et ne porte jamais de texte.

**Typographie.** Clash Display (titres), Inter Variable (interface), JetBrains Mono (caractéristiques). Auto-hébergées, sous-ensembles latins uniquement, deux fichiers préchargés. Échelle fluide en `clamp()` : aucun point de rupture pour le texte. Les prix utilisent `tabular-nums` — le total ne tressaute plus quand une quantité change.

**Mouvement.** Trois courbes, cinq durées, déclarées une seule fois et partagées entre le CSS et Framer Motion, ce qui rend impossible une divergence entre une transition Tailwind et une animation JavaScript.

---

## Effets au scroll

| Composant | Effet |
|---|---|
| `Reveal` | Apparition à l'entrée dans le champ — 8 variantes dont volet et flou |
| `Stagger` | Grille en cascade — **un seul** observateur d'intersection pour 24 cartes |
| `TextReveal` | Titre révélé mot à mot derrière un volet, texte intact pour les lecteurs d'écran |
| `Parallax` | Translation douce lissée par ressort, coupée au tactile |
| `Tilt` | Inclinaison 3D avec reflet suivant le curseur |
| `Magnetic` | Bouton attiré par le curseur, avec parallaxe interne |
| `CountUp` | Compteur animé, valeur finale toujours présente dans le DOM |
| `Marquee` | Bandeau bouclé sans raccord, doublon `aria-hidden` |
| `ScrollProgress` | Barre de lecture en `scaleX` — composée par le GPU |

Chacun se neutralise sous `prefers-reduced-motion`. Le défilement fluide (Lenis) est désactivé au tactile, où l'inertie native est déjà mieux calibrée.

---

## Architecture

```
src/
├── components/
│   ├── ui/          Boutons, formulaires, surcouches, navigation, notifications
│   ├── motion/      9 composants d'animation réutilisables
│   ├── commerce/    Carte produit, visuel, panier latéral, palette ⌘K
│   ├── layout/      En-tête, pied de page
│   ├── brand/       Logo, loader
│   └── seo/         Métadonnées et données structurées
├── pages/           11 pages, toutes chargées à la demande
├── layouts/         RootLayout
├── hooks/           7 hooks (scroll, thème, média, verrou de défilement…)
├── store/           cart · wishlist · auth · ui  (Zustand + persist)
├── data/            catalogue, 24 produits, 43 avis
├── constants/       routes, mouvement
├── utils/           cn(), formatage FCFA
└── styles/          tokens · globals · fonts
```

**Choix notables**

- **Le panier ne stocke que des références** (`{ slug, quantité, variantes }`), jamais l'objet produit. Un prix modifié en base ne laisse plus un panier figé sur l'ancien tarif.
- **Les filtres vivent dans l'URL.** Un catalogue filtré est partageable, ajoutable aux favoris, et le bouton « précédent » défait un filtre au lieu de quitter la page.
- **Zustand plutôt que Context.** Les sélecteurs évitent de redessiner tout l'arbre à chaque mutation du panier — le défaut de l'implémentation d'origine.
- **Le slug est l'identifiant public.** `/produit/iphone-15-pro-max` est indexable ; `/produit/1` ne l'est pas.
- **« Promotions » n'est plus une catégorie.** C'était une erreur de modélisation : un iPhone en promotion disparaissait de « smartphones ». C'est désormais un état dérivé de la présence d'un prix barré.

---

## Visuels produits

Le catalogue d'origine chargeait ses images depuis huit domaines tiers : liens morts à terme, aucune maîtrise du poids, hotlinking non autorisé.

Chaque produit est désormais rendu en SVG à partir de sa catégorie et de sa variante de couleur : onze silhouettes (téléphone, écouteurs, casque, enceinte, montre, bracelet, chargeur, batterie, coque, câble, verre), quatre points de vue, quelques kilo-octets, net à toute taille.

Pour utiliser de vraies photos : déposer `public/products/<slug>-<vue>.webp` et passer `hasPhotos: true` sur le produit. Le reste du site n'a rien à changer.

---

## Accessibilité

- Contrastes AA/AAA vérifiés sur les deux thèmes, valeurs documentées dans `tokens.css`
- Cibles tactiles de 44 px minimum ; les liens en ligne reçoivent une zone étendue via `.tap-safe`, sans modifier la mise en page
- Piège de focus, `Échap` et restitution du focus sur toutes les surcouches
- Lien d'évitement, anneau de focus unique, ordre de tabulation conforme à l'ordre visuel
- La couleur n'est jamais le seul indicateur : une variante indisponible est aussi barrée en diagonale
- Compteur de résultats en `aria-live`, notifications en `aria-live="polite"`
- `prefers-reduced-motion` respecté par chaque composant animé

---

## Performance

- Chargement différé par route — 26 fichiers, aucune page ne paie le poids des autres
- Dépendances isolées (`react`, `motion`, `state`) : une correction de texte n'invalide plus 450 Ko de cache
- Polices auto-hébergées, latin uniquement, deux fichiers préchargés — Google Fonts supprimé
- Visuels en SVG inline : aucune requête image, aucun décalage de mise en page
- `aspect-ratio` sur tous les conteneurs d'image
- CSS : 55 Ko → **10,7 Ko** compressés

| Fichier | Brut | Gzip |
|---|---|---|
| `react` | 174 Ko | 57 Ko |
| `motion` | 146 Ko | 48 Ko |
| `index` (socle applicatif) | 154 Ko | 47 Ko |
| Page la plus lourde (`Home`) | 20 Ko | 6 Ko |
| Page la plus légère (`NotFound`) | 2 Ko | 1 Ko |

---

## SEO

Titre, description, URL canonique, Open Graph et Twitter Card par page. JSON-LD `Store` sur l'accueil, `Product` (prix, disponibilité, note) et `BreadcrumbList` sur les fiches. `robots.txt` et `sitemap.xml` généré depuis le catalogue à chaque build — le plan du site ne peut pas se désynchroniser.

Les pages dépendant d'un état local (panier, commande, compte) sont en `noindex`.

**Limite assumée :** l'application est rendue côté client. Les métadonnées sont correctes et lues par les robots qui exécutent JavaScript, mais une indexation optimale demanderait un pré-rendu statique (`vite-plugin-ssg`), écarté du périmètre.

---

## Ce qui est simulé

Projet de démonstration, sans back-end :

- **Paiement** — aucune transaction, aucune donnée bancaire demandée ni stockée
- **Authentification** — aucun mot de passe vérifié ni conservé ; seule la fonction `login` du store changerait face à une vraie API
- **Catalogue et avis** — données statiques dans `src/data/`
- **Commandes** — persistées en `localStorage`

Ces limites sont affichées dans l'interface, aux endroits concernés.
