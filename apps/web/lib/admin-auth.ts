import { createHmac, timingSafeEqual } from "node:crypto";

import { cookies } from "next/headers";

const ADMIN_COOKIE_NAME = "fast_marketplace_admin";

function getAdminToken(): string {
  const token = process.env.MARKETPLACE_ADMIN_TOKEN;
  if (!token) {
    throw new Error("MARKETPLACE_ADMIN_TOKEN is required for admin auth.");
  }

  return token;
}

function buildSessionValue(): string {
  return createHmac("sha256", getAdminToken())
    .update("fast-marketplace-admin-session")
    .digest("hex");
}

export function isValidAdminToken(candidate: string): boolean {
  const expected = Buffer.from(getAdminToken());
  const received = Buffer.from(candidate);

  if (expected.length !== received.length) {
    return false;
  }

  return timingSafeEqual(expected, received);
}

export async function setAdminSession(): Promise<void> {
  const store = await cookies();
  store.set(ADMIN_COOKIE_NAME, buildSessionValue(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 8
  });
}

export async function clearAdminSession(): Promise<void> {
  const store = await cookies();
  store.delete(ADMIN_COOKIE_NAME);
}

export async function isAdminAuthenticated(): Promise<boolean> {
  const store = await cookies();
  const session = store.get(ADMIN_COOKIE_NAME)?.value;

  return session === buildSessionValue();
}
