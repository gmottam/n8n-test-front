export default async function handler(req, res) {
    // ✅ Libera CORS
    const allowedOrigins = [
        "https://mottafit.vercel.app"
    ];
    const origin = req.headers.origin;
    if (allowedOrigins.includes(origin)) {
        res.setHeader("Access-Control-Allow-Origin", origin);
    }
    res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    // Responde rapidamente OPTIONS (preflight)
    if (req.method === "OPTIONS") {
        return res.status(200).end();
    }

    // ✅ Extrai URL alvo do n8n
    const url = req.query.url;
    if (!url) {
        return res.status(400).json({ error: "Missing 'url' parameter" });
    }

    try {
        const targetUrl = decodeURIComponent(url);
        const method = req.method;
        const headers = { "Content-Type": "application/json" };
        const body = ["POST", "PUT", "PATCH"].includes(method)
            ? JSON.stringify(req.body)
            : undefined;

        const response = await fetch(targetUrl, { method, headers, body });
        const data = await response.text();

        // Repassa a resposta com o mesmo status
        res.status(response.status).send(data);
    } catch (error) {
        console.error("Erro no proxy n8n:", error);
        res.status(500).json({ error: "Erro ao acessar o webhook n8n." });
    }
}
