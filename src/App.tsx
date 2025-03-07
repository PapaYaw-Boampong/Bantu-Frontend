import { Routes, Route } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import { ThemeProvider } from '@/components/theme-provider';
import Welcome from '@/pages/Welcome';
import Dashboard from '@/pages/Dashboard';
import LetsTalk from '@/pages/LetsTalk';
import Listen from '@/pages/Listen';
import Auth from '@/pages/Auth';
import ModeSelection from '@/pages/ModeSelection';
import Translate from '@/pages/Translate';
import Profile from '@/pages/Profile';
import Contributions from '@/pages/Contributions';
import API from '@/pages/API';
import Docs from '@/pages/Docs';
import Events from '@/pages/Events';
import Layout from '@/components/Layout';

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
      <Routes>
        <Route path="/" element={<Welcome />} />
        <Route path="/auth" element={<Auth />} />
        
        {/* ✅ Assign `path="/*"` to Layout so nested routes work properly */}
        <Route path="/*" element={<Layout />}>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="lets-talk" element={<LetsTalk />} />
          <Route path="listen" element={<Listen />} />
          <Route path="modeselection" element={<ModeSelection />} />
          <Route path="translate" element={<Translate />} />
          <Route path="profile" element={<Profile />} />
          <Route path="contributions" element={<Contributions />} />
          <Route path="api" element={<API />} />
          <Route path="docs" element={<Docs />} />
          <Route path="events" element={<Events />} />
        </Route>
      </Routes>

      <Toaster />
    </ThemeProvider> 
  );
}

export default App;