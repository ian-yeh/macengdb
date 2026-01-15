import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import './App.css';
import CompanyPage from './pages/CompanyPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/company/:companyId" element={<CompanyPage />} />
      </Routes>
    </Router>
  );
}

export default App;
