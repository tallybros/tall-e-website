const DEFAULT_SETTINGS = {
  model: "claude-sonnet-4-6",
  brands: [
    {
      id: "fintech",
      name: "Fintech startup",
      description: "A modern fintech built for freelancers and small businesses. Direct, human, no fluff.",
      presets: [
        "Write a subject line for a payment confirmation email",
        "Describe our free trial in one sentence",
        "Write a push notification for a failed payment"
      ],
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
         ✓ "Your payment went through. $240 is on its way."`
    },
    {
      id: "health",
      name: "Wellness brand",
      description: "A wellness brand for women 30–50. Warm, encouraging, grounded — like a knowledgeable friend.",
      presets: [
        "Write a product description for a sleep supplement",
        "Write a welcome email for new subscribers",
        "Describe our 30-day return policy"
      ],
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
         ✓ "You know those 3pm walls? This helps you sail past them."`
    },
    {
      id: "b2b",
      name: "B2B SaaS",
      description: "A workflow automation platform for ops teams. Crisp, outcome-focused, peer-to-peer.",
      presets: [
        "Write a one-liner for our homepage hero",
        "Write a follow-up email after a demo call",
        "Describe what happens during onboarding"
      ],
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
         ✓ "Your ops team closes 3x more requests. No new headcount."`
    },
    {
      id: "luxury",
      name: "Luxury retail",
      description: "A high-end leather goods brand. Understated, precise, quietly confident.",
      presets: [
        "Write a product description for a leather briefcase",
        "Write a thank-you note included with an order",
        "Describe our craftsmanship in two sentences"
      ],
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
         ✓ "Made from a single hide. Designed to last forty years."`
    }
  ]
};

async function kvGet(url, token, key) {
  const res = await fetch(url, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify(["GET", key])
  });
  const { result } = await res.json();
  return result ? JSON.parse(result) : null;
}

async function kvSet(url, token, key, value) {
  await fetch(url, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify(["SET", key, JSON.stringify(value)])
  });
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();

  const KV_URL = process.env.KV_REST_API_URL;
  const KV_TOKEN = process.env.KV_REST_API_TOKEN;

  if (req.method === "GET") {
    if (!KV_URL || !KV_TOKEN) return res.status(200).json(DEFAULT_SETTINGS);
    try {
      const settings = await kvGet(KV_URL, KV_TOKEN, "settings");
      return res.status(200).json(settings || DEFAULT_SETTINGS);
    } catch {
      return res.status(200).json(DEFAULT_SETTINGS);
    }
  }

  if (req.method === "POST") {
    const { password, action, model, brands } = req.body;

    if (password !== process.env.ADMIN_PASSWORD) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    if (action === "verify") return res.status(200).json({ ok: true });

    if (!KV_URL || !KV_TOKEN) return res.status(503).json({ error: "Storage not configured. Add Vercel KV." });

    await kvSet(KV_URL, KV_TOKEN, "settings", { model, brands });
    return res.status(200).json({ ok: true });
  }

  return res.status(405).json({ error: "Method not allowed" });
}
