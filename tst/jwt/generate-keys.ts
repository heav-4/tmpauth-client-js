import { promisify } from "util";
import crypto from "crypto";

const generateKeyPair = promisify(crypto.generateKeyPair);
const secureBytes = promisify(crypto.randomBytes);
const secureBase64Bytes = async (n: number): Promise<string> =>
  (await secureBytes(n)).toString("base64");

export async function generateKeys() {
  const { publicKey, privateKey } = await generateKeyPair("ec", {
    namedCurve: "prime256v1"
  });

  const pubKeyJwk = publicKey.export({ format: "jwk" });
  const pubKeyTaBuf = Buffer.concat([
    Buffer.from([0x04]), // 65-byte ECDSA uncompressed public key
    Buffer.from(pubKeyJwk.x!, "base64url"),
    Buffer.from(pubKeyJwk.y!, "base64url")
  ]);
  const tmpauthPublicKey =  pubKeyTaBuf.toString("base64");

  return {
    applicationSecret: await secureBase64Bytes(32),
    authPublicKey: tmpauthPublicKey,
    authPrivateKey: privateKey.export({ type: "pkcs8", format: "pem" })
  };
}
