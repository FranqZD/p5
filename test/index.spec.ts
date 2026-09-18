import {
	env,
	createExecutionContext,
	waitOnExecutionContext,
	SELF,
} from "cloudflare:test";
import { describe, it, expect } from "vitest";
import worker from "../src/index";

const IncomingRequest = Request<unknown, IncomingRequestCfProperties>;

describe("Portfolio worker", () => {
	it("responds with the portfolio page (unit style)", async () => {
		const request = new IncomingRequest("http://example.com");
		const ctx = createExecutionContext();
		const response = await worker.fetch(request, env, ctx);
		await waitOnExecutionContext(ctx);
		const text = await response.text();
		expect(response.headers.get("Content-Type")).toContain("text/html");
		expect(text).toContain("Luis Francisco Zarate Diaz");
		expect(text).toContain("Developer jr");
	});

	it("responds with the portfolio page (integration style)", async () => {
		const response = await SELF.fetch("https://example.com");
		const text = await response.text();
		expect(response.headers.get("Content-Type")).toContain("text/html");
		expect(text).toContain("Luis Francisco Zarate Diaz");
		expect(text).toContain("Developer jr");
	});
});
