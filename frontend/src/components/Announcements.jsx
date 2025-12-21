import React, { useState } from 'react';
import { Megaphone, FileText, Download, XCircle, Paperclip } from 'lucide-react';
import ConfirmationModal from '../components/Modals/ConfirmationModal';
import api from '../services/api';
import { useAuth } from '../store/useAuth';

// =================================================================================================
// Announcements Component
// -------------------------------------------------------------------------------------------------
// Displays a list of announcements and allows authorized users (Admin, Manager) to create new ones.
// Features:
// - List view of announcements with attachments.
// - Creation form with file upload support.
// - Delete functionality for authors/admins.
// - Download handler for attachments.
// =================================================================================================

const Announcements = ({ announcements, role, onRefresh }) => {
    // =================================================================================================
    // State Definitions
    // -------------------------------------------------------------------------------------------------
    const { user } = useAuth();
    const [form, setForm] = useState({ title: '', content: '', file: null });
    const [showForm, setShowForm] = useState(false);
    const [loading, setLoading] = useState(false);
    const [modalConfig, setModalConfig] = useState({
        isOpen: false,
        title: '',
        message: '',
        type: 'info', // unused but good for future
        showCancel: false,
        confirmText: 'OK',
        onConfirm: null,
        isDestructive: false
    });

    const closeModal = () => setModalConfig(prev => ({ ...prev, isOpen: false }));

    const handleConfirm = () => {
        if (modalConfig.onConfirm) {
            modalConfig.onConfirm();
        } else {
            closeModal();
        }
    };

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
    // State Definitions ends here

    // =================================================================================================
    // Helper Functions
    // -------------------------------------------------------------------------------------------------
    const handleCreate = async () => {
        if (!form.title || !form.content) return showAlert("Title and content are required", "Validation Error");
        setLoading(true);
        try {
            const formData = new FormData();
            formData.append('title', form.title);
            formData.append('content', form.content);
            if (form.file) {
                formData.append('attachment', form.file);
            }

            await api.post('/announcements', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            setForm({ title: '', content: '', file: null });
            setShowForm(false);
            if (onRefresh) onRefresh();
        } catch (e) {
            console.error(e);
            showAlert("Failed to create announcement", "Error");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = (id) => {
        setModalConfig({
            isOpen: true,
            title: 'Delete Announcement',
            message: 'Are you sure you want to delete this announcement?',
            showCancel: true,
            confirmText: 'Delete',
            isDestructive: true,
            onConfirm: async () => {
                try {
                    await api.delete(`/announcements/${id}`);
                    if (onRefresh) onRefresh();
                    closeModal();
                } catch (e) {
                    closeModal(); // Close confirm modal first
                    // Brief delay to allow modal transition or just replace it
                    setTimeout(() => showAlert("Failed to delete", "Error"), 100);
                }
            }
        });
    };

    const handleDownload = async (id, filename) => {
        try {
            const response = await api.get(`/announcements/${id}/attachment`, {
                responseType: 'blob', // Important for files
            });

            // Create blob link to download
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', filename);

            // Append to html link element page
            document.body.appendChild(link);

            // Start download
            link.click();

            // Clean up and remove the link
            link.parentNode.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error("Download failed", error);
            showAlert("Failed to download attachment. Please try again.", "Download Error");
        }
    };

    // Admin endpoint vs Common endpoint?
    // We updated backend controllers in common/announcement.controller.js
    // Routes are likely mounted under /api/announcements or similar.
    // Wait, AdminDashboard uses `/admin/announcements`.
    // I need to check routes. common routes usually not prefixed with /admin unless just for admin.
    // The controller I edited was in `common`.
    // Let's assume there is a common route. I should check routes content or just try `/announcements`?
    // AdminDashboard uses `/admin/announcements`.
    // I need to check if there is a general route.
    // Helper Functions ends here

    return (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 min-h-[500px] flex flex-col">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Megaphone className="w-5 h-5 text-purple-400" /> Announcements
                </h3>
                {(role === 'admin' || role === 'manager') && (
                    <button
                        onClick={() => setShowForm(!showForm)}
                        className="text-xs bg-purple-600 px-3 py-1.5 rounded text-white hover:bg-purple-500 transition-colors"
                    >
                        New Announcement
                    </button>
                )}
            </div>

            {showForm && (
                <div className="mb-6 space-y-3 p-4 bg-slate-800/50 rounded-xl border border-slate-700">
                    <input
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-purple-500 transition-colors"
                        placeholder="Announcement Title"
                        value={form.title}
                        onChange={e => setForm({ ...form, title: e.target.value })}
                    />
                    <textarea
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-sm text-white h-24 focus:outline-none focus:border-purple-500 transition-colors"
                        placeholder="Content..."
                        value={form.content}
                        onChange={e => setForm({ ...form, content: e.target.value })}
                    />
                    <div className="flex items-center gap-3">
                        <label className="flex items-center gap-2 px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg cursor-pointer hover:border-slate-600 transition-colors">
                            <Paperclip className="w-4 h-4 text-slate-400" />
                            <span className="text-xs text-slate-300">{form.file ? form.file.name : "Attach File"}</span>
                            <input type="file" className="hidden" onChange={e => setForm({ ...form, file: e.target.files[0] })} />
                        </label>
                        <div className="flex-1"></div>
                        <button onClick={() => setShowForm(false)} className="text-slate-400 text-xs hover:text-white mr-3">Cancel</button>
                        <button onClick={handleCreate} disabled={loading} className="bg-purple-600 text-white text-xs px-4 py-2 rounded-lg hover:bg-purple-500 transition-colors">
                            {loading ? 'Posting...' : 'Post Announcement'}
                        </button>
                    </div>
                </div>
            )}

            <div className="space-y-4 overflow-y-auto custom-scrollbar flex-1 pr-2 max-h-[500px]">
                {announcements.length === 0 ? (
                    <div className="text-center py-10 text-slate-500">
                        <Megaphone className="w-12 h-12 mx-auto mb-3 opacity-20" />
                        <p>No announcements yet</p>
                    </div>
                ) : announcements.map(a => (
                    <div key={a._id} className="p-5 bg-slate-800/30 rounded-xl border border-slate-700/50 relative group transition-all hover:bg-slate-800 hover:border-slate-600">
                        <div className="flex justify-between items-start mb-2">
                            <h4 className="text-sm font-bold text-white">{a.title}</h4>
                            <span className="text-[10px] text-slate-500 bg-slate-900 px-2 py-0.5 rounded-full border border-slate-800 max-w-[150px] truncate">
                                {new Date(a.createdAt).toLocaleDateString()}
                                {a.author && ` • ${a.author.name}`}
                            </span>
                        </div>
                        <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">{a.content}</p>

                        {a.attachment && (
                            <div className="mt-3 pt-3 border-t border-slate-700/50 flex items-center gap-2">
                                <div className="p-1.5 bg-slate-900 rounded border border-slate-800">
                                    <FileText className="w-3.5 h-3.5 text-blue-400" />
                                </div>
                                <button
                                    onClick={() => handleDownload(a._id, a.attachment.filename || "attachment")}
                                    className="text-xs text-blue-400 hover:text-blue-300 hover:underline flex items-center gap-1 bg-transparent border-none p-0 cursor-pointer"
                                >
                                    {a.attachment.filename || "Download Attachment"}
                                    <Download className="w-3 h-3" />
                                </button>
                            </div>
                        )}

                        {(role === 'admin' || (role === 'manager' && a.author?._id === user?._id)) && (
                            <button onClick={() => handleDelete(a._id)} className="absolute top-3 right-3 text-slate-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-slate-900 rounded">
                                <XCircle className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                ))}
            </div>

            <ConfirmationModal
                isOpen={modalConfig.isOpen}
                onClose={closeModal}
                onConfirm={handleConfirm}
                title={modalConfig.title}
                message={modalConfig.message}
                showCancel={modalConfig.showCancel}
                confirmText={modalConfig.confirmText}
                isDestructive={modalConfig.isDestructive}
            />
        </div>
    );
};

export default Announcements;
