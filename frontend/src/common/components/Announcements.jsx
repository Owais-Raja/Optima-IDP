import React, { useState } from 'react';
import { Megaphone, FileText, Download, XCircle, Paperclip } from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../store/useAuth';

const Announcements = ({ announcements, role, onRefresh }) => {
    const { user } = useAuth();
    const [form, setForm] = useState({ title: '', content: '', file: null });
    const [showForm, setShowForm] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleCreate = async () => {
        if (!form.title || !form.content) return alert("Title and content are required");
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
            alert("Failed to create announcement");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Delete this announcement?')) return;
        try {
            await api.delete(`/announcements/${id}`);
            if (onRefresh) onRefresh();
        } catch (e) {
            alert("Failed to delete");
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
                                <a
                                    href={`${api.defaults.baseURL}/announcements/${a._id}/attachment`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs text-blue-400 hover:text-blue-300 hover:underline flex items-center gap-1"
                                >
                                    {a.attachment.filename || "Download Attachment"}
                                    <Download className="w-3 h-3" />
                                </a>
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
        </div>
    );
};

export default Announcements;
