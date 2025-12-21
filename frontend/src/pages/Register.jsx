import RegisterForm from '../components/RegisterForm';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import heroBg from '../assets/hero-bg.png';

// =================================================================================================
// Register Page Component
// -------------------------------------------------------------------------------------------------
// A premium, animated registration page with glassmorphism effects.
// =================================================================================================

function Register() {
    return (
        <div className="relative min-h-[calc(100vh-80px)] flex items-center justify-center px-4 overflow-hidden">

            {/* Background Effect */}
            <div className="absolute inset-0 z-0">
                <div className="absolute inset-0 bg-slate-950/90 z-10" />
                <img
                    src={heroBg}
                    alt="Background"
                    className="w-full h-full object-cover opacity-30 blur-sm"
                />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="relative z-20 w-full max-w-md"
            >
                <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-8 shadow-[0_0_50px_-10px_rgba(236,72,153,0.2)]">
                    <RegisterForm />
                    <div className="mt-8 pt-6 border-t border-slate-700/50 text-center text-sm text-slate-400">
                        Already have an account?{' '}
                        <Link to="/login" className="text-pink-400 font-medium hover:text-pink-300 transition-colors">
                            Sign in
                        </Link>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}

export default Register;
