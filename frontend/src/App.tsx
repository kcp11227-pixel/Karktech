import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
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
import KarkAI from './pages/KarkAI';
import AIImageGenerator from './pages/AIImageGenerator';
import ImageAI from './pages/ImageAI';

function AppRoutes() {
  const { isSignedIn } = useAuth();

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
        <Route path="/login" element={!isSignedIn ? <Login /> : <Navigate to="/" />} />
        <Route path="/register" element={!isSignedIn ? <Register /> : <Navigate to="/" />} />
        <Route path="/landing" element={<LandingPage />} />
        <Route path="/kark-ai" element={<KarkAI />} />
        <Route path="/image-ai" element={<ImageAI />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/terms" element={<TermsPage />} />

        <Route path="/" element={isSignedIn ? <Layout /> : <Navigate to="/landing" />}>
          <Route index element={<Dashboard />} />
          <Route path="compose" element={<PostComposer />} />
          <Route path="settings" element={<Settings />} />
          <Route path="my-posts" element={<MyPosts />} />
          <Route path="calendar" element={<CalendarPage />} />
          <Route path="time-generator" element={<TimeGenerator />} />
          <Route path="media" element={<MediaLibrary />} />
          <Route path="users" element={<UsersPage />} />
          <Route path="health" element={<HealthPage />} />
          <Route path="ai-image" element={<AIImageGenerator />} />
        </Route>
      </Routes>
    </Router>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}

export default App;
