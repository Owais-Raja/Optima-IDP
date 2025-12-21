import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../store/useAuth.jsx';
import AdminSecurityPanel from '../profiles/AdminSecurityPanel';
import AdminPreferencesPanel from '../profiles/AdminPreferencesPanel';
import UserManagementPanel from '../profiles/UserManagementPanel';
import SkillManager from '../components/Admin/SkillManager';

// =================================================================================================
// Admin Settings Page
// -------------------------------------------------------------------------------------------------
// Central hub for administrative configurations.
// Features:
// - General Preferences (Global settings).
// - User Management (Role assignment, user lists).
// - Skill Management (Define skills taxonomy).
// - Security & Access (Access control policies).
// =================================================================================================

function AdminSettings() {
    // =================================================================================================
    // State Definitions
    // -------------------------------------------------------------------------------------------------
    const { user } = useAuth();
    const [searchParams, setSearchParams] = useSearchParams();
    const activeTab = searchParams.get('tab') || 'general';

    const setActiveTab = (tab) => {
        setSearchParams({ tab });
    };
    // State Definitions ends here

    // Security check - although ProtectedRoute handles this, double check doesn't hurt
    if (!user || user.role !== 'admin') {
        return <div className="p-8 text-white">Access Denied</div>;
    }

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 p-6 sm:p-8 font-sans flex justify-center">
            <div className="max-w-7xl w-full">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-white mb-2">Admin Settings</h1>
                    <p className="text-slate-400">Global configurations for the organization.</p>
                </div>

                {/* Main Content */}
                <div className="grid grid-cols-1 lg:grid-cols-6 gap-8">
                    {/* ================================================================================================= */}
                    {/* Tab Navigation (Sidebar) */}
                    <div className="lg:col-span-1 space-y-2 lg:sticky lg:top-28 h-fit">
                        <button
                            onClick={() => setActiveTab('general')}
                            className={`w-full text-left px-4 py-3 rounded-lg font-medium transition-colors ${activeTab === 'general'
                                ? 'bg-purple-600/10 text-purple-400 border border-purple-500/20'
                                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                                }`}
                        >
                            General Preferences
                        </button>
                        <button
                            onClick={() => setActiveTab('users')}
                            className={`w-full text-left px-4 py-3 rounded-lg font-medium transition-colors ${activeTab === 'users'
                                ? 'bg-purple-600/10 text-purple-400 border border-purple-500/20'
                                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                                }`}
                        >
                            User Management
                        </button>
                        <button
                            onClick={() => setActiveTab('skills')}
                            className={`w-full text-left px-4 py-3 rounded-lg font-medium transition-colors ${activeTab === 'skills'
                                ? 'bg-purple-600/10 text-purple-400 border border-purple-500/20'
                                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                                }`}
                        >
                            Skill Management
                        </button>
                        <button
                            onClick={() => setActiveTab('security')}
                            className={`w-full text-left px-4 py-3 rounded-lg font-medium transition-colors ${activeTab === 'security'
                                ? 'bg-purple-600/10 text-purple-400 border border-purple-500/20'
                                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                                }`}
                        >
                            Security & Access
                        </button>
                    </div>
                    {/* Tab Navigation ends here */}

                    {/* ================================================================================================= */}
                    {/* Tab Content Area */}
                    <div className="lg:col-span-5">
                        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8">
                            <h2 className="text-xl font-semibold text-white mb-6 border-b border-slate-800 pb-4">
                                {activeTab === 'general' && 'General Settings'}
                                {activeTab === 'users' && 'User Management'}
                                {activeTab === 'skills' && 'Skill Management'}
                                {activeTab === 'security' && 'Security & Access Control'}
                            </h2>

                            {activeTab === 'general' && (
                                <AdminPreferencesPanel />
                            )}

                            {activeTab === 'users' && (
                                <UserManagementPanel />
                            )}

                            {activeTab === 'skills' && (
                                <SkillManager />
                            )}

                            {activeTab === 'security' && (
                                <AdminSecurityPanel />
                            )}
                        </div>
                    </div>
                    {/* Tab Content Area ends here */}
                </div>
            </div>
        </div>
    );
}

export default AdminSettings;
