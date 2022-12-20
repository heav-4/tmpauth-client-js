import * as nodeCrypto from "crypto";
global.crypto = nodeCrypto as Crypto;
import { CloudflareWorkerJwtProvider } from '../../src/jwt/cloudflare-worker-jwt';
import { MOCK_CONFIG } from '../constants';
import { testJwtProvider } from './generic';

const provider = new CloudflareWorkerJwtProvider(MOCK_CONFIG);

testJwtProvider("CloudflareWorkerJwtProvider", provider);
