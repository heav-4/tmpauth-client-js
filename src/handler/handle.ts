import { TmpauthJwtPayload, TmpauthJwtProvider } from "../jwt/generic";
import cookie from "cookie";
import { TmpauthMetadataProvider, WhomstUser } from "../metadata/generic";
import type { fetch as DOMFetch } from "undici";

export interface TmpauthParams {
  jwtProvider: { new (config: TmpauthConfig): TmpauthJwtProvider };
  metadataProvider?: TmpauthMetadataProvider;
  applicationHost?: string;
  applicationSecret?: string;
  authHost?: string;
  authPublicKey?: string;
  fetch?: typeof DOMFetch;
}

export interface TmpauthState {
  token: TmpauthJwtPayload;
  user?: WhomstUser;
}

export interface TmpauthSuccessResponse {
  ok: true;
  state: TmpauthState;
}

export interface TmpauthRejectResponse {
  ok: false;
  statusCode: number;
  headers: { [key: string]: string };
  body: string;
}

export type TmpauthResponse = TmpauthSuccessResponse | TmpauthRejectResponse;

export interface TmpauthConfig {
  applicationSecret: TmpauthApplicationSecret;
  applicationHost?: string;
  jwtProvider: TmpauthJwtProvider;
  metadataProvider?: TmpauthMetadataProvider;
  env: {};
  authHost: string;
  authPublicKey: string;
  fetch: typeof fetch;
}

export interface TmpauthApplicationSecret {
  secret: string;
  clientId: string;
  token: string;
}

export interface TmpauthRequest {
  path: string;
  headers: { [key: string]: string | undefined };
  query: { [key: string]: string | undefined };
}

const TMPAUTH_PREFIX = "/.well-known/tmpauth/";
const BEARER_PREFIX = "Bearer ";

export async function handleTmpauth(
  req: TmpauthRequest,
  config: TmpauthConfig
): Promise<TmpauthResponse> {
  const path = req.path;

  if (path.startsWith(TMPAUTH_PREFIX)) {
    switch (path.substring(TMPAUTH_PREFIX.length)) {
      case "callback":
        return authCallback(req, config);
      case "status":
        return {
          ok: false,
          headers: {},
          statusCode: 501,
          body: "tmpauth: status not implemented"
        };
      default:
        return {
          ok: false,
          headers: {},
          statusCode: 404,
          body: "tmpauth: no found"
        }
    }
  }

  const cookieToken = cookie.parse(req.headers.cookie || "").tmpauth as string | undefined;
  const xTmpauthHeader = req.headers["x-tmpauth-token"];
  const authHeader = req.headers.authorization?.startsWith(BEARER_PREFIX) ? req.headers.authorization.slice(BEARER_PREFIX.length) : undefined;

  const token = cookieToken || xTmpauthHeader || authHeader;

  if (!token) {
    return startAuth(req, config);
  }

  const authState = await validateToken(token, config);

  if (!authState) {
    return startAuth(req, config);
  }

  if (config.metadataProvider) {
    const whomstUser = await config.metadataProvider.retrieveUser(authState.payload.sub!, authState.token);

    if (whomstUser) {
      return {
        ok: true,
        state: {
          token: authState.payload,
          user: whomstUser
        }
      }
    } else {
      return {
        ok: false,
        headers: {},
        statusCode: 403,
        body: "tmpauth: forbidden"
      }
    }
  } else {
    return {
      ok: true,
      state: {
        token: authState
      }
    };
  }
}

export function createConfig(params: TmpauthParams, env: {} = {}): TmpauthConfig {
  const config = {
    applicationHost: params.applicationHost,
    metadataProvider: params.metadataProvider,
    authHost: params.authHost || "auth.tmpim.pw",
    authPublicKey: params.authPublicKey || "BN/PHEYgs0meH878gqpWl81WD3zEJ+ubih3RVYwFxaYXxHF+5tgDaJ/M++CRjur8vtXxoJnPETM8WRIc3CO0LyM=",
    fetch: params.fetch || fetch.bind(globalThis),
    env
  } as TmpauthConfig;

  if (!params.applicationSecret) throw new Error("Missing application secret");

  config.jwtProvider = new params.jwtProvider(config);
  const appToken = config.jwtProvider.decode(params.applicationSecret);
  if (!appToken || !appToken.sub) {
    throw new Error("Invalid application secret");
  }
  config.applicationSecret = {
    secret: appToken.secret,
    clientId: appToken.sub,
    token: params.applicationSecret
  };
  config.jwtProvider.init();

  if (config.metadataProvider) {
    config.metadataProvider.init(config);
  }

  return config;
}

