import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Wand2, Sparkles, Download, RotateCcw, ImageIcon } from 'lucide-react';

const API = import.meta.env.DEV ? 'http://localhost:3000' : '';

function buildPollinationsUrl(prompt: string) {
  const encoded = encodeURIComponent(prompt);
  const seed = Date.now();
  return `https://image.pollinations.ai/prompt/${encoded}?width=1024&height=1024&model=flux&nologo=true&seed=${seed}`;
}

export default function ImageAI() {
  const [idea, setIdea] = useState('');
  const [prompt, setPrompt] = useState('');
  const [imageSrc, setImageSrc] = useState('');
  const [suggestLoading, setSuggestLoading] = useState(false);
  const [genLoading, setGenLoading] = useState(false);
  const [promptReady, setPromptReady] = useState(false);
  const [error, setError] = useState('');

  const suggestPrompt = async () => {
    if (!idea.trim() || suggestLoading) return;
    setSuggestLoading(true);
    setError('');
    try {
      const res = await fetch(`${API}/api/chat/suggest-prompt`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idea: idea.trim() }),
      });
      const data = await res.json();
      if (data.prompt) {
        setPrompt(data.prompt);
        setPromptReady(true);
        setImageSrc('');
      }
    } catch {
      setError('Prompt suggest garna sakiena, retry gara');
    } finally { setSuggestLoading(false); }
  };

  const generateImage = () => {
    if (!prompt.trim() || genLoading) return;
    setGenLoading(true);
    setImageSrc('');
    setError('');
    const url = buildPollinationsUrl(prompt.trim());
    setImageSrc(url);
  };

  const handleImageLoad = () => setGenLoading(false);
  const handleImageError = () => {
    setGenLoading(false);
    setError('Image generate bhayena, ek palta feri try gara');
    setImageSrc('');
  };

  const regenerate = () => {
    if (!prompt.trim()) return;
    setGenLoading(true);
    setError('');
    setImageSrc('');
    setTimeout(() => {
      setImageSrc(buildPollinationsUrl(prompt.trim()));
    }, 50);
  };

  const download = async () => {
    if (!imageSrc) return;
    try {
      const res = await fetch(imageSrc);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `kark-image-${Date.now()}.png`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      const a = document.createElement('a');
      a.href = imageSrc;
      a.download = `kark-image-${Date.now()}.png`;
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
    <div className="min-h-screen bg-[#070711] flex flex-col" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>

      {/* Header */}
      <header className="flex-shrink-0 flex items-center justify-between px-4 md:px-8 py-3 border-b border-white/[0.06] bg-[#070711]/80 backdrop-blur-xl sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <Link to="/kark-ai" className="flex items-center gap-1.5 text-white/40 hover:text-white/70 transition-colors text-sm font-medium">
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Back</span>
          </Link>
          <div className="w-px h-5 bg-white/10" />
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center shadow-lg shadow-pink-500/30">
              <ImageIcon className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-sm font-black text-white leading-none">Image AI</p>
              <p className="text-[10px] text-white/30 leading-none mt-0.5">by KarkTech · Powered by DALL-E 3</p>
            </div>
          </div>
        </div>

        <Link
          to="/login"
          className="px-4 py-1.5 rounded-full text-xs font-bold bg-gradient-to-r from-blue-600 to-violet-600 text-white hover:from-blue-500 hover:to-violet-500 transition-all shadow-lg shadow-blue-500/20"
        >
          Full Access →
        </Link>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 md:px-0 py-8">
        <div className="max-w-2xl mx-auto space-y-5">

          {/* Hero */}
          {!promptReady && !imageSrc && (
            <div className="text-center py-6">
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center mx-auto mb-4 shadow-2xl shadow-pink-500/40">
                <ImageIcon className="w-9 h-9 text-white" />
              </div>
              <h1 className="text-3xl font-black text-white mb-2" style={{ fontFamily: 'Merriweather, serif' }}>
                Image AI
              </h1>
              <p className="text-white/40 text-sm max-w-xs mx-auto">
                Describe any idea — Llama converts it to the perfect prompt, then Flux AI brings it to life.
              </p>
            </div>
          )}

          {/* Step 1 — Idea */}
          <div className="bg-white/[0.04] border border-white/[0.07] rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-5 h-5 rounded-full bg-pink-500 flex items-center justify-center flex-shrink-0">
                <span className="text-[10px] font-black text-white">1</span>
              </div>
              <p className="text-sm font-bold text-white">Describe your idea</p>
              <span className="text-xs text-white/25">Nepali vaa English, jasto pani</span>
            </div>

            <textarea
              value={idea}
              onChange={e => setIdea(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); suggestPrompt(); } }}
              placeholder="e.g. euta ramro sunset, mountains, orange sky... vaa A powerful lion on a golden throne..."
              rows={3}
              className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl text-sm text-white placeholder-white/20 outline-none resize-none p-3 leading-relaxed focus:border-pink-500/40 transition-all"
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
            <div className="bg-white/[0.04] border border-white/[0.07] rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-5 h-5 rounded-full bg-violet-500 flex items-center justify-center flex-shrink-0">
                  <span className="text-[10px] font-black text-white">2</span>
                </div>
                <p className="text-sm font-bold text-white">AI-suggested English prompt</p>
                <span className="text-xs text-white/25">edit garna milchha</span>
              </div>

              <textarea
                value={prompt}
                onChange={e => setPrompt(e.target.value)}
                rows={5}
                className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl text-sm text-white/90 outline-none resize-none p-3 leading-relaxed focus:border-violet-500/40 transition-all"
              />

              <button
                onClick={generateImage}
                disabled={!prompt.trim() || genLoading}
                className="mt-3 flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 text-white text-sm font-bold shadow-lg shadow-violet-500/25 hover:from-violet-500 hover:to-blue-500 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {genLoading ? (
                  <>
                    <img src="/monkey.gif.gif" alt="" className="w-4 h-4 rounded object-cover" />
                    <span>Generating image...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Generate Image</span>
                  </>
                )}
              </button>

              {genLoading && (
                <p className="text-[11px] text-white/20 mt-2 px-1">
                  Flux AI le image banaudaichha — 10–30 seconds lagchha...
                </p>
              )}

              {error && (
                <p className="text-[11px] text-red-400/70 mt-2 px-1">{error}</p>
              )}
            </div>
          )}

          {/* Result */}
          {imageSrc && (
            <div className="bg-white/[0.04] border border-white/[0.07] rounded-2xl overflow-hidden">
              <div className="relative">
                {genLoading && (
                  <div className="flex items-center justify-center gap-3 py-16">
                    <img src="/monkey.gif.gif" alt="" className="w-8 h-8 rounded-lg object-cover" />
                    <span className="text-white/40 text-sm">Generating...</span>
                  </div>
                )}
                <img
                  src={imageSrc}
                  alt="Generated"
                  className={`w-full object-cover ${genLoading ? 'hidden' : 'block'}`}
                  onLoad={handleImageLoad}
                  onError={handleImageError}
                />
                {!genLoading && (
                  <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full text-[10px] font-black bg-black/60 text-white/50 backdrop-blur-sm">
                    Flux AI · Pollinations
                  </div>
                )}
              </div>
              {!genLoading && (
                <div className="p-4 flex items-center gap-3 border-t border-white/[0.06]">
                  <button
                    onClick={download}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 text-sm font-bold hover:bg-green-500/20 transition-all"
                  >
                    <Download className="w-4 h-4" />
                    Download
                  </button>
                  <button
                    onClick={regenerate}
                    disabled={genLoading}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl border border-white/10 text-white/50 text-sm font-bold hover:bg-white/5 transition-all disabled:opacity-40"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Regenerate
                  </button>
                  <button
                    onClick={reset}
                    className="ml-auto flex items-center gap-2 px-4 py-2 rounded-xl border border-white/[0.06] text-white/25 text-sm font-bold hover:bg-white/5 transition-all"
                  >
                    New Image
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <p className="text-center text-[10px] text-white/10 py-3">
        Free to use · No login needed · Powered by Puter AI
      </p>
    </div>
  );
}
