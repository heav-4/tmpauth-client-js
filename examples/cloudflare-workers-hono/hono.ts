import { Hono } from "hono";
import { tmpauth } from "@tmpim/tmpauth-client-js/handler/hono";
import { CloudflareWorkerJwtProvider } from "@tmpim/tmpauth-client-js/jwt/cloudflare-worker-jwt";
import { TmpauthPlainMetadataProvider } from "@tmpim/tmpauth-client-js/metadata/plain";
import { TmpauthState } from "@tmpim/tmpauth-client-js";

interface Env {
  TMPAUTH_SECRET: string;
}

const app = new Hono<{ Bindings: Env }>();

app.use("*", tmpauth({
  jwtProvider: CloudflareWorkerJwtProvider,
  metadataProvider: TmpauthPlainMetadataProvider,
}));

app.get("/", c => c.text(`Hello, ${c.get<TmpauthState>("tmpauth").user!.name}!`));

export default app;
