const MISTRAL_MODEL = "mistral-small-latest";
const MAX_CANDIDATES = 32;

type Message = { role: "system" | "user"; content: string };

function extractText(payload: any) {
  const content = payload?.choices?.[0]?.message?.content;
  if (typeof content === "string") return content.trim();
  if (Array.isArray(content)) return content.map((part: any) => part.text || "").join("").trim();
  return "";
}

function selectCandidate(raw: string, candidates: string[]) {
  let value = raw.trim();
  try {
    const parsed = JSON.parse(value);
    value = String(parsed.index ?? parsed.response ?? "");
  } catch {
    // Accept a plain numeric response as a compatibility fallback.
  }
  const index = Number(value.match(/\b\d+\b/)?.[0]);
  if (!Number.isInteger(index) || index < 0 || index >= candidates.length) {
    throw new Error("The AI returned an invalid response selection");
  }
  return candidates[index];
}

export default async function handler(request: any, response: any) {
  if (request.method !== "POST") {
    response.status(405).json({ error: "Method not allowed" });
    return;
  }

  const apiKey = process.env.MISTRAL_API_KEY;
  if (!apiKey) {
    response.status(503).json({ error: "MISTRAL_API_KEY is not configured" });
    return;
  }

  const messages = Array.isArray(request.body?.messages) ? request.body.messages as Message[] : [];
  const candidates = Array.isArray(request.body?.candidates) ? request.body.candidates.filter((item: unknown) => typeof item === "string").slice(0, MAX_CANDIDATES) as string[] : [];
  if (!messages.length || !candidates.length) {
    response.status(400).json({ error: "Coach context is incomplete" });
    return;
  }

  const system = messages.find((message) => message.role === "system")?.content || "";
  const user = messages.filter((message) => message.role === "user").map((message) => message.content).join("\n");
  const prompt = `${user}\n\nAllowed responses:\n${candidates.map((candidate, index) => `${index}: ${candidate}`).join("\n")}`;

  try {
    const apiResponse = await fetch("https://api.mistral.ai/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: MISTRAL_MODEL,
        messages: [
          { role: "system", content: `${system}\nReturn JSON only: {"index": number}. Select exactly one allowed response index.` },
          { role: "user", content: prompt },
        ],
        temperature: 0,
        max_tokens: 16,
        response_format: { type: "json_object" },
      }),
    });
    const payload = await apiResponse.json();
    if (!apiResponse.ok) {
      response.status(apiResponse.status === 429 ? 429 : 502).json({ error: "Mistral API request failed" });
      return;
    }
    response.status(200).json({ response: selectCandidate(extractText(payload), candidates) });
  } catch {
    response.status(502).json({ error: "Coach API is temporarily unavailable" });
  }
}
