import * as nodeCrypto from "crypto";
global.crypto = nodeCrypto as Crypto;
import { Hono } from "hono";
import { tmpauth } from "../../src/handler/hono";
import { CloudflareWorkerJwtProvider } from "../../src/jwt/cloudflare-worker-jwt";
import { TEST_CONSTANTS } from "../constants";
import { getTestCallbackTokens, getTestTokens } from "../jwt/util";
import * as cookie from "cookie";
import { verifyRedirectResponse, verifyStateToken, verifyWrappedToken } from "./generic";

const app = new Hono();

const tmpauthMiddleware = tmpauth({
  jwtProvider: CloudflareWorkerJwtProvider,
  applicationSecret: TEST_CONSTANTS.applicationSecret,
  authHost: TEST_CONSTANTS.authHost,
  authPublicKey: TEST_CONSTANTS.authPublicKey
});

app.use("*", tmpauthMiddleware);

app.use("/test", tmpauthMiddleware);

app.get("/", c => c.text("Hello World!"));
app.get("/test", c => c.text("Hello World!"));

interface TestRequestOptions {
  path?: string;
  tmpauthCookie?: string;
  tmpauthHeader?: string;
  authorizationHeader?: string;
  urlParams?: Record<string, string>;
}

async function makeTestRequest(options: TestRequestOptions = {}) {
  const headers: HeadersInit = {};

  headers.host = TEST_CONSTANTS.applicationHost;
  headers.origin = `https://${TEST_CONSTANTS.applicationHost}`;
  if (options.tmpauthCookie) headers.cookie = cookie.serialize("tmpauth", options.tmpauthCookie);
  if (options.tmpauthHeader) headers["x-tmpauth-token"] = options.tmpauthHeader;
  if (options.authorizationHeader) headers.authorization = options.authorizationHeader;

  const urlParams = options.urlParams ? ("?" + new URLSearchParams(options.urlParams).toString()) : "";

  return await app.request(
    `https://${TEST_CONSTANTS.applicationHost}${options.path || "/"}${urlParams}`,
    {
      headers
    }
  );
}

describe("hono", () => {
  const invalidApplicationSecrets = [undefined, "", "invalid", TEST_CONSTANTS.invalidApplicationSecret];
  for (const invalidSecret of invalidApplicationSecrets) {
    it(`should error with invalid application secret: ${invalidSecret}`, async () => {
      const newApp = new Hono();

      newApp.use("*", tmpauth({
        applicationSecret: invalidSecret,
        jwtProvider: CloudflareWorkerJwtProvider
      }));

      newApp.get("/", c => c.text("Hello World!"));

      const response = await newApp.request(`https://${TEST_CONSTANTS.applicationHost}/`);

      expect(response.status).toBe(500);
    });
  }

  it("should redirect with no token", async () => {
    const response = await makeTestRequest();

    verifyRedirectResponse(response);
  });

  const { testToken, testCentralToken, testInvalidAudienceToken, testInvalidIssuerToken, testInvalidAudienceInnerToken, testInvalidIssuerInnerToken, testInvalidSubjectInnerToken, testInvalidInnerToken } = getTestTokens();
  const invalidTokens = ["invalid", testInvalidAudienceToken, testInvalidIssuerToken, testInvalidAudienceInnerToken, testInvalidIssuerInnerToken, testInvalidSubjectInnerToken, testInvalidInnerToken];

  it("should use application secret from env", async () => {
    const newApp = new Hono();

    newApp.use("*", tmpauth({
      jwtProvider: CloudflareWorkerJwtProvider,
      authHost: TEST_CONSTANTS.authHost,
      authPublicKey: TEST_CONSTANTS.authPublicKey
    }));

    newApp.get("/", c => c.text("Hello World!"));

    const response = await newApp.fetch(new Request(`https://${TEST_CONSTANTS.applicationHost}/`, {
      headers: {
        "x-tmpauth-token": testToken
      }
    }), {
      TMPAUTH_SECRET: TEST_CONSTANTS.applicationSecret
    });

    expect(response.status).toBe(200);
  });

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
});
