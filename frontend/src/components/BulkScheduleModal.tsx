import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/clerk-react';
import axios from 'axios';
import { X, Layers, Calendar, Check, Send, Image, MessageSquare, Clock } from 'lucide-react';
import toast from '../utils/toast';
import { getActiveAccountId } from './AccountSwitcher';

const API = 'http://localhost:3000';

interface Page {
  id: string;
  name: string;
  pictureUrl?: string | null;
}

interface BulkItem {
  pageId: string;
  pageName: string;
  pictureUrl?: string | null;
  selected: boolean;
  scheduledFor: string;
  caption: string;
  comment: string;
}

interface Props {
  content: string;
  link?: string;
  imageUrl?: string;
  isDarkMode: boolean;
  onClose: () => void;
}

function PageAvatar({ pictureUrl, name, size = 9 }: { pictureUrl?: string | null; name: string; size?: number }) {
  const cls = `w-${size} h-${size} rounded-xl overflow-hidden flex-shrink-0 ring-1 ring-white/10`;
  return (
    <div className={cls}>
      {pictureUrl
        ? <img src={pictureUrl} alt={name} className="w-full h-full object-cover" />
        : <div className="w-full h-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-black text-sm">{name[0]}</div>
      }
    </div>
  );
}

export default function BulkScheduleModal({ content, link, imageUrl, isDarkMode, onClose }: Props) {
  const { getToken } = useAuth();
  const [items, setItems] = useState<BulkItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const getAuthHeaders = async () => {
    const devToken = localStorage.getItem('dev_bypass_token');
    if (devToken) return { Authorization: `Bearer ${devToken}` };
    return { Authorization: `Bearer ${await getToken()}` };
  };

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const headers = await getAuthHeaders();
        const accountId = getActiveAccountId();
        const params: Record<string, string> = {};
        if (accountId) params.accountId = accountId;
        const res = await axios.get(`${API}/api/facebook/pages`, { headers, params });
        const pages: Page[] = res.data;

        const pad = (n: number) => String(n).padStart(2, '0');
        const fmt = (d: Date) =>
          `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
        const base = new Date();
        base.setMinutes(base.getMinutes() + 30);

        setItems(pages.map((p, i) => {
          const t = new Date(base);
          t.setHours(t.getHours() + i);
          return { pageId: p.id, pageName: p.name, pictureUrl: p.pictureUrl, selected: false, scheduledFor: fmt(t), caption: content, comment: '' };
        }));
      } catch { toast.error('Failed to load pages'); }
      finally { setLoading(false); }
    })();
  }, []);

  const upd = (pageId: string, patch: Partial<BulkItem>) =>
    setItems(prev => prev.map(it => it.pageId === pageId ? { ...it, ...patch } : it));

  const toggleAll = () => {
    const all = items.every(i => i.selected);
    setItems(prev => prev.map(it => ({ ...it, selected: !all })));
  };

  const selected = items.filter(i => i.selected);

  const handleSubmit = async () => {
    if (!selected.length) { toast.error('Select at least one page'); return; }
    setSubmitting(true);
    try {
      const headers = await getAuthHeaders();
      await axios.post(`${API}/api/posts/bulk`, {
        items: selected.map(i => ({
          pageId: i.pageId,
          content: i.caption,
          link: link || undefined,
          imageUrl: imageUrl || undefined,
          comment: i.comment || undefined,
          scheduledFor: i.scheduledFor,
        })),
      }, { headers });
      toast.success(`Scheduled ${selected.length} post${selected.length !== 1 ? 's' : ''}!`);
      onClose();
    } catch { toast.error('Failed to bulk schedule'); }
    finally { setSubmitting(false); }
  };

  const dk = isDarkMode;
  const card = dk ? 'bg-white/[0.03] border-white/[0.08]' : 'bg-white border-slate-200';
  const cardSelected = dk ? 'bg-blue-500/[0.06] border-blue-500/25' : 'bg-blue-50 border-blue-200';
  const inputCls = dk
    ? 'bg-white/[0.06] border border-white/10 text-white placeholder-white/20 focus:border-blue-500/60'
    : 'bg-white border border-slate-200 text-slate-800 placeholder-slate-400 focus:border-blue-400';
  const commentCls = dk
    ? 'bg-white/[0.04] border border-white/[0.06] text-white placeholder-white/20 focus:border-violet-500/50'
    : 'bg-slate-50 border border-slate-100 text-slate-800 placeholder-slate-400 focus:border-violet-400';

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className={`fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 flex ${
        dk ? 'bg-[#0d0d16] border-white/10' : 'bg-white border-slate-200'
      } border rounded-2xl shadow-2xl overflow-hidden`}
        style={{ width: 900, maxHeight: '90vh' }}
      >

        {/* ── LEFT: page list ── */}
        <div className={`w-[300px] flex-shrink-0 flex flex-col border-r ${dk ? 'border-white/[0.06]' : 'border-slate-100'}`}>
          {/* header */}
          <div className={`flex items-center gap-2.5 px-5 py-4 border-b ${dk ? 'border-white/[0.06]' : 'border-slate-100'}`}>
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
              <Layers className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className={`text-sm font-black ${dk ? 'text-white' : 'text-slate-900'}`}>Bulk Schedule</p>
              <p className={`text-[10px] ${dk ? 'text-slate-500' : 'text-slate-400'}`}>{selected.length}/{items.length} pages selected</p>
            </div>
            <button onClick={onClose} className={`ml-auto w-7 h-7 rounded-lg flex items-center justify-center ${dk ? 'text-slate-500 hover:bg-white/10' : 'text-slate-400 hover:bg-slate-100'}`}>
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* select all */}
          {!loading && items.length > 0 && (
            <button onClick={toggleAll} className={`flex items-center gap-2.5 px-5 py-2.5 border-b text-xs font-bold transition-all ${dk ? 'border-white/[0.04] text-slate-500 hover:text-white hover:bg-white/5' : 'border-slate-50 text-slate-500 hover:text-slate-800 hover:bg-slate-50'}`}>
              <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${items.every(i=>i.selected) ? 'bg-blue-500 border-blue-500' : dk ? 'border-white/20' : 'border-slate-300'}`}>
                {items.every(i=>i.selected) && <Check className="w-2.5 h-2.5 text-white" />}
              </div>
              {items.every(i=>i.selected) ? 'Deselect All' : 'Select All Pages'}
            </button>
          )}

          {/* page list */}
          <div className="flex-1 overflow-y-auto py-2 px-3 space-y-1">
            {loading
              ? Array.from({length:4}).map((_,i) => (
                  <div key={i} className={`h-14 rounded-xl animate-pulse ${dk ? 'bg-white/[0.04]' : 'bg-slate-100'}`} />
                ))
              : items.map(item => (
                  <button
                    key={item.pageId}
                    onClick={() => upd(item.pageId, { selected: !item.selected })}
                    className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl border transition-all text-left ${
                      item.selected ? cardSelected : `${card} ${dk ? 'hover:bg-white/[0.05]' : 'hover:bg-slate-50'}`
                    }`}
                  >
                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                      item.selected ? 'bg-blue-500 border-blue-500' : dk ? 'border-white/20' : 'border-slate-300'
                    }`}>
                      {item.selected && <Check className="w-3 h-3 text-white" />}
                    </div>
                    <PageAvatar pictureUrl={item.pictureUrl} name={item.pageName} size={8} />
                    <p className={`text-xs font-bold truncate flex-1 ${dk ? 'text-white' : 'text-slate-800'}`}>{item.pageName}</p>
                  </button>
                ))
            }
          </div>

          {/* footer schedule all */}
          <div className={`px-4 py-4 border-t ${dk ? 'border-white/[0.06]' : 'border-slate-100'}`}>
            <button
              onClick={handleSubmit}
              disabled={submitting || !selected.length}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold bg-gradient-to-r from-violet-600 to-purple-600 text-white hover:from-violet-500 hover:to-purple-500 disabled:opacity-40 transition-all shadow-lg shadow-violet-500/20"
            >
              {submitting
                ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : <Send className="w-3.5 h-3.5" />
              }
              {submitting ? 'Scheduling…' : selected.length ? `Schedule ${selected.length} Post${selected.length!==1?'s':''}` : 'Select Pages'}
            </button>
          </div>
        </div>

        {/* ── RIGHT: per-page editor ── */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* post preview strip */}
          <div className={`flex items-start gap-3 px-5 py-4 border-b ${dk ? 'border-white/[0.06] bg-white/[0.02]' : 'border-slate-100 bg-slate-50/60'}`}>
            {imageUrl
              ? <img src={imageUrl} alt="" className="w-12 h-12 rounded-xl object-cover flex-shrink-0 border border-white/10" />
              : <div className={`w-12 h-12 rounded-xl flex-shrink-0 flex items-center justify-center ${dk ? 'bg-white/5' : 'bg-slate-200/60'}`}><Image className="w-5 h-5 opacity-30" /></div>
            }
            <div className="min-w-0 flex-1">
              <p className={`text-[9px] font-black uppercase tracking-widest mb-1 ${dk ? 'text-slate-600' : 'text-slate-400'}`}>Base Content</p>
              <p className={`text-xs line-clamp-2 leading-relaxed ${dk ? 'text-slate-400' : 'text-slate-600'}`}>{content || <span className="italic opacity-40">No caption</span>}</p>
            </div>
          </div>

          {/* scrollable page editors */}
          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
            {items.length === 0 && !loading && (
              <div className={`flex flex-col items-center justify-center h-full ${dk ? 'text-slate-600' : 'text-slate-400'}`}>
                <Calendar className="w-10 h-10 mb-3 opacity-30" />
                <p className="text-sm font-bold">No pages connected</p>
              </div>
            )}

            {items.map(item => (
              <div
                key={item.pageId}
                className={`rounded-2xl border overflow-hidden transition-all ${item.selected ? cardSelected : card} ${!item.selected ? 'opacity-50' : ''}`}
              >
                {/* page header */}
                <div className="flex items-center gap-3 px-4 py-3">
                  <button
                    onClick={() => upd(item.pageId, { selected: !item.selected })}
                    className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                      item.selected ? 'bg-blue-500 border-blue-500' : dk ? 'border-white/20' : 'border-slate-300'
                    }`}
                  >
                    {item.selected && <Check className="w-3 h-3 text-white" />}
                  </button>
                  <PageAvatar pictureUrl={item.pictureUrl} name={item.pageName} size={9} />
                  <p className={`text-sm font-black flex-1 ${dk ? 'text-white' : 'text-slate-900'}`}>{item.pageName}</p>
                  {/* datetime */}
                  <div className="flex items-center gap-1.5">
                    <Clock className={`w-3.5 h-3.5 flex-shrink-0 ${dk ? 'text-slate-500' : 'text-slate-400'}`} />
                    <input
                      type="datetime-local"
                      value={item.scheduledFor}
                      onChange={e => upd(item.pageId, { scheduledFor: e.target.value })}
                      disabled={!item.selected}
                      className={`text-xs font-semibold rounded-lg px-2 py-1.5 outline-none transition-all ${
                        item.selected ? inputCls : dk ? 'bg-transparent text-slate-700 cursor-not-allowed' : 'bg-transparent text-slate-400 cursor-not-allowed'
                      }`}
                    />
                  </div>
                </div>

                {/* caption */}
                <div className={`px-4 pb-1 border-t ${dk ? 'border-white/[0.05]' : 'border-slate-100'}`}>
                  <p className={`text-[9px] font-black uppercase tracking-widest mt-3 mb-1.5 ${dk ? 'text-slate-600' : 'text-slate-400'}`}>
                    Caption
                  </p>
                  <textarea
                    value={item.caption}
                    onChange={e => upd(item.pageId, { caption: e.target.value })}
                    rows={3}
                    disabled={!item.selected}
                    placeholder="Write a custom caption for this page…"
                    className={`w-full text-sm rounded-xl px-3 py-2.5 outline-none resize-none leading-relaxed transition-all ${
                      item.selected ? inputCls : dk ? 'bg-transparent text-slate-700 cursor-not-allowed' : 'bg-transparent text-slate-500 cursor-not-allowed'
                    }`}
                  />
                  <p className={`text-[10px] text-right mt-0.5 mb-2 ${dk ? 'text-slate-700' : 'text-slate-400'}`}>{item.caption.length} chars</p>
                </div>

                {/* comment */}
                <div className={`px-4 pb-4 border-t ${dk ? 'border-white/[0.05]' : 'border-slate-100'}`}>
                  <p className={`text-[9px] font-black uppercase tracking-widest mt-3 mb-1.5 flex items-center gap-1.5 ${dk ? 'text-slate-600' : 'text-slate-400'}`}>
                    <MessageSquare className="w-3 h-3" /> First Comment <span className="font-normal opacity-50 normal-case tracking-normal">(optional)</span>
                  </p>
                  <textarea
                    value={item.comment}
                    onChange={e => upd(item.pageId, { comment: e.target.value })}
                    rows={2}
                    disabled={!item.selected}
                    placeholder="Add hashtags, links or a first comment…"
                    className={`w-full text-sm rounded-xl px-3 py-2.5 outline-none resize-none leading-relaxed transition-all ${
                      item.selected ? commentCls : dk ? 'bg-transparent text-slate-700 cursor-not-allowed' : 'bg-transparent text-slate-500 cursor-not-allowed'
                    }`}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
