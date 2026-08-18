/* ==========================================================================
   Import d'une photo depuis l'appareil, sans serveur.

   Le site est entièrement statique : il n'y a pas d'endpoint d'upload ni de
   disque où écrire. Une photo choisie dans l'admin est donc redimensionnée
   et réencodée dans le navigateur, puis conservée en data URL dans le
   catalogue (localStorage, voir catalog.store.ts).

   Le redimensionnement n'est pas cosmétique : une photo de téléphone brute
   pèse plusieurs mégaoctets, et localStorage plafonne autour de 5 Mo pour
   tout le domaine. Ramenée à 900 px en WebP, la même photo tient en une
   centaine de kilooctets — l'ordre de grandeur de ce que produisait le
   traitement serveur (sharp) auparavant.
   ========================================================================== */

const MAX_DIMENSION = 900;
const QUALITY = 0.82;

/** Au-delà, on refuse avant même de décoder : un fichier de cette taille est
 *  soit une image démesurée, soit un fichier qui n'a rien à faire ici. */
const MAX_INPUT_BYTES = 15 * 1024 * 1024;

export class ImageFileError extends Error {}

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new ImageFileError("Fichier illisible : ce n'est pas une image valide."));
    };
    image.src = url;
  });
}

/**
 * Convertit un fichier image en data URL WebP redimensionnée.
 * Le ratio d'origine est préservé, et une image déjà plus petite que
 * MAX_DIMENSION n'est jamais agrandie.
 */
export async function fileToResizedDataUrl(file: File): Promise<string> {
  if (!file.type.startsWith('image/')) {
    throw new ImageFileError('Choisissez un fichier image (JPEG, PNG ou WebP).');
  }
  if (file.size > MAX_INPUT_BYTES) {
    throw new ImageFileError('Image trop lourde (15 Mo maximum).');
  }

  const image = await loadImage(file);
  const scale = Math.min(1, MAX_DIMENSION / Math.max(image.width, image.height));
  const width = Math.round(image.width * scale);
  const height = Math.round(image.height * scale);

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext('2d');
  if (!context) throw new ImageFileError('Traitement de l’image impossible sur ce navigateur.');

  context.drawImage(image, 0, 0, width, height);

  const dataUrl = canvas.toDataURL('image/webp', QUALITY);
  // Un navigateur sans encodeur WebP renvoie silencieusement du PNG : on
  // retombe alors sur JPEG, bien plus léger qu'un PNG photographique.
  if (!dataUrl.startsWith('data:image/webp')) {
    return canvas.toDataURL('image/jpeg', QUALITY);
  }
  return dataUrl;
}
