import { TmpauthConfig } from "../handler/handle";

export interface TmpauthJwtPayload {
  /** Issuer */
  iss?: string;
  /** Subject */
  sub?: string;
  /** Audience */
  aud?: string;
  /** Expiration Time */
  exp?: number;
  /** Not Before */
  nbf?: number;
  /** Issued At */
  iat?: number;
  /** JWT ID */
  jti?: string;
  [key: string]: any;
}

export abstract class TmpauthJwtProvider {
  constructor(protected config: TmpauthConfig) {}

  abstract init(): void;
  abstract signSecret(payload: TmpauthJwtPayload): Promise<string>;
  abstract verifySecret(state: string): Promise<TmpauthJwtPayload | undefined>;
  abstract verifyCentral(token: string): Promise<TmpauthJwtPayload | undefined>;
  abstract decode(state: string): TmpauthJwtPayload | undefined;
}
