import React, { useState } from 'react';
import { useAuth } from '../../store/useAuth';
import { Bell, Users, FileText, ChevronRight, ToggleLeft, ToggleRight } from 'lucide-react';

const ManagerSettings = () => {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState({
        newIdp: true,
        reviewDeadlines: true,
        weeklySummary: false
    });

    const toggle = (key) => {
        setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
    };

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 p-8">
            <div className="max-w-4xl mx-auto space-y-8">
                <div>
                    <h1 className="text-3xl font-bold font-display text-white mb-2">Manager Settings</h1>
                    <p className="text-slate-400">Configure your team management preferences and workflows.</p>
                </div>

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
                                <button onClick={() => toggle('newIdp')} className="text-purple-400 focus:outline-none">
                                    {notifications.newIdp ? <ToggleRight className="w-8 h-8" /> : <ToggleLeft className="w-8 h-8 text-slate-600" />}
                                </button>
                            </div>

                            <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-xl">
                                <div>
                                    <h3 className="font-semibold text-white">Review Deadlines</h3>
                                    <p className="text-sm text-slate-400">Reminders for upcoming performance review cycles</p>
                                </div>
                                <button onClick={() => toggle('reviewDeadlines')} className="text-purple-400 focus:outline-none">
                                    {notifications.reviewDeadlines ? <ToggleRight className="w-8 h-8" /> : <ToggleLeft className="w-8 h-8 text-slate-600" />}
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
                        <button className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
                            Manage Team Members <ChevronRight className="w-4 h-4" />
                        </button>
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
                        <button className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
                            View Templates <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Delegation Settings */}
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="p-3 bg-teal-500/20 rounded-xl">
                                <Users className="w-6 h-6 text-teal-400" />
                            </div>
                            <h2 className="text-xl font-bold">Delegation</h2>
                        </div>
                        <p className="text-slate-400 mb-4">Assign a temporary acting manager for approvals when you are away.</p>
                        <button className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
                            Configure Delegation <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Focus Skills */}
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="p-3 bg-orange-500/20 rounded-xl">
                                <FileText className="w-6 h-6 text-orange-400" />
                            </div>
                            <h2 className="text-xl font-bold">Team Focus Skills</h2>
                        </div>
                        <p className="text-slate-400 mb-4">Define priority skills for your department to guide IDP creation.</p>
                        <button className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
                            Manage Focus Skills <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ManagerSettings;
