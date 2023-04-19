import { Hono } from "hono";
import { tmpauth } from "@tmpim/tmpauth-client-js/handler/hono";
import { CloudflareWorkerJwtProvider } from "@tmpim/tmpauth-client-js/jwt/cloudflare-worker-jwt";
import { TmpauthCloudflareKVMetadataProvider } from "@tmpim/tmpauth-client-js/metadata/cloudflare-kv";
import { TmpauthState } from "@tmpim/tmpauth-client-js";

interface Env {
  TMPAUTH_SECRET: string;
  TMPAUTH_CACHE: KVNamespace;
}

const app = new Hono<{ Bindings: Env }>();

app.use("*", tmpauth({
  jwtProvider: CloudflareWorkerJwtProvider,
  metadataProvider: new TmpauthCloudflareKVMetadataProvider("TMPAUTH_CACHE"),
  applicationHost: "localhost:8787" // Force localhost for testing, since we're not using a real domain
}));

app.get("/", c => c.text(`Hello, ${c.get<TmpauthState>("tmpauth").user!.name}!`));

export default app;
