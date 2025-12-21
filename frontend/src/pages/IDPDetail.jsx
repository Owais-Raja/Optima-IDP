import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { ArrowLeft, BookOpen, CheckCircle, Clock, Calendar, Trash2, MessageSquare, Plus } from 'lucide-react';
import ConfirmationModal from '../components/Modals/ConfirmationModal';
import ResourcePickerModal from '../components/Modals/ResourcePickerModal';
import FeedbackModal from '../components/Modals/FeedbackModal';
import { useAuth } from '../store/useAuth';


// =================================================================================================
// IDP Detail Component
// -------------------------------------------------------------------------------------------------
// Detailed view of a specific Individual Development Plan.
// Functionality:
// - View plan details, status, and feedback.
// - Manage resources (add, remove, toggle status).
// - Interactive actions based on role (Manager: Approve/Request Changes; Employee: Submit/Delete).
// =================================================================================================

const IDPDetail = () => {
    // =================================================================================================
    // State Definitions
    // -------------------------------------------------------------------------------------------------
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [idp, setIdp] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showResourcePicker, setShowResourcePicker] = useState(false);
    const [feedbackModal, setFeedbackModal] = useState({ isOpen: false, status: null });
    const [successModal, setSuccessModal] = useState({ isOpen: false, title: "", message: "" });
    // State Definitions ends here

    // =================================================================================================
    // Effects
    // -------------------------------------------------------------------------------------------------
    useEffect(() => {
        const fetchIDP = async () => {
            try {
                const res = await api.get(`/idp/${id}`);
                setIdp(res.data.idp);
            } catch (err) {
                console.error("Failed to fetch IDP", err);
                setError("Failed to load IDP details. Please try again.");
            } finally {
                setLoading(false);
            }
        };

        if (id) fetchIDP();
    }, [id]);
    // Effects ends here

    // =================================================================================================
    // Handlers
    // -------------------------------------------------------------------------------------------------

    // Toggle resource completion status
    const handleResourceToggle = async (resourceId, currentStatus) => {
        try {
            const newStatus = currentStatus === 'completed' ? 'pending' : 'completed';
            await api.put(`/idp/${id}/resource/${resourceId}`, { status: newStatus });

            // Optimistic update
            setIdp(prev => ({
                ...prev,
                recommendedResources: prev.recommendedResources.map(r =>
                    (r.resource._id === resourceId || r._id === resourceId)
                        ? { ...r, status: newStatus }
                        : r
                )
            }));
        } catch (err) {
            console.error("Failed to update resource", err);
        }
    };

    const handleDelete = async () => {
        try {
            await api.delete(`/idp/${id}`);
            navigate('/dashboard');
        } catch (err) {
            console.error("Delete failed", err);
            setError("Failed to delete plan.");
            setShowDeleteModal(false);
        }
    };

    const handleResourceAdd = async (selectedResources) => {
        try {
            // Filter out resources already added (handled in picker too, but safety check)
            const currentResourceIds = new Set(idp.recommendedResources.map(r => r.resource?._id || r.resource));
            const newResources = selectedResources.filter(r => !currentResourceIds.has(r._id));

            if (newResources.length === 0) return;

            // Prepare new list
            const updatedList = [
                ...idp.recommendedResources.map(r => ({ resource: r.resource?._id || r.resource, status: r.status })),
                ...newResources.map(r => ({ resource: r._id, status: 'pending' }))
            ];

            const res = await api.put(`/idp/update/${id}`, { ...idp, recommendedResources: updatedList });
            setIdp(res.data.idp);
        } catch (err) {
            console.error("Failed to add resources", err);
            setError("Failed to add resources.");
        }
    };

    // Manager approval/rejection logic
    const handleManagerAction = async (status, feedback = "") => {
        try {
            await api.put(`/idp/approve/${id}`, { status, managerFeedback: feedback });
            // Refresh
            const res = await api.get(`/idp/${id}`);
            setIdp(res.data.idp);
            setSuccessModal({
                isOpen: true,
                title: "Success",
                message: `IDP has been ${status === 'needs_revision' ? 'returned for revision' : 'approved'}.`
            });
            setFeedbackModal({ isOpen: false, status: null });
        } catch (err) {
            console.error("Action failed", err);
            setError("Action failed. Please try again.");
        }
    };

    const handleResubmit = async () => {
        try {
            await api.put(`/idp/update/${id}`, { ...idp, status: 'pending' });
            const res = await api.get(`/idp/${id}`);
            setIdp(res.data.idp);
            setSuccessModal({
                isOpen: true,
                title: "Submitted",
                message: "Plan has been submitted for review."
            });
        } catch (err) {
            console.error("Resubmit failed", err);
            setError("Failed to submit plan.");
        }
    };
    // Handlers ends here

    if (loading) return (
        <div className="flex justify-center items-center min-h-screen text-slate-400">
            Loading plan details...
        </div>
    );

    if (error || !idp) return (
        <div className="flex flex-col justify-center items-center min-h-screen text-slate-400 gap-4">
            <p>{error || "IDP not found"}</p>
            <Link to="/dashboard" className="text-purple-400 hover:text-white flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" /> Back to Dashboard
            </Link>
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-12 py-8 fade-in">
            {/* ================================================================================================= */}
            {/* Header Section */}
            {/* Shows Title, Status, and Action Buttons (Approve/Delete) */}
            <div className="mb-8">
                <Link to="/dashboard" className="text-slate-400 hover:text-white flex items-center gap-2 mb-4 text-sm font-medium transition-colors">
                    <ArrowLeft className="w-4 h-4" /> Back to Dashboard
                </Link>
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-2">{idp.goals || "Development Plan"}</h1>
                        <p className="text-slate-400">Created {new Date(idp.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div className="flex items-center gap-4">
                        {(() => {
                            const completedCount = idp.recommendedResources?.filter(r => r.status === 'completed').length || 0;
                            const totalCount = idp.recommendedResources?.length || 0;
                            const progress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

                            let label = idp.status.replace('_', ' ');
                            let style = 'bg-slate-800/10 text-slate-400 border border-slate-500/20';

                            if (idp.status === 'needs_revision') {
                                label = 'NEEDS REVISION';
                                style = 'bg-red-500/10 text-red-400 border border-red-500/20';
                            } else if (idp.status === 'rejected') {
                                style = 'bg-red-500/10 text-red-400 border border-red-500/20';
                            } else if (['approved', 'pending_completion'].includes(idp.status)) {
                                if (progress === 100) {
                                    label = 'PENDING APPROVAL';
                                    style = 'bg-amber-500/10 text-amber-400 border border-amber-500/20';
                                } else {
                                    label = 'PENDING COMPLETION';
                                    style = 'bg-blue-500/10 text-blue-400 border border-blue-500/20'; // Using Blue for "Pending Completion" (Active) in Detail View, or stick to Green? The dashboard used Green. Let's use Green for consistency.
                                    style = 'bg-green-500/10 text-green-400 border border-emerald-500/20';
                                }
                            } else if (idp.status === 'completed') {
                                style = 'bg-blue-500/10 text-blue-400 border border-blue-500/20';
                            } else if (idp.status === 'pending') {
                                style = 'bg-amber-500/10 text-amber-400 border border-amber-500/20';
                            }

                            return (
                                <span className={`px-4 py-2 rounded-lg text-sm font-bold uppercase tracking-wide ${style}`}>
                                    {label}
                                </span>
                            );
                        })()}

                        <div className="flex gap-2">
                            {user?.role === 'manager' ? (
                                <>
                                    {(idp.status === 'pending' || idp.status === 'pending_completion') && (
                                        <>
                                            <button
                                                onClick={() => setFeedbackModal({ isOpen: true, status: 'needs_revision' })}
                                                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm font-medium"
                                            >
                                                Request Changes
                                            </button>
                                            <button
                                                onClick={() => handleManagerAction('approved')}
                                                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm font-medium"
                                            >
                                                Approve
                                            </button>
                                        </>
                                    )}
                                </>
                            ) : (
                                <>
                                    {idp.status === 'needs_revision' && (
                                        <button
                                            onClick={handleResubmit}
                                            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium"
                                        >
                                            Submit for Review
                                        </button>
                                    )}

                                    <button
                                        onClick={() => setShowDeleteModal(true)}
                                        className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors border border-transparent hover:border-red-500/20"
                                        title="Delete Plan"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {idp.managerFeedback && (
                    <div className="mt-6 p-4 bg-purple-500/5 border border-purple-500/20 rounded-xl flex items-start gap-4">
                        <div className="mt-1 min-w-[24px] text-purple-400">
                            <MessageSquare className="w-6 h-6" />
                        </div>
                        <div>
                            <h4 className="font-bold text-purple-200 text-sm uppercase tracking-wider mb-1">Manager Feedback</h4>
                            <p className="text-slate-300">{idp.managerFeedback}</p>
                        </div>
                    </div>
                )}
                {/* Header Section ends here */}

                <div className="flex flex-col gap-10 mt-8">
                    {/* ================================================================================================= */}
                    {/* Main Content: Resources */}
                    {/* List of recommended resources with status toggles */}
                    <div className="space-y-6">
                        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                                <BookOpen className="w-5 h-5 text-purple-400" />
                                Action Items & Resources
                            </h2>

                            <div className="flex flex-col gap-4">
                                {/* Deduplicate resources by ID before rendering */}
                                {Array.from(new Map(idp.recommendedResources?.map(item => [item.resource?._id, item])).values()).map((item, idx) => {
                                    const resource = item.resource || {};
                                    return (
                                        <div key={idx} className={`p-4 rounded-xl border transition-all ${item.status === 'completed'
                                            ? 'bg-slate-900/50 border-emerald-500/20'
                                            : 'bg-slate-800/50 border-slate-700 hover:border-purple-500/30'
                                            } relative group`}>

                                            {(idp.status === 'needs_revision' || idp.status === 'draft') && user?.role !== 'manager' && (
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        // Only allow delete if it's not the last resource? Or allow empty?
                                                        // For now, allow delete.
                                                        if (window.confirm("Remove this resource?")) {
                                                            const newResources = idp.recommendedResources.filter(r => r._id !== item._id);
                                                            // Call API to save (simplified for this context, ideally use a specific endpoint or update full IDP)
                                                            api.put(`/idp/update/${id}`, { ...idp, recommendedResources: newResources.map(r => ({ resource: r.resource._id, status: r.status })) })
                                                                .then(res => setIdp(res.data.idp))
                                                                .catch(err => console.error("Failed to remove resource", err));
                                                        }
                                                    }}
                                                    className="absolute top-4 right-4 text-slate-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                                                    title="Remove Resource"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            )}

                                            <div className="flex items-start gap-4 pr-8">
                                                <button
                                                    onClick={() => handleResourceToggle(resource._id, item.status)}
                                                    className={`mt-1 w-6 h-6 rounded-full border flex items-center justify-center transition-all ${item.status === 'completed'
                                                        ? 'bg-emerald-500 border-emerald-500 text-white'
                                                        : 'border-slate-500 hover:border-purple-400 text-transparent'
                                                        }`}
                                                >
                                                    <CheckCircle className="w-4 h-4" />
                                                </button>

                                                <div className="flex-1">
                                                    <div className="flex justify-between items-start">
                                                        <h3 className={`font-semibold text-lg mb-1 ${item.status === 'completed' ? 'text-slate-500 line-through' : 'text-white'}`}>
                                                            {resource.title || "Untitled Resource"}
                                                        </h3>
                                                        {resource.type && (
                                                            <span className="text-xs font-mono uppercase text-slate-500 border border-slate-700 px-2 py-0.5 rounded">
                                                                {resource.type}
                                                            </span>
                                                        )}
                                                    </div>

                                                    <div className="flex items-center gap-4 text-sm text-slate-400 mb-3">
                                                        {resource.provider && resource.provider !== 'Unknown' && (
                                                            <span>{resource.provider}</span>
                                                        )}
                                                        {resource.provider && resource.provider !== 'Unknown' && resource.duration && (
                                                            <span>•</span>
                                                        )}
                                                        {resource.duration && (
                                                            <span>{resource.duration}</span>
                                                        )}
                                                    </div>

                                                    {resource.url && (
                                                        <div className="mt-4">
                                                            <a
                                                                href={resource.url}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="text-sm text-purple-400 hover:text-white transition-colors inline-flex items-center gap-1"
                                                            >
                                                                Open Resource <BookOpen className="w-3 h-3" />
                                                            </a>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}

                                {/* Add Resource Button (For Needs Revision/Draft) */}
                                {(idp.status === 'needs_revision' || idp.status === 'draft') && user?.role !== 'manager' && (
                                    <button
                                        onClick={() => setShowResourcePicker(true)}
                                        className="w-full py-3 border-2 border-dashed border-slate-700 rounded-xl text-slate-400 hover:text-purple-400 hover:border-purple-500/50 transition-colors flex items-center justify-center gap-2 font-medium"
                                    >
                                        <Plus className="w-5 h-5" />
                                        Add Resource
                                    </button>
                                )}

                                {(!idp.recommendedResources || idp.recommendedResources.length === 0) && (
                                    <p className="text-slate-500 italic">No resources assigned yet.</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Main Content: Resources ends here */}

                    {/* ================================================================================================= */}
                    {/* Sidebar: Skills & Info */}
                    {/* Target skills and plan metadata */}
                    <div className="space-y-6">
                        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                            <h3 className="text-lg font-bold text-white mb-4">Target Skills</h3>
                            <div className="flex flex-wrap gap-2">
                                {Array.from(new Map(idp.skillsToImprove?.map(item => [item.skill?._id, item])).values()).map((s, idx) => (
                                    <span key={idx} className="bg-purple-500/10 text-purple-400 border border-purple-500/20 px-3 py-1.5 rounded-lg text-sm font-medium">
                                        {s.skill?.name || "Unknown Skill"}
                                    </span>
                                ))}
                            </div>
                        </div>

                        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                            <h3 className="text-lg font-bold text-white mb-4">Plan Info</h3>
                            <div className="space-y-4 text-sm">
                                <div className="flex justify-between py-2 border-b border-slate-800">
                                    <span className="text-slate-500">Status</span>
                                    <span className="text-white capitalize">{idp.status.replace('_', ' ')}</span>
                                </div>
                                <div className="flex justify-between py-2 border-b border-slate-800">
                                    <span className="text-slate-500">Start Date</span>
                                    <span className="text-white">{new Date(idp.createdAt).toLocaleDateString()}</span>
                                </div>
                                <div className="flex justify-between py-2 border-b border-slate-800">
                                    <span className="text-slate-500">Last Updated</span>
                                    <span className="text-white">{new Date(idp.updatedAt).toLocaleDateString()}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* Sidebar: Skills & Info ends here */}

            {/* ======================= Modals ======================= */}

            <ConfirmationModal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onConfirm={handleDelete}
                title="Delete Plan"
                message="Are you sure you want to delete this development plan? This action cannot be undone."
                confirmText="Delete Plan"
                isDestructive={true}
            />

            <ResourcePickerModal
                isOpen={showResourcePicker}
                onClose={() => setShowResourcePicker(false)}
                onSelect={handleResourceAdd}
                activeResources={idp.recommendedResources}
            />

            <FeedbackModal
                isOpen={feedbackModal.isOpen}
                onClose={() => setFeedbackModal({ ...feedbackModal, isOpen: false })}
                onConfirm={(feedback) => handleManagerAction(feedbackModal.status, feedback)}
                title={feedbackModal.status === 'needs_revision' ? "Request Changes" : "Provide Feedback"}
                placeholder="Explain what needs to be improved..."
            />

            <ConfirmationModal
                isOpen={successModal.isOpen}
                onClose={() => setSuccessModal({ ...successModal, isOpen: false })}
                onConfirm={() => setSuccessModal({ ...successModal, isOpen: false })}
                title={successModal.title}
                message={successModal.message}
                confirmText="OK"
                showCancel={false}
            />
        </div >
    );
};

export default IDPDetail;
