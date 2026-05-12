import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';
import axios from 'axios';
import toast from '../utils/toast';
import { format } from 'date-fns';
import { COUNTRY_TIMEZONES } from '../constants/countries';
import { getActiveAccountId } from './AccountSwitcher';
import {
  X, Hash, Sparkles, Image as ImageIcon,
  Send, Calendar, ChevronDown, Monitor, Smartphone,
  ThumbsUp, MessageSquare, Share2, MoreHorizontal, Globe, Link as LinkIcon, Smile, Check, Clock,
  FileText, Video, Layers, AtSign, Type, Zap, Upload, Volume2, VolumeX
} from 'lucide-react';

interface PostDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  prefill?: { content: string; link?: string; imageUrl?: string };
}

const FALLBACK_PAGES: { id: string; name: string; avatar: string; pictureUrl?: string }[] = [];

const API = 'http://localhost:3000';

type PostTab = 'Post' | 'Reel' | 'Story';
type PreviewDevice = 'desktop' | 'mobile';

// ─── Smart URL Detector ──────────────────────────────────────────────────────
const URL_REGEX = /(https?:\/\/[^\s]+)/g;
const HASHTAG_REGEX = /(#\w+)/g;
const MENTION_REGEX = /(@\w+)/g;

function extractFirstUrl(text: string): string | null {
  const match = text.match(URL_REGEX);
  return match ? match[0] : null;
}

function renderFormattedText(text: string) {
  const parts = text.split(/(\s+)/);
  return parts.map((part, i) => {
    if (HASHTAG_REGEX.test(part)) {
      HASHTAG_REGEX.lastIndex = 0;
      return <span key={i} className="text-[#4599ff] font-semibold cursor-pointer hover:underline">{part}</span>;
    }
    if (MENTION_REGEX.test(part)) {
      MENTION_REGEX.lastIndex = 0;
      return <span key={i} className="text-[#4599ff] font-semibold cursor-pointer hover:underline">{part}</span>;
    }
    if (URL_REGEX.test(part)) {
      URL_REGEX.lastIndex = 0;
      return <span key={i} className="text-[#4599ff] cursor-pointer hover:underline">{part}</span>;
    }
    return <span key={i}>{part}</span>;
  });
}

function ReelPreview({ first, page, content, activeTab }: {
  first: { url: string; type: 'image' | 'video' };
  page: { name: string; avatar: string };
  content: string;
  activeTab: string;
}) {
  const [muted, setMuted] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setMuted(videoRef.current.muted);
    }
  };

  const media = (
    first.type === 'image'
      ? <img src={first.url} alt="" className="w-full h-full object-cover" />
      : <video ref={videoRef} src={first.url} className="w-full h-full object-cover" muted autoPlay loop playsInline />
  );

  if (activeTab === 'Story') {
    return (
      <div className="flex flex-col items-center gap-2">
        <div className="relative rounded-[24px] overflow-hidden border-2 border-white/10 shadow-2xl bg-black"
          style={{ width: 160, height: 285 }}>
          {media}
          {/* Progress bar */}
          <div className="absolute top-2 left-3 right-3 h-0.5 bg-white/30 rounded-full overflow-hidden">
            <div className="h-full bg-white rounded-full" style={{ width: '60%' }} />
          </div>
          {/* Top: avatar + name + mute + close */}
          <div className="absolute top-5 left-0 right-0 px-3 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-black text-[8px] ring-1 ring-white/40">
                {page.avatar}
              </div>
              <div>
                <p className="text-white text-[9px] font-bold leading-none">{page.name}</p>
                <p className="text-white/60 text-[7px] font-semibold">Just now · <span className="text-white/50">24h</span></p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {first.type === 'video' && (
                <button onClick={toggleMute} className="w-5 h-5 rounded-full bg-black/40 flex items-center justify-center">
                  {muted ? <VolumeX className="w-2.5 h-2.5 text-white" /> : <Volume2 className="w-2.5 h-2.5 text-white" />}
                </button>
              )}
              <div className="w-5 h-5 rounded-full bg-black/40 flex items-center justify-center">
                <X className="w-2.5 h-2.5 text-white" />
              </div>
            </div>
          </div>
          {/* Caption */}
          {content && (
            <div className="absolute bottom-10 left-0 right-0 px-3">
              <p className="text-white text-[9px] leading-tight line-clamp-3 drop-shadow">{content}</p>
            </div>
          )}
          {/* Reply bar */}
          <div className="absolute bottom-0 left-0 right-0 px-3 pb-3">
            <div className="flex items-center gap-1.5 bg-white/10 border border-white/20 rounded-full px-2.5 py-1.5 backdrop-blur-sm">
              <span className="text-white/40 text-[9px] font-medium flex-1">Reply to {page.name}...</span>
              <Share2 className="w-3 h-3 text-white/40 flex-shrink-0" />
            </div>
          </div>
        </div>
        <span className="text-[9px] font-bold text-white/20 uppercase tracking-wider">Story Preview</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative rounded-[24px] overflow-hidden border-2 border-white/10 shadow-2xl bg-black"
        style={{ width: 160, height: 285 }}>
        {media}
        {/* Top bar */}
        <div className="absolute top-0 left-0 right-0 px-3 pt-3 pb-6 bg-gradient-to-b from-black/60 to-transparent flex items-center justify-between">
          <span className="text-white font-black text-[11px] tracking-wide">Reels</span>
          {first.type === 'video' && (
            <button onClick={toggleMute} className="w-6 h-6 rounded-full bg-black/50 flex items-center justify-center hover:bg-black/70 transition-all">
              {muted ? <VolumeX className="w-3 h-3 text-white" /> : <Volume2 className="w-3 h-3 text-white" />}
            </button>
          )}
        </div>
        {/* Bottom overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent">
          <div className="flex items-center gap-1.5 mb-1">
            <div className="w-5 h-5 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-black text-[8px]">
              {page.avatar}
            </div>
            <span className="text-white text-[9px] font-bold">{page.name}</span>
          </div>
          {content && <p className="text-white/80 text-[9px] leading-tight line-clamp-2">{content}</p>}
        </div>
        {/* Right actions */}
        <div className="absolute right-2 bottom-16 flex flex-col gap-3 items-center">
          {[{ icon: ThumbsUp, val: '24' }, { icon: MessageSquare, val: '8' }, { icon: Share2, val: '3' }].map(({ icon: Icon, val }) => (
            <div key={val} className="flex flex-col items-center gap-0.5 text-white/80">
              <Icon className="w-4 h-4" />
              <span className="text-[8px] font-bold">{val}</span>
            </div>
          ))}
        </div>
      </div>
      <span className="text-[9px] font-bold text-white/20 uppercase tracking-wider">Reel Preview</span>
    </div>
  );
}

