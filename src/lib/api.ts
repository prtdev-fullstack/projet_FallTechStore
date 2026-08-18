/* ==========================================================================
   Client HTTP minimal pour l'API (voir server/).

   `credentials: 'include'` sur chaque appel : indispensable pour que le
   cookie de session admin (httpOnly) parte avec la requête, y compris en dev
   où le proxy Vite masque le port différent du backend.
   ========================================================================== */

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  // Un corps FormData pose sa propre frontière multipart : lui imposer
  // `Content-Type: application/json` casserait le parsing côté serveur.
  const isFormData = options.body instanceof FormData;
  const response = await fetch(`/api${path}`, {
    credentials: 'include',
    headers: options.body && !isFormData ? { 'Content-Type': 'application/json' } : undefined,
    ...options,
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new ApiError(response.status, body?.error ?? `Erreur ${response.status}`);
  }

  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: 'POST', body: body ? JSON.stringify(body) : undefined }),
  put: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: 'PUT', body: body ? JSON.stringify(body) : undefined }),
  patch: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: 'PATCH', body: body ? JSON.stringify(body) : undefined }),
  delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
  /** Corps `FormData` brut : jamais de JSON.stringify, jamais de Content-Type
   *  manuel — le navigateur pose lui-même la frontière multipart. */
  upload: <T>(path: string, formData: FormData) => request<T>(path, { method: 'POST', body: formData }),
};
