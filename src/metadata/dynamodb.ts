import { TmpauthMetadataProvider, WhomstUser } from "./generic";
import { TmpauthPlainMetadataProvider } from "./plain";
import { DynamoDBClient, GetItemCommand, PutItemCommand } from "@aws-sdk/client-dynamodb";
import { TmpauthConfig } from "../handler/handle";

export class TmpauthDynamoDBMetadataProvider extends TmpauthMetadataProvider {
  constructor(
    private tableName: string,
    private client: DynamoDBClient,
    private metadataProvider: TmpauthMetadataProvider = new TmpauthPlainMetadataProvider()
  ) { super(); }

  override init(config: TmpauthConfig): void {
    super.init(config);
    this.metadataProvider.init(config);
  }

  async retrieveUser(uuid: string, token: string): Promise<WhomstUser | undefined> {
    const cachedUser = await this.client.send(new GetItemCommand({
      TableName: this.tableName,
      Key: {
        uuid: { S: uuid }
      }
    }));

    if (cachedUser?.Item && parseInt(cachedUser.Item.ttl.N!!) > Math.floor(Date.now() / 1000)) {
      return JSON.parse(cachedUser.Item.user.S!!);
    }

    const user = await this.metadataProvider.retrieveUser(uuid, token);

    if (user) {
      const now = Math.floor(Date.now() / 1000);
      const itemTTL = now + 60 * 5; // 5 minutes

      await this.client.send(new PutItemCommand({
        TableName: this.tableName,
        Item: {
          uuid: { S: uuid },
          user: { S: JSON.stringify(user) },
          ttl: { N: itemTTL.toString() }
        }
      }));

      return user;
    }
  }
}
