import { useState } from 'react';
import { Link } from 'react-router-dom';
import toast from '../utils/toast';
import { Mail, Lock, User, ArrowRight } from 'lucide-react';
import BrandLoader from '../components/BrandLoader';
import { useSignUp } from '@clerk/clerk-react';

type Phase = 'form' | 'otp';

export default function Register() {
  const { signUp, setActive, isLoaded } = useSignUp();
  const [phase, setPhase] = useState<Phase>('form');
  const [isLoading, setIsLoading] = useState(false);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');

  /* ── Register ── */
  const handleRegister = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (!isLoaded) return;
    setIsLoading(true);
    try {
      const [firstName, ...rest] = name.trim().split(' ');
      const result = await signUp.create({
        firstName,
        lastName: rest.join(' ') || undefined,
        emailAddress: email,
        password,
      });
      if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId });
        window.location.href = '/';
      } else {
        await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
        setPhase('otp');
        toast.success('Verification code sent to your email!');
      }
    } catch (err: any) {
      console.error('Clerk signup error:', JSON.stringify(err, null, 2));
      const msg = err?.errors?.[0]?.longMessage || err?.errors?.[0]?.message || err?.message || 'Registration failed';
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  /* ── Verify OTP ── */
  const handleVerify = async () => {
    if (!isLoaded) return;
    setIsLoading(true);
    try {
      const result = await signUp.attemptEmailAddressVerification({ code: otp });
      if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId });
        window.location.href = '/';
      }
    } catch (err: any) {
      toast.error(err?.errors?.[0]?.message || 'Invalid code. Try again.');
      setIsLoading(false);
    }
  };

  /* ── Resend OTP ── */
  const handleResend = async () => {
    if (!isLoaded) return;
    try {
      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
      toast.success('New code sent!');
    } catch {
      toast.error('Failed to resend code');
    }
  };

  /* ── Social OAuth ── */
  const handleOAuth = async (strategy: 'oauth_google' | 'oauth_facebook') => {
    if (!isLoaded) return;
    await signUp.authenticateWithRedirect({
      strategy,
      redirectUrl: `${window.location.origin}/sso-callback`,
      redirectUrlComplete: '/',
    });
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
                {phase === 'otp' ? 'One more step' : 'Join us today'}
              </p>
              <h2 className="text-3xl font-black leading-tight mb-2 text-slate-900"
                style={{ fontFamily: 'Merriweather, serif', fontWeight: 900 }}>
                {phase === 'otp' ? 'Verify your email.' : 'Create your account.'}
              </h2>
              <p className="text-sm font-medium mb-8 text-slate-500"
                style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", sans-serif', letterSpacing: '-0.01em' }}>
                {phase === 'otp'
                  ? <>We sent a 6-digit code to <span className="font-black text-slate-900">{email}</span></>
                  : <>Already a member?{' '}
                      <Link to="/login" className="font-black text-slate-900 hover:text-black underline underline-offset-2">Log in here</Link>
                    </>
                }
              </p>

              {/* ── Registration Form ── */}
              {phase === 'form' && (
                <>
                  {/* Social Auth */}
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
                </>
              )}

              {/* ── OTP Verification ── */}
              {phase === 'otp' && (
                <div className="space-y-3">
                  <div className="rounded-2xl px-4 pt-2.5 pb-2 bg-slate-50 border border-slate-100 focus-within:border-slate-300 focus-within:bg-white transition-all">
                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-0.5">6-Digit Code</label>
                    <input type="text" maxLength={6} placeholder="· · · · · ·" autoFocus
                      className="w-full bg-transparent outline-none text-lg font-black text-slate-900 tracking-[0.4em] placeholder:text-slate-200 placeholder:tracking-[0.4em]"
                      value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g, ''))} />
                  </div>
                  <button onClick={handleVerify}
                    className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl font-black text-sm border border-slate-900 text-slate-900 hover:bg-slate-900 hover:text-white transition-all">
                    Verify & Continue <ArrowRight className="w-4 h-4" />
                  </button>
                  <div className="flex items-center justify-between pt-1">
                    <button onClick={() => { setPhase('form'); setOtp(''); }}
                      className="text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors">
                      ← Back
                    </button>
                    <button onClick={handleResend}
                      className="text-xs font-black text-slate-900 hover:text-black underline underline-offset-2 transition-colors">
                      Resend code
                    </button>
                  </div>
                </div>
              )}
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
