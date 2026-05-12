import { useState, useEffect } from 'react';
import axios from 'axios';
import { format } from 'date-fns';
import { FileText, CheckCircle2, Clock, AlertCircle, Trash2, PenSquare, RefreshCw } from 'lucide-react';
import { Link, useOutletContext } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';
import toast from '../utils/toast';
import BrandLoader from '../components/BrandLoader';

interface LayoutContext {
  setDrawerOpen: (open: boolean) => void;
  isDarkMode: boolean;
  setProfileOpen: (open: boolean) => void;
}

const API = 'http://localhost:3000';

const statusConfig: Record<string, { label: string; icon: any; bg: string; text: string; darkBg: string }> = {
  PUBLISHED: { label: 'Published', icon: CheckCircle2, bg: 'bg-green-100', text: 'text-green-700', darkBg: 'bg-green-900/20' },
  SCHEDULED: { label: 'Scheduled', icon: Clock,       bg: 'bg-blue-100',  text: 'text-blue-700',  darkBg: 'bg-blue-900/20'  },
  DRAFT:     { label: 'Draft',     icon: AlertCircle, bg: 'bg-amber-100', text: 'text-amber-700', darkBg: 'bg-amber-900/20' },
  FAILED:    { label: 'Failed',    icon: AlertCircle, bg: 'bg-red-100',   text: 'text-red-700',   darkBg: 'bg-red-900/20'   },
};

const tabs = ['All', 'Published', 'Scheduled', 'Draft'];

