import { TmpauthConfig } from "../handler/handle";

export interface WhomstUser {
  uuid: string;
  name: string;
  [key: string]: any;
}

export abstract class TmpauthMetadataProvider {
  constructor(protected config: TmpauthConfig) {}

  abstract init(): void;
  abstract retrieveUser(uuid: string, token: string): Promise<WhomstUser | undefined>;
}
