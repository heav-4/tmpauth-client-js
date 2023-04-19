import { APIGatewayEvent, APIGatewayProxyResult, Context } from "aws-lambda";
import { tmpauth } from "../../src/handler/api-gateway";
import { JsonWebTokenProvider } from "../../src/jwt/jsonwebtoken";
import { TEST_CONSTANTS } from "../constants";
import { TestRequestOptions, verifyWebserver } from "./generic";
import { eliminateArraysAndObjects } from "../../src";

const tmpauthMiddleware = tmpauth({
  jwtProvider: JsonWebTokenProvider,
  applicationSecret: TEST_CONSTANTS.applicationSecret,
  authHost: TEST_CONSTANTS.authHost,
  authPublicKey: TEST_CONSTANTS.authPublicKey
});

const helloHandler = () => ({
  statusCode: 200,
  body: "Hello World!",
  headers: {}
});

const appHandler = async (event: APIGatewayEvent, context: Context): Promise<APIGatewayProxyResult> => {
  if (event.path === "/test") {
    return tmpauthMiddleware(helloHandler)(event, context);
  }

  return helloHandler();
}

const handler = tmpauthMiddleware(appHandler);

async function makeTestRequest(options: TestRequestOptions = {}): Promise<Response> {
  const event = {
    path: options.path || "/",
    headers: {},
    queryStringParameters: options.urlParams,
    requestContext: {}
  } as APIGatewayEvent;

  event.headers.host = TEST_CONSTANTS.applicationHost;
  event.headers.origin = `https://${TEST_CONSTANTS.applicationHost}`;
  if (options.cookie) event.headers.cookie = options.cookie;
  if (options.tmpauthHeader) event.headers["x-tmpauth-token"] = options.tmpauthHeader;
  if (options.authorizationHeader) event.headers.authorization = options.authorizationHeader;

  const context: Context = {} as any;

  const response = await handler(event, context);

  return new Response(response.body, {
    status: response.statusCode,
    headers: eliminateArraysAndObjects(response.headers!!)
  });
}

describe("api-gateway", () => {
  verifyWebserver(makeTestRequest);
});
