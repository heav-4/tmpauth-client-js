import type {Config} from "jest";

const config: Config = {
  preset: "ts-jest",
  testEnvironment: "node",
  verbose: true,
  coveragePathIgnorePatterns: [ "<rootDir>/tst/"],
  testMatch: ["<rootDir>/tst/**/*.test.ts"]
};

export default config;
