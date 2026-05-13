import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Send, ArrowLeft, Sparkles } from 'lucide-react';

const API = import.meta.env.DEV ? 'http://localhost:3000' : '';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const SUGGESTIONS = [
  'How do I grow my Facebook page fast?',
  'Write a viral caption for a product launch',
  'Best times to post on Facebook in Nepal',
  'Give me 5 content ideas for this week',
];

function TypingDots() {
  return (
    <div className="flex items-center gap-1 px-1 py-1">
      {[0, 1, 2].map(i => (
        <div
          key={i}
          className="w-2 h-2 rounded-full bg-violet-400"
          style={{ animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite` }}
        />
      ))}
      <style>{`@keyframes bounce { 0%,80%,100%{transform:translateY(0)} 40%{transform:translateY(-6px)} }`}</style>
    </div>
  );
}

export default function KarkAI() {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: "Hey! I'm Kark 👋 — your AI assistant by KarkTech. Ask me anything about social media, content strategy, or just have a chat!" },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

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

    try {
      const res = await fetch(`${API}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');
      setMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: "Sorry, something went wrong. Try again! 😅" }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send(input);
    }
  };

  return (
    <div className="min-h-screen bg-[#070711] flex flex-col" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>

      {/* Header */}
      <header className="flex-shrink-0 flex items-center justify-between px-4 md:px-8 py-4 border-b border-white/[0.06] bg-[#070711]/80 backdrop-blur-xl sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <Link to="/landing" className="flex items-center gap-1.5 text-white/40 hover:text-white/70 transition-colors text-sm font-medium">
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Back</span>
          </Link>
          <div className="w-px h-5 bg-white/10" />
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-blue-600 flex items-center justify-center shadow-lg shadow-violet-500/30">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-sm font-black text-white leading-none">Kark</p>
              <p className="text-[10px] text-white/30 leading-none mt-0.5">by KarkTech</p>
            </div>
          </div>
        </div>

        <Link
          to="/login"
          className="px-4 py-1.5 rounded-full text-xs font-bold bg-gradient-to-r from-blue-600 to-violet-600 text-white hover:from-blue-500 hover:to-violet-500 transition-all shadow-lg shadow-blue-500/20"
        >
          Get Full Access →
        </Link>
      </header>

      {/* Chat area */}
      <div className="flex-1 overflow-y-auto px-4 md:px-0">
        <div className="max-w-2xl mx-auto py-6 space-y-5">

          {/* Welcome hero — only when 1 message (initial) */}
          {messages.length === 1 && (
            <div className="text-center py-8">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-blue-600 flex items-center justify-center mx-auto mb-4 shadow-2xl shadow-violet-500/30">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-3xl font-black text-white mb-2" style={{ fontFamily: 'Merriweather, serif' }}>
                Kark AI
              </h1>
              <p className="text-white/40 text-sm max-w-xs mx-auto">
                Your social media co-pilot. Ask anything.
              </p>
            </div>
          )}

          {/* Messages */}
          {messages.map((msg, i) => (
            <div key={i} className={`flex items-end gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              {msg.role === 'assistant' && (
                <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-violet-500 to-blue-600 flex items-center justify-center flex-shrink-0 mb-0.5 shadow-md shadow-violet-500/20">
                  <Sparkles className="w-3.5 h-3.5 text-white" />
                </div>
              )}
              <div className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                msg.role === 'user'
                  ? 'bg-gradient-to-br from-blue-600 to-violet-600 text-white rounded-br-md shadow-lg shadow-blue-500/20'
                  : 'bg-white/[0.06] border border-white/[0.08] text-white/85 rounded-bl-md'
              }`}>
                {msg.content}
              </div>
            </div>
          ))}

          {/* Typing indicator */}
          {loading && (
            <div className="flex items-end gap-3">
              <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-violet-500 to-blue-600 flex items-center justify-center flex-shrink-0 shadow-md shadow-violet-500/20">
                <Sparkles className="w-3.5 h-3.5 text-white" />
              </div>
              <div className="bg-white/[0.06] border border-white/[0.08] rounded-2xl rounded-bl-md px-4 py-2">
                <TypingDots />
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>
      </div>

      {/* Suggestion chips — visible only at start */}
      {messages.length === 1 && !loading && (
        <div className="flex-shrink-0 px-4 md:px-0 pb-2">
          <div className="max-w-2xl mx-auto">
            <div className="flex flex-wrap gap-2 justify-center">
              {SUGGESTIONS.map((s, i) => (
                <button
                  key={i}
                  onClick={() => send(s)}
                  className="px-3 py-1.5 rounded-full text-xs font-semibold border border-white/10 text-white/50 hover:border-violet-500/50 hover:text-violet-300 hover:bg-violet-500/5 transition-all"
                >
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
          <div className="flex items-end gap-3 bg-white/[0.05] border border-white/[0.08] rounded-2xl px-4 py-3 focus-within:border-violet-500/40 transition-all">
            <textarea
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Ask Kark anything..."
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
