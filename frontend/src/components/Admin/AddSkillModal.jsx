import React, { useState } from 'react';
import { X, Check } from 'lucide-react';
import api from '../../services/api';

// =================================================================================================
// Add Skill Modal Component
// -------------------------------------------------------------------------------------------------
// Modal form for creating a new skill.
// Accessed from ResourceManager.
// =================================================================================================

const AddSkillModal = ({ isOpen, onClose, onSkillAdded }) => {
    // =================================================================================================
    // State Definitions
    // -------------------------------------------------------------------------------------------------
    const [name, setName] = useState('');
    const [category, setCategory] = useState('Technical');
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    // State Definitions ends here

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await api.post('/skill/add', { name, category, description });
            onSkillAdded(res.data.skill);
            onClose();
            setName('');
            setDescription('');
            setCategory('Technical');
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || 'Failed to add skill');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="flex justify-between items-center p-6 border-b border-slate-700/50 bg-slate-800/50">
                    <h3 className="text-xl font-bold text-white">Add New Skill</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {error && (
                        <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg text-sm">
                            {error}
                        </div>
                    )}

                    <div>
                        <label className="text-slate-300 text-sm font-medium block mb-2">Skill Name *</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g. React Native"
                            required
                            className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:border-cyan-500 placeholder-slate-500"
                        />
                    </div>

                    <div>
                        <label className="text-slate-300 text-sm font-medium block mb-2">Category</label>
                        <select
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:border-cyan-500 cursor-pointer"
                        >
                            <option value="Technical">Technical</option>
                            <option value="Soft Skill">Soft Skill</option>
                            <option value="Management">Management</option>
                            <option value="Language">Language</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>

                    <div>
                        <label className="text-slate-300 text-sm font-medium block mb-2">Description</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Optional description..."
                            rows="2"
                            className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:border-cyan-500 placeholder-slate-500 resize-none"
                        />
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-all flex items-center justify-center gap-2"
                        >
                            {loading ? 'Adding...' : <><Check className="w-4 h-4" /> Add Skill</>}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddSkillModal;
