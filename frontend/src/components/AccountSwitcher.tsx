import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { Plus, X, ChevronDown, Check } from 'lucide-react';

import toast from '../utils/toast';

const API = import.meta.env.DEV ? 'http://localhost:3000' : '';

interface FBAccount {
  id: string;
  fbUserId: string;
  name: string;
  avatarUrl: string | null;
  _count?: { pages: number };
}

interface Props {
  isDarkMode: boolean;
  collapsed: boolean;
}

export const ACTIVE_ACCOUNT_KEY = 'activeAccountId';

export function getActiveAccountId(): string | null {
  return localStorage.getItem(ACTIVE_ACCOUNT_KEY);
}

export function switchAccount(accountId: string) {
  localStorage.setItem(ACTIVE_ACCOUNT_KEY, accountId);
  window.dispatchEvent(new CustomEvent('account-switch', { detail: { accountId } }));
}

export default function AccountSwitcher({ isDarkMode, collapsed }: Props) {
  const { getToken } = useAuth();
  const [accounts, setAccounts] = useState<FBAccount[]>([]);
  const [activeId, setActiveId] = useState<string | null>(getActiveAccountId());
  const [open, setOpen] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [tokenInput, setTokenInput] = useState('');
  const [connecting, setConnecting] = useState(false);

  useEffect(() => {
    fetchAccounts();
    // Handle redirect-based OAuth return
    const params = new URLSearchParams(window.location.search);
    if (params.get('fb_success') === '1') {
      toast.success('Facebook account connected!');
      window.history.replaceState({}, '', window.location.pathname);
      fetchAccounts();
    } else if (params.get('fb_error')) {
      const err = params.get('fb_error');
      toast.error(err === 'auth' ? 'Session expired. Please log in again.' : 'Facebook connection failed. Try again.');
      window.history.replaceState({}, '', window.location.pathname);
    }
    const handler = (e: Event) => {
      setActiveId((e as CustomEvent).detail.accountId);
    };
    window.addEventListener('account-switch', handler);
    return () => window.removeEventListener('account-switch', handler);
  }, []);

  const getAuthHeaders = async () => {
    const devToken = localStorage.getItem('dev_bypass_token');
    if (devToken) return { Authorization: `Bearer ${devToken}` };
    const token = await getToken();
    return { Authorization: `Bearer ${token}` };
  };

  const fetchAccounts = async () => {
    try {
      const headers = await getAuthHeaders();
      const res = await axios.get(`${API}/api/facebook/accounts`, { headers });
      setAccounts(res.data);
      // Auto-select first account if none active
      if (!getActiveAccountId() && res.data.length > 0) {
        switchAccount(res.data[0].id);
        setActiveId(res.data[0].id);
      }
    } catch {
      // silently fail
    }
  };

  const connectAccount = async () => {
    if (!tokenInput.trim()) { toast.error('Paste your Facebook access token'); return; }
    setConnecting(true);
    try {
      const headers = await getAuthHeaders();
      const res = await axios.post(`${API}/api/facebook/accounts`, {
        accessToken: tokenInput.trim(),
      }, { headers });

      toast.success(`Connected: ${res.data.account.name} (${res.data.pagesCount} pages)`);
      setTokenInput('');
      setShowAddModal(false);
      await fetchAccounts();

      // Auto-switch to newly connected account
      switchAccount(res.data.account.id);
    } catch (err: any) {
      const detail = err.response?.data?.detail;
      toast.error(detail ? `Facebook: ${detail}` : 'Failed to connect. Check your token.');
    } finally {
      setConnecting(false);
    }
  };

  const removeAccount = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const headers = await getAuthHeaders();
      await axios.delete(`${API}/api/facebook/accounts/${id}`, { headers });
      const updated = accounts.filter(a => a.id !== id);
      setAccounts(updated);
      if (activeId === id) {
        const next = updated[0]?.id || null;
        if (next) switchAccount(next);
        else {
          localStorage.removeItem(ACTIVE_ACCOUNT_KEY);
          setActiveId(null);
        }
      }
      toast.success('Account removed');
    } catch {
      toast.error('Failed to remove account');
    }
  };

  const activeAccount = accounts.find(a => a.id === activeId);

  if (collapsed) {
    return (
      <div className="px-2 pb-3">
        <div className="flex flex-col items-center gap-1.5">
          {accounts.map(acc => (
            <button
              key={acc.id}
              onClick={() => { switchAccount(acc.id); setActiveId(acc.id); }}
              title={acc.name}
              className={`w-8 h-8 rounded-xl overflow-hidden flex-shrink-0 transition-all ${
                acc.id === activeId
                  ? 'ring-2 ring-blue-500 shadow-lg shadow-blue-500/30'
                  : 'ring-1 ring-white/10 opacity-50 hover:opacity-100'
              }`}
            >
              {acc.avatarUrl
                ? <img src={acc.avatarUrl} alt={acc.name} className="w-full h-full object-cover" />
                : <div className="w-full h-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-[10px] font-black">{acc.name[0]}</div>
              }
            </button>
          ))}
          <button
            onClick={() => setShowAddModal(true)}
            title="Add Facebook Account"
            className={`w-8 h-8 rounded-xl flex items-center justify-center border-dashed border transition-all ${
              isDarkMode ? 'border-white/20 text-white/30 hover:border-blue-400/60 hover:text-blue-400' : 'border-slate-300 text-slate-300 hover:border-blue-400 hover:text-blue-500'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>
        {showAddModal && <AddAccountModal isDarkMode={isDarkMode} tokenInput={tokenInput} setTokenInput={setTokenInput} connecting={connecting} onConnect={connectAccount} onClose={() => setShowAddModal(false)} />}
      </div>
    );
  }

  return (
    <div className={`px-3 pb-3 border-b ${isDarkMode ? 'border-white/[0.06]' : 'border-slate-100'}`}>
      <p className={`text-[9px] font-black tracking-[0.2em] uppercase px-1 pb-1.5 pt-0.5 ${isDarkMode ? 'text-slate-600' : 'text-slate-400'}`}>Facebook Accounts</p>

      {/* Account selector trigger */}
      <div className="relative">
        <button
          onClick={() => setOpen(v => !v)}
          className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl transition-all ${
            isDarkMode ? 'bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06]' : 'bg-slate-50 hover:bg-slate-100 border border-slate-100'
          }`}
        >
          {activeAccount ? (
            <>
              <div className="w-7 h-7 rounded-lg overflow-hidden flex-shrink-0 ring-1 ring-blue-500/40">
                {activeAccount.avatarUrl
                  ? <img src={activeAccount.avatarUrl} alt={activeAccount.name} className="w-full h-full object-cover" />
                  : <div className="w-full h-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-[10px] font-black">{activeAccount.name[0]}</div>
                }
              </div>
              <div className="flex-1 min-w-0 text-left">
                <p className={`text-xs font-bold truncate ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>{activeAccount.name}</p>
                <p className={`text-[10px] ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>{activeAccount._count?.pages ?? 0} pages</p>
              </div>
            </>
          ) : (
            <span className={`text-xs font-semibold flex-1 text-left ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>No account selected</span>
          )}
          <ChevronDown className={`w-3.5 h-3.5 flex-shrink-0 transition-transform ${open ? 'rotate-180' : ''} ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`} />
        </button>

        {open && (
          <div className={`absolute top-full left-0 right-0 mt-1.5 z-30 rounded-xl border shadow-2xl overflow-hidden ${isDarkMode ? 'bg-[#0f0f1a] border-white/10' : 'bg-white border-slate-100 shadow-slate-200/80'}`}>
            {accounts.map(acc => (
              <div
                key={acc.id}
                onClick={() => { switchAccount(acc.id); setActiveId(acc.id); setOpen(false); }}
                className={`flex items-center gap-2.5 px-3 py-2.5 cursor-pointer transition-colors group ${isDarkMode ? 'hover:bg-white/[0.05]' : 'hover:bg-slate-50'}`}
              >
                <div className="w-7 h-7 rounded-lg overflow-hidden flex-shrink-0">
                  {acc.avatarUrl
                    ? <img src={acc.avatarUrl} alt={acc.name} className="w-full h-full object-cover" />
                    : <div className="w-full h-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-[10px] font-black">{acc.name[0]}</div>
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-xs font-bold truncate ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>{acc.name}</p>
                  <p className={`text-[10px] ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>{acc._count?.pages ?? 0} pages</p>
                </div>
                {acc.id === activeId && <Check className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />}
                <button
                  onClick={e => removeAccount(acc.id, e)}
                  className={`w-5 h-5 rounded-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all ml-auto ${isDarkMode ? 'hover:bg-red-500/20 text-slate-500 hover:text-red-400' : 'hover:bg-red-50 text-slate-300 hover:text-red-400'}`}
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}

            <div className={`p-2 border-t ${isDarkMode ? 'border-white/[0.06]' : 'border-slate-50'}`}>
              <button
                onClick={() => { setOpen(false); setShowAddModal(true); }}
                className={`w-full flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold transition-colors ${isDarkMode ? 'text-blue-400 hover:bg-blue-500/10' : 'text-blue-600 hover:bg-blue-50'}`}
              >
                <Plus className="w-3.5 h-3.5" />
                Add Facebook Account
              </button>
            </div>
          </div>
        )}
      </div>

      {showAddModal && (
        <AddAccountModal
          isDarkMode={isDarkMode}
          tokenInput={tokenInput}
          setTokenInput={setTokenInput}
          connecting={connecting}
          onConnect={connectAccount}
          onClose={() => setShowAddModal(false)}
        />
      )}
    </div>
  );
}

function AddAccountModal({ isDarkMode, tokenInput, setTokenInput, connecting, onConnect, onClose }: {
  isDarkMode: boolean;
  tokenInput: string;
  setTokenInput: (v: string) => void;
  connecting: boolean;
  onConnect: () => void;
  onClose: () => void;
}) {
  const [showManual, setShowManual] = useState(false);

  const loginWithFacebook = () => {
    const authToken = localStorage.getItem('auth_token') || localStorage.getItem('dev_bypass_token') || '';
    if (!authToken) { toast.error('Please log in first'); return; }
    const state = btoa(JSON.stringify({ token: authToken }));
    window.location.href = `${API}/api/facebook/oauth/start?state=${encodeURIComponent(state)}`;
  };

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className={`fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[400px] rounded-2xl border shadow-2xl p-6 ${isDarkMode ? 'bg-[#0f0f1a] border-white/10' : 'bg-white border-slate-100'}`}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className={`text-base font-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Connect Facebook Account</h3>
            <p className={`text-xs mt-0.5 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Add your Facebook account to manage pages</p>
          </div>
          <button onClick={onClose} className={`w-7 h-7 rounded-lg flex items-center justify-center ${isDarkMode ? 'text-slate-500 hover:bg-white/10' : 'text-slate-400 hover:bg-slate-100'}`}>
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Facebook Login Button — full-page redirect OAuth */}
        <button
          onClick={loginWithFacebook}
          className="w-full flex items-center justify-center gap-3 py-3 rounded-xl font-bold text-sm text-white transition-all mb-4 hover:brightness-110 active:scale-95"
          style={{ background: '#1877F2' }}
        >
          <svg className="w-5 h-5" fill="white" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
          Login with Facebook
        </button>

        {/* Manual token toggle */}
        <div className="flex items-center gap-3 mb-3">
          <div className={`flex-1 h-px ${isDarkMode ? 'bg-white/10' : 'bg-slate-200'}`} />
          <button
            onClick={() => setShowManual(v => !v)}
            className={`text-[11px] font-semibold ${isDarkMode ? 'text-slate-600 hover:text-slate-400' : 'text-slate-400 hover:text-slate-600'}`}
          >
            {showManual ? 'Hide manual option' : 'Enter token manually'}
          </button>
          <div className={`flex-1 h-px ${isDarkMode ? 'bg-white/10' : 'bg-slate-200'}`} />
        </div>

        {showManual && (
          <>
            <div className={`rounded-xl border p-3 mb-3 ${isDarkMode ? 'bg-white/[0.04] border-white/10' : 'bg-slate-50 border-slate-100'}`}>
              <p className={`text-[10px] font-black uppercase tracking-widest mb-1.5 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Access Token</p>
              <textarea
                value={tokenInput}
                onChange={e => setTokenInput(e.target.value)}
                placeholder="EAABwzLixnjYBO..."
                rows={3}
                className={`w-full text-xs font-mono bg-transparent outline-none resize-none ${isDarkMode ? 'text-white placeholder-white/20' : 'text-slate-800 placeholder-slate-300'}`}
              />
            </div>
            <button
              onClick={onConnect}
              disabled={connecting || !tokenInput.trim()}
              className="w-full py-2.5 rounded-xl text-sm font-bold bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-500 hover:to-indigo-500 transition-all disabled:opacity-50 flex items-center justify-center gap-2 mb-3"
            >
              {connecting ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Connecting...</> : 'Connect with Token'}
            </button>
          </>
        )}
      </div>
    </>
  );
}
