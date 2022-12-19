import { TmpauthJwtPayload, TmpauthJwtProvider } from "./generic";
import jwt from "jsonwebtoken";

export class JsonWebTokenProvider extends TmpauthJwtProvider {
  init() {}

  decode(state: string): TmpauthJwtPayload | undefined {
    const decodedJwt = jwt.decode(state);

    if (!decodedJwt || typeof decodedJwt !== "object") return;
    if (Array.isArray(decodedJwt.aud)) decodedJwt.aud = decodedJwt.aud[0];

    return decodedJwt as TmpauthJwtPayload;
  }

  async signSecret(payload: TmpauthJwtPayload): Promise<string> {
    return jwt.sign(payload, this.config.applicationSecret.secret, {
      algorithm: "HS256"
    });
  }

  async verifySecret(state: string):  Promise<TmpauthJwtPayload | undefined> {
    try {
      const decodedJwt = jwt.verify(state, this.config.applicationSecret.secret, {
        algorithms: ["HS256"]
      });

      if (typeof decodedJwt !== "object") return;
      if (Array.isArray(decodedJwt.aud)) decodedJwt.aud = decodedJwt.aud[0];

      return decodedJwt as TmpauthJwtPayload;
    } catch (e) {
      return;
    }
  }

  async verifyCentral(token: string):  Promise<TmpauthJwtPayload | undefined> {
    try {
      const decodedJwt = jwt.verify(token, this.config.authPublicKey, {
        algorithms: ["ES256"]
      });

      if (typeof decodedJwt !== "object") return;
      if (Array.isArray(decodedJwt.aud)) decodedJwt.aud = decodedJwt.aud[0];

      return decodedJwt as TmpauthJwtPayload;
    } catch (e) {
      return;
    }
  }
}
