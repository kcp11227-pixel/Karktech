import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import toast from '../utils/toast';
import { Globe, Link as LinkIcon, Calendar, Image as ImageIcon, Send } from 'lucide-react';

export default function PostComposer() {
  const [pages, setPages] = useState<any[]>([]);
  const [selectedPage, setSelectedPage] = useState('');
  const [content, setContent] = useState('');
  const [link, setLink] = useState('');
  const [scheduledFor, setScheduledFor] = useState('');
  const [fbTokenInput, setFbTokenInput] = useState('');
  
  const navigate = useNavigate();

  useEffect(() => {
    fetchPages();
  }, []);

  const fetchPages = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:3000/api/facebook/pages', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPages(res.data);
      if (res.data.length > 0) {
        setSelectedPage(res.data[0].id);
      }
    } catch (error) {
      toast.error('Failed to load Facebook pages');
    }
  };

  const handleConnectPage = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:3000/api/facebook/pages', 
        { accessToken: fbTokenInput },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Pages connected successfully!');
      setFbTokenInput('');
      fetchPages();
    } catch (error) {
      toast.error('Failed to connect pages. Check your access token.');
    }
  };

  const handleSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:3000/api/posts', 
        {
          pageId: selectedPage,
          content,
          link,
          scheduledFor: scheduledFor ? new Date(scheduledFor).toISOString() : null
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Post saved successfully!');
      navigate('/');
    } catch (error) {
      toast.error('Failed to save post');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in-up pb-10">
      <div className="mb-8">
        <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-slate-800 to-slate-600 tracking-tight mb-2">Create Post</h2>
        <p className="text-slate-500 font-medium">Draft and schedule content for your Facebook Pages.</p>
      </div>

      {/* Connect Facebook Section */}
      <div className="bg-white/80 backdrop-blur-xl p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
            <Globe className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800">Connect Facebook Pages</h2>
            <p className="text-sm text-slate-500 font-medium">
              Paste your User Access Token to connect your pages.
            </p>
          </div>
        </div>
        <form onSubmit={handleConnectPage} className="flex flex-col sm:flex-row gap-4">
          <input 
            type="text" 
            placeholder="Paste your token here (EAA...)"
            className="flex-1 px-5 py-4 rounded-xl border border-slate-200/60 bg-white/50 focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all duration-300 placeholder:text-slate-400 font-medium text-slate-700"
            value={fbTokenInput}
            onChange={e => setFbTokenInput(e.target.value)}
            required
          />
          <button type="submit" className="bg-slate-900 hover:bg-slate-800 text-white px-8 py-4 rounded-xl font-bold shadow-lg shadow-slate-900/20 transform transition-all duration-200 hover:-translate-y-0.5 whitespace-nowrap">
            Connect Pages
          </button>
        </form>
      </div>

      {/* Post Composer Section */}
      <div className="bg-white/80 backdrop-blur-xl p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white">
        <form onSubmit={handleSchedule} className="space-y-8">
          
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-700 ml-1">Select Facebook Page</label>
            <div className="relative">
              <select 
                className="w-full px-5 py-4 rounded-xl border border-slate-200/60 bg-white/50 focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all duration-300 font-medium text-slate-700 appearance-none"
                value={selectedPage}
                onChange={e => setSelectedPage(e.target.value)}
                required
              >
                <option value="" disabled>Choose a page...</option>
                {pages.map(page => (
                  <option key={page.id} value={page.id}>{page.name}</option>
                ))}
              </select>
              <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-700 ml-1">Post Content</label>
            <textarea 
              rows={5}
              className="w-full px-5 py-4 rounded-xl border border-slate-200/60 bg-white/50 focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none resize-none transition-all duration-300 placeholder:text-slate-400 font-medium text-slate-700"
              placeholder="What do you want to share with your audience?"
              value={content}
              onChange={e => setContent(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 ml-1">
                <LinkIcon className="w-4 h-4 text-slate-400" />
                Attach Link
              </label>
              <input 
                type="url"
                className="w-full px-5 py-4 rounded-xl border border-slate-200/60 bg-white/50 focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all duration-300 placeholder:text-slate-400 font-medium text-slate-700"
                placeholder="https://example.com"
                value={link}
                onChange={e => setLink(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 ml-1">
                <Calendar className="w-4 h-4 text-slate-400" />
                Schedule Time
              </label>
              <input 
                type="datetime-local"
                className="w-full px-5 py-4 rounded-xl border border-slate-200/60 bg-white/50 focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all duration-300 font-medium text-slate-700"
                value={scheduledFor}
                onChange={e => setScheduledFor(e.target.value)}
              />
              <p className="mt-1 ml-1 text-xs text-slate-400 font-medium">Leave blank to save as a draft.</p>
            </div>
          </div>

          <div className="flex justify-end gap-4 pt-8 border-t border-slate-100/80">
            <button type="button" onClick={() => navigate('/')} className="px-8 py-4 text-slate-500 hover:text-slate-700 hover:bg-slate-50 rounded-xl font-bold transition-all duration-200">
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={!selectedPage} 
              className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white px-8 py-4 rounded-xl font-bold shadow-lg shadow-blue-500/25 transform transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0"
            >
              <Send className="w-4 h-4" />
              {scheduledFor ? 'Schedule Post' : 'Save as Draft'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
