async function queryDatabase(db: D1Database) {
	// Connect and execute a query
	const { results } = await db.prepare("SELECT * FROM users").all();
	return results;
}

function escapeHtml(value: unknown): string {
	return String(value ?? "")
		.replaceAll("&", "&amp;")
		.replaceAll("<", "&lt;")
		.replaceAll(">", "&gt;")
		.replaceAll('"', "&quot;");
}

function renderUsers(data: Record<string, unknown>[]): string {
	if (data.length === 0) {
		return `<p class="users-empty">No hay usuarios</p>`;
	}

	const items = data
		.map((user) => {
			const fields = Object.entries(user)
				.map(
					([key, value]) =>
						`<span><strong>${escapeHtml(key)}:</strong> ${escapeHtml(value)}</span>`,
				)
				.join("");
			return `<li>${fields}</li>`;
		})
		.join("");

	return `<ul class="users">${items}</ul>`;
}

function buildHtml(data: Record<string, unknown>[]): string {
	return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Luis Francisco Zarate Diaz</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;600&display=swap" rel="stylesheet" />
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      min-height: 100vh;
      display: grid;
      place-items: center;
      font-family: "DM Sans", sans-serif;
      background: linear-gradient(160deg, #0f172a 0%, #1e3a5f 100%);
      color: #f1f5f9;
      text-align: center;
      padding: 1.5rem;
    }
    h1 {
      font-size: clamp(1.75rem, 5vw, 2.75rem);
      font-weight: 600;
      letter-spacing: -0.02em;
      margin-bottom: 0.5rem;
    }
    p {
      font-size: clamp(1rem, 2.5vw, 1.25rem);
      font-weight: 400;
      color: #94a3b8;
      letter-spacing: 0.04em;
    }
    .users {
      list-style: none;
      margin-top: 1.5rem;
      display: grid;
      gap: 0.75rem;
      text-align: left;
    }
    .users li {
      display: grid;
      gap: 0.25rem;
      padding: 0.75rem 1rem;
      background: rgba(15, 23, 42, 0.45);
      border: 1px solid rgba(148, 163, 184, 0.25);
      border-radius: 0.5rem;
      font-size: 0.95rem;
      color: #cbd5e1;
    }
    .users strong {
      color: #e2e8f0;
      font-weight: 600;
    }
    .users-empty {
      margin-top: 1.5rem;
    }
  </style>
</head>
<body>
  <main>
    <h1>Luis Francisco Zarate Diaz</h1>
    <p>Developer jr</p>
    ${renderUsers(data)}
  </main>
</body>
</html>`;
}

export default {
	async fetch(_request, env): Promise<Response> {
		const data = await queryDatabase(env.infra);
		return new Response(buildHtml(data as Record<string, unknown>[]), {
			headers: { "Content-Type": "text/html; charset=utf-8" },
		});
	},
} satisfies ExportedHandler<Env>;
