import { TmpauthJwtPayload, TmpauthJwtProvider } from "./generic";
import jwt from "jsonwebtoken";
import { convertP256PublicKeyToPEM } from "./convert-key";

export class JsonWebTokenProvider extends TmpauthJwtProvider {
  private applicationSecret!: string;
  private authPublicKey!: string;

  init() {
    this.applicationSecret = this.config.applicationSecret.secret;
    this.authPublicKey = convertP256PublicKeyToPEM(this.config.authPublicKey);
  }

  decode(state: string): TmpauthJwtPayload | undefined {
    const decodedJwt = jwt.decode(state);

    return decodedJwt as TmpauthJwtPayload;
  }

  async signSecret(payload: TmpauthJwtPayload): Promise<string> {
    return jwt.sign(payload, this.applicationSecret, {
      algorithm: "HS256"
    });
  }

  async verifySecret(state: string):  Promise<TmpauthJwtPayload | undefined> {
    try {
      const decodedJwt = jwt.verify(state, this.applicationSecret, {
        algorithms: ["HS256"]
      });

      return decodedJwt as TmpauthJwtPayload;
    } catch (e) {
      return;
    }
  }

  async verifyCentral(token: string):  Promise<TmpauthJwtPayload | undefined> {
    try {
      const decodedJwt = jwt.verify(token, this.authPublicKey, {
        algorithms: ["ES256"]
      });

      return decodedJwt as TmpauthJwtPayload;
    } catch (e) {
      return;
    }
  }
}
