import { eliminateArraysAndObjects } from "../src";

describe("eliminateArraysAndObjects", () => {
  it("should eliminate arrays and objects", () => {
    const headers = {
      "x-forwarded-for": ["127.0.0.1", "10.0.0.1"],
      "x-forwarded-proto": "https",
      "x-forwarded-host": "example.com",
      wtf: {
        is: "this"
      }
    };

    const result = eliminateArraysAndObjects(headers);

    expect(result).toEqual({
      "x-forwarded-for": "127.0.0.1",
      "x-forwarded-proto": "https",
      "x-forwarded-host": "example.com"
    });
  });
});
