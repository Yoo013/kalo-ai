import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';

import AppLayout from './components/layout/AppLayout';
import Dashboard from './pages/Dashboard';
import LiveCall from './pages/LiveCall';
import Calls from './pages/Calls';
import CallDetail from './pages/CallDetail';
import Team from './pages/Team';
import Scripts from './pages/Scripts';
import Objections from './pages/Objections';
import AIPrompts from './pages/AIPrompts';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';
import Roleplay from './pages/Roleplay';
import AdminPanel from './pages/AdminPanel';
import Discover from './pages/Discover';

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin, user } = useAuth();

  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-muted border-t-primary rounded-full animate-spin"></div>
          <span className="text-sm text-muted-foreground">Loading Kalo AI...</span>
        </div>
      </div>
    );
  }

  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      navigateToLogin();
      return null;
    }
  }

  return (
    <Routes>
      <Route element={<AppLayout user={user} />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/live-call" element={<LiveCall />} />
        <Route path="/calls" element={<Calls />} />
        <Route path="/calls/:id" element={<CallDetail />} />
        <Route path="/team" element={<Team />} />
        <Route path="/scripts" element={<Scripts />} />
        <Route path="/objections" element={<Objections />} />
        <Route path="/prompts" element={<AIPrompts />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/roleplay" element={<Roleplay />} />
        <Route path="/admin" element={<AdminPanel />} />
        <Route path="/discover" element={<Discover />} />
      </Route>
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <AuthenticatedApp />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App