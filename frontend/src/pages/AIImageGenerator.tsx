import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Wand2, ImageIcon, Download, RotateCcw, Sparkles } from 'lucide-react';

const API = import.meta.env.DEV ? 'http://localhost:3000' : '';

declare global {
  interface Window { puter: any; }
}

type OutletCtx = { isDarkMode: boolean };

export default function AIImageGenerator() {
  const { isDarkMode } = useOutletContext<OutletCtx>();
  const [idea, setIdea] = useState('');
  const [prompt, setPrompt] = useState('');
  const [imageSrc, setImageSrc] = useState('');
  const [suggestLoading, setSuggestLoading] = useState(false);
  const [genLoading, setGenLoading] = useState(false);
  const [promptReady, setPromptReady] = useState(false);

  const suggestPrompt = async () => {
    if (!idea.trim() || suggestLoading) return;
    setSuggestLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API}/api/ai/suggest-prompt`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ idea: idea.trim() }),
      });
      const data = await res.json();
      if (data.prompt) {
        setPrompt(data.prompt);
        setPromptReady(true);
        setImageSrc('');
      }
    } catch {}
    finally { setSuggestLoading(false); }
  };

  const generateImage = async () => {
    if (!prompt.trim() || genLoading) return;
    setGenLoading(true);
    setImageSrc('');
    try {
      const img = await window.puter.ai.txt2img(prompt.trim());
      setImageSrc(img.src);
    } catch (err: any) {
      console.error('Image gen error:', err);
    } finally {
      setGenLoading(false);
    }
  };

  const download = async () => {
    if (!imageSrc) return;
    try {
      const res = await fetch(imageSrc);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `kark-ai-${Date.now()}.png`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      const a = document.createElement('a');
      a.href = imageSrc;
      a.download = `kark-ai-${Date.now()}.png`;
      a.click();
    }
  };

  const reset = () => {
    setIdea('');
    setPrompt('');
    setImageSrc('');
    setPromptReady(false);
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center shadow-lg shadow-pink-500/30">
            <ImageIcon className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className={`text-xl font-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>AI Image Generator</h1>
            <p className={`text-xs ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
              Describe your idea → Llama suggests English prompt → Puter generates stunning image
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-2xl space-y-5">

        {/* Step 1 — Idea input */}
        <div className={`rounded-2xl border p-5 ${isDarkMode ? 'bg-white/[0.03] border-white/[0.07]' : 'bg-white border-slate-200 shadow-sm'}`}>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-5 h-5 rounded-full bg-pink-500 flex items-center justify-center flex-shrink-0">
              <span className="text-[10px] font-black text-white">1</span>
            </div>
            <p className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
              Describe your idea
            </p>
            <span className={`text-xs ${isDarkMode ? 'text-slate-600' : 'text-slate-400'}`}>(Nepali vaye pani huncha)</span>
          </div>

          <textarea
            value={idea}
            onChange={e => setIdea(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); suggestPrompt(); } }}
            placeholder="e.g. euta ramro sunset photo with mountains, orange sky... vaa A lion sitting on throne..."
            rows={3}
            className={`w-full rounded-xl text-sm outline-none resize-none p-3 border transition-all ${
              isDarkMode
                ? 'bg-white/[0.04] border-white/[0.08] text-white placeholder-white/20 focus:border-pink-500/40'
                : 'bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400 focus:border-pink-400 focus:bg-white'
            }`}
          />

          <button
            onClick={suggestPrompt}
            disabled={!idea.trim() || suggestLoading}
            className="mt-3 flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 text-white text-sm font-bold shadow-lg shadow-pink-500/25 hover:from-pink-400 hover:to-rose-400 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {suggestLoading ? (
              <>
                <img src="/monkey.gif.gif" alt="" className="w-4 h-4 rounded object-cover" />
                <span>Llama is thinking...</span>
              </>
            ) : (
              <>
                <Wand2 className="w-4 h-4" />
                <span>Suggest Prompt with Llama</span>
              </>
            )}
          </button>
        </div>

        {/* Step 2 — Prompt editor */}
        {promptReady && (
          <div className={`rounded-2xl border p-5 ${isDarkMode ? 'bg-white/[0.03] border-white/[0.07]' : 'bg-white border-slate-200 shadow-sm'}`}>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-5 h-5 rounded-full bg-violet-500 flex items-center justify-center flex-shrink-0">
                <span className="text-[10px] font-black text-white">2</span>
              </div>
              <p className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
                AI-suggested English prompt
              </p>
              <span className={`text-xs ${isDarkMode ? 'text-slate-600' : 'text-slate-400'}`}>(edit if needed)</span>
            </div>

            <textarea
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              rows={5}
              className={`w-full rounded-xl text-sm outline-none resize-none p-3 border transition-all leading-relaxed ${
                isDarkMode
                  ? 'bg-white/[0.04] border-white/[0.08] text-white/90 focus:border-violet-500/40'
                  : 'bg-slate-50 border-slate-200 text-slate-800 focus:border-violet-400 focus:bg-white'
              }`}
            />

            <button
              onClick={generateImage}
              disabled={!prompt.trim() || genLoading}
              className="mt-3 flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 text-white text-sm font-bold shadow-lg shadow-violet-500/25 hover:from-violet-500 hover:to-blue-500 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {genLoading ? (
                <>
                  <img src="/monkey.gif.gif" alt="" className="w-4 h-4 rounded object-cover" />
                  <span>Generating with Puter AI...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Generate Image</span>
                </>
              )}
            </button>

            {genLoading && (
              <p className={`text-xs mt-2 px-1 ${isDarkMode ? 'text-slate-600' : 'text-slate-400'}`}>
                First time use ma Puter account login garna sakchhau — it's free
              </p>
            )}
          </div>
        )}

        {/* Step 3 — Result */}
        {imageSrc && (
          <div className={`rounded-2xl border overflow-hidden ${isDarkMode ? 'bg-white/[0.03] border-white/[0.07]' : 'bg-white border-slate-200 shadow-sm'}`}>
            <div className="relative">
              <img src={imageSrc} alt="Generated" className="w-full object-cover" />
              <div className={`absolute top-3 right-3 px-2.5 py-1 rounded-full text-[10px] font-black ${isDarkMode ? 'bg-black/60 text-white/60' : 'bg-white/80 text-slate-600'} backdrop-blur-sm`}>
                Puter AI · DALL-E 3
              </div>
            </div>
            <div className={`p-4 flex items-center gap-3 border-t ${isDarkMode ? 'border-white/[0.06]' : 'border-slate-100'}`}>
              <button
                onClick={download}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 text-sm font-bold hover:bg-green-500/20 transition-all"
              >
                <Download className="w-4 h-4" />
                Download
              </button>
              <button
                onClick={generateImage}
                disabled={genLoading}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-bold transition-all ${isDarkMode ? 'border-white/10 text-white/50 hover:bg-white/5' : 'border-slate-200 text-slate-500 hover:bg-slate-50'} disabled:opacity-40`}
              >
                <RotateCcw className="w-4 h-4" />
                Regenerate
              </button>
              <button
                onClick={reset}
                className={`ml-auto flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-bold transition-all ${isDarkMode ? 'border-white/10 text-white/30 hover:bg-white/5' : 'border-slate-200 text-slate-400 hover:bg-slate-50'}`}
              >
                New Image
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