interface FBPreviewProps {
  content: string;
  page: { name: string; avatar: string };
  scheduledFor: string;
  device: PreviewDevice;
  mediaFiles?: { url: string; type: 'image' | 'video'; name: string }[];
  activeTab?: PostTab;
}

function FacebookPreview({ content, page, scheduledFor, device, mediaFiles = [], activeTab = 'Post' }: FBPreviewProps) {
  const detectedUrl = extractFirstUrl(content);
  const hasHashtag = /#\w+/.test(content);
  const hasMention = /@\w+/.test(content);
  const isTextOnly = content.trim() && !detectedUrl;

  // Mock link metadata
  const linkMeta = detectedUrl ? {
    domain: (() => { try { return new URL(detectedUrl).hostname.replace('www.', ''); } catch { return detectedUrl; } })(),
    title: 'Discover Amazing Content',
    description: 'Click to explore more about this topic and stay updated with the latest.',
  } : null;

  const now = new Date();
  const timeStr = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });

  // Text without URL for cleaner display
  const displayText = content.replace(URL_REGEX, '').trim();

  if (!content.trim() && mediaFiles.length === 0) {
    return (
      <div className="bg-[#242731] rounded-xl border border-white/10 p-6 flex flex-col items-center justify-center gap-3 text-center min-h-[180px]">
        <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center">
          <ImageIcon className="w-5 h-5 text-white/20" />
        </div>
        <div>
          <p className="text-white/30 text-xs font-semibold">Start typing or add media</p>
          <p className="text-white/20 text-[11px] mt-0.5">to see your live Facebook preview</p>
        </div>
      </div>
    );
  }

  // ── Reel / Story vertical preview ───────────────────────────────────────────
  if ((activeTab === 'Reel' || activeTab === 'Story') && mediaFiles.length > 0) {
    const first = mediaFiles[0];
    return <ReelPreview first={first} page={page} content={content} activeTab={activeTab} />;
  }

  return (
    <div className={`bg-white rounded-xl overflow-hidden shadow-md ${device === 'mobile' ? 'max-w-[240px] mx-auto' : ''}`}>
      {/* FB Post Header */}
      <div className="px-3 pt-3 pb-2">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-extrabold text-xs flex-shrink-0">
              {page.avatar}
            </div>
            <div>
              <p className="text-[#050505] text-[11px] font-bold leading-tight">{page.name}</p>
              <div className="flex items-center gap-1 mt-0.5">
                <span className="text-[#65676B] text-[10px]">{timeStr}</span>
                <span className="text-[#65676B] text-[9px]">·</span>
                <Globe className="w-2.5 h-2.5 text-[#65676B]" />
              </div>
            </div>
          </div>
          <MoreHorizontal className="w-4 h-4 text-[#65676B]" />
        </div>

        {/* Post Text */}
        {(displayText || (!detectedUrl && content)) && (
          <p className={`mt-2 text-[#050505] leading-snug whitespace-pre-wrap break-words ${
            content.length < 80 ? 'text-lg font-bold' : content.length < 160 ? 'text-sm font-medium' : 'text-xs'
          }`}>
            {renderFormattedText(displayText || content)}
          </p>
        )}
      </div>

      {/* Media Grid */}
      {mediaFiles.length > 0 && (
        <div className={`mt-1 grid gap-0.5 ${mediaFiles.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
          {mediaFiles.slice(0, 4).map((file, i) => (
            <div key={i} className="relative">
              {file.type === 'image' ? (
                <img src={file.url} alt="" className={`w-full object-cover ${mediaFiles.length === 1 ? 'max-h-48' : 'h-24'}`} />
              ) : (
                <video src={file.url} className={`w-full object-cover ${mediaFiles.length === 1 ? 'max-h-48' : 'h-24'}`} muted controls />
              )}
              {i === 3 && mediaFiles.length > 4 && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                  <span className="text-white font-extrabold text-lg">+{mediaFiles.length - 4}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Link Preview Card */}
      {linkMeta && (
        <div className="border border-[#E4E6EB] mx-0 mt-1 overflow-hidden cursor-pointer group">
          <div className="bg-[#F0F2F5] h-24 flex items-center justify-center">
            <LinkIcon className="w-6 h-6 text-[#BEC3C9]" />
          </div>
          <div className="px-3 py-2 bg-[#F0F2F5] border-t border-[#E4E6EB]">
            <p className="text-[10px] text-[#65676B] uppercase tracking-wider font-medium">{linkMeta.domain}</p>
            <p className="text-[11px] font-bold text-[#050505] leading-tight mt-0.5 group-hover:underline">{linkMeta.title}</p>
            <p className="text-[10px] text-[#65676B] mt-0.5 line-clamp-2">{linkMeta.description}</p>
          </div>
        </div>
      )}

      {/* Reaction Summary */}
      <div className="px-3 py-1.5 border-t border-[#E4E6EB]">
        <div className="flex items-center justify-between text-[10px] text-[#65676B] mb-1">
          <div className="flex items-center gap-1">
            <div className="flex">
              <span className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center text-white text-[7px]">👍</span>
              <span className="w-4 h-4 bg-red-500 rounded-full flex items-center justify-center -ml-1 text-[7px]">❤️</span>
            </div>
            <span>You and 24 others</span>
          </div>
          <span>8 comments · 3 shares</span>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center border-t border-[#E4E6EB] pt-1">
          {[
            { icon: ThumbsUp, label: 'Like' },
            { icon: MessageSquare, label: 'Comment' },
            { icon: Share2, label: 'Share' },
          ].map(({ icon: Icon, label }) => (
            <button key={label} className="flex-1 flex items-center justify-center gap-1 py-1.5 text-[#65676B] hover:bg-[#F0F2F5] rounded-lg transition-colors text-[10px] font-bold">
              <Icon className="w-3 h-3" />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Scheduled Badge */}
      {scheduledFor && (
        <div className="mx-3 mb-3 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2 flex items-center gap-2">
          <Calendar className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
          <div>
            <p className="text-[10px] font-bold text-blue-700">Scheduled</p>
            <p className="text-[9px] text-blue-500">{new Date(scheduledFor).toLocaleString()}</p>
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

export default function PostDrawer({ isOpen, onClose, prefill }: PostDrawerProps) {
  const navigate = useNavigate();
  const { getToken } = useAuth();
  const [pages, setPages] = useState<{ id: string; name: string; avatar: string; pictureUrl?: string }[]>(FALLBACK_PAGES);
  const [activeTab, setActiveTab] = useState<PostTab>('Post');
  const [content, setContent] = useState('');
  const [scheduledFor, setScheduledFor] = useState('');
  const [selectedPages, setSelectedPages] = useState<string[]>([]);
  const [showPageDropdown, setShowPageDropdown] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [previewDevice, setPreviewDevice] = useState<PreviewDevice>('desktop');
  const [showSchedule, setShowSchedule] = useState(false);
  const [scheduleMode, setScheduleMode] = useState<'manual' | 'auto'>('manual');
  const [autoCountry, setAutoCountry] = useState('');
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const [fetchingUrl, setFetchingUrl] = useState(false);
  const [showEmoji, setShowEmoji] = useState(false);
  const [comment, setComment] = useState('');
  const [showCommentBox, setShowCommentBox] = useState(false);
  const [showCommentEmoji, setShowCommentEmoji] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [mediaFiles, setMediaFiles] = useState<{ url: string; type: 'image' | 'video'; name: string }[]>([]);
  const [detectedFormat, setDetectedFormat] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const urlInputRef = useRef<HTMLInputElement>(null);

  const detectAspectRatio = (width: number, height: number) => {
    const ratio = width / height;
    if (ratio < 0.65) return 'Reel';       // 9:16 vertical
    if (ratio < 0.85) return 'Story';      // 4:5 portrait
    return 'Post';                          // square / landscape
  };

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    const newMedia = Array.from(files).map(file => ({
      url: URL.createObjectURL(file),
      type: file.type.startsWith('video') ? 'video' as const : 'image' as const,
      name: file.name,
    }));
    setMediaFiles(prev => [...prev, ...newMedia]);
    toast.success('Media added!');

    // Auto-detect only for videos — photos always stay as Post
    const first = newMedia[0];
    if (!first) return;
    if (first.type === 'video') {
      const vid = document.createElement('video');
      vid.onloadedmetadata = () => {
        const fmt = detectAspectRatio(vid.videoWidth, vid.videoHeight);
        setDetectedFormat(fmt);
        if (fmt !== 'Post') setActiveTab(fmt as PostTab);
        vid.remove();
      };
      vid.src = first.url;
    }
  };

  const removeMedia = (index: number) => {
    setMediaFiles(prev => {
      URL.revokeObjectURL(prev[index].url);
      const next = prev.filter((_, i) => i !== index);
      if (next.length === 0) setDetectedFormat(null);
      return next;
    });
  };

  const currentPage = pages.find(p => p.id === selectedPages[0]) || pages[0] || { id: '', name: 'My Page', avatar: 'P', pictureUrl: undefined };

  const [savedSlots, setSavedSlots] = useState<string[]>([]);

  useEffect(() => {
    const slots = localStorage.getItem('my_calendar_slots');
    if (slots) setSavedSlots(JSON.parse(slots));
  }, [showSchedule]);

  // Fetch pages + apply prefill when drawer opens
  useEffect(() => {
    if (!isOpen) return;

    if (prefill) {
      setContent(prefill.content);
      if (prefill.imageUrl) {
        setMediaFiles([{ url: prefill.imageUrl, type: 'image', name: 'reused-image' }]);
      } else {
        setMediaFiles([]);
      }
    } else {
      setContent('');
      setMediaFiles([]);
    }

    const fetchPages = async () => {
      try {
        const devToken = localStorage.getItem('dev_bypass_token');
        const token = devToken || await getToken();
        const accountId = getActiveAccountId();
        const params: Record<string, string> = {};
        if (accountId) params.accountId = accountId;

        const res = await axios.get(`${API}/api/facebook/pages`, {
          headers: { Authorization: `Bearer ${token}` },
          params,
        });
        if (res.data && res.data.length > 0) {
          const mapped = res.data.map((p: any) => ({
            id: p.id,
            name: p.name,
            avatar: p.name[0]?.toUpperCase() || 'P',
            pictureUrl: p.pictureUrl || undefined,
          }));
          setPages(mapped);
          setSelectedPages([mapped[0].id]);
        }
      } catch {
        // keep fallback pages
      }
    };
    fetchPages();
  }, [isOpen]);

  const applyAutoSchedule = (countryKey: string) => {
    // Legacy country logic kept for now but hidden in UI
    const country = COUNTRY_TIMEZONES[countryKey];
    if (!country) return;
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tzDate = new Date(tomorrow.toLocaleString('en-US', { timeZone: country.tz }));
    tzDate.setHours(country.bestHour, 0, 0, 0);
    const offset = tzDate.getTime() - new Date(tomorrow.toLocaleString('en-US', { timeZone: country.tz })).getTime() + tomorrow.getTime();
    const localEquivalent = new Date(offset);
    localEquivalent.setHours(country.bestHour, 0, 0, 0);
    const pad = (n: number) => String(n).padStart(2, '0');
    const formatted = `${localEquivalent.getFullYear()}-${pad(localEquivalent.getMonth() + 1)}-${pad(localEquivalent.getDate())}T${pad(country.bestHour)}:00`;
    setScheduledFor(formatted);
    setAutoCountry(countryKey);
    toast.success(`✅ Auto-scheduled for ${country.label} — tomorrow at ${country.bestHour}:00 ${country.tz}`);
    setShowSchedule(false);
  };


  const togglePage = (id: string) => {
    setSelectedPages(prev =>
      prev.includes(id)
        ? prev.length > 1 ? prev.filter(p => p !== id) : prev // keep at least 1
        : [...prev, id]
    );
  };

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  const insertText = (prefix: string) => {
    setContent(c => c + prefix);
  };

  const fetchFromUrl = async () => {
    if (!urlInput.trim()) { toast.error('Please enter a URL'); return; }
    try {
      new URL(urlInput); // validate URL format
    } catch {
      toast.error('Please enter a valid URL (e.g. https://example.com)'); return;
    }
    setFetchingUrl(true);
    // Simulate fetching URL metadata (mock since backend is offline)
    await new Promise(r => setTimeout(r, 1200));
    const domain = new URL(urlInput).hostname.replace('www.', '');
    const mockTitle = `Check out this amazing content from ${domain}! 🔗`;
    const mockDesc = `We found something great at ${urlInput} — click to explore more.`;
    setContent(`${mockTitle}\n\n${mockDesc}\n\n${urlInput}`);
    setUrlInput('');
    setShowUrlInput(false);
    setFetchingUrl(false);
    toast.success('Content fetched from URL!');
  };

  const getAuthHeaders = async () => {
    const devToken = localStorage.getItem('dev_bypass_token');
    if (devToken) return { Authorization: `Bearer ${devToken}` };
    const token = await getToken();
    return { Authorization: `Bearer ${token}` };
  };

  const uploadMediaFiles = async (headers: Record<string, string>): Promise<string[]> => {
    if (mediaFiles.length === 0) return [];

    const serverUploadsBase = `${API}/uploads/`;
    const alreadyOnServer = mediaFiles.filter(mf => mf.url.startsWith(serverUploadsBase));
    const needsUpload = mediaFiles.filter(mf => !mf.url.startsWith(serverUploadsBase));

    if (needsUpload.length === 0) {
      return alreadyOnServer.map(mf => mf.url);
    }

    const formData = new FormData();
    for (const mf of needsUpload) {
      const blob = await fetch(mf.url).then(r => r.blob());
      formData.append('files', blob, mf.name);
    }
    const res = await axios.post(`${API}/api/media/upload`, formData, {
      headers: { ...headers, 'Content-Type': 'multipart/form-data' },
    });
    const newUrls = res.data.urls as string[];
    return [...alreadyOnServer.map(mf => mf.url), ...newUrls];
  };

  const handlePublish = async () => {
    if (!content.trim()) { toast.error('Please write something first!'); return; }
    if (selectedPages.length === 0) { toast.error('Select at least one page'); return; }
    setIsPublishing(true);
    try {
      const headers = await getAuthHeaders();

      // Upload media first if any
      let uploadedUrls: string[] = [];
      if (mediaFiles.length > 0) {
        try {
          uploadedUrls = await uploadMediaFiles(headers);
        } catch {
          toast.error('Image upload failed — posting without image');
        }
      }

      const results = await Promise.all(
        selectedPages.map(pageId =>
          axios.post(`${API}/api/posts`, {
            pageId,
            content,
            link: urlInput || null,
            imageUrl: uploadedUrls[0] || null,
            scheduledFor: scheduledFor || null,
          }, { headers })
        )
      );

      // Check if any post failed to publish
      const anyFailed = results.some(r => r.data?.status === 'FAILED');
      if (anyFailed) {
        const errMsg = results.find(r => r.data?.status === 'FAILED')?.data?.publishError;
        toast.error(`Facebook error: ${errMsg || 'Failed to post'}`);
      } else {
        toast.success(scheduledFor ? 'Post scheduled!' : `Published to ${selectedPages.length} page${selectedPages.length > 1 ? 's' : ''}!`);
        setContent(''); setScheduledFor(''); setMediaFiles([]); setUrlInput(''); onClose();
      }
    } catch {
      toast.error('Failed to publish. Check your connection.');
    } finally {
      setIsPublishing(false);
    }
  };

  const handleDraft = async () => {
    if (!content.trim()) { toast.error('Write something first!'); return; }
    setIsPublishing(true);
    try {
      const headers = await getAuthHeaders();
      let uploadedUrls: string[] = [];
      if (mediaFiles.length > 0) {
        try { uploadedUrls = await uploadMediaFiles(headers); } catch { /* ignore */ }
      }
      await axios.post(`${API}/api/posts`, {
        pageId: selectedPages[0],
        content,
        imageUrl: uploadedUrls[0] || null,
        scheduledFor: null,
      }, { headers });
      toast.success('Saved as draft!');
      setContent(''); setMediaFiles([]); onClose();
    } catch {
      toast.error('Failed to save draft');
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        className={`fixed inset-0 bg-black/30 backdrop-blur-sm z-40 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
      />

      {/* Floating Drawer Panel - gap on all 4 sides */}
      <div
        className={`fixed top-4 bottom-4 right-4 w-[calc(100%-300px)] max-w-[860px] bg-[#1a1d23] z-50 flex flex-col transition-transform duration-300 ease-out shadow-[-20px_0_60px_rgba(0,0,0,0.4)] rounded-2xl overflow-hidden ${isOpen ? 'translate-x-0' : 'translate-x-[calc(100%+1rem)]'}`}
      >
        {/* Top Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-gradient-to-r from-[#1a1d23] to-[#1e2029]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl overflow-hidden flex items-center justify-center ring-1 ring-blue-500/30 shadow-lg shadow-blue-500/20 bg-[#0d0d16]">
              <img src="/karklogo.png.png" alt="KarkTech Logo" className="w-full h-full object-contain" onError={e => { (e.target as HTMLImageElement).style.display='none'; }} />
            </div>
            <div>
              <span className="text-white font-extrabold text-base tracking-tight">KarkTech <span className="bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent">Composer</span></span>
              <p className="text-[10px] text-white/30 font-semibold tracking-wide">Facebook Post Builder</p>
            </div>
            <span className="ml-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-blue-500/20 text-blue-400 border border-blue-500/20">Beta</span>
          </div>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/50 hover:text-white text-xs font-semibold transition-all border border-white/10">
              <Hash className="w-3.5 h-3.5" />
              Labels
            </button>
            <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/5 hover:bg-red-500/20 text-white/40 hover:text-red-400 transition-all border border-white/10">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Body - Split Layout */}
        <div className="flex flex-1 overflow-hidden">

          {/* LEFT: Composer */}
          <div className="flex-1 flex flex-col border-r border-white/10 overflow-y-auto">
            {/* Page Multi-Select Dropdown */}
            <div className="px-6 pt-5 pb-3">
              <p className="text-[10px] font-bold text-white/40 uppercase tracking-wider mb-2">Post to Pages</p>
              <div className="relative">
                {/* Trigger Button */}
                <button
                  onClick={() => setShowPageDropdown(v => !v)}
                  className={`w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl border transition-all ${showPageDropdown ? 'border-blue-500/50 bg-blue-500/5' : 'border-white/10 bg-white/5 hover:border-white/20'}`}
                >
                  <div className="flex items-center gap-2 flex-1 min-w-0 flex-wrap">
                    {selectedPages.length === pages.length ? (
                      <span className="text-sm font-semibold text-white/80">All Pages</span>
                    ) : (
                      selectedPages.map(id => {
                        const p = pages.find(pg => pg.id === id);
                        return p ? (
                          <span key={id} className="flex items-center gap-1.5 bg-blue-500/20 text-blue-300 text-xs font-bold px-2 py-0.5 rounded-lg">
                            <span className="w-4 h-4 rounded-full overflow-hidden flex-shrink-0">
                              {p.pictureUrl
                                ? <img src={p.pictureUrl} alt={p.name} className="w-full h-full object-cover" />
                                : <span className="w-full h-full bg-blue-500 flex items-center justify-center text-white text-[8px] font-extrabold">{p.avatar}</span>
                              }
                            </span>
                            {p.name}
                          </span>
                        ) : null;
                      })
                    )}
                  </div>
                  <ChevronDown className={`w-4 h-4 text-white/40 flex-shrink-0 transition-transform ${showPageDropdown ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown Panel */}
                {showPageDropdown && (
                  <div className="absolute top-full left-0 right-0 mt-1.5 bg-[#0f1117] border border-white/10 rounded-xl shadow-2xl z-20 overflow-hidden">
                    {/* Select All */}
                    <button
                      onClick={() => setSelectedPages(selectedPages.length === pages.length ? [pages[0].id] : pages.map(p => p.id))}
                      className="w-full flex items-center gap-3 px-4 py-2.5 border-b border-white/5 hover:bg-white/5 transition-colors"
                    >
                      <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all ${selectedPages.length === pages.length ? 'bg-blue-500 border-blue-500' : 'border-white/20'}`}>
                        {selectedPages.length === pages.length && <Check className="w-2.5 h-2.5 text-white" />}
                      </div>
                      <span className="text-xs font-bold text-white/70">Select All Pages</span>
                    </button>

                    {pages.map(page => {
                      const isSelected = selectedPages.includes(page.id);
                      return (
                        <button
                          key={page.id}
                          onClick={() => togglePage(page.id)}
                          className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-white/5 transition-colors"
                        >
                          <div className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all ${isSelected ? 'bg-blue-500 border-blue-500' : 'border-white/20'}`}>
                            {isSelected && <Check className="w-2.5 h-2.5 text-white" />}
                          </div>
                          <div className="w-7 h-7 rounded-full overflow-hidden flex-shrink-0">
                            {page.pictureUrl
                              ? <img src={page.pictureUrl} alt={page.name} className="w-full h-full object-cover" />
                              : <div className={`w-full h-full flex items-center justify-center text-white font-extrabold text-xs ${isSelected ? 'bg-gradient-to-br from-blue-500 to-indigo-600' : 'bg-white/10'}`}>{page.avatar}</div>
                            }
                          </div>
                          <span className={`text-sm font-semibold flex-1 text-left ${isSelected ? 'text-white' : 'text-white/50'}`}>{page.name}</span>
                        </button>
                      );
                    })}

                    {/* Done button */}
                    <div className="p-2 border-t border-white/5">
                      <button
                        onClick={() => setShowPageDropdown(false)}
                        className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition-colors"
                      >
                        Done — {selectedPages.length} page{selectedPages.length > 1 ? 's' : ''} selected
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Post / Reel / Story Tabs */}
            <div className="flex items-center gap-1 px-6 pb-3 border-b border-white/10">
              {([
                { label: 'Post', icon: FileText },
                { label: 'Reel', icon: Video },
                { label: 'Story', icon: Layers },
              ] as { label: PostTab; icon: any }[]).map(({ label, icon: Icon }) => (
                <button
                  key={label}
                  onClick={() => setActiveTab(label)}
                  className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${
                    activeTab === label
                      ? 'text-blue-400 bg-blue-400/10 border border-blue-400/20'
                      : 'text-white/40 hover:text-white/70 border border-transparent'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {label}
                </button>
              ))}
              {detectedFormat && (
                <span className="ml-auto flex items-center gap-1 text-[9px] font-black uppercase tracking-wider px-2 py-1 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
                  <Zap className="w-2.5 h-2.5" />
                  Auto: {detectedFormat}
                </span>
              )}
            </div>

            {/* Text Area */}
            <div className="px-6 pt-4 flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Type className="w-3.5 h-3.5 text-white/30" />
                <span className="text-[10px] font-bold text-white/30 uppercase tracking-wider">Post Content</span>
                <span className="ml-auto text-[10px] font-bold text-white/20">{content.length}/2000</span>
              </div>
              <textarea
                value={content}
                onChange={e => setContent(e.target.value)}
                placeholder="Write something or use shortcodes, spintax, @ for mentioning..."
                className="w-full min-h-[160px] bg-transparent text-white/90 text-sm font-medium outline-none resize-none placeholder-white/20 leading-relaxed"
              />

              {/* Toolbar */}
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/5">
                <div className="flex items-center gap-1">
                  <button onClick={() => insertText(' #')} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-white/50 hover:text-blue-400 hover:bg-blue-400/10 text-xs font-bold transition-all border border-transparent hover:border-blue-400/20">
                    <Hash className="w-3.5 h-3.5" /> Hashtag
                  </button>
                  <button onClick={() => insertText(' @')} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-white/50 hover:text-cyan-400 hover:bg-cyan-400/10 text-xs font-bold transition-all border border-transparent hover:border-cyan-400/20">
                    <AtSign className="w-3.5 h-3.5" /> Mention
                  </button>
                  <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-white/50 hover:text-purple-400 hover:bg-purple-400/10 text-xs font-bold transition-all border border-transparent hover:border-purple-400/20">
                    <Sparkles className="w-3.5 h-3.5" /> AI Assist
                  </button>
                </div>
                <div className="flex items-center gap-2 relative">
                  {/* Emoji Picker Button */}
                  <div className="relative">
                    <button
                      onClick={() => setShowEmoji(v => !v)}
                      className={`p-1.5 rounded-md transition-all ${
                        showEmoji ? 'text-yellow-400 bg-yellow-400/10' : 'text-white/40 hover:text-yellow-400 hover:bg-yellow-400/10'
                      }`}
                    >
                      <Smile className="w-4 h-4" />
                    </button>

                    {showEmoji && (
                      <div className="absolute bottom-full right-0 mb-2 bg-[#0f1117] border border-white/10 rounded-2xl p-3 shadow-2xl z-20 w-[260px]">
                        <p className="text-white/40 text-[10px] font-bold uppercase tracking-wider mb-2">Emojis</p>
                        <div className="grid grid-cols-8 gap-1 max-h-[200px] overflow-y-auto">
                          {[
                            '😀','😁','😂','🤣','😃','😄','😅','😆',
                            '😇','😉','😊','🙂','🙃','😋','😎','🥳',
                            '🤩','😍','🥰','😘','😗','😙','🤗','🤭',
                            '❤️','🧡','💛','💚','💙','💜','🖤','🤍',
                            '🔥','⭐','✨','💫','🎉','🎊','🎈','🎁',
                            '👍','👎','👏','🙌','🤝','🫶','💪','🤜',
                            '😢','😭','😤','😠','😡','🤬','😱','😨',
                            '🚀','🌈','☀️','🌙','⚡','🌊','🌺','🍀',
                            '🍕','🍔','🍣','🍜','🍩','🍪','🎂','🥂',
                            '📱','💻','📸','🎵','🎶','🎤','🎧','📺',
                            '🏆','🥇','🏅','⚽','🏀','🎯','🎮','🃏',
                            '✅','❌','💯','🔔','📢','💡','🔑','🛡️',
                          ].map(emoji => (
                            <button
                              key={emoji}
                              onClick={() => { setContent(c => c + emoji); }}
                              className="text-lg hover:bg-white/10 rounded-lg p-1 transition-all text-center leading-none"
                            >
                              {emoji}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Media Upload */}
            <div className="px-6 py-4">
              <div className="flex items-center gap-2 mb-2">
                <Upload className="w-3.5 h-3.5 text-white/30" />
                <span className="text-[10px] font-bold text-white/30 uppercase tracking-wider">Attach Media</span>
              </div>
              {/* Media Preview Grid */}
              {mediaFiles.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {mediaFiles.map((file, i) => (
                    <div key={i} className="relative group rounded-xl overflow-hidden border border-white/10 bg-white/5">
                      {file.type === 'image' ? (
                        <img src={file.url} alt={file.name} className="w-24 h-24 object-cover" />
                      ) : (
                        <video src={file.url} className="w-24 h-24 object-cover" muted />
                      )}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center">
                        <button
                          onClick={() => removeMedia(i)}
                          className="opacity-0 group-hover:opacity-100 transition-all w-7 h-7 rounded-full bg-red-500 flex items-center justify-center shadow-lg"
                        >
                          <X className="w-3.5 h-3.5 text-white" />
                        </button>
                      </div>
                      {file.type === 'video' && (
                        <div className="absolute bottom-1 left-1 bg-black/60 rounded px-1 py-0.5 flex items-center gap-1">
                          <Video className="w-2.5 h-2.5 text-white" />
                          <span className="text-[9px] text-white font-bold">VID</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              <div
                onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={e => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files); }}
                onClick={() => fileRef.current?.click()}
                className={`w-full py-5 rounded-xl border-2 border-dashed cursor-pointer text-center text-sm font-bold transition-all ${
                  dragOver
                    ? 'border-blue-400 bg-blue-400/10 text-blue-400'
                    : 'border-white/10 bg-white/[0.03] text-white/30 hover:border-blue-400/50 hover:text-blue-400/70 hover:bg-blue-400/5'
                }`}
              >
                <div className="flex items-center justify-center gap-4">
                  <div className="flex flex-col items-center gap-1">
                    <ImageIcon className="w-5 h-5 opacity-60" />
                    <span className="text-[10px]">Image</span>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <Video className="w-5 h-5 opacity-60" />
                    <span className="text-[10px]">Video</span>
                  </div>
                </div>
                <p className="mt-2 text-[11px] text-white/20">Click or drag & drop · multiple files supported</p>
              </div>
              <input ref={fileRef} type="file" accept="image/*,video/*" multiple className="hidden" onChange={e => handleFiles(e.target.files)} />
            </div>

            {/* Add Comment */}
            <div className="px-6 pb-4 border-t border-white/10 pt-4 space-y-3">
              <button
                onClick={() => setShowCommentBox(v => !v)}
                className="flex items-center gap-2 text-sm text-white/40 hover:text-blue-400 font-semibold transition-colors"
              >
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                  {currentPage.avatar}
                </div>
                {showCommentBox ? 'Hide comment' : '+ Add comment'}
              </button>

              {showCommentBox && (
                <div className="flex items-start gap-2">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mt-1">
                    {currentPage.avatar}
                  </div>
                  <div className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 focus-within:border-blue-500 transition-all">
                    <textarea
                      value={comment}
                      onChange={e => setComment(e.target.value)}
                      placeholder="Write a comment..."
                      rows={2}
                      className="w-full bg-transparent text-white/80 text-xs font-medium outline-none resize-none placeholder-white/20"
                    />
                    {/* Comment toolbar */}
                    <div className="flex justify-end mt-1 relative">
                      <div className="relative">
                        <button
                          onClick={() => setShowCommentEmoji(v => !v)}
                          className={`p-1 rounded-md transition-all text-xs ${showCommentEmoji ? 'text-yellow-400 bg-yellow-400/10' : 'text-white/30 hover:text-yellow-400 hover:bg-yellow-400/10'}`}
                        >
                          <Smile className="w-3.5 h-3.5" />
                        </button>
                        {showCommentEmoji && (
                          <div className="absolute bottom-full right-0 mb-2 bg-[#0f1117] border border-white/10 rounded-2xl p-3 shadow-2xl z-30 w-[240px]">
                            <p className="text-white/40 text-[10px] font-bold uppercase tracking-wider mb-2">Emojis</p>
                            <div className="grid grid-cols-8 gap-1 max-h-[160px] overflow-y-auto">
                              {[
                                '😀','😁','😂','🤣','😃','😄','😅','😆',
                                '😇','😉','😊','🙂','🙃','😋','😎','🥳',
                                '🤩','😍','🥰','😘','😗','😙','🤗','🤭',
                                '❤️','🧡','💛','💚','💙','💜','🖤','🤍',
                                '🔥','⭐','✨','💫','🎉','🎊','🎈','🎁',
                                '👍','👎','👏','🙌','🤝','🫶','💪','🤜',
                                '😢','😭','😤','😠','😡','🤬','😱','😨',
                                '🚀','🌈','☀️','🌙','⚡','🌊','🌺','🍀',
                              ].map(emoji => (
                                <button
                                  key={emoji}
                                  onClick={() => setComment(c => c + emoji)}
                                  className="text-base hover:bg-white/10 rounded-lg p-1 transition-all text-center leading-none"
                                >
                                  {emoji}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT: Smart Facebook Preview */}
          <div className="w-[290px] flex flex-col bg-[#16181e]">
            <div className="px-5 py-4 border-b border-white/10">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-1.5">
                  <div className="w-4 h-4 bg-blue-600 rounded-full flex items-center justify-center text-[8px] text-white font-extrabold">f</div>
                  <span className="text-white/80 text-sm font-bold">Post Preview</span>
                  <span className="text-[10px] bg-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded font-bold ml-1">LIVE</span>
                </div>
                <div className="flex items-center gap-1 bg-white/5 rounded-lg p-1 border border-white/10">
                  <button onClick={() => setPreviewDevice('desktop')} className={`p-1.5 rounded-md transition-all ${previewDevice === 'desktop' ? 'bg-blue-500 text-white' : 'text-white/40 hover:text-white'}`}>
                    <Monitor className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => setPreviewDevice('mobile')} className={`p-1.5 rounded-md transition-all ${previewDevice === 'mobile' ? 'bg-blue-500 text-white' : 'text-white/40 hover:text-white'}`}>
                    <Smartphone className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {/* Facebook Post Card */}
              <FacebookPreview content={content} page={currentPage} scheduledFor={scheduledFor} device={previewDevice} mediaFiles={mediaFiles} activeTab={activeTab} />

              {/* Comment Preview Card */}
              {comment.trim() && (
                <div className="bg-white rounded-xl overflow-hidden shadow-md border border-[#E4E6EB]">
                  <div className="px-3 pt-2 pb-1">
                    <p className="text-[10px] font-bold text-[#65676B] uppercase tracking-wider mb-2">First Comment</p>
                    <div className="flex items-start gap-2">
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-extrabold text-[9px] flex-shrink-0">
                        {currentPage.avatar}
                      </div>
                      <div className="flex-1 bg-[#F0F2F5] rounded-2xl px-3 py-2">
                        <p className="text-[10px] font-bold text-[#050505] leading-tight">{currentPage.name}</p>
                        <p className="text-[11px] text-[#050505] mt-0.5 whitespace-pre-wrap break-words">{comment}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 pl-8 mt-1 pb-2">
                      <button className="text-[10px] font-bold text-[#65676B] hover:underline">Like</button>
                      <button className="text-[10px] font-bold text-[#65676B] hover:underline">Reply</button>
                      <span className="text-[10px] text-[#65676B]">Just now</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Action Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-white/10 bg-[#16181e]">
          {/* External URL Fetcher */}
          <div className="relative flex items-center gap-2">
            <button
              onClick={() => { setShowUrlInput(!showUrlInput); setTimeout(() => urlInputRef.current?.focus(), 100); }}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition-all ${
                showUrlInput
                  ? 'bg-blue-500/20 text-blue-400 border-blue-500/40'
                  : 'bg-white/5 text-white/50 hover:text-blue-400 hover:bg-blue-400/10 border-white/10'
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              External URL
            </button>

            {/* URL Input Popup */}
            {showUrlInput && (
              <div className="absolute bottom-full left-0 mb-2 bg-[#0f1117] border border-white/10 rounded-2xl p-4 shadow-2xl w-[320px] z-10">
                <p className="text-white/60 text-[10px] font-bold uppercase tracking-wider mb-2">Paste URL to fetch content</p>
                <div className="flex gap-2">
                  <div className="flex-1 flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-3 py-2 focus-within:border-blue-500 transition-all">
                    <Globe className="w-3.5 h-3.5 text-white/30 flex-shrink-0" />
                    <input
                      ref={urlInputRef}
                      type="url"
                      value={urlInput}
                      onChange={e => setUrlInput(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') fetchFromUrl(); }}
                      placeholder="https://example.com/article"
                      className="flex-1 bg-transparent text-white text-xs font-medium outline-none placeholder-white/20"
                    />
                  </div>
                  <button
                    onClick={fetchFromUrl}
                    disabled={fetchingUrl}
                    className="px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 min-w-[64px] justify-center"
                  >
                    {fetchingUrl ? (
                      <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <><Send className="w-3 h-3" /> Fetch</>
                    )}
                  </button>
                </div>
                <p className="text-white/25 text-[10px] mt-2">Fetches title and description from the URL automatically.</p>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDraft}
              disabled={isPublishing}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl font-bold text-xs text-white/50 bg-white/5 hover:bg-white/10 border border-white/10 transition-all disabled:opacity-40"
            >
              <FileText className="w-3.5 h-3.5" />
              Save Draft
            </button>
            <button
              onClick={handlePublish}
              disabled={isPublishing}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 shadow-lg shadow-blue-500/20 transition-all disabled:opacity-60"
            >
              {isPublishing
                ? <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : <Zap className="w-3.5 h-3.5" />}
              {isPublishing ? 'Publishing...' : 'Publish'}
            </button>

            {/* Schedule with date picker + Auto Schedule */}
            <div className="relative">
              <div className="flex overflow-hidden rounded-xl border border-emerald-500/50">
                <button
                  onClick={() => setShowSchedule(!showSchedule)}
                  className="px-5 py-2.5 font-bold text-xs text-white bg-emerald-600 hover:bg-emerald-700 transition-all"
                >
                  {scheduledFor ? '📅 Scheduled' : 'Schedule'}
                </button>
                <button
                  onClick={() => setShowSchedule(!showSchedule)}
                  className="px-2 py-2.5 bg-emerald-600 hover:bg-emerald-700 border-l border-emerald-500/50 transition-all"
                >
                  <ChevronDown className="w-3.5 h-3.5 text-white" />
                </button>
              </div>
              {showSchedule && (
                <div className="absolute bottom-full right-0 mb-2 bg-[#1a1d23] border border-white/10 rounded-2xl shadow-2xl min-w-[280px] overflow-hidden z-20">
                  {/* Tabs */}
                  <div className="flex border-b border-white/10">
                    <button
                      onClick={() => setScheduleMode('manual')}
                      className={`flex-1 py-2.5 text-xs font-bold transition-all ${scheduleMode === 'manual' ? 'text-white bg-white/5 border-b-2 border-emerald-500' : 'text-white/40 hover:text-white/70'}`}
                    >
                      📅 Pick Date & Time
                    </button>
                    <button
                      onClick={() => setScheduleMode('auto')}
                      className={`flex-1 py-2.5 text-xs font-bold transition-all ${scheduleMode === 'auto' ? 'text-white bg-white/5 border-b-2 border-emerald-500' : 'text-white/40 hover:text-white/70'}`}
                    >
                      📅 My Calendar
                    </button>
                  </div>

                  {scheduleMode === 'manual' && (
                    <div className="p-4">
                      <p className="text-white/50 text-[10px] font-bold uppercase tracking-wider mb-2">Select date & time</p>
                      <input
                        type="datetime-local"
                        value={scheduledFor}
                        onChange={e => { setScheduledFor(e.target.value); setShowSchedule(false); }}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-xs font-semibold outline-none focus:border-emerald-500"
                      />
                    </div>
                  )}

                  {scheduleMode === 'auto' && (
                    <div className="p-4 space-y-4">
                      <div className="flex items-center justify-between">
                        <p className="text-white/50 text-[10px] font-bold uppercase tracking-wider">My Saved Calendar</p>
                        <button 
                          onClick={() => navigate('/time-generator')}
                          className="text-[9px] font-bold text-blue-400 hover:underline"
                        >
                          Generate New
                        </button>
                      </div>
                      
                      {savedSlots.length === 0 ? (
                        <div className="py-8 text-center space-y-2 opacity-40">
                          <Clock className="w-8 h-8 mx-auto text-white/20" />
                          <p className="text-[10px] font-bold text-white/40">No slots saved yet.</p>
                        </div>
                      ) : (() => {
                        const usedSlots: string[] = JSON.parse(localStorage.getItem('used_calendar_slots') || '[]');
                        const availableSlots = savedSlots.filter(slot => 
                          new Date(slot) > new Date() && !usedSlots.includes(slot)
                        );
                        
                        const nextSlot = availableSlots[0];
                        const remainingCount = availableSlots.length;

                        return (
                          <div className="space-y-3">
                            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center">
                              <p className="text-white/30 text-[10px] font-bold uppercase tracking-wider mb-1">Status</p>
                              <p className="text-white font-black text-xl">{remainingCount}</p>
                              <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest">Available Slots</p>
                            </div>

                            {nextSlot ? (
                              <button
                                onClick={() => {
                                  const d = new Date(nextSlot);
                                  const pad = (n: number) => String(n).padStart(2, '0');
                                  const formatted = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
                                  setScheduledFor(formatted);
                                  
                                  // Mark as used
                                  const newUsed = [...usedSlots, nextSlot];
                                  localStorage.setItem('used_calendar_slots', JSON.stringify(newUsed));
                                  
                                  setShowSchedule(false);
                                  toast.success('Auto-scheduled using next available slot!');
                                }}
                                className="w-full p-4 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/40 rounded-2xl group hover:from-emerald-500/30 transition-all text-left"
                              >
                                <p className="text-emerald-400 text-[10px] font-bold uppercase tracking-widest mb-2 flex items-center gap-1.5">
                                  <Sparkles className="w-3 h-3" /> Next Available Slot
                                </p>
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-xl bg-emerald-500 flex flex-col items-center justify-center text-[10px] font-black text-white shadow-lg shadow-emerald-500/20">
                                    <span>{format(new Date(nextSlot), 'MMM')}</span>
                                    <span className="text-sm -mt-1">{format(new Date(nextSlot), 'dd')}</span>
                                  </div>
                                  <div>
                                    <p className="text-sm font-bold text-white">{format(new Date(nextSlot), 'EEEE')}</p>
                                    <p className="text-xs font-bold text-emerald-400">{format(new Date(nextSlot), 'hh:mm a')}</p>
                                  </div>
                                </div>
                                <div className="mt-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-black rounded-xl text-center transition-all shadow-lg shadow-emerald-500/10">
                                  Auto-schedule Now
                                </div>
                              </button>
                            ) : (
                              <div className="p-6 text-center bg-white/5 border border-white/5 rounded-2xl">
                                <p className="text-white/30 text-xs font-bold">No more future slots available.</p>
                                <button 
                                  onClick={() => navigate('/time-generator')}
                                  className="mt-2 text-blue-400 text-xs font-bold hover:underline"
                                >
                                  Generate New Schedule
                                </button>
                              </div>
                            )}
                          </div>
                        );
                      })()}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
