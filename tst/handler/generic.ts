import { TEST_CONSTANTS } from "../constants";
import { getTestCallbackTokens, getTestTokens, verifyCentral, verifySecret } from "../jwt/util";
import cookie from "cookie";

export function verifyStateToken(token: string) {
  const stateToken = verifySecret(token);

  expect(stateToken).toBeDefined();
  expect(stateToken!.aud).toBe(`${TEST_CONSTANTS.authHost}:central:state`);
  expect(stateToken!.iss).toBe(`${TEST_CONSTANTS.authHost}:server:${TEST_CONSTANTS.applicationId}`);
  expect(stateToken!.redirectURL).toBe(`https://${TEST_CONSTANTS.applicationHost}/`);
  expect(stateToken!.callbackURL).toBe(`https://${TEST_CONSTANTS.applicationHost}/.well-known/tmpauth/callback`);
}

export function verifyWrappedToken(token: string, expectedToken?: string) {
  const outerToken = verifySecret(token);

  expect(outerToken).toBeDefined();
  expect(outerToken!.aud).toBe(`${TEST_CONSTANTS.authHost}:server:user_cookie:${TEST_CONSTANTS.applicationId}`);
  expect(outerToken!.iss).toBe(`${TEST_CONSTANTS.authHost}:distributed:${TEST_CONSTANTS.applicationId}`);
  expect(outerToken!.token).toBeDefined();

  if (expectedToken) expect(outerToken!.token).toBe(expectedToken);

  const innerToken = verifyCentral(outerToken!.token);
  expect(innerToken).toBeDefined();
  expect(innerToken!.aud).toBe(`${TEST_CONSTANTS.authHost}:server:identity:${TEST_CONSTANTS.applicationId}`);
  expect(innerToken!.iss).toBe(`${TEST_CONSTANTS.authHost}:central`);
  expect(innerToken!.sub).toBe(TEST_CONSTANTS.userId);
}

export function verifyRedirectResponse(response: Response) {
  expect(response.status).toBe(302);
  expect(response.headers.get("Location")).toBeDefined();
  const redirectURL = new URL(response.headers.get("Location")!);

  expect(redirectURL.host).toBe(TEST_CONSTANTS.authHost);
  expect(redirectURL.pathname).toBe("/auth");
  expect(redirectURL.searchParams.get("client_id")).toBe(TEST_CONSTANTS.applicationId);
  expect(redirectURL.searchParams.get("method")).toBe("tmpauth");
  expect(redirectURL.searchParams.get("state")).toBeDefined();

  verifyStateToken(redirectURL.searchParams.get("state")!);
}

export interface TestRequestOptions {
  path?: string;
  tmpauthCookie?: string;
  tmpauthHeader?: string;
  authorizationHeader?: string;
  urlParams?: Record<string, string>;
}

export function verifyWebserver(makeTestRequest: (options?: TestRequestOptions) => Promise<Response>) {
  it("should redirect with no token", async () => {
    const response = await makeTestRequest();

    verifyRedirectResponse(response);
  });

  const { testToken, testCentralToken, testInvalidAudienceToken, testInvalidIssuerToken, testInvalidAudienceInnerToken, testInvalidIssuerInnerToken, testInvalidSubjectInnerToken, testInvalidInnerToken } = getTestTokens();
  const invalidTokens = ["invalid", testInvalidAudienceToken, testInvalidIssuerToken, testInvalidAudienceInnerToken, testInvalidIssuerInnerToken, testInvalidSubjectInnerToken, testInvalidInnerToken];

  for (const invalidToken of invalidTokens) {
    it(`should redirect with invalid token: ${invalidToken}`, async () => {
      const response = await makeTestRequest({
        tmpauthCookie: invalidToken
      });

      verifyRedirectResponse(response);
    });
  }

  it("should pass with cookie token", async () => {
    const response = await makeTestRequest({
      tmpauthCookie: testToken
    });

    expect(response.status).toBe(200);
  });

  it("should pass with header token", async () => {
    const response = await makeTestRequest({
      tmpauthHeader: testToken
    });

    expect(response.status).toBe(200);
  });

  it("should pass with authorization header token", async () => {
    const response = await makeTestRequest({
      authorizationHeader: `Bearer ${testToken}`
    });

    expect(response.status).toBe(200);
  });

  it("should pass with central token", async () => {
    const response = await makeTestRequest({
      tmpauthCookie: testCentralToken
    });

    expect(response.status).toBe(200);
  });

  it("should pass with double middleware", async () => {
    const response = await makeTestRequest({
      path: "/test",
      tmpauthCookie: testToken
    });

    expect(response.status).toBe(200);
  });

  const testCallback = getTestCallbackTokens();

  it("should return from callback", async () => {
    const response = await makeTestRequest({
      path: "/.well-known/tmpauth/callback",
      urlParams: {
        state: testCallback.testState,
        token: testCallback.testToken,
        error: "",
        error_description: ""
      }
    });

    expect(response.status).toBe(302);
    expect(response.headers.get("Location")).toBe(`https://${TEST_CONSTANTS.applicationHost}/`);
    expect(response.headers.get("Set-Cookie")).not.toBeNull();
    const cookieHeader = cookie.parse(response.headers.get("Set-Cookie")!);
    expect(cookieHeader.tmpauth).toBeDefined();

    verifyWrappedToken(cookieHeader.tmpauth, testCallback.testToken);
  });

  it("should return 400 from callback with no parameters", async () => {
    const response = await makeTestRequest({
      path: "/.well-known/tmpauth/callback"
    });

    expect(response.status).toBe(400);
  });

  it("should return 400 from callback with invalid state", async () => {
    const response = await makeTestRequest({
      path: "/.well-known/tmpauth/callback",
      urlParams: {
        state: "invalid",
        token: testCallback.testToken,
        error: "",
        error_description: ""
      }
    });

    expect(response.status).toBe(400);
  });

  it("should return 400 from callback with invalid token", async () => {
    const response = await makeTestRequest({
      path: "/.well-known/tmpauth/callback",
      urlParams: {
        state: testCallback.testState,
        token: "invalid",
        error: "",
        error_description: ""
      }
    });
  });


  it("should return 404 for well known path that does not exist", async () => {
    const response = await makeTestRequest({
      path: "/.well-known/tmpauth/callback2"
    });

    expect(response.status).toBe(404);
  });

  it("should return 501 for well known status", async () => {
    const response = await makeTestRequest({
      path: "/.well-known/tmpauth/status"
    });

    expect(response.status).toBe(501);
  });
}
