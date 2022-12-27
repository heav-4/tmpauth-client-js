import { TmpauthConfig } from "../src";

export const TEST_CONSTANTS = {
  applicationHost: "example.com",
  applicationId: "00000000000000000000000000000000",
  applicationSecret: "eyJhbGciOiJFUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiJhdXRoLnRtcGltLnB3OnNlcnZlcjprZXk6MDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAiLCJpc3MiOiJhdXRoLnRtcGltLnB3OmNlbnRyYWwiLCJzZWNyZXQiOiJMbVpPU3ZoeEZDZXJZRExSZlRqZHJIL1FqMkFONkM2ZnorajlZcDJkbEJVPSIsInN1YiI6IjAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwIiwiaWF0IjoxNjcxNTA3OTUxLCJleHAiOjE2NzE1MTE1NTF9.nywsKEdUPT4x90llNxqYryCcOg-JbCOFjSxtWDLjAMYr5U1GTNeIKVjJ68Gh3HKlVAAosOBwDhbcJASh3K1zoQ",
  invalidApplicationSecret: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiJhdXRoLnRtcGltLnB3OnNlcnZlcjprZXk6MDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAiLCJpc3MiOiJhdXRoLnRtcGltLnB3OmNlbnRyYWwiLCJzZWNyZXQiOiJMbVpPU3ZoeEZDZXJZRExSZlRqZHJIL1FqMkFONkM2ZnorajlZcDJkbEJVPSIsImlhdCI6MTY3MTUwNzk1MSwiZXhwIjoxNjcxNTExNTUxfQ.c2kWQUUxmm_rT2v3mL3YvRr7jqh5YBOVPJE5n-DBu1o",
  rawApplicationSecret: "LmZOSvhxFCerYDLRfTjdrH/Qj2AN6C6fz+j9Yp2dlBU=",
  authHost: "auth.tmpim.pw",
  authPublicKey: "BPd+peHenj8U2N+bePLUPjEuF+vFJyCpO9f2qxc8cnCFm8dkJ1osH6rebSAgPr/qjujbmE9+8k1do9jhqQsVUoU=",
  authPrivateKey: "-----BEGIN PRIVATE KEY-----\n" +
    "MIGHAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBG0wawIBAQQgIT5uge8UPZucCz/w\n" +
    "RyFcxZ/HMWrZJMRtKspeEQ3jffGhRANCAAT3fqXh3p4/FNjfm3jy1D4xLhfrxScg\n" +
    "qTvX9qsXPHJwhZvHZCdaLB+q3m0gID6/6o7o25hPfvJNXaPY4akLFVKF\n" +
    "-----END PRIVATE KEY-----\n",
  userId: "00000000-0000-0000-0000-000000000000",
  userName: "TestUser",
}

export const MOCK_CONFIG = {
  applicationSecret: {
    applicationId: TEST_CONSTANTS.applicationId,
    secret: TEST_CONSTANTS.rawApplicationSecret
  },
  authPublicKey: TEST_CONSTANTS.authPublicKey,
  authHost: TEST_CONSTANTS.authHost,
} as unknown as TmpauthConfig;
