const html = `<!DOCTYPE html>
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
  </style>
</head>
<body>
  <main>
    <h1>Luis Francisco Zarate Diaz</h1>
    <p>Developer jr</p>
  </main>
</body>
</html>`;

export default {
	async fetch(): Promise<Response> {
		return new Response(html, {
			headers: { "Content-Type": "text/html; charset=utf-8" },
		});
	},
} satisfies ExportedHandler<Env>;
