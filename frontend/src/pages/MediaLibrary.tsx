import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';
import axios from 'axios';
import { Search, RefreshCw, RotateCcw, Calendar, Clock, CheckCircle2, AlertCircle, FileText, Layers, X, Image } from 'lucide-react';
import toast from '../utils/toast';
import BulkScheduleModal from '../components/BulkScheduleModal';
import { getActiveAccountId } from '../components/AccountSwitcher';

const API = 'http://localhost:3000';

interface Post {
  id: string;
  content: string;
  link?: string;
  imageUrl?: string | null;
  status: 'DRAFT' | 'SCHEDULED' | 'PUBLISHED' | 'FAILED';
  scheduledFor?: string;
  createdAt: string;
  page?: {
    name: string;
    accountId: string;
    account?: { id: string; name: string; avatarUrl: string | null };
  };
}

interface LayoutContext {
  isDarkMode: boolean;
  openDrawerWith: (prefill: { content: string; link?: string; imageUrl?: string }) => void;
}

const STATUS_CONFIG = {
  DRAFT:     { label: 'Draft',     icon: FileText,     color: 'text-slate-400 bg-slate-900/80 border-slate-700' },
  SCHEDULED: { label: 'Scheduled', icon: Clock,        color: 'text-amber-400 bg-slate-900/80 border-amber-800' },
  PUBLISHED: { label: 'Published', icon: CheckCircle2, color: 'text-emerald-400 bg-slate-900/80 border-emerald-800' },
  FAILED:    { label: 'Failed',    icon: AlertCircle,  color: 'text-red-400 bg-slate-900/80 border-red-800' },
};

