import express from "express";
import { tmpauth } from "../../src/handler/express";
import { JsonWebTokenProvider } from "../../src/jwt/jsonwebtoken";
import { TEST_CONSTANTS } from "../constants";
import { Server } from "http";
import { TestRequestOptions, verifyWebserver } from "./generic";
import { fetch } from "undici";

const app = express();

const tmpauthMiddleware = tmpauth({
  jwtProvider: JsonWebTokenProvider,
  applicationSecret: TEST_CONSTANTS.applicationSecret,
  authHost: TEST_CONSTANTS.authHost,
  authPublicKey: TEST_CONSTANTS.authPublicKey
});

app.use(tmpauthMiddleware);
app.use("/test", tmpauthMiddleware);

app.get("/", (_, res) => {
  res.send("Hello World!");
});

app.get("/test", (_, res) => {
  res.send("Hello World!");
});

let server: Server;
const hostname = "127.0.0.1";
const port = Math.floor(Math.random() * 100) + 4600;

function listen() {
  return new Promise<void>(resolve => {
    server = app.listen(port, hostname,  () => {
      resolve();
    });
  });
}

function close() {
  return new Promise<void>(resolve => {
    server.close(() => {
      resolve();
    });
  });
}

async function makeTestRequest(options: TestRequestOptions = {}): Promise<Response> {
  const headers: HeadersInit = {};

  headers.host = TEST_CONSTANTS.applicationHost;
  headers.origin = `https://${TEST_CONSTANTS.applicationHost}`;
  if (options.cookie) headers.cookie = options.cookie;
  if (options.tmpauthHeader) headers["x-tmpauth-token"] = options.tmpauthHeader;
  if (options.authorizationHeader) headers.authorization = options.authorizationHeader;

  const urlParams = options.urlParams ? ("?" + new URLSearchParams(options.urlParams).toString()) : "";

  return await fetch(`http://${hostname}:${port}${options.path || "/"}${urlParams}`, {
    headers,
    redirect: "manual"
  }) as unknown as Response;
}

describe("express", () => {
  beforeAll(listen);
  afterAll(close);

  verifyWebserver(makeTestRequest);
});
