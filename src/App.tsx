/**
 * Top-level application shell.
 * -----------------------------------------------------------------------------
 * Wires three concerns in a fixed order:
 *   1. Providers   — Theme, Planner state, Toast notifications. Wrapping order
 *                    matters: Theme is outermost (no deps), Toast innermost
 *                    (so any other provider can call showToast).
 *   2. Router      — BrowserRouter, sits inside providers so the planner
 *                    state survives navigation.
 *   3. Routes      — Public landing page at /, all authenticated app surfaces
 *                    nested under DashboardLayout (which provides the topbar,
 *                    sidebar, and main scroll area).
 *
 * `assignments/:id` is the only dynamic route — used by AssignmentDetail to
 * deep-link into a specific card.
 */
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
              {/* Public marketing page. */}
              <Route path="/" element={<Landing />} />
              {/* Authenticated app surfaces — share the dashboard chrome. */}
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
