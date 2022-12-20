import { JsonWebTokenProvider } from "../../src/jwt/jsonwebtoken";
import { MOCK_CONFIG } from "../constants";
import { testJwtProvider } from "./generic";

const provider = new JsonWebTokenProvider(MOCK_CONFIG);

testJwtProvider("JsonWebTokenProvider", provider);
