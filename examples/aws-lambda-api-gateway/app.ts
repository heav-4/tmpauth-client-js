import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { TmpauthState } from "@tmpim/tmpauth-client-js";
import { tmpauth } from "@tmpim/tmpauth-client-js/handler/api-gateway";
import { JsonWebTokenProvider } from "@tmpim/tmpauth-client-js/jwt/jsonwebtoken";
import { TmpauthDynamoDBMetadataProvider } from "@tmpim/tmpauth-client-js/metadata/dynamodb";
import { APIGatewayEvent, APIGatewayProxyResult, Context } from "aws-lambda";

// Secret is stored in process.env.TMPAUTH_SECRET
// Alternatively, you can put this in Secrets Manager or Parameter Store and use the AWS SDK to fetch it
const tmpauthHandler = tmpauth({
  jwtProvider: JsonWebTokenProvider,
  metadataProvider: new TmpauthDynamoDBMetadataProvider("tmpauth_cache", new DynamoDBClient({ region: "us-west-2" })),
});
const appHandler = async (event: APIGatewayEvent, context: Context): Promise<APIGatewayProxyResult> => {
  const state: TmpauthState = event.requestContext.authorizer!.tmpauth;

  return {
    statusCode: 200,
    body: `Hello, ${state.user!.name}!`,
    headers: {}
  };
};

export const handler = tmpauthHandler(appHandler);
