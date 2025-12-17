import "server-only";

import crypto from "crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";

const SESSION_COOKIE_NAME = "report_ai_session";
const SESSION_TTL_DAYS = 30;

function base64UrlEncode(buffer: Buffer) {
    return buffer
        .toString("base64")
        .replaceAll("+", "-")
        .replaceAll("/", "_")
        .replaceAll("=", "");
}

function base64UrlDecode(input: string) {
    const base64 = input.replaceAll("-", "+").replaceAll("_", "/");
    const padded = base64 + "===".slice((base64.length + 3) % 4);
    return Buffer.from(padded, "base64");
}

function hashToken(token: string) {
    return crypto.createHash("sha256").update(token, "utf8").digest("hex");
}

function createPasswordHash(password: string) {
    const salt = crypto.randomBytes(16);
    const derivedKey = crypto.scryptSync(password, salt, 64);
    return `scrypt$${base64UrlEncode(salt)}$${base64UrlEncode(derivedKey)}`;
}

function verifyPasswordHash(password: string, stored: string) {
    const [scheme, saltB64, derivedB64] = stored.split("$");
    if (scheme !== "scrypt" || !saltB64 || !derivedB64) return false;

    const salt = base64UrlDecode(saltB64);
    const expected = base64UrlDecode(derivedB64);
    const actual = crypto.scryptSync(password, salt, expected.length);

    return crypto.timingSafeEqual(expected, actual);
}

export async function signOutLocal() {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

    cookieStore.set(SESSION_COOKIE_NAME, "", {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: 0,
    });

    if (token) {
        await prisma.sessions.deleteMany({ where: { token_hash: hashToken(token) } });
    }
}

export async function getCurrentUser() {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    if (!token) return null;

    const session = await prisma.sessions.findUnique({
        where: { token_hash: hashToken(token) },
        include: { people: true },
    });

    if (!session) return null;
    if (session.expires_at <= new Date()) {
        await prisma.sessions.delete({ where: { id: session.id } }).catch(() => undefined);
        return null;
    }

    return session.people;
}

export async function signInWithUsernameAndPassword(username: string, password: string) {
    const user = await prisma.people.findFirst({
        where: {
            OR: [{ email: username }, { username }],
        },
    });
    if (!user || !user.password_hash) return null;

    const ok = verifyPasswordHash(password, user.password_hash);
    if (!ok) return null;

    const token = base64UrlEncode(crypto.randomBytes(32));
    const tokenHash = hashToken(token);

    const expiresAt = new Date(Date.now() + SESSION_TTL_DAYS * 24 * 60 * 60 * 1000);

    await prisma.sessions.create({
        data: {
            id: crypto.randomUUID(),
            user_id: user.user_id,
            token_hash: tokenHash,
            expires_at: expiresAt,
        },
    });

    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE_NAME, token, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: SESSION_TTL_DAYS * 24 * 60 * 60,
    });

    return user;
}

export async function signUpWithUsernameAndPassword(username: string, password: string) {
    const normalizedUsername = username.trim();
    if (!normalizedUsername || !password) return null;

    const existing = await prisma.people.findFirst({
        where: {
            OR: [{ email: normalizedUsername }, { username: normalizedUsername }],
        },
    });
    if (existing) return null;

    const passwordHash = createPasswordHash(password);
    const user = await prisma.people.create({
        data: {
            user_id: crypto.randomUUID(),
            email: normalizedUsername,
            password_hash: passwordHash,
        },
    });

    return user;
}

export async function requireUser() {
    const user = await getCurrentUser();
    if (!user) redirect("/login");
    return user;
}