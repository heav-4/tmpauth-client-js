import "dotenv/config";
import express from "express";
import { tmpauth } from "@tmpim/tmpauth-client-js/handler/express";
import { JsonWebTokenProvider } from "@tmpim/tmpauth-client-js/jwt/jsonwebtoken";

const app = express();

// Secret is stored in process.env.TMPAUTH_SECRET
app.use(tmpauth({
  jwtProvider: JsonWebTokenProvider
}));

app.get("/", (_, res) => {
  res.send("Hello World!");
});

app.listen(3000, () => {
  console.log("Example app listening on port 3000!");
});
