import { useNavigate, Link } from 'react-router-dom';
import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';

const DEFAULT_PRIVACY = `Privacy Policy
Last updated: May 2026

1. Information We Collect
We collect information you provide directly to us when you create an account, including your name, email address, and password. We may also collect usage data such as pages visited and actions taken within the platform.

2. How We Use Your Information
We use the information we collect to:
- Provide, maintain, and improve our services
- Send you technical notices and support messages
- Respond to your comments and questions
- Monitor and analyze usage patterns

3. Information Sharing
We do not sell, trade, or otherwise transfer your personal information to third parties without your consent, except as required by law or to protect our rights.

4. Data Security
We implement appropriate technical and organizational security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.

5. Cookies
We use cookies and similar tracking technologies to enhance your experience on our platform. You can choose to disable cookies through your browser settings, though this may affect some functionality.

6. Data Retention
We retain your personal information for as long as your account is active or as needed to provide you services. You may request deletion of your data at any time.

7. Your Rights
You have the right to access, correct, or delete your personal information. To exercise these rights, please contact us.

8. Changes to This Policy
We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new policy on this page.

9. Contact Us
If you have any questions about this Privacy Policy, please contact us at privacy@karktech.com.`;

export default function PrivacyPage() {
  const navigate = useNavigate();
  const [isDarkMode] = useState(() => localStorage.getItem('theme') === 'dark');
  const content = localStorage.getItem('privacy_content') || DEFAULT_PRIVACY;

  return (
    <div className={`min-h-screen flex flex-col font-sans transition-colors duration-300 ${isDarkMode ? 'bg-[#000000] text-white' : 'text-slate-900'}`} style={isDarkMode ? {} : { background: '#FAF9F6' }}>

      {/* Nav */}
      <div className={`flex items-center justify-between px-8 py-5 border-b ${isDarkMode ? 'border-white/[0.06]' : 'border-slate-100 bg-white'}`}>
        <Link to="/landing" className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md overflow-hidden">
            <img src="/karklogo.png.png" alt="KarkTech" className="w-full h-full object-contain" />
          </div>
          <span className="text-base font-black tracking-tight bg-gradient-to-r from-blue-500 via-violet-500 to-cyan-500 bg-clip-text text-transparent">
            KarkTech
          </span>
        </Link>
        <button
          onClick={() => navigate(-1)}
          className={`inline-flex items-center gap-2 text-sm font-black transition-colors ${isDarkMode ? 'text-slate-400 hover:text-white' : 'text-slate-900 hover:text-black'}`}
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 px-6 py-12">
        <div className={`max-w-3xl mx-auto rounded-3xl p-8 sm:p-12 border ${isDarkMode ? 'bg-[#0a0a0a] border-slate-800 shadow-[0_20px_50px_rgb(0,0,0,0.4)]' : 'bg-white border-slate-100 shadow-[0_8px_40px_rgba(0,0,0,0.06)]'}`}>

          <h1 className={`text-3xl font-black mb-1 tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`} style={{ fontFamily: 'Merriweather, serif', fontWeight: 900 }}>
            Privacy Policy
          </h1>
          <p className={`text-xs font-black mb-8 uppercase tracking-widest ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}
            style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif' }}>
            KarkTech Platform · Last updated May 2026
          </p>

          <div className={`whitespace-pre-wrap text-sm leading-relaxed font-medium space-y-1 ${isDarkMode ? 'text-slate-300' : ''}`}
            style={isDarkMode ? {} : { color: '#1d1d1f', fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", sans-serif', letterSpacing: '-0.01em' }}>
            {content}
          </div>

          <div className={`mt-10 pt-6 border-t text-xs font-bold flex items-center gap-3 ${isDarkMode ? 'border-slate-800 text-slate-600' : 'border-slate-100 text-slate-900'}`}>
            <span>© 2026 KarkTech</span>
            <span className={isDarkMode ? 'text-slate-700' : 'text-slate-300'}>·</span>
            <Link to="/terms" className={`transition-colors ${isDarkMode ? 'hover:text-blue-400' : 'hover:text-black underline underline-offset-2'}`}>Terms & Conditions</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
