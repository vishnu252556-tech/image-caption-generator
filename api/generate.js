export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: { message: 'Method Not Allowed. Use POST.' } });
  }

  const { image, tone } = req.body;

  if (!image || !image.base64 || !image.type) {
    return res.status(400).json({ error: { message: 'Invalid request: image object with base64 and type is required.' } });
  }

  // Free Hugging Face token (highly recommended to increase rate limits)
  const hfToken = process.env.HF_TOKEN;

  if (!hfToken) {
    return res.status(401).json({
      error: { message: 'Hugging Face Access Token (HF_TOKEN) is not configured in Vercel settings.' }
    });
  }

  // Build the tone-specific prompt
  const toneGuide = {
    descriptive:    "factual, clear, and precise — describe what is literally visible",
    poetic:         "lyrical, evocative, and metaphorical — paint with words",
    social:         "catchy, fun, emoji-friendly, and great for Instagram or Twitter",
    professional:   "formal, polished, and suitable for business or editorial use",
    storytelling:   "narrative style — as if opening a short story or scene",
    minimal:        "ultra-concise, 5–10 words max per caption, sharp and impactful",
  };

  const prompt = `You are an expert AI image caption generator. Analyze the image carefully and generate exactly 5 diverse, high-quality captions.

Tone style: ${toneGuide[tone || 'descriptive']}

Also extract:
- Scene type (e.g., urban, nature, portrait, interior, abstract)
- Mood/emotion (e.g., serene, energetic, nostalgic, mysterious)
- 3–5 key objects/subjects visible

Respond ONLY in this exact JSON structure (do not wrap in markdown block, do not include any other text):
{
  "captions": [
    "Caption one here",
    "Caption two here",
    "Caption three here",
    "Caption four here",
    "Caption five here"
  ],
  "scene": "scene description",
  "mood": "mood/emotion",
  "objects": ["object1", "object2", "object3"]
}`;

  try {
    // Call Qwen-VL-8B model on Hugging Face Serverless Inference Providers API
    const response = await fetch("https://router.huggingface.co/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${hfToken}`
      },
      body: JSON.stringify({
        model: "Qwen/Qwen3-VL-8B-Instruct",
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: prompt },
              {
                type: "image_url",
                image_url: {
                  url: `data:${image.type};base64,${image.base64}`
                }
              }
            ]
          }
        ],
        max_tokens: 600,
        response_format: { type: "json_object" }
      })
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      return res.status(response.status).json({
        error: { message: err?.error?.message || err?.error || `Hugging Face API responded with status ${response.status}` }
      });
    }

    const chatResult = await response.json();
    const content = chatResult.choices?.[0]?.message?.content || '';
    
    if (!content) {
      throw new Error("No caption generated from Qwen3-VL model.");
    }

    const result = JSON.parse(content);
    return res.status(200).json(result);
  } catch (err) {
    console.error('Hugging Face serverless caption generation error:', err);
    return res.status(500).json({
      error: { message: err.message || 'An unexpected error occurred during Hugging Face caption generation.' }
    });
  }
}
