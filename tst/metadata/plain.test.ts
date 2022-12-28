import { MOCK_CONFIG } from "../constants";
import { TmpauthPlainMetadataProvider } from "../../src/metadata/plain";
import { WhomstUser } from "../../src";
import { MOCK_TOKEN, MOCK_USER } from "./mock";

const fetch = jest.fn();

const mockUser = (user: WhomstUser | undefined) => {
  fetch.mockResolvedValueOnce({
    json: () => Promise.resolve<WhomstUser>(MOCK_USER)
  });
};

const mockThrow = () => {
  fetch.mockRejectedValueOnce(new Error("test"));
};

const mockInvalidBody = () => {
  fetch.mockResolvedValueOnce({
    json: () => Promise.reject(new Error("test"))
  });
};

describe("TmpauthPlainMetadataProvider", () => {
  const provider = new TmpauthPlainMetadataProvider();

  it("should init successfully", () => {
    expect(provider.init({
      ...MOCK_CONFIG,
      fetch
    })).toBeUndefined();
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
