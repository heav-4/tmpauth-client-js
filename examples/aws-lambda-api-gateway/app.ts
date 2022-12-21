import { tmpauth } from "@tmpim/tmpauth-client-js/handler/api-gateway";
import { JsonWebTokenProvider } from "@tmpim/tmpauth-client-js/jwt/jsonwebtoken";
import { APIGatewayEvent, APIGatewayProxyResult, Context } from "aws-lambda";

// Secret is stored in process.env.TMPAUTH_SECRET
// Alternatively, you can put this in Secrets Manager or Parameter Store and use the AWS SDK to fetch it
const tmpauthHandler = tmpauth({
  jwtProvider: JsonWebTokenProvider
});

const appHandler = async (event: APIGatewayEvent, context: Context): Promise<APIGatewayProxyResult> => {
  return {
    statusCode: 200,
    body: "Hello World!",
    headers: {}
  };
};

export const handler = tmpauthHandler(appHandler);
