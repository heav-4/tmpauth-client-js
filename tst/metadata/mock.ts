import { TmpauthMetadataProvider, WhomstUser } from "../../src/metadata/generic";
import { TEST_CONSTANTS } from "../constants";

export const MOCK_USER = {
  uuid: TEST_CONSTANTS.userId,
  name: TEST_CONSTANTS.userName
};

export const MOCK_TOKEN = "test";

export class TmpauthMockMetadataProvider extends TmpauthMetadataProvider {
  private static user: WhomstUser | undefined;

  retrieveUser(uuid: string, token: string): Promise<WhomstUser | undefined> {
    return Promise.resolve(TmpauthMockMetadataProvider.user);
  }

  static mockUser(user: WhomstUser | undefined) {
    this.user = user;
  }
}
