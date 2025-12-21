import React, { useState } from 'react';
import { UserPlus, Search, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import api from '../services/api';

// =================================================================================================
// Join Team Component
// -------------------------------------------------------------------------------------------------
// Allows an employee to request joining a manager's team by email.
// Displays current status if already in a team or pending approval.
// =================================================================================================

const JoinTeam = ({ onJoin, manager, pendingManager }) => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null);
    const [error, setError] = useState(null);

    const handleJoin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);
        setError(null);

        try {
            const res = await api.put('/user/join-team', { managerEmail: email });
            setMessage(res.data.message);
            if (onJoin) onJoin();
        } catch (err) {
            setError(err.response?.data?.message || "Failed to join team");
        } finally {
            setLoading(false);
        }
    };

    if (manager) {
        return (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-emerald-400" /> My Team
                </h3>
                <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
                    <p className="text-sm text-slate-400 mb-1">You are in</p>
                    <p className="text-white font-semibold text-lg">{manager.name}'s Team</p>
                    <p className="text-xs text-slate-500 mt-1">{manager.email}</p>
                </div>
            </div>
        );
    }

    if (pendingManager) {
        return (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-amber-400" /> Request Pending
                </h3>
                <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
                    <p className="text-sm text-slate-400 mb-1">Waiting for approval from</p>
                    <p className="text-white font-semibold text-lg">{pendingManager.name}</p>
                    <p className="text-xs text-slate-500 mt-1">{pendingManager.email}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-blue-400" /> Join a Team
            </h3>
            <p className="text-sm text-slate-400 mb-4">
                Connect with your manager to access team features and IDP reviews.
            </p>

            <form onSubmit={handleJoin} className="space-y-3">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                        type="email"
                        required
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg py-2.5 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
                        placeholder="Enter Manager's Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </div>

                {message && (
                    <div className="text-xs flex items-center gap-2 text-emerald-400 bg-emerald-500/10 p-2 rounded">
                        <CheckCircle className="w-3 h-3" /> {message}
                    </div>
                )}

                {error && (
                    <div className="text-xs flex items-center gap-2 text-red-400 bg-red-500/10 p-2 rounded">
                        <AlertCircle className="w-3 h-3" /> {error}
                    </div>
                )}

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium py-2 rounded-lg transition-colors disabled:opacity-50"
                >
                    {loading ? 'Joining...' : 'Send Request'}
                </button>
            </form>
        </div>
    );
};

export default JoinTeam;
