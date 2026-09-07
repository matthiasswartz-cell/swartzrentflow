import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import type { NextFetchEvent, NextRequest } from "next/server";
import { authConfigurationIssue } from "./lib/auth-configuration";

const isProtectedPage = createRouteMatcher(["/dashboard(.*)", "/onboarding(.*)"]);
const handler = clerkMiddleware((auth, req) => {
  if (req.nextUrl.pathname === "/api/health") return NextResponse.next();
  const session = auth();
  if (req.nextUrl.pathname === "/api" || req.nextUrl.pathname.startsWith("/api/")) {
    if (!session.userId) return NextResponse.json({ error: "Please sign in before continuing.", code: "UNAUTHENTICATED" }, { status: 401, headers: { "Cache-Control": "no-store" } });
  } else if (isProtectedPage(req) && !session.userId) {
    return session.redirectToSignIn({ returnBackUrl: req.url });
  }
  return NextResponse.next();
}, { signInUrl: "/sign-in", signUpUrl: "/sign-up" });

export default function middleware(req: NextRequest, event: NextFetchEvent) {
  // Fail closed before malformed credentials cause Clerk handshake loops.
  const issue = authConfigurationIssue(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY, process.env.CLERK_SECRET_KEY);
  if (issue) {
    if (req.nextUrl.pathname === "/api" || req.nextUrl.pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Sign-in is temporarily unavailable. The administrator must complete the server authentication configuration.", code: "AUTH_CONFIGURATION_REQUIRED" }, { status: 503, headers: { "Cache-Control": "no-store" } });
    }
    return new NextResponse('<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>RentFlow Pro — Setup needs attention</title></head><body style="margin:0;background:#04060b;color:#f8fafc;font-family:system-ui,sans-serif;min-height:100vh;display:grid;place-items:center"><main style="max-width:560px;padding:32px"><p style="color:#a5b4fc;font-weight:700">RENTFLOW PRO</p><h1>Authentication setup needs attention</h1><p>The website is running, but its server authentication configuration is incomplete. Sign-in and store creation are paused to protect account data.</p><p>The administrator needs to correct the saved Clerk server credential and deploy the change. Refreshing or creating another account will not fix this.</p><p style="color:#94a3b8">No passwords or API keys should be entered on this page.</p></main></body></html>', { status: 503, headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store", "X-Robots-Tag": "noindex", "X-Content-Type-Options": "nosniff" } });
  }
  return handler(req, event);
}

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)", "/__clerk/:path*"],
};
