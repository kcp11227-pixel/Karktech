import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Send, ArrowLeft, ChevronDown } from 'lucide-react';

const API = import.meta.env.DEV ? 'http://localhost:3000' : '';

type ModelId = 'groq' | 'gemini';

interface ModelOption {
  id: ModelId;
  name: string;
  label: string;
  badge: string;
  color: string;
  icon: string;
}

const MODELS: ModelOption[] = [
  {
    id: 'groq',
    name: 'Llama 3.3',
    label: 'Llama 3.3 70B',
    badge: 'via Groq',
    color: '#f97316',
    icon: '🦙',
  },
  {
    id: 'gemini',
    name: 'Gemini 2.0',
    label: 'Gemini 2.0 Flash',
    badge: 'via Google',
    color: '#4285F4',
    icon: '✦',
  },
];

interface Message {
  role: 'user' | 'assistant';
  content: string;
  model?: ModelId;
}

const SUGGESTIONS = [
  'How do I grow my Facebook page fast?',
  'Write a viral caption for a product launch',
  'Best times to post on Facebook in Nepal',
  'Give me 5 content ideas for this week',
];

function MonkeyAvatar({ size = 28 }: { size?: number }) {
  return (
    <img
      src="/monkey.gif.gif"
      alt="Kark"
      style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
    />
  );
}

