import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import {
    Users,
    Calendar,
    Award,
    Target,
    ArrowRight,
    Sparkles,
    TrendingUp,
    Clock,
    CheckCircle2
} from 'lucide-react';

const ManagerHome = ({ user }) => {
    const [stats, setStats] = useState({ trendingSkills: [], departmentGoals: {} });
    const [checkins, setCheckins] = useState([]);
    const [team, setTeam] = useState([]); // Needed for Kudos receiver selection
    const [loading, setLoading] = useState(true);

    const [kudosSent, setKudosSent] = useState(false);
    const [kudosData, setKudosData] = useState({
        toUserId: '',
        type: 'High Impact' // Default type
    });

    useEffect(() => {
        const fetchManagerData = async () => {
            try {
                setLoading(true);
                const [statsRes, checkinsRes, teamRes] = await Promise.all([
                    api.get('/manager/stats'),
                    api.get('/manager/checkins'),
                    api.get('/user/my-team')
                ]);

                setStats(statsRes.data);
                setCheckins(checkinsRes.data.checkins);
                setTeam(teamRes.data.team);
            } catch (err) {
                console.error("Failed to load manager dashboard data", err);
            } finally {
                setLoading(false);
            }
        };

        fetchManagerData();
    }, []);

    const handleKudosChange = (e) => {
        setKudosData({ ...kudosData, [e.target.name]: e.target.value });
    };

    const handleSendKudos = async (e) => {
        e.preventDefault();
        if (!kudosData.toUserId) return;

        try {
            await api.post('/manager/kudos', {
                toUserId: kudosData.toUserId,
                type: kudosData.type,
                message: "Great work!" // Optional: Add message field to UI later if needed
            });
            setKudosSent(true);
            setKudosData({ toUserId: '', type: 'High Impact' });
            setTimeout(() => setKudosSent(false), 3000);
        } catch (err) {
            console.error("Failed to send kudos", err);
        }
    };

    // Safe access to nested properties
    const trendingSkills = stats.trendingSkills || [];
    const departmentGoals = stats.departmentGoals || { target: 'N/A', achieved: 0, completed: 0, remaining: 0 };

    if (loading) return <div className="p-10 text-white">Loading Dashboard...</div>;

    return (
        <div className="min-h-[85vh] p-6 lg:p-10 fade-in">
            <div className="max-w-7xl mx-auto space-y-10">

                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                    <div>
                        <h1 className="text-4xl md:text-5xl font-bold text-white mb-2 font-display">
                            Good afternoon, <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">{user.name}</span>
                        </h1>
                        <p className="text-slate-400 text-lg">Here's what's happening with your team today.</p>
                    </div>
                    <Link to="/dashboard" className="group flex items-center gap-2 px-5 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-full text-slate-200 transition-all font-medium">
                        Go to Dashboard <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>

                {/* Bento Grid Layout */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6">

                    {/* 1. Department Goals (Wide Card) */}
                    <div className="md:col-span-8 bg-slate-900/60 border border-slate-800 rounded-3xl p-8 relative overflow-hidden group hover:border-blue-500/30 transition-all">
                        <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                            <Target className="w-32 h-32 text-blue-500" />
                        </div>
                        <div className="relative z-10">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2 bg-blue-500/20 rounded-lg">
                                    <Target className="w-6 h-6 text-blue-400" />
                                </div>
                                <h3 className="text-xl font-bold text-white">Department Goal</h3>
                            </div>

                            <div className="mb-6">
                                <div className="flex justify-between text-sm mb-2 text-slate-300">
                                    <span>Target: {departmentGoals.target}</span>
                                    <span className="font-bold text-blue-400">{departmentGoals.achieved}% Achieved</span>
                                </div>
                                <div className="h-3 w-full bg-slate-800 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-blue-600 to-cyan-400 rounded-full shadow-[0_0_15px_rgba(59,130,246,0.5)]"
                                        style={{ width: `${departmentGoals.achieved}%` }}
                                    ></div>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <div className="bg-slate-950/50 rounded-xl p-4 border border-slate-800/50 flex flex-col items-center min-w-[100px]">
                                    <span className="text-3xl font-bold text-white">{departmentGoals.completed}</span>
                                    <span className="text-xs text-slate-400">Completed</span>
                                </div>
                                <div className="bg-slate-950/50 rounded-xl p-4 border border-slate-800/50 flex flex-col items-center min-w-[100px]">
                                    <span className="text-3xl font-bold text-slate-500">{departmentGoals.remaining}</span>
                                    <span className="text-xs text-slate-400">Remaining</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 2. Upcoming Check-ins (Tall Card) */}
                    <div className="md:col-span-4 bg-slate-900/60 border border-slate-800 rounded-3xl p-6 hover:border-amber-500/30 transition-all">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-amber-500/20 rounded-lg">
                                <Calendar className="w-6 h-6 text-amber-400" />
                            </div>
                            <h3 className="text-lg font-bold text-white">Upcoming Check-ins</h3>
                        </div>

                        <div className="space-y-4">
                            {checkins.length > 0 ? (
                                checkins.map((event, idx) => (
                                    <div key={idx} className="flex gap-4 p-3 rounded-xl bg-slate-950/40 border border-slate-800/50 hover:bg-slate-800 transition-colors cursor-pointer group">
                                        <div className="flex flex-col items-center justify-center w-12 h-12 rounded-lg bg-slate-900 border border-slate-700 text-slate-400 group-hover:border-amber-500/50 group-hover:text-amber-400 transition-colors">
                                            <span className="text-xs font-bold uppercase">{event.time ? event.time.split(',')[0] : 'Upcoming'}</span>
                                            <Clock className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-slate-200 group-hover:text-white transition-colors">{event.name}</h4>
                                            <p className="text-sm text-slate-500">{event.type}</p>
                                            <p className="text-xs text-amber-500/80 mt-1">{event.time}</p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-sm text-slate-500">No scheduled check-ins.</p>
                            )}
                            <button className="w-full py-2 text-sm text-slate-500 hover:text-white transition-colors border border-dashed border-slate-800 rounded-lg hover:border-slate-600">
                                + Schedule New
                            </button>
                        </div>
                    </div>

                    {/* 3. Team Focus / Skill Trends (Medium Card) */}
                    <div className="md:col-span-5 bg-slate-900/60 border border-slate-800 rounded-3xl p-8 hover:border-purple-500/30 transition-all">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-purple-500/20 rounded-lg">
                                <TrendingUp className="w-6 h-6 text-purple-400" />
                            </div>
                            <h3 className="text-lg font-bold text-white">Team Skill Trends</h3>
                        </div>

                        <div className="flex flex-wrap gap-3">
                            {trendingSkills.length > 0 ? (
                                trendingSkills.map((skill, idx) => (
                                    <div key={idx} className="group relative p-4 bg-slate-950/50 border border-slate-800 rounded-2xl flex-1 min-w-[140px] hover:bg-purple-900/10 hover:border-purple-500/30 transition-all cursor-default">
                                        <div className="flex justify-between items-start mb-2">
                                            <span className="text-3xl font-bold text-slate-200">{skill.count}</span>
                                            <span className="text-xs font-bold text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded-full">{skill.growth || 'Stable'}</span>
                                        </div>
                                        <p className="font-medium text-slate-400 group-hover:text-purple-300 transition-colors">{skill.name}</p>
                                    </div>
                                ))
                            ) : (
                                <p className="text-slate-500 text-sm">No skill data available yet.</p>
                            )}
                        </div>
                    </div>

                    {/* 4. Quick Kudos (Interactive Card) */}
                    <div className="md:col-span-7 bg-gradient-to-br from-indigo-900/40 to-purple-900/40 border border-slate-800 rounded-3xl p-8 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-600/20 rounded-full blur-[80px] -z-10" />

                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-pink-500/20 rounded-lg">
                                    <Award className="w-6 h-6 text-pink-400" />
                                </div>
                                <h3 className="text-lg font-bold text-white">Quick Kudos</h3>
                            </div>
                            <div className="flex -space-x-3">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="w-8 h-8 rounded-full bg-slate-700 border-2 border-slate-900 flex items-center justify-center text-xs text-white">
                                        {String.fromCharCode(64 + i)}
                                    </div>
                                ))}
                                <div className="w-8 h-8 rounded-full bg-slate-800 border-2 border-slate-900 flex items-center justify-center text-xs text-slate-400">+5</div>
                            </div>
                        </div>

                        {kudosSent ? (
                            <div className="h-32 flex flex-col items-center justify-center text-center animate-in fade-in zoom-in duration-300">
                                <div className="w-12 h-12 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mb-3">
                                    <CheckCircle2 className="w-6 h-6" />
                                </div>
                                <h4 className="text-xl font-bold text-white">Kudos Sent!</h4>
                                <p className="text-slate-400">Keep the momentum going.</p>
                            </div>
                        ) : (
                            <form onSubmit={handleSendKudos} className="flex gap-4">
                                <div className="flex-1">
                                    <select
                                        name="toUserId"
                                        value={kudosData.toUserId}
                                        onChange={handleKudosChange}
                                        className="w-full bg-slate-950/50 border border-slate-700 text-slate-300 rounded-xl px-4 py-3 focus:outline-none focus:border-purple-500 mb-3"
                                        required
                                    >
                                        <option value="">Select team member...</option>
                                        {team.map(member => (
                                            <option key={member._id} value={member._id}>{member.name}</option>
                                        ))}
                                    </select>
                                    <div className="flex gap-2 flex-wrap">
                                        {['High Impact', 'Fast Learner', 'Team Player', 'Leadership', 'Innovation'].map(type => (
                                            <button
                                                key={type}
                                                type="button"
                                                onClick={() => setKudosData({ ...kudosData, type })}
                                                className={`px-3 py-1.5 rounded-lg text-xs border transition-all ${kudosData.type === type ? 'bg-purple-600 border-purple-500 text-white' : 'bg-slate-800 text-slate-300 border-slate-700 hover:border-purple-500'}`}
                                            >
                                                {type === 'High Impact' && '🏆 '}
                                                {type === 'Fast Learner' && '⚡ '}
                                                {type === 'Team Player' && '🤝 '}
                                                {type}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <button type="submit" className="bg-white text-slate-900 font-bold rounded-xl px-6 hover:bg-purple-50 transition-colors flex items-center gap-2 self-start h-[52px]">
                                    <Sparkles className="w-4 h-4" /> Send
                                </button>
                            </form>
                        )}
                    </div>

                </div>
            </div>
        </div>
    );
};

export default ManagerHome;
