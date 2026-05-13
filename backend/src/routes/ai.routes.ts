import { Router } from 'express';
import axios from 'axios';
import { authenticate, AuthRequest } from '../middlewares/auth.middleware';

const router = Router();
router.use(authenticate);

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

export default router;
