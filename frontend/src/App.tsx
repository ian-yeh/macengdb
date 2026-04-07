import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Analytics } from "@vercel/analytics/react"
import LandingPage from './pages/LandingPage';
import CompanyPage from './pages/CompanyPage';
import SubmitExperiencePage from './pages/SubmitExperiencePage';
import SubmitDesignTeamExperiencePage from './pages/SubmitDesignTeamExperiencePage';
import AdminPage from './admin/AdminPage';
import DesignTeamDetailPage from './pages/DesignTeamDetailPage';
import AboutPage from './pages/AboutPage';
import PrivacyPage from './pages/PrivacyPage';
import './App.css';

function App() {
  return (
    <>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/company/:companyId" element={<CompanyPage />} />
          <Route path="/submit" element={<SubmitExperiencePage />} />
          <Route path="/submit-design-team" element={<SubmitDesignTeamExperiencePage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/design-teams/:teamId" element={<DesignTeamDetailPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
        </Routes>
      </Router>
      <Analytics />
    </>
  );
}

export default App;
