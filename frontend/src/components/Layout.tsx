import { Outlet, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, PenSquare, LogOut, Users, Activity, Settings as SettingsIcon, CalendarDays, FileText, Moon, Sun, ChevronLeft, ChevronRight, Sparkles, Library } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useClerk } from '@clerk/clerk-react';
import PostDrawer from './PostDrawer';
import BrandLoader from './BrandLoader';
import ProfilePanel from './ProfilePanel';
import AccountSwitcher from './AccountSwitcher';

const NAV_USER = [
  { to: '/',                label: 'Overview',      icon: LayoutDashboard, color: 'from-blue-500 to-cyan-400',     glow: 'shadow-blue-500/30',    iconBg: 'bg-blue-500/15 text-blue-400' },
  { to: '/my-posts',        label: 'My Posts',      icon: FileText,        color: 'from-violet-500 to-purple-400', glow: 'shadow-violet-500/30',  iconBg: 'bg-violet-500/15 text-violet-400' },
  { to: '/media',           label: 'Media Library', icon: Library,         color: 'from-fuchsia-500 to-pink-400',  glow: 'shadow-fuchsia-500/30', iconBg: 'bg-fuchsia-500/15 text-fuchsia-400' },
  { to: '/calendar',        label: 'Calendar',      icon: CalendarDays,    color: 'from-cyan-500 to-teal-400',     glow: 'shadow-cyan-500/30',    iconBg: 'bg-cyan-500/15 text-cyan-400' },
  { to: '/time-generator',  label: 'Intelligence',  icon: Sparkles,        color: 'from-amber-500 to-orange-400',  glow: 'shadow-amber-500/30',   iconBg: 'bg-amber-500/15 text-amber-400' },
];

const NAV_ADMIN = [
  { to: '/',          label: 'Overview',     icon: LayoutDashboard, color: 'from-blue-500 to-cyan-400',    glow: 'shadow-blue-500/30',   iconBg: 'bg-blue-500/15 text-blue-400' },
  { to: '/users',     label: 'All Users',    icon: Users,           color: 'from-emerald-500 to-green-400', glow: 'shadow-emerald-500/30', iconBg: 'bg-emerald-500/15 text-emerald-400' },
  { to: '/health',    label: 'Health',       icon: Activity,        color: 'from-amber-500 to-yellow-400', glow: 'shadow-amber-500/30',  iconBg: 'bg-amber-500/15 text-amber-400' },
  { to: '/settings',  label: 'Settings',     icon: SettingsIcon,    color: 'from-rose-500 to-pink-400',    glow: 'shadow-rose-500/30',   iconBg: 'bg-rose-500/15 text-rose-400' },
];

