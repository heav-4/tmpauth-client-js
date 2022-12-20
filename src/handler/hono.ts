import { Handler } from "hono";
import { StatusCode } from "hono/utils/http-status";
import { createConfig, handleTmpauth, TmpauthParams, TmpauthState } from "./handle";

export function tmpauth(params: TmpauthParams): Handler {
  return async (ctx, next) => {
    const authState = ctx.get<TmpauthState | undefined>("tmpauth");

    if (authState)
      return next();

    const config = createConfig({
      applicationSecret: ctx.env!!.TMPAUTH_SECRET,
      ...params
    });
    const url = new URL(ctx.req.url);
    const tmpauthResponse = await handleTmpauth({
      path: url.pathname,
      headers: ctx.req.header(),
      query: ctx.req.query()
    }, config);

    if (!tmpauthResponse.ok) {
      return ctx.body(tmpauthResponse.body, tmpauthResponse.statusCode as StatusCode, tmpauthResponse.headers);
    }

    ctx.set("tmpauth", tmpauthResponse.state);
    return next();
  };
}
