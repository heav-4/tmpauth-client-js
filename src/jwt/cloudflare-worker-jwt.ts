import { TmpauthJwtPayload, TmpauthJwtProvider } from "./generic";
import jwt, { JwtData } from "@tsndr/cloudflare-worker-jwt";
import { convertP256PublicKeyToPEM } from "./convert-key";

const combine = (data: JwtData): TmpauthJwtPayload => Object.assign({}, data.header, data.payload);

export class CloudflareWorkerJwtProvider extends TmpauthJwtProvider {
  private secret!: string;
  private authPublicKey!: string;

  init() {
    this.secret = this.config.applicationSecret.secret;
    this.authPublicKey = convertP256PublicKeyToPEM(this.config.authPublicKey);
  }

  decode(state: string): TmpauthJwtPayload | undefined {
    return combine(jwt.decode(state));
  }

  async signSecret(payload: TmpauthJwtPayload): Promise<string> {
    return await jwt.sign(payload, this.secret, {
      algorithm: "HS256"
    });
  }

  async verifySecret(state: string):  Promise<TmpauthJwtPayload | undefined> {
    try {
      const isValid = await jwt.verify(state, this.secret, {
        algorithm: "HS256"
      });

      if (!isValid) return;

      return combine(jwt.decode(state));
    } catch (err) {
      console.error("CloudflareWorkerJwtProvider.verifySecret", err);
    }
  }

  async verifyCentral(token: string):  Promise<TmpauthJwtPayload | undefined> {
    try {
      const isValid = await jwt.verify(token, this.authPublicKey, {
        algorithm: "ES256"
      });

      if (!isValid) return;

      return combine(jwt.decode(token));
    } catch (err) {
      console.error("CloudflareWorkerJwtProvider.verifyCentral", err);
    }
  }
}
