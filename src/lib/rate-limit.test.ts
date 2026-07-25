import { describe, expect, it } from "vitest";
import { checkRateLimit, clientKeyFromHeaders } from "./rate-limit";

describe("checkRateLimit", () => {
  it("allows requests under the limit", () => {
    const key = "test-under-limit";
    for (let i = 0; i < 20; i++) {
      expect(checkRateLimit(key)).toBe(true);
    }
  });

  it("rejects requests once the window's limit is exceeded", () => {
    const key = "test-over-limit";
    for (let i = 0; i < 20; i++) {
      checkRateLimit(key);
    }
    expect(checkRateLimit(key)).toBe(false);
  });

  it("tracks separate keys independently", () => {
    const a = "test-key-a";
    const b = "test-key-b";
    for (let i = 0; i < 20; i++) checkRateLimit(a);

    expect(checkRateLimit(a)).toBe(false);
    expect(checkRateLimit(b)).toBe(true);
  });
});

describe("clientKeyFromHeaders", () => {
  it("uses the first IP in x-forwarded-for", () => {
    const headers = new Headers({ "x-forwarded-for": "1.2.3.4, 5.6.7.8" });
    expect(clientKeyFromHeaders(headers)).toBe("1.2.3.4");
  });

  it("falls back to 'unknown' when the header is missing", () => {
    expect(clientKeyFromHeaders(new Headers())).toBe("unknown");
  });
});
