import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import CompanyPage from './pages/CompanyPage';
import SubmitExperiencePage from './pages/SubmitExperiencePage';
import AdminPage from './pages/AdminPage';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/company/:companyId" element={<CompanyPage />} />
        <Route path="/submit" element={<SubmitExperiencePage />} />
        <Route path="/admin" element={<AdminPage />} />
      </Routes>
    </Router>
  );
}

export default App;
