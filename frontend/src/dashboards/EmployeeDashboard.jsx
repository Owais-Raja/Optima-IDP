import React, { useEffect, useState } from 'react';
import api from '../services/api';
import QuickStats from '../components/QuickStats';
import { WelcomeBanner } from '../components/DashboardWidgets';
import Announcements from '../components/Announcements';
import JoinTeam from '../components/JoinTeam';
import { Link, useLocation } from 'react-router-dom';
import { Clock, BookOpen, ArrowRight, Calendar, CheckCircle, AlertCircle, TrendingUp } from 'lucide-react';

import { useAuth } from '../store/useAuth';
import CreateIDPModal from '../components/IDP/CreateIDPModal';


// =================================================================================================
// Employee Dashboard Component
// -------------------------------------------------------------------------------------------------
// Main interface for employees.
// Features:
// - IDP Management (Active & History).
// - Recommended Resources.
// - Announcements & Deadlines.
// - Join Team functionality.
// =================================================================================================

const EmployeeDashboard = ({ user, isCreateModalOpen, setIsCreateModalOpen }) => {
    // =================================================================================================
    // State Definitions
    // -------------------------------------------------------------------------------------------------
    const { refreshUser } = useAuth();
    const [metrics, setMetrics] = useState(null);
    const [activeIDPs, setActiveIDPs] = useState([]);
    const [recommendations, setRecommendations] = useState([]);
    const [deadlines, setDeadlines] = useState([]);
    const [announcements, setAnnouncements] = useState([]);
    const [checkins, setCheckins] = useState([]);
    const [hasManager, setHasManager] = useState(!!user?.manager);
    const [loading, setLoading] = useState(true);
    const [showAllRecommendations, setShowAllRecommendations] = useState(false);
    const [showAllHistory, setShowAllHistory] = useState(false);

    useEffect(() => {
        setHasManager(!!user?.manager);
    }, [user]);
    // State Definitions ends here

    // =================================================================================================
    // Data Fetching
    // -------------------------------------------------------------------------------------------------
    // Fetches IDPs, metrics, recommendations, deadlines, and check-ins.
    const fetchData = async () => {
        try {
            // Refresh user profile to ensure permissions/team status are up to date
            refreshUser();

            const [metricsRes, idpRes, recRes, deadlineRes, annRes, checkinRes] = await Promise.all([
                api.get('/idp/metrics/employee'),
                api.get('/idp/my-idps'),
                api.post('/recommend/resources', { user_skills: [] }),
                api.get('/emp-dashboard/deadlines'),
                api.get('/announcements'),
                api.get('/manager/checkins')
            ]);
            setMetrics(metricsRes.data);
            setActiveIDPs(idpRes.data.idps.filter(idp => ['draft', 'pending', 'approved', 'processing', 'needs_revision', 'rejected', 'completed', 'pending_completion'].includes(idp.status)));
            setRecommendations(recRes.data.recommendations || []);
            setDeadlines(deadlineRes.data.deadlines || []);
            setAnnouncements(annRes.data || []);
            setCheckins(checkinRes.data.checkins || []);
        } catch (err) {
            console.error("Employee fetch error", err);
        } finally {
            setLoading(false);
        }
    };
    // Data Fetching ends here

    // =================================================================================================
    // Helper Functions
    // -------------------------------------------------------------------------------------------------
    const getUniqueResources = (resources) => {
        if (!resources) return [];
        const uniqueMap = new Map();
        resources.forEach(r => {
            const id = r.resource?._id || r._id;
            if (!uniqueMap.has(id)) {
                uniqueMap.set(id, r);
            } else {
                // If existing is pending but new is completed, overwrite
                if (uniqueMap.get(id).status !== 'completed' && r.status === 'completed') {
                    uniqueMap.set(id, r);
                }
            }
        });
        return Array.from(uniqueMap.values());
    };

    const location = useLocation();

    useEffect(() => {
        fetchData();
    }, [location]);

    const refreshData = () => {
        setLoading(true);
        fetchData();
    };
    // Helper Functions ends here

    if (loading) return <div>Loading...</div>;

    return (
        <div className="space-y-8 fade-in">
            {/* ======================= Welcome Banner Component ======================= */}
            <WelcomeBanner user={user} role="employee" />

            {/* ======================= Quick Stats Component ======================= */}
            <QuickStats role="employee" metrics={metrics} />

            <div className="flex flex-col lg:flex-row gap-8">
                {/* ================================================================================================= */}
                {/* Main Content Area (Left - 66%) */}
                {/* Includes IDP Lists (Active & History) and Recommendations */}
                <div className="w-full lg:w-2/3 space-y-8">

                    {/* ======================= Join Team Component ======================= */}
                    <JoinTeam
                        manager={user?.manager}
                        pendingManager={user?.pendingManager}
                        onJoin={() => {
                            setHasManager(true);
                            window.location.reload();
                        }}
                    />

                    {/* Current Focus Section */}
                    {/* Shows active IDPs with progress bars and status */}
                    {(() => {
                        const getProgress = (idp) => {
                            const uniqueResources = getUniqueResources(idp.recommendedResources || []);
                            const completedCount = uniqueResources.filter(r => r.status === 'completed').length;
                            const totalCount = uniqueResources.length;
                            return totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
                        };

                        const isIDPCompleted = (idp) => {
                            // IDP is considered completed if effectively marked as such OR
                            // if it is approved and all actions are done (100% progress)
                            return idp.status === 'completed' || (idp.status === 'approved' && getProgress(idp) === 100);
                        };

                        const currentIDPs = activeIDPs.filter(idp => !isIDPCompleted(idp));
                        const pastIDPs = activeIDPs.filter(idp => isIDPCompleted(idp));

                        return (
                            <>
                                {/* Current Focus */}
                                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                                    <div className="flex justify-between items-center mb-6">
                                        <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                            <BookOpen className="w-5 h-5 text-purple-400" />
                                            Current Focus
                                        </h3>
                                        <button
                                            onClick={() => setIsCreateModalOpen(true)}
                                            className="text-sm bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-lg transition-colors shadow-lg shadow-purple-900/20"
                                        >
                                            Start New Plan
                                        </button>
                                    </div>
                                    {/* Active IDPs List */}
                                    <div className="grid grid-cols-1 gap-6">
                                        {currentIDPs.length > 0 ? (
                                            currentIDPs.map((idp) => {
                                                const uniqueResources = getUniqueResources(idp.recommendedResources || []);
                                                const completedCount = uniqueResources.filter(r => r.status === 'completed').length;
                                                const totalCount = uniqueResources.length;
                                                const progress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
                                                // Calculate remaining actions strictly
                                                const remainingActions = totalCount - completedCount;

                                                return (
                                                    <div key={idp._id} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden group hover:border-purple-500/50 transition-colors">
                                                        {/* Background Glow */}
                                                        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-600/5 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none"></div>

                                                        <div className="flex justify-between items-start mb-6">
                                                            <div>
                                                                <div className="flex items-center gap-3 mb-2">
                                                                    <h3 className="text-xl font-bold text-white">{idp.goals || 'Untitled Plan'}</h3>
                                                                    {/* Status Badge */}
                                                                    {/* Status Badge */}
                                                                    {(() => {
                                                                        let label = idp.status.replace('_', ' ');
                                                                        let style = 'bg-slate-800 border border-slate-700 text-slate-400';

                                                                        if (idp.status === 'needs_revision') {
                                                                            label = 'NEEDS REVISION';
                                                                            style = 'bg-amber-500/10 border border-amber-500/20 text-amber-400';
                                                                        } else if (idp.status === 'rejected') {
                                                                            label = 'REJECTED';
                                                                            style = 'bg-red-500/10 border border-red-500/20 text-red-400';
                                                                        } else if (['approved', 'pending_completion'].includes(idp.status)) {
                                                                            if (progress === 100) {
                                                                                label = 'PENDING APPROVAL';
                                                                                style = 'bg-amber-500/10 border border-amber-500/20 text-amber-400';
                                                                            } else {
                                                                                label = 'PENDING COMPLETION';
                                                                                style = 'bg-green-500/10 border border-green-500/20 text-green-400';
                                                                            }
                                                                        } else if (idp.status === 'completed') {
                                                                            style = 'bg-blue-500/10 border border-blue-500/20 text-blue-400';
                                                                        } else if (idp.status === 'approved') {
                                                                            style = 'bg-green-500/10 border border-green-500/20 text-green-400';
                                                                        }

                                                                        return (
                                                                            <span className={`px-2 py-1 text-[10px] font-bold uppercase rounded-md ${style}`}>
                                                                                {label}
                                                                            </span>
                                                                        );
                                                                    })()}
                                                                </div>
                                                                <div className="flex items-center gap-4 text-sm text-slate-400">
                                                                    <span className="flex items-center gap-1.5">
                                                                        <BookOpen className="w-4 h-4 text-purple-400" />
                                                                        {idp.skillsToImprove?.length || 0} Skills
                                                                    </span>
                                                                    <span className="flex items-center gap-1.5">
                                                                        <Clock className="w-4 h-4 text-blue-400" />
                                                                        {remainingActions} action items remaining
                                                                    </span>
                                                                </div>
                                                            </div>
                                                            {progress === 100 && (
                                                                <div className="bg-green-500/10 text-green-400 p-2 rounded-lg">
                                                                    <CheckCircle className="w-6 h-6" />
                                                                </div>
                                                            )}
                                                        </div>

                                                        <div className="space-y-4">
                                                            {/* Progress Bar */}
                                                            <div>
                                                                <div className="flex justify-between text-xs mb-2">
                                                                    <span className="text-slate-400 font-medium">Progress</span>
                                                                    <span className="text-white font-bold">{progress}%</span>
                                                                </div>
                                                                <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                                                                    <div
                                                                        className="h-full bg-gradient-to-r from-purple-600 to-blue-500 transition-all duration-1000 ease-out"
                                                                        style={{ width: `${progress}%` }}
                                                                    ></div>
                                                                </div>
                                                            </div>
                                                            <Link to={`/idp/${idp._id}`} className="text-purple-400 hover:text-white font-medium flex items-center gap-1 transition-colors">
                                                                Continue <ArrowRight className="w-3 h-3" />
                                                            </Link>
                                                        </div>
                                                    </div>
                                                )
                                            })
                                        ) : (
                                            <div className="text-center py-12 bg-slate-800/30 rounded-xl border border-dashed border-slate-700 relative overflow-hidden group">
                                                <div className="absolute inset-0 bg-purple-600/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                                <p className="text-slate-400 mb-6 relative z-10">
                                                    {activeIDPs.length > 0
                                                        ? "You have no active development plans at the moment."
                                                        : "You have no active development plans."}
                                                </p>
                                                <button
                                                    onClick={() => setIsCreateModalOpen(true)}
                                                    className="relative z-10 bg-slate-800 hover:bg-slate-700 border border-slate-600 text-purple-400 hover:text-purple-300 font-medium px-6 py-3 rounded-lg flex items-center justify-center gap-2 mx-auto transition-all shadow-lg shadow-black/20"
                                                >
                                                    {activeIDPs.length > 0 ? "Create New IDP" : "Create your first IDP"} <ArrowRight className="w-4 h-4" />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                {/* Current Focus Section ends here */}

                                {/* History / Completed IDPs Section */}
                                {pastIDPs.length > 0 && (
                                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                                        <div className="flex justify-between items-center mb-6">
                                            <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                                <CheckCircle className="w-5 h-5 text-green-400" />
                                                Completed Plans (History)
                                            </h3>
                                            {pastIDPs.length > 3 && (
                                                <button
                                                    onClick={() => setShowAllHistory(!showAllHistory)}
                                                    className="text-sm text-purple-400 hover:text-purple-300 font-medium transition-colors"
                                                >
                                                    {showAllHistory ? 'Show Less' : 'View All'}
                                                </button>
                                            )}
                                        </div>
                                        <div className="space-y-4">
                                            {pastIDPs.slice(0, showAllHistory ? pastIDPs.length : 3).map((idp) => (
                                                <div key={idp._id} className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 flex justify-between items-center opacity-75 hover:opacity-100 transition-opacity">
                                                    <div>
                                                        <h4 className="text-lg font-bold text-slate-300">{idp.goals}</h4>
                                                        <p className="text-sm text-green-400 flex items-center gap-1">
                                                            <CheckCircle className="w-3 h-3" /> Completed on {new Date(idp.updatedAt).toLocaleDateString()}
                                                        </p>
                                                    </div>
                                                    <Link to={`/idp/${idp._id}`} className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg text-sm hover:bg-slate-700 transition-colors">
                                                        View Details
                                                    </Link>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                {/* History / Completed IDPs Section ends here */}
                            </>
                        );
                    })()}

                    {/* Recommended for You (Moved to Left Column) */}
                    <div id="recommendations" className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                        <div className="flex flex-col gap-6">
                            <div className="flex justify-between items-center">
                                <h3 className="text-xl font-bold text-white">Recommended for You</h3>
                                {recommendations.length > 4 && (
                                    <button
                                        onClick={() => setShowAllRecommendations(!showAllRecommendations)}
                                        className="text-sm text-purple-400 hover:text-purple-300 font-medium transition-colors"
                                    >
                                        {showAllRecommendations ? 'Show Less' : 'View All'}
                                    </button>
                                )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {recommendations.length > 0 ? (
                                    recommendations.slice(0, showAllRecommendations ? recommendations.length : 4).map((item, idx) => (
                                        <div key={idx}
                                            onClick={() => item.url && window.open(item.url, '_blank')}
                                            className="p-4 rounded-xl bg-slate-800/40 border border-slate-800 hover:bg-slate-800 hover:border-slate-700 transition-all cursor-pointer group flex flex-col h-full"
                                        >
                                            <div className="flex justify-between items-start mb-2">
                                                <span className="text-xs font-bold text-purple-400 bg-purple-400/10 px-2 py-1 rounded uppercase tracking-wide">{item.type}</span>
                                                <span className="text-xs text-slate-500 font-medium">{item.duration || 'N/A'}</span>
                                            </div>
                                            <h4 className="text-base font-bold text-white group-hover:text-purple-300 transition-colors mb-2 line-clamp-2">{item.title}</h4>
                                            <p className="text-xs text-slate-500 mt-auto">By {item.provider || item.author || 'Optima AI'}</p>
                                        </div>
                                    ))
                                ) : (
                                    <div className="col-span-full text-center py-8 text-slate-500 bg-slate-800/30 rounded-xl border border-dashed border-slate-800">
                                        No recommendations available yet.
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
                {/* Main Content Area ends here */}

                {/* ================================================================================================= */}
                {/* Right Sidebar (Right - 33%) */}
                {/* Includes Announcements, Check-ins, and Deadlines */}
                <div className="w-full lg:w-1/3 space-y-8">

                    {/* ======================= Announcements Component ======================= */}
                    <Announcements
                        role="employee"
                        announcements={announcements}
                    />

                    {/* My Performance Shortcut */}
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-purple-600/10 rounded-full blur-2xl -mr-16 -mt-16 pointer-events-none"></div>
                        <div className="relative z-10">
                            <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                                <TrendingUp className="w-5 h-5 text-purple-400" />
                                My Performance
                            </h3>
                            <p className="text-sm text-slate-400 mb-4">View your performance reviews and feedback history.</p>
                            <Link
                                to="/my-performance"
                                className="inline-flex items-center gap-2 text-sm font-medium text-purple-400 hover:text-purple-300 transition-colors"
                            >
                                View Reviews <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>
                    </div>

                    {/* Upcoming Check-ins Widget */}
                    {/* Shows scheduled meetings with manager */}
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                        <div className="flex items-center gap-2 mb-4">
                            <Calendar className="w-5 h-5 text-amber-400" />
                            <h3 className="text-lg font-bold text-white">Upcoming Check-ins</h3>
                        </div>
                        <div className="space-y-4">
                            {checkins.length > 0 ? (
                                checkins.slice(0, 3).map((event, idx) => (
                                    <div key={idx} className="flex gap-3 p-3 rounded-xl bg-slate-950/40 border border-slate-800/50 hover:bg-slate-800 transition-colors cursor-default group">
                                        <div className="flex flex-col items-center justify-center w-10 h-10 rounded-lg bg-slate-900 border border-slate-700 text-slate-400 group-hover:border-amber-500/50 group-hover:text-amber-400 transition-colors">
                                            <span className="text-[10px] font-bold uppercase">{event.time ? event.time.split(',')[0].substring(0, 3) : 'Now'}</span>
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-semibold text-slate-200 group-hover:text-white transition-colors">{event.name}</h4>
                                            <p className="text-xs text-slate-500">{event.time}</p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-sm text-slate-500">No scheduled check-ins.</p>
                            )}
                        </div>
                    </div>



                    {/* Upcoming Deadlines Widget */}
                    {/* Shows upcoming due dates and urges */}
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                            <Calendar className="w-5 h-5 text-slate-400" />
                            Upcoming Deadlines
                        </h3>
                        <div className="space-y-4">
                            {deadlines.length > 0 ? (
                                deadlines.slice(0, 5).map((item, idx) => {
                                    const isAssignment = item.source === 'Assignment';
                                    const isUrgent = item.type === 'urgent';

                                    return (
                                        <div key={idx} className="flex items-start gap-3">
                                            <div className={`mt-0.5 w-2 h-2 rounded-full shrink-0 ${isAssignment ? 'bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.5)]' : (isUrgent ? 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]' : 'bg-blue-500')}`} />
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <h4 className="text-sm font-medium text-slate-200">{item.title}</h4>
                                                    {isAssignment && <span className="text-[10px] bg-purple-500/10 text-purple-400 px-1.5 py-0.5 rounded border border-purple-500/20 uppercase font-bold">Assigned</span>}
                                                </div>
                                                <p className={`text-xs mt-0.5 ${isUrgent || (isAssignment && item.type === 'urgent') ? 'text-rose-400 font-medium' : 'text-slate-500'}`}>
                                                    Due: {new Date(item.date).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <p className="text-sm text-slate-500">No upcoming deadlines.</p>
                            )}
                        </div>
                    </div>

                </div>
                {/* Right Sidebar ends here */}
            </div>


            <CreateIDPModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onCreated={refreshData}
            />
        </div >

    );
};

export default EmployeeDashboard;
