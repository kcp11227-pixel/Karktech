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

async function callGroq(messages: any[]): Promise<string> {
  const GROQ_API_KEY = process.env.GROQ_API_KEY;
  if (!GROQ_API_KEY) throw new Error('Groq not configured');

  const history = messages.slice(-20).map((m: any) => ({
    role: m.role === 'user' ? 'user' : 'assistant',
    content: String(m.content).slice(0, 2000),
  }));

  const res = await axios.post(
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
  return res.data.choices[0]?.message?.content?.trim() || '';
}

async function callGemini(messages: any[]): Promise<string> {
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
  if (!GEMINI_API_KEY) throw new Error('Gemini not configured');

  // Convert messages to Gemini format (role: user | model)
  const contents = messages.slice(-20).map((m: any) => ({
    role: m.role === 'user' ? 'user' : 'model',
    parts: [{ text: String(m.content).slice(0, 2000) }],
  }));

  const res = await axios.post(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
    {
      system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
      contents,
      generationConfig: { maxOutputTokens: 600, temperature: 0.8 },
    },
    { headers: { 'Content-Type': 'application/json' }, timeout: 20000 }
  );
  return res.data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';
}

router.post('/', async (req: Request, res: Response) => {
  try {
    const { messages, model = 'groq' } = req.body;
    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'messages required' });
    }

    let reply: string;
    if (model === 'gemini') {
      reply = await callGemini(messages);
    } else {
      reply = await callGroq(messages);
    }

    res.json({ reply });
  } catch (err: any) {
    console.error('Chat error:', err.response?.data || err.message);
    const msg = err.response?.data?.error?.message || err.message || 'Chat failed';
    res.status(500).json({ error: msg });
  }
});

export default router;
