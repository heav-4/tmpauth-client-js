import { Hono } from "hono";
import { tmpauth } from "@tmpim/tmpauth-client-js/handler/hono";
import { CloudflareWorkerJwtProvider } from "@tmpim/tmpauth-client-js/jwt/cloudflare-worker-jwt";

interface Env {
  TMPAUTH_SECRET: string;
}

const app = new Hono<{ Bindings: Env }>();

app.use("*", tmpauth({
  jwtProvider: CloudflareWorkerJwtProvider
}));

app.get("/", c => c.text("Hello World!"));

export default app;
