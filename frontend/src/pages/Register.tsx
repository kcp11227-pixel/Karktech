import { useState } from 'react';
import { Link } from 'react-router-dom';
import toast from '../utils/toast';
import { Mail, Lock, User, ArrowRight } from 'lucide-react';
import BrandLoader from '../components/BrandLoader';
import { useAuth } from '../context/AuthContext';

const API = import.meta.env.DEV ? 'http://localhost:3000' : '';

export default function Register() {
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleRegister = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await fetch(`${API}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Registration failed');
      login(data.token, data.user);
      window.location.href = '/';
    } catch (err: any) {
      toast.error(err.message || 'Registration failed');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#FAF9F6' }}>

      {isLoading && (
        <div className="fixed inset-0 backdrop-blur-md z-[100] flex items-center justify-center bg-white/80">
          <BrandLoader size="lg" />
        </div>
      )}

      {/* Nav */}
      <div className="flex items-center justify-between px-8 py-5">
        <Link to="/landing" className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md overflow-hidden">
            <img src="/karklogo.png.png" alt="KarkTech" className="w-full h-full object-contain" />
          </div>
          <span className="text-base font-black tracking-tight bg-gradient-to-r from-blue-500 via-violet-500 to-cyan-500 bg-clip-text text-transparent">
            KarkTech
          </span>
        </Link>
        <Link to="/login" className="text-[13px] font-black text-slate-900 hover:text-black transition-colors">
          Log in
        </Link>
      </div>

      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-[900px] flex rounded-3xl overflow-hidden bg-white border border-slate-100 shadow-[0_8px_40px_rgba(0,0,0,0.07)]">

          {/* Left — Form */}
          <div className="w-full lg:w-1/2 p-10 flex flex-col justify-between">
            <div className="flex-1 flex flex-col justify-center max-w-sm mx-auto w-full">

              <p className="text-[10px] font-black tracking-widest uppercase mb-2 text-slate-400"
                style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif' }}>
                Join us today
              </p>
              <h2 className="text-3xl font-black leading-tight mb-2 text-slate-900"
                style={{ fontFamily: 'Merriweather, serif', fontWeight: 900 }}>
                Create your account.
              </h2>
              <p className="text-sm font-medium mb-8 text-slate-500"
                style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", sans-serif', letterSpacing: '-0.01em' }}>
                Already a member?{' '}
                <Link to="/login" className="font-black text-slate-900 hover:text-black underline underline-offset-2">Log in here</Link>
              </p>

              <form onSubmit={handleRegister} className="space-y-3">
                <div className="rounded-2xl px-4 pt-2.5 pb-2 bg-slate-50 border border-slate-100 focus-within:border-slate-300 focus-within:bg-white transition-all">
                  <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-0.5">Full Name</label>
                  <div className="flex items-center gap-2">
                    <input type="text" required
                      className="w-full bg-transparent outline-none text-sm font-bold text-slate-900 placeholder:text-slate-300"
                      value={name} onChange={e => setName(e.target.value)} />
                    <User className="w-4 h-4 text-slate-300 flex-shrink-0" />
                  </div>
                </div>
                <div className="rounded-2xl px-4 pt-2.5 pb-2 bg-slate-50 border border-slate-100 focus-within:border-slate-300 focus-within:bg-white transition-all">
                  <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-0.5">Email</label>
                  <div className="flex items-center gap-2">
                    <input type="email" required
                      className="w-full bg-transparent outline-none text-sm font-bold text-slate-900 placeholder:text-slate-300"
                      value={email} onChange={e => setEmail(e.target.value)} />
                    <Mail className="w-4 h-4 text-slate-300 flex-shrink-0" />
                  </div>
                </div>
                <div className="rounded-2xl px-4 pt-2.5 pb-2 bg-slate-50 border border-slate-100 focus-within:border-slate-300 focus-within:bg-white transition-all">
                  <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-0.5">Password</label>
                  <div className="flex items-center gap-2">
                    <input type="password" required minLength={8}
                      className="w-full bg-transparent outline-none text-sm font-bold text-slate-900 tracking-widest placeholder:text-slate-300"
                      value={password} onChange={e => setPassword(e.target.value)} />
                    <Lock className="w-4 h-4 text-slate-300 flex-shrink-0" />
                  </div>
                </div>
                <button type="submit"
                  className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl font-black text-sm border border-slate-900 text-slate-900 hover:bg-slate-900 hover:text-white transition-all mt-2">
                  Create Account <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            </div>

            <div className="mt-8 text-[11px] font-bold flex items-center gap-3 text-slate-400">
              <span>© 2026 KarkTech</span>
              <span className="text-slate-200">·</span>
              <Link to="/privacy" className="hover:text-slate-900 transition-colors">Privacy Policy</Link>
              <span className="text-slate-200">·</span>
              <Link to="/terms" className="hover:text-slate-900 transition-colors">Terms</Link>
            </div>
          </div>

          {/* Right — Visual */}
          <div className="hidden lg:flex w-1/2 relative items-center justify-center overflow-hidden bg-slate-50">
            <div className="absolute inset-0 pointer-events-none"
              style={{ background: 'radial-gradient(circle at 40% 50%, rgba(139,92,246,0.08) 0%, transparent 60%), radial-gradient(circle at 80% 20%, rgba(59,130,246,0.06) 0%, transparent 50%)' }} />
            <div className="relative z-10 flex flex-row items-center justify-center gap-3 w-[90%]">
              <img src="/karkibiralo.gif.gif" alt="KarkTech" className="w-[47%] h-auto object-contain rounded-[1.5rem]" />
              <img src="/karkibiralo2.gif.gif" alt="KarkTech" className="w-[47%] h-auto object-contain rounded-[1.5rem]" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
