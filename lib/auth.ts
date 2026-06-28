import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import { NextRequest } from "next/server";
import { prisma } from "./db";
import type { User } from "@prisma/client";

const SALT_ROUNDS = 12;
const TOKEN_EXPIRY = "7d";
const COOKIE_NAME = "auth-token";

function getSecretKey(): Uint8Array {
  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret) {
    throw new Error("NEXTAUTH_SECRET environment variable is not set");
  }
  return new TextEncoder().encode(secret);
}

/**
 * Hash a plaintext password using bcrypt with 12 salt rounds.
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * Compare a plaintext password against a bcrypt hash.
 */
export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Create a signed JWT containing the user's id, valid for 7 days.
 */
export async function createToken(userId: string): Promise<string> {
  const secretKey = getSecretKey();
  return new SignJWT({ userId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(TOKEN_EXPIRY)
    .sign(secretKey);
}

/**
 * Verify a JWT and return the decoded payload, or null if invalid/expired.
 */
export async function verifyToken(
  token: string
): Promise<{ userId: string } | null> {
  try {
    const secretKey = getSecretKey();
    const { payload } = await jwtVerify(token, secretKey);
    if (typeof payload.userId !== "string") return null;
    return { userId: payload.userId };
  } catch {
    return null;
  }
}

/**
 * Read the auth-token cookie from the incoming request, verify it, and
 * load the corresponding user from the database. Returns null if there is
 * no valid session.
 */
export async function getSessionUser(
  req: NextRequest
): Promise<User | null> {
  try {
    const token = req.cookies.get(COOKIE_NAME)?.value;
    if (!token) return null;

    const payload = await verifyToken(token);
    if (!payload) return null;

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
    });

    return user;
  } catch {
    return null;
  }
}

export const AUTH_COOKIE_NAME = COOKIE_NAME;

export function authCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days in seconds
  };
}
