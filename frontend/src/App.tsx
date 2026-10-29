import { BrowserRouter as Router, Routes, Route, Outlet } from 'react-router-dom';
import { Analytics } from "@vercel/analytics/react"
import LandingPage from './pages/LandingPage';
import MaintenancePage from './pages/MaintenancePage';
import CompanyPage from './pages/CompanyPage';
import SubmitPage from './pages/SubmitPage';
import AdminPage from './admin/AdminPage';
import DesignTeamDetailPage from './pages/DesignTeamDetailPage';
import AboutPage from './pages/AboutPage';
import PrivacyPage from './pages/PrivacyPage';
import FAQPage from './pages/FAQPage';
import TopBar from './components/layout/TopBar';
import Footer from './components/layout/Footer';

const MAINTENANCE = false;

function Shell() {
  return (
    <>
      <TopBar />
      <Outlet />
      <Footer />
    </>
  );
}

function App() {
  const enableVercelAnalytics =
    import.meta.env.PROD && import.meta.env.VITE_ENABLE_VERCEL_ANALYTICS === 'true';

  return (
    <>
      <Router>
        <Routes>
          <Route element={<Shell />}>
            <Route path="/" element={MAINTENANCE ? <MaintenancePage /> : <LandingPage />} />
            <Route path="/company/:companyId" element={<CompanyPage />} />
            <Route path="/submit" element={<SubmitPage key="job" initialKind="job" />} />
            <Route path="/submit-design-team" element={<SubmitPage key="team" initialKind="team" />} />
            <Route path="/design-teams/:teamId" element={<DesignTeamDetailPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/privacy" element={<PrivacyPage />} />
            <Route path="/faq" element={<FAQPage />} />
          </Route>
          <Route path="/admin" element={<AdminPage />} />
        </Routes>
      </Router>
      {enableVercelAnalytics && <Analytics />}
    </>
  );
}

export default App;
