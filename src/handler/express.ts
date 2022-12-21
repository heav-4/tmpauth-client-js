import { Request, Response, NextFunction } from "express";
import { eliminateArraysAndObjects } from "../util";
import { createConfig, handleTmpauth, TmpauthParams } from "./handle";

export function tmpauth(params: TmpauthParams) {
  const config = createConfig({
    applicationSecret: process.env.TMPAUTH_SECRET,
    ...params
  });

  return async (req: Request, res: Response, next: NextFunction) => {
    const authState = res.locals.tmpauth;

    if (authState)
      return next();

    const tmpauthResponse = await handleTmpauth({
      path: req.path,
      headers: eliminateArraysAndObjects(req.headers),
      query: eliminateArraysAndObjects(req.query)
    }, config);

    if (!tmpauthResponse.ok) {
      return res
        .status(tmpauthResponse.statusCode)
        .set(tmpauthResponse.headers)
        .send(tmpauthResponse.body);
    }

    res.locals.tmpauth = tmpauthResponse.state;

    return next();
  }
}
