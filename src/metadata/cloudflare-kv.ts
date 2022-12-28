import { TmpauthConfig } from "../handler/handle";
import { TmpauthMetadataProvider, WhomstUser } from "./generic";
import { TmpauthPlainMetadataProvider } from "./plain";

export class TmpauthCloudflareKVMetadataProvider extends TmpauthMetadataProvider {
  private kvNamespace!: KVNamespace;

  constructor(
    private namespace: string,
    private metadataProvider: TmpauthMetadataProvider = new TmpauthPlainMetadataProvider()
  ) { super(); }

  override init(config: TmpauthConfig): void {
    super.init(config);
    this.metadataProvider.init(config);
    this.kvNamespace = (config.env as any)[this.namespace] as KVNamespace;
  }

  async retrieveUser(uuid: string, token: string): Promise<WhomstUser | undefined> {
    const cachedUser = await this.kvNamespace.get<WhomstUser>(uuid, { type: "json" });

    if (cachedUser) return cachedUser;

    const user = await this.metadataProvider.retrieveUser(uuid, token);

    if (user) {
      await this.kvNamespace.put(uuid, JSON.stringify(user), {
        expirationTtl: 60 * 5 // 5 minutes
      });

      return user;
    }
  }
}
