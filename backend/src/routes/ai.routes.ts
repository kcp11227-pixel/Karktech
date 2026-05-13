import { Router } from 'express';
import axios from 'axios';
import { authenticate, AuthRequest } from '../middlewares/auth.middleware';

const router = Router();
router.use(authenticate);

const delay = (ms: number) => new Promise(r => setTimeout(r, ms));

async function generatePixazoImage(prompt: string): Promise<string | null> {
  const PIXAZO_API_KEY = process.env.PIXAZO_API_KEY;
  if (!PIXAZO_API_KEY) return null;
  try {
    const genRes = await axios.post(
      'https://gateway.pixazo.ai/flux-dev/v1/dev/textToImage',
      { prompt, image_size: 'landscape_4_3' },
      { headers: { 'Ocp-Apim-Subscription-Key': PIXAZO_API_KEY, 'Content-Type': 'application/json' }, timeout: 15000 }
    );
    const requestId = genRes.data?.request_id;
    if (!requestId) return null;

    // Poll until done (max 90s)
    for (let i = 0; i < 18; i++) {
      await delay(5000);
      const poll = await axios.get(
        `https://gateway.pixazo.ai/v2/requests/status/${requestId}`,
        { headers: { 'Ocp-Apim-Subscription-Key': PIXAZO_API_KEY }, timeout: 10000 }
      );
      const { status, output } = poll.data;
      if (status === 'COMPLETED') {
        return output?.media_url || output?.url || output?.images?.[0]?.url || null;
      }
      if (status === 'FAILED' || status === 'CANCELLED') return null;
    }
    return null;
  } catch (err: any) {
    console.error('Pixazo error:', err.response?.data || err.message);
    return null;
  }
}

router.post('/generate', async (req: AuthRequest, res) => {
  try {
    const { topic, count = 5, language = 'English', tone = 'engaging' } = req.body;
    if (!topic?.trim()) return res.status(400).json({ error: 'topic is required' });

    const GROQ_API_KEY = process.env.GROQ_API_KEY;
    if (!GROQ_API_KEY) return res.status(500).json({ error: 'AI not configured' });

    const clampedCount = Math.min(Math.max(Number(count), 1), 20);

    const prompt = `Generate ${clampedCount} unique Facebook posts about: "${topic}"
Language: ${language}
Tone: ${tone}

Rules:
- Each post must be engaging, ready to publish on Facebook
- Include relevant emojis naturally
- 50-200 words per post
- Each post must have a different angle or hook
- No hashtags (added separately)
- Return ONLY a valid JSON array of strings, no extra text

Format: ["post 1 text here", "post 2 text here", ...]`;

    const response = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.85,
        max_tokens: 3000,
      },
      {
        headers: {
          Authorization: `Bearer ${GROQ_API_KEY}`,
          'Content-Type': 'application/json',
        },
        timeout: 30000,
      }
    );

    const raw = response.data.choices[0]?.message?.content || '[]';
    const jsonMatch = raw.match(/\[[\s\S]*\]/);
    if (!jsonMatch) return res.status(500).json({ error: 'AI returned invalid format' });

    const posts: string[] = JSON.parse(jsonMatch[0]);
    res.json({ posts });
  } catch (err: any) {
    console.error('AI generate error:', err.response?.data || err.message);
    res.status(500).json({ error: err.response?.data?.error?.message || 'AI generation failed' });
  }
});

router.post('/generate-story', async (req: AuthRequest, res) => {
  try {
    const { prompt, language = 'English', tone = 'storytelling' } = req.body;
    if (!prompt?.trim()) return res.status(400).json({ error: 'prompt is required' });

    const GROQ_API_KEY = process.env.GROQ_API_KEY;
    if (!GROQ_API_KEY) return res.status(500).json({ error: 'AI not configured' });

    const storyPrompt = `Write a compelling Facebook story post about: "${prompt}"
Language: ${language}
Tone: ${tone}

Rules:
- 200-400 words, written as a narrative story
- Start with a powerful hook that stops the scroll
- Use natural paragraphs and conversational language
- Include relevant emojis naturally
- End with a call-to-action or thoughtful reflection
- Do NOT include hashtags
- Return ONLY the story text, nothing else`;

    // Run Groq and Pixazo in parallel
    const [groqResult, imageUrl] = await Promise.all([
      axios.post(
        'https://api.groq.com/openai/v1/chat/completions',
        { model: 'llama-3.3-70b-versatile', messages: [{ role: 'user', content: storyPrompt }], temperature: 0.9, max_tokens: 1000 },
        { headers: { Authorization: `Bearer ${GROQ_API_KEY}`, 'Content-Type': 'application/json' }, timeout: 30000 }
      ),
      generatePixazoImage(prompt),
    ]);

    const caption = groqResult.data.choices[0]?.message?.content?.trim() || '';
    res.json({ caption, imageUrl });
  } catch (err: any) {
    console.error('Story generate error:', err.response?.data || err.message);
    res.status(500).json({ error: err.response?.data?.error?.message || 'Story generation failed' });
  }
});

export default router;
