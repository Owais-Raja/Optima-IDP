import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../store/useAuth.jsx';
import AdminHome from '../home/AdminHome';
import ManagerHome from '../home/ManagerHome';
import EmployeeHome from '../home/EmployeeHome';


// =================================================================================================
// Home Page Component
// -------------------------------------------------------------------------------------------------
// Landing page and role-based dashboard entry point.
// Renders:
// - Role-specific views (Admin/Manager/Employee) if authenticated.
// - Guest landing page for unauthenticated users.
// =================================================================================================

function Home() {
  const { user } = useAuth();

  // =================================================================================================
  // Authenticated View
  // -------------------------------------------------------------------------------------------------
  if (user) {
    if (user.role === 'admin') {
      return <AdminHome user={user} />;
    }
    if (user.role === 'manager') {
      return <ManagerHome user={user} />;
    }
    // Default to Employee Home
    return <EmployeeHome user={user} />;
  }

  // =================================================================================================
  // Guest View
  // -------------------------------------------------------------------------------------------------
  return (
    <div className="min-h-[85vh] flex flex-col items-center justify-center px-4 text-center">
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-[100px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-[100px]" />
      </div>

      <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 tracking-tight">
        Intelligent Growth.<br />
        <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
          Personalized.
        </span>
      </h1>

      <p className="text-xl text-slate-400 max-w-2xl mb-10 leading-relaxed">
        AI-driven skill gap analysis and personalized learning paths to bridge the gap between potential and performance.
      </p>

      <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
        <Link
          to="/login"
          className="px-8 py-4 bg-white text-slate-950 font-bold rounded-xl hover:bg-slate-200 transition-all transform hover:scale-105 shadow-lg shadow-white/10"
        >
          Sign In
        </Link>
        <Link
          to="/register"
          className="px-8 py-4 bg-slate-800 text-white font-bold rounded-xl border border-slate-700 hover:bg-slate-700 transition-all transform hover:scale-105"
        >
          Get Started
        </Link>
      </div>

      <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl w-full text-left">
        {/* Feature 1: Smart Recommendations */}
        <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800 backdrop-blur-sm hover:border-purple-500/50 transition-colors duration-300">
          <div className="h-10 w-10 rounded-lg bg-purple-500/20 flex items-center justify-center mb-4">
            <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">Smart Recommendations</h3>
          <p className="text-slate-400">Content-based filtering algorithms curate the best resources for your specific skill gaps.</p>
        </div>

        {/* Feature 2: Skill Gap Analysis */}
        <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800 backdrop-blur-sm hover:border-pink-500/50 transition-colors duration-300">
          <div className="h-10 w-10 rounded-lg bg-pink-500/20 flex items-center justify-center mb-4">
            <svg className="w-6 h-6 text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">Skill Gap Analysis</h3>
          <p className="text-slate-400">Automatically identify weaknesses from performance reviews and create targeted improvement plans.</p>
        </div>

        {/* Feature 3: Manager Tools */}
        <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800 backdrop-blur-sm hover:border-blue-500/50 transition-colors duration-300">
          <div className="h-10 w-10 rounded-lg bg-blue-500/20 flex items-center justify-center mb-4">
            <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">Manager Tools</h3>
          <p className="text-slate-400">Empower managers with team insights, IDP reviews, and streamlined performance reporting.</p>
        </div>
      </div>

      {/* User Personas Section */}
      <div className="mt-24 w-full max-w-6xl">
        <h2 className="text-3xl font-bold text-white mb-12">Built for Everyone</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

          {/* Employee Persona */}
          <div className="group relative p-8 rounded-3xl bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700 hover:border-purple-500/30 transition-all duration-300">
            <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
              <svg className="w-32 h-32 text-purple-500" fill="currentColor" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" /></svg>
            </div>
            <h3 className="text-2xl font-bold text-white mb-4">For Employees</h3>
            <ul className="space-y-3 text-slate-400">
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-purple-400"></span>
                <span>Track your skill progression over time</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-purple-400"></span>
                <span>Receive AI-curated learning resources</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-purple-400"></span>
                <span>Build a career-defining development plan</span>
              </li>
            </ul>
          </div>

          {/* Manager Persona */}
          <div className="group relative p-8 rounded-3xl bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700 hover:border-blue-500/30 transition-all duration-300">
            <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
              <svg className="w-32 h-32 text-blue-500" fill="currentColor" viewBox="0 0 24 24"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" /></svg>
            </div>
            <h3 className="text-2xl font-bold text-white mb-4">For Managers</h3>
            <ul className="space-y-3 text-slate-400">
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-400"></span>
                <span>Oversee team skill gaps and strengths</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-400"></span>
                <span>Conduct data-driven performance reviews</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-400"></span>
                <span>Align team growth with company goals</span>
              </li>
            </ul>
          </div>

        </div>
      </div>
    </div>
  );
}

export default Home;
