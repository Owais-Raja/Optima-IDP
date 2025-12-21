import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, BarChart2, TrendingUp, Users } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import api from '../services/api';

const ManagerAnalytics = () => {
    const [metrics, setMetrics] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMetrics = async () => {
            try {
                const res = await api.get('/idp/metrics/team');
                setMetrics(res.data);
            } catch (err) {
                console.error("Failed to fetch analytics", err);
            } finally {
                setLoading(false);
            }
        };
        fetchMetrics();
    }, []);

    // Helper to get all unique skills across the team for the heatmap columns
    const getAllUniqueSkills = () => {
        if (!metrics?.skillMatrix) return [];
        const skills = new Set();
        metrics.skillMatrix.forEach(m => {
            m.skills.forEach(s => skills.add(s.name));
        });
        return Array.from(skills).sort();
    };

    const uniqueSkills = getAllUniqueSkills();

    // Helper to get color for skill level
    const getLevelColor = (level) => {
        if (level >= 4) return 'bg-emerald-500';
        if (level >= 3) return 'bg-emerald-500/60';
        if (level >= 2) return 'bg-emerald-500/30';
        if (level >= 1) return 'bg-emerald-500/10';
        return 'bg-slate-800'; // No skill
    };

    if (loading) return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">Loading Analytics...</div>;

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 p-8 fade-in">
            <div className="max-w-7xl mx-auto space-y-8">

                {/* Header */}
                <div>
                    <Link to="/dashboard" className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-4">
                        <ChevronLeft className="w-4 h-4" /> Back to Dashboard
                    </Link>
                    <h1 className="text-3xl font-bold font-display text-white">Team Analytics</h1>
                    <p className="text-slate-400 mt-2">Deep insights into team performance and skill growth.</p>
                </div>

                {/* Top Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <TrendingUp className="w-24 h-24 text-purple-500" />
                        </div>
                        <div className="text-slate-400 text-sm font-medium mb-1">Avg Team Skill</div>
                        <div className="text-4xl font-bold text-white">{metrics?.teamAvgSkill || 0}</div>
                        <div className="text-sm text-emerald-400 mt-2">Level 1-5 scale</div>
                    </div>

                    <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <Users className="w-24 h-24 text-blue-500" />
                        </div>
                        <div className="text-slate-400 text-sm font-medium mb-1">Team Size</div>
                        <div className="text-4xl font-bold text-white">{metrics?.totalReports || 0}</div>
                        <div className="text-sm text-slate-400 mt-2">Active Employees</div>
                    </div>

                    <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <BarChart2 className="w-24 h-24 text-emerald-500" />
                        </div>
                        <div className="text-slate-400 text-sm font-medium mb-1">Pending Approvals</div>
                        <div className="text-4xl font-bold text-white">{metrics?.pendingApprovals || 0}</div>
                        <div className="text-sm text-amber-400 mt-2">Requires attention</div>
                    </div>
                </div>

                {/* Charts Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                    {/* Goal Completion Trend */}
                    <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
                        <h3 className="text-xl font-bold text-white mb-6">Learning Velocity</h3>
                        <div className="h-80 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={metrics?.completionTrend || []}>
                                    <defs>
                                        <linearGradient id="colorCompletions" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                                    <XAxis dataKey="month" stroke="#94a3b8" />
                                    <YAxis stroke="#94a3b8" />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#f8fafc' }}
                                        itemStyle={{ color: '#c084fc' }}
                                    />
                                    <Area type="monotone" dataKey="completed" stroke="#8b5cf6" fillOpacity={1} fill="url(#colorCompletions)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Engagement / Leaderboard (Using Skill Matrix data directly for simple list) */}
                    <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
                        <h3 className="text-xl font-bold text-white mb-6">Top Learners</h3>
                        <div className="space-y-4">
                            {metrics?.skillMatrix?.slice(0, 5).map((member, idx) => (
                                <div key={idx} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-white font-bold">
                                            {member.name[0]}
                                        </div>
                                        <div>
                                            <div className="text-white font-medium">{member.name}</div>
                                            <div className="text-xs text-slate-400">{member.skills.length} Skills Verified</div>
                                        </div>
                                    </div>
                                    <div className="text-emerald-400 font-bold">
                                        Top 10%
                                    </div>
                                </div>
                            ))}
                            {(!metrics?.skillMatrix || metrics.skillMatrix.length === 0) && (
                                <div className="text-slate-500 text-center py-10">No data available</div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Skill Heatmap */}
                <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl overflow-hidden">
                    <h3 className="text-xl font-bold text-white mb-6">Team Skill Heatmap</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr>
                                    <th className="p-3 bg-slate-950 text-slate-400 font-medium border-b border-slate-800 min-w-[200px]">Employee</th>
                                    {uniqueSkills.map(skill => (
                                        <th key={skill} className="p-3 bg-slate-950 text-slate-400 font-medium border-b border-slate-800 text-center min-w-[100px]">
                                            {skill}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {metrics?.skillMatrix?.map(member => (
                                    <tr key={member.id} className="border-b border-slate-800 hover:bg-slate-800/30">
                                        <td className="p-3 font-medium text-white">{member.name}</td>
                                        {uniqueSkills.map(skillName => {
                                            const userSkill = member.skills.find(s => s.name === skillName);
                                            const level = userSkill ? userSkill.level : 0;
                                            return (
                                                <td key={skillName} className="p-2 text-center">
                                                    <div className={`w-8 h-8 rounded-md mx-auto flex items-center justify-center text-xs font-bold text-white ${getLevelColor(level)}`}>
                                                        {level > 0 ? level : '-'}
                                                    </div>
                                                </td>
                                            );
                                        })}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {uniqueSkills.length === 0 && (
                            <div className="text-slate-500 text-center py-12">No skill data found for heatmap</div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
};

export default ManagerAnalytics;
