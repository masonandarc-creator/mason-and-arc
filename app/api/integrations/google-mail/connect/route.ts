import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { randomUUID } from "node:crypto";
import { requireServerUser } from "@/lib/server/auth";
import { googleMailAuthorizationUrl } from "@/lib/server/googleMailOAuth";

export const runtime = "nodejs";

function callbackUri(request: Request) {
  const origin = new URL(request.url).origin;
  const configuredUri = process.env.GOOGLE_OAUTH_REDIRECT_URI;

  // Use the exact URI registered in Google Cloud in both halves of OAuth.
  return configuredUri || `${origin}/api/integrations/google-mail/callback`;
}

export async function GET(request: Request) {
  try {
    await requireServerUser(["Owner"]);
    const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID;
    const redirectUri = callbackUri(request);
    if (!clientId || !process.env.GOOGLE_OAUTH_CLIENT_SECRET || !redirectUri) return NextResponse.json({ error: "Google Mail OAuth is not configured." }, { status: 503 });
    if (new URL(request.url).origin !== new URL(redirectUri).origin) {
      return NextResponse.redirect(new URL("/app/admin/settings", redirectUri));
    }
    const state = randomUUID();
    const jar = await cookies();
    jar.set("mason_arc_google_mail_state", state, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: 600 });
    return NextResponse.redirect(
      googleMailAuthorizationUrl({ clientId, redirectUri, state }),
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not connect Google Mail.";
    return NextResponse.json({ error: message }, { status: message === "UNAUTHENTICATED" ? 401 : message === "FORBIDDEN" ? 403 : 500 });
  }
}
