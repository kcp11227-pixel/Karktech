import { useNavigate, Link } from 'react-router-dom';
import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';

const DEFAULT_TERMS = `Terms & Conditions
Last updated: May 2026

1. Acceptance of Terms
By accessing and using the KarkTech platform, you accept and agree to be bound by these Terms and Conditions. If you do not agree to these terms, please do not use our platform.

2. Use of the Platform
You agree to use KarkTech only for lawful purposes and in a manner that does not infringe the rights of others. You are responsible for maintaining the confidentiality of your account credentials.

3. User Accounts
- You must provide accurate and complete information when creating an account
- You are responsible for all activities that occur under your account
- You must notify us immediately of any unauthorized use of your account
- We reserve the right to terminate accounts that violate these terms

4. Content & Intellectual Property
All content posted through KarkTech remains your property. By using our platform, you grant us a limited license to process and display your content solely for the purpose of providing our services.

5. Prohibited Activities
You may not:
- Use the platform for any illegal or unauthorized purpose
- Attempt to gain unauthorized access to any part of the platform
- Interfere with or disrupt the integrity of the platform
- Upload malicious code or harmful content

6. Limitation of Liability
KarkTech shall not be liable for any indirect, incidental, special, or consequential damages resulting from your use of the platform.

7. Third-Party Services
Our platform may integrate with third-party services (e.g., Facebook). Your use of such services is governed by their respective terms and conditions.

8. Modifications
We reserve the right to modify these Terms at any time. Continued use of the platform after changes constitutes acceptance of the new terms.

9. Governing Law
These Terms shall be governed by applicable law. Any disputes shall be resolved through binding arbitration.

10. Contact Us
For questions about these Terms, contact us at legal@karktech.com.`;

export default function TermsPage() {
  const navigate = useNavigate();
  const [isDarkMode] = useState(() => localStorage.getItem('theme') === 'dark');
  const content = localStorage.getItem('terms_content') || DEFAULT_TERMS;

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
            Terms & Conditions
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
            <Link to="/privacy" className={`transition-colors ${isDarkMode ? 'hover:text-blue-400' : 'hover:text-black underline underline-offset-2'}`}>Privacy Policy</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
