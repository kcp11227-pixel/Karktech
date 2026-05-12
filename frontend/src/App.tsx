import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useEffect, useState } from 'react';
import { ClerkProvider, useAuth, useUser, AuthenticateWithRedirectCallback } from '@clerk/clerk-react';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import PostComposer from './pages/PostComposer';
import Settings from './pages/Settings';
import MyPosts from './pages/MyPosts';
import CalendarPage from './pages/CalendarPage';
import TimeGenerator from './pages/TimeGenerator';
import UsersPage from './pages/UsersPage';
import HealthPage from './pages/HealthPage';
import MediaLibrary from './pages/MediaLibrary';
import Layout from './components/Layout';
import PrivacyPage from './pages/PrivacyPage';
import TermsPage from './pages/TermsPage';
import LandingPage from './pages/LandingPage';

const DEV_BYPASS = !!localStorage.getItem('dev_bypass_token');

function AppRoutes() {
  const { isSignedIn, isLoaded } = useAuth();
  const { user } = useUser();
  const isDark = localStorage.getItem('theme') === 'dark';
  const [timedOut, setTimedOut] = useState(false);

  const effectivelySignedIn = isSignedIn || DEV_BYPASS;

  // Safety: if Clerk never loads in 6s, unblock the app
  useEffect(() => {
    const t = setTimeout(() => setTimedOut(true), 6000);
    return () => clearTimeout(t);
  }, []);

  // Sync Clerk user info to localStorage so existing Layout/pages read it
  useEffect(() => {
    if (DEV_BYPASS) {
      if (!localStorage.getItem('user')) {
        localStorage.setItem('user', JSON.stringify({
          id: 'dev-user', name: 'Dev User', email: 'dev@karktech.com', role: 'USER',
        }));
      }
      return;
    }
    if (user) {
      localStorage.setItem('user', JSON.stringify({
        id: user.id,
        name: user.fullName || user.firstName || '',
        email: user.primaryEmailAddress?.emailAddress || '',
        role: (user.publicMetadata as any)?.role || 'USER',
      }));
    } else if (isLoaded && !isSignedIn) {
      localStorage.removeItem('user');
    }
  }, [user, isLoaded, isSignedIn]);

  if (!isLoaded && !timedOut) {
    return (
      <div className={`fixed inset-0 flex flex-col items-center justify-center z-[9999] ${isDark ? 'bg-[#000000]' : 'bg-[#f4f7f6]'}`}>
        <img src="/Karkloading.gif.gif" alt="Loading KarkTech..." className="w-56 h-56 object-contain" />
        <div className="flex gap-1.5 mt-4">
          <div className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-bounce [animation-delay:-0.3s]"></div>
          <div className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-bounce [animation-delay:-0.15s]"></div>
          <div className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce"></div>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 3000,
          success: {
            icon: '✦',
            style: {
              background: '#15803d', color: '#ffffff', fontWeight: 700, fontSize: '13px',
              borderRadius: '999px', padding: '10px 20px',
              boxShadow: '0 8px 32px rgba(21,128,61,0.4)', maxWidth: '360px', letterSpacing: '0.01em',
            },
          },
          error: {
            icon: '✕',
            style: {
              background: '#dc2626', color: '#ffffff', fontWeight: 700, fontSize: '13px',
              borderRadius: '999px', padding: '10px 20px',
              boxShadow: '0 8px 32px rgba(220,38,38,0.4)', maxWidth: '360px', letterSpacing: '0.01em',
            },
          },
        }}
      />
      <Routes>
        <Route path="/login" element={!effectivelySignedIn ? <Login /> : <Navigate to="/" />} />
        <Route path="/register" element={!effectivelySignedIn ? <Register /> : <Navigate to="/" />} />
        <Route path="/landing" element={<LandingPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/sso-callback" element={<AuthenticateWithRedirectCallback />} />

        <Route path="/" element={effectivelySignedIn ? <Layout /> : <Navigate to="/landing" />}>
          <Route index element={<Dashboard />} />
          <Route path="compose" element={<PostComposer />} />
          <Route path="settings" element={<Settings />} />
          <Route path="my-posts" element={<MyPosts />} />
          <Route path="calendar" element={<CalendarPage />} />
          <Route path="time-generator" element={<TimeGenerator />} />
          <Route path="media" element={<MediaLibrary />} />
          <Route path="users" element={<UsersPage />} />
          <Route path="health" element={<HealthPage />} />
        </Route>
      </Routes>
    </Router>
  );
}

function App() {
  return (
    <ClerkProvider
      publishableKey={import.meta.env.VITE_CLERK_PUBLISHABLE_KEY}
      signInUrl="/login"
      signUpUrl="/register"
    >
      <AppRoutes />
    </ClerkProvider>
  );
}

export default App;
