import { NextRequest, NextResponse } from "next/server";
import { verifySessionToken, SESSION_COOKIE } from "@/lib/session-token";

export async function proxy(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const session = token ? await verifySessionToken(token) : null;

  if (!session) {
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  const path = request.nextUrl.pathname;
  if (path.startsWith("/teacher") && session.role !== "TEACHER") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }
  if ((path.startsWith("/dashboard") || path.startsWith("/exam")) && session.role !== "STUDENT") {
    return NextResponse.redirect(new URL("/teacher", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/teacher/:path*", "/exam/:path*"],
};
