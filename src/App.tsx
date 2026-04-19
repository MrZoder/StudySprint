import { BrowserRouter, Routes, Route } from 'react-router-dom';
import DashboardLayout from './layouts/DashboardLayout';
import Dashboard from './pages/Dashboard';
import Subjects from './pages/Subjects';
import Assignments from './pages/Assignments';
import Calendar from './pages/Calendar';
import AssignmentDetail from './pages/AssignmentDetail';
import Settings from './pages/Settings';
import Landing from './pages/Landing';
import AIPlanner from './pages/AIPlanner';
import { PlannerProvider } from './context/PlannerContext';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';

function App() {
  return (
    <ThemeProvider>
      <PlannerProvider>
        <ToastProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route element={<DashboardLayout />}>
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="subjects" element={<Subjects />} />
                <Route path="assignments" element={<Assignments />} />
                <Route path="assignments/:id" element={<AssignmentDetail />} />
                <Route path="ai-planner" element={<AIPlanner />} />
                <Route path="calendar" element={<Calendar />} />
                <Route path="settings" element={<Settings />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </ToastProvider>
      </PlannerProvider>
    </ThemeProvider>
  );
}

export default App;
