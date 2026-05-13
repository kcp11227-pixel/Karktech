import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Sparkles, Send, Clock, CheckCircle, XCircle, Loader2, ChevronDown, Globe, Zap, ImageIcon, BookOpen } from 'lucide-react';
import { addDays, setHours, setMinutes, format } from 'date-fns';
import toast from '../utils/toast';
import { useAuth } from '../context/AuthContext';

const API = import.meta.env.DEV ? 'http://localhost:3000' : '';

const LANGUAGES = ['English', 'Nepali', 'Hindi', 'Spanish', 'French', 'Arabic', 'Portuguese', 'Bengali'];
const TONES = ['engaging', 'professional', 'funny', 'inspirational', 'educational', 'casual', 'urgent', 'storytelling'];

interface Page {
  id: string;
  pageId: string;
  name: string;
  pictureUrl: string | null;
}

interface GeneratedPost {
  content: string;
  scheduledFor: string;
  pageId: string;
  pageName: string;
  imageUrl?: string | null;
  status: 'pending' | 'scheduling' | 'done' | 'error';
  error?: string;
}

export default function TimeGenerator() {
  const { isDarkMode } = useOutletContext<{ isDarkMode: boolean }>();
  const { getToken } = useAuth();

  const [mode, setMode] = useState<'batch' | 'story'>('batch');

  // Batch mode state
  const [topic, setTopic] = useState('');
  const [language, setLanguage] = useState('English');
  const [tone, setTone] = useState('engaging');
  const [days, setDays] = useState(7);
  const [postsPerDay, setPostsPerDay] = useState(2);

  // Story mode state
  const [storyPrompt, setStoryPrompt] = useState('');
  const [storyLanguage, setStoryLanguage] = useState('English');
  const [storyTone, setStoryTone] = useState('storytelling');
  const [storyResult, setStoryResult] = useState<{ caption: string; imageUrl: string | null } | null>(null);
  const [storyCaption, setStoryCaption] = useState('');
  const [storyScheduledFor, setStoryScheduledFor] = useState('');
  const [storyPageId, setStoryPageId] = useState('');
  const [isGeneratingStory, setIsGeneratingStory] = useState(false);
  const [isSchedulingStory, setIsSchedulingStory] = useState(false);
  const [storyStep, setStoryStep] = useState<'setup' | 'preview' | 'done'>('setup');

  // Shared state
  const [pages, setPages] = useState<Page[]>([]);
  const [selectedPageIds, setSelectedPageIds] = useState<string[]>([]);
  const [showPageDrop, setShowPageDrop] = useState(false);
  const [step, setStep] = useState<'setup' | 'preview' | 'done'>('setup');
  const [generatedPosts, setGeneratedPosts] = useState<GeneratedPost[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isScheduling, setIsScheduling] = useState(false);
  const [scheduledCount, setScheduledCount] = useState(0);

  const card = isDarkMode
    ? 'bg-[#0d0d16] border border-white/[0.06]'
    : 'bg-white border border-slate-100 shadow-sm';

  const input = isDarkMode
    ? 'bg-white/5 border border-white/10 text-white placeholder-white/20 focus:border-blue-500/50'
    : 'bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:border-blue-400';

  useEffect(() => {
    fetchPages();
    // Default story schedule: tomorrow at noon
    const tomorrow = addDays(new Date(), 1);
    tomorrow.setHours(12, 0, 0, 0);
    setStoryScheduledFor(tomorrow.toISOString().slice(0, 16));
  }, []);

  const getHeaders = async () => {
    const token = await getToken();
    return { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
  };

  const fetchPages = async () => {
    try {
      const headers = await getHeaders();
      const res = await fetch(`${API}/api/facebook/pages`, { headers });
      if (!res.ok) return;
      const data = await res.json();
      setPages(data);
      if (data.length > 0) {
        setSelectedPageIds([data[0].id]);
        setStoryPageId(data[0].id);
      }
    } catch { /* silently fail */ }
  };

  const generateSlots = (): string[] => {
    const slots: string[] = [];
    const now = new Date();
    const peakHours = [9, 12, 15, 18, 20];
    for (let d = 1; d <= days; d++) {
      const day = addDays(now, d);
      for (let p = 0; p < postsPerDay; p++) {
        const hour = peakHours[Math.floor(Math.random() * peakHours.length)];
        const minute = Math.floor(Math.random() * 60);
        let slotDate = setHours(day, hour);
        slotDate = setMinutes(slotDate, minute);
        slots.push(slotDate.toISOString());
      }
    }
    return slots.sort();
  };

  const handleGenerate = async () => {
    if (!topic.trim()) { toast.error('Please enter a topic'); return; }
    if (selectedPageIds.length === 0) { toast.error('Select at least one page'); return; }

    setIsGenerating(true);
    setStep('setup');

    try {
      const headers = await getHeaders();
      const totalPosts = days * postsPerDay;
      const postsNeeded = Math.ceil(totalPosts / selectedPageIds.length) * selectedPageIds.length;

      const res = await fetch(`${API}/api/ai/generate`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ topic, count: postsNeeded, language, tone }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Generation failed');

      const aiPosts: string[] = data.posts;
      const slots = generateSlots();

      const preview: GeneratedPost[] = [];
      let postIdx = 0;
      for (let i = 0; i < slots.length; i++) {
        const pageId = selectedPageIds[i % selectedPageIds.length];
        const page = pages.find(p => p.id === pageId);
        preview.push({
          content: aiPosts[postIdx % aiPosts.length],
          scheduledFor: slots[i],
          pageId,
          pageName: page?.name || '',
          status: 'pending',
        });
        postIdx++;
      }

      setGeneratedPosts(preview);
      setStep('preview');
      toast.success(`Generated ${preview.length} posts — review and schedule!`);
    } catch (err: any) {
      toast.error(err.message || 'Generation failed');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleScheduleAll = async () => {
    setIsScheduling(true);
    setScheduledCount(0);
    let done = 0;
    const headers = await getHeaders();

    const updated = [...generatedPosts];
    for (let i = 0; i < updated.length; i++) {
      updated[i] = { ...updated[i], status: 'scheduling' };
      setGeneratedPosts([...updated]);
      try {
        const res = await fetch(`${API}/api/posts`, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            pageId: updated[i].pageId,
            content: updated[i].content,
            scheduledFor: updated[i].scheduledFor,
          }),
        });
        if (!res.ok) throw new Error('Failed');
        updated[i] = { ...updated[i], status: 'done' };
        done++;
        setScheduledCount(done);
      } catch (e: any) {
        updated[i] = { ...updated[i], status: 'error', error: e.message };
      }
      setGeneratedPosts([...updated]);
    }
    setIsScheduling(false);
    setStep('done');
    toast.success(`${done} posts scheduled successfully!`);
  };

  const handleGenerateStory = async () => {
    if (!storyPrompt.trim()) { toast.error('Please enter a story prompt'); return; }
    if (!storyPageId) { toast.error('Select a page'); return; }

    setIsGeneratingStory(true);
    setStoryResult(null);
    setStoryStep('setup');

    try {
      const headers = await getHeaders();
      const res = await fetch(`${API}/api/ai/generate-story`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ prompt: storyPrompt, language: storyLanguage, tone: storyTone }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Story generation failed');

      setStoryResult(data);
      setStoryCaption(data.caption);
      setStoryStep('preview');
      toast.success(data.imageUrl ? 'Story + image generated!' : 'Story generated! (Image generation failed, text only)');
    } catch (err: any) {
      toast.error(err.message || 'Story generation failed');
    } finally {
      setIsGeneratingStory(false);
    }
  };

  const handleScheduleStory = async () => {
    if (!storyCaption.trim()) { toast.error('Story caption is empty'); return; }
    if (!storyPageId) { toast.error('Select a page'); return; }

    setIsSchedulingStory(true);
    try {
      const headers = await getHeaders();
      const res = await fetch(`${API}/api/posts`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          pageId: storyPageId,
          content: storyCaption,
          scheduledFor: new Date(storyScheduledFor).toISOString(),
          imageUrl: storyResult?.imageUrl || null,
        }),
      });
      if (!res.ok) throw new Error('Failed to schedule');
      setStoryStep('done');
      toast.success('Story post scheduled!');
    } catch (err: any) {
      toast.error(err.message || 'Scheduling failed');
    } finally {
      setIsSchedulingStory(false);
    }
  };

  const editPost = (i: number, content: string) => {
    setGeneratedPosts(prev => prev.map((p, idx) => idx === i ? { ...p, content } : p));
  };

  const removePost = (i: number) => {
    setGeneratedPosts(prev => prev.filter((_, idx) => idx !== i));
  };

  const selectedPages = pages.filter(p => selectedPageIds.includes(p.id));
  const selectedStoryPage = pages.find(p => p.id === storyPageId);

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fade-in-up">
      {/* Header */}
      <div>
        <h2 className={`text-2xl md:text-3xl font-black tracking-tight mb-1 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}
          style={{ fontFamily: 'Merriweather, serif' }}>
          AI Intelligence
        </h2>
        <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
          Generate and auto-schedule AI-written posts to your Facebook pages.
        </p>
      </div>

      {/* Mode Toggle */}
      <div className={`flex items-center gap-1 p-1 rounded-xl w-fit ${isDarkMode ? 'bg-white/5' : 'bg-slate-100'}`}>
        <button
          onClick={() => setMode('batch')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
            mode === 'batch'
              ? 'bg-blue-600 text-white shadow-sm'
              : isDarkMode ? 'text-white/50 hover:text-white/80' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          Batch Posts
        </button>
        <button
          onClick={() => setMode('story')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
            mode === 'story'
              ? 'bg-violet-600 text-white shadow-sm'
              : isDarkMode ? 'text-white/50 hover:text-white/80' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <ImageIcon className="w-3.5 h-3.5" />
          Story + Image
        </button>
      </div>

      {/* ─── BATCH MODE ─── */}
      {mode === 'batch' && (
        <>
          {step === 'setup' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className={`lg:col-span-1 rounded-2xl p-6 space-y-5 ${card}`}>
                <p className={`text-[10px] font-black tracking-[0.15em] uppercase ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                  Configuration
                </p>

                <div>
                  <label className={`block text-xs font-bold mb-2 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Post Topic / Niche</label>
                  <textarea
                    value={topic}
                    onChange={e => setTopic(e.target.value)}
                    placeholder="e.g. healthy breakfast recipes, motivational quotes, travel tips in Nepal..."
                    rows={3}
                    className={`w-full rounded-xl px-4 py-3 text-sm outline-none resize-none transition-all ${input}`}
                  />
                </div>

                <div>
                  <label className={`block text-xs font-bold mb-2 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Post to Pages</label>
                  <div className="relative">
                    <button
                      onClick={() => setShowPageDrop(v => !v)}
                      className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-sm transition-all ${input}`}
                    >
                      <span className={selectedPageIds.length === 0 ? (isDarkMode ? 'text-white/30' : 'text-slate-400') : ''}>
                        {selectedPageIds.length === 0 ? 'Select pages...' : selectedPages.map(p => p.name).join(', ')}
                      </span>
                      <ChevronDown className={`w-4 h-4 flex-shrink-0 transition-transform ${showPageDrop ? 'rotate-180' : ''} ${isDarkMode ? 'text-white/30' : 'text-slate-400'}`} />
                    </button>
                    {showPageDrop && (
                      <div className={`absolute top-full left-0 right-0 mt-1.5 rounded-xl border shadow-xl z-20 overflow-hidden ${isDarkMode ? 'bg-[#0f0f1a] border-white/10' : 'bg-white border-slate-100'}`}>
                        {pages.length === 0 ? (
                          <p className={`px-4 py-3 text-xs ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>No pages connected.</p>
                        ) : pages.map(page => (
                          <button
                            key={page.id}
                            onClick={() => setSelectedPageIds(prev => prev.includes(page.id) ? prev.filter(id => id !== page.id) : [...prev, page.id])}
                            className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${isDarkMode ? 'hover:bg-white/5' : 'hover:bg-slate-50'}`}
                          >
                            <div className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 ${selectedPageIds.includes(page.id) ? 'bg-blue-500 border-blue-500' : isDarkMode ? 'border-white/20' : 'border-slate-300'}`}>
                              {selectedPageIds.includes(page.id) && <CheckCircle className="w-3 h-3 text-white" />}
                            </div>
                            <span className={`text-sm font-semibold truncate ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>{page.name}</span>
                          </button>
                        ))}
                        <div className="p-2 border-t border-white/5">
                          <button onClick={() => setShowPageDrop(false)} className="w-full py-1.5 text-xs font-bold text-blue-400 hover:text-blue-300">Done</button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className={`block text-xs font-bold mb-2 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Language</label>
                  <select value={language} onChange={e => setLanguage(e.target.value)} className={`w-full rounded-xl px-4 py-2.5 text-sm outline-none appearance-none cursor-pointer ${input}`}>
                    {LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>

                <div>
                  <label className={`block text-xs font-bold mb-2 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Tone</label>
                  <div className="flex flex-wrap gap-1.5">
                    {TONES.map(t => (
                      <button key={t} onClick={() => setTone(t)}
                        className={`px-3 py-1 rounded-lg text-xs font-bold capitalize transition-all ${
                          tone === t ? 'bg-blue-500 text-white'
                            : isDarkMode ? 'bg-white/5 text-white/40 hover:text-white/70 hover:bg-white/10'
                            : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                        }`}>{t}</button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={`block text-xs font-bold mb-2 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Days</label>
                    <input type="number" min={1} max={30} value={days} onChange={e => setDays(Number(e.target.value))} className={`w-full rounded-xl px-3 py-2.5 text-sm outline-none ${input}`} />
                  </div>
                  <div>
                    <label className={`block text-xs font-bold mb-2 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Posts/Day</label>
                    <input type="number" min={1} max={10} value={postsPerDay} onChange={e => setPostsPerDay(Number(e.target.value))} className={`w-full rounded-xl px-3 py-2.5 text-sm outline-none ${input}`} />
                  </div>
                </div>

                <div className={`rounded-xl p-3 text-xs font-semibold ${isDarkMode ? 'bg-blue-500/10 text-blue-300 border border-blue-500/20' : 'bg-blue-50 text-blue-700'}`}>
                  <Globe className="w-3.5 h-3.5 inline mr-1" />
                  {days * postsPerDay} posts total across {selectedPageIds.length || '?'} page{selectedPageIds.length !== 1 ? 's' : ''} over {days} days
                </div>

                <button
                  onClick={handleGenerate}
                  disabled={isGenerating || !topic.trim() || selectedPageIds.length === 0}
                  className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-black text-sm text-white bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 shadow-lg shadow-blue-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isGenerating ? <><Loader2 className="w-4 h-4 animate-spin" /> Generating with AI...</> : <><Sparkles className="w-4 h-4" /> Generate Posts</>}
                </button>
              </div>

              <div className={`lg:col-span-2 rounded-2xl p-8 flex flex-col items-center justify-center text-center ${card}`}>
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500/20 to-violet-500/20 flex items-center justify-center mb-4">
                  <Sparkles className={`w-8 h-8 ${isDarkMode ? 'text-blue-400' : 'text-blue-500'}`} />
                </div>
                <h3 className={`text-xl font-black mb-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>AI Post Generator</h3>
                <p className={`text-sm max-w-sm ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                  Enter a topic, choose your pages and schedule, then let AI write unique posts and schedule them automatically.
                </p>
                <div className={`mt-6 grid grid-cols-3 gap-4 w-full max-w-sm text-xs font-bold ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                  {['1. Enter topic', '2. AI writes posts', '3. Auto-scheduled'].map((s, i) => (
                    <div key={i} className={`rounded-xl p-3 ${isDarkMode ? 'bg-white/3' : 'bg-slate-50'}`}>{s}</div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 'preview' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                  <h3 className={`text-lg font-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Review Posts ({generatedPosts.length})</h3>
                  <p className={`text-xs ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Edit any post before scheduling. All times are peak engagement hours.</p>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => setStep('setup')} className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${isDarkMode ? 'bg-white/5 text-white/50 hover:bg-white/10' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>← Regenerate</button>
                  <button onClick={handleScheduleAll} disabled={isScheduling || generatedPosts.length === 0} className="flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-black text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-lg shadow-emerald-500/20 transition-all disabled:opacity-50">
                    {isScheduling ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Scheduling {scheduledCount}/{generatedPosts.length}</> : <><Send className="w-3.5 h-3.5" /> Schedule All</>}
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[65vh] overflow-y-auto pr-1">
                {generatedPosts.map((post, i) => (
                  <div key={i} className={`rounded-2xl p-4 space-y-3 border transition-all ${
                    post.status === 'done' ? (isDarkMode ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-emerald-200 bg-emerald-50')
                    : post.status === 'error' ? (isDarkMode ? 'border-red-500/30 bg-red-500/5' : 'border-red-200 bg-red-50')
                    : isDarkMode ? 'bg-[#0d0d16] border-white/[0.06]' : 'bg-white border-slate-100 shadow-sm'
                  }`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {post.status === 'done' && <CheckCircle className="w-4 h-4 text-emerald-500" />}
                        {post.status === 'error' && <XCircle className="w-4 h-4 text-red-500" />}
                        {post.status === 'scheduling' && <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />}
                        <span className={`text-xs font-bold ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>{post.pageName}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-bold flex items-center gap-1 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                          <Clock className="w-3 h-3" />
                          {format(new Date(post.scheduledFor), 'MMM d, h:mm a')}
                        </span>
                        {post.status === 'pending' && (
                          <button onClick={() => removePost(i)} className={`text-[10px] font-bold px-2 py-0.5 rounded-lg transition-all ${isDarkMode ? 'text-red-400/60 hover:bg-red-500/10 hover:text-red-400' : 'text-red-400 hover:bg-red-50'}`}>remove</button>
                        )}
                      </div>
                    </div>
                    <textarea
                      value={post.content}
                      onChange={e => editPost(i, e.target.value)}
                      disabled={post.status !== 'pending'}
                      rows={4}
                      className={`w-full text-sm rounded-xl px-3 py-2 outline-none resize-none transition-all ${post.status !== 'pending' ? 'opacity-60 cursor-default' : ''} ${isDarkMode ? 'bg-white/5 text-white/80 border border-white/10 focus:border-blue-500/40' : 'bg-slate-50 text-slate-800 border border-slate-100 focus:border-blue-300'}`}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {step === 'done' && (
            <div className={`rounded-2xl p-10 flex flex-col items-center justify-center text-center ${card}`}>
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 flex items-center justify-center mb-4">
                <Zap className="w-8 h-8 text-emerald-400" />
              </div>
              <h3 className={`text-2xl font-black mb-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{scheduledCount} Posts Scheduled!</h3>
              <p className={`text-sm mb-6 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>AI-generated posts have been added to your schedule.</p>
              <div className="flex items-center gap-3">
                <button onClick={() => { setStep('setup'); setGeneratedPosts([]); setTopic(''); }} className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${isDarkMode ? 'bg-white/5 text-white/70 hover:bg-white/10' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}>Generate More</button>
                <a href="/my-posts" className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-black text-white bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 shadow-lg shadow-blue-500/20 transition-all">View Scheduled Posts →</a>
              </div>
            </div>
          )}
        </>
      )}

      {/* ─── STORY + IMAGE MODE ─── */}
      {mode === 'story' && (
        <>
          {storyStep === 'setup' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className={`lg:col-span-1 rounded-2xl p-6 space-y-5 ${card}`}>
                <p className={`text-[10px] font-black tracking-[0.15em] uppercase ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                  Story Configuration
                </p>

                <div>
                  <label className={`block text-xs font-bold mb-2 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Story Prompt</label>
                  <textarea
                    value={storyPrompt}
                    onChange={e => setStoryPrompt(e.target.value)}
                    placeholder="e.g. A small boy lost in the mountains of Nepal who found his way home..."
                    rows={4}
                    className={`w-full rounded-xl px-4 py-3 text-sm outline-none resize-none transition-all ${input}`}
                  />
                  <p className={`mt-1.5 text-[10px] ${isDarkMode ? 'text-slate-600' : 'text-slate-400'}`}>
                    This prompt generates both the image and the story caption.
                  </p>
                </div>

                <div>
                  <label className={`block text-xs font-bold mb-2 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Post to Page</label>
                  <select
                    value={storyPageId}
                    onChange={e => setStoryPageId(e.target.value)}
                    className={`w-full rounded-xl px-4 py-2.5 text-sm outline-none appearance-none cursor-pointer ${input}`}
                  >
                    {pages.length === 0
                      ? <option value="">No pages connected</option>
                      : pages.map(p => <option key={p.id} value={p.id}>{p.name}</option>)
                    }
                  </select>
                </div>

                <div>
                  <label className={`block text-xs font-bold mb-2 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Language</label>
                  <select value={storyLanguage} onChange={e => setStoryLanguage(e.target.value)} className={`w-full rounded-xl px-4 py-2.5 text-sm outline-none appearance-none cursor-pointer ${input}`}>
                    {LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>

                <div>
                  <label className={`block text-xs font-bold mb-2 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Tone</label>
                  <div className="flex flex-wrap gap-1.5">
                    {TONES.map(t => (
                      <button key={t} onClick={() => setStoryTone(t)}
                        className={`px-3 py-1 rounded-lg text-xs font-bold capitalize transition-all ${
                          storyTone === t ? 'bg-violet-500 text-white'
                            : isDarkMode ? 'bg-white/5 text-white/40 hover:text-white/70 hover:bg-white/10'
                            : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                        }`}>{t}</button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className={`block text-xs font-bold mb-2 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Schedule For</label>
                  <input
                    type="datetime-local"
                    value={storyScheduledFor}
                    onChange={e => setStoryScheduledFor(e.target.value)}
                    className={`w-full rounded-xl px-4 py-2.5 text-sm outline-none transition-all ${input}`}
                  />
                </div>

                <button
                  onClick={handleGenerateStory}
                  disabled={isGeneratingStory || !storyPrompt.trim() || !storyPageId}
                  className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-black text-sm text-white bg-gradient-to-r from-violet-600 to-pink-600 hover:from-violet-500 hover:to-pink-500 shadow-lg shadow-violet-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isGeneratingStory
                    ? <><Loader2 className="w-4 h-4 animate-spin" /> Generating story + image...</>
                    : <><ImageIcon className="w-4 h-4" /> Generate Story + Image</>
                  }
                </button>
              </div>

              <div className={`lg:col-span-2 rounded-2xl p-8 flex flex-col items-center justify-center text-center ${card}`}>
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500/20 to-pink-500/20 flex items-center justify-center mb-4">
                  <BookOpen className={`w-8 h-8 ${isDarkMode ? 'text-violet-400' : 'text-violet-500'}`} />
                </div>
                <h3 className={`text-xl font-black mb-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>AI Story Post</h3>
                <p className={`text-sm max-w-sm ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                  One prompt. AI generates a matching image with Pixazo and a compelling story caption with Groq — both scheduled together.
                </p>
                <div className={`mt-6 grid grid-cols-3 gap-4 w-full max-w-sm text-xs font-bold ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                  {['1. Enter prompt', '2. AI generates image + story', '3. Schedule post'].map((s, i) => (
                    <div key={i} className={`rounded-xl p-3 ${isDarkMode ? 'bg-white/3' : 'bg-slate-50'}`}>{s}</div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {storyStep === 'preview' && storyResult && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Image preview */}
              <div className={`rounded-2xl overflow-hidden ${card}`}>
                {storyResult.imageUrl ? (
                  <div>
                    <img src={storyResult.imageUrl} alt="Generated" className="w-full aspect-video object-cover" />
                    <div className="p-4">
                      <p className={`text-xs font-bold ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                        Generated by Pollinations AI (Flux)
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className={`aspect-video flex flex-col items-center justify-center gap-3 ${isDarkMode ? 'bg-white/3' : 'bg-slate-50'}`}>
                    <ImageIcon className={`w-10 h-10 ${isDarkMode ? 'text-slate-600' : 'text-slate-300'}`} />
                    <p className={`text-xs text-center max-w-xs ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                      Image generation timed out. Post will be scheduled as text-only.
                    </p>
                  </div>
                )}
              </div>

              {/* Story editor + schedule */}
              <div className={`rounded-2xl p-6 space-y-4 ${card}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-xs font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                      {selectedStoryPage?.name}
                    </p>
                    <p className={`text-[10px] flex items-center gap-1 mt-0.5 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                      <Clock className="w-3 h-3" />
                      {storyScheduledFor ? format(new Date(storyScheduledFor), 'MMM d, h:mm a') : 'No schedule'}
                    </p>
                  </div>
                  <button onClick={() => setStoryStep('setup')} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${isDarkMode ? 'bg-white/5 text-white/50 hover:bg-white/10' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                    ← Regenerate
                  </button>
                </div>

                <div>
                  <label className={`block text-xs font-bold mb-2 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Story Caption</label>
                  <textarea
                    value={storyCaption}
                    onChange={e => setStoryCaption(e.target.value)}
                    rows={10}
                    className={`w-full text-sm rounded-xl px-4 py-3 outline-none resize-none transition-all ${isDarkMode ? 'bg-white/5 text-white/80 border border-white/10 focus:border-violet-500/40' : 'bg-slate-50 text-slate-800 border border-slate-100 focus:border-violet-300'}`}
                  />
                  <p className={`mt-1 text-[10px] ${isDarkMode ? 'text-slate-600' : 'text-slate-400'}`}>
                    {storyCaption.length} characters · Edit freely before scheduling
                  </p>
                </div>

                <button
                  onClick={handleScheduleStory}
                  disabled={isSchedulingStory || !storyCaption.trim()}
                  className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-black text-sm text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-lg shadow-emerald-500/20 transition-all disabled:opacity-50"
                >
                  {isSchedulingStory ? <><Loader2 className="w-4 h-4 animate-spin" /> Scheduling...</> : <><Send className="w-4 h-4" /> Schedule Story Post</>}
                </button>
              </div>
            </div>
          )}

          {storyStep === 'done' && (
            <div className={`rounded-2xl p-10 flex flex-col items-center justify-center text-center ${card}`}>
              <div className="w-16 h-16 rounded-2xl bg-violet-500/20 flex items-center justify-center mb-4">
                <CheckCircle className="w-8 h-8 text-violet-400" />
              </div>
              <h3 className={`text-2xl font-black mb-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Story Post Scheduled!</h3>
              <p className={`text-sm mb-6 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                Your AI story {storyResult?.imageUrl ? 'with image ' : ''}has been added to your schedule.
              </p>
              <div className="flex items-center gap-3">
                <button onClick={() => { setStoryStep('setup'); setStoryResult(null); setStoryPrompt(''); setStoryCaption(''); }} className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${isDarkMode ? 'bg-white/5 text-white/70 hover:bg-white/10' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}>Create Another</button>
                <a href="/my-posts" className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-black text-white bg-gradient-to-r from-violet-600 to-pink-600 hover:from-violet-500 hover:to-pink-500 shadow-lg shadow-violet-500/20 transition-all">View Scheduled Posts →</a>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