export default function MyPosts() {
  const { setDrawerOpen, isDarkMode } = useOutletContext<LayoutContext>();
  const { getToken } = useAuth();
  const [posts, setPosts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('All');

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    setIsLoading(true);
    try {
      const token = await getToken();
      const res = await axios.get(`${API}/api/posts`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPosts(res.data);
    } catch {
      setPosts([]);
    } finally {
      setIsLoading(false);
    }
  };

  const deletePost = async (id: string) => {
    try {
      const token = await getToken();
      await axios.delete(`${API}/api/posts/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPosts(prev => prev.filter(p => p.id !== id));
      toast.success('Post deleted');
    } catch {
      toast.error('Failed to delete post');
    }
  };

  if (isLoading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <BrandLoader size="md" />
    </div>
  );

  const counts = {
    All:       posts.length,
    Published: posts.filter(p => p.status === 'PUBLISHED').length,
    Scheduled: posts.filter(p => p.status === 'SCHEDULED').length,
    Draft:     posts.filter(p => p.status === 'DRAFT').length,
  };

  const filteredPosts = activeTab === 'All'
    ? posts
    : posts.filter(p => p.status === activeTab.toUpperCase());

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in-up">
      <div className="flex justify-between items-end">
        <div>
          <h2 className={`text-3xl font-black tracking-tight mb-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`} style={{ fontFamily: 'Merriweather, serif', fontWeight: 900 }}>My Posts</h2>
          <p className={`font-medium ${isDarkMode ? 'text-slate-400' : ''}`} style={isDarkMode ? {} : { color: '#1d1d1f', fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", sans-serif', letterSpacing: '-0.01em' }}>Manage all your Facebook posts across every connected page.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchPosts}
            title="Refresh"
            className={`p-3 rounded-2xl border transition-all ${isDarkMode ? 'border-slate-700 text-slate-400 hover:bg-slate-800' : 'border-slate-200 text-slate-500 hover:border-slate-400'}`}
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <Link
            to="/time-generator"
            className={`flex items-center gap-2 py-3 px-5 rounded-2xl font-black text-sm transition-all border ${isDarkMode ? 'border-slate-700 text-slate-300 hover:bg-slate-800' : 'border-slate-200 text-slate-600 hover:border-slate-400 hover:text-slate-900'}`}
          >
            <RefreshCw className="w-4 h-4 text-indigo-500" />
            Smart Schedule
          </Link>
          <button
            onClick={() => setDrawerOpen(true)}
            className={`flex items-center gap-2 py-3 px-5 rounded-2xl font-black text-sm transition-all ${isDarkMode ? 'bg-white/10 text-white hover:bg-white/20 border border-white/20' : 'border border-slate-900 text-slate-900 hover:bg-slate-900 hover:text-white'}`}
          >
            <PenSquare className="w-4 h-4" />
            New Post
          </button>
        </div>
      </div>

      <div className="flex gap-3 flex-wrap">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all duration-300 flex items-center gap-2 border shadow-sm
              ${tab === activeTab
                ? 'bg-blue-600 text-white shadow-[0_8px_20px_rgba(37,99,235,0.3)] border-transparent'
                : isDarkMode ? 'bg-slate-900/70 text-slate-400 border-slate-800 hover:bg-slate-800' : 'bg-white/70 text-slate-600 border-slate-200/60 hover:bg-white'
              }`}
          >
            {tab}
            <span className={`text-xs font-extrabold px-2 py-0.5 rounded-md ${tab === activeTab ? 'bg-white/20 text-white' : (isDarkMode ? 'bg-slate-800 text-slate-500' : 'bg-slate-100 text-slate-500')}`}>
              {counts[tab as keyof typeof counts]}
            </span>
          </button>
        ))}
      </div>

      {filteredPosts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <FileText className={`w-12 h-12 mb-4 ${isDarkMode ? 'text-slate-700' : 'text-slate-200'}`} />
          <p className={`text-sm font-semibold ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
            {activeTab === 'All' ? 'No posts yet.' : `No ${activeTab.toLowerCase()} posts.`}
          </p>
          <button
            onClick={() => setDrawerOpen(true)}
            className="mt-4 text-sm font-bold text-blue-600 hover:underline"
          >
            + Create your first post
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredPosts.map((post) => {
            const cfg = statusConfig[post.status] || statusConfig.DRAFT;
            const Icon = cfg.icon;
            return (
              <div key={post.id} className={`backdrop-blur-xl border rounded-2xl shadow-[0_4px_20px_rgb(0,0,0,0.04)] p-6 flex flex-col sm:flex-row sm:items-center gap-4 transition-all hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:-translate-y-0.5 group ${isDarkMode ? 'bg-slate-900/80 border-slate-800' : 'bg-white/80 border-white'}`}>
                <div className="flex-1 min-w-0">
                  <p className={`font-semibold text-sm sm:text-base mb-2 line-clamp-2 ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>{post.content || 'Media / Link Post'}</p>
                  <div className="flex flex-wrap items-center gap-3">
                    <span className={`inline-flex items-center px-3 py-1 rounded-lg text-xs font-bold ${isDarkMode ? 'bg-indigo-900/20 text-indigo-400' : 'bg-indigo-50 text-indigo-700'}`}>
                      {post.page?.name || 'Unknown Page'}
                    </span>
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${cfg.text} ${isDarkMode ? cfg.darkBg : cfg.bg}`}>
                      <Icon className="w-3.5 h-3.5" />
                      {cfg.label}
                    </span>
                    {post.scheduledFor && (
                      <span className={`text-xs font-semibold ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                        {format(new Date(post.scheduledFor), 'MMM d, yyyy • h:mm a')}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => setDrawerOpen(true)}
                    className={`p-2.5 rounded-xl transition-all ${isDarkMode ? 'text-slate-500 hover:text-blue-400 hover:bg-blue-900/20' : 'text-slate-400 hover:text-blue-600 hover:bg-blue-50'}`}
                    title="Edit Post"
                  >
                    <PenSquare className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => deletePost(post.id)}
                    className={`p-2.5 rounded-xl transition-all ${isDarkMode ? 'text-slate-500 hover:text-red-400 hover:bg-red-900/20' : 'text-slate-400 hover:text-red-500 hover:bg-red-50'}`}
                    title="Delete Post"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
