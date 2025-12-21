import React, { useEffect, useState } from 'react';
import api from '../services/api';

// =================================================================================================
// Employee Overview Component
// -------------------------------------------------------------------------------------------------
// Displays a snapshot of the employee's progress.
// Features:
// - Total and In-Progress IDP counts.
// - Skill Growth Chart (visualizing level progression).
// - Recent Activity feed.
// =================================================================================================

const EmployeeOverview = ({ profile }) => {
    const [metrics, setMetrics] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMetrics = async () => {
            try {
                const res = await api.get('/idp/metrics/employee');
                setMetrics(res.data);
            } catch (err) {
                console.error("Failed to fetch employee metrics", err);
            } finally {
                setLoading(false);
            }
        };
        fetchMetrics();
    }, []);

    if (loading) return <div className="text-slate-400">Loading your progress...</div>;

    return (
        <div className="space-y-6">
            {/* Welcome Section */}
            <div className="bg-gradient-to-r from-purple-900/40 to-slate-900 border border-purple-500/20 rounded-xl p-6 relative overflow-hidden">
                <div className="relative z-10">
                    <h3 className="text-xl font-bold text-white mb-2">Welcome back, {profile.name}!</h3>
                    <p className="text-slate-300 max-w-2xl">
                        You have <span className="text-purple-400 font-semibold">{metrics?.inProgressIDPs || 0} active</span> development plans.
                        Keep pushing to reach your career goals!
                    </p>
                </div>
                <div className="absolute right-0 top-0 w-64 h-full bg-gradient-to-l from-purple-600/10 to-transparent pointer-events-none" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Stats Cards */}
                <div className="space-y-6">
                    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 hover:border-purple-500/30 transition-colors group">
                        <div className="flex items-center justify-between mb-4">
                            <h4 className="text-slate-400 text-sm font-medium group-hover:text-purple-300 transition-colors">Total IDPs</h4>
                            <div className="text-purple-500 bg-purple-500/10 p-2 rounded-lg">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                            </div>
                        </div>
                        <p className="text-3xl font-bold text-white group-hover:scale-105 transition-transform origin-left">{metrics?.totalIDPs || 0}</p>
                    </div>

                    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 hover:border-emerald-500/30 transition-colors group">
                        <div className="flex items-center justify-between mb-4">
                            <h4 className="text-slate-400 text-sm font-medium group-hover:text-emerald-300 transition-colors">Completed Goals</h4>
                            <div className="text-emerald-500 bg-emerald-500/10 p-2 rounded-lg">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                            </div>
                        </div>
                        <p className="text-3xl font-bold text-white group-hover:scale-105 transition-transform origin-left">{metrics?.completedIDPs || 0}</p>
                    </div>
                </div>

                {/* Skill Growth Chart (Custom Implementation) */}
                <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-6">
                    <h4 className="text-lg font-semibold text-white mb-6">Skill Growth Trajectory</h4>

                    {/* Simple Bar Chart Visualization */}
                    <div className="flex items-end justify-between h-48 gap-4 px-2">
                        {metrics?.skillGrowth?.map((item, index) => (
                            <div key={index} className="flex flex-col items-center gap-2 w-full group">
                                <div className="text-xs text-purple-300 opacity-0 group-hover:opacity-100 transition-opacity font-bold absolute -mt-6">
                                    Lvl {item.level}
                                </div>
                                <div
                                    className="w-full bg-gradient-to-t from-purple-900/50 to-purple-600 rounded-t-sm hover:from-purple-800 hover:to-purple-500 transition-all relative group-hover:shadow-[0_0_15px_rgba(168,85,247,0.4)]"
                                    style={{ height: `${(item.level / 10) * 100}%` }}
                                >
                                </div>
                                <span className="text-xs text-slate-400 font-medium">{item.month}</span>
                            </div>
                        ))}
                    </div>
                    <div className="mt-4 flex justify-between text-xs text-slate-500 border-t border-slate-800 pt-3">
                        <span>Based on IDP completion and assessments</span>
                        <span className="flex items-center gap-1">
                            <div className="w-2 h-2 rounded-full bg-purple-500"></div> Growth Trend
                        </span>
                    </div>
                </div>
            </div>

            {/* Recent Activity Timeline Placeholder */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                <h4 className="text-lg font-semibold text-white mb-4">Recent Activity</h4>
                <div className="space-y-4">
                    <div className="space-y-4">
                        {metrics?.recentActivity && metrics.recentActivity.length > 0 ? (
                            metrics.recentActivity.map((activity) => (
                                <div key={activity.id} className="flex gap-4 border-l-2 border-slate-800 pl-4 pb-2 relative">
                                    <div className={`absolute -left-[9px] top-0 w-4 h-4 rounded-full border-2 ${activity.status === 'completed' ? 'bg-emerald-900 border-emerald-500' :
                                        activity.status === 'approved' ? 'bg-purple-900 border-purple-500' :
                                            'bg-slate-900 border-slate-500'
                                        }`}></div>
                                    <div>
                                        <p className="text-sm text-slate-300">{activity.action}</p>
                                        <p className="text-xs text-slate-500">
                                            {new Date(activity.date).toLocaleDateString()} • <span className="capitalize">{activity.status}</span>
                                        </p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-slate-500 text-sm italic">No recent activity found.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EmployeeOverview;
