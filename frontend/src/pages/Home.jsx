import { Link } from 'react-router-dom';
import { useAuth } from '../store/useAuth.jsx';
import AdminHome from '../home/AdminHome';
import ManagerHome from '../home/ManagerHome';
import EmployeeHome from '../home/EmployeeHome';
import { motion } from 'framer-motion';
import heroBg from '../assets/hero-bg.png';

// =================================================================================================
// Home Page Component (Enhanced)
// -------------------------------------------------------------------------------------------------
// A premium, animated landing page featuring:
// - Cinematic Hero Section with abstract AI imagery.
// - Staggered text reveals and smooth entrance animations.
// - Interactive feature cards with hover visuals.
// - Glassmorphism UI design.
// =================================================================================================

function Home() {
  const { user } = useAuth();

  // Redirect authenticated users to their specific dashboards
  if (user) {
    if (user.role === 'admin') return <AdminHome user={user} />;
    if (user.role === 'manager') return <ManagerHome user={user} />;
    return <EmployeeHome user={user} />;
  }

  // Animation Variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2, delayChildren: 0.3 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.2, 0.65, 0.3, 0.9] } }
  };

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.5 } },
    hover: {
      y: -10,
      scale: 1.02,
      boxShadow: "0 20px 40px -10px rgba(124, 58, 237, 0.3)",
      borderColor: "rgba(167, 139, 250, 0.5)"
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white selection:bg-purple-500/30 overflow-x-hidden">

      {/* =================================================================================================
          HERO SECTION
      ================================================================================================= */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-4 overflow-hidden">

        {/* Background Layer */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950/80 via-slate-950/90 to-slate-950 z-10" />
          <motion.img
            initial={{ scale: 1.1, opacity: 0 }}
            animate={{ scale: 1, opacity: 0.6 }}
            transition={{ duration: 2.5, ease: "easeOut" }}
            src={heroBg}
            alt="Abstract Intelligent Growth"
            className="w-full h-full object-cover opacity-60"
          />
        </div>

        {/* Content Layer */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="relative z-20 text-center max-w-5xl mx-auto"
        >
          {/* Badge */}
          <motion.div variants={itemVariants} className="mb-6 inline-block">
            <span className="px-4 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-sm font-medium tracking-wide backdrop-blur-md">
              AI-POWERED WORKFORCE DEVELOPMENT
            </span>
          </motion.div>

          <motion.h1
            variants={itemVariants}
            className="text-6xl md:text-8xl font-bold tracking-tight mb-8 leading-tight"
          >
            Intelligent Growth. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 animate-gradient-x">
              Personalized.
            </span>
          </motion.h1>

          <motion.p
            variants={itemVariants}
            className="text-xl md:text-2xl text-slate-300 max-w-3xl mx-auto mb-12 leading-relaxed"
          >
            Bridge the gap between potential and performance with AI-driven skill analysis and adaptive learning paths tailored to your unique career DNA.
          </motion.p>

          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link to="/login">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-10 py-5 bg-white text-slate-950 font-bold rounded-2xl hover:bg-slate-100 transition-colors shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)]"
              >
                Sign In
              </motion.button>
            </Link>
            <Link to="/register">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-10 py-5 bg-slate-800/50 backdrop-blur-md text-white font-bold rounded-2xl border border-slate-700 hover:bg-slate-800 transition-colors"
              >
                Get Started
              </motion.button>
            </Link>
          </motion.div>
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, y: [0, 10, 0] }}
          transition={{ delay: 2, duration: 2, repeat: Infinity }}
          className="absolute bottom-10 z-20 text-slate-500"
        >
          <div className="w-6 h-10 border-2 border-slate-600 rounded-full flex justify-center p-1">
            <div className="w-1 h-2 bg-slate-400 rounded-full" />
          </div>
        </motion.div>
      </section>

      {/* =================================================================================================
          FEATURES SECTION
      ================================================================================================= */}
      <section className="py-32 px-4 relative z-10 bg-slate-950">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-20"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">Why Optima IDP?</h2>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto">
              Our platform orchestrates the perfect synergy between employee aspirations and organizational goals.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <motion.div
              variants={cardVariants}
              initial="hidden"
              whileInView="visible"
              whileHover="hover"
              viewport={{ once: true, margin: "-100px" }}
              className="p-8 rounded-3xl bg-gradient-to-b from-slate-900 via-slate-900 to-slate-900/50 border border-slate-800 backdrop-blur-sm group"
            >
              <div className="h-14 w-14 rounded-2xl bg-purple-500/10 flex items-center justify-center mb-6 group-hover:bg-purple-500/20 transition-colors">
                <svg className="w-8 h-8 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Smart Recommendations</h3>
              <p className="text-slate-400 leading-relaxed">
                Proprietary content-based filtering algorithms analyze thousands of resources to curate the exact learning material needed to close your skill gaps.
              </p>
            </motion.div>

            {/* Feature 2 */}
            <motion.div
              variants={cardVariants}
              initial="hidden"
              whileInView="visible"
              whileHover="hover"
              viewport={{ once: true, margin: "-100px" }}
              transition={{ delay: 0.2 }}
              className="p-8 rounded-3xl bg-gradient-to-b from-slate-900 via-slate-900 to-slate-900/50 border border-slate-800 backdrop-blur-sm group"
            >
              <div className="h-14 w-14 rounded-2xl bg-pink-500/10 flex items-center justify-center mb-6 group-hover:bg-pink-500/20 transition-colors">
                <svg className="w-8 h-8 text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Skill Gap Analysis</h3>
              <p className="text-slate-400 leading-relaxed">
                Dynamic visualization of your current capabilities versus role requirements. We automatically identify weaknesses from performance reviews.
              </p>
            </motion.div>

            {/* Feature 3 */}
            <motion.div
              variants={cardVariants}
              initial="hidden"
              whileInView="visible"
              whileHover="hover"
              viewport={{ once: true, margin: "-100px" }}
              transition={{ delay: 0.4 }}
              className="p-8 rounded-3xl bg-gradient-to-b from-slate-900 via-slate-900 to-slate-900/50 border border-slate-800 backdrop-blur-sm group"
            >
              <div className="h-14 w-14 rounded-2xl bg-blue-500/10 flex items-center justify-center mb-6 group-hover:bg-blue-500/20 transition-colors">
                <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Manager Tools</h3>
              <p className="text-slate-400 leading-relaxed">
                Empower leadership with macro-level insights, approval workflows, and data-driven performance reporting for their entire team.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* =================================================================================================
          PERSONAS SECTION
      ================================================================================================= */}
      <section className="py-24 px-4 relative z-10 bg-slate-950 overflow-hidden">
        {/* Decorator */}
        <div className="absolute right-0 top-1/4 w-1/2 h-1/2 bg-purple-600/10 blur-[120px] rounded-full pointer-events-none" />

        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">

            {/* Employee Card */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="group relative p-10 rounded-[2.5rem] bg-slate-900 border border-slate-800 hover:border-purple-500/40 transition-colors overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:opacity-10 transition-opacity transform group-hover:scale-110 duration-700">
                <svg className="w-64 h-64 text-purple-500" fill="currentColor" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" /></svg>
              </div>
              <div className="relative z-10">
                <h3 className="text-3xl font-bold text-white mb-6">For Employees</h3>
                <ul className="space-y-4 text-lg text-slate-400">
                  {['Track skill progression over time', 'Receive AI-curated learning resources', 'Build a career-defining development plan'].map((item, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <span className="mt-2 w-1.5 h-1.5 rounded-full bg-purple-400 shrink-0 shadow-[0_0_10px_rgba(192,132,252,0.8)]"></span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-10">
                  <Link to="/login" className="text-purple-400 font-semibold hover:text-purple-300 flex items-center gap-2 group-hover:gap-4 transition-all">
                    View Employee Dashboard <span className="text-xl">→</span>
                  </Link>
                </div>
              </div>
            </motion.div>

            {/* Manager Card */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="group relative p-10 rounded-[2.5rem] bg-slate-900 border border-slate-800 hover:border-blue-500/40 transition-colors overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:opacity-10 transition-opacity transform group-hover:scale-110 duration-700">
                <svg className="w-64 h-64 text-blue-500" fill="currentColor" viewBox="0 0 24 24"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" /></svg>
              </div>
              <div className="relative z-10">
                <h3 className="text-3xl font-bold text-white mb-6">For Managers</h3>
                <ul className="space-y-4 text-lg text-slate-400">
                  {['Oversee team skill gaps and strengths', 'Conduct data-driven performance reviews', 'Align team growth with company goals'].map((item, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <span className="mt-2 w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0 shadow-[0_0_10px_rgba(96,165,250,0.8)]"></span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-10">
                  <Link to="/login" className="text-blue-400 font-semibold hover:text-blue-300 flex items-center gap-2 group-hover:gap-4 transition-all">
                    Access Manager Suite <span className="text-xl">→</span>
                  </Link>
                </div>
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 text-center text-slate-600 text-sm border-t border-slate-900 bg-slate-950">
        <p>&copy; 2024 Optima IDP. All rights reserved. <br />Intelligent Growth Platform.</p>
      </footer>
    </div>
  );
}

export default Home;
