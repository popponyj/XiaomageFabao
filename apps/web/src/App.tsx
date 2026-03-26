import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import DashboardPage from './pages/DashboardPage';
import AppsPage from './pages/AppsPage';
import ReleasesPage from './pages/ReleasesPage';

function App() {
  return (
    <Router>
      <div className="flex min-h-screen bg-gray-100">
        <Sidebar />
        <main className="flex-1 ml-64">
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/apps" element={<AppsPage />} />
            <Route path="/releases" element={<ReleasesPage />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
