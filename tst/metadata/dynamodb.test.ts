import { TmpauthDynamoDBMetadataProvider } from "../../src/metadata/dynamodb";
import { TmpauthPlainMetadataProvider } from "../../src/metadata/plain";
import { MOCK_CONFIG, TEST_CONSTANTS } from "../constants";
import { MOCK_USER, TmpauthMockMetadataProvider } from "./mock";
import { GetItemCommand, PutItemCommand } from "@aws-sdk/client-dynamodb";

const TEST_DYNAMODB_TABLE = "MOCK_DYNAMODB_TABLE";

const mockDynamoDB = {
  send: jest.fn()
};

const mockSend = (value: {} | undefined) => mockDynamoDB.send.mockResolvedValueOnce(value);

interface MockUser {
  uuid: string;
  user: {};
  ttl: number;
}
const mockUser = (user: MockUser) => mockSend({
  Item: {
    uuid: { S: user.uuid },
    user: { S: JSON.stringify(user.user) },
    ttl: { N: user.ttl.toString() }
  }
});

describe("TmpauthDynamoDBMetadataProvider", () => {
  const provider = new TmpauthDynamoDBMetadataProvider(TEST_DYNAMODB_TABLE, mockDynamoDB as any, new TmpauthMockMetadataProvider());

  provider.init({
    ...MOCK_CONFIG
  });

  beforeEach(() => {
    mockDynamoDB.send.mockClear();
    mockDynamoDB.send.mockRejectedValue(new Error("Missing mock"));
  });

  it("should retrieve user from cache", async () => {
    mockUser({
      uuid: TEST_CONSTANTS.userId,
      user: MOCK_USER,
      ttl: Math.floor(Date.now() / 1000 + 60 * 5)
    });

    const user = await provider.retrieveUser(TEST_CONSTANTS.userId, MOCK_USER.uuid);

    expect(mockDynamoDB.send.mock.calls.length).toBe(1);
    expect(mockDynamoDB.send.mock.calls[0][0]).toBeInstanceOf(GetItemCommand);
    expect(user).toEqual(MOCK_USER);
  });

  it("should retrieve user from provider", async () => {
    mockSend(undefined); // get
    mockSend(undefined); // put
    TmpauthMockMetadataProvider.mockUser(MOCK_USER);

    const user = await provider.retrieveUser(TEST_CONSTANTS.userId, MOCK_USER.uuid);

    expect(mockDynamoDB.send.mock.calls.length).toBe(2);
    expect(mockDynamoDB.send.mock.calls[0][0]).toBeInstanceOf(GetItemCommand);
    expect(mockDynamoDB.send.mock.calls[1][0]).toBeInstanceOf(PutItemCommand);
    expect(user).toEqual(MOCK_USER);
  });

  it("should retrieve user from provider when cache is expired", async () => {
    mockUser({
      uuid: TEST_CONSTANTS.userId,
      user: MOCK_USER,
      ttl: Math.floor(Date.now() / 1000 - 60 * 5)
    });
    mockSend(undefined); // put
    TmpauthMockMetadataProvider.mockUser(MOCK_USER);

    const user = await provider.retrieveUser(TEST_CONSTANTS.userId, MOCK_USER.uuid);

    expect(mockDynamoDB.send.mock.calls.length).toBe(2);
    expect(mockDynamoDB.send.mock.calls[0][0]).toBeInstanceOf(GetItemCommand);
    expect(mockDynamoDB.send.mock.calls[1][0]).toBeInstanceOf(PutItemCommand);
    expect(user).toEqual(MOCK_USER);
  });

  it("should default to plain metadata provider", async () => {
    const provider = new TmpauthDynamoDBMetadataProvider(TEST_DYNAMODB_TABLE, mockDynamoDB as any);

    provider.init({
      ...MOCK_CONFIG
    });

    expect(provider["metadataProvider"]).toBeInstanceOf(TmpauthPlainMetadataProvider);
  });
});
