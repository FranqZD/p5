import { env, SELF } from "cloudflare:test";
import { beforeEach, describe, expect, it } from "vitest";

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

async function openPortfolio(): Promise<{ response: Response; text: string }> {
	const response = await SELF.fetch("https://example.com");
	const text = await response.text();
	return { response, text };
}

describe("UAT", () => {
	beforeEach(async () => {
		await resetUsers();
	});

	it("abre el portafolio con el nombre y el rol", async () => {
		const { response, text } = await openPortfolio();

		expect(response.status).toBe(200);
		expect(response.headers.get("Content-Type")).toContain("text/html");
		expect(text).toContain("Luis Francisco Zarate Diaz");
		expect(text).toContain("Developer jr");
	});

	it("informa cuando no hay usuarios registrados", async () => {
		const { text } = await openPortfolio();

		expect(text).toContain("No hay usuarios");
	});

	it("muestra los usuarios registrados", async () => {
		await env.infra
			.prepare("INSERT INTO users (id, full_name) VALUES (?, ?)")
			.bind("1", "Ana Lopez")
			.run();

		const { text } = await openPortfolio();

		expect(text).toContain("Ana Lopez");
		expect(text).toContain("full_name:");
		expect(text).not.toContain("No hay usuarios");
	});

	it("muestra el texto del usuario sin interpretar HTML", async () => {
		await env.infra
			.prepare("INSERT INTO users (id, full_name) VALUES (?, ?)")
			.bind("2", `<b>Ana & "Luis"</b>`)
			.run();

		const { text } = await openPortfolio();

		expect(text).toContain("&lt;b&gt;Ana &amp; &quot;Luis&quot;&lt;/b&gt;");
		expect(text).not.toContain(`<b>Ana & "Luis"</b>`);
	});
});
