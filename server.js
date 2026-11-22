const http = require("http");
const fs = require("fs");
const path = require("path");

const host = "127.0.0.1";
const port = Number(process.env.PORT || 4173);
const publicDirectory = __dirname;

const mimeTypes = {
    ".html": "text/html; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".js": "text/javascript; charset=utf-8",
    ".json": "application/json; charset=utf-8"
};

function sendJson(response, statusCode, payload) {
    response.writeHead(statusCode, { "Content-Type": "application/json; charset=utf-8" });
    response.end(JSON.stringify(payload));
}

async function generateScript(payload) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) throw new Error("OPENAI_API_KEY is not configured");

    const baseUrl = (process.env.OPENAI_BASE_URL || "https://api.openai.com/v1").replace(/\/$/, "");
    const model = process.env.OPENAI_MODEL || "gpt-4o-mini";
    const systemPrompt =
        "You translate faculty incident descriptions into deterministic, safe student exercise scripts. " +
        "Return only a YAML-like incident script. Include incident, target_vm, duration_minutes, steps, " +
        "and source_description. Use defensive investigation tasks and never include destructive commands.";

    const response = await fetch(`${baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${apiKey}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            model,
            temperature: 0.2,
            messages: [
                { role: "system", content: systemPrompt },
                {
                    role: "user",
                    content:
                        `Incident name: ${payload.name}\n` +
                        `Target VM: ${payload.vm}\n` +
                        `Duration: ${payload.duration} minutes\n` +
                        `Plain-English description:\n${payload.description}`
                }
            ]
        })
    });

    if (!response.ok) {
        const details = await response.text();
        throw new Error(`LLM request failed (${response.status}): ${details}`);
    }

    const result = await response.json();
    let script = result.choices?.[0]?.message?.content?.trim();
    if (!script) throw new Error("The LLM returned no script");
    script = script.replace(/^```(?:yaml|text)?\s*/i, "").replace(/\s*```$/, "").trim();
    return script;
}

const server = http.createServer(async (request, response) => {
    if (request.method === "POST" && request.url === "/api/generate-script") {
        let body = "";
        request.setEncoding("utf8");
        request.on("data", (chunk) => { body += chunk; });
        request.on("end", async () => {
            try {
                const payload = JSON.parse(body);
                if (!payload.name || !payload.description) {
                    sendJson(response, 400, { error: "Name and description are required" });
                    return;
                }
                const script = await generateScript(payload);
                sendJson(response, 200, { script });
            } catch (error) {
                sendJson(response, 503, { error: error.message });
            }
        });
        return;
    }

    if (request.method !== "GET" && request.method !== "HEAD") {
        sendJson(response, 405, { error: "Method not allowed" });
        return;
    }

    const requestPath = request.url === "/" ? "/index.html" : request.url.split("?")[0];
    const filePath = path.resolve(publicDirectory, `.${decodeURIComponent(requestPath)}`);
    if (!filePath.startsWith(publicDirectory)) {
        sendJson(response, 403, { error: "Forbidden" });
        return;
    }

    fs.readFile(filePath, (error, data) => {
        if (error) {
            sendJson(response, 404, { error: "Not found" });
            return;
        }
        const contentType = mimeTypes[path.extname(filePath)] || "application/octet-stream";
        response.writeHead(200, { "Content-Type": contentType });
        response.end(request.method === "HEAD" ? undefined : data);
    });
});

server.listen(port, host, () => {
    console.log(`IncidentLab running at http://${host}:${port}`);
});
