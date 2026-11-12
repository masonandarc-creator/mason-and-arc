export const GOOGLE_MAIL_SEND_SCOPE = "https://www.googleapis.com/auth/gmail.send";
export const GOOGLE_MAIL_SCOPES = `openid email ${GOOGLE_MAIL_SEND_SCOPE}`;

export type GoogleMailOAuthErrorCode =
  | "authorization_failed"
  | "missing_send_scope"
  | "missing_offline_access"
  | "unverified_email";

export class GoogleMailOAuthError extends Error {
  constructor(
    public readonly code: GoogleMailOAuthErrorCode,
    message: string,
  ) {
    super(message);
    this.name = "GoogleMailOAuthError";
  }
}

type OAuthConfig = { clientId: string; clientSecret: string; redirectUri: string };

export function googleMailAuthorizationUrl({
  clientId,
  redirectUri,
  state,
}: {
  clientId: string;
  redirectUri: string;
  state: string;
}) {
  const url = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  url.search = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    access_type: "offline",
    include_granted_scopes: "true",
    prompt: "consent select_account",
    scope: GOOGLE_MAIL_SCOPES,
    state,
  }).toString();
  return url;
}

// Read the verified address through OpenID Connect. Gmail's getProfile endpoint
// requires mailbox access, which a send-only integration does not request.
export async function exchangeGoogleMailCode(
  code: string,
  config: OAuthConfig,
  fetcher: typeof fetch = fetch,
) {
  const tokenResponse = await fetcher("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: config.clientId,
      client_secret: config.clientSecret,
      redirect_uri: config.redirectUri,
      grant_type: "authorization_code",
    }),
    cache: "no-store",
    signal: AbortSignal.timeout(15000),
  });
  const token = await tokenResponse.json().catch(() => ({})) as {
    access_token?: string; refresh_token?: string; scope?: string;
  };
  if (!tokenResponse.ok || !token.access_token) {
    throw new GoogleMailOAuthError(
      "authorization_failed",
      "Google authorization could not be completed. Start again from Connect Gmail.",
    );
  }
  if (!token.scope?.split(/\s+/).includes(GOOGLE_MAIL_SEND_SCOPE)) {
    throw new GoogleMailOAuthError(
      "missing_send_scope",
      "Gmail sending permission was not granted. Reconnect and allow sending email.",
    );
  }
  if (!token.refresh_token) {
    throw new GoogleMailOAuthError(
      "missing_offline_access",
      "Google did not grant offline access. Start again from Connect Gmail.",
    );
  }
  const profileResponse = await fetcher("https://openidconnect.googleapis.com/v1/userinfo", {
    headers: { Authorization: `Bearer ${token.access_token}` },
    cache: "no-store",
    signal: AbortSignal.timeout(15000),
  });
  const profile = await profileResponse.json().catch(() => ({})) as {
    email?: string; email_verified?: boolean; sub?: string;
  };
  if (!profileResponse.ok || typeof profile.email !== "string" ||
      !profile.email || profile.email_verified !== true || !profile.sub) {
    throw new GoogleMailOAuthError(
      "unverified_email",
      "Google could not verify the account email. Reconnect and allow access to your email address.",
    );
  }
  return { refreshToken: token.refresh_token, email: profile.email };
}
