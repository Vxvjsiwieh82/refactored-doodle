// OmniNinja — lightweight session helpers (demo auth).
// In production this maps to NextAuth.js v4 (already available). For the
// sandbox preview we use a simple cookie token + DB session row so the
// workspace is usable without external OAuth setup.

import { db } from './db';
import { cookies } from 'next/headers';
import crypto from 'crypto';

export const SESSION_COOKIE = 'omninja_session';
const SESSION_TTL_DAYS = 30;

export function randomToken() {
  return crypto.randomBytes(32).toString('hex');
}

export async function getOrCreateDemoUser() {
  // Ensure a stable demo account exists so the workspace is immediately usable
  // in the preview. Real sign-up replaces this once NextAuth is wired.
  const email = 'ninja@omninja.app';
  let user = await db.user.findUnique({ where: { email } });
  if (!user) {
    user = await db.user.create({
      data: {
        email,
        name: 'Omni Ninja',
        tier: 'pro',
        credits: 4000,
        bonusCredits: 1000,
        role: 'admin',
        defaultModel: 'glm',
        image: null,
      },
    });
  }
  return user;
}

export async function getCurrentUser() {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return getOrCreateDemoUser();
  const session = await db.session.findUnique({
    where: { token },
    include: { user: true },
  });
  if (!session || session.expiresAt < new Date()) {
    return getOrCreateDemoUser();
  }
  return session.user;
}

export async function createSession(userId: string) {
  const token = randomToken();
  const expiresAt = new Date(Date.now() + SESSION_TTL_DAYS * 24 * 60 * 60 * 1000);
  await db.session.create({ data: { userId, token, expiresAt } });
  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    expires: expiresAt,
  });
  return token;
}
