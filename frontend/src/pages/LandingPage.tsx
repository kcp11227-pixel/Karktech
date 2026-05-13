import { Link } from 'react-router-dom';
import { useEffect, useState, useRef } from 'react';
import type { LucideIcon } from 'lucide-react';
import {
  Calendar, Globe, Sparkles, ArrowRight,
  MessageSquare, Image as ImageIcon, Send, Video, Bot
} from 'lucide-react';

interface Feature { icon: LucideIcon; color: string; glow: string; title: string; desc: string; }
interface Step { icon: LucideIcon; title: string; desc: string; }

const FEATURES: Feature[] = [
  { icon: Globe,        color: 'from-blue-500 to-cyan-500',    glow: 'shadow-blue-500/20',    title: 'Multi-Page Support', desc: 'Connect and manage unlimited Facebook pages from a single dashboard.' },
  { icon: Calendar,     color: 'from-violet-500 to-purple-500',glow: 'shadow-violet-500/20',  title: 'Smart Scheduling',   desc: 'Auto-detect the best posting times for each country and timezone.' },
  { icon: Sparkles,     color: 'from-amber-500 to-orange-500', glow: 'shadow-amber-500/20',   title: 'AI Assist',          desc: 'Generate captions, hashtags, and content ideas with AI.' },
  { icon: ImageIcon,    color: 'from-emerald-500 to-teal-500', glow: 'shadow-emerald-500/20', title: 'Media Upload',       desc: 'Upload photos and videos with auto Reel / Story format detection.' },
  { icon: MessageSquare,color: 'from-pink-500 to-rose-500',    glow: 'shadow-pink-500/20',    title: 'Live FB Preview',    desc: 'See exactly how your post looks on Facebook before publishing.' },
  { icon: Video,        color: 'from-cyan-500 to-blue-500',    glow: 'shadow-cyan-500/20',    title: 'Reels & Stories',    desc: 'Vertical format auto-detection switches you to the right mode instantly.' },
];

const STEPS: Step[] = [
  { icon: Globe,         title: 'Connect your Pages',   desc: 'Paste your Facebook access token and all your pages are instantly available.' },
  { icon: MessageSquare, title: 'Create your Post',     desc: 'Write content, add media, use hashtags, and preview exactly how it looks.' },
  { icon: Send,          title: 'Schedule or Publish',  desc: 'Pick a time, use smart auto-scheduling, or go live immediately.' },
];

const STATUS_STYLE: Record<string, string> = {
  PUBLISHED: 'bg-green-500/15 text-green-400',
  SCHEDULED: 'bg-blue-500/15 text-blue-400',
  DRAFT:     'bg-amber-500/15 text-amber-400',
};

