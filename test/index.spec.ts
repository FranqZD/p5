import {
	env,
	createExecutionContext,
	waitOnExecutionContext,
	SELF,
} from "cloudflare:test";
import { beforeEach, describe, it, expect } from "vitest";
import worker from "../src/index";

const IncomingRequest = Request<unknown, IncomingRequestCfProperties>;

async function resetUsers(): Promise<void> {
	await env.infra
		.prepare(
			`CREATE TABLE IF NOT EXISTS users (
				id TEXT PRIMARY KEY,
				full_name TEXT
			)`,
		)
		.run();
	await env.infra.prepare("DELETE FROM users").run();
}

async function fetchPage(): Promise<{ response: Response; text: string }> {
	const request = new IncomingRequest("http://example.com");
	const ctx = createExecutionContext();
	const response = await worker.fetch(request, env, ctx);
	await waitOnExecutionContext(ctx);
	const text = await response.text();
	return { response, text };
}

describe("Portfolio worker", () => {
	beforeEach(async () => {
		await resetUsers();
	});

	it("responds with the portfolio page when there are no users", async () => {
		const { response, text } = await fetchPage();

		expect(response.status).toBe(200);
		expect(response.headers.get("Content-Type")).toContain("text/html");
		expect(text).toContain("Luis Francisco Zarate Diaz");
		expect(text).toContain("Developer jr");
		expect(text).toContain("No hay usuarios");
	});

	it("renders each user field from D1", async () => {
		await env.infra
			.prepare("INSERT INTO users (id, full_name) VALUES (?, ?)")
			.bind("1", "Ana Lopez")
			.run();

		const { text } = await fetchPage();

		expect(text).toContain("id:");
		expect(text).toContain("1");
		expect(text).toContain("full_name:");
		expect(text).toContain("Ana Lopez");
		expect(text).not.toContain("No hay usuarios");
	});

	it("renders empty text when a user field is null", async () => {
		await env.infra
			.prepare("INSERT INTO users (id, full_name) VALUES (?, ?)")
			.bind("4", null)
			.run();

		const { text } = await fetchPage();

		expect(text).toContain("<strong>full_name:</strong> </span>");
	});

	it("escapes HTML in user values", async () => {
		await env.infra
			.prepare("INSERT INTO users (id, full_name) VALUES (?, ?)")
			.bind("2", `<b>Ana & "Luis"</b>`)
			.run();

		const { text } = await fetchPage();

		expect(text).toContain("&lt;b&gt;Ana &amp; &quot;Luis&quot;&lt;/b&gt;");
		expect(text).not.toContain(`<b>Ana & "Luis"</b>`);
	});

	it("responds with the portfolio page (integration style)", async () => {
		await env.infra
			.prepare("INSERT INTO users (id, full_name) VALUES (?, ?)")
			.bind("3", "Carlos Ruiz")
			.run();

		const response = await SELF.fetch("https://example.com");
		const text = await response.text();

		expect(response.status).toBe(200);
		expect(response.headers.get("Content-Type")).toContain("text/html");
		expect(text).toContain("Luis Francisco Zarate Diaz");
		expect(text).toContain("Developer jr");
		expect(text).toContain("Carlos Ruiz");
	});
});
