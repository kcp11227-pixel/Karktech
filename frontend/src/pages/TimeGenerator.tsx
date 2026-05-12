import { useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { Calendar, ArrowLeft, Save, Plus } from 'lucide-react';
import { COUNTRY_TIMEZONES } from '../constants/countries';
import toast from '../utils/toast';
import { format, addDays, setHours, setMinutes, addMinutes } from 'date-fns';
import BrandLoader from '../components/BrandLoader';

export default function TimeGenerator() {
  const navigate = useNavigate();
  const { isDarkMode } = useOutletContext<{isDarkMode: boolean}>();
  const [days, setDays] = useState(7);
  const [postsPerDay, setPostsPerDay] = useState(3);
  const [selectedCountry, setSelectedCountry] = useState('np');
  const [generatedSlots, setGeneratedSlots] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const generateTimings = () => {
    setIsLoading(true);
    const country = COUNTRY_TIMEZONES[selectedCountry];
    if (!country) return;

    const slots: string[] = [];
    const now = new Date();

    for (let d = 1; d <= days; d++) {
      const currentDay = addDays(now, d);
      for (let p = 0; p < postsPerDay; p++) {
        // Random time between 8 AM and 10 PM
        const hour = Math.floor(Math.random() * (22 - 8 + 1)) + 8;
        const minute = Math.floor(Math.random() * 60);
        
        let slotDate = setHours(currentDay, hour);
        slotDate = setMinutes(slotDate, minute);
        
        // Add some minute variation for same day posts
        if (p > 0) {
          slotDate = addMinutes(slotDate, p * 5 + Math.floor(Math.random() * 10));
        }

        slots.push(slotDate.toISOString());
      }
    }
    
    setGeneratedSlots(slots);
    setIsLoading(false);
    toast.success(`Generated ${slots.length} post slots!`);
  };

  const saveToCalendar = () => {
    localStorage.setItem('my_calendar_slots', JSON.stringify(generatedSlots));
    localStorage.removeItem('used_calendar_slots'); // Reset usage when new schedule is saved
    toast.success('Schedule saved to My Calendar!');
    navigate('/my-posts');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in relative">
      {isLoading && (
        <div className={`fixed inset-0 backdrop-blur-md z-[100] flex items-center justify-center ${isDarkMode ? 'bg-black/80' : 'bg-white/80'}`}>
          <BrandLoader size="lg" />
        </div>
      )}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate(-1)}
          className={`p-3 border rounded-2xl transition-all shadow-sm ${isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-400 hover:text-blue-400' : 'bg-white border-slate-200 text-slate-600 hover:border-slate-400 hover:text-slate-900'}`}
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h2 className={`text-3xl font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`} style={{ fontFamily: 'Merriweather, serif', fontWeight: 900 }}>Intelligence</h2>
          <p className={`font-medium ${isDarkMode ? 'text-slate-400' : ''}`} style={isDarkMode ? {} : { color: '#1d1d1f', fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", sans-serif', letterSpacing: '-0.01em' }}>Create a smart posting schedule based on target geography.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Controls */}
        <div className="md:col-span-1 space-y-6">
          <div className={`backdrop-blur-xl border p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] space-y-6 ${isDarkMode ? 'bg-slate-900/80 border-slate-800' : 'bg-white/80 border-white'}`}>
            <div>
              <label className={`block text-xs font-bold uppercase tracking-widest mb-3 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Duration (Days)</label>
              <input 
                type="number" 
                value={days} 
                onChange={e => setDays(parseInt(e.target.value))}
                className={`w-full border-none rounded-xl px-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500/20 transition-all ${isDarkMode ? 'bg-slate-800 text-white' : 'bg-slate-50 text-slate-800'}`}
              />
            </div>
            <div>
              <label className={`block text-xs font-bold uppercase tracking-widest mb-3 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Posts Per Day</label>
              <input 
                type="number" 
                value={postsPerDay} 
                onChange={e => setPostsPerDay(parseInt(e.target.value))}
                className={`w-full border-none rounded-xl px-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500/20 transition-all ${isDarkMode ? 'bg-slate-800 text-white' : 'bg-slate-50 text-slate-800'}`}
              />
            </div>
            <div>
              <label className={`block text-xs font-bold uppercase tracking-widest mb-3 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Target Country</label>
              <select 
                value={selectedCountry}
                onChange={e => setSelectedCountry(e.target.value)}
                className={`w-full border-none rounded-xl px-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500/20 transition-all appearance-none cursor-pointer ${isDarkMode ? 'bg-slate-800 text-white' : 'bg-slate-50 text-slate-800'}`}
              >
                {Object.entries(COUNTRY_TIMEZONES).map(([code, country]) => (
                  <option key={code} value={code}>{country.flag} {country.label}</option>
                ))}
              </select>
            </div>
            <button
              onClick={generateTimings}
              className={`w-full font-bold py-4 rounded-2xl transition-all transform hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-2 ${isDarkMode ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-[0_8px_20px_rgba(37,99,235,0.3)]' : 'border border-slate-900 text-slate-900 hover:bg-slate-900 hover:text-white'}`}
            >
              <Plus className="w-5 h-5" />
              Generate Schedule
            </button>
          </div>
        </div>

        {/* Results */}
        <div className="md:col-span-2">
          <div className={`backdrop-blur-xl border p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] min-h-[500px] flex flex-col ${isDarkMode ? 'bg-slate-900/80 border-slate-800' : 'bg-white/80 border-white'}`}>
            <div className="flex justify-between items-center mb-8">
              <h3 className={`text-xl font-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`} style={{ fontFamily: 'Merriweather, serif', fontWeight: 900 }}>Generated Slots</h3>
              {generatedSlots.length > 0 && (
                <button
                  onClick={saveToCalendar}
                  className={`font-bold py-2.5 px-6 rounded-xl transition-all flex items-center gap-2 ${isDarkMode ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/20' : 'border border-slate-900 text-slate-900 hover:bg-slate-900 hover:text-white'}`}
                >
                  <Save className="w-4 h-4" />
                  Save to Calendar
                </button>
              )}
            </div>

            {generatedSlots.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-10 opacity-50">
                <Calendar className={`w-16 h-16 mb-4 ${isDarkMode ? 'text-slate-700' : 'text-slate-300'}`} />
                <p className={`font-bold uppercase tracking-widest text-xs ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>No slots generated yet</p>
                <p className={`text-sm mt-2 max-w-[200px] ${isDarkMode ? 'text-slate-700' : 'text-slate-300'}`}>Adjust settings and click generate to see the magic.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 overflow-y-auto max-h-[600px] pr-2 custom-scrollbar">
                {generatedSlots.map((slot, i) => (
                  <div key={i} className={`flex items-center gap-3 p-4 border rounded-2xl group transition-all ${isDarkMode ? 'bg-slate-800/50 border-slate-800 hover:border-blue-500/30' : 'bg-slate-50 border-slate-100 hover:border-blue-500/30'}`}>
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs ${isDarkMode ? 'bg-blue-900/20 text-blue-400' : 'bg-blue-50 text-blue-600'}`}>
                      {i + 1}
                    </div>
                    <div>
                      <p className={`text-[10px] font-bold uppercase tracking-wider ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>{format(new Date(slot), 'EEEE')}</p>
                      <p className={`text-sm font-extrabold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>{format(new Date(slot), 'MMM d, h:mm a')}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