export default function Layout() {
  const { signOut } = useClerk();
  const location = useLocation();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerPrefill, setDrawerPrefill] = useState<{ content: string; link?: string; imageUrl?: string } | null>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const openDrawerWith = (prefill: { content: string; link?: string; imageUrl?: string }) => {
    setDrawerPrefill(prefill);
    setDrawerOpen(true);
  };
  const [collapsed, setCollapsed] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem('theme') === 'dark' ||
      (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => setIsDarkMode(!isDarkMode);
  const userString = localStorage.getItem('user');
  const user = userString ? JSON.parse(userString) : null;
  const isAdmin = user?.role === 'ADMIN';
  const navItems = isAdmin ? NAV_ADMIN : NAV_USER;
  const initials = user?.name?.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase() || 'U';
  const [savedAvatar, setSavedAvatar] = useState(() => localStorage.getItem('user_avatar') || '');

  const handleLogout = async () => {
    setIsLoggingOut(true);
    localStorage.removeItem('user');
    await signOut();
    window.location.href = '/login';
  };

  const isActive = (path: string) => location.pathname === path;

  if (isLoggingOut) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-[#080810]">
        <BrandLoader size="lg" />
      </div>
    );
  }

  return (
    <div className={`flex h-screen font-sans ${isDarkMode ? 'bg-[#080810]' : ''}`} style={isDarkMode ? {} : { background: '#FAF9F6' }}>

      {/* ── SIDEBAR ── */}
      <aside
        className={`${collapsed ? 'w-[72px]' : 'w-64'} relative flex flex-col transition-all duration-300 ease-in-out flex-shrink-0
          ${isDarkMode
            ? 'bg-[#0d0d16] border-r border-white/[0.06]'
            : 'bg-white border-r border-slate-200 shadow-lg'
          }`}
      >
        {/* ambient glow top */}
        <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-blue-600/10 to-transparent pointer-events-none rounded-t-none" />

        {/* ── BRAND ── */}
        <div className={`flex items-center gap-3 ${collapsed ? 'justify-center px-0 py-6' : 'px-5 py-5'}`}>
          <div className="relative flex-shrink-0">
            <div className="w-10 h-10 rounded-xl overflow-hidden ring-1 ring-blue-500/30 shadow-lg shadow-blue-500/20 bg-[#0d0d16] flex items-center justify-center">
              <img
                src="/karklogo.png.png"
                alt="KarkTech"
                className="w-full h-full object-contain"
                onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
              />
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-400 rounded-full ring-2 ring-[#0d0d16]" />
          </div>
          {!collapsed && (
            <div className="overflow-hidden">
              <p className="text-[15px] font-black tracking-tight leading-none bg-gradient-to-r from-blue-500 via-violet-500 to-cyan-500 bg-clip-text text-transparent">KarkTech</p>
            </div>
          )}
        </div>

        {/* ── ACCOUNT SWITCHER (users only) ── */}
        {!isAdmin && <AccountSwitcher isDarkMode={isDarkMode} collapsed={collapsed} />}

        {/* ── NAV ── */}
        <nav className={`flex-1 overflow-y-auto py-2 space-y-0.5 ${collapsed ? 'px-2' : 'px-3'}`}>
          {!collapsed && (
            <p className="text-[9px] font-black tracking-[0.2em] uppercase px-3 pb-2 pt-1 text-slate-600">
              {isAdmin ? 'Management' : 'Workspace'}
            </p>
          )}

          {/* Create Post button — user only */}
          {!isAdmin && (
            <button
              onClick={() => setDrawerOpen(true)}
              title={collapsed ? 'Create Post' : ''}
              className={`group w-full flex items-center gap-3 rounded-xl font-black text-sm transition-all duration-200 mb-1
                ${collapsed ? 'justify-center p-3' : 'px-3 py-2.5'}
                ${isDarkMode
                  ? 'bg-gradient-to-r from-blue-600/20 to-violet-600/20 text-blue-300 hover:from-blue-600/30 hover:to-violet-600/30 border border-blue-500/20 hover:border-blue-400/30'
                  : 'border border-slate-900 text-slate-900 hover:bg-slate-900 hover:text-white'
                }`}
            >
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center flex-shrink-0 shadow-md shadow-blue-500/30">
                <PenSquare className="w-3.5 h-3.5 text-white" />
              </div>
              {!collapsed && <span>Create Post</span>}
            </button>
          )}

          {navItems.map((item) => {
            const active = isActive(item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                title={collapsed ? item.label : ''}
                className={`group flex items-center gap-3 rounded-xl font-semibold text-sm transition-all duration-200
                  ${collapsed ? 'justify-center p-3' : 'px-3 py-2.5'}
                  ${active
                    ? `bg-gradient-to-r ${item.color} bg-opacity-10 shadow-md ${item.glow} text-white`
                    : isDarkMode
                      ? 'text-slate-500 hover:text-slate-200 hover:bg-white/5'
                      : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                  }`}
              >
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 transition-all duration-200
                  ${active
                    ? `bg-gradient-to-br ${item.color} shadow-md ${item.glow}`
                    : isDarkMode ? item.iconBg : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  <item.icon className="w-3.5 h-3.5" />
                </div>
                {!collapsed && (
                  <span className={active ? 'text-white font-bold' : ''}>{item.label}</span>
                )}
                {!collapsed && active && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-white/80" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* ── USER SECTION ── */}
        <div className={`border-t ${isDarkMode ? 'border-white/[0.06]' : 'border-slate-100'} ${collapsed ? 'p-2' : 'p-3'} space-y-1`}>
          {!collapsed ? (
            <div
              onClick={() => setProfileOpen(true)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all ${isDarkMode ? 'bg-white/[0.03] hover:bg-white/[0.07]' : 'bg-slate-50 hover:bg-slate-100'}`}
            >
              {savedAvatar ? (
                <img src={savedAvatar} alt="avatar" className="w-8 h-8 rounded-xl object-cover flex-shrink-0 ring-1 ring-blue-500/40" />
              ) : (
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center flex-shrink-0 shadow-md shadow-blue-500/30">
                  <span className="text-[11px] font-black text-white">{initials}</span>
                </div>
              )}
              <div className="flex-1 overflow-hidden">
                <p className={`text-xs font-bold truncate ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>{user?.name || 'User'}</p>
                <p className="text-[10px] font-semibold text-slate-500 truncate">{isAdmin ? 'Platform Owner' : 'Standard User'}</p>
              </div>
              <button onClick={e => { e.stopPropagation(); toggleDarkMode(); }} className={`p-1.5 rounded-lg transition-all flex-shrink-0 ${isDarkMode ? 'text-slate-500 hover:text-yellow-400 hover:bg-yellow-400/10' : 'text-slate-400 hover:text-blue-600 hover:bg-blue-50'}`}>
                {isDarkMode ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-1.5">
              <div
                onClick={() => setProfileOpen(true)}
                className="cursor-pointer hover:scale-110 transition-transform"
                title="My Profile"
              >
                {savedAvatar ? (
                  <img src={savedAvatar} alt="avatar" className="w-8 h-8 rounded-xl object-cover ring-1 ring-blue-500/40" />
                ) : (
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center shadow-md shadow-blue-500/30">
                    <span className="text-[11px] font-black text-white">{initials}</span>
                  </div>
                )}
              </div>
              <button onClick={toggleDarkMode} title={isDarkMode ? 'Light' : 'Dark'} className={`p-2 rounded-lg transition-all ${isDarkMode ? 'text-slate-500 hover:text-yellow-400 hover:bg-yellow-400/10' : 'text-slate-400 hover:text-blue-600'}`}>
                {isDarkMode ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
              </button>
            </div>
          )}

          <button
            onClick={handleLogout}
            title={collapsed ? 'Logout' : ''}
            className={`group flex items-center gap-3 w-full rounded-xl font-semibold text-sm transition-all duration-200
              ${collapsed ? 'justify-center p-3' : 'px-3 py-2.5'}
              ${isDarkMode ? 'text-slate-600 hover:text-red-400 hover:bg-red-500/10' : 'text-slate-400 hover:text-red-500 hover:bg-red-50'}`}
          >
            <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 transition-all ${isDarkMode ? 'bg-white/5 group-hover:bg-red-500/15' : 'bg-slate-100 group-hover:bg-red-50'}`}>
              <LogOut className="w-3.5 h-3.5" />
            </div>
            {!collapsed && <span>Logout</span>}
          </button>
        </div>

        {/* ── COLLAPSE TOGGLE ── */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={`absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full flex items-center justify-center z-20 transition-all shadow-lg
            ${isDarkMode
              ? 'bg-[#1a1a2e] border border-white/10 text-slate-400 hover:text-blue-400 hover:border-blue-500/40'
              : 'bg-white border border-slate-200 text-slate-400 hover:text-blue-600'
            }`}
        >
          {collapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
        </button>
      </aside>

      {/* ── MAIN ── */}
      <main className={`flex-1 flex flex-col overflow-hidden ${isDarkMode ? 'bg-[#080810]' : ''}`} style={isDarkMode ? {} : { background: '#FAF9F6' }}>
        <div className="flex-1 overflow-auto p-8 lg:p-10 relative">
          <div className={`absolute top-0 right-0 w-[600px] h-[400px] rounded-full filter blur-[120px] pointer-events-none ${isDarkMode ? 'bg-blue-600/5' : 'bg-blue-400/5'}`} />
          <div className="max-w-6xl mx-auto relative z-10">
            <Outlet context={{ setDrawerOpen, isDarkMode, setProfileOpen, openDrawerWith }} />
          </div>
        </div>
        <footer className={`shrink-0 border-t px-10 py-2.5 flex items-center justify-center gap-5 ${isDarkMode ? 'bg-[#0d0d16] border-white/[0.05]' : 'bg-white border-slate-200'}`}>
          <span className={`text-[10px] font-bold ${isDarkMode ? 'text-slate-700' : 'text-slate-900'}`}>© 2026 KarkTech</span>
          <span className={`text-[10px] ${isDarkMode ? 'text-slate-800' : 'text-slate-300'}`}>·</span>
          <Link to="/privacy" className={`text-[10px] font-bold transition-colors ${isDarkMode ? 'text-slate-600 hover:text-blue-400' : 'text-slate-900 hover:text-black'}`}>Privacy Policy</Link>
          <span className={`text-[10px] ${isDarkMode ? 'text-slate-800' : 'text-slate-300'}`}>·</span>
          <Link to="/terms" className={`text-[10px] font-bold transition-colors ${isDarkMode ? 'text-slate-600 hover:text-blue-400' : 'text-slate-900 hover:text-black'}`}>Terms & Conditions</Link>
        </footer>
      </main>

      <PostDrawer isOpen={drawerOpen} onClose={() => { setDrawerOpen(false); setDrawerPrefill(null); }} prefill={drawerPrefill ?? undefined} />
      <ProfilePanel isOpen={profileOpen} onClose={() => setProfileOpen(false)} isDarkMode={isDarkMode} onAvatarChange={setSavedAvatar} />
    </div>
  );
}
