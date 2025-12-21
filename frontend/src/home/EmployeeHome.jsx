import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { WelcomeBanner, StatCard, ActivityFeedItem } from '../components/DashboardWidgets';
import { Target, Award, ArrowRight, Play, Calendar, Zap } from 'lucide-react';
import CreateIDPModal from '../components/IDP/CreateIDPModal';

// =================================================================================================
// Icon Helper Component
// -------------------------------------------------------------------------------------------------
// Simple SVG wrapper for consistent icon styling.
// @param {object} props - Component props.
// @param {string} props.className - Tailwind CSS classes.
// =================================================================================================
const ClockIcon = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

// =================================================================================================
// Employee Home Component
// -------------------------------------------------------------------------------------------------
// The main landing page for employees ("Command Center").
// Features:
// - Daily Quote & Focus.
// - Quick Stats Overview.
// - Active Course Resume.
// - Activity Feed.
// - Quick Actions (including IDP Creation).
//
// @param {object} props - Component props.
// @param {object} props.user - The authenticated user object.
// =================================================================================================
const EmployeeHome = ({ user }) => {
    // =================================================================================================
    // State Definitions
    // -------------------------------------------------------------------------------------------------
    const [metrics, setMetrics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isIDPModalOpen, setIsIDPModalOpen] = useState(false);
    // State definitions ends here

    // =================================================================================================
    // Effects & Data Fetching
    // -------------------------------------------------------------------------------------------------

    /**
     * Fetches the latest employee metrics from the backend.
     * memoized with useCallback to be used as a refresher callback.
     */
    const fetchMetrics = useCallback(async () => {
        try {
            const res = await api.get('/idp/metrics/employee');
            setMetrics(res.data);
        } catch (err) {
            console.error("Error fetching metrics:", err);
        } finally {
            setLoading(false);
        }
    }, []);

    // Initial fetch on mount or user change
    useEffect(() => {
        fetchMetrics();
    }, [user, fetchMetrics]);


    // =================================================================================================
    // Render
    // -------------------------------------------------------------------------------------------------
    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 p-6 sm:p-8 font-sans">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* ======================= Welcome Banner Component ======================= */}

                {/* 1. Hero / Welcome Section */}
                <WelcomeBanner user={user} role="employee" />

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Left Column: Main Content */}
                    <div className="lg:col-span-2 space-y-8">

                        {/* 2. Daily Focus / Quote */}
                        <div className="bg-gradient-to-r from-purple-900/40 to-blue-900/40 border border-purple-500/20 rounded-2xl p-6 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-10">
                                <Zap className="w-24 h-24 text-yellow-400" />
                            </div>
                            <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                                <Zap className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                                Daily Focus
                            </h2>
                            <blockquote className="text-lg text-slate-300 italic mb-4 max-w-lg">
                                "{metrics?.dailyQuote?.text || "The only way to do great work is to love what you do."}"
                            </blockquote>
                            <p className="text-sm text-slate-500">- {metrics?.dailyQuote?.author || "Steve Jobs"}</p>
                        </div>

                        {/* 3. Quick Stats Row */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <StatCard
                                label="Hours Learned"
                                value={metrics?.hoursLearned || "0"}
                                icon={ClockIcon}
                                color="blue"
                                trend={15}
                                subtext="Total time"
                            />
                            <StatCard
                                label="Active Goals"
                                value={metrics?.inProgressIDPs || "0"}
                                icon={Target}
                                color="purple"
                                subtext="Skills in progress"
                            />
                            <StatCard
                                label="Achievements"
                                value={metrics?.completedIDPs || "0"}
                                icon={Award}
                                color="amber"
                                subtext="Completed Goals"
                            />
                        </div>

                        {/* 4. Continue Learning (Quick Actions) */}
                        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                            <div className="flex justify-between items-end mb-6">
                                <div>
                                    <h3 className="text-xl font-bold text-white mb-1">Continue Learning</h3>
                                    <p className="text-sm text-slate-400">Pick up where you left off</p>
                                </div>
                                <Link to="/dashboard" className="text-sm text-purple-400 hover:text-white transition-colors flex items-center gap-1">
                                    View Dashboard <ArrowRight className="w-4 h-4" />
                                </Link>
                            </div>

                            {metrics?.currentFocus ? (
                                <div
                                    onClick={() => metrics.currentFocus.url && window.open(metrics.currentFocus.url, '_blank')}
                                    className="group relative bg-slate-800/50 rounded-xl p-4 border border-slate-700 hover:border-purple-500/50 transition-all flex items-center gap-4 cursor-pointer"
                                >
                                    <div className="h-12 w-12 rounded-lg bg-blue-500/20 flex items-center justify-center shrink-0 text-blue-400">
                                        <Play className="w-6 h-6 fill-current" />
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-semibold text-white group-hover:text-purple-300 transition-colors">{metrics.currentFocus.title}</h4>
                                        <div className="flex items-center gap-2 mt-1">
                                            <p className="text-sm text-slate-400 capitalize">{metrics.currentFocus.type}</p>
                                            <span className="text-slate-600 text-xs">•</span>
                                            <div className="flex items-center gap-2 flex-1 max-w-[120px]">
                                                <div className="h-1.5 flex-1 bg-slate-700 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-blue-500 rounded-full"
                                                        style={{ width: `${metrics.currentFocus.progress || 0}%` }}
                                                    />
                                                </div>
                                                <span className="text-xs text-slate-400">{metrics.currentFocus.progress || 0}%</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right hidden sm:block">
                                        <span className="text-xs font-medium text-blue-400 bg-blue-400/10 px-2 py-1 rounded capitalize">{metrics.currentFocus.status.replace('_', ' ')}</span>
                                        <p className="text-xs text-slate-500 mt-1">{metrics.currentFocus.duration}</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-6 border border-dashed border-slate-800 rounded-xl">
                                    <p className="text-slate-500 text-sm">No active courses. Start a new goal!</p>
                                </div>
                            )}
                        </div>

                        {/* 5. Quick Actions (Now in Main Layout) */}
                        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                            <h3 className="text-lg font-bold text-white mb-4">Quick Actions</h3>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                {/* My Skills Link */}
                                <Link to="/profile?tab=skills" className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/20 hover:bg-purple-500/20 hover:border-purple-500/40 transition-all text-center group">
                                    <div className="mx-auto mb-3 w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform">
                                        <Award className="w-5 h-5" />
                                    </div>
                                    <span className="text-sm font-medium text-purple-200">My Skills</span>
                                </Link>

                                {/* New Goal Action */}
                                <button
                                    onClick={() => setIsIDPModalOpen(true)}
                                    className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 hover:bg-blue-500/20 hover:border-blue-500/40 transition-all text-center group w-full"
                                >
                                    <div className="mx-auto mb-3 w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">
                                        <Target className="w-5 h-5" />
                                    </div>
                                    <span className="text-sm font-medium text-blue-200">New Goal</span>
                                </button>

                                {/* View Dashboard Link (Added for balance) */}
                                <Link to="/dashboard" className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/20 hover:border-emerald-500/40 transition-all text-center group">
                                    <div className="mx-auto mb-3 w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
                                        <Target className="w-5 h-5" />
                                    </div>
                                    <span className="text-sm font-medium text-emerald-200">Dashboard</span>
                                </Link>
                            </div>
                        </div>

                    </div>

                    {/* Right Column: Sidebar */}
                    <div className="space-y-8 sticky top-8 h-fit">

                        {/* 5. Recent Kudos (Top of Sidebar) */}
                        {metrics?.recentKudos?.length > 0 && (
                            <div className="bg-gradient-to-br from-pink-900/10 to-purple-900/10 border border-purple-500/20 rounded-2xl p-6 relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-[40px] -z-10" />
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="p-2 bg-pink-500/20 rounded-lg">
                                        <Award className="w-5 h-5 text-pink-400" />
                                    </div>
                                    <h3 className="text-lg font-bold text-white">Recent Kudos</h3>
                                </div>
                                <div className="space-y-3">
                                    {metrics.recentKudos.map((kudos, idx) => (
                                        <div key={idx} className="bg-slate-950/40 p-3 rounded-xl border border-slate-800/50 flex items-start gap-3 hover:border-purple-500/30 transition-colors">
                                            <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-slate-300 shrink-0">
                                                {kudos.from?.name?.[0] || '?'}
                                            </div>
                                            <div>
                                                <p className="text-sm text-slate-300">
                                                    <span className="font-semibold text-white">{kudos.from?.name}</span> sent you <span className="text-pink-400 font-medium">{kudos.type}</span>
                                                </p>
                                                <p className="text-xs text-slate-500 mt-1">{new Date(kudos.createdAt).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* 6. Happening Now / Activity Feed */}
                        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                <Calendar className="w-5 h-5 text-slate-400" />
                                Happening Now
                            </h3>
                            <div className="space-y-1 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                                {metrics?.recentActivity?.length > 0 ? (
                                    metrics.recentActivity.map((activity, idx) => (
                                        <ActivityFeedItem
                                            key={idx}
                                            action={activity.action}
                                            date={activity.date}
                                            status={activity.status}
                                        />
                                    ))
                                ) : (
                                    <p className="text-sm text-slate-500">No recent activity.</p>
                                )}

                            </div>
                            <button className="w-full mt-6 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium transition-colors">
                                View All Activity
                            </button>
                        </div>



                    </div>
                </div>
            </div>

            {/* ======================= Modals ======================= */}
            <CreateIDPModal
                isOpen={isIDPModalOpen}
                onClose={() => setIsIDPModalOpen(false)}
                onCreated={() => {
                    // Refresh stats after creating a new goal
                    fetchMetrics();
                }}
            />
        </div>
    );
};

export default EmployeeHome;
