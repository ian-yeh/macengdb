import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import CompanyPage from './pages/CompanyPage';
import SubmitExperiencePage from './pages/SubmitExperiencePage';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/company/:companyId" element={<CompanyPage />} />
        <Route path="/submit" element={<SubmitExperiencePage />} />
      </Routes>
    </Router>
  );
}

export default App;
