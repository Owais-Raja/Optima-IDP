import React, { useState, useEffect, useRef } from 'react';
import { X, Calendar, User, AlertCircle } from 'lucide-react';
import api from '../../services/api';

const CreateAssignmentModal = ({ isOpen, onClose, teamMembers = [] }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [dueDate, setDueDate] = useState('');
    const [assignedTo, setAssignedTo] = useState([]);
    const [priority, setPriority] = useState('normal');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Ref for the hidden date input to programmatically trigger the picker
    const dateInputRef = useRef(null);

    useEffect(() => {
        if (isOpen) {
            // Reset form when opening
            setTitle('');
            setDescription('');
            setDueDate('');
            setAssignedTo([]);
            setPriority('normal');
            setError('');
        }
    }, [isOpen]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!title || !dueDate || assignedTo.length === 0) {
            setError('Please fill in all required fields (Title, Due Date, Assignees)');
            return;
        }

        const selectedDate = new Date(dueDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (selectedDate < today) {
            setError('Due date cannot be in the past');
            return;
        }

        setLoading(true);

        try {
            await api.post('/assignments', {
                title,
                description,
                dueDate,
                assignedTo,
                priority
            });
            onClose();
            // Ideally trigger a refresh or show success toast in parent
        } catch (err) {
            console.error(err);
            setError('Failed to create assignment. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const toggleUser = (userId) => {
        if (assignedTo.includes(userId)) {
            setAssignedTo(assignedTo.filter(id => id !== userId));
        } else {
            setAssignedTo([...assignedTo, userId]);
        }
    };

    const selectAll = () => {
        if (assignedTo.length === teamMembers.length) {
            setAssignedTo([]);
        } else {
            setAssignedTo(teamMembers.map(m => m._id));
        }
    };

    if (!isOpen) return null;

    // Get today's date in YYYY-MM-DD format based on LOCAL time, not UTC
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const todayStr = `${year}-${month}-${day}`;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
                <div className="flex justify-between items-center p-6 border-b border-slate-800">
                    <h2 className="text-xl font-bold text-white">Create Assignment</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {error && (
                        <div className="bg-red-500/10 text-red-400 p-3 rounded-lg text-sm flex items-center gap-2">
                            <AlertCircle className="w-4 h-4" />
                            {error}
                        </div>
                    )}

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-1">Title *</label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500 transition-colors"
                                placeholder="e.g., Complete Security Training"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-1">Description</label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500 transition-colors h-24 resize-none"
                                placeholder="Optional details..."
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-1">Due Date *</label>
                                <div
                                    className="relative cursor-pointer"
                                    onClick={() => dateInputRef.current?.showPicker()}
                                >
                                    <Calendar className="absolute left-3 top-2.5 w-4 h-4 text-slate-400 z-10" />

                                    {/* Visible Input (Formatted) */}
                                    <input
                                        type="text"
                                        readOnly
                                        placeholder="dd / mm / yyyy"
                                        value={dueDate ? new Date(dueDate).toLocaleDateString('en-GB') : ''}
                                        className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-10 pr-4 py-2 text-white focus:outline-none focus:border-purple-500 transition-colors pointer-events-none"
                                    />

                                    {/* Hidden Date Input (Actual Logic) */}
                                    <input
                                        ref={dateInputRef}
                                        type="date"
                                        value={dueDate}
                                        min={todayStr}
                                        onChange={(e) => setDueDate(e.target.value)}
                                        className="absolute inset-0 w-full h-full opacity-0 pointer-events-none"
                                    />
                                    {/* Note: pointer-events-none on hidden input prevents it from blocking clicks, 
                                        but we trigger showPicker() from the parent div click */}
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-1">Priority</label>
                                <select
                                    value={priority}
                                    onChange={(e) => setPriority(e.target.value)}
                                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500 transition-colors"
                                >
                                    <option value="normal">Normal</option>
                                    <option value="urgent">Urgent</option>
                                </select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <label className="block text-sm font-medium text-slate-400">Assign To *</label>
                                <button
                                    type="button"
                                    onClick={selectAll}
                                    className="text-xs text-purple-400 hover:text-purple-300 font-medium"
                                >
                                    {assignedTo.length === teamMembers.length ? 'Deselect All' : 'Select All'}
                                </button>
                            </div>
                            <div className="max-h-40 overflow-y-auto border border-slate-800 rounded-lg p-2 space-y-1">
                                {teamMembers.map(member => (
                                    <div
                                        key={member._id}
                                        onClick={() => toggleUser(member._id)}
                                        className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors ${assignedTo.includes(member._id) ? 'bg-purple-500/20 border border-purple-500/30' : 'hover:bg-slate-800 border border-transparent'}`}
                                    >
                                        <div className={`w-4 h-4 rounded border flex items-center justify-center ${assignedTo.includes(member._id) ? 'bg-purple-500 border-purple-500' : 'border-slate-600'}`}>
                                            {assignedTo.includes(member._id) && <User className="w-3 h-3 text-white" />}
                                        </div>
                                        <span className="text-sm text-slate-200">{member.name}</span>
                                    </div>
                                ))}
                                {teamMembers.length === 0 && (
                                    <p className="text-center text-slate-500 text-xs py-2">No active team members found.</p>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-3 pt-4 border-t border-slate-800">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors font-medium"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Creating...' : 'Assign Task'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateAssignmentModal;
