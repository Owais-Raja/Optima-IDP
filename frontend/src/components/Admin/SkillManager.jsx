import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useAuth } from '../../store/useAuth';
import { Search, Filter, Plus, Edit, Trash2, Check, X, Shield, Briefcase } from 'lucide-react';
import ConfirmationModal from '../Modals/ConfirmationModal';

// =================================================================================================
// Skill Manager Component
// -------------------------------------------------------------------------------------------------
// Manages the organization's skill taxonomy.
// Actions:
// - View, Search, Filter Skills.
// - Create/Edit/Delete Skills.
// Access:
// - Admin: Full Access.
// - Manager: Can manage skills created by themselves (permission logic included).
// =================================================================================================

const SkillManager = () => {
    // =================================================================================================
    // State Definitions
    // -------------------------------------------------------------------------------------------------
    const { user } = useAuth();
    const [skills, setSkills] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState('All');

    // Form State
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingSkill, setEditingSkill] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        category: 'Technical',
        description: ''
    });

    // Confirmation Modal
    const [modalConfig, setModalConfig] = useState({
        isOpen: false,
        title: '',
        message: '',
        showCancel: false,
        isDestructive: false
    });
    // State Definitions ends here

    // =================================================================================================
    // Helper Functions
    // -------------------------------------------------------------------------------------------------
    useEffect(() => {
        fetchSkills();
    }, []);

    const fetchSkills = async () => {
        try {
            setLoading(true);
            const res = await api.get('/skill/all');
            setSkills(res.data.skills || res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            if (editingSkill) {
                await api.put(`/skill/update/${editingSkill._id}`, formData);
            } else {
                await api.post('/skill/add', formData);
            }
            fetchSkills();
            closeForm();
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.message || "Failed to save skill");
        }
    };

    const handleDelete = async (id) => {
        setModalConfig({
            isOpen: true,
            title: 'Delete Skill',
            message: 'Are you sure? This effectively removes it from any associated resources.',
            showCancel: true,
            isDestructive: true,
            onConfirm: async () => {
                try {
                    await api.delete(`/skill/delete/${id}`);
                    fetchSkills();
                    setModalConfig(prev => ({ ...prev, isOpen: false }));
                } catch (err) {
                    console.error(err);
                    alert("Failed to delete skill");
                }
            }
        });
    };

    const openForm = (skill = null) => {
        if (skill) {
            setEditingSkill(skill);
            setFormData({
                name: skill.name,
                category: skill.category,
                description: skill.description || ''
            });
        } else {
            setEditingSkill(null);
            setFormData({ name: '', category: 'Technical', description: '' });
        }
        setIsFormOpen(true);
    };

    const closeForm = () => {
        setIsFormOpen(false);
        setEditingSkill(null);
    };
    // Helper Functions ends here

    // Filter Logic
    const categories = ['All', ...new Set(skills.map(s => s.category))];
    const filteredSkills = skills.filter(skill => {
        const matchesSearch = skill.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = filterCategory === 'All' || skill.category === filterCategory;
        return matchesSearch && matchesCategory;
    });

    // Permission check for Edit/Delete (Admin can do all, Manager only own)
    const hasPermission = (skill) => {
        if (!user) return false;
        if (user.role === 'admin') return true;

        // createdBy might be an object (populated) or string
        const creatorId = typeof skill.createdBy === 'object' ? skill.createdBy?._id : skill.createdBy;
        return user.role === 'manager' && creatorId === user.id;
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                        <Briefcase className="w-7 h-7 text-purple-400" />
                        Skill Management
                    </h2>
                    <p className="text-slate-400 text-sm mt-1">
                        Manage the skill taxonomy for your organization.
                    </p>
                </div>
                <button
                    onClick={() => openForm()}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg flex items-center gap-2 transition-all shadow-lg"
                >
                    <Plus className="w-5 h-5" /> Add New Skill
                </button>
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4 bg-slate-900/50 p-4 rounded-xl border border-slate-800">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                    <input
                        type="text"
                        placeholder="Search skills..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-10 pr-4 py-2 text-white focus:outline-none focus:border-purple-500"
                    />
                </div>
                <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
                    <Filter className="w-5 h-5 text-slate-500" />
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setFilterCategory(cat)}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${filterCategory === cat
                                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                                : 'bg-slate-800 text-slate-400 hover:text-white'
                                }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            {/* List */}
            {loading ? (
                <div className="flex items-center justify-center h-64">
                    <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
            ) : filteredSkills.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredSkills.map(skill => (
                        <div key={skill._id} className="group bg-slate-800 border border-slate-700 rounded-xl p-5 hover:border-purple-500/50 transition-all">
                            <div className="flex justify-between items-start mb-2">
                                <span className={`px-2 py-1 rounded text-xs font-semibold ${skill.category === 'Technical' ? 'bg-blue-500/20 text-blue-300' :
                                    skill.category === 'Soft Skill' ? 'bg-green-500/20 text-green-300' :
                                        'bg-slate-700 text-slate-300'
                                    }`}>
                                    {skill.category}
                                </span>
                                {hasPermission(skill) && (
                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => openForm(skill)}
                                            className="p-1.5 hover:bg-slate-700 text-slate-400 hover:text-white rounded"
                                        >
                                            <Edit className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(skill._id)}
                                            className="p-1.5 hover:bg-slate-700 text-red-400 hover:text-red-300 rounded"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                )}
                            </div>
                            <h3 className="text-lg font-semibold text-white mb-2">{skill.name}</h3>
                            <p className="text-slate-400 text-sm line-clamp-2 h-10 mb-2">
                                {skill.description || "No description provided."}
                            </p>

                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-12 bg-slate-900/50 rounded-2xl border border-slate-800 border-dashed">
                    <Briefcase className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                    <p className="text-slate-400 font-medium">No skills found.</p>
                </div>
            )}

            {/* Add/Edit Modal (Inline for now or Overlay) */}
            {isFormOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center p-6 border-b border-slate-800">
                            <h3 className="text-xl font-bold text-white">{editingSkill ? 'Edit Skill' : 'New Skill'}</h3>
                            <button onClick={closeForm} className="text-slate-400 hover:text-white">
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        <form onSubmit={handleSave} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-1">Name</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-1">Category</label>
                                <select
                                    value={formData.category}
                                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
                                >
                                    <option>Technical</option>
                                    <option>Soft Skill</option>
                                    <option>Management</option>
                                    <option>Language</option>
                                    <option>Other</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-1">Description</label>
                                <textarea
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500 h-24 resize-none"
                                />
                            </div>
                            <div className="flex gap-3 pt-4">
                                <button type="button" onClick={closeForm} className="flex-1 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-medium transition-colors">
                                    Cancel
                                </button>
                                <button type="submit" className="flex-1 px-4 py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-lg font-medium transition-colors">
                                    {editingSkill ? 'Save Changes' : 'Create Skill'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <ConfirmationModal
                isOpen={modalConfig.isOpen}
                onClose={() => setModalConfig(prev => ({ ...prev, isOpen: false }))}
                onConfirm={modalConfig.onConfirm}
                title={modalConfig.title}
                message={modalConfig.message}
                showCancel={modalConfig.showCancel}
                isDestructive={modalConfig.isDestructive}
            />
        </div>
    );
};

export default SkillManager;
