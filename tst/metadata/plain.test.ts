import { MOCK_CONFIG, TEST_CONSTANTS } from "../constants";
import { TmpauthPlainMetadataProvider } from "../../src/metadata/plain";
import { WhomstUser } from "../../src";

const fetch = jest.fn();

const mockUser = (user: WhomstUser | undefined) => {
  fetch.mockResolvedValue({
    json: () => Promise.resolve<WhomstUser>({
      uuid: TEST_CONSTANTS.userId,
      name: TEST_CONSTANTS.userName
    })
  });
};

const mockThrow = () => {
  fetch.mockRejectedValue(new Error("test"));
};

const mockInvalidBody = () => {
  fetch.mockResolvedValue({
    json: () => Promise.reject(new Error("test"))
  });
};

const MOCK_USER = {
  uuid: TEST_CONSTANTS.userId,
  name: TEST_CONSTANTS.userName
};

const MOCK_TOKEN = "test";

describe("TmpauthPlainMetadataProvider", () => {
  const provider = new TmpauthPlainMetadataProvider({
    ...MOCK_CONFIG,
    fetch
  });

  it("should init successfully", () => {
    expect(provider.init()).toBeUndefined();
  });

  it("should retrieve a user", async () => {
    mockUser(MOCK_USER);

    const user = await provider.retrieveUser(MOCK_USER.uuid, MOCK_TOKEN);

    expect(user).toEqual(MOCK_USER);
  });

  it("should return undefined on response rejection", async () => {
    mockThrow();

    const user = await provider.retrieveUser(MOCK_USER.uuid, MOCK_TOKEN);

    expect(user).toBeUndefined();
  });

  it("should return undefined on invalid body", async () => {
    mockInvalidBody();

    const user = await provider.retrieveUser(MOCK_USER.uuid, MOCK_TOKEN);

    expect(user).toBeUndefined();
  });
});
