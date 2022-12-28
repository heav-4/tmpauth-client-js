import { TmpauthCloudflareKVMetadataProvider } from "../../src/metadata/cloudflare-kv";
import { TmpauthPlainMetadataProvider } from "../../src/metadata/plain";
import { MOCK_CONFIG, TEST_CONSTANTS } from "../constants";
import { MOCK_TOKEN, MOCK_USER, TmpauthMockMetadataProvider } from "./mock";

const TEST_KV_NAMESPACE = "TEST_KV_NAMESPACE";

const mockKv = {
  get: jest.fn(),
  put: jest.fn()
}

mockKv.put.mockResolvedValue(undefined);
const mockGet = (value: {} | undefined) => mockKv.get.mockResolvedValueOnce(value);

describe("TmpauthCloudflareKVMetadataProvider", () => {
  const provider = new TmpauthCloudflareKVMetadataProvider(TEST_KV_NAMESPACE, new TmpauthMockMetadataProvider());

  provider.init({
    ...MOCK_CONFIG,
    env: { [TEST_KV_NAMESPACE]: mockKv }
  });

  it("should retrieve user from cache", async () => {
    mockGet(MOCK_USER);

    const user = await provider.retrieveUser(TEST_CONSTANTS.userId, MOCK_TOKEN);

    expect(user).toEqual(MOCK_USER);
  });

  it("should retrieve user from provider", async () => {
    mockGet(undefined);
    TmpauthMockMetadataProvider.mockUser(MOCK_USER);

    const user = await provider.retrieveUser(TEST_CONSTANTS.userId, MOCK_TOKEN);

    expect(mockKv.put).toHaveBeenCalledWith(TEST_CONSTANTS.userId, JSON.stringify(MOCK_USER), { expirationTtl: 60 * 5 });
    expect(user).toEqual(MOCK_USER);
  });

  it("should default to plain metadata provider", async () => {
    const provider = new TmpauthCloudflareKVMetadataProvider(TEST_KV_NAMESPACE);

    provider.init({
      ...MOCK_CONFIG,
      env: { [TEST_KV_NAMESPACE]: mockKv }
    });

    expect(provider["metadataProvider"]).toBeInstanceOf(TmpauthPlainMetadataProvider);
  });
});
