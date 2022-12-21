import { createConfig, handleTmpauth, TmpauthParams } from "./handle";
import { Context, APIGatewayProxyResult, APIGatewayEvent } from "aws-lambda";

export const tmpauth = (params: TmpauthParams) => {
  return (handler: (event: APIGatewayEvent, context: Context) => Promise<APIGatewayProxyResult> | APIGatewayProxyResult) => {
    const config = createConfig({
      applicationSecret: process.env.TMPAUTH_SECRET,
      ...params
    });

    return async (event: APIGatewayEvent, context: Context): Promise<APIGatewayProxyResult> => {
      if (!event.requestContext.authorizer)
        event.requestContext.authorizer = {};
      else if (event.requestContext.authorizer.tmpauth)
        return handler(event, context);

      const tmpauthResponse = await handleTmpauth({
        path: event.path,
        headers: event.headers,
        query: event.queryStringParameters ?? {}
      }, config);

      if (!tmpauthResponse.ok) {
        return {
          statusCode: tmpauthResponse.statusCode,
          headers: tmpauthResponse.headers,
          body: tmpauthResponse.body
        };
      }

      event.requestContext.authorizer.tmpauth = tmpauthResponse.state;

      return handler(event, context);
    };
  };
};
