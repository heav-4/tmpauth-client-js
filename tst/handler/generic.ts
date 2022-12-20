import { TEST_CONSTANTS } from "../constants";
import { verifyCentral, verifySecret } from "../jwt/util";

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
