import { Router } from 'express';
import axios from 'axios';
import { authenticate, AuthRequest } from '../middlewares/auth.middleware';

const router = Router();
router.use(authenticate);

async function generateFreeImage(prompt: string): Promise<string | null> {
  try {
    // Pollinations.ai — completely free, no API key, returns image directly
    // We download it, save locally, and serve from our server (Facebook needs a stable URL)
    const encoded = encodeURIComponent(prompt);
    const url = `https://image.pollinations.ai/prompt/${encoded}?width=1216&height=832&model=flux&nologo=true&seed=${Date.now()}`;

    const fs = await import('fs');
    const path = await import('path');
    const crypto = await import('crypto');

    const imgRes = await axios.get(url, { responseType: 'arraybuffer', timeout: 60000 });
    const ext = 'jpg';
    const filename = `story_${crypto.randomBytes(8).toString('hex')}.${ext}`;
    const uploadsDir = path.join(__dirname, '..', '..', 'uploads');
    if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
    fs.writeFileSync(path.join(uploadsDir, filename), imgRes.data);

    const BACKEND_URL = process.env.BACKEND_URL || 'https://karktech.tech';
    return `${BACKEND_URL}/uploads/${filename}`;
  } catch (err: any) {
    console.error('Image generation error:', err.message);
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

    // Run Groq and free image generation in parallel
    const [groqResult, imageUrl] = await Promise.all([
      axios.post(
        'https://api.groq.com/openai/v1/chat/completions',
        { model: 'llama-3.3-70b-versatile', messages: [{ role: 'user', content: storyPrompt }], temperature: 0.9, max_tokens: 1000 },
        { headers: { Authorization: `Bearer ${GROQ_API_KEY}`, 'Content-Type': 'application/json' }, timeout: 30000 }
      ),
      generateFreeImage(prompt),
    ]);

    const caption = groqResult.data.choices[0]?.message?.content?.trim() || '';
    res.json({ caption, imageUrl });
  } catch (err: any) {
    console.error('Story generate error:', err.response?.data || err.message);
    res.status(500).json({ error: err.response?.data?.error?.message || 'Story generation failed' });
  }
});

export default router;
