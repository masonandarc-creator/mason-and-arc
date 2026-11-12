import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { audit, requireServerUser } from "@/lib/server/auth";
import { saveGoogleMailCredential } from "@/lib/server/googleMail";
import { exchangeGoogleMailCode, GoogleMailOAuthError } from "@/lib/server/googleMailOAuth";

export const runtime = "nodejs";

function callbackUri(request: Request) {
  const origin = new URL(request.url).origin;
  const configuredUri = process.env.GOOGLE_OAUTH_REDIRECT_URI;

  return configuredUri || `${origin}/api/integrations/google-mail/callback`;
}

function settingsErrorUrl(request: Request, error: string) {
  const url = new URL("/app/admin/settings", request.url);
  url.searchParams.set("google_mail_error", error);
  return url;
}

export async function GET(request: Request) {
  try {
    const user = await requireServerUser(["Owner"]);
    const url = new URL(request.url);
    const code = url.searchParams.get("code");
    const state = url.searchParams.get("state");
    const jar = await cookies();
    const expectedState = jar.get("mason_arc_google_mail_state")?.value;
    jar.set("mason_arc_google_mail_state", "", { httpOnly: true, path: "/", maxAge: 0 });
    if (!state || !expectedState || state !== expectedState) return NextResponse.redirect(settingsErrorUrl(request, "expired"));
    if (url.searchParams.has("error")) return NextResponse.redirect(settingsErrorUrl(request, "authorization_denied"));
    if (!code) return NextResponse.redirect(settingsErrorUrl(request, "authorization_failed"));
    const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_OAUTH_CLIENT_SECRET;
    const redirectUri = callbackUri(request);
    if (!clientId || !clientSecret || !redirectUri) return NextResponse.json({ error: "Google Mail OAuth is not configured." }, { status: 503 });
    const credential = await exchangeGoogleMailCode(code, { clientId, clientSecret, redirectUri });
    await saveGoogleMailCredential(credential);
    await audit("integration.google_mail.connect", "Integration", "google-mail", { account: credential.email, actor: user.id });
    return NextResponse.redirect(new URL("/app/admin/settings?google_mail=connected", request.url));
  } catch (error) {
    if (error instanceof GoogleMailOAuthError) {
      return NextResponse.redirect(settingsErrorUrl(request, error.code));
    }
    if (error instanceof Error && (error.message === "UNAUTHENTICATED" || error.message === "FORBIDDEN")) {
      return NextResponse.json({ error: "Sign in as the studio Owner and start again from Connect Gmail." }, { status: error.message === "FORBIDDEN" ? 403 : 401 });
    }
    console.error("Google Mail connection failed", error);
    return NextResponse.json({ error: "Google Mail connection failed. Please try again." }, { status: 500 });
  }
}
