import { useEffect, useState } from 'react';
import axios from 'axios';
import { format } from 'date-fns';
import { Clock, CheckCircle2, XCircle, Trash2, CalendarClock, Users, Globe, Activity, TrendingUp } from 'lucide-react';
import toast from '../utils/toast';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import BrandLoader from '../components/BrandLoader';

interface LayoutContext {
  setDrawerOpen: (open: boolean) => void;
  isDarkMode: boolean;
  setProfileOpen: (open: boolean) => void;
}

const API = import.meta.env.DEV ? 'http://localhost:3000' : '';

export default function Dashboard() {
  const { isDarkMode } = useOutletContext<LayoutContext>();
  const { getToken } = useAuth();
  const navigate = useNavigate();
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const userString = localStorage.getItem('user');
  const user = userString ? JSON.parse(userString) : null;
  const isAdmin = user?.role === 'ADMIN';

  useEffect(() => {
    if (isAdmin) {
      setLoading(false);
      return;
    }
    fetchPosts();
  }, [isAdmin]);

  const fetchPosts = async () => {
    try {
      const token = await getToken();
      const res = await axios.get(`${API}/api/posts`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPosts(res.data);
    } catch {
      // silently fail — user will see empty state
    } finally {
      setLoading(false);
    }
  };

  const deletePost = async (id: string) => {
    try {
      const token = await getToken();
      await axios.delete(`${API}/api/posts/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success('Post deleted');
      setPosts(prev => prev.filter(p => p.id !== id));
    } catch {
      toast.error('Failed to delete post');
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <BrandLoader size="md" />
    </div>
  );

  if (isAdmin) {
    return (
      <div className="max-w-6xl mx-auto space-y-8 animate-fade-in-up">
        <div className="flex justify-between items-end">
          <div>
            <h2 className={`text-3xl font-black tracking-tight mb-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`} style={{ fontFamily: 'Merriweather, serif', fontWeight: 900 }}>Company Overview</h2>
            <p className={`font-medium ${isDarkMode ? 'text-slate-400' : ''}`} style={isDarkMode ? {} : { color: '#1d1d1f', fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", sans-serif', letterSpacing: '-0.01em' }}>Platform health and key performance metrics.</p>
          </div>
          <button
            onClick={() => navigate('/health')}
            className={`backdrop-blur-md border px-5 py-2.5 rounded-xl text-sm font-bold shadow-sm flex items-center gap-2 transition-colors ${isDarkMode ? 'bg-slate-900/80 border-slate-800 text-slate-300 hover:bg-slate-800' : 'bg-white/80 border-slate-200/60 text-slate-700 hover:bg-white'}`}
          >
            <TrendingUp className="w-4 h-4 text-blue-500" />
            View Health
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { label: 'Total Users', value: '1,248', icon: Users, color: 'text-indigo-600', bg: 'bg-indigo-50', darkBg: 'bg-indigo-900/20' },
            { label: 'Pages Connected', value: '3,892', icon: Globe, color: 'text-blue-600', bg: 'bg-blue-50', darkBg: 'bg-blue-900/20' },
            { label: 'Posts Processed', value: '45.2k', icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-50', darkBg: 'bg-green-900/20' },
            { label: 'Active Jobs', value: '142', icon: Activity, color: 'text-amber-600', bg: 'bg-amber-50', darkBg: 'bg-amber-900/20' },
          ].map((stat, i) => (
            <div key={i} className={`backdrop-blur-xl border p-6 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] transform transition-all hover:-translate-y-1 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] flex flex-col gap-4 ${isDarkMode ? 'bg-slate-900/70 border-slate-800' : 'bg-white/70 border-white'}`}>
              <div className="flex items-center justify-between">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${isDarkMode ? stat.darkBg : stat.bg}`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                <span className={`text-xs font-bold px-2.5 py-1 rounded-lg ${isDarkMode ? 'text-green-400 bg-green-900/20' : 'text-green-500 bg-green-50'}`}>+12%</span>
              </div>
              <div>
                <h3 className={`text-3xl font-extrabold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>{stat.value}</h3>
                <p className={`text-sm font-semibold mt-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>{stat.label}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className={`backdrop-blur-xl rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border p-8 lg:col-span-2 ${isDarkMode ? 'bg-slate-900/80 border-slate-800' : 'bg-white/80 border-white'}`}>
            <div className="flex justify-between items-center mb-6">
              <h3 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>Platform Growth</h3>
              <select className={`border-none text-sm font-semibold rounded-lg px-3 py-1.5 outline-none ${isDarkMode ? 'bg-slate-800 text-slate-400' : 'bg-slate-50 text-slate-600'}`}>
                <option>Last 30 Days</option>
                <option>This Year</option>
              </select>
            </div>
            <div className="h-64 flex items-end gap-3 px-4">
              {[45, 60, 55, 80, 70, 90, 100].map((h, i) => (
                <div key={i} className="flex-1 bg-gradient-to-t from-blue-600 to-indigo-500 rounded-t-lg transition-all hover:opacity-80 cursor-pointer" style={{ height: `${h}%` }} />
              ))}
            </div>
          </div>
          <div className={`backdrop-blur-xl rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border p-8 ${isDarkMode ? 'bg-slate-900/80 border-slate-800' : 'bg-white/80 border-white'}`}>
            <h3 className={`text-lg font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>Recent Activities</h3>
            <div className="space-y-6">
              {[
                { user: 'Bishal Karkee', action: 'Connected new page', time: '2m ago' },
                { user: 'Suman Devkota', action: 'Scheduled 5 posts', time: '15m ago' },
                { user: 'Anil Thapa', action: 'Joined as user', time: '1h ago' },
              ].map((act, i) => (
                <div key={i} className="flex gap-4">
                  <div className={`w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center font-bold text-blue-600 ${isDarkMode ? 'bg-slate-800' : 'bg-slate-100'}`}>
                    {act.user[0]}
                  </div>
                  <div>
                    <p className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>{act.user}</p>
                    <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>{act.action}</p>
                    <p className="text-[10px] text-slate-400 mt-1 font-bold uppercase">{act.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const scheduled = posts.filter(p => p.status === 'SCHEDULED').length;
  const published = posts.filter(p => p.status === 'PUBLISHED').length;

  return (
    <div className="max-w-6xl mx-auto space-y-4 animate-fade-in-up">
      {/* Welcome Banner */}
      <div className={`backdrop-blur-xl p-5 rounded-2xl border shadow-[0_4px_20px_rgb(0,0,0,0.04)] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 ${isDarkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-white/60 border-white'}`}>
        <div>
          <div className="flex items-center gap-3 mb-1">
            <img src="/hello.png.png" alt="hello" className="h-10 object-contain" />
            <h2 className={`text-xl font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`} style={{ fontFamily: 'Merriweather, serif', fontWeight: 900 }}>{user?.name || 'User'}</h2>
          </div>
          <p className={`text-sm font-medium max-w-lg ${isDarkMode ? 'text-slate-400' : ''}`} style={isDarkMode ? {} : { color: '#1d1d1f', fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", sans-serif', letterSpacing: '-0.01em' }}>Same energy, new time</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'Scheduled Posts', value: String(scheduled), icon: CalendarClock, color: 'text-indigo-600', bg: 'bg-indigo-50', darkBg: 'bg-indigo-900/20' },
          { label: 'Published Posts', value: String(published), icon: CheckCircle2, color: 'text-blue-600', bg: 'bg-blue-50', darkBg: 'bg-blue-900/20' },
          { label: 'Total Posts', value: String(posts.length), icon: Activity, color: 'text-green-600', bg: 'bg-green-50', darkBg: 'bg-green-900/20' },
        ].map((stat, i) => (
          <div key={i} className={`backdrop-blur-xl border p-4 rounded-2xl shadow-[0_4px_20px_rgb(0,0,0,0.04)] transform transition-all hover:-translate-y-0.5 flex items-center gap-4 ${isDarkMode ? 'bg-slate-900/70 border-slate-800' : 'bg-white/70 border-white'}`}>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${isDarkMode ? stat.darkBg : stat.bg}`}>
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
            </div>
            <div>
              <p className={`text-xs font-semibold mb-0.5 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>{stat.label}</p>
              <h3 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* Scheduled Posts Table */}
      <div className={`backdrop-blur-xl rounded-2xl shadow-[0_4px_20px_rgb(0,0,0,0.04)] border overflow-hidden ${isDarkMode ? 'bg-slate-900/80 border-slate-800' : 'bg-white/80 border-white'}`}>
        <div className={`px-5 py-4 border-b flex justify-between items-center ${isDarkMode ? 'border-slate-800 bg-slate-900/50' : 'border-slate-100/80 bg-white/50'}`}>
          <h3 className={`text-sm font-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`} style={{ fontFamily: 'Merriweather, serif', fontWeight: 900 }}>Your Posts</h3>
          <button
            onClick={() => navigate('/my-posts')}
            className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-colors ${isDarkMode ? 'text-blue-400 bg-blue-600/10 hover:text-blue-300' : 'text-blue-600 bg-blue-50 hover:text-blue-700'}`}
          >
            View All
          </button>
        </div>

        {posts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Clock className={`w-10 h-10 mb-3 ${isDarkMode ? 'text-slate-700' : 'text-slate-200'}`} />
            <p className={`text-sm font-semibold ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>No posts yet.</p>
            <p className={`text-xs mt-1 ${isDarkMode ? 'text-slate-600' : 'text-slate-300'}`}>Click "Create Post" in the sidebar to get started.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className={`text-[10px] uppercase tracking-widest font-bold ${isDarkMode ? 'bg-slate-800/50 text-slate-400' : 'bg-slate-50/50 text-slate-500'}`}>
                  <th className="px-4 py-3">Content</th>
                  <th className="px-4 py-3">Page</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Scheduled For</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isDarkMode ? 'divide-slate-800' : 'divide-slate-100'}`}>
                {posts.slice(0, 8).map((post) => (
                  <tr key={post.id} className={`transition-colors duration-200 group ${isDarkMode ? 'hover:bg-slate-800/50' : 'hover:bg-slate-50/50'}`}>
                    <td className="px-4 py-3 max-w-xs">
                      <p className={`text-sm font-medium truncate ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>{post.content || 'Media/Link Post'}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-semibold ${isDarkMode ? 'bg-indigo-900/20 text-indigo-400' : 'bg-indigo-50 text-indigo-700'}`}>
                        {post.page?.name || 'Unknown Page'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider
                        ${post.status === 'PUBLISHED' ? (isDarkMode ? 'bg-green-900/20 text-green-400' : 'bg-green-100 text-green-700') :
                          post.status === 'SCHEDULED' ? (isDarkMode ? 'bg-blue-900/20 text-blue-400' : 'bg-blue-100 text-blue-700') :
                          post.status === 'DRAFT' ? (isDarkMode ? 'bg-amber-900/20 text-amber-400' : 'bg-amber-100 text-amber-700') :
                          post.status === 'FAILED' ? (isDarkMode ? 'bg-red-900/20 text-red-400' : 'bg-red-100 text-red-700') :
                          (isDarkMode ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-700')}`}>
                        {post.status === 'PUBLISHED' ? <CheckCircle2 className="w-3 h-3 mr-1" /> :
                         post.status === 'FAILED' ? <XCircle className="w-3 h-3 mr-1" /> :
                         <Clock className="w-3 h-3 mr-1" />}
                        {post.status}
                      </span>
                    </td>
                    <td className={`px-4 py-3 text-xs font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                      {post.scheduledFor ? format(new Date(post.scheduledFor), 'MMM d, yyyy h:mm a') : '—'}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => deletePost(post.id)}
                        className={`p-1.5 rounded-lg transition-all duration-200 opacity-0 group-hover:opacity-100 focus:opacity-100 ${isDarkMode ? 'text-slate-500 hover:text-red-400 hover:bg-red-500/10' : 'text-slate-400 hover:text-red-500 hover:bg-red-50'}`}
                        title="Delete Post"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