async function startAuth(
  req: TmpauthRequest,
  config: TmpauthConfig
): Promise<TmpauthResponse> {
  const now = Math.floor(Date.now() / 1000);
  const host = config.applicationHost || req.headers.host;

  const token = await config.jwtProvider.signSecret({
    callbackURL: "https://" + host + TMPAUTH_PREFIX + "callback",
    redirectURL: "https://" + host + req.path + new URLSearchParams(req.query as Record<string, string>).toString(),
    exp: now + 300,
    nbf: now,
    iat: now,
    iss: `${config.authHost}:server:${config.applicationSecret.clientId}`,
    aud: `${config.authHost}:central:state`
  });

  const queryParams = {
    state: token,
    client_id: config.applicationSecret.clientId,
    method: "tmpauth"
  };

  return {
    ok: false,
    statusCode: 302,
    headers: {
      location: new URL("/auth", `https://${config.authHost}`) + "?" + new URLSearchParams(queryParams).toString(),
    },
    body: "tmpauth: redirect to login"
  };
}

async function validateToken(
  tokenStr: string,
  config: TmpauthConfig
) {
  const host = config.authHost;
  const clientId = config.applicationSecret.clientId;

  const state = await config.jwtProvider.verifySecret(tokenStr);
  if (!state) return;
  if (state.aud !== `${host}:server:user_cookie:${clientId}`) return void console.error("tmpauth: invalid state aud");
  if (state.iss !== `${host}:central:${clientId}`
   && state.iss !== `${host}:distributed:${clientId}`) return void console.error("tmpauth: invalid state iss");

  const token = await config.jwtProvider.verifyCentral(state.token);
  if (!token) return;
  if (token.aud !== `${host}:server:identity:${clientId}`) return void console.error("tmpauth: invalid token aud");
  if (token.iss !== `${host}:central`) return void console.error("tmpauth: invalid token iss");
  if (!token.sub) return void console.error("tmpauth: invalid token sub");

  return { payload: token, token: state.token };
}

async function authCallback(
  req: TmpauthRequest,
  config: TmpauthConfig
): Promise<TmpauthResponse> {
  const { state: stateStr, token: tokenStr } = req.query;

  if (!stateStr || !tokenStr) {
    return {
      ok: false,
      statusCode: 400,
      headers: {},
      body: "tmpauth: missing state or token"
    };
  }

  const state = await config.jwtProvider.verifySecret(stateStr);
  if (!state) {
    return {
      ok: false,
      statusCode: 400,
      headers: {},
      body: "tmpauth: invalid state"
    };
  }

  const token = await config.jwtProvider.verifyCentral(tokenStr);
  if (!token) {
    return {
      ok: false,
      statusCode: 400,
      headers: {},
      body: "tmpauth: invalid token"
    };
  }

  const wrappedToken = await config.jwtProvider.signSecret({
    token: tokenStr,
    exp: token.exp,
    iss: `${config.authHost}:distributed:${config.applicationSecret.clientId}`,
    aud: `${config.authHost}:server:user_cookie:${config.applicationSecret.clientId}`
  });

  return {
    ok: false,
    statusCode: 302,
    headers: {
      location: state.redirectURL,
      "set-cookie": cookie.serialize("tmpauth", wrappedToken, {
        maxAge: (token.exp as number) - Date.now() / 1000,
        path: "/",
        httpOnly: true,
        secure: true,
        sameSite: "lax"
      })
    },
    body: "tmpauth: redirect to app"
  };
}
