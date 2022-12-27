import { TmpauthMetadataProvider, WhomstUser } from "./generic";

export class TmpauthPlainMetadataProvider extends TmpauthMetadataProvider {
  async retrieveUser(uuid: string, token: string) {
    const params = new URLSearchParams({ token });

    try {
      const response = await this.config.fetch(`https://${this.config.authHost}/whomst/tmpauth?${params.toString()}`, {
        headers: {
          authorization: `Bearer ${this.config.applicationSecret.token}`
        }
      });

      return await response.json<WhomstUser>();
    } catch (e) {
      return void console.error("tmpauth: failed to retrieve user", e);
    }
  }
}
