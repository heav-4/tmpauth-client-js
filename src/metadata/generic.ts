import { TmpauthConfig } from "../handler/handle";

export interface WhomstUser {
  uuid: string;
  name: string;
  [key: string]: any;
}

export abstract class TmpauthMetadataProvider {
  protected config!: TmpauthConfig;

  init(config: TmpauthConfig) {
    this.config = config;
  }

  abstract retrieveUser(uuid: string, token: string): Promise<WhomstUser | undefined>;
}
