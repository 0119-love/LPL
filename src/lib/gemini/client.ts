const GEMINI_MODEL = "gemini-flash-latest";
const GEMINI_BASE = "https://generativelanguage.googleapis.com/v1beta/models";

function requireApiKey() {
  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    throw new Error("GEMINI_API_KEY is not set");
  }
  return key;
}

// Minimal subset of the Gemini REST JSON Schema dialect we actually use.
export type GeminiSchema = {
  type: "ARRAY" | "OBJECT" | "STRING" | "NUMBER" | "BOOLEAN";
  items?: GeminiSchema;
  properties?: Record<string, GeminiSchema>;
  required?: string[];
  enum?: string[];
};

export async function generateStructuredJSON<T>(
  prompt: string,
  schema: GeminiSchema,
): Promise<T> {
  const res = await fetch(
    `${GEMINI_BASE}/${GEMINI_MODEL}:generateContent?key=${requireApiKey()}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: "application/json",
          responseSchema: schema,
        },
      }),
    },
  );

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Gemini generateContent failed: ${res.status} ${body}`);
  }

  const data = await res.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) {
    throw new Error("Gemini response had no content");
  }
  return JSON.parse(text) as T;
}
