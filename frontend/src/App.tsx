import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Analytics } from "@vercel/analytics/react"
import DarkModeToggle from './components/DarkModeToggle';
import LandingPage from './pages/LandingPage';
import CompanyPage from './pages/CompanyPage';
import SubmitExperiencePage from './pages/SubmitExperiencePage';
import SubmitDesignTeamExperiencePage from './pages/SubmitDesignTeamExperiencePage';
import AdminPage from './pages/AdminPage';
import DesignTeamDetailPage from './pages/DesignTeamDetailPage';
import './App.css';

function App() {
  return (
    <>
      <Router>
        <DarkModeToggle />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/company/:companyId" element={<CompanyPage />} />
          <Route path="/submit" element={<SubmitExperiencePage />} />
          <Route path="/submit-design-team" element={<SubmitDesignTeamExperiencePage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/design-teams/:teamId" element={<DesignTeamDetailPage />} />
        </Routes>
      </Router>
      <Analytics />
    </>
  );
}

export default App;
