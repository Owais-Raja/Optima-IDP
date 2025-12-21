import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../store/useAuth';
import { Bell, Users, FileText, ChevronRight, ToggleLeft, ToggleRight } from 'lucide-react';

// =================================================================================================
// Manager Settings Page
// -------------------------------------------------------------------------------------------------
// Configuration dashboard for Managers.
// Features:
// - Notification Preferences.
// - Team Configuration & Delegation.
// - Review Templates & Focus Skills.
// =================================================================================================

const ManagerSettings = () => {
    // =================================================================================================
    // State Definitions
    // -------------------------------------------------------------------------------------------------
    const { user } = useAuth();
    const [notifications, setNotifications] = useState({
        newIdp: true,
        reviewDeadlines: true,
        weeklySummary: true
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState(null);

    // Load initial settings from user profile
    useState(() => {
        if (user && user.preferences) {
            setNotifications({
                newIdp: user.preferences.notifyOnNewIdp ?? true,
                reviewDeadlines: user.preferences.notifyOnReviewDeadlines ?? true,
                weeklySummary: user.preferences.weeklyReports ?? true
            });
        }
        setLoading(false);
    }, [user]);

    const toggle = async (key) => {
        const newValue = !notifications[key];
        setNotifications(prev => ({ ...prev, [key]: newValue }));

        // Auto-save on toggle
        setSaving(true);
        setMessage(null);

        try {
            const preferences = {
                notifyOnNewIdp: key === 'newIdp' ? newValue : notifications.newIdp,
                notifyOnReviewDeadlines: key === 'reviewDeadlines' ? newValue : notifications.reviewDeadlines,
                weeklyReports: key === 'weeklySummary' ? newValue : notifications.weeklySummary
            };

            await api.put('/user/me', { preferences });
            setMessage({ type: 'success', text: 'Preferences saved' });
            setTimeout(() => setMessage(null), 2000);
        } catch (err) {
            console.error("Failed to save preference:", err);
            setMessage({ type: 'error', text: 'Failed to save setting' });
            // Revert state on error
            setNotifications(prev => ({ ...prev, [key]: !newValue }));
        } finally {
            setSaving(false);
        }
    };
    // State Definitions ends here

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 p-8">
            <div className="max-w-4xl mx-auto space-y-8">
                <div>
                    <h1 className="text-3xl font-bold font-display text-white mb-2">Manager Settings</h1>
                    <p className="text-slate-400">Configure your team management preferences and workflows.</p>
                </div>

                {message && (
                    <div className={`p-4 rounded-lg font-medium ${message.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'
                        }`}>
                        {message.text}
                    </div>
                )}

                <div className="grid gap-6">
                    {/* Notification Preferences */}
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="p-3 bg-purple-500/20 rounded-xl">
                                <Bell className="w-6 h-6 text-purple-400" />
                            </div>
                            <h2 className="text-xl font-bold">Notifications</h2>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-xl">
                                <div>
                                    <h3 className="font-semibold text-white">New IDP Submissions</h3>
                                    <p className="text-sm text-slate-400">Get notified when a team member submits an IDP for review</p>
                                </div>
                                <button
                                    onClick={() => toggle('newIdp')}
                                    disabled={saving}
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${notifications.newIdp ? 'bg-purple-600' : 'bg-slate-700'}`}
                                >
                                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${notifications.newIdp ? 'translate-x-6' : 'translate-x-1'}`} />
                                </button>
                            </div>

                            <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-xl">
                                <div>
                                    <h3 className="font-semibold text-white">Review Deadlines</h3>
                                    <p className="text-sm text-slate-400">Reminders for upcoming performance review cycles</p>
                                </div>
                                <button
                                    onClick={() => toggle('reviewDeadlines')}
                                    disabled={saving}
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${notifications.reviewDeadlines ? 'bg-purple-600' : 'bg-slate-700'}`}
                                >
                                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${notifications.reviewDeadlines ? 'translate-x-6' : 'translate-x-1'}`} />
                                </button>
                            </div>

                            <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-xl">
                                <div>
                                    <h3 className="font-semibold text-white">Weekly Summary</h3>
                                    <p className="text-sm text-slate-400">Receive a weekly digest of your team's progress</p>
                                </div>
                                <button
                                    onClick={() => toggle('weeklySummary')}
                                    disabled={saving}
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${notifications.weeklySummary ? 'bg-purple-600' : 'bg-slate-700'}`}
                                >
                                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${notifications.weeklySummary ? 'translate-x-6' : 'translate-x-1'}`} />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Team Configuration */}
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="p-3 bg-blue-500/20 rounded-xl">
                                <Users className="w-6 h-6 text-blue-400" />
                            </div>
                            <h2 className="text-xl font-bold">Team Configuration</h2>
                        </div>
                        <p className="text-slate-400 mb-4">Manage visibility and access levels for your direct reports.</p>
                        <Link to="/manager/organization" className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2 w-fit">
                            Manage Team Members <ChevronRight className="w-4 h-4" />
                        </Link>
                    </div>

                    {/* Templates */}
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="p-3 bg-pink-500/20 rounded-xl">
                                <FileText className="w-6 h-6 text-pink-400" />
                            </div>
                            <h2 className="text-xl font-bold">Review Templates</h2>
                        </div>
                        <p className="text-slate-400 mb-4">Create reusable templates for performance feedback and goals.</p>
                        <Link to="/manager/templates" className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2 w-fit">
                            View Templates <ChevronRight className="w-4 h-4" />
                        </Link>
                    </div>

                    {/* Focus Skills - Removed Delegation Section that was here */}

                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="p-3 bg-orange-500/20 rounded-xl">
                                <FileText className="w-6 h-6 text-orange-400" />
                            </div>
                            <h2 className="text-xl font-bold">Team Focus Skills</h2>
                        </div>
                        <p className="text-slate-400 mb-4">Define priority skills for your department to guide IDP creation.</p>
                        <Link to="/manager/skills" className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2 w-fit">
                            Manage Focus Skills <ChevronRight className="w-4 h-4" />
                        </Link>
                    </div>

                    {/* Team Resources */}
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="p-3 bg-cyan-500/20 rounded-xl">
                                <FileText className="w-6 h-6 text-cyan-400" />
                            </div>
                            <h2 className="text-xl font-bold">Team Resources</h2>
                        </div>
                        <p className="text-slate-400 mb-4">Curate learning resources specifically for your team members.</p>
                        <Link to="/manager/resources" className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2 w-fit">
                            Manage Resources <ChevronRight className="w-4 h-4" />
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ManagerSettings;
