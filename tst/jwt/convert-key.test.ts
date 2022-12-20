import { convertP256PublicKeyToPEM } from "../../src/jwt/convert-key";
import { TEST_CONSTANTS } from "../constants";

describe("convertP256PublicKeyToPEM", () => {
  it("should convert a P-256 public key to PEM", () => {
    const output = convertP256PublicKeyToPEM(TEST_CONSTANTS.authPublicKey);

    expect(output).toBe("-----BEGIN PUBLIC KEY-----\nMFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAE936l4d6ePxTY35t48tQ+MS4X68UnIKk71/arFzxycIWbx2QnWiwfqt5tICA+v+qO6NuYT37yTV2j2OGpCxVShQ==\n-----END PUBLIC KEY-----");
  });
});
