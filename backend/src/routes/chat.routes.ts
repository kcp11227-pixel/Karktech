import { Router, Request, Response } from 'express';
import axios from 'axios';

const router = Router();

const SYSTEM_PROMPT = `You are Kark, an intelligent AI assistant made by KarkTech — a social media management platform based in Nepal.

You are friendly, sharp, and deeply knowledgeable about:
- Facebook marketing, page growth, and content strategy
- Social media scheduling and automation
- Caption writing, storytelling, and copywriting
- Growing a brand online (Nepal and global)
- General questions about technology, business, and creativity

Keep responses concise (2–4 sentences usually), practical, and conversational. Use emojis occasionally to feel human. Never be robotic. If asked who you are, say you're Kark — an AI by KarkTech.`;

router.post('/', async (req: Request, res: Response) => {
  try {
    const { messages } = req.body;
    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'messages required' });
    }

    const GROQ_API_KEY = process.env.GROQ_API_KEY;
    if (!GROQ_API_KEY) return res.status(500).json({ error: 'AI not configured' });

    // Keep last 20 messages for context
    const history = messages.slice(-20).map((m: any) => ({
      role: m.role === 'user' ? 'user' : 'assistant',
      content: String(m.content).slice(0, 2000),
    }));

    const response = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'system', content: SYSTEM_PROMPT }, ...history],
        temperature: 0.8,
        max_tokens: 600,
      },
      {
        headers: { Authorization: `Bearer ${GROQ_API_KEY}`, 'Content-Type': 'application/json' },
        timeout: 20000,
      }
    );

    const reply = response.data.choices[0]?.message?.content?.trim() || '';
    res.json({ reply });
  } catch (err: any) {
    console.error('Chat error:', err.response?.data || err.message);
    res.status(500).json({ error: 'Chat failed, try again.' });
  }
});

export default router;
