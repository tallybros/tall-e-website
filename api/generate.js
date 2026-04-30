const DEFAULT_BRANDS = [
  {
    id: "fintech",
    guide: `Brand: A fintech for freelancers and small businesses.

Tone: Direct, human, no fluff. Like a smart friend who gets money — not a bank.

Voice principles:
— Use "you" not "the user." Speak like a person, not a product.
— Short sentences. One idea at a time.
— Plain English only. No jargon, no legalese.
— Confident but never arrogant.
— Use numerals ($0, 2 days) not words.

Avoid: "seamless," "robust," "empower," "leverage," "solution."
Avoid passive voice. No filler phrases.

Example: ✗ "Your payment has been processed successfully."
         ✓ "Your payment went through. $240 is on its way."`,
  },
  {
    id: "health",
    guide: `Brand: A wellness brand for women 30–50.

Tone: Warm, encouraging, grounded. Like a knowledgeable friend — not a medical authority.

Voice principles:
— Empathy first. Acknowledge where people are before offering solutions.
— Positive framing. Focus on energy, vitality, possibility.
— Inclusive and body-neutral. No diet culture language.
— Sensory and specific. "Feel lighter by Wednesday" beats "improves wellbeing."
— Conversational. Contractions. "You" a lot.

Avoid: "fix," "problem," "lose weight," "struggle," "battle."

Example: ✗ "Our product combats the symptoms of fatigue."
         ✓ "You know those 3pm walls? This helps you sail past them."`,
  },
  {
    id: "b2b",
    guide: `Brand: A workflow automation platform for ops teams.

Tone: Crisp, sharp, peer-to-peer. Smart people who don't need hand-holding.

Voice principles:
— Lead with outcomes. What they gain before how it works.
— Precise over vague. "Cut review time by 40%" beats "save time."
— Treat the reader as an expert.
— Active voice. Decisive.
— Dry humor fine. Enthusiasm suspect.

Avoid: "game-changer," "revolutionary," "end-to-end," "streamline."
No exclamation points.

Example: ✗ "Our streamlined solution empowers your team to work more efficiently!"
         ✓ "Your ops team closes 3x more requests. No new headcount."`,
  },
  {
    id: "luxury",
    guide: `Brand: A high-end leather goods brand.

Tone: Understated, precise, quietly confident. Luxury doesn't persuade.

Voice principles:
— Say less. Let quality speak.
— Every word earns its place.
— Specificity signals craft. "Full-grain Tuscan calf leather" not "premium materials."
— Present tense. Timeless framing.
— No sales language. No urgency.

Avoid: "luxury," "premium," "exclusive," "amazing," "perfect gift."
No adjective stacking. No superlatives.

Example: ✗ "Our stunning, premium bags are the perfect luxury gift."
         ✓ "Made from a single hide. Designed to last forty years."`,
  },
];

async function kvGet(url, token, key) {
  const res = await fetch(url, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify(["GET", key]),
  });
  const { result } = await res.json();
  return result ? JSON.parse(result) : null;
}

async function getBrandGuide(brandId) {
  if (!brandId) return { guide: null, _debug: "no_brandId" };

  const KV_URL = process.env.KV_REST_API_URL;
  const KV_TOKEN = process.env.KV_REST_API_TOKEN;

  if (!KV_URL || !KV_TOKEN) {
    const brand = DEFAULT_BRANDS.find((b) => b.id === brandId);
    return { guide: brand?.guide || null, _debug: "no_kv_env" };
  }

  try {
    const settings = await kvGet(KV_URL, KV_TOKEN, "settings");
    if (settings?.brands) {
      const brand = settings.brands.find((b) => b.id === brandId);
      if (brand?.guide) return { guide: brand.guide, _debug: "kv_found" };
      if (brand) return { guide: null, _debug: "kv_brand_no_guide" };
      // Brand not in KV brands array — try defaults
      const def = DEFAULT_BRANDS.find((b) => b.id === brandId);
      return { guide: def?.guide || null, _debug: def ? "default_fallback" : "kv_brand_not_found" };
    } else {
      const def = DEFAULT_BRANDS.find((b) => b.id === brandId);
      return { guide: def?.guide || null, _debug: "kv_no_brands" };
    }
  } catch (e) {
    console.error("getBrandGuide KV error:", e);
    const def = DEFAULT_BRANDS.find((b) => b.id === brandId);
    return { guide: def?.guide || null, _debug: `kv_error:${e.message}` };
  }
}

