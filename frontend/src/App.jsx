import { Link, NavLink, Outlet, Route, Routes } from 'react-router-dom';
import { AuthProvider, useAuth } from './store/useAuth.jsx';
import Home from './pages/Home.jsx';
import Profile from './pages/Profile.jsx';
import Dashboard from './pages/Dashboard.jsx';
import ForgotPassword from './pages/ForgotPassword.jsx';
import ResetPassword from './pages/ResetPassword.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import IDPCreate from './pages/IDPCreate.jsx';
import AdminSettings from './pages/AdminSettings.jsx';
import ManagerSettings from './pages/ManagerSettings.jsx';
import ManagerSkills from './pages/ManagerSkills.jsx';
import ManagerResources from './pages/ManagerResources.jsx';
import ManagerPerformance from './pages/ManagerPerformance.jsx';
import ManagerAnalytics from './pages/ManagerAnalytics.jsx';
import EmployeePerformance from './pages/EmployeePerformance.jsx';
import IDPDetail from './pages/IDPDetail.jsx';
import ScrollToAnchor from './components/ScrollToAnchor.jsx';

// =================================================================================================
// App Shell Layout
// -------------------------------------------------------------------------------------------------
// Wraps the main application content with a persistent navigation bar and scroll management.
// - Handles conditional navigation rendering based on user role (Admin, Manager, User).
// - Manages authentication state display (Login/Register vs User Menu).
// =================================================================================================

function AppShell() {
  const { user } = useAuth(); // Get user state
  return (
    <div className="min-h-screen flex flex-col">
      {/* ======================= Scroll Anchor Component ======================= */}
      <ScrollToAnchor />

      {/* ================================================================================================= */}
      {/* Navigation Bar */}
      {/* Sticky top navbar containing logo and user navigation links */}
      <nav className="sticky top-0 z-50 bg-slate-800/90 backdrop-blur-lg border-b border-slate-700 shadow-lg">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent hover:scale-105 transition-transform">
              Optima IDP
            </Link>

            {/* Right Side Group */}
            <div className="flex items-center gap-8">
              {user ? (
                <>
                  <NavLink
                    to="/dashboard"
                    className={({ isActive }) =>
                      `text-sm font-medium transition-colors ${isActive
                        ? 'text-purple-400'
                        : 'text-slate-300 hover:text-white'
                      }`
                    }
                  >
                    Dashboard
                  </NavLink>

                  {user.role === 'admin' && (
                    <NavLink
                      to="/admin/settings"
                      className={({ isActive }) =>
                        `text-sm font-medium transition-colors ${isActive
                          ? 'text-purple-400'
                          : 'text-slate-300 hover:text-white'
                        }`
                      }
                    >
                      Settings
                    </NavLink>
                  )}

                  {user.role === 'manager' && (
                    <NavLink
                      to="/manager/settings"
                      className={({ isActive }) =>
                        `text-sm font-medium transition-colors ${isActive
                          ? 'text-purple-400'
                          : 'text-slate-300 hover:text-white'
                        }`
                      }
                    >
                      Settings
                    </NavLink>
                  )}

                  <NavLink
                    to="/profile"
                    className={({ isActive }) =>
                      `text-sm font-medium transition-colors ${isActive
                        ? 'text-purple-400'
                        : 'text-slate-300 hover:text-white'
                      }`
                    }
                  >
                    {user.name}
                  </NavLink>
                </>
              ) : (
                <div className="flex gap-4 items-center">
                  <Link to="/login" className="px-4 py-2 rounded-lg border border-slate-600 hover:border-slate-500 text-slate-300 hover:text-white transition-all text-sm font-medium">
                    Login
                  </Link>
                  <Link to="/register" className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-900/20 transition-all hover:scale-105 active:scale-95 text-sm font-medium">
                    Register
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>
      {/* Navigation Bar ends here */}
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
}

// ... imports ...

function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* ================================================================================================= */}
        {/* Main Route Definitions */}
        {/* ------------------------------------------------------------------------------------------------- */}
        {/* Defines all application routes, protected and public. */}
        <Route element={<AppShell />}>

          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* Protected Routes (Requires Login) */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/profile" element={<Profile />} />

            {/* Admin Routes */}
            <Route path="/admin/settings" element={<AdminSettings />} />

            {/* Manager Routes */}
            <Route path="/manager/settings" element={<ManagerSettings />} />
            <Route path="/manager/skills" element={<ManagerSkills />} />
            <Route path="/manager/resources" element={<ManagerResources />} />
            <Route path="/manager/performance" element={<ManagerPerformance />} />
            <Route path="/manager/analytics" element={<ManagerAnalytics />} />

            {/* IDP Routes */}
            <Route path="/idp/create" element={<IDPCreate />} />
            <Route path="/idp/:id" element={<IDPDetail />} />

            {/* Employee Routes */}
            <Route path="/my-performance" element={<EmployeePerformance />} />
          </Route>
        </Route>
        {/* Main Route Definitions ends here */}
      </Routes>
    </AuthProvider>
  );
}

export default App;

