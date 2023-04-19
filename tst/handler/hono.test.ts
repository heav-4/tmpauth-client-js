import * as nodeCrypto from "crypto";
global.crypto = nodeCrypto as Crypto;
import { Hono } from "hono";
import { tmpauth } from "../../src/handler/hono";
import { CloudflareWorkerJwtProvider } from "../../src/jwt/cloudflare-worker-jwt";
import { TEST_CONSTANTS } from "../constants";
import { getTestTokens } from "../jwt/util";
import { TestRequestOptions, verifyWebserver } from "./generic";
import { TmpauthMockMetadataProvider } from "../metadata/mock";
import { fetch } from "undici";

const app = new Hono();

const tmpauthMiddleware = tmpauth({
  jwtProvider: CloudflareWorkerJwtProvider,
  metadataProvider: new TmpauthMockMetadataProvider(),
  applicationSecret: TEST_CONSTANTS.applicationSecret,
  authHost: TEST_CONSTANTS.authHost,
  authPublicKey: TEST_CONSTANTS.authPublicKey,
  fetch
});

app.use("*", tmpauthMiddleware);

app.use("/test", tmpauthMiddleware);

app.get("/", c => c.text("Hello World!"));
app.get("/test", c => c.text("Hello World!"));

async function makeTestRequest(options: TestRequestOptions = {}) {
  const headers: HeadersInit = {};

  headers.host = TEST_CONSTANTS.applicationHost;
  headers.origin = `https://${TEST_CONSTANTS.applicationHost}`;
  if (options.cookie) headers.cookie = options.cookie;
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

  const { testToken } = getTestTokens();

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

  verifyWebserver(makeTestRequest, true);
});
