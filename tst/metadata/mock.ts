import { TmpauthMetadataProvider, WhomstUser } from "../../src/metadata/generic";

export class TmpauthMockMetadataProvider extends TmpauthMetadataProvider {
  private static user: WhomstUser | undefined;

  retrieveUser(uuid: string, token: string): Promise<WhomstUser | undefined> {
    return Promise.resolve(TmpauthMockMetadataProvider.user);
  }

  static mockUser(user: WhomstUser | undefined) {
    this.user = user;
  }
}
