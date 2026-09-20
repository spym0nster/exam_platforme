import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  SESSION_COOKIE,
  SessionPayload,
  createSessionToken,
  verifySessionToken,
} from "@/lib/session-token";

export { SESSION_COOKIE, verifySessionToken };
export type { SessionPayload };

export async function getSession(): Promise<SessionPayload | null> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return verifySessionToken(token);
}

export async function setSessionCookie(payload: SessionPayload) {
  const token = await createSessionToken(payload);
  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 8,
  });
}

export async function clearSessionCookie() {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}

export async function requireUser(role?: "STUDENT" | "TEACHER"): Promise<SessionPayload> {
  const session = await getSession();
  if (!session) redirect("/login");
  if (role && session.role !== role) {
    redirect(session.role === "TEACHER" ? "/teacher" : "/dashboard");
  }
  return session;
}
