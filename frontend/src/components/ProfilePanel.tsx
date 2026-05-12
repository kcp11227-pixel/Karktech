import { useState, useEffect } from 'react';
import { X, Check, Pencil, Globe } from 'lucide-react';
import axios from 'axios';
import toast from '../utils/toast';

const AVATARS = [
  '/avatar1.png.png',
  '/avatar2.png.png',
  '/avatar3.png.png',
];

const API = 'http://localhost:3000';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  isDarkMode: boolean;
  onAvatarChange?: (src: string) => void;
}

export default function ProfilePanel({ isOpen, onClose, isDarkMode, onAvatarChange }: Props) {
  const userString = localStorage.getItem('user');
  const user = userString ? JSON.parse(userString) : null;

  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(user?.name || '');
  const [selectedAvatar, setSelectedAvatar] = useState<string>(
    localStorage.getItem('user_avatar') || ''
  );
  const [fbAccounts, setFbAccounts] = useState<{ id: string; name: string; avatarUrl: string | null; _count?: { pages: number } }[]>([]);

  useEffect(() => {
    if (!isOpen) return;
    const devToken = localStorage.getItem('dev_bypass_token');
    const headers: Record<string, string> = devToken ? { Authorization: `Bearer ${devToken}` } : {};
    axios.get(`${API}/api/facebook/accounts`, { headers })
      .then(res => setFbAccounts(res.data))
      .catch(() => {});
  }, [isOpen]);

  const initials = nameInput.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase() || 'U';

  const saveName = () => {
    if (!nameInput.trim()) return;
    const updated = { ...user, name: nameInput.trim() };
    localStorage.setItem('user', JSON.stringify(updated));
    setEditingName(false);
    toast.success('Name updated!');
    setTimeout(() => window.location.reload(), 1200);
  };

  const selectAvatar = (src: string) => {
    setSelectedAvatar(src);
    localStorage.setItem('user_avatar', src);
    onAvatarChange?.(src);
    toast.success('Avatar updated!');
  };

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      )}

      <div className={`fixed left-0 top-0 h-full w-80 z-50 flex flex-col transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        ${isDarkMode ? 'bg-[#0f0f1a] border-r border-white/[0.07]' : 'bg-white border-r border-slate-200 shadow-2xl'}`}
      >
        {/* Header */}
        <div className={`flex items-center justify-between px-6 py-5 border-b ${isDarkMode ? 'border-white/[0.06]' : 'border-slate-100'}`}>
          <p className={`text-sm font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>My Profile</p>
          <button
            onClick={onClose}
            className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${isDarkMode ? 'text-slate-500 hover:text-white hover:bg-white/10' : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'}`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-5">

          {/* Current Avatar */}
          <div className="flex flex-col items-center gap-1">
            <div className="relative">
              {selectedAvatar ? (
                <img
                  src={selectedAvatar}
                  alt="avatar"
                  className="w-20 h-20 rounded-2xl object-cover shadow-xl ring-2 ring-blue-500/40"
                />
              ) : (
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center shadow-xl shadow-blue-500/30">
                  <span className="text-2xl font-black text-white">{initials}</span>
                </div>
              )}
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full ring-2 ring-[#0f0f1a]" />
            </div>
          </div>

          {/* Avatar Picker */}
          <div className={`rounded-2xl p-4 ${isDarkMode ? 'bg-white/[0.04] border border-white/[0.06]' : 'bg-slate-50 border border-slate-100'}`}>
            <p className={`text-[10px] font-black uppercase tracking-widest mb-3 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Choose Avatar</p>
            <div className="flex items-center gap-3 justify-center">
              {AVATARS.map((src) => (
                <button
                  key={src}
                  onClick={() => selectAvatar(src)}
                  className={`relative rounded-xl overflow-hidden transition-all duration-200 flex-shrink-0
                    ${selectedAvatar === src
                      ? 'ring-2 ring-blue-500 scale-105 shadow-lg shadow-blue-500/30'
                      : isDarkMode ? 'ring-1 ring-white/10 hover:ring-white/30 opacity-60 hover:opacity-100' : 'ring-1 ring-slate-200 hover:ring-blue-300 opacity-70 hover:opacity-100'
                    }`}
                >
                  <img src={src} alt="avatar option" className="w-16 h-16 object-cover" />
                  {selectedAvatar === src && (
                    <div className="absolute inset-0 bg-blue-500/20 flex items-center justify-center">
                      <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center">
                        <Check className="w-3 h-3 text-white" />
                      </div>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Display Name */}
          <div className={`rounded-2xl p-4 ${isDarkMode ? 'bg-white/[0.04] border border-white/[0.06]' : 'bg-slate-50 border border-slate-100'}`}>
            <p className={`text-[10px] font-black uppercase tracking-widest mb-3 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Display Name</p>
            {editingName ? (
              <div className="flex items-center gap-2">
                <input
                  autoFocus
                  value={nameInput}
                  onChange={e => setNameInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && saveName()}
                  className={`flex-1 text-sm font-bold rounded-xl px-3 py-2 outline-none border transition-all ${isDarkMode ? 'bg-white/10 text-white border-blue-500/40 focus:border-blue-400' : 'bg-white text-slate-900 border-blue-300 focus:border-blue-500'}`}
                />
                <button onClick={saveName} className="w-8 h-8 rounded-xl bg-blue-600 hover:bg-blue-500 flex items-center justify-center flex-shrink-0 transition-all">
                  <Check className="w-4 h-4 text-white" />
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <p className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{nameInput || 'User'}</p>
                <button
                  onClick={() => setEditingName(true)}
                  className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${isDarkMode ? 'text-slate-500 hover:text-blue-400 hover:bg-blue-500/10' : 'text-slate-400 hover:text-blue-600 hover:bg-blue-50'}`}
                >
                  <Pencil className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          {/* Email */}
          <div className={`rounded-2xl p-4 ${isDarkMode ? 'bg-white/[0.04] border border-white/[0.06]' : 'bg-slate-50 border border-slate-100'}`}>
            <p className={`text-[10px] font-black uppercase tracking-widest mb-2 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Email</p>
            <p className={`text-sm font-semibold ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>{user?.email || '—'}</p>
          </div>

          {/* Role */}
          <div className={`rounded-2xl p-4 ${isDarkMode ? 'bg-white/[0.04] border border-white/[0.06]' : 'bg-slate-50 border border-slate-100'}`}>
            <p className={`text-[10px] font-black uppercase tracking-widest mb-2 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Role</p>
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider ${user?.role === 'ADMIN' ? 'bg-amber-500/15 text-amber-400' : 'bg-blue-500/15 text-blue-400'}`}>
              {user?.role === 'ADMIN' ? 'Platform Owner' : 'Standard User'}
            </span>
          </div>

          {/* Facebook Accounts */}
          <div className={`rounded-2xl p-4 ${isDarkMode ? 'bg-white/[0.04] border border-white/[0.06]' : 'bg-slate-50 border border-slate-100'}`}>
            <p className={`text-[10px] font-black uppercase tracking-widest mb-3 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Facebook Accounts</p>
            <div className="space-y-2">
              {fbAccounts.length === 0
                ? <p className={`text-xs ${isDarkMode ? 'text-slate-600' : 'text-slate-400'}`}>No accounts connected</p>
                : fbAccounts.map(acc => (
                  <div key={acc.id} className={`flex items-center gap-3 p-3 rounded-xl ${isDarkMode ? 'bg-white/[0.04]' : 'bg-white border border-slate-100'}`}>
                    <div className="w-8 h-8 rounded-lg overflow-hidden flex-shrink-0">
                      {acc.avatarUrl
                        ? <img src={acc.avatarUrl} alt={acc.name} className="w-full h-full object-cover" />
                        : <div className="w-full h-full bg-[#1877F2] flex items-center justify-center"><Globe className="w-4 h-4 text-white" /></div>
                      }
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <p className={`text-xs font-bold truncate ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{acc.name}</p>
                      <p className={`text-[10px] font-semibold ${isDarkMode ? 'text-slate-600' : 'text-slate-400'}`}>{acc._count?.pages ?? 0} pages</p>
                    </div>
                    <span className="w-2 h-2 rounded-full bg-green-400 flex-shrink-0" />
                  </div>
                ))
              }
            </div>
          </div>

        </div>
      </div>
    </>
  );
}
