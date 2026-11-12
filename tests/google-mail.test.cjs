const { test } = require("node:test");
const assert = require("node:assert/strict");
const { loadTs } = require("./load-ts.cjs");
const { exchangeGoogleMailCode, googleMailAuthorizationUrl, GOOGLE_MAIL_SEND_SCOPE, GOOGLE_MAIL_SCOPES } = loadTs("lib/server/googleMailOAuth.ts");
const config = { clientId: "test-client", clientSecret: "test-secret", redirectUri: "https://www.masonandarc.com/api/integrations/google-mail/callback" };
const granted = { access_token: "test-access", refresh_token: "test-refresh", scope: GOOGLE_MAIL_SCOPES };
const profile = { email: "test@example.invalid", email_verified: true, sub: "test-subject" };
function replies(token, user = profile, status = 200) {
  const calls = [];
  return { calls, fetcher: async (url, init) => {
    calls.push({ url, init });
    return Response.json(calls.length === 1 ? token : user, { status: calls.length === 1 ? status : 200 });
  } };
}
test("send-only Gmail consent uses verified OIDC identity, not mailbox read access", async () => {
  const mock = replies(granted);
  assert.deepEqual(await exchangeGoogleMailCode("test-code", config, mock.fetcher), { email: profile.email, refreshToken: granted.refresh_token });
  assert.equal(mock.calls[1].url, "https://openidconnect.googleapis.com/v1/userinfo");
  assert.equal(mock.calls[0].init.body.get("redirect_uri"), config.redirectUri);
  assert.equal(GOOGLE_MAIL_SCOPES, `openid email ${GOOGLE_MAIL_SEND_SCOPE}`);
});
test("authorization request re-prompts for consent and keeps previously granted scopes", () => {
  const url = googleMailAuthorizationUrl({
    clientId: config.clientId,
    redirectUri: config.redirectUri,
    state: "test-state",
  });
  assert.equal(url.origin, "https://accounts.google.com");
  assert.equal(url.searchParams.get("scope"), GOOGLE_MAIL_SCOPES);
  assert.equal(url.searchParams.get("access_type"), "offline");
  assert.equal(url.searchParams.get("include_granted_scopes"), "true");
  assert.equal(url.searchParams.get("prompt"), "consent select_account");
  assert.equal(url.searchParams.get("state"), "test-state");
});
test("rejects missing send permission", async () => {
  const mock = replies({ ...granted, scope: "openid email" });
  await assert.rejects(exchangeGoogleMailCode("code", config, mock.fetcher), /sending permission/);
  assert.equal(mock.calls.length, 1);
});
test("rejects missing offline refresh token", async () => {
  await assert.rejects(exchangeGoogleMailCode("code", config, replies({ ...granted, refresh_token: undefined }).fetcher), /offline access/);
});
test("rejects unverified account identity", async () => {
  await assert.rejects(exchangeGoogleMailCode("code", config, replies(granted, { ...profile, email_verified: false }).fetcher), /verify the account/);
});
test("provider errors do not leak credentials or provider response", async () => {
  await assert.rejects(exchangeGoogleMailCode("code", config, replies({ error: "secret-provider-detail" }, profile, 400).fetcher), (error) => {
    assert.match(error.message, /Start again/);
    assert.doesNotMatch(error.message, /secret/);
    return true;
  });
});