function buildSystemPrompt(guide) {
  return `You are a writer with a specific voice. Everything you write must follow the Voice & Tone guide below — not as a generic AI, not as a helpful assistant. As this writer. Every word.\n\nDo not mention the guide. Do not explain what you are doing. Just write.\n\n${guide}\n\nStay in this voice for your entire response. If you catch yourself sounding generic, stop and rewrite.`;
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const allowedOrigins = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(",")
    : ["*"];

  const origin = req.headers.origin || req.headers.referer || "";
  if (allowedOrigins[0] !== "*" && !allowedOrigins.some((o) => origin.startsWith(o))) {
    return res.status(403).json({ error: "Forbidden" });
  }

  res.setHeader("Access-Control-Allow-Origin", allowedOrigins[0] === "*" ? "*" : origin);
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();

  const { brandId, prompt, model, devToken, system: inlineSystem } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: "Missing prompt" });
  }
  if (prompt.length > 800) {
    return res.status(400).json({ error: "Prompt too long. Maximum 800 characters." });
  }

  const isBypassed = devToken && (devToken === process.env.DEV_TOKEN || devToken === process.env.ADMIN_PASSWORD);

  if (!isBypassed) {
    const KV_URL = process.env.KV_REST_API_URL;
    const KV_TOKEN = process.env.KV_REST_API_TOKEN;

    if (KV_URL && KV_TOKEN) {
      const ip = req.headers["x-forwarded-for"]?.split(",")[0].trim() || "unknown";
      const hour = Math.floor(Date.now() / 3600000);
      const today = new Date().toISOString().slice(0, 10);
      const ipKey = `rl:ip:${ip}:${hour}`;
      const globalKey = `rl:global:${today}`;

      async function kvCmd(cmd) {
        const r = await fetch(KV_URL, {
          method: "POST",
          headers: { Authorization: `Bearer ${KV_TOKEN}`, "Content-Type": "application/json" },
          body: JSON.stringify(cmd),
        });
        return r.json();
      }

      const [ipRes, globalRes] = await Promise.all([
        kvCmd(["INCR", ipKey]),
        kvCmd(["INCR", globalKey]),
      ]);

      const ipCount = ipRes.result;
      const globalCount = globalRes.result;

      if (ipCount === 1) await kvCmd(["EXPIRE", ipKey, 3600]);
      if (globalCount === 1) await kvCmd(["EXPIRE", globalKey, 86400]);

      if (ipCount > 20) return res.status(429).json({ error: "I love your curiosity – you've reached the end of this demo.\n[Why don't we chat?](https://www.tall-e.nl/#contact)" });
      if (globalCount > 100) return res.status(429).json({ error: "Daily limit reached. Try again tomorrow." });
    }
  }

  // Admin preview sends the guide inline (so drafts can be tested before saving).
  // Only trust inlineSystem when the request is already authenticated via devToken.
  let system, guideDebug;
  if (isBypassed && inlineSystem) {
    system = inlineSystem;
    guideDebug = "inline";
  } else {
    const { guide, _debug } = await getBrandGuide(brandId);
    guideDebug = _debug;
    system = guide ? buildSystemPrompt(guide) : null;
  }

  const ANTHROPIC_MODELS = ["claude-opus-4-7", "claude-sonnet-4-6", "claude-haiku-4-5-20251001"];
  const OPENAI_MODELS = ["gpt-4o", "gpt-4o-mini", "o3-mini"];
  const GOOGLE_MODELS = ["gemini-2.5-pro"];
  const isOpenAI = OPENAI_MODELS.includes(model);
  const isAnthropic = ANTHROPIC_MODELS.includes(model);
  const isGoogle = GOOGLE_MODELS.includes(model);
  const selectedModel = isAnthropic ? model : isOpenAI ? model : isGoogle ? model : "claude-sonnet-4-6";

  try {
    if (isOpenAI) {
      const messages = [];
      if (system) messages.push({ role: "system", content: system });
      messages.push({ role: "user", content: prompt });

      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        body: JSON.stringify({ model: selectedModel, max_tokens: 1000, messages }),
      });

      const data = await response.json();
      if (!response.ok) return res.status(response.status).json({ error: data.error?.message || "API error" });

      const text = data.choices[0]?.message?.content?.trim() || "";
      return res.status(200).json({ text, model: data.model, tokens: data.usage?.completion_tokens, _guide: guideDebug });
    }

    if (isGoogle) {
      const body = {
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        ...(system ? { system_instruction: { parts: [{ text: system }] } } : {}),
      };

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${selectedModel}:generateContent?key=${process.env.GOOGLE_API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        }
      );

      const data = await response.json();
      if (!response.ok) return res.status(response.status).json({ error: data.error?.message || "API error" });

      const text = data.candidates?.[0]?.content?.parts?.map((p) => p.text).join("").trim() || "";
      const tokens = data.usageMetadata?.candidatesTokenCount;
      return res.status(200).json({ text, model: selectedModel, tokens, _guide: guideDebug });
    }

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: selectedModel,
        max_tokens: 1000,
        ...(system ? { system } : {}),
        messages: [{ role: "user", content: prompt }],
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      return res.status(response.status).json({ error: data.error?.message || "API error" });
    }

    const text = data.content.map((block) => block.text || "").join("\n").trim();
    return res.status(200).json({ text, model: data.model, tokens: data.usage?.output_tokens, _guide: guideDebug });
  } catch (err) {
    console.error("Proxy error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}
