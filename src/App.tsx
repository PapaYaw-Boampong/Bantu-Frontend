import { Routes, Route } from 'react-router-dom'; // Removed BrowserRouter
import { Toaster } from '@/components/ui/toaster';
import { ThemeProvider } from '@/components/common/theme-provider';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

import Welcome from '@/pages/Welcome';
import Auth from '@/pages/Auth';
import Layout from '@/components/common/Layout';
import { ProtectedRoute } from '@/components/ProtectedRoute';

// User pages
import Dashboard from '@/pages/user/dash/Dashboard';
import LetsTalk from '@/pages/user/collectionTools/Transcribe';
import Translation from '@/pages/user/validationTools/TranslationValidation';
import Transcription from '@/pages/user/validationTools/TranscriptionValidation';
import ModeSelection from '@/pages/user/collectionTools/ModeSelection';
import Translate from '@/pages/user/collectionTools/Translate';
import Profile from '@/pages/user/dash/Profile';
import Contributions from '@/pages/user/dash/ContributionsStats';
import API from '@/pages/user/API';
import Docs from '@/pages/user/Docs';
import Events from '@/pages/user/challenge/Events';
import Rewards from '@/pages/user/Rewards';
import Annotate from '@/pages/user/collectionTools/Annotate';
import Annotation from '@/pages/user/validationTools/ImageAnnotationValidation';
import PublicChallenges from '@/pages/user/challenge/challenges';
import MyChallenges from '@/pages/user/challenge/my-challenges';
import ChallengeDetail from '@/pages/user/challenge/[id]';
import CreateChallenge from '@/pages/user/challenge/create-challenge';
import UserWork from '@/pages/user/challenge/work';
import Sandbox from '@/pages/user/challenge/sandbox';
import ABTesting from '@/pages/user/validationTools/ABTestingPage';

// Admin pages
import AdminDashboard from '@/pages/admin/Dashboard';
import ChallengePage from '@/pages/admin/Challenge';
import ChallengeParticipants from '@/pages/admin/ChallengeParticipants';
import ModelsPage from '@/pages/admin/Models';
import SettingsPage from '@/pages/admin/Settings';
import UsersPage from '@/pages/admin/Users';
import AdminRewards from '@/pages/admin/Rewards';
import Challenge from '@/pages/admin/Challenge';
import Languages from '@/pages/admin/Languages';
import Users from '@/pages/admin/Users';
import CSVUpload from '@/pages/admin/CSVUpload';
// import ABTesting from './components/common/ABTesting';

// Initialize React Query
const queryClient = new QueryClient();

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
      <QueryClientProvider client={queryClient}>
        <Toaster />
        <Routes>
          {/* Public routes */}
          <Route path="/welcome" element={<Welcome />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/login" element={<Auth />} />

          {/* Protected routes with shared layout */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            {/* User routes */}
            <Route index element={<Dashboard />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="lets-talk" element={<LetsTalk />} />
            <Route path="annotate" element={<Annotate />} />
            <Route path="annotation" element={<Annotation />} />
            <Route path="transcription" element={<Transcription />} />
            <Route path="translation" element={<Translation />} />
            <Route path="modeselection" element={<ModeSelection />} />
            <Route path="translate" element={<Translate />} />
            <Route path="profile" element={<Profile />} />
            <Route path="contributions" element={<Contributions />} />
            <Route path="api" element={<API />} />
            <Route path="docs" element={<Docs />} />
            <Route path="events" element={<Events />} />
            <Route path="user/rewards" element={<Rewards />} />
            <Route path="user/challenges" element={<PublicChallenges />} />
            <Route path="user/my-challenges" element={<MyChallenges />} />
            <Route path="user/challenge/:id" element={<ChallengeDetail />} />
            <Route path="user/work" element={<UserWork />} />
            <Route path="user/create-challenge" element={<CreateChallenge />} />
            <Route path="user/sandbox" element={<Sandbox />} />
            <Route path="user/abtesting" element={<ABTesting />} />

            {/* Admin routes */}
            <Route path="admin/dashboard" element={<AdminDashboard />} />
            <Route path="admin/challenges" element={<ChallengePage />} />
            <Route path="admin/models" element={<ModelsPage />} />
            <Route path="admin/settings" element={<SettingsPage />} />
            <Route path="admin/users" element={<UsersPage />} />
            <Route path="admin/challengers" element={<ChallengeParticipants />} />
            <Route path="admin/challenge" element={<Challenge />} />
            <Route path="admin/rewards" element={<AdminRewards />} />
            <Route path="admin/languages" element={<Languages />} />
            <Route path="admin/csvupload" element={<CSVUpload />} />
            <Route path="admin/users" element={<Users />} />
          </Route>
        </Routes>

        {/* React Query Devtools (for debugging queries) */}
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
