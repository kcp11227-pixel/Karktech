import { Router } from 'express';
import axios from 'axios';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { authenticate, AuthRequest } from '../middlewares/auth.middleware';

const router = Router();
router.use(authenticate);

async function generateFreeImage(prompt: string): Promise<string | null> {
  try {
    const encoded = encodeURIComponent(prompt);
    // Pollinations.ai — free, unlimited, no API key
    const url = `https://image.pollinations.ai/prompt/${encoded}?width=1024&height=680&model=flux&nologo=true&seed=${Date.now()}`;

    const imgRes = await axios.get(url, { responseType: 'arraybuffer', timeout: 90000 });
    if (!imgRes.data || imgRes.data.byteLength < 1000) return null;

    const filename = `story_${crypto.randomBytes(8).toString('hex')}.jpg`;
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
      { model: 'llama-3.3-70b-versatile', messages: [{ role: 'user', content: prompt }], temperature: 0.85, max_tokens: 3000 },
      { headers: { Authorization: `Bearer ${GROQ_API_KEY}`, 'Content-Type': 'application/json' }, timeout: 30000 }
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

    // Groq (fast) and Pollinations image generation in parallel
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

router.post('/suggest-prompt', async (req: AuthRequest, res) => {
  try {
    const { idea } = req.body;
    if (!idea?.trim()) return res.status(400).json({ error: 'idea is required' });

    const GROQ_API_KEY = process.env.GROQ_API_KEY;
    if (!GROQ_API_KEY) return res.status(500).json({ error: 'AI not configured' });

    const resp = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        model: 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'system',
            content: 'You are an expert AI image prompt engineer. Convert any rough idea (in any language) into a detailed, vivid, professional English image generation prompt. Include style, lighting, mood, composition, and artistic details. Return ONLY the prompt text — no explanations, no quotes, no labels. Maximum 120 words.',
          },
          { role: 'user', content: idea.trim() },
        ],
        temperature: 0.9,
        max_tokens: 200,
      },
      { headers: { Authorization: `Bearer ${GROQ_API_KEY}`, 'Content-Type': 'application/json' }, timeout: 15000 }
    );

    const prompt = resp.data.choices[0]?.message?.content?.trim() || '';
    res.json({ prompt });
  } catch (err: any) {
    console.error('Suggest prompt error:', err.response?.data || err.message);
    res.status(500).json({ error: 'Prompt suggestion failed' });
  }
});

export default router;
