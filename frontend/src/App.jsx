// src/App.jsx
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from '@/components/pages/auth/LoginPage';
import DashboardLayout from '@/components/layout/DashboardLayout';
import HomePage from '@/components/pages/dashboard/HomePage';
import TasksPage from '@/components/pages/dashboard/TaskPage';
import TeamPage from '@/components/pages/dashboard/TeamPage';

function App() {
  return (
    <Router>
      <Routes>
        {/* Rute untuk halaman Login */}
        <Route path="/login" element={<LoginPage />} />

        {/* Rute untuk Dashboard yang dilindungi oleh Layout */}
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<Navigate to="home" replace />} /> {/* Redirect /dashboard ke /dashboard/home */}
          <Route path="home" element={<HomePage />} />
          <Route path="tasks" element={<TasksPage />} />
          <Route path="team" element={<TeamPage />} />
        </Route>

        {/* Jika user membuka halaman root, redirect ke login */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;