import React, { useEffect, useState } from 'react';
import api from '../services/api';
import ConfirmationModal from '../components/Modals/ConfirmationModal';

// =================================================================================================
// Manager Overview Component
// -------------------------------------------------------------------------------------------------
// High-level dashboard for managers to view team status.
// Features:
// - KPIs: Total Reports, Pending Approvals, Average Skill Level.
// - Pending Approvals list with quick actions (Approve/Reject/Request Changes).
// =================================================================================================

const ManagerOverview = ({ profile }) => {
    // =================================================================================================
    // State Definitions
    // -------------------------------------------------------------------------------------------------
    const [pendingIDPs, setPendingIDPs] = useState([]);
    const [loading, setLoading] = useState(true);

    const [metrics, setMetrics] = useState(null);
    const [modalConfig, setModalConfig] = useState({
        isOpen: false,
        title: '',
        message: '',
        showCancel: false,
        confirmText: 'OK',
        onConfirm: null
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
    const fetchPendingIDPs = async () => {
        try {
            const res = await api.get('/idp/pending');
            setPendingIDPs(res.data.idps || []);
        } catch (err) {
            console.error("Failed to fetch pending IDPs", err);
        }
    };

    const fetchMetrics = async () => {
        try {
            // In parallel
            const res = await api.get('/idp/metrics/team');
            setMetrics(res.data);
        } catch (err) {
            console.error("Failed to fetch team metrics", err);
        }
    };

    useEffect(() => {
        setLoading(true);
        Promise.all([fetchPendingIDPs(), fetchMetrics()]).finally(() => setLoading(false));
    }, []);

    const handleAction = async (idpId, status) => {
        let feedback = "";
        if (status === 'rejected' || status === 'needs_revision') {
            feedback = window.prompt("Please provide feedback/reason:");
            if (feedback === null) return; // User cancelled
        } else {
            feedback = "Approved by manager";
        }

        try {
            await api.put(`/idp/approve/${idpId}`, { status, managerFeedback: feedback });
            // Optimistic update or refresh
            setPendingIDPs(prev => prev.filter(idp => idp._id !== idpId));
        } catch (err) {
            console.error("Action failed", err);
            showAlert("Failed to process request", "Error");
        }
    };
    // Helper Functions ends here

    if (loading) return <div className="text-slate-400">Loading team data...</div>;

    return (
        <div className="space-y-6">
            {/* Manager Welcome */}
            <div className="bg-gradient-to-r from-emerald-900/40 to-slate-900 border border-emerald-500/20 rounded-xl p-6">
                <h3 className="text-xl font-bold text-white mb-2">Team Overview</h3>
                <p className="text-slate-300">Overview of your team's development and pending actions.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Team Stats */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                    <h4 className="text-slate-400 text-sm font-medium mb-1">Total Reports</h4>
                    <p className="text-3xl font-bold text-white">{metrics?.totalReports || 0}</p>
                </div>
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                    <h4 className="text-slate-400 text-sm font-medium mb-1">Pending Approvals</h4>
                    <p className="text-3xl font-bold text-amber-400">{metrics?.pendingApprovals || 0}</p>
                </div>
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                    <h4 className="text-slate-400 text-sm font-medium mb-1">Team Skill Avg</h4>
                    <p className="text-3xl font-bold text-blue-400">{metrics?.teamAvgSkill || 0}</p>
                </div>
            </div>

            {/* Action Items */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                <h4 className="text-lg font-semibold text-white mb-4">Pending Actions</h4>

                {pendingIDPs.length === 0 ? (
                    <p className="text-slate-500 italic">No pending approvals.</p>
                ) : (
                    <div className="space-y-3">
                        {pendingIDPs.map((idp) => (
                            <div key={idp._id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-slate-800/50 rounded-lg border border-slate-700 gap-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400 font-bold text-sm uppercase shrink-0">
                                        {idp.employee?.name?.substring(0, 2) || "U"}
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-white">
                                            {idp.employee?.name || "Unknown Device"} - <span className="text-purple-300">IDP Review</span>
                                        </p>
                                        <p className="text-xs text-slate-400">
                                            Status: <span className="capitalize">{idp.status}</span> • Created: {new Date(idp.createdAt).toLocaleDateString()}
                                        </p>
                                        {idp.skillsToImprove?.length > 0 && (
                                            <p className="text-xs text-slate-500 mt-1">
                                                Focus: {idp.skillsToImprove.map(s => s.skill?.name).join(", ")}
                                            </p>
                                        )}
                                    </div>
                                </div>
                                <div className="flex gap-2 self-end sm:self-center">
                                    <button
                                        onClick={() => handleAction(idp._id, 'approved')}
                                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium rounded transition-colors"
                                    >
                                        Approve
                                    </button>
                                    <button
                                        onClick={() => handleAction(idp._id, 'needs_revision')}
                                        className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white text-xs font-medium rounded transition-colors"
                                    >
                                        Request Changes
                                    </button>
                                    <button
                                        onClick={() => handleAction(idp._id, 'rejected')}
                                        className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-medium rounded transition-colors"
                                    >
                                        Reject
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <ConfirmationModal
                isOpen={modalConfig.isOpen}
                onClose={closeModal}
                onConfirm={modalConfig.onConfirm || closeModal}
                title={modalConfig.title}
                message={modalConfig.message}
                showCancel={modalConfig.showCancel}
                confirmText={modalConfig.confirmText}
            />
        </div >
    );
};

export default ManagerOverview;
