# IncidentLab

## Run

```powershell
npm start
```

Open http://127.0.0.1:4173.

## Optional LLM integration

Set an OpenAI-compatible API key in the server environment before starting:

```powershell
$env:OPENAI_API_KEY="your-api-key"
$env:OPENAI_MODEL="gpt-4o-mini"
npm start
```

For another OpenAI-compatible provider, also set:

```powershell
$env:OPENAI_BASE_URL="https://your-provider.example/v1"
```

The API key remains on the server. If no LLM service is configured or available, the page generates a safe local starter script instead.