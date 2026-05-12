import { useState } from 'react';
import { Shield, Key, Lock, Activity, Users, Globe, EyeOff, Eye, ShieldAlert, FileText } from 'lucide-react';
import toast from '../utils/toast';

const DEFAULT_PRIVACY = `Privacy Policy
Last updated: May 2026

1. Information We Collect
We collect information you provide directly to us when you create an account, including your name, email address, and password. We may also collect usage data such as pages visited and actions taken within the platform.

2. How We Use Your Information
We use the information we collect to provide, maintain, and improve our services, send you technical notices, and respond to your comments and questions.

3. Information Sharing
We do not sell, trade, or otherwise transfer your personal information to third parties without your consent, except as required by law or to protect our rights.

4. Data Security
We implement appropriate technical and organizational security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.

5. Cookies
We use cookies and similar tracking technologies to enhance your experience on our platform.

6. Contact Us
If you have any questions about this Privacy Policy, please contact us at privacy@karktech.com.`;

const DEFAULT_TERMS = `Terms & Conditions
Last updated: May 2026

1. Acceptance of Terms
By accessing and using the KarkTech platform, you accept and agree to be bound by these Terms and Conditions.

2. Use of the Platform
You agree to use KarkTech only for lawful purposes and in a manner that does not infringe the rights of others.

3. User Accounts
You must provide accurate information when creating an account and are responsible for all activities under your account.

4. Content & Intellectual Property
All content posted through KarkTech remains your property. By using our platform, you grant us a limited license to process and display your content solely to provide our services.

5. Prohibited Activities
You may not use the platform for illegal purposes, attempt unauthorized access, or upload malicious content.

6. Limitation of Liability
KarkTech shall not be liable for any indirect or consequential damages resulting from your use of the platform.

7. Contact Us
For questions about these Terms, contact us at legal@karktech.com.`;

