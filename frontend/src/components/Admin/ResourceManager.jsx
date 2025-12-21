import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { BookOpen, Plus, Edit, Trash2, Link as LinkIcon, Search, Filter, Shield, Users } from 'lucide-react';
import ConfirmationModal from '../Modals/ConfirmationModal';
import AddSkillModal from './AddSkillModal'; // Import the new modal
import { useAuth } from '../../store/useAuth';

// =================================================================================================
// Resource Manager Component
// -------------------------------------------------------------------------------------------------
// Manages the organization's resource library.
// Actions:
// - View, Search, Filter Resources.
// - Add/Edit Resource (supports URL or File).
// - Delete Resource.
// - Create new Skills on the fly.
// Access:
// - Admin/Manager: Full CRUD (Manager restricted to own).
// - Employee: View only (Team restricted to team members).
// =================================================================================================

const ResourceManager = () => {
    // =================================================================================================
    // State Definitions
    // -------------------------------------------------------------------------------------------------
    const { user } = useAuth();
    const [resources, setResources] = useState([]);
    const [skills, setSkills] = useState([]);
    const [loading, setLoading] = useState(true);
    const [skillsLoading, setSkillsLoading] = useState(true);
    const [showAddForm, setShowAddForm] = useState(false);
    const [isSkillModalOpen, setIsSkillModalOpen] = useState(false); // State for Skill Modal
    const [editingResource, setEditingResource] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('all');
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        type: 'course',
        skill: '',
        targetLevel: 1 // Default target level
    });
    const [uploadMode, setUploadMode] = useState('url'); // 'url' or 'file'
    const [selectedFile, setSelectedFile] = useState(null);
    const [uploadProgress, setUploadProgress] = useState(0); // Track upload progress
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

    const canAdd = user?.role === 'admin' || user?.role === 'manager';

    const canEditOrDelete = (resource) => {
        if (!user) return false;
        if (user.role === 'admin') return true;
        if (user.role === 'manager') {
            // Check ownership. resource.createdBy can be an object or ID string depending on population
            const creatorId = typeof resource.createdBy === 'object' ? resource.createdBy?._id : resource.createdBy;
            return creatorId === user._id || creatorId === user.id; // user object usually has _id
        }
        return false;
    };

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
        fetchResources();
        fetchSkills();
    }, []);

    const fetchResources = async () => {
        try {
            const res = await api.get('/resource/all');
            // Backend returns {resources: [...], source: "cache|database"}
            // Map resources to ensure consistent ID access if needed
            setResources(res.data.resources || res.data);
        } catch (err) {
            console.error('Failed to fetch resources:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchSkills = async () => {
        try {
            const res = await api.get('/skill/all');
            setSkills(res.data.skills || res.data);
        } catch (err) {
            console.error('Failed to fetch skills:', err);
        } finally {
            setSkillsLoading(false);
        }
    };

    const handleSkillAdded = (newSkill) => {
        setSkills(prev => [...prev, newSkill]);
        setFormData(prev => ({ ...prev, skill: newSkill._id })); // Auto-select the new skill
        // Optionally show success message
    };

    const handleAddResource = async () => {
        // Validation: Title and Skill are always required
        if (!formData.title || !formData.skill) {
            showAlert('Title and Related Skill are required', 'Validation Error');
            return;
        }

        // Validation: Either URL or File is required
        if (uploadMode === 'url' && !formData.url) {
            showAlert('Resource URL is required', 'Validation Error');
            return;
        }
        if (uploadMode === 'file' && !selectedFile && !editingResource) {
            showAlert('Please upload a file', 'Validation Error');
            return;
        }

        try {
            // Create FormData object
            const data = new FormData();
            data.append('title', formData.title);
            data.append('description', formData.description);
            data.append('type', formData.type);
            data.append('skill', formData.skill);
            data.append('targetLevel', formData.targetLevel);

            if (uploadMode === 'url') {
                data.append('url', formData.url);
            } else if (selectedFile) {
                data.append('file', selectedFile);
            }

            const config = {
                headers: { 'Content-Type': 'multipart/form-data' },
                onUploadProgress: (progressEvent) => {
                    const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    setUploadProgress(percentCompleted);
                }
            };

            if (editingResource) {
                await api.put(`/resource/update/${editingResource._id}`, data, config);
                showAlert('Resource updated successfully', 'Success');
            } else {
                await api.post('/resource/add', data, config);
                showAlert('Resource added successfully', 'Success');
            }
            setShowAddForm(false);
            setEditingResource(null);
            setSelectedFile(null); // Reset file
            setUploadProgress(0); // Reset progress
            fetchResources();
            resetForm();
        } catch (err) {
            console.error(err);
            setUploadProgress(0);
            showAlert(`Failed to ${editingResource ? 'update' : 'add'} resource. ${err.response?.data?.message || ''}`, 'Error');
        }
    };

    const handleEditResource = (resource) => {
        setEditingResource(resource);
        setFormData({
            title: resource.title,
            description: resource.description || '',
            url: resource.url || resource.link, // Handle both url (backend) and link (frontend legacy) if any
            type: resource.type || 'course',
            skill: typeof resource.skill === 'object' ? resource.skill._id : resource.skill,
            targetLevel: resource.targetLevel || 1
        });
        setShowAddForm(true);
    };

    const handleDeleteResource = (id) => {
        setModalConfig({
            isOpen: true,
            title: 'Delete Resource',
            message: 'Are you sure you want to delete this resource?',
            showCancel: true,
            confirmText: 'Delete',
            isDestructive: true,
            onConfirm: async () => {
                try {
                    await api.delete(`/resource/delete/${id}`);
                    fetchResources();
                    closeModal();
                    setTimeout(() => showAlert('Resource deleted', 'Success'), 200);
                } catch (err) {
                    closeModal();
                    setTimeout(() => showAlert('Failed to delete resource', 'Error'), 200);
                }
            }
        });
    };

    const resetForm = () => {
        setFormData({ title: '', description: '', url: '', type: 'course', skill: '', targetLevel: 1 });
        setUploadMode('url');
        setSelectedFile(null);
    };
    // Helper Functions ends here

    const filteredResources = resources.filter(resource => {
        const matchesSearch = resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            resource.description?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = filterType === 'all' || resource.type === filterType;
        return matchesSearch && matchesType;
    });

    if (loading) return (
        <div className="flex items-center justify-center h-64">
            <div className="text-center">
                <div className="inline-block w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-slate-400">Loading resources...</p>
            </div>
        </div>
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-white flex items-center gap-3">
                        <BookOpen className="w-8 h-8 text-cyan-400" />
                        Resource Library
                    </h2>
                    <p className="text-slate-400 mt-1">{resources.length} total resources available</p>
                </div>
                {canAdd && (
                    <button
                        onClick={() => {
                            setShowAddForm(!showAddForm);
                            if (!showAddForm) {
                                setEditingResource(null);
                                resetForm();
                            }
                        }}
                        className="px-6 py-3 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg flex items-center gap-2 transition-all shadow-lg">
                        <Plus className="w-5 h-5" /> Add Resource
                    </button>
                )}
            </div>

            {/* Search and Filter */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search resources..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-slate-800 border border-slate-700 text-white rounded-lg focus:outline-none focus:border-cyan-500"
                    />
                </div>
                <div className="relative">
                    <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <select
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value)}
                        className="w-full md:w-48 pl-10 pr-4 py-3 bg-slate-800 border border-slate-700 text-white rounded-lg focus:outline-none focus:border-cyan-500 cursor-pointer">
                        <option value="all">All Types</option>
                        <option value="course">Courses</option>
                        <option value="article">Articles</option>
                        <option value="video">Videos</option>
                        <option value="book">Books</option>
                        <option value="certification">Certifications</option>
                        <option value="document">Documents</option>
                        <option value="other">Other</option>
                    </select>
                </div>
            </div>

            {/* Add/Edit Resource Form */}
            {showAddForm && (
                <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 shadow-2xl">
                    <h3 className="text-xl font-semibold text-white mb-4">
                        {editingResource ? 'Edit Resource' : 'Add New Resource'}
                    </h3>
                    <div className="space-y-4">
                        <div>
                            <label className="text-slate-300 text-sm font-medium block mb-2">Resource Title *</label>
                            <input
                                type="text"
                                placeholder="e.g., Advanced React Patterns"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-cyan-500"
                            />
                        </div>

                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <label className="text-slate-300 text-sm font-medium">Related Skill *</label>
                                <button
                                    onClick={() => setIsSkillModalOpen(true)}
                                    className="text-cyan-400 text-xs hover:text-cyan-300 flex items-center gap-1 transition-colors"
                                >
                                    <Plus className="w-3 h-3" /> New Skill
                                </button>
                            </div>

                            {skillsLoading ? (
                                <p className="text-slate-500 text-sm">Loading skills...</p>
                            ) : (
                                <select
                                    value={formData.skill}
                                    onChange={(e) => setFormData({ ...formData, skill: e.target.value })}
                                    className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-cyan-500 cursor-pointer">
                                    <option value="">Select a skill</option>
                                    {skills.map(skill => (
                                        <option key={skill._id} value={skill._id}>
                                            {skill.name} ({skill.category})
                                        </option>
                                    ))}
                                </select>
                            )}
                        </div>

                        <div>
                            <label className="text-slate-300 text-sm font-medium block mb-2">Target Proficiency Level (1-10)</label>
                            <select
                                value={formData.targetLevel}
                                onChange={(e) => setFormData({ ...formData, targetLevel: parseInt(e.target.value) })}
                                className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-cyan-500 cursor-pointer"
                            >
                                {[...Array(10)].map((_, i) => (
                                    <option key={i + 1} value={i + 1}>
                                        Level {i + 1} {i + 1 === 1 ? '(Beginner)' : i + 1 === 5 ? '(Intermediate)' : i + 1 === 10 ? '(Expert)' : ''}
                                    </option>
                                ))}
                            </select>
                            <p className="text-xs text-slate-500 mt-1">Completion of this resource will boost the learner to this level.</p>
                        </div>

                        <div>
                            <label className="text-slate-300 text-sm font-medium block mb-2">Description</label>
                            <textarea
                                placeholder="Brief description of the resource..."
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-cyan-500 min-h-[100px]"
                            />
                        </div>
                        <div>
                            <label className="text-slate-300 text-sm font-medium block mb-2">Resource Content</label>

                            {/* Toggle Switch */}
                            <div className="flex bg-slate-900 border border-slate-700 rounded-lg p-1 mb-3 w-fit">
                                <button
                                    onClick={() => setUploadMode('url')}
                                    className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${uploadMode === 'url' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white'
                                        }`}
                                >
                                    External URL
                                </button>
                                <button
                                    onClick={() => setUploadMode('file')}
                                    className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${uploadMode === 'file' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white'
                                        }`}
                                >
                                    Upload File
                                </button>
                            </div>

                            {uploadMode === 'url' ? (
                                <input
                                    type="url"
                                    placeholder="https://example.com/resource"
                                    value={formData.url}
                                    onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                                    className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-cyan-500"
                                />
                            ) : (
                                <div className="w-full bg-slate-900 border border-slate-700 border-dashed rounded-lg px-4 py-6 text-center cursor-pointer hover:border-cyan-500 transition-colors relative">
                                    <input
                                        type="file"
                                        className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
                                        onChange={(e) => setSelectedFile(e.target.files[0])}
                                    />
                                    <div className="flex flex-col items-center gap-2">
                                        <div className="p-3 bg-slate-800 rounded-full">
                                            <LinkIcon className="w-6 h-6 text-cyan-400" />
                                        </div>
                                        <p className="text-slate-300 font-medium">
                                            {selectedFile ? selectedFile.name : "Click to upload or drag and drop"}
                                        </p>
                                        <p className="text-slate-500 text-xs">PDF, Video, Docs (Max 5GB)</p>
                                    </div>
                                </div>
                            )}

                            {/* Progress Bar */}
                            {uploadProgress > 0 && (
                                <div className="mt-4">
                                    <div className="flex justify-between text-xs text-slate-400 mb-1">
                                        <span>Uploading...</span>
                                        <span>{uploadProgress}%</span>
                                    </div>
                                    <div className="w-full bg-slate-700 rounded-full h-2 overflow-hidden">
                                        <div
                                            className="bg-cyan-500 h-2 rounded-full transition-all duration-300"
                                            style={{ width: `${uploadProgress}%` }}
                                        ></div>
                                    </div>
                                </div>
                            )}
                        </div>
                        <div>
                            <label className="text-slate-300 text-sm font-medium block mb-2">Resource Type</label>
                            <select
                                value={formData.type}
                                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-cyan-500 cursor-pointer">
                                <option value="course">Course</option>
                                <option value="article">Article</option>
                                <option value="video">Video</option>
                                <option value="book">Book</option>
                                <option value="certification">Certification</option>
                                <option value="document">Document</option>
                                <option value="other">Other</option>
                            </select>
                        </div>
                        <div className="flex gap-3 pt-4">
                            <button
                                onClick={handleAddResource}
                                disabled={uploadProgress > 0 && uploadProgress < 100}
                                className={`px-6 py-3 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg font-medium transition-all ${uploadProgress > 0 && uploadProgress < 100 ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                {uploadProgress > 0 && uploadProgress < 100 ? `Uploading ${uploadProgress}%...` : (editingResource ? 'Update Resource' : 'Add Resource')}
                            </button>
                            <button
                                onClick={() => {
                                    if (uploadProgress > 0 && uploadProgress < 100) return; // Prevent closing while uploading
                                    setShowAddForm(false);
                                    setEditingResource(null); // Fixed: setEditingResource instead of setEditingResource(null) inside resetForm logic if duplicated
                                    resetForm();
                                }}
                                className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition-all">
                                {editingResource ? 'Cancel Edit' : 'Cancel'}
                            </button>
                        </div>
                    </div>
                </div >
            )}

            {/* Resources Grid */}
            {
                filteredResources.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredResources.map(resource => (
                            <div key={resource._id} className="bg-slate-800 border border-slate-700 rounded-xl p-6 hover:border-cyan-500/50 transition-all group relative overflow-hidden">
                                {/* Visibility Badge */}
                                {resource.visibility === 'team' && (
                                    <div className="absolute top-0 right-0 bg-purple-600/90 text-white text-[10px] px-2 py-1 rounded-bl-lg flex items-center gap-1">
                                        <Users className="w-3 h-3" /> Team Only
                                    </div>
                                )}

                                <div className="flex justify-between items-start mb-3">
                                    <span className="px-3 py-1 bg-cyan-500/20 text-cyan-300 text-xs font-semibold rounded-full capitalize">
                                        {resource.type}
                                    </span>
                                    {canEditOrDelete(resource) && (
                                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => handleEditResource(resource)}
                                                className="text-blue-400 hover:text-blue-300 transition-colors bg-slate-700/50 p-1.5 rounded-full hover:bg-slate-700">
                                                <Edit className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteResource(resource._id)}
                                                className="text-red-400 hover:text-red-300 transition-colors bg-slate-700/50 p-1.5 rounded-full hover:bg-slate-700">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    )}
                                </div>

                                <h4 className="text-white font-semibold text-lg mb-2 line-clamp-2" title={resource.title}>{resource.title}</h4>
                                <p className="text-slate-400 text-sm mb-4 line-clamp-3 h-[60px]">{resource.description || 'No description provided'}</p>

                                <div className="flex items-center justify-between text-xs border-t border-slate-700 pt-3">
                                    <span className="text-slate-500 flex items-center gap-1">
                                        {resource.visibility === 'public' ? (
                                            <Shield className="w-3 h-3 text-green-400" />
                                        ) : (
                                            <Users className="w-3 h-3 text-purple-400" />
                                        )}
                                        {resource.visibility === 'public' ? 'Public' : 'Team'}
                                    </span>
                                    {(resource.url || resource.link) && (
                                        <a
                                            href={resource.url || resource.link}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-1 text-cyan-400 hover:text-cyan-300 transition-colors font-medium">
                                            <LinkIcon className="w-3 h-3" /> Open Link
                                        </a>
                                    )}
                                </div>
                                {resource.targetLevel && (
                                    <div className="absolute top-0 left-0 bg-slate-900/90 text-slate-300 text-[10px] px-2 py-1 rounded-br-lg border-r border-b border-slate-700">
                                        Level {resource.targetLevel}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-16 bg-slate-800/50 border border-slate-700 rounded-2xl">
                        <BookOpen className="w-16 h-16 mx-auto mb-4 text-slate-600" />
                        <p className="text-slate-400 font-medium">
                            {searchTerm || filterType !== 'all' ? 'No resources match your search' : 'No resources available yet'}
                        </p>
                        <p className="text-slate-500 text-sm mt-2">
                            {searchTerm || filterType !== 'all' ? 'Try adjusting your filters' : (canAdd ? 'Click "Add Resource" to get started' : 'Pending resources from your manager or admin')}
                        </p>
                    </div>
                )
            }

            <AddSkillModal
                isOpen={isSkillModalOpen}
                onClose={() => setIsSkillModalOpen(false)}
                onSkillAdded={handleSkillAdded}
            />

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

export default ResourceManager;
