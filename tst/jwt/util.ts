import jwt, { JwtPayload } from "jsonwebtoken";
import { convertP256PublicKeyToPEM } from "../../src/jwt/convert-key";
import { TEST_CONSTANTS } from "../constants";

export function signCentral(payload: object): string {
  return jwt.sign(payload, TEST_CONSTANTS.authPrivateKey, {
    algorithm: "ES256",
    expiresIn: "1h"
  });
}

export function verifyCentral(token: string): JwtPayload | undefined {
  try {
    const result = jwt.verify(token, convertP256PublicKeyToPEM(TEST_CONSTANTS.authPublicKey), {
      algorithms: ["ES256"]
    });

    if (typeof result === "object") return result;
  } catch (e) {
    console.error(e);
  }
}

export function signSecret(payload: object): string {
  return jwt.sign(payload, TEST_CONSTANTS.rawApplicationSecret, {
    algorithm: "HS256",
    expiresIn: "1h"
  });
}

export function verifySecret(token: string): JwtPayload | undefined {
  try {
    const result = jwt.verify(token, TEST_CONSTANTS.rawApplicationSecret, {
      algorithms: ["HS256"]
    });

    if (typeof result === "object") return result;
  } catch (e) {
    console.error(e);
  }
}

export function getTestCallbackTokens() {
  const testToken = signCentral({
    iss: `${TEST_CONSTANTS.authHost}:central`,
    aud: `${TEST_CONSTANTS.authHost}:server:identity:${TEST_CONSTANTS.applicationId}`,
    sub: TEST_CONSTANTS.userId
  });

  const testState = signSecret({
    aud: `${TEST_CONSTANTS.authHost}:central:state`,
    iss: `${TEST_CONSTANTS.authHost}:server:${TEST_CONSTANTS.applicationId}`,
    callbackURL: `https://${TEST_CONSTANTS.applicationHost}/.well-known/tmpauth/callback`,
    redirectURL: `https://${TEST_CONSTANTS.applicationHost}/`
  });

  return {
    testToken,
    testState
  };
}

export function getTestTokens() {
  const testInnerToken = signCentral({
    iss: `${TEST_CONSTANTS.authHost}:central`,
    aud: `${TEST_CONSTANTS.authHost}:server:identity:${TEST_CONSTANTS.applicationId}`,
    sub: TEST_CONSTANTS.userId
  });

  const testToken = signSecret({
    token: testInnerToken,
    iss: `${TEST_CONSTANTS.authHost}:distributed:${TEST_CONSTANTS.applicationId}`,
    aud: `${TEST_CONSTANTS.authHost}:server:user_cookie:${TEST_CONSTANTS.applicationId}`
  });

  const testCentralToken = signSecret({
    token: testInnerToken,
    iss: `${TEST_CONSTANTS.authHost}:central:${TEST_CONSTANTS.applicationId}`,
    aud: `${TEST_CONSTANTS.authHost}:server:user_cookie:${TEST_CONSTANTS.applicationId}`
  });

  const testInvalidIssuerToken = signSecret({
    token: testInnerToken,
    iss: `invalid`,
    aud: `${TEST_CONSTANTS.authHost}:server:user_cookie:${TEST_CONSTANTS.applicationId}`
  });

  const testInvalidAudienceToken = signSecret({
    token: testInnerToken,
    iss: `${TEST_CONSTANTS.authHost}:distributed:${TEST_CONSTANTS.applicationId}`,
    aud: `invalid`
  });

  const testInvalidIssuerInnerToken = signSecret({
    token: signCentral({
      iss: `invalid`,
      aud: `${TEST_CONSTANTS.authHost}:server:identity:${TEST_CONSTANTS.applicationId}`,
      sub: TEST_CONSTANTS.userId
    }),
    iss: `${TEST_CONSTANTS.authHost}:distributed:${TEST_CONSTANTS.applicationId}`,
    aud: `${TEST_CONSTANTS.authHost}:server:user_cookie:${TEST_CONSTANTS.applicationId}`
  });

  const testInvalidAudienceInnerToken = signSecret({
    token: signCentral({
      iss: `${TEST_CONSTANTS.authHost}:central`,
      aud: `invalid`,
      sub: TEST_CONSTANTS.userId
    }),
    iss: `${TEST_CONSTANTS.authHost}:distributed:${TEST_CONSTANTS.applicationId}`,
    aud: `${TEST_CONSTANTS.authHost}:server:user_cookie:${TEST_CONSTANTS.applicationId}`
  });

  const testInvalidSubjectInnerToken = signSecret({
    token: signCentral({
      iss: `${TEST_CONSTANTS.authHost}:central`,
      aud: `${TEST_CONSTANTS.authHost}:server:identity:${TEST_CONSTANTS.applicationId}`
    }),
    iss: `${TEST_CONSTANTS.authHost}:distributed:${TEST_CONSTANTS.applicationId}`,
    aud: `${TEST_CONSTANTS.authHost}:server:user_cookie:${TEST_CONSTANTS.applicationId}`
  });

  const testInvalidInnerToken = signSecret({
    token: "invalid",
    iss: `${TEST_CONSTANTS.authHost}:distributed:${TEST_CONSTANTS.applicationId}`,
    aud: `${TEST_CONSTANTS.authHost}:server:user_cookie:${TEST_CONSTANTS.applicationId}`
  });

  return {
    testToken,
    testInnerToken,
    testCentralToken,
    testInvalidIssuerToken,
    testInvalidAudienceToken,
    testInvalidIssuerInnerToken,
    testInvalidAudienceInnerToken,
    testInvalidSubjectInnerToken,
    testInvalidInnerToken,
    invalidTokens: [
      "whatever",
      "adf.asdsf",
      "asdddf.sdfdfdd.sdfsdff",
      "!@#$%^&*()_+",
      "eyJhbGciOiJIUzI1NiIscCI6IkpXVCJ9.eyJpYXQiOjucHc6Y2VudHJhbCIsImF1ZCI6ImF1dGgudG1waW0ucHc6c2VydmVyOmlkZW50aXR5OjAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwIiwic3ViIjoiMDAwMDAwMDAtMDAwMC0wMDAwLTAwMDAtMDAwMDAwMDAwMDAwIn0.oqfK-9VVVlgFMFv0Fw2TWHwTXpmyKSnNtcTB-I",
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpYXQiOjEsImlzcyI6ImF1dGgudG1waW0ucHc6Y2VudHJhbCIsImF1ZCI6ImF1dGgudG1waW0ucHc6c2VydmVyOmlkZW50aXR5OjAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwIiwic3ViIjoiMDAwMDAwMDAtMDAwMC0wMDAwLTAwMDAtMDAwMDAwMDAwMDAwIn0",
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpYXQiOjEsImlzcyI6ImF1dGgudG1waW0ucHc6Y2VudHJhbCIsImF1ZCI6ImF1dGgudG1waW0ucHc6c2VydmVyOmlkZW50aXR5OjAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwIiwic3ViIjoiMDAwMDAwMDAtMDAwMC0wMDAwLTAwMDAtMDAwMDAwMDAwMDAwIn0.",
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpYXQiOjEsImlzcyI6ImF1dGgudG1waW0ucHc6Y2VudHJhbCIsImF1ZCI6ImF1dGgudG1waW0ucHc6c2VydmVyOmlkZW50aXR5OjAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwIiwic3ViIjoiMDAwMDAwMDAtMDAwMC0wMDAwLTAwMDAtMDAwMDAwMDAwMDAwIn0.zn6XEotvTO8i1NWLsabCEjvCeTO3vKp2RoeSB5qcwdo"
    ]
  }
}