export default function Settings() {
  const [activeTab, setActiveTab] = useState('security');
  const [showKey, setShowKey] = useState(false);
  const [twoFactor, setTwoFactor] = useState(true);
  const [privacyContent, setPrivacyContent] = useState(() => localStorage.getItem('privacy_content') || DEFAULT_PRIVACY);
  const [termsContent, setTermsContent] = useState(() => localStorage.getItem('terms_content') || DEFAULT_TERMS);

  const userString = localStorage.getItem('user');
  const user = userString ? JSON.parse(userString) : null;
  const isAdmin = user?.role === 'ADMIN';

  const handleSave = () => {
    toast.success('Security settings updated successfully');
  };

  const handleSaveLegal = () => {
    localStorage.setItem('privacy_content', privacyContent);
    localStorage.setItem('terms_content', termsContent);
    toast.success('Legal pages updated successfully');
  };

  const tabs = [
    { id: 'general', label: 'General Info', icon: Globe },
    { id: 'security', label: 'Owner Security', icon: Shield },
    { id: 'team', label: 'Team Access', icon: Users },
    { id: 'audit', label: 'Audit Logs', icon: Activity },
    { id: 'legal', label: 'Legal Pages', icon: FileText },
  ];

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <ShieldAlert className="w-16 h-16 text-red-500" />
        <h2 className="text-2xl font-bold text-slate-800">Access Denied</h2>
        <p className="text-slate-500">You do not have permission to view owner settings.</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in-up">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-slate-800 to-slate-600 tracking-tight mb-2">Secure Owner System</h2>
          <p className="text-slate-500 font-medium">Manage platform security, keys, and master access controls.</p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar Tabs */}
        <div className="w-full md:w-64 space-y-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-5 py-4 rounded-2xl font-bold text-sm transition-all duration-300 ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white shadow-[0_8px_20px_rgba(37,99,235,0.3)]'
                  : 'bg-white/50 text-slate-500 hover:bg-white hover:text-slate-800 border border-transparent hover:border-slate-200 shadow-sm'
              }`}
            >
              <tab.icon className={`w-5 h-5 ${activeTab === tab.id ? 'text-blue-200' : 'text-slate-400'}`} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="flex-1 space-y-6">
          {activeTab === 'security' && (
            <>
              {/* 2FA Section */}
              <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white p-8">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center">
                      <Lock className="w-6 h-6 text-indigo-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-slate-800">Two-Factor Authentication (2FA)</h3>
                      <p className="text-sm text-slate-500 font-medium mt-1">Require all users to use 2FA for accessing the platform.</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setTwoFactor(!twoFactor)}
                    className={`relative inline-flex h-7 w-14 items-center rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${twoFactor ? 'bg-blue-600' : 'bg-slate-200'}`}
                  >
                    <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition duration-300 ${twoFactor ? 'translate-x-8' : 'translate-x-1'}`} />
                  </button>
                </div>
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3">
                  <ShieldAlert className="w-5 h-5 text-amber-600 flex-shrink-0" />
                  <p className="text-sm font-semibold text-amber-800">Disabling 2FA reduces the overall security posture of the application. It is highly recommended to keep this enabled for all admin accounts.</p>
                </div>
              </div>

              {/* Master Keys */}
              <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white p-8">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-rose-50 rounded-2xl flex items-center justify-center">
                    <Key className="w-6 h-6 text-rose-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-800">Master API Key</h3>
                    <p className="text-sm text-slate-500 font-medium mt-1">Used for external system integrations. Keep this highly secure.</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 flex items-center justify-between">
                    <code className="text-sm font-mono font-bold text-slate-700 tracking-wider">
                      {showKey ? 'kt_live_9f8d7c6b5a41234567890abcdef' : 'kt_live_••••••••••••••••••••••••'}
                    </code>
                    <button onClick={() => setShowKey(!showKey)} className="text-slate-400 hover:text-blue-600 transition-colors">
                      {showKey ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  <button onClick={() => toast.success('Key copied to clipboard')} className="bg-slate-800 hover:bg-slate-900 text-white font-bold py-3 px-6 rounded-xl transition-colors">
                    Copy
                  </button>
                </div>
              </div>

              {/* Session Management */}
              <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white p-8">
                <h3 className="text-xl font-bold text-slate-800 mb-4">Active Sessions & Security</h3>
                <p className="text-sm text-slate-500 font-medium mb-6">Manage how long users stay logged in before requiring re-authentication.</p>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                  <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Session Timeout</label>
                    <select className="w-full bg-transparent font-bold text-slate-700 outline-none">
                      <option>30 Minutes</option>
                      <option>1 Hour</option>
                      <option>24 Hours</option>
                      <option>Never (Not Recommended)</option>
                    </select>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Failed Login Lockout</label>
                    <select className="w-full bg-transparent font-bold text-slate-700 outline-none">
                      <option>After 3 attempts</option>
                      <option>After 5 attempts</option>
                      <option>After 10 attempts</option>
                    </select>
                  </div>
                </div>

                <div className="pt-6 border-t border-slate-100 flex justify-end gap-3">
                  <button className="px-6 py-3 rounded-xl font-bold text-red-600 bg-red-50 hover:bg-red-100 transition-colors">
                    Force Logout All Users
                  </button>
                  <button onClick={handleSave} className="px-8 py-3 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-[0_8px_20px_rgba(37,99,235,0.3)] transition-all transform hover:-translate-y-0.5">
                    Save Security Settings
                  </button>
                </div>
              </div>
            </>
          )}

          {activeTab === 'audit' && (
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white overflow-hidden">
              <div className="p-6 border-b border-slate-100/80 bg-white/50 flex justify-between items-center">
                <h3 className="text-lg font-bold text-slate-800">System Audit Logs</h3>
                <button className="text-sm font-bold text-blue-600 hover:text-blue-700">Export CSV</button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-50/50">
                    <tr>
                      <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Timestamp</th>
                      <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Action</th>
                      <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">User/IP</th>
                      <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {[
                      { time: 'Just now', action: 'Security settings updated', user: 'admin@karktech.com', status: 'Success' },
                      { time: '2 hrs ago', action: 'Failed login attempt', user: '192.168.1.45', status: 'Blocked' },
                      { time: '5 hrs ago', action: 'Database backup completed', user: 'System', status: 'Success' },
                      { time: '1 day ago', action: 'New page connected', user: 'sarah@digital.com', status: 'Success' },
                    ].map((log, i) => (
                      <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                        <td className="p-4 text-sm font-semibold text-slate-600">{log.time}</td>
                        <td className="p-4 text-sm font-bold text-slate-800">{log.action}</td>
                        <td className="p-4 text-sm font-medium text-slate-500">{log.user}</td>
                        <td className="p-4">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                            log.status === 'Success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                          }`}>
                            {log.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {(activeTab === 'general' || activeTab === 'team') && (
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white p-12 text-center">
              <Activity className="w-16 h-16 text-slate-200 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-slate-800 mb-2">Coming Soon</h3>
              <p className="text-slate-500 font-medium">This module is currently under development.</p>
            </div>
          )}

          {activeTab === 'legal' && (
            <div className="space-y-6">
              <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white p-8">
                <div className="flex items-center gap-4 mb-5">
                  <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center">
                    <FileText className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-800">Privacy Policy</h3>
                    <p className="text-sm text-slate-500 font-medium mt-0.5">Shown at <span className="font-bold text-blue-600">/privacy</span> — visible to all users</p>
                  </div>
                </div>
                <textarea
                  value={privacyContent}
                  onChange={e => setPrivacyContent(e.target.value)}
                  rows={14}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-sm font-medium text-slate-700 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 resize-y leading-relaxed transition-all"
                />
              </div>

              <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white p-8">
                <div className="flex items-center gap-4 mb-5">
                  <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center">
                    <FileText className="w-6 h-6 text-indigo-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-800">Terms & Conditions</h3>
                    <p className="text-sm text-slate-500 font-medium mt-0.5">Shown at <span className="font-bold text-blue-600">/terms</span> — visible to all users</p>
                  </div>
                </div>
                <textarea
                  value={termsContent}
                  onChange={e => setTermsContent(e.target.value)}
                  rows={14}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-sm font-medium text-slate-700 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 resize-y leading-relaxed transition-all"
                />
              </div>

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => { setPrivacyContent(DEFAULT_PRIVACY); setTermsContent(DEFAULT_TERMS); }}
                  className="px-6 py-3 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
                >
                  Reset to Default
                </button>
                <button
                  onClick={handleSaveLegal}
                  className="px-8 py-3 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-[0_8px_20px_rgba(37,99,235,0.3)] transition-all transform hover:-translate-y-0.5"
                >
                  Save Legal Pages
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
