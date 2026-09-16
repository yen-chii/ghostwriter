import { beforeEach, describe, expect, it, vi } from "vitest";

const create = vi.fn();
vi.mock("openai", () => ({ default: class { responses = { create }; } }));

describe("POST /api/generate", () => {
  beforeEach(() => { vi.resetModules(); create.mockReset(); delete process.env.OPENAI_API_KEY; });
  it("returns demo output for a valid request without a key", async () => {
    const { POST } = await import("./route");
    const response = await POST(new Request("http://localhost/api/generate", { method: "POST", body: JSON.stringify({ transcript: "I have a useful thought about making ideas clearer.", platform: "X" }) }));
    expect(response.status).toBe(200);
    expect((await response.json()).mode).toBe("demo");
  });
  it("rejects an invalid transcript", async () => {
    const { POST } = await import("./route");
    const response = await POST(new Request("http://localhost/api/generate", { method: "POST", body: JSON.stringify({ transcript: "no", platform: "X" }) }));
    expect(response.status).toBe(400);
  });
  it("handles malformed model output safely", async () => {
    process.env.OPENAI_API_KEY = "test-key"; create.mockResolvedValue({ output_text: "{bad json" });
    const { POST } = await import("./route");
    const response = await POST(new Request("http://localhost/api/generate", { method: "POST", body: JSON.stringify({ transcript: "A long enough thought for this API test to be valid.", platform: "X" }) }));
    expect(response.status).toBe(502);
  });
});
