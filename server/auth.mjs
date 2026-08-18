import jwt from 'jsonwebtoken';
import crypto from 'node:crypto';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

/* ==========================================================================
   Session admin — cookie httpOnly signé (JWT), pas de session en mémoire.

   Le secret est généré une fois puis écrit dans un fichier ignoré par Git
   (jwt-secret.local), plutôt que codé en dur dans la source : un secret
   commité dans l'historique reste compromis même après rotation.
   ========================================================================== */

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SECRET_PATH = path.join(__dirname, 'jwt-secret.local');

function loadOrCreateSecret() {
  if (fs.existsSync(SECRET_PATH)) return fs.readFileSync(SECRET_PATH, 'utf8').trim();
  const secret = crypto.randomBytes(48).toString('hex');
  fs.writeFileSync(SECRET_PATH, secret, 'utf8');
  return secret;
}

const JWT_SECRET = loadOrCreateSecret();
export const COOKIE_NAME = 'falltech_admin_session';

export function signAdminToken(email) {
  return jwt.sign({ email }, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyAdminToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}

/** Bloque les routes admin sans cookie de session valide. */
export function requireAdmin(req, res, next) {
  const token = req.cookies?.[COOKIE_NAME];
  const payload = token ? verifyAdminToken(token) : null;
  if (!payload) return res.status(401).json({ error: 'Non authentifié.' });
  req.admin = payload;
  next();
}
