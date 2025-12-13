import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import QuickStats from '../../common/components/QuickStats';
import { WelcomeBanner } from '../../common/components/DashboardWidgets';
import Announcements from '../../common/components/Announcements';
import JoinTeam from './JoinTeam';
import { Link } from 'react-router-dom';
import { Clock, BookOpen, ArrowRight, Calendar, CheckCircle, AlertCircle } from 'lucide-react';

const EmployeeDashboard = ({ user }) => {
    const [metrics, setMetrics] = useState(null);
    const [activeIDPs, setActiveIDPs] = useState([]);
    const [recommendations, setRecommendations] = useState([]);
    const [deadlines, setDeadlines] = useState([]);
    const [announcements, setAnnouncements] = useState([]);
    const [hasManager, setHasManager] = useState(!!user?.manager);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setHasManager(!!user?.manager);
    }, [user]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [metricsRes, idpRes, recRes, deadlineRes, annRes] = await Promise.all([
                    api.get('/idp/metrics/employee'),
                    api.get('/idp/my-idps'),
                    api.post('/recommend/resources', { user_skills: [] }), // Get general recommendations if no specific skills sent
                    api.get('/emp-dashboard/deadlines'),
                    api.get('/announcements')
                ]);
                setMetrics(metricsRes.data);
                setActiveIDPs(idpRes.data.idps.filter(idp => ['draft', 'pending', 'approved', 'processing'].includes(idp.status)));
                setRecommendations(recRes.data.recommendations || []);
                setDeadlines(deadlineRes.data.deadlines || []);
                setAnnouncements(annRes.data || []);
            } catch (err) {
                console.error("Employee fetch error", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) return <div>Loading...</div>;

    return (
        <div className="space-y-8 fade-in">
            {/* We could use a more specific banner here, or the generic one. Let's stick to generic for consistency but maybe pass a specific subtext if supported, or just leave as is. */}
            <WelcomeBanner user={user} role="employee" />

            <QuickStats role="employee" metrics={metrics} />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content Area */}
                <div className="lg:col-span-2 space-y-8">

                    <JoinTeam
                        manager={user?.manager}
                        onJoin={() => {
                            setHasManager(true);
                            window.location.reload();
                        }}
                    />

                    {/* Active IDPs / Learning Progress */}
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                <BookOpen className="w-5 h-5 text-purple-400" />
                                Current Focus
                            </h3>
                            <Link to="/idp/create" className="text-sm bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-lg transition-colors shadow-lg shadow-purple-900/20">
                                Start New Plan
                            </Link>
                        </div>

                        {activeIDPs.length > 0 ? (
                            <div className="space-y-4">
                                {activeIDPs.map(idp => (
                                    <div key={idp._id} className="p-5 bg-slate-800/50 border border-slate-700 rounded-xl hover:border-purple-500/30 transition-all group">
                                        <div className="flex justify-between mb-3">
                                            <span className="font-semibold text-white text-lg group-hover:text-purple-300 transition-colors">{idp.goals}</span>
                                            <span className={`text-xs px-2.5 py-1 rounded-full font-medium uppercase tracking-wide ${idp.status === 'approved' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                                                idp.status === 'pending' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                                                    'bg-slate-700 text-slate-300'
                                                }`}>{idp.status}</span>
                                        </div>

                                        {/* Progress Bar */}
                                        <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden mb-3 border border-slate-800">
                                            <div
                                                className="bg-gradient-to-r from-purple-500 to-blue-500 h-full relative overflow-hidden transition-all duration-500"
                                                style={{ width: `${idp.recommendedResources.length > 0 ? (idp.recommendedResources.filter(r => r.status === 'completed').length / idp.recommendedResources.length) * 100 : 0}%` }}
                                            >
                                                <div className="absolute inset-0 bg-white/20 animate-[shimmer_2s_infinite]"></div>
                                            </div>
                                        </div>

                                        <div className="flex justify-between items-center text-xs text-slate-400">
                                            <div className="flex gap-4">
                                                <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> Updated {new Date(idp.updatedAt).toLocaleDateString()}</span>
                                                <span>•</span>
                                                <span>{idp.recommendedResources.length - idp.recommendedResources.filter(r => r.status === 'completed').length} action items remaining</span>
                                            </div>
                                            <Link to={`/idp/${idp._id}`} className="text-purple-400 hover:text-white font-medium flex items-center gap-1 transition-colors">
                                                Continue <ArrowRight className="w-3 h-3" />
                                            </Link>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12 bg-slate-800/30 rounded-xl border border-dashed border-slate-700 relative overflow-hidden group">
                                <div className="absolute inset-0 bg-purple-600/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                <p className="text-slate-400 mb-4 relative z-10">You have no active development plans.</p>
                                <Link to="/idp/create" className="relative z-10 text-purple-400 hover:text-purple-300 font-medium flex items-center justify-center gap-2">
                                    Create your first IDP <ArrowRight className="w-4 h-4" />
                                </Link>
                            </div>
                        )}
                    </div>



                </div>

                {/* Right Sidebar */}
                <div className="lg:col-span-1 space-y-8">

                    {/* Announcements Widget */}
                    <Announcements
                        role="employee"
                        announcements={announcements}
                    />

                    {/* Recommended for You */}
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                        <h3 className="text-lg font-bold text-white mb-4">Recommended for You</h3>
                        <div className="space-y-4">
                            {recommendations.length > 0 ? (
                                recommendations.slice(0, 3).map((item, idx) => (
                                    <div key={idx} className="p-3 rounded-lg bg-slate-800/40 border border-slate-800 hover:bg-slate-800 hover:border-slate-700 transition-all cursor-pointer group">
                                        <div className="flex justify-between items-start mb-1">
                                            <span className="text-xs font-semibold text-purple-400 bg-purple-400/10 px-1.5 py-0.5 rounded">{item.type}</span>
                                            <span className="text-xs text-slate-500">{item.duration || 'N/A'}</span>
                                        </div>
                                        <h4 className="text-sm font-semibold text-white group-hover:text-purple-300 transition-colors mb-1">{item.title}</h4>
                                        <p className="text-xs text-slate-500">By {item.author || 'Optima AI'}</p>
                                    </div>
                                ))
                            ) : (
                                <p className="text-sm text-slate-500">No recommendations available.</p>
                            )}
                        </div>
                        <button className="w-full mt-4 py-2 text-xs text-slate-400 hover:text-white border border-slate-800 rounded-lg hover:bg-slate-800 transition-all">
                            View All Recommendation
                        </button>
                    </div>

                    {/* Upcoming Deadlines */}
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                            <Calendar className="w-5 h-5 text-slate-400" />
                            Upcoming Deadlines
                        </h3>
                        <div className="space-y-4">
                            {deadlines.length > 0 ? (
                                deadlines.slice(0, 5).map((item, idx) => (
                                    <div key={idx} className="flex items-start gap-3">
                                        <div className={`mt-0.5 w-2 h-2 rounded-full shrink-0 ${item.type === 'urgent' ? 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]' : 'bg-blue-500'}`} />
                                        <div>
                                            <h4 className="text-sm font-medium text-slate-200">{item.title}</h4>
                                            <p className={`text-xs mt-0.5 ${item.type === 'urgent' ? 'text-rose-400 font-medium' : 'text-slate-500'}`}>
                                                Due: {new Date(item.date).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-sm text-slate-500">No upcoming deadlines.</p>
                            )}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default EmployeeDashboard;
