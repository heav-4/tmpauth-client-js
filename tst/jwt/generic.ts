import { TmpauthJwtProvider } from "../../src";
import { TEST_CONSTANTS } from "../constants";
import { getTestTokens, verifySecret } from "./util";

export function testJwtProvider(name: string, provider: TmpauthJwtProvider) {
  describe(name, () => {
    provider.init();
    const testTokens = getTestTokens();

    it("should be able to decode an outer token", () => {
      const decoded = provider.decode(testTokens.testToken);

      expect(decoded).toBeDefined();
      expect(decoded!.iss).toBe(`${TEST_CONSTANTS.authHost}:distributed:${TEST_CONSTANTS.applicationId}`);
      expect(decoded!.aud).toBe(`${TEST_CONSTANTS.authHost}:server:user_cookie:${TEST_CONSTANTS.applicationId}`);
    });

    it("should be able to decode an inner token", () => {
      const decoded = provider.decode(testTokens.testInnerToken);

      expect(decoded).toBeDefined();
      expect(decoded!.iss).toBe(`${TEST_CONSTANTS.authHost}:central`);
      expect(decoded!.aud).toBe(`${TEST_CONSTANTS.authHost}:server:identity:${TEST_CONSTANTS.applicationId}`);
    });

    it("should be able to verify an outer token", async () => {
      const verified = await provider.verifySecret(testTokens.testToken);

      expect(verified).toBeDefined();
      expect(verified!.iss).toBe(`${TEST_CONSTANTS.authHost}:distributed:${TEST_CONSTANTS.applicationId}`);
      expect(verified!.aud).toBe(`${TEST_CONSTANTS.authHost}:server:user_cookie:${TEST_CONSTANTS.applicationId}`);
    });

    it("should be able to verify an inner token", async () => {
      const verified = await provider.verifyCentral(testTokens.testInnerToken);

      expect(verified).toBeDefined();
      expect(verified!.iss).toBe(`${TEST_CONSTANTS.authHost}:central`);
      expect(verified!.aud).toBe(`${TEST_CONSTANTS.authHost}:server:identity:${TEST_CONSTANTS.applicationId}`);
    });

    it("should be able to sign a secret token", async () => {
      const token = await provider.signSecret({
        iss: "test",
        aud: "test",
        sub: "test"
      });

      expect(token).toBeDefined();
      const verifiedToken = verifySecret(token);

      expect(verifiedToken).toBeDefined();
      expect(verifiedToken!.iss).toBe("test");
      expect(verifiedToken!.aud).toBe("test");
      expect(verifiedToken!.sub).toBe("test");
    });

    for (const invalidToken of testTokens.invalidTokens) {
      it(`should not be able to verify an invalid secret token: ${invalidToken}`, async () => {
        const verified = await provider.verifySecret(invalidToken);

        expect(verified).toBeUndefined();
      });

      it(`should not be able to verify an invalid central token: ${invalidToken}`, async () => {
        const verified = await provider.verifyCentral(invalidToken);

        expect(verified).toBeUndefined();
      });
    }
  });
}
