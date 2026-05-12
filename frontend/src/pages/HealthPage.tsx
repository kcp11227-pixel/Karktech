import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { 
  Activity, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  RefreshCw, 
  Server, 
  Database, 
  Globe, 
  Cpu, 
  HardDrive, 
  Zap,
  ArrowUpRight,
  Clock
} from 'lucide-react';
import toast from '../utils/toast';

interface HealthStatus {
  name: string;
  status: 'UP' | 'DOWN' | 'DEGRADED';
  latency: string;
  lastChecked: string;
  details: string;
  icon: any;
}

interface LayoutContext {
  isDarkMode: boolean;
}

export default function HealthPage() {
  const { isDarkMode } = useOutletContext<LayoutContext>();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [healthItems, setHealthItems] = useState<HealthStatus[]>([
    { name: 'Core API Server', status: 'UP', latency: '24ms', lastChecked: 'Just now', details: 'All systems operational', icon: Server },
    { name: 'PostgreSQL Database', status: 'UP', latency: '12ms', lastChecked: 'Just now', details: 'Connection pool stable', icon: Database },
    { name: 'Redis Cache (BullMQ)', status: 'UP', latency: '2ms', lastChecked: 'Just now', details: 'Job queue running smoothly', icon: Zap },
    { name: 'Facebook Graph API', status: 'DEGRADED', latency: '450ms', lastChecked: '2 mins ago', details: 'Minor latency detected in Meta edge nodes', icon: Globe },
    { name: 'Asset Storage (S3)', status: 'UP', latency: '85ms', lastChecked: 'Just now', details: 'Bucket permissions verified', icon: HardDrive },
    { name: 'Worker Service', status: 'UP', latency: 'N/A', lastChecked: 'Just now', details: 'Active threads: 8', icon: Cpu },
  ]);

  const refreshHealth = () => {
    setIsRefreshing(true);
    toast.loading('Scanning platform systems...', { id: 'health-check' });
    
    setTimeout(() => {
      setIsRefreshing(false);
      toast.success('Health scan complete!', { id: 'health-check' });
      // Randomize slightly for demo
      setHealthItems(prev => prev.map(item => ({
        ...item,
        latency: `${Math.floor(Math.random() * 50) + 10}ms`,
        lastChecked: 'Just now'
      })));
    }, 2000);
  };

  return (
    <div className="space-y-8 animate-fade-in-up">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className={`text-3xl font-extrabold tracking-tight mb-2 ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>Platform Health</h2>
          <p className={`font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Real-time monitoring of KarkTech systems and infrastructure.</p>
        </div>
        
        <button 
          onClick={refreshHealth}
          disabled={isRefreshing}
          className={`flex items-center gap-2 px-6 py-3.5 rounded-2xl font-bold text-sm transition-all transform active:scale-95 shadow-lg ${
            isDarkMode 
              ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-900/20' 
              : 'bg-[#111827] hover:bg-slate-800 text-white shadow-slate-200'
          }`}
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          Run System Scan
        </button>
      </div>

      {/* Main Status Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {healthItems.map((item, idx) => {
          const Icon = item.icon;
          const isUp = item.status === 'UP';
          const isDegraded = item.status === 'DEGRADED';
          
          return (
            <div 
              key={idx} 
              className={`p-6 rounded-3xl border transition-all hover:translate-y-[-4px] ${
                isDarkMode 
                  ? 'bg-slate-900/40 border-slate-800 hover:border-blue-500/30' 
                  : 'bg-white border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)] hover:shadow-xl'
              }`}
            >
              <div className="flex items-start justify-between mb-6">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                  isUp ? (isDarkMode ? 'bg-green-500/10 text-green-400' : 'bg-green-50 text-green-600') :
                  isDegraded ? (isDarkMode ? 'bg-amber-500/10 text-amber-400' : 'bg-amber-50 text-amber-600') :
                  (isDarkMode ? 'bg-red-500/10 text-red-400' : 'bg-red-50 text-red-600')
                }`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div className="flex flex-col items-end">
                  <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-md ${
                    isUp ? (isDarkMode ? 'bg-green-500/20 text-green-400' : 'bg-green-100 text-green-700') :
                    isDegraded ? (isDarkMode ? 'bg-amber-500/20 text-amber-400' : 'bg-amber-100 text-amber-700') :
                    (isDarkMode ? 'bg-red-500/20 text-red-400' : 'bg-red-100 text-red-700')
                  }`}>
                    {item.status}
                  </span>
                  <span className="text-[10px] font-bold text-slate-500 mt-1 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {item.lastChecked}
                  </span>
                </div>
              </div>

              <h3 className={`text-lg font-bold mb-1 ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>{item.name}</h3>
              <p className={`text-sm font-medium mb-4 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>{item.details}</p>
              
              <div className={`flex items-center justify-between pt-4 border-t ${isDarkMode ? 'border-slate-800' : 'border-slate-50'}`}>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${isUp ? 'bg-green-500 animate-pulse' : isDegraded ? 'bg-amber-500' : 'bg-red-500'}`} />
                  <span className="text-xs font-bold text-slate-500">Latency: {item.latency}</span>
                </div>
                <ArrowUpRight className="w-4 h-4 text-slate-300" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Advanced Metrics Section */}
      <div className={`p-8 rounded-[2.5rem] border backdrop-blur-xl ${
        isDarkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-white shadow-[0_20px_50px_rgba(0,0,0,0.04)]'
      }`}>
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center text-white">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <h3 className={`text-xl font-extrabold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Live Traffic & Load</h3>
            <p className="text-xs font-semibold text-slate-500">Current system performance metrics</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <div className="space-y-6">
            <div>
              <div className="flex justify-between mb-2">
                <span className={`text-sm font-bold ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>CPU Usage</span>
                <span className="text-sm font-black text-blue-500">32%</span>
              </div>
              <div className={`h-3 w-full rounded-full overflow-hidden ${isDarkMode ? 'bg-slate-800' : 'bg-slate-100'}`}>
                <div className="h-full bg-blue-500 rounded-full transition-all duration-1000" style={{ width: '32%' }} />
              </div>
            </div>
            
            <div>
              <div className="flex justify-between mb-2">
                <span className={`text-sm font-bold ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Memory Allocation</span>
                <span className="text-sm font-black text-purple-500">58%</span>
              </div>
              <div className={`h-3 w-full rounded-full overflow-hidden ${isDarkMode ? 'bg-slate-800' : 'bg-slate-100'}`}>
                <div className="h-full bg-purple-500 rounded-full transition-all duration-1000" style={{ width: '58%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <span className={`text-sm font-bold ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Database Connections</span>
                <span className="text-sm font-black text-green-500">14 / 50</span>
              </div>
              <div className={`h-3 w-full rounded-full overflow-hidden ${isDarkMode ? 'bg-slate-800' : 'bg-slate-100'}`}>
                <div className="h-full bg-green-500 rounded-full transition-all duration-1000" style={{ width: '28%' }} />
              </div>
            </div>
          </div>

          <div className={`p-6 rounded-3xl flex flex-col justify-center items-center text-center ${isDarkMode ? 'bg-slate-800/50' : 'bg-slate-50'}`}>
            <CheckCircle2 className="w-12 h-12 text-green-500 mb-4" />
            <h4 className={`text-lg font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>System Architecture: Robust</h4>
            <p className="text-xs font-medium text-slate-500 max-w-xs">
              Load balancer is distributing traffic evenly across 3 active clusters. No immediate action required.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
