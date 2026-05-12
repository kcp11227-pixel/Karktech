import { useState } from 'react';
import { Link } from 'react-router-dom';
import toast from '../utils/toast';
import { Mail, Lock, ArrowRight } from 'lucide-react';
import BrandLoader from '../components/BrandLoader';
import { useSignIn } from '@clerk/clerk-react';

type Mode = 'password' | 'code';
type CodePhase = 'input' | 'otp' | 'link_sent';

export default function Login() {
  const { signIn, setActive, isLoaded } = useSignIn();
  const [mode, setMode] = useState<Mode>('password');
  const [isLoading, setIsLoading] = useState(false);

  // Password mode
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Email code mode
  const [codeEmail, setCodeEmail] = useState('');
  const [codePhase, setCodePhase] = useState<CodePhase>('input');
  const [otp, setOtp] = useState('');
  const [inlineError, setInlineError] = useState('');

  /* ── Password login ── */
  const handlePasswordLogin = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (!isLoaded) return;
    setIsLoading(true);
    try {
      const result = await signIn.create({ identifier: email, password });
      if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId });
        window.location.href = '/';
      }
    } catch (err: any) {
      toast.error(err?.errors?.[0]?.longMessage || 'Invalid email or password');
      setIsLoading(false);
    }
  };

  /* ── Email code/link: send ── */
  const handleCodeSend = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (!isLoaded) return;
    setIsLoading(true);
    try {
      const result = await signIn.create({ identifier: codeEmail });
      const factors = (result.supportedFirstFactors as any[]) || [];

      // Prefer email_code (OTP), fall back to email_link (magic link)
      const codeFactor = factors.find((f: any) => f.strategy === 'email_code');
      const linkFactor = factors.find((f: any) => f.strategy === 'email_link');

      if (codeFactor) {
        await signIn.prepareFirstFactor({
          strategy: 'email_code',
          emailAddressId: codeFactor.emailAddressId,
        });
        setCodePhase('otp');
        toast.success('Code sent! Check your email.');
      } else if (linkFactor) {
        await signIn.prepareFirstFactor({
          strategy: 'email_link',
          emailAddressId: linkFactor.emailAddressId,
          redirectUrl: `${window.location.origin}/sso-callback`,
        } as any);
        setCodePhase('link_sent');
        toast.success('Magic link sent! Check your email.');
      } else {
        setInlineError('Email code sign-in is not enabled in Clerk Dashboard. Please use Google login or the Password method.');
      }
    } catch (err: any) {
      const msg = err?.errors?.[0]?.longMessage || err?.errors?.[0]?.message || 'Failed to send code. Try Google login instead.';
      setInlineError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  /* ── Email code: verify OTP ── */
  const handleCodeVerify = async () => {
    if (!isLoaded) return;
    setIsLoading(true);
    try {
      const result = await signIn.attemptFirstFactor({
        strategy: 'email_code',
        code: otp,
      });
      if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId });
        window.location.href = '/';
      }
    } catch (err: any) {
      toast.error(err?.errors?.[0]?.message || 'Invalid code');
      setIsLoading(false);
    }
  };

  /* ── Social OAuth ── */
  const handleOAuth = async (strategy: 'oauth_google' | 'oauth_facebook') => {
    if (!isLoaded) return;
    await signIn.authenticateWithRedirect({
      strategy,
      redirectUrl: `${window.location.origin}/sso-callback`,
      redirectUrlComplete: '/',
    });
  };

  const switchMode = (m: Mode) => {
    setMode(m);
    setCodePhase('input');
    setOtp('');
    setInlineError('');
  };

  const handleDevLogin = () => {
    localStorage.setItem('dev_bypass_token', 'DEV_KARKTECH_2026');
    localStorage.setItem('user', JSON.stringify({
      id: 'dev-user', name: 'Dev User', email: 'dev@karktech.com', role: 'USER',
    }));
    window.location.href = '/';
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
        <Link to="/register" className="text-[13px] font-black text-slate-900 hover:text-black transition-colors">
          Create account
        </Link>
      </div>

      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-[900px] flex rounded-3xl overflow-hidden bg-white border border-slate-100 shadow-[0_8px_40px_rgba(0,0,0,0.07)]">

          {/* Left — Form */}
          <div className="w-full lg:w-1/2 p-10 flex flex-col justify-between">
            <div className="flex-1 flex flex-col justify-center max-w-sm mx-auto w-full">

              <p className="text-[10px] font-black tracking-widest uppercase mb-2 text-slate-400"
                style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif' }}>
                Welcome back
              </p>
              <h2 className="text-3xl font-black leading-tight mb-2 text-slate-900"
                style={{ fontFamily: 'Merriweather, serif', fontWeight: 900 }}>
                {mode === 'code' && codePhase === 'otp' ? 'Check your email.' :
                 mode === 'code' && codePhase === 'link_sent' ? 'Magic link sent.' :
                 'Log in to your account.'}
              </h2>
              <p className="text-sm font-medium mb-6 text-slate-500"
                style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", sans-serif', letterSpacing: '-0.01em' }}>
                {mode === 'code' && codePhase === 'otp'
                  ? <>Code sent to <span className="font-black text-slate-900">{codeEmail}</span></>
                  : mode === 'code' && codePhase === 'link_sent'
                  ? <>Link sent to <span className="font-black text-slate-900">{codeEmail}</span> — click it to sign in</>
                  : <>Not a member?{' '}
                      <Link to="/register" className="font-black text-slate-900 hover:text-black underline underline-offset-2">Create an account</Link>
                    </>
                }
              </p>

              {/* Social buttons — hide on OTP/link_sent screen */}
              {!(mode === 'code' && (codePhase === 'otp' || codePhase === 'link_sent')) && (
                <>
                  <div className="flex gap-3 mb-5">
                    <button type="button" onClick={() => handleOAuth('oauth_google')}
                      className="flex-1 flex items-center justify-center gap-2.5 py-3 rounded-2xl border border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm transition-all font-bold text-sm text-slate-700">
                      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                        <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
                        <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
                        <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
                        <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
                      </svg>
                      Google
                    </button>
                    <button type="button" onClick={() => handleOAuth('oauth_facebook')}
                      className="flex-1 flex items-center justify-center gap-2.5 py-3 rounded-2xl border border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm transition-all font-bold text-sm text-slate-700">
                      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                        <rect width="18" height="18" rx="4" fill="#1877F2"/>
                        <path d="M12.5 11.5l.438-2.857H10.2V6.786c0-.782.383-1.545 1.611-1.545H13V2.786S11.822 2.571 10.695 2.571c-2.24 0-3.695 1.357-3.695 3.813v2.259H4.5V11.5H7v6.5h3.2v-6.5h2.3z" fill="white"/>
                      </svg>
                      Facebook
                    </button>
                  </div>

                  <div className="flex items-center gap-3 mb-5">
                    <div className="flex-1 h-px bg-slate-100" />
                    <span className="text-[11px] font-black uppercase tracking-widest text-slate-300">or</span>
                    <div className="flex-1 h-px bg-slate-100" />
                  </div>

                  {/* Mode tabs */}
                  <div className="flex gap-1 p-1 rounded-xl bg-slate-100 mb-5">
                    <button onClick={() => switchMode('password')}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-black transition-all ${mode === 'password' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>
                      <Lock className="w-3.5 h-3.5" /> Password
                    </button>
                    <button onClick={() => switchMode('code')}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-black transition-all ${mode === 'code' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>
                      <Mail className="w-3.5 h-3.5" /> Email Code
                    </button>
                  </div>
                </>
              )}

              {/* ── Password Form ── */}
              {mode === 'password' && (
                <form onSubmit={handlePasswordLogin} className="space-y-3">
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
                      <input type="password" required
                        className="w-full bg-transparent outline-none text-sm font-bold text-slate-900 tracking-widest placeholder:text-slate-300"
                        value={password} onChange={e => setPassword(e.target.value)} />
                      <Lock className="w-4 h-4 text-slate-300 flex-shrink-0" />
                    </div>
                  </div>
                  <div className="flex items-center justify-end pt-1">
                    <a href="#" className="text-xs font-black text-slate-900 hover:text-black underline underline-offset-2">Forgot password?</a>
                  </div>
                  <button type="submit"
                    className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl font-black text-sm border border-slate-900 text-slate-900 hover:bg-slate-900 hover:text-white transition-all mt-2">
                    Sign In <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              )}

              {/* ── Email Code: enter email ── */}
              {mode === 'code' && codePhase === 'input' && (
                <form onSubmit={handleCodeSend} className="space-y-3">
                  <div className="rounded-2xl px-4 pt-2.5 pb-2 bg-slate-50 border border-slate-100 focus-within:border-slate-300 focus-within:bg-white transition-all">
                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-0.5">Email</label>
                    <div className="flex items-center gap-2">
                      <input type="email" required
                        className="w-full bg-transparent outline-none text-sm font-bold text-slate-900 placeholder:text-slate-300"
                        value={codeEmail} onChange={e => { setCodeEmail(e.target.value); setInlineError(''); }} />
                      <Mail className="w-4 h-4 text-slate-300 flex-shrink-0" />
                    </div>
                  </div>

                  {inlineError && (
                    <div className="rounded-2xl px-4 py-3 bg-red-50 border border-red-100">
                      <p className="text-xs font-bold text-red-600">{inlineError}</p>
                      <p className="text-[11px] text-red-400 font-medium mt-1">
                        Easiest fix: use the <span className="font-black">Google</span> button above to sign in instantly.
                      </p>
                    </div>
                  )}

                  <button type="submit"
                    className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl font-black text-sm border border-slate-900 text-slate-900 hover:bg-slate-900 hover:text-white transition-all">
                    Send Code <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              )}

              {/* ── Magic Link: link sent, waiting ── */}
              {mode === 'code' && codePhase === 'link_sent' && (
                <div className="space-y-4">
                  <div className="rounded-2xl px-5 py-5 bg-blue-50 border border-blue-100 text-center space-y-2">
                    <div className="w-12 h-12 rounded-2xl bg-blue-100 flex items-center justify-center mx-auto">
                      <Mail className="w-6 h-6 text-blue-500" />
                    </div>
                    <p className="text-sm font-black text-slate-900">Check your inbox</p>
                    <p className="text-xs text-slate-500 font-medium">We sent a magic link to <span className="font-black text-slate-800">{codeEmail}</span>. Click it to sign in instantly — no password needed.</p>
                    <p className="text-[11px] text-slate-400 font-semibold">Didn't get it? Check spam folder.</p>
                  </div>
                  <button onClick={() => { setCodePhase('input'); setOtp(''); }}
                    className="w-full text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors pt-1">
                    ← Use a different email
                  </button>
                </div>
              )}

              {/* ── Email Code: enter OTP ── */}
              {mode === 'code' && codePhase === 'otp' && (
                <div className="space-y-3">
                  <div className="rounded-2xl px-4 pt-2.5 pb-2 bg-slate-50 border border-slate-100 focus-within:border-slate-300 focus-within:bg-white transition-all">
                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-0.5">Verification Code</label>
                    <input type="text" maxLength={6} placeholder="· · · · · ·" autoFocus
                      className="w-full bg-transparent outline-none text-sm font-bold text-slate-900 tracking-[0.3em] placeholder:text-slate-300"
                      value={otp} onChange={e => setOtp(e.target.value)} />
                  </div>
                  <button onClick={handleCodeVerify}
                    className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl font-black text-sm border border-slate-900 text-slate-900 hover:bg-slate-900 hover:text-white transition-all">
                    Verify & Sign In <ArrowRight className="w-4 h-4" />
                  </button>
                  <button onClick={() => { setCodePhase('input'); setOtp(''); }}
                    className="w-full text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors pt-1">
                    ← Change email
                  </button>
                </div>
              )}
            </div>

            <div className="mt-8 space-y-3">
              <div className="text-[11px] font-bold flex items-center gap-3 text-slate-400">
                <span>© 2026 KarkTech</span>
                <span className="text-slate-200">·</span>
                <Link to="/privacy" className="hover:text-slate-900 transition-colors">Privacy Policy</Link>
                <span className="text-slate-200">·</span>
                <Link to="/terms" className="hover:text-slate-900 transition-colors">Terms</Link>
              </div>
              <button
                onClick={handleDevLogin}
                className="w-full py-2 rounded-xl text-[11px] font-black uppercase tracking-widest border border-dashed border-slate-200 text-slate-300 hover:border-slate-400 hover:text-slate-500 transition-all"
              >
                ⚡ Dev Login (localhost only)
              </button>
            </div>
          </div>

          {/* Right — Visual */}
          <div className="hidden lg:flex w-1/2 relative items-center justify-center overflow-hidden bg-slate-50">
            <div className="absolute inset-0 pointer-events-none"
              style={{ background: 'radial-gradient(circle at 40% 50%, rgba(139,92,246,0.08) 0%, transparent 60%), radial-gradient(circle at 80% 20%, rgba(59,130,246,0.06) 0%, transparent 50%)' }} />
            <img src="/monkey.gif.gif" alt="KarkTech"
              className="relative z-10 w-[78%] h-auto object-contain rounded-[2rem]" />
          </div>
        </div>
      </div>
    </div>
  );
}
