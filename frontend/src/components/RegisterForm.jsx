import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../store/useAuth';

// =================================================================================================
// Register Form Component
// -------------------------------------------------------------------------------------------------
// Handles new user registration.
// Features:
// - Role selection (Employee, Manager, Admin).
// - Dynamic fields based on role (Company Name, Secret Key).
// - Auto-login upon successful registration (unless approval required).
// =================================================================================================

function RegisterForm() {
    // =================================================================================================
    // State Definitions
    // -------------------------------------------------------------------------------------------------
    const [name, setName] = useState('');
    const [company, setCompany] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [role, setRole] = useState('employee');
    const [adminSecret, setAdminSecret] = useState('');

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { login } = useAuth();
    // State Definitions ends here

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        if (password !== confirmPassword) {
            setError("Passwords don't match");
            return;
        }

        setLoading(true);

        try {
            const payload = { name, email, password, company, role };
            if (role === 'admin') {
                payload.adminSecret = adminSecret;
            }
            const res = await api.post('/auth/register', payload);

            if (res.data?.message && res.data.message.includes('approval')) {
                setError(res.data.message); // Using error state for visibility, or change to success state
                // Don't navigate away immediatedly so they can read it
                setTimeout(() => navigate('/login'), 5000);
            } else {
                // Auto-login for non-managers
                try {
                    const loginRes = await api.post('/auth/login', { email, password });
                    login(loginRes.data);
                    navigate('/'); // Go to Home
                } catch (loginErr) {
                    console.error("Auto-login failed:", loginErr);
                    navigate('/login'); // Fallback to login page
                }
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create account');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-5">
            <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-white mb-2">
                    {role === 'admin' ? 'Register New Company' : 'Join Your Team'}
                </h2>
                <p className="text-slate-400">
                    {role === 'admin'
                        ? 'Create a workspace for your organization'
                        : 'Create your account'}
                </p>
            </div>

            {error && (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                    {error}
                </div>
            )}

            <div className="grid grid-cols-3 gap-3 mb-6">
                {['employee', 'manager', 'admin'].map((r) => (
                    <button
                        key={r}
                        type="button"
                        onClick={() => setRole(r)}
                        className={`py-3 px-2 rounded-xl text-xs font-bold capitalize transition-all border ${role === r
                            ? 'bg-purple-600 border-purple-500 text-white shadow-lg shadow-purple-500/20 scale-[1.02]'
                            : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:text-white hover:border-slate-600'
                            }`}
                    >
                        {r === 'admin' ? 'I am an Admin' : r === 'manager' ? 'I am a Manager' : 'I am an Employee'}
                    </button>
                ))}
            </div>

            <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">
                    Full Name
                </label>
                <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all"
                    placeholder="Enter your full name"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">
                    {role === 'admin' ? 'Company Name (Create New)' : 'Company Name (Join Existing)'}
                </label>
                <input
                    type="text"
                    required
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all"
                    placeholder={role === 'admin' ? "Enter your company name" : "Enter the company you work for"}
                />
                {role !== 'admin' && (
                    <p className="text-xs text-slate-500 mt-1">Make sure this matches exactly what your admin set up.</p>
                )}
            </div>

            {role === 'admin' && (
                <div className="animate-in fade-in slide-in-from-top-2 duration-200">
                    <label className="block text-sm font-medium text-purple-400 mb-1.5">
                        Admin Secret Key
                    </label>
                    <input
                        type="password"
                        required={role === 'admin'}
                        value={adminSecret}
                        onChange={(e) => setAdminSecret(e.target.value)}
                        className="w-full px-4 py-3 bg-slate-800/50 border border-purple-500/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all"
                        placeholder="Enter secret key to verify admin status"
                    />
                    <p className="text-xs text-slate-500 mt-1">Required to creating a new organization.</p>
                </div>
            )}

            <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">
                    Email Address
                </label>
                <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all"
                    placeholder="Enter your email address"
                />
            </div>

            <div className="relative">
                <label className="block text-sm font-medium text-slate-300 mb-1.5">
                    Password
                </label>
                <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all pr-12"
                    placeholder="Enter your password"
                />
                <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-[2.2rem] text-slate-400 hover:text-white transition-colors"
                >
                    {showPassword ? (
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                        </svg>
                    ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                    )}
                </button>
            </div>

            <div className="relative">
                <label className="block text-sm font-medium text-slate-300 mb-1.5">
                    Confirm Password
                </label>
                <input
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all pr-12"
                    placeholder="Confirm your password"
                />
                <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-[2.2rem] text-slate-400 hover:text-white transition-colors"
                >
                    {showConfirmPassword ? (
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                        </svg>
                    ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                    )}
                </button>
            </div>

            <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold rounded-xl shadow-lg shadow-purple-500/20 transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
                {loading ? (
                    <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Creating {role === 'admin' ? 'Organization' : 'Account'}...
                    </span>
                ) : (
                    role === 'admin' ? 'Register New Company' : `Create ${role.charAt(0).toUpperCase() + role.slice(1)} Account`
                )}
            </button>
        </form>
    );
}

export default RegisterForm;
