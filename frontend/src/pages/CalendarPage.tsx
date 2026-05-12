import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, PenSquare, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { useOutletContext } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths } from 'date-fns';

interface LayoutContext {
  setDrawerOpen: (open: boolean) => void;
  isDarkMode: boolean;
}

const API = import.meta.env.DEV ? 'http://localhost:3000' : '';

const statusColor: Record<string, string> = {
  PUBLISHED: 'bg-green-500',
  SCHEDULED: 'bg-blue-500',
  DRAFT:     'bg-amber-400',
  FAILED:    'bg-red-500',
};

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function Calendar() {
  const { setDrawerOpen, isDarkMode } = useOutletContext<LayoutContext>();
  const { getToken } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<Date | null>(new Date());
  const [events, setEvents] = useState<Record<string, { title: string; status: string }[]>>({});

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const token = await getToken();
      const res = await axios.get(`${API}/api/posts`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const map: Record<string, { title: string; status: string }[]> = {};
      for (const post of res.data) {
        const date = post.scheduledFor || post.createdAt;
        if (!date) continue;
        const key = format(new Date(date), 'yyyy-MM-dd');
        if (!map[key]) map[key] = [];
        map[key].push({
          title: post.content ? post.content.slice(0, 60) + (post.content.length > 60 ? '...' : '') : 'Media/Link Post',
          status: post.status,
        });
      }
      setEvents(map);
    } catch {
      // silently fail — show empty calendar
    }
  };

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const startPad = monthStart.getDay();

  const selectedKey = selectedDay ? format(selectedDay, 'yyyy-MM-dd') : '';
  const selectedEvents = events[selectedKey] || [];

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in-up">
      <div className="flex justify-between items-end">
        <div>
          <h2 className={`text-3xl font-black tracking-tight mb-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`} style={{ fontFamily: 'Merriweather, serif', fontWeight: 900 }}>Post Calendar</h2>
          <p className={`font-medium ${isDarkMode ? 'text-slate-400' : ''}`} style={isDarkMode ? {} : { color: '#1d1d1f', fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", sans-serif', letterSpacing: '-0.01em' }}>Visualize your publishing schedule at a glance.</p>
        </div>
        <button
          onClick={() => setDrawerOpen(true)}
          className={`flex items-center gap-2 py-3 px-5 rounded-2xl font-black text-sm transition-all ${isDarkMode ? 'bg-white/10 text-white hover:bg-white/20 border border-white/20' : 'border border-slate-900 text-slate-900 hover:bg-slate-900 hover:text-white'}`}
        >
          <PenSquare className="w-5 h-5" />
          New Post
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar Grid */}
        <div className={`backdrop-blur-xl rounded-3xl border p-8 lg:col-span-2 ${isDarkMode ? 'bg-slate-900/80 border-slate-800 shadow-none' : 'bg-white/80 border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)]'}`}>
          <div className="flex items-center justify-between mb-8">
            <h3 className={`text-xl font-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`} style={{ fontFamily: 'Merriweather, serif', fontWeight: 900 }}>{format(currentDate, 'MMMM yyyy')}</h3>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentDate(subMonths(currentDate, 1))}
                className={`w-9 h-9 flex items-center justify-center rounded-xl transition-colors ${isDarkMode ? 'bg-slate-800 text-slate-400 hover:text-blue-400' : 'bg-slate-100 text-slate-600 hover:bg-blue-50 hover:text-blue-600'}`}
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() => setCurrentDate(new Date())}
                className={`px-3 h-9 rounded-xl text-sm font-bold transition-colors ${isDarkMode ? 'bg-slate-800 text-slate-400 hover:text-blue-400' : 'bg-slate-100 text-slate-600 hover:bg-blue-50 hover:text-blue-600'}`}
              >
                Today
              </button>
              <button
                onClick={() => setCurrentDate(addMonths(currentDate, 1))}
                className={`w-9 h-9 flex items-center justify-center rounded-xl transition-colors ${isDarkMode ? 'bg-slate-800 text-slate-400 hover:text-blue-400' : 'bg-slate-100 text-slate-600 hover:bg-blue-50 hover:text-blue-600'}`}
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 mb-2">
            {DAYS.map(d => (
              <div key={d} className={`text-center text-xs font-bold uppercase tracking-wider py-2 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>{d}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: startPad }).map((_, i) => <div key={`pad-${i}`} />)}
            {days.map((day) => {
              const key = format(day, 'yyyy-MM-dd');
              const dayEvents = events[key] || [];
              const isToday = isSameDay(day, new Date());
              const isSelected = selectedDay ? isSameDay(day, selectedDay) : false;

              return (
                <button
                  key={key}
                  onClick={() => setSelectedDay(day)}
                  className={`relative flex flex-col items-center rounded-2xl p-2 transition-all min-h-[60px]
                    ${isSelected ? 'bg-blue-600 text-white shadow-[0_8px_20px_rgba(37,99,235,0.35)]' :
                      isToday ? (isDarkMode ? 'bg-blue-600/20 text-blue-400' : 'bg-blue-50 text-blue-600') :
                      (isDarkMode ? 'text-slate-400 hover:bg-slate-800' : 'hover:bg-slate-50 text-slate-700')
                    }`}
                >
                  <span className={`text-sm font-bold mb-1 ${isSelected ? 'text-white' : ''}`}>{format(day, 'd')}</span>
                  <div className="flex flex-wrap justify-center gap-0.5">
                    {dayEvents.slice(0, 3).map((ev, i) => (
                      <span key={i} className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-white/70' : statusColor[ev.status]}`} />
                    ))}
                  </div>
                </button>
              );
            })}
          </div>

          <div className={`flex items-center gap-5 mt-6 pt-6 border-t ${isDarkMode ? 'border-slate-800' : 'border-slate-100'}`}>
            {[['PUBLISHED', 'Published'], ['SCHEDULED', 'Scheduled'], ['DRAFT', 'Draft']].map(([key, label]) => (
              <div key={key} className="flex items-center gap-1.5">
                <span className={`w-2.5 h-2.5 rounded-full ${statusColor[key]}`} />
                <span className={`text-xs font-semibold ${isDarkMode ? 'text-slate-500' : 'text-slate-500'}`}>{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Day Detail Panel */}
        <div className={`backdrop-blur-xl rounded-3xl border p-8 flex flex-col ${isDarkMode ? 'bg-slate-900/80 border-slate-800 shadow-none' : 'bg-white/80 border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)]'}`}>
          <h3 className={`text-lg font-black mb-1 ${isDarkMode ? 'text-white' : 'text-slate-900'}`} style={{ fontFamily: 'Merriweather, serif', fontWeight: 900 }}>
            {selectedDay ? format(selectedDay, 'EEEE, MMMM d') : 'Select a day'}
          </h3>
          <p className={`text-xs font-semibold mb-6 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
            {selectedEvents.length > 0 ? `${selectedEvents.length} post(s) on this day` : 'No posts on this day'}
          </p>

          <div className="flex-1 space-y-3">
            {selectedEvents.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-40 text-center">
                <CheckCircle2 className={`w-10 h-10 mb-3 ${isDarkMode ? 'text-slate-800' : 'text-slate-200'}`} />
                <p className={`text-sm font-semibold ${isDarkMode ? 'text-slate-600' : 'text-slate-400'}`}>Nothing here yet.</p>
                <button onClick={() => setDrawerOpen(true)} className="mt-3 text-sm font-bold text-blue-600 hover:underline">+ Create a post</button>
              </div>
            ) : (
              selectedEvents.map((ev, i) => {
                const StatusIcon = ev.status === 'PUBLISHED' ? CheckCircle2 : ev.status === 'SCHEDULED' ? Clock : AlertCircle;
                return (
                  <div key={i} className={`flex items-start gap-3 p-4 rounded-2xl border transition-colors ${isDarkMode ? 'bg-slate-800/40 border-slate-700/50 hover:bg-slate-800/60' : 'bg-slate-50 border-slate-100/50 hover:bg-slate-100'}`}>
                    <StatusIcon className={`w-5 h-5 mt-0.5 flex-shrink-0 ${ev.status === 'PUBLISHED' ? 'text-green-500' : ev.status === 'SCHEDULED' ? 'text-blue-500' : 'text-amber-500'}`} />
                    <div>
                      <p className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>{ev.title}</p>
                      <span className={`text-[10px] font-bold uppercase tracking-wider ${ev.status === 'PUBLISHED' ? 'text-green-600' : ev.status === 'SCHEDULED' ? 'text-blue-600' : 'text-amber-600'}`}>{ev.status}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