function DashboardPreview({ slide = 0 }: { slide?: number }) {
  const navItems = [
    { label: 'Overview', active: slide === 0 || slide === 3, dot: 'bg-blue-400',   text: 'text-blue-400' },
    { label: 'My Posts', active: slide === 2,                dot: 'bg-violet-400', text: 'text-violet-400' },
    { label: 'Calendar', active: slide === 1,                dot: 'bg-cyan-400',   text: 'text-cyan-400' },
    { label: 'Settings', active: false,                      dot: 'bg-rose-400',   text: 'text-rose-400' },
  ];

  const slides = [
    /* 0 — Overview */
    <div className="space-y-3" key="overview">
      <div className="bg-white/[0.04] border border-white/[0.06] rounded-xl p-3 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <img src="/hello.png.png" alt="" className="h-5 object-contain" />
            <span className="text-[11px] font-extrabold text-white">Bishal Karkee</span>
          </div>
          <p className="text-[9px] text-white/40">Same energy, new time</p>
        </div>
        <div className="text-[9px] font-bold px-3 py-1.5 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white">+ Connect Page</div>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {[{ l:'Pages Linked',v:'3',c:'text-indigo-400',d:'bg-indigo-500'},{l:'Posts / Week',v:'12',c:'text-blue-400',d:'bg-blue-500'},{l:'Engagement',v:'1.2k',c:'text-green-400',d:'bg-green-500'}].map((s)=>(
          <div key={s.l} className="bg-white/[0.04] border border-white/[0.06] rounded-xl p-2.5">
            <div className={`w-2 h-2 rounded-full ${s.d} mb-1.5`}/>
            <p className={`text-sm font-black ${s.c}`}>{s.v}</p>
            <p className="text-[8px] text-white/30 mt-0.5">{s.l}</p>
          </div>
        ))}
      </div>
      <div className="bg-white/[0.04] border border-white/[0.06] rounded-xl overflow-hidden">
        <div className="flex justify-between px-3 py-2 border-b border-white/[0.05]">
          <span className="text-[9px] font-black text-white/70">Scheduled Posts</span>
          <span className="text-[8px] font-bold text-blue-400">View All</span>
        </div>
        {[{c:'New product launch! 🚀',p:'Official',s:'PUBLISHED'},{c:'Join our webinar this Friday...',p:'Marketing',s:'SCHEDULED'},{c:'Draft: Behind the scenes...',p:'Design',s:'DRAFT'}].map((p,i)=>(
          <div key={i} className="flex items-center gap-2 px-3 py-2 border-b border-white/[0.03] last:border-0">
            <p className="text-[9px] text-white/55 truncate flex-1">{p.c}</p>
            <span className="text-[7px] text-indigo-400 bg-indigo-500/10 px-1.5 py-0.5 rounded">{p.p}</span>
            <span className={`text-[7px] font-black px-1.5 py-0.5 rounded-full ${STATUS_STYLE[p.s]}`}>{p.s}</span>
          </div>
        ))}
      </div>
    </div>,

    /* 1 — Calendar */
    <div className="space-y-2" key="calendar">
      <div className="flex items-center justify-between mb-1">
        <span className="text-[11px] font-black text-white/80">May 2026</span>
        <span className="text-[9px] text-cyan-400 font-bold bg-cyan-500/10 px-2 py-1 rounded-lg">12 scheduled</span>
      </div>
      <div className="grid grid-cols-7 gap-1">
        {['M','T','W','T','F','S','S'].map((d,i)=><div key={i} className="text-center text-[8px] text-white/25 font-bold py-1">{d}</div>)}
        {[...Array(31)].map((_,i)=>{
          const has=[2,5,8,11,14,17,20,23,26].includes(i), today=i===10;
          return <div key={i} className={`h-7 rounded-lg flex items-center justify-center text-[9px] font-bold relative ${today?'bg-cyan-500/30 text-cyan-300':has?'bg-white/[0.06] text-white/70':'text-white/20'}`}>
            {i+1}{has&&<div className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-cyan-400"/>}
          </div>;
        })}
      </div>
      <div className="space-y-1.5 mt-1">
        {['9:00 AM — KarkTech Official','2:00 PM — KarkTech Marketing','7:00 PM — KarkTech Design'].map((t,i)=>(
          <div key={i} className="flex items-center gap-2 bg-white/[0.04] rounded-lg px-2.5 py-2">
            <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 flex-shrink-0"/>
            <span className="text-[9px] text-white/45">{t}</span>
          </div>
        ))}
      </div>
    </div>,

    /* 2 — My Posts */
    <div className="space-y-1.5" key="myposts">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[11px] font-black text-white/80">My Posts</span>
        <div className="flex gap-1">
          {['All','Published','Scheduled','Draft'].map((f,i)=>(
            <span key={i} className={`text-[8px] font-bold px-2 py-1 rounded-lg ${i===0?'bg-violet-500/20 text-violet-400':'text-white/25'}`}>{f}</span>
          ))}
        </div>
      </div>
      {[{c:'Excited to announce our new product launch! 🚀',p:'KarkTech Official',s:'PUBLISHED',d:'May 10'},{c:'Join our webinar on advanced marketing strategies.',p:'KarkTech Marketing',s:'SCHEDULED',d:'May 13'},{c:'Tips for growing your Facebook page organically...',p:'KarkTech Official',s:'SCHEDULED',d:'May 15'},{c:'Draft: Behind the scenes of our design process...',p:'KarkTech Design',s:'DRAFT',d:'—'}].map((p,i)=>(
        <div key={i} className="flex items-center gap-2.5 bg-white/[0.03] border border-white/[0.05] rounded-xl p-2.5">
          <div className="w-7 h-7 rounded-lg bg-[#1877F2]/20 flex items-center justify-center flex-shrink-0">
            <span className="text-[9px] font-black text-[#60a5fa]">f</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[9px] text-white/60 truncate">{p.c}</p>
            <p className="text-[7px] text-white/25 mt-0.5">{p.p}</p>
          </div>
          <span className={`text-[7px] font-black px-1.5 py-0.5 rounded-full flex-shrink-0 ${STATUS_STYLE[p.s]}`}>{p.s}</span>
          <span className="text-[7px] text-white/20 flex-shrink-0">{p.d}</span>
        </div>
      ))}
    </div>,

    /* 3 — Compose */
    <div className="space-y-2" key="compose">
      <div className="flex items-center justify-between mb-1">
        <span className="text-[11px] font-black text-white/80">Create Post</span>
        <div className="flex gap-1">
          {['Post','Reel','Story'].map((t,i)=>(
            <span key={i} className={`text-[8px] font-bold px-2.5 py-1 rounded-lg ${i===0?'bg-blue-500/20 text-blue-400':'text-white/25 bg-white/[0.03]'}`}>{t}</span>
          ))}
        </div>
      </div>
      <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-3">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-6 h-6 rounded-lg bg-[#1877F2] flex items-center justify-center flex-shrink-0">
            <span className="text-[8px] font-black text-white">f</span>
          </div>
          <span className="text-[9px] text-white/40">KarkTech Official ▾</span>
        </div>
        <div className="bg-white/[0.04] rounded-lg p-2.5 mb-2 min-h-[55px]">
          <p className="text-[9px] text-white/60 leading-relaxed">Excited to announce our new product launch! 🚀 <span className="text-blue-400">#KarkTech #Launch</span></p>
        </div>
        <div className="flex items-center gap-1.5 mb-2">
          {['📷 Photo','🎥 Video','✦ AI','# Tags'].map((b,i)=>(
            <span key={i} className="text-[8px] text-white/35 bg-white/[0.04] px-2 py-1 rounded-lg">{b}</span>
          ))}
        </div>
        <div className="flex gap-2">
          <div className="flex-1 bg-white/[0.03] border border-white/[0.06] rounded-lg px-2 py-1.5">
            <span className="text-[8px] text-white/25">📅 Schedule for later...</span>
          </div>
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg px-3 py-1.5">
            <span className="text-[9px] font-bold text-white">Post Now</span>
          </div>
        </div>
      </div>
    </div>,
  ];

  return (
    <div className="flex w-full h-full overflow-hidden rounded-[14px] bg-[#0a0a14]">
      <div className="w-[130px] flex-shrink-0 flex flex-col bg-[#0d0d1a] border-r border-white/[0.06] py-4 px-3">
        <div className="flex items-center gap-1.5 mb-6 px-1">
          <div className="w-5 h-5 rounded-md overflow-hidden flex-shrink-0">
            <img src="/karklogo.png.png" alt="" className="w-full h-full object-contain" />
          </div>
          <span className="text-[10px] font-black bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent">KarkTech</span>
        </div>
        <div className="space-y-0.5 flex-1">
          {navItems.map((item) => (
            <div key={item.label} className={`flex items-center gap-2 px-2 py-1.5 rounded-lg text-[10px] font-bold transition-all duration-300 ${item.active ? item.text + ' bg-white/[0.06]' : 'text-white/25'}`}>
              <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 transition-all duration-300 ${item.active ? item.dot : 'bg-white/15'}`}/>
              {item.label}
            </div>
          ))}
        </div>
        <div className="flex items-center gap-1.5 px-1">
          <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center flex-shrink-0">
            <span className="text-[8px] font-black text-white">BK</span>
          </div>
          <div>
            <p className="text-[8px] font-bold text-white/70 leading-none">Bishal</p>
            <p className="text-[7px] text-white/30 leading-none mt-0.5">User</p>
          </div>
        </div>
      </div>
      <div className="flex-1 overflow-hidden p-3.5 relative">
        {slides.map((s, i) => (
          <div key={i} className="absolute inset-3.5 transition-all duration-500 ease-out overflow-auto"
            style={{ opacity: slide === i ? 1 : 0, transform: `translateX(${slide === i ? 0 : slide > i ? -24 : 24}px)`, pointerEvents: slide === i ? 'auto' : 'none' }}>
            {s}
          </div>
        ))}
      </div>
    </div>
  );
}

const SLIDES = [
  {
    num: '01', title: 'Smart Scheduling',
    desc: 'Auto-detect the best posting times for each country and timezone. Never miss peak engagement.',
    accent: '#a78bfa',
    visual: (
      <div className="space-y-2">
        <div className="grid grid-cols-7 gap-1 mb-3">
          {['M','T','W','T','F','S','S'].map((d,i) => <div key={i} className="text-center text-[9px] text-white/30 font-bold">{d}</div>)}
          {[...Array(28)].map((_,i) => (
            <div key={i} className={`h-6 rounded-md flex items-center justify-center text-[9px] font-bold transition-all ${[3,8,10,15,17,22].includes(i) ? 'bg-violet-500/40 text-violet-300' : 'bg-white/[0.04] text-white/20'}`}>
              {i+1}
            </div>
          ))}
        </div>
        <div className="space-y-1.5">
          {['9:00 AM — KarkTech Official','2:00 PM — KarkTech Marketing','7:00 PM — KarkTech Design'].map((t,i) => (
            <div key={i} className="flex items-center gap-2 bg-white/[0.04] rounded-lg px-3 py-2">
              <div className="w-1.5 h-1.5 rounded-full bg-violet-400 flex-shrink-0" />
              <span className="text-[10px] text-white/50">{t}</span>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    num: '02', title: 'Multi-Page Control',
    desc: 'Connect unlimited Facebook pages and manage them all from a single powerful dashboard.',
    accent: '#60a5fa',
    visual: (
      <div className="space-y-2">
        {[
          { name: 'KarkTech Official', fans: '24.5k', posts: 142, dot: 'bg-green-400' },
          { name: 'KarkTech Marketing', fans: '11.2k', posts: 89, dot: 'bg-blue-400' },
          { name: 'KarkTech Design', fans: '8.9k', posts: 67, dot: 'bg-violet-400' },
        ].map((p, i) => (
          <div key={i} className="flex items-center gap-3 bg-white/[0.04] border border-white/[0.06] rounded-xl px-4 py-3">
            <div className="w-9 h-9 rounded-xl bg-[#1877F2] flex items-center justify-center flex-shrink-0">
              <span className="text-[10px] font-black text-white">f</span>
            </div>
            <div className="flex-1">
              <p className="text-[11px] font-bold text-white/80">{p.name}</p>
              <p className="text-[9px] text-white/30">{p.fans} followers</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-bold text-white/50">{p.posts} posts</p>
              <div className={`w-2 h-2 rounded-full ${p.dot} ml-auto mt-1`} />
            </div>
          </div>
        ))}
      </div>
    ),
  },
  {
    num: '03', title: 'AI Content',
    desc: 'Generate captions, hashtags, and post ideas instantly. Just describe what you need.',
    accent: '#fbbf24',
    visual: (
      <div className="space-y-3">
        <div className="bg-white/[0.04] border border-white/[0.06] rounded-xl p-3">
          <p className="text-[9px] text-white/30 mb-2 font-semibold uppercase tracking-wider">Prompt</p>
          <p className="text-[11px] text-white/60">"Write a post about our new product launch with emojis and hashtags"</p>
        </div>
        <div className="bg-amber-500/[0.06] border border-amber-500/20 rounded-xl p-3">
          <p className="text-[9px] text-amber-400/70 mb-2 font-semibold uppercase tracking-wider">✦ AI Generated</p>
          <p className="text-[11px] text-white/70 leading-relaxed">🚀 Big news! We're thrilled to announce our latest innovation... <span className="text-amber-400">#ProductLaunch #KarkTech #Innovation #Marketing</span></p>
        </div>
        <div className="flex gap-2">
          {['Regenerate','Use This','Edit'].map((btn,i) => (
            <div key={i} className={`flex-1 text-center py-1.5 rounded-lg text-[9px] font-bold ${i===1 ? 'bg-amber-500/20 text-amber-400' : 'bg-white/[0.04] text-white/30'}`}>{btn}</div>
          ))}
        </div>
      </div>
    ),
  },
  {
    num: '04', title: 'Live Preview',
    desc: 'See exactly how your post looks on Facebook before you publish. Post, Reel, or Story.',
    accent: '#34d399',
    visual: (
      <div className="flex gap-3">
        <div className="flex-1 bg-white/[0.04] border border-white/[0.06] rounded-xl overflow-hidden">
          <div className="bg-white/[0.04] px-3 py-2 border-b border-white/[0.05] flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-[#1877F2]" />
            <div>
              <p className="text-[9px] font-bold text-white/70">KarkTech Official</p>
              <p className="text-[8px] text-white/30">Just now · 🌐</p>
            </div>
          </div>
          <div className="p-3">
            <p className="text-[10px] text-white/60 leading-relaxed mb-2">Excited to announce our new product launch! 🚀 #KarkTech</p>
            <div className="h-16 bg-gradient-to-br from-blue-500/20 to-violet-500/20 rounded-lg" />
          </div>
          <div className="flex border-t border-white/[0.05] divide-x divide-white/[0.05]">
            {['👍 Like','💬 Comment','↗ Share'].map((a,i) => (
              <div key={i} className="flex-1 text-center py-1.5 text-[8px] text-white/25 font-semibold">{a}</div>
            ))}
          </div>
        </div>
        <div className="w-[70px] bg-white/[0.04] border border-white/[0.06] rounded-xl overflow-hidden flex flex-col">
          <div className="flex-1 bg-gradient-to-b from-emerald-500/20 to-teal-500/10" />
          <div className="p-2 text-center">
            <p className="text-[8px] text-emerald-400 font-bold">Story</p>
          </div>
        </div>
      </div>
    ),
  },
];

const SCATTER_OFFSETS = [
  { x: -120, y: -60 }, { x: 80, y: -90 }, { x: -60, y: 70 },
  { x: 100, y: 50 },   { x: -90, y: -30 },{ x: 60, y: -80 },
  { x: -40, y: 90 },   { x: 110, y: -50 },{ x: -80, y: 60 },
  { x: 70, y: 80 },    { x: -110, y: 40 },{ x: 50, y: -70 },
  { x: -70, y: -90 },  { x: 90, y: 30 },  { x: -30, y: 100 },
];

function ScatterText({ text, className, style, offset = 0 }: { text: string; className?: string; style?: React.CSSProperties; offset?: number }) {
  return (
    <span className={className} style={{ display: 'inline-block', ...style }}>
      {text.split('').map((char, i) => {
        const idx = i + offset;
        const off = SCATTER_OFFSETS[idx % SCATTER_OFFSETS.length];
        return (
          <span
            key={i}
            style={{
              display: char === ' ' ? 'inline' : 'inline-block',
              animation: char === ' ' ? undefined : `scatter-settle 1.4s cubic-bezier(0.22,1,0.36,1) ${idx * 80}ms both`,
              '--sx': `${off.x}px`,
              '--sy': `${off.y}px`,
            } as React.CSSProperties}
          >
            {char === ' ' ? ' ' : char}
          </span>
        );
      })}
    </span>
  );
}

export default function LandingPage() {
  const [contentSlide, setContentSlide] = useState(0);
  const [scale, setScale] = useState(1);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => {
      if (!sectionRef.current) return;
      const rect = sectionRef.current.getBoundingClientRect();
      const scrolled = -rect.top;
      const total = sectionRef.current.offsetHeight - window.innerHeight;
      const progress = Math.max(0, Math.min(1, scrolled / total));
      setScale(1 + progress * 0.14);
      setContentSlide(Math.min(Math.floor(progress * 4), 3));
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="min-h-screen text-slate-900 overflow-x-hidden" style={{ background: '#FAF9F6' }}>

      {/* ── BACKGROUND — soft aurora blobs ── */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        {/* top-left violet */}
        <div style={{ position:'absolute', top:'-160px', left:'-100px', width:'700px', height:'700px', borderRadius:'50%', background:'radial-gradient(circle, rgba(139,92,246,0.13) 0%, transparent 65%)', filter:'blur(80px)' }} />
        {/* top-right rose */}
        <div style={{ position:'absolute', top:'-80px', right:'-80px', width:'600px', height:'600px', borderRadius:'50%', background:'radial-gradient(circle, rgba(236,72,153,0.09) 0%, transparent 65%)', filter:'blur(90px)' }} />
        {/* center blue */}
        <div style={{ position:'absolute', top:'30%', left:'30%', width:'800px', height:'800px', borderRadius:'50%', background:'radial-gradient(circle, rgba(59,130,246,0.08) 0%, transparent 60%)', filter:'blur(100px)' }} />
        {/* bottom cyan */}
        <div style={{ position:'absolute', bottom:'-100px', right:'20%', width:'500px', height:'500px', borderRadius:'50%', background:'radial-gradient(circle, rgba(34,211,238,0.07) 0%, transparent 65%)', filter:'blur(80px)' }} />
      </div>

      {/* ── NAV ── */}
      <div className="fixed top-[26px] left-0 right-0 z-50 flex justify-center px-6">
        <div className="w-full max-w-2xl rounded-[22px] relative overflow-hidden"
          style={{ boxShadow: '0 2px 4px rgba(0,0,0,0.10), 0 12px 40px rgba(0,0,0,0.22)' }}
        >
          {/* Layer 1 — very light blur so blobs show through clearly */}
          <div className="absolute inset-0" style={{
            backdropFilter: 'blur(12px) saturate(200%) brightness(1.05)',
            WebkitBackdropFilter: 'blur(12px) saturate(200%) brightness(1.05)',
          }} />

          {/* Layer 2 — almost invisible glass tint */}
          <div className="absolute inset-0" style={{
            background: 'linear-gradient(160deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.01) 50%, rgba(255,255,255,0.04) 100%)',
          }} />

          {/* Layer 3 — sharp glass edges */}
          <div className="absolute inset-0 rounded-[22px]" style={{
            border: '1px solid rgba(255,255,255,0.18)',
            boxShadow:
              'inset 0 1.5px 0 rgba(255,255,255,0.85),' +
              'inset 0 -1px 0 rgba(255,255,255,0.10),' +
              'inset 1.5px 0 0 rgba(255,255,255,0.20),' +
              'inset -1.5px 0 0 rgba(255,255,255,0.20)',
          }} />

          {/* Layer 4 — faint top-left catch light */}
          <div className="absolute inset-0" style={{
            background: 'linear-gradient(125deg, rgba(255,255,255,0.07) 0%, transparent 40%)',
          }} />

          {/* Layer 5 — content */}
          <div className="relative z-10 flex items-center justify-between px-5 py-3">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md overflow-hidden">
                <img src="/karklogo.png.png" alt="KarkTech" className="w-full h-full object-contain" />
              </div>
              <span className="text-base font-black tracking-tight bg-gradient-to-r from-blue-400 via-violet-300 to-cyan-400 bg-clip-text text-transparent" style={{ WebkitTextStroke: '0.3px transparent' }}>
                KarkTech
              </span>
            </div>
            <div className="flex items-center gap-6">
              <Link to="/login"    className="text-[13px] font-black text-slate-900 hover:text-black transition-colors">Log in</Link>
              <Link to="/register" className="text-[13px] font-black text-slate-900 hover:text-black transition-colors">Get Started</Link>
            </div>
          </div>
        </div>
      </div>

      {/* ── HERO ── */}
      <section className="relative z-10 flex flex-col items-center justify-center text-center px-6" style={{ minHeight: '100vh', paddingTop: '120px', paddingBottom: '80px' }}>
        <h1 className="text-6xl md:text-7xl font-black tracking-tight leading-[1.05] mb-6 max-w-3xl">
          <ScatterText text="The " className="text-black" offset={0} /><ScatterText text="fastest" className="text-black" style={{ fontFamily: 'Gaprio, sans-serif', fontWeight: 900 }} offset={4} /><ScatterText text=" way to" className="text-black" offset={11} />
          <br />
          <span style={{ fontFamily: 'Belgino, sans-serif', fontWeight: 900, color: '#FACC15' }}>grow </span>
          <ScatterText text="on " className="text-black" />{' '}
          <span style={{ fontFamily: 'NeoPro, sans-serif', fontWeight: 900, color: '#1877F2' }}>Facebook.</span>
        </h1>

        <p className="text-[17px] font-medium max-w-xl leading-relaxed mb-10" style={{ color: '#1d1d1f', fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Helvetica Neue", sans-serif', letterSpacing: '-0.01em' }}>
          Schedule posts, manage multiple pages, and create content with AI — all from one beautifully designed dashboard.
        </p>

        <div className="flex items-center gap-3">
          <Link to="/register" className="flex items-center gap-2 px-7 py-3.5 rounded-2xl font-black text-sm border border-slate-900 text-slate-900 hover:bg-slate-900 hover:text-white transition-all">
            Get Started Free <ArrowRight className="w-4 h-4" />
          </Link>
          <Link to="/login" className="flex items-center gap-2 px-7 py-3.5 rounded-2xl font-black text-sm border border-slate-900 text-slate-900 hover:bg-slate-900 hover:text-white transition-all">
            Sign In
          </Link>
        </div>

        <p className="mt-5 text-[11px] text-slate-400 font-semibold tracking-wide">No credit card required · Free to use</p>
      </section>

      {/* ── STICKY SCROLL SECTION — zoom + slide ── */}
      <div ref={sectionRef} style={{ height: '120vh' }} className="relative z-10">
        <div className="sticky top-0 h-screen flex items-center justify-center px-16" style={{ paddingTop: '120px', paddingBottom: '80px', transform: 'translateY(-35px)' }}>
          <div className="w-full max-w-[820px]"
            style={{ transform: `scale(${scale})`, transformOrigin: 'center center', transition: 'transform 0.08s linear' }}
          >
            {/* Glass app frame */}
            <div className="relative rounded-[20px] overflow-hidden"
              style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.08), 0 0 0 1px rgba(0,0,0,0.06)' }}
            >
              <div className="absolute inset-0" style={{ backdropFilter: 'blur(12px) saturate(180%)', WebkitBackdropFilter: 'blur(12px) saturate(180%)' }} />
              <div className="absolute inset-0" style={{ background: 'linear-gradient(160deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 100%)' }} />
              <div className="absolute inset-0 rounded-[20px]" style={{ border: '1px solid rgba(255,255,255,0.15)', boxShadow: 'inset 0 1.5px 0 rgba(255,255,255,0.70), inset 0 -1px 0 rgba(255,255,255,0.08)' }} />

              {/* Chrome bar */}
              <div className="relative z-10 flex items-center gap-2 px-4 py-3 border-b border-white/[0.06] bg-white/[0.03]">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/70" />
                <div className="w-2.5 h-2.5 rounded-full bg-green-500/70" />
                <div className="flex-1 mx-4">
                  <div className="bg-white/[0.06] rounded-md px-3 py-1 text-center">
                    <span className="text-[9px] text-white/30 font-medium">app.karktech.com/dashboard</span>
                  </div>
                </div>
              </div>

              {/* Dashboard — slides driven by scroll */}
              <div className="relative z-10" style={{ height: '420px' }}>
                <DashboardPreview slide={contentSlide} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── FEATURES ── */}
      <section id="features" className="relative pt-10 pb-24 border-t border-slate-200">
        <div className="relative max-w-6xl mx-auto px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black mb-3 text-slate-900" style={{ fontFamily: 'Merriweather, serif', fontWeight: 900 }}>Everything you need</h2>
            <p className="font-medium text-lg" style={{ color: '#1d1d1f', fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Helvetica Neue", sans-serif', letterSpacing: '-0.01em' }}>Built for creators and marketers who run Facebook pages at scale.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {FEATURES.map((f, i) => {
              const Icon = f.icon;
              return (
                <div
                  key={i}
                  className="p-6 rounded-3xl bg-white border border-slate-100 hover:border-slate-200 hover:shadow-md transition-all hover:-translate-y-1 cursor-default"
                >
                  <div className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${f.color} flex items-center justify-center mb-4 shadow-lg ${f.glow}`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="font-black text-sm mb-2 text-slate-900">{f.title}</h3>
                  <p className="text-xs text-slate-500 font-medium leading-relaxed">{f.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how" className="px-8 py-24 border-t border-slate-200">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-black mb-3 text-slate-900" style={{ fontFamily: 'Merriweather, serif', fontWeight: 900 }}>How it works</h2>
          <p className="font-medium text-lg mb-16" style={{ color: '#1d1d1f', fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Helvetica Neue", sans-serif', letterSpacing: '-0.01em' }}>Three steps to take control of your Facebook presence.</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 relative">
            <div className="hidden md:block absolute top-8 left-[22%] right-[22%] h-px bg-gradient-to-r from-slate-200 via-slate-300 to-slate-200" />
            {STEPS.map(({ icon: Icon, title, desc }, i) => (
              <div key={i} className="flex flex-col items-center text-center relative">
                <div className="w-16 h-16 rounded-2xl bg-white border border-slate-100 flex items-center justify-center mb-5 relative z-10 shadow-sm">
                  <Icon className="w-7 h-7 text-slate-400" />
                  <span className="absolute -top-2.5 -right-2.5 w-6 h-6 rounded-full bg-slate-100 border border-slate-200 text-slate-500 text-[10px] font-black flex items-center justify-center">
                    {i + 1}
                  </span>
                </div>
                <h3 className="font-black text-sm mb-2 text-slate-900" style={{ fontFamily: 'Merriweather, serif', fontWeight: 900 }}>{title}</h3>
                <p className="text-xs font-medium leading-relaxed" style={{ color: '#1d1d1f', fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Helvetica Neue", sans-serif', letterSpacing: '-0.01em' }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── KARK AI ── */}
      <section className="px-6 py-24 border-t border-slate-200">
        <div className="max-w-5xl mx-auto">
          <div className="relative rounded-3xl overflow-hidden" style={{ background: 'linear-gradient(135deg, #0d0820 0%, #0a0f2e 50%, #0d0820 100%)' }}>
            {/* Glow blobs */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              <div style={{ position:'absolute', top:'-80px', left:'-60px', width:'400px', height:'400px', borderRadius:'50%', background:'radial-gradient(circle, rgba(139,92,246,0.25) 0%, transparent 65%)', filter:'blur(60px)' }} />
              <div style={{ position:'absolute', bottom:'-60px', right:'-40px', width:'350px', height:'350px', borderRadius:'50%', background:'radial-gradient(circle, rgba(59,130,246,0.20) 0%, transparent 65%)', filter:'blur(60px)' }} />
            </div>

            <div className="relative z-10 flex flex-col lg:flex-row items-center gap-10 p-8 md:p-14">
              {/* Left: text */}
              <div className="flex-1 text-center lg:text-left">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-violet-500/15 border border-violet-500/25 mb-5">
                  <Sparkles className="w-3.5 h-3.5 text-violet-400" />
                  <span className="text-xs font-bold text-violet-300">Powered by Groq AI</span>
                </div>
                <h2 className="text-4xl md:text-5xl font-black text-white mb-4 leading-tight" style={{ fontFamily: 'Merriweather, serif' }}>
                  Meet <span className="bg-gradient-to-r from-violet-400 to-blue-400 bg-clip-text text-transparent">Kark</span>
                </h2>
                <p className="text-white/50 text-base leading-relaxed mb-8 max-w-md mx-auto lg:mx-0">
                  Your AI co-pilot for social media. Ask anything — content ideas, captions, strategy, or just have a conversation.
                </p>
                <Link
                  to="/kark-ai"
                  className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-2xl font-black text-sm text-white bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 transition-all shadow-xl shadow-violet-500/30"
                >
                  <Bot className="w-4 h-4" />
                  Chat with Kark — Free
                </Link>
              </div>

              {/* Right: fake chat preview */}
              <div className="flex-shrink-0 w-full max-w-[320px]">
                <div className="rounded-2xl border border-white/10 overflow-hidden bg-white/[0.04] backdrop-blur-sm">
                  {/* Chat header */}
                  <div className="flex items-center gap-2.5 px-4 py-3 border-b border-white/[0.07]">
                    <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-violet-500 to-blue-600 flex items-center justify-center">
                      <Sparkles className="w-3.5 h-3.5 text-white" />
                    </div>
                    <div>
                      <p className="text-xs font-black text-white leading-none">Kark</p>
                      <p className="text-[9px] text-white/30 leading-none mt-0.5">Always online</p>
                    </div>
                    <div className="ml-auto w-2 h-2 rounded-full bg-emerald-400" />
                  </div>
                  {/* Messages */}
                  <div className="p-4 space-y-3">
                    <div className="flex gap-2 items-end">
                      <div className="w-5 h-5 rounded-lg bg-gradient-to-br from-violet-500 to-blue-600 flex-shrink-0 flex items-center justify-center">
                        <Sparkles className="w-2.5 h-2.5 text-white" />
                      </div>
                      <div className="bg-white/[0.06] border border-white/[0.08] rounded-2xl rounded-bl-md px-3 py-2 text-[11px] text-white/75 leading-relaxed max-w-[85%]">
                        Hey! I'm Kark 👋 What can I help you create today?
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <div className="bg-gradient-to-br from-blue-600 to-violet-600 rounded-2xl rounded-br-md px-3 py-2 text-[11px] text-white leading-relaxed max-w-[85%]">
                        Write a viral caption for my product launch 🚀
                      </div>
                    </div>
                    <div className="flex gap-2 items-end">
                      <div className="w-5 h-5 rounded-lg bg-gradient-to-br from-violet-500 to-blue-600 flex-shrink-0 flex items-center justify-center">
                        <Sparkles className="w-2.5 h-2.5 text-white" />
                      </div>
                      <div className="bg-white/[0.06] border border-white/[0.08] rounded-2xl rounded-bl-md px-3 py-2 text-[11px] text-white/75 leading-relaxed max-w-[85%]">
                        🔥 "The wait is over." Drop this today and watch the 🔔 go wild...
                      </div>
                    </div>
                    {/* Typing indicator */}
                    <div className="flex gap-2 items-end">
                      <div className="w-5 h-5 rounded-lg bg-gradient-to-br from-violet-500 to-blue-600 flex-shrink-0 flex items-center justify-center">
                        <Sparkles className="w-2.5 h-2.5 text-white" />
                      </div>
                      <div className="bg-white/[0.06] border border-white/[0.08] rounded-2xl rounded-bl-md px-3 py-1.5 flex items-center gap-1">
                        {[0,1,2].map(i => (
                          <div key={i} className="w-1.5 h-1.5 rounded-full bg-violet-400"
                            style={{ animation: `bounce 1.2s ease-in-out ${i*0.2}s infinite` }} />
                        ))}
                      </div>
                    </div>
                  </div>
                  {/* Input bar */}
                  <div className="px-4 pb-4">
                    <div className="flex items-center gap-2 bg-white/[0.05] border border-white/[0.08] rounded-xl px-3 py-2">
                      <span className="flex-1 text-[11px] text-white/20">Ask Kark anything...</span>
                      <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-violet-600 to-blue-600 flex items-center justify-center">
                        <Send className="w-3 h-3 text-white" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section id="about" className="px-8 py-24 text-center border-t border-slate-200">
        <div className="max-w-xl mx-auto">
          <h2 className="text-4xl font-black mb-4 text-slate-900" style={{ fontFamily: 'Merriweather, serif', fontWeight: 900 }}>Ready to grow?</h2>
          <p className="font-medium mb-10 text-base" style={{ color: '#1d1d1f', fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Helvetica Neue", sans-serif', letterSpacing: '-0.01em' }}>
            Join KarkTech and take your Facebook presence to the next level.
          </p>
          <Link
            to="/register"
            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-2xl font-black text-sm border border-slate-900 text-slate-900 hover:bg-slate-900 hover:text-white transition-all"
          >
            Get Started Free <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-slate-200 px-8 py-5 flex items-center justify-center gap-6">
        <span className="text-[11px] font-bold text-slate-900">© 2026 KarkTech</span>
        <span className="text-slate-400">·</span>
        <Link to="/privacy" className="text-[11px] font-bold text-slate-900 hover:text-black transition-colors">Privacy Policy</Link>
        <span className="text-slate-400">·</span>
        <Link to="/terms"   className="text-[11px] font-bold text-slate-900 hover:text-black transition-colors">Terms & Conditions</Link>
      </footer>

    </div>
  );
}