function PostDetailModal({
  post,
  isDarkMode,
  onClose,
  onReuse,
  onBulk,
}: {
  post: Post;
  isDarkMode: boolean;
  onClose: () => void;
  onReuse: () => void;
  onBulk: () => void;
}) {
  const cfg = STATUS_CONFIG[post.status];
  const StatusIcon = cfg.icon;

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className={`fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[520px] max-h-[90vh] flex flex-col rounded-2xl border shadow-2xl overflow-hidden ${
        isDarkMode ? 'bg-[#0f0f1a] border-white/10' : 'bg-white border-slate-100'
      }`}>
        {/* Image hero */}
        {post.imageUrl && (
          <div className="relative w-full bg-black" style={{ maxHeight: 280 }}>
            <img src={post.imageUrl} alt="" className="w-full object-contain" style={{ maxHeight: 280 }} />
            <button
              onClick={onClose}
              className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/80 transition-all"
            >
              <X className="w-4 h-4" />
            </button>
            {/* Status badge over image */}
            <span className={`absolute top-3 left-3 flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full border backdrop-blur-sm ${cfg.color}`}>
              <StatusIcon className="w-3 h-3" />
              {cfg.label}
            </span>
          </div>
        )}

        {/* Header (when no image) */}
        {!post.imageUrl && (
          <div className={`flex items-center justify-between px-6 py-4 border-b ${isDarkMode ? 'border-white/[0.06]' : 'border-slate-100'}`}>
            <div className="flex items-center gap-3">
              {post.page?.account?.avatarUrl ? (
                <img src={post.page.account.avatarUrl} alt="" className="w-8 h-8 rounded-lg object-cover ring-1 ring-blue-500/30" />
              ) : (
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-black">
                  {post.page?.account?.name?.[0] || 'F'}
                </div>
              )}
              <div>
                <p className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{post.page?.name || 'Unknown Page'}</p>
                <p className={`text-[10px] ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>{post.page?.account?.name}</p>
              </div>
            </div>
            <button onClick={onClose} className={`w-7 h-7 rounded-lg flex items-center justify-center ${isDarkMode ? 'text-slate-500 hover:bg-white/10' : 'text-slate-400 hover:bg-slate-100'}`}>
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          {/* Page info (when has image — shown below image) */}
          {post.imageUrl && (
            <div className="flex items-center gap-2">
              {post.page?.account?.avatarUrl ? (
                <img src={post.page.account.avatarUrl} alt="" className="w-7 h-7 rounded-lg object-cover" />
              ) : (
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-[10px] font-black">
                  {post.page?.account?.name?.[0] || 'F'}
                </div>
              )}
              <div>
                <p className={`text-xs font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{post.page?.name}</p>
                <p className={`text-[10px] ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>{post.page?.account?.name}</p>
              </div>
              {post.scheduledFor && (
                <span className={`ml-auto flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full ${isDarkMode ? 'bg-white/5 text-slate-400' : 'bg-slate-100 text-slate-500'}`}>
                  <Calendar className="w-3 h-3" />
                  {new Date(post.scheduledFor).toLocaleString()}
                </span>
              )}
            </div>
          )}

          {/* Status + date (no image case) */}
          {!post.imageUrl && (
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full border ${cfg.color}`}>
                <StatusIcon className="w-3 h-3" />
                {cfg.label}
              </span>
              {post.scheduledFor && (
                <span className={`flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full ${isDarkMode ? 'bg-white/5 text-slate-400' : 'bg-slate-100 text-slate-500'}`}>
                  <Calendar className="w-3 h-3" />
                  {new Date(post.scheduledFor).toLocaleString()}
                </span>
              )}
              <span className={`ml-auto text-[10px] ${isDarkMode ? 'text-slate-600' : 'text-slate-400'}`}>
                {new Date(post.createdAt).toLocaleDateString()}
              </span>
            </div>
          )}

          {/* Caption */}
          {post.content && (
            <div className={`rounded-xl p-4 text-sm leading-relaxed whitespace-pre-wrap ${isDarkMode ? 'bg-white/[0.04] border border-white/[0.06] text-white/90' : 'bg-slate-50 border border-slate-100 text-slate-800'}`}>
              {post.content}
            </div>
          )}

          {/* Link */}
          {post.link && (
            <div className={`rounded-xl p-3 flex items-center gap-2 ${isDarkMode ? 'bg-blue-500/10 border border-blue-500/20' : 'bg-blue-50 border border-blue-100'}`}>
              <span className={`text-[10px] font-black uppercase tracking-widest flex-shrink-0 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>Link</span>
              <a href={post.link} target="_blank" rel="noopener noreferrer" className={`text-xs truncate hover:underline ${isDarkMode ? 'text-blue-300' : 'text-blue-700'}`}>
                {post.link}
              </a>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className={`px-6 py-4 border-t flex items-center gap-2 ${isDarkMode ? 'border-white/[0.06]' : 'border-slate-100'}`}>
          <button onClick={onClose} className={`px-4 py-2 rounded-xl text-sm font-bold border transition-all ${isDarkMode ? 'border-white/10 text-slate-400 hover:bg-white/5' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
            Close
          </button>
          <div className="flex-1" />
          <button
            onClick={onBulk}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold border transition-all ${isDarkMode ? 'border-violet-500/30 text-violet-400 hover:bg-violet-500/10' : 'border-violet-200 text-violet-700 hover:bg-violet-50'}`}
          >
            <Layers className="w-3.5 h-3.5" />
            Bulk Schedule
          </button>
          <button
            onClick={onReuse}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-500 hover:to-indigo-500 transition-all shadow-lg shadow-blue-500/20"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reuse Post
          </button>
        </div>
      </div>
    </>
  );
}

export default function MediaLibrary() {
  const { isDarkMode, openDrawerWith } = useOutletContext<LayoutContext>();
  const { getToken } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [bulkPost, setBulkPost] = useState<Post | null>(null);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const devToken = localStorage.getItem('dev_bypass_token');
      const clerkToken = devToken || await getToken();
      const accountId = getActiveAccountId();
      const params: Record<string, string> = {};
      if (accountId) params.accountId = accountId;

      const res = await axios.get(`${API}/api/posts`, {
        headers: { Authorization: `Bearer ${clerkToken}` },
        params,
      });
      setPosts(res.data);
    } catch {
      toast.error('Failed to load posts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
    const handler = () => fetchPosts();
    window.addEventListener('account-switch', handler);
    return () => window.removeEventListener('account-switch', handler);
  }, []);

  const filtered = posts.filter(p => {
    const matchStatus = statusFilter === 'ALL' || p.status === statusFilter;
    const matchSearch = !search || p.content?.toLowerCase().includes(search.toLowerCase()) || p.page?.name?.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  const handleReuse = (post: Post) => {
    setSelectedPost(null);
    openDrawerWith({ content: post.content, link: post.link, imageUrl: post.imageUrl ?? undefined });
  };

  const handleBulk = (post: Post) => {
    setSelectedPost(null);
    setBulkPost(post);
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className={`text-2xl font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Media Library</h1>
          <p className={`text-sm mt-1 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
            {posts.length} posts across all connected pages
          </p>
        </div>
        <button
          onClick={fetchPosts}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold border transition-all ${
            isDarkMode ? 'border-white/10 text-slate-400 hover:bg-white/5' : 'border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-6">
        <div className={`flex items-center gap-2 flex-1 max-w-sm px-3 py-2 rounded-xl border transition-all ${
          isDarkMode ? 'bg-white/[0.04] border-white/[0.08] focus-within:border-blue-500/40' : 'bg-white border-slate-200 focus-within:border-blue-500'
        }`}>
          <Search className={`w-4 h-4 flex-shrink-0 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search posts..."
            className={`flex-1 bg-transparent text-sm outline-none ${isDarkMode ? 'text-white placeholder-slate-600' : 'text-slate-800 placeholder-slate-400'}`}
          />
        </div>

        <div className="flex items-center gap-1">
          {(['ALL', 'DRAFT', 'SCHEDULED', 'PUBLISHED', 'FAILED'] as const).map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                statusFilter === s
                  ? isDarkMode ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'bg-blue-50 text-blue-700 border border-blue-200'
                  : isDarkMode ? 'text-slate-500 hover:text-slate-300 hover:bg-white/5' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'
              }`}
            >
              {s === 'ALL' ? 'All' : STATUS_CONFIG[s].label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className={`rounded-2xl animate-pulse aspect-square ${isDarkMode ? 'bg-white/[0.03]' : 'bg-slate-100'}`} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className={`flex flex-col items-center justify-center py-24 rounded-2xl border-2 border-dashed ${
          isDarkMode ? 'border-white/[0.06] text-slate-600' : 'border-slate-200 text-slate-400'
        }`}>
          <FileText className="w-12 h-12 mb-3 opacity-30" />
          <p className="font-bold text-sm">No posts found</p>
          <p className="text-xs mt-1 opacity-60">{search ? 'Try a different search' : 'Create your first post to see it here'}</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {filtered.map(post => {
            const cfg = STATUS_CONFIG[post.status];
            const StatusIcon = cfg.icon;
            const hasImage = !!post.imageUrl;

            return (
              <div
                key={post.id}
                onClick={() => setSelectedPost(post)}
                className="group relative rounded-2xl overflow-hidden cursor-pointer aspect-square border border-white/5 hover:border-white/20 transition-all hover:scale-[1.02] hover:shadow-xl"
              >
                {hasImage ? (
                  /* Image card */
                  <>
                    <img src={post.imageUrl!} alt="" className="w-full h-full object-cover" />
                    {/* Dark gradient overlay — always visible at bottom */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
                    {/* Status badge */}
                    <div className="absolute top-2 left-2">
                      <span className={`flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-full border backdrop-blur-sm ${cfg.color}`}>
                        <StatusIcon className="w-2.5 h-2.5" />
                        {cfg.label}
                      </span>
                    </div>
                    {/* Page + caption at bottom */}
                    <div className="absolute bottom-0 left-0 right-0 p-3">
                      <p className="text-white text-[11px] font-bold truncate">{post.page?.name}</p>
                      {post.content && (
                        <p className="text-white/70 text-[10px] leading-tight line-clamp-2 mt-0.5">{post.content}</p>
                      )}
                    </div>
                    {/* Hover: reuse button */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <button
                        onClick={e => { e.stopPropagation(); handleReuse(post); }}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/20 backdrop-blur-sm text-white text-xs font-bold border border-white/20 hover:bg-white/30 transition-all"
                      >
                        <RotateCcw className="w-3 h-3" /> Reuse
                      </button>
                      <button
                        onClick={e => { e.stopPropagation(); handleBulk(post); }}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-violet-500/80 backdrop-blur-sm text-white text-xs font-bold border border-violet-400/40 hover:bg-violet-500 transition-all"
                      >
                        <Layers className="w-3 h-3" /> Bulk
                      </button>
                    </div>
                  </>
                ) : (
                  /* Text-only card */
                  <div className={`w-full h-full p-4 flex flex-col justify-between ${
                    isDarkMode ? 'bg-white/[0.03] hover:bg-white/[0.06]' : 'bg-slate-50 hover:bg-slate-100'
                  } transition-colors`}>
                    {/* Top: page + status */}
                    <div className="flex items-start justify-between gap-1">
                      <div className="flex items-center gap-1.5 min-w-0">
                        {post.page?.account?.avatarUrl ? (
                          <img src={post.page.account.avatarUrl} alt="" className="w-6 h-6 rounded-md object-cover flex-shrink-0" />
                        ) : (
                          <div className="w-6 h-6 rounded-md bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-[9px] font-black flex-shrink-0">
                            {post.page?.account?.name?.[0] || 'F'}
                          </div>
                        )}
                        <p className={`text-[10px] font-bold truncate ${isDarkMode ? 'text-white/70' : 'text-slate-700'}`}>{post.page?.name}</p>
                      </div>
                      <span className={`flex items-center gap-0.5 text-[9px] font-bold px-1.5 py-0.5 rounded-full border flex-shrink-0 ${
                        isDarkMode
                          ? post.status === 'PUBLISHED' ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
                          : post.status === 'SCHEDULED' ? 'text-amber-400 bg-amber-500/10 border-amber-500/20'
                          : post.status === 'FAILED' ? 'text-red-400 bg-red-500/10 border-red-500/20'
                          : 'text-slate-500 bg-white/5 border-white/10'
                          : post.status === 'PUBLISHED' ? 'text-emerald-600 bg-emerald-50 border-emerald-200'
                          : post.status === 'SCHEDULED' ? 'text-amber-600 bg-amber-50 border-amber-200'
                          : post.status === 'FAILED' ? 'text-red-600 bg-red-50 border-red-200'
                          : 'text-slate-500 bg-slate-100 border-slate-200'
                      }`}>
                        <StatusIcon className="w-2.5 h-2.5" />
                        {cfg.label}
                      </span>
                    </div>

                    {/* Center: text preview with image icon placeholder */}
                    <div className="flex-1 py-2 flex items-center justify-center">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-1 ${isDarkMode ? 'bg-white/5' : 'bg-slate-200/60'}`}>
                        <Image className={`w-5 h-5 opacity-30 ${isDarkMode ? 'text-white' : 'text-slate-600'}`} />
                      </div>
                    </div>

                    {/* Bottom: caption + date */}
                    <div>
                      <p className={`text-xs leading-snug line-clamp-3 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                        {post.content || <span className="italic opacity-40">No caption</span>}
                      </p>
                      <p className={`text-[9px] mt-1.5 ${isDarkMode ? 'text-slate-600' : 'text-slate-400'}`}>
                        {post.scheduledFor ? new Date(post.scheduledFor).toLocaleDateString() : new Date(post.createdAt).toLocaleDateString()}
                      </p>
                    </div>

                    {/* Hover actions */}
                    <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 rounded-2xl ${isDarkMode ? 'bg-black/60' : 'bg-white/80'} backdrop-blur-sm`}>
                      <button
                        onClick={e => { e.stopPropagation(); handleReuse(post); }}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-500 transition-all"
                      >
                        <RotateCcw className="w-3 h-3" /> Reuse
                      </button>
                      <button
                        onClick={e => { e.stopPropagation(); handleBulk(post); }}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-violet-600 text-white text-xs font-bold hover:bg-violet-500 transition-all"
                      >
                        <Layers className="w-3 h-3" /> Bulk
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Post Detail Modal */}
      {selectedPost && (
        <PostDetailModal
          post={selectedPost}
          isDarkMode={isDarkMode}
          onClose={() => setSelectedPost(null)}
          onReuse={() => handleReuse(selectedPost)}
          onBulk={() => handleBulk(selectedPost)}
        />
      )}

      {/* Bulk Schedule Modal */}
      {bulkPost && (
        <BulkScheduleModal
          content={bulkPost.content}
          link={bulkPost.link}
          imageUrl={bulkPost.imageUrl ?? undefined}
          isDarkMode={isDarkMode}
          onClose={() => setBulkPost(null)}
        />
      )}
    </div>
  );
}