export default function KarkAI() {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: "Hey! I'm Kark 👋 — your AI assistant by KarkTech. Ask me anything about social media, content strategy, or just have a chat!" },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [model, setModel] = useState<ModelId>('groq');
  const [showModelDrop, setShowModelDrop] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const activeModel = MODELS.find(m => m.id === model)!;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const send = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    const userMsg: Message = { role: 'user', content: trimmed };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setLoading(true);
    setShowModelDrop(false);

    try {
      const res = await fetch(`${API}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages, model }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');
      const actualModel: ModelId = data.usedModel === 'groq-fallback' ? 'groq' : model;
      setMessages(prev => [...prev, { role: 'assistant', content: data.reply, model: actualModel }]);
      if (data.usedModel === 'groq-fallback') {
        setModel('groq');
      }
    } catch (err: any) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "Sorry, something went wrong. Try again! 😅",
        model,
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(input); }
  };

  return (
    <div className="min-h-screen bg-[#070711] flex flex-col" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>

      {/* Header */}
      <header className="flex-shrink-0 flex items-center justify-between px-4 md:px-8 py-3 border-b border-white/[0.06] bg-[#070711]/80 backdrop-blur-xl sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <Link to="/landing" className="flex items-center gap-1.5 text-white/40 hover:text-white/70 transition-colors text-sm font-medium">
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Back</span>
          </Link>
          <div className="w-px h-5 bg-white/10" />
          <div className="flex items-center gap-2.5">
            <img src="/monkey.gif.gif" alt="Kark" className="w-9 h-9 rounded-xl object-cover" />
            <div>
              <p className="text-sm font-black text-white leading-none">Kark</p>
              <p className="text-[10px] text-white/30 leading-none mt-0.5">by KarkTech · Always online</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Model selector */}
          <div className="relative">
            <button
              onClick={() => setShowModelDrop(v => !v)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-white/10 bg-white/[0.04] hover:bg-white/[0.07] transition-all"
            >
              <span className="text-base leading-none">{activeModel.icon}</span>
              <span className="text-xs font-bold text-white/70 hidden sm:inline">{activeModel.name}</span>
              <ChevronDown className={`w-3 h-3 text-white/30 transition-transform ${showModelDrop ? 'rotate-180' : ''}`} />
            </button>

            {showModelDrop && (
              <div className="absolute right-0 top-full mt-2 w-52 rounded-2xl border border-white/10 bg-[#0f0f20] shadow-2xl shadow-black/50 overflow-hidden z-30">
                <p className="px-3 pt-3 pb-1 text-[10px] font-black tracking-widest text-white/20 uppercase">Choose Model</p>
                {MODELS.map(m => (
                  <button
                    key={m.id}
                    onClick={() => { setModel(m.id); setShowModelDrop(false); }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors hover:bg-white/[0.05] ${model === m.id ? 'bg-white/[0.06]' : ''}`}
                  >
                    <span className="text-xl leading-none w-7 text-center">{m.icon}</span>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-white leading-none">{m.label}</p>
                      <p className="text-[10px] text-white/30 mt-0.5">{m.badge}</p>
                    </div>
                    {model === m.id && (
                      <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: m.color }} />
                    )}
                  </button>
                ))}
                <div className="px-3 py-2 border-t border-white/[0.05]">
                  <p className="text-[9px] text-white/20">Both models are free to use</p>
                </div>
              </div>
            )}
          </div>

          <Link
            to="/login"
            className="px-4 py-1.5 rounded-full text-xs font-bold bg-gradient-to-r from-blue-600 to-violet-600 text-white hover:from-blue-500 hover:to-violet-500 transition-all shadow-lg shadow-blue-500/20"
          >
            Full Access →
          </Link>
        </div>
      </header>

      {/* Chat area */}
      <div className="flex-1 overflow-y-auto px-4 md:px-0" onClick={() => setShowModelDrop(false)}>
        <div className="max-w-2xl mx-auto py-6 space-y-5">

          {/* Welcome hero */}
          {messages.length === 1 && (
            <div className="text-center py-8">
              <img
                src="/monkey.gif.gif"
                alt="Kark"
                className="w-24 h-24 rounded-3xl object-cover mx-auto mb-4 shadow-2xl"
                style={{ boxShadow: '0 0 40px rgba(139,92,246,0.4)' }}
              />
              <h1 className="text-3xl font-black text-white mb-2" style={{ fontFamily: 'Merriweather, serif' }}>
                Kark AI
              </h1>
              <p className="text-white/40 text-sm max-w-xs mx-auto">
                Your social media co-pilot. Ask anything.
              </p>
              {/* Model indicator */}
              <div className="inline-flex items-center gap-1.5 mt-3 px-3 py-1.5 rounded-full border border-white/10 bg-white/[0.04]">
                <span className="text-sm">{activeModel.icon}</span>
                <span className="text-xs font-semibold text-white/50">{activeModel.label}</span>
              </div>
            </div>
          )}

          {/* Messages */}
          {messages.map((msg, i) => {
            const msgModel = MODELS.find(m => m.id === msg.model);
            return (
              <div key={i} className={`flex items-end gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                {msg.role === 'assistant' && <MonkeyAvatar size={28} />}
                <div className="flex flex-col gap-1 max-w-[80%]">
                  {msg.role === 'assistant' && msgModel && (
                    <span className="text-[10px] text-white/20 font-medium px-1 flex items-center gap-1">
                      <span>{msgModel.icon}</span> {msgModel.name}
                    </span>
                  )}
                  <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                    msg.role === 'user'
                      ? 'bg-gradient-to-br from-blue-600 to-violet-600 text-white rounded-br-md shadow-lg shadow-blue-500/20'
                      : 'bg-white/[0.06] border border-white/[0.08] text-white/85 rounded-bl-md'
                  }`}>
                    {msg.content}
                  </div>
                </div>
              </div>
            );
          })}

          {/* Typing indicator */}
          {loading && (
            <div className="flex items-end gap-3">
              <img src="/monkey.gif.gif" alt="Kark thinking" className="w-7 h-7 rounded-full object-cover flex-shrink-0" />
              <div className="bg-white/[0.06] border border-white/[0.08] rounded-2xl rounded-bl-md px-4 py-3">
                <div className="flex items-center gap-2">
                  <img src="/monkey.gif.gif" alt="" className="w-5 h-5 rounded-md object-cover" />
                  <span className="text-xs text-white/40 font-medium">
                    {activeModel.name} is thinking...
                  </span>
                </div>
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>
      </div>

      {/* Suggestions */}
      {messages.length === 1 && !loading && (
        <div className="flex-shrink-0 px-4 md:px-0 pb-2">
          <div className="max-w-2xl mx-auto">
            <div className="flex flex-wrap gap-2 justify-center">
              {SUGGESTIONS.map((s, i) => (
                <button key={i} onClick={() => send(s)}
                  className="px-3 py-1.5 rounded-full text-xs font-semibold border border-white/10 text-white/50 hover:border-violet-500/50 hover:text-violet-300 hover:bg-violet-500/5 transition-all">
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Input bar */}
      <div className="flex-shrink-0 border-t border-white/[0.06] bg-[#070711]/90 backdrop-blur-xl px-4 md:px-0 py-4">
        <div className="max-w-2xl mx-auto">
          {/* Active model pill */}
          <div className="flex items-center gap-1.5 mb-2 px-1">
            <span className="text-sm">{activeModel.icon}</span>
            <span className="text-[11px] text-white/30 font-medium">{activeModel.label}</span>
            <button onClick={() => setShowModelDrop(v => !v)} className="text-[10px] text-white/20 hover:text-white/50 transition-colors ml-1">change</button>
          </div>

          <div className="flex items-end gap-3 bg-white/[0.05] border border-white/[0.08] rounded-2xl px-4 py-3 focus-within:border-violet-500/40 transition-all">
            <textarea
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder={`Ask ${activeModel.name}...`}
              rows={1}
              className="flex-1 bg-transparent text-sm text-white placeholder-white/20 outline-none resize-none leading-relaxed max-h-32 overflow-y-auto"
              style={{ minHeight: '24px' }}
              onInput={e => {
                const el = e.currentTarget;
                el.style.height = 'auto';
                el.style.height = Math.min(el.scrollHeight, 128) + 'px';
              }}
            />
            <button
              onClick={() => send(input)}
              disabled={!input.trim() || loading}
              className="flex-shrink-0 w-8 h-8 rounded-xl bg-gradient-to-br from-violet-600 to-blue-600 flex items-center justify-center text-white hover:from-violet-500 hover:to-blue-500 transition-all shadow-lg shadow-violet-500/30 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
          <p className="text-center text-[10px] text-white/15 mt-2">
            Kark can make mistakes — double check important info.
          </p>
        </div>
      </div>
    </div>
  );
}
