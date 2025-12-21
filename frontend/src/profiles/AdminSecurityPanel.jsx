import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Shield, Users, Key, Lock, AlertTriangle, Check, X } from 'lucide-react';
import ConfirmationModal from '../components/Modals/ConfirmationModal';

// =================================================================================================
// Admin Security Panel Component
// -------------------------------------------------------------------------------------------------
// Manages security settings and session control.
// Features:
// - View active company sessions.
// - Revoke all tokens (Emergency Logout).
// - Configure inactive account lockout policy.
// - View RBAC Matrix.
// =================================================================================================

const AdminSecurityPanel = () => {
    // =================================================================================================
    // State Definitions
    // -------------------------------------------------------------------------------------------------
    const [sessions, setSessions] = useState([]);
    const [securityConfig, setSecurityConfig] = useState(null);
    const [inactiveLockoutDays, setInactiveLockoutDays] = useState(90);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [modalConfig, setModalConfig] = useState({
        isOpen: false,
        title: '',
        message: '',
        showCancel: false,
        confirmText: 'OK',
        onConfirm: null,
        isDestructive: false
    });
    // State Definitions ends here

    const closeModal = () => setModalConfig(prev => ({ ...prev, isOpen: false }));
    const showAlert = (message, title = "Alert") => {
        setModalConfig({
            isOpen: true,
            title,
            message,
            showCancel: false,
            confirmText: 'OK',
            onConfirm: closeModal
        });
    };

    // =================================================================================================
    // Helper Functions
    // -------------------------------------------------------------------------------------------------
    useEffect(() => {
        fetchSecurityData();
    }, []);

    const fetchSecurityData = async () => {
        try {
            const [sessionsRes, configRes] = await Promise.all([
                api.get('/admin/security/company-sessions'),
                api.get('/admin/security/config')
            ]);

            setSessions(sessionsRes.data);
            setSecurityConfig(configRes.data);
            setInactiveLockoutDays(configRes.data.companySettings.inactiveLockoutDays);
        } catch (error) {
            console.error('Failed to fetch security data:', error);
        } finally {
            setLoading(false);
        }
    };

    const confirmRevokeTokens = () => {
        setModalConfig({
            isOpen: true,
            title: 'Confirm Token Revocation',
            message: 'This will force logout ALL users in your organization. They will need to log in again to continue using the platform.',
            isDestructive: true,
            showCancel: true,
            confirmText: 'Yes, Revoke All Tokens',
            onConfirm: handleRevokeTokens
        });
    };

    const handleRevokeTokens = async () => {
        try {
            const res = await api.post('/admin/security/revoke-company-tokens');
            closeModal();
            setTimeout(() => showAlert(res.data.message, 'Success'), 200);
            fetchSecurityData(); // Refresh data
        } catch (error) {
            closeModal();
            setTimeout(() => showAlert('Failed to revoke tokens', 'Error'), 200);
        }
    };

    const handleSaveSettings = async () => {
        setSaving(true);
        try {
            await api.put('/admin/security/company-settings', {
                inactiveLockoutDays: parseInt(inactiveLockoutDays)
            });
            showAlert('Company settings updated successfully', 'Success');
            fetchSecurityData();
        } catch (error) {
            showAlert('Failed to update settings', 'Error');
        } finally {
            setSaving(false);
        }
    };
    // Helper Functions ends here

    if (loading) {
        return (
            <div className="flex justify-center py-12">
                <div className="inline-block w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Company Session Management */}
            <div className="border-t border-slate-800 pt-8">
                <div className="flex items-center gap-3 mb-6">
                    <Users className="w-6 h-6 text-purple-400" />
                    <h3 className="text-xl font-semibold text-white">Company Session Management</h3>
                </div>

                {/* Revoke Tokens Button */}
                <div className="mb-6">
                    <button
                        onClick={confirmRevokeTokens}
                        className="px-6 py-3 bg-red-600 hover:bg-red-500 text-white font-medium rounded-lg transition-colors flex items-center gap-2"
                    >
                        <AlertTriangle className="w-5 h-5" />
                        Revoke All Company Tokens
                    </button>
                    <p className="text-sm text-slate-400 mt-2">Force logout all users in your organization</p>
                </div>

                {/* Recent Sessions Table */}
                <div className="bg-slate-950 rounded-lg border border-slate-800 overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-800">
                        <h4 className="text-white font-medium">Recent Login Activity</h4>
                    </div>
                    {sessions.length > 0 ? (
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-slate-800">
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">User</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Role</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-slate-400 uppercase">Last Login</th>
                                </tr>
                            </thead>
                            <tbody>
                                {sessions.map((session, idx) => (
                                    <tr key={idx} className="border-b border-slate-800 last:border-0 hover:bg-slate-900">
                                        <td className="px-6 py-4 text-white">{session.name}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded text-xs font-medium ${session.role === 'admin' ? 'bg-purple-500/20 text-purple-300' :
                                                session.role === 'manager' ? 'bg-blue-500/20 text-blue-300' :
                                                    'bg-slate-500/20 text-slate-300'
                                                }`}>
                                                {session.role}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right text-slate-400 font-mono text-sm">
                                            {new Date(session.lastLogin).toLocaleString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <div className="px-6 py-12 text-center text-slate-500">
                            No recent login activity
                        </div>
                    )}
                </div>
            </div>

            {/* Company Security Policy Section Removed as per plan */}

            {/* Inactive Lockout Settings */}
            <div className="bg-slate-950 rounded-lg border border-slate-800 p-6">
                <h4 className="text-white font-medium mb-4">Inactive Account Lockout</h4>
                <div className="flex items-end gap-4">
                    <div className="flex-1">
                        <label className="block text-sm font-medium text-slate-400 mb-2">
                            Auto-lock account after (days):
                        </label>
                        <input
                            type="number"
                            min="1"
                            max="365"
                            value={inactiveLockoutDays}
                            onChange={(e) => setInactiveLockoutDays(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                        />
                    </div>
                    <button
                        onClick={handleSaveSettings}
                        disabled={saving}
                        className="px-6 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
                    >
                        {saving ? 'Saving...' : 'Save'}
                    </button>
                </div>
                <p className="text-sm text-slate-400 mt-3">
                    Accounts inactive for this duration will be automatically locked
                </p>
            </div>


            {/* RBAC Overview */}
            <div className="border-t border-slate-800 pt-8">
                <div className="flex items-center gap-3 mb-6">
                    <Key className="w-6 h-6 text-purple-400" />
                    <h3 className="text-xl font-semibold text-white">Role Permissions Matrix</h3>
                </div>

                <div className="bg-slate-950 rounded-lg border border-slate-800 overflow-hidden">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-slate-800">
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Action</th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-slate-400 uppercase">Employee</th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-slate-400 uppercase">Manager</th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-slate-400 uppercase">Admin</th>
                            </tr>
                        </thead>
                        <tbody>
                            {securityConfig?.rbacMatrix.map((row, idx) => (
                                <tr key={idx} className="border-b border-slate-800 last:border-0 hover:bg-slate-900">
                                    <td className="px-6 py-4 text-white">{row.action}</td>
                                    <td className="px-6 py-4 text-center">
                                        {row.employee ? (
                                            <Check className="w-5 h-5 text-emerald-500 inline" />
                                        ) : (
                                            <X className="w-5 h-5 text-red-500 inline" />
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        {row.manager ? (
                                            <Check className="w-5 h-5 text-emerald-500 inline" />
                                        ) : (
                                            <X className="w-5 h-5 text-red-500 inline" />
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        {row.admin ? (
                                            <Check className="w-5 h-5 text-emerald-500 inline" />
                                        ) : (
                                            <X className="w-5 h-5 text-red-500 inline" />
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Confirmation Modal */}
            <ConfirmationModal
                isOpen={modalConfig.isOpen}
                onClose={closeModal}
                onConfirm={modalConfig.onConfirm || closeModal}
                title={modalConfig.title}
                message={modalConfig.message}
                showCancel={modalConfig.showCancel}
                confirmText={modalConfig.confirmText}
                isDestructive={modalConfig.isDestructive}
            />
        </div >
    );
};

export default AdminSecurityPanel;
