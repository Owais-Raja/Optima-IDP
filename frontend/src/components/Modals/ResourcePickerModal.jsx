import React, { useState, useEffect } from 'react';
import { X, Search, BookOpen, Filter, CheckCircle, Plus } from 'lucide-react';
import api from '../../services/api';

// =================================================================================================
// Resource Picker Modal Component
// -------------------------------------------------------------------------------------------------
// Allows selecting resources from the library to add to an IDP or Goal.
// Features:
// - Search and filter resources.
// - Multi-select capability.
// - Excludes already active resources.
// =================================================================================================

const ResourcePickerModal = ({ isOpen, onClose, onSelect, activeResources = [] }) => {
    // =================================================================================================
    // State Definitions
    // -------------------------------------------------------------------------------------------------
    const [resources, setResources] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedResources, setSelectedResources] = useState([]);
    const [filterType, setFilterType] = useState('all');
    // State Definitions ends here

    useEffect(() => {
        if (isOpen) {
            fetchResources();
            setSelectedResources([]);
        }
    }, [isOpen]);

    const fetchResources = async () => {
        try {
            setLoading(true);
            const res = await api.get('/resource/all');
            setResources(res.data.resources);
        } catch (error) {
            console.error("Failed to fetch resources", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSelect = (resource) => {
        // Toggle selection
        if (selectedResources.find(r => r._id === resource._id)) {
            setSelectedResources(prev => prev.filter(r => r._id !== resource._id));
        } else {
            setSelectedResources(prev => [...prev, resource]);
        }
    };

    const handleSubmit = () => {
        onSelect(selectedResources);
        onClose();
    };

    if (!isOpen) return null;

    // Filter Logic
    const filteredResources = resources.filter(resource => {
        const matchesSearch = resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (resource.skill?.name || '').toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = filterType === 'all' || resource.type === filterType;

        // Exclude resources already in the IDP
        const isAlreadyAdded = activeResources.some(ar => (ar.resource?._id || ar.resource) === resource._id);

        return matchesSearch && matchesType && !isAlreadyAdded;
    });

    const resourceTypes = ['all', ...new Set(resources.map(r => r.type).filter(Boolean))];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl max-h-[85vh] flex flex-col shadow-2xl">

                {/* Header */}
                <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900/50 rounded-t-2xl backdrop-blur-md">
                    <div>
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            <BookOpen className="w-5 h-5 text-purple-400" />
                            Resource Library
                        </h2>
                        <p className="text-slate-400 text-sm">Select resources to add to your development plan</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Filters */}
                <div className="p-4 border-b border-slate-800 gap-4 flex flex-col md:flex-row bg-slate-900/30">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <input
                            type="text"
                            placeholder="Search resources by title or skill..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-slate-800 border border-slate-700 text-white pl-10 pr-4 py-2 rounded-lg focus:outline-none focus:border-purple-500 transition-colors"
                        />
                    </div>
                    <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
                        {resourceTypes.map(type => (
                            <button
                                key={type}
                                onClick={() => setFilterType(type)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition-colors whitespace-nowrap ${filterType === type
                                    ? 'bg-purple-500 text-white shadow-lg shadow-purple-900/20'
                                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                                    }`}
                            >
                                {type}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 min-h-[300px]">
                    {loading ? (
                        <div className="flex justify-center items-center h-full text-slate-500">
                            Loading resources...
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {filteredResources.length > 0 ? (
                                filteredResources.map(resource => {
                                    const isSelected = selectedResources.some(r => r._id === resource._id);
                                    return (
                                        <div
                                            key={resource._id}
                                            onClick={() => handleSelect(resource)}
                                            className={`p-4 rounded-xl border cursor-pointer relative group transition-all ${isSelected
                                                ? 'bg-purple-500/10 border-purple-500/50 shadow-inner'
                                                : 'bg-slate-800/50 border-slate-700 hover:border-slate-600 hover:bg-slate-800'
                                                }`}
                                        >
                                            <div className="flex justify-between items-start mb-2">
                                                <span className="text-xs font-mono uppercase text-slate-500 border border-slate-700 px-2 py-0.5 rounded">
                                                    {resource.type}
                                                </span>
                                                {isSelected && <CheckCircle className="w-5 h-5 text-purple-400" />}
                                                {!isSelected && (
                                                    <div className="w-5 h-5 rounded-full border border-slate-600 group-hover:border-purple-400 transition-colors"></div>
                                                )}
                                            </div>

                                            <h3 className={`font-bold mb-1 line-clamp-2 ${isSelected ? 'text-purple-200' : 'text-slate-200'}`}>
                                                {resource.title}
                                            </h3>

                                            <div className="flex items-center gap-2 text-xs text-slate-500 mt-2">
                                                <span>{resource.provider || 'Internal'}</span>
                                                <span>•</span>
                                                <span className="bg-slate-800 px-1.5 py-0.5 rounded text-slate-400">
                                                    {resource.skill?.name || 'General'}
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="col-span-full text-center py-12 text-slate-500">
                                    <p>No matching resources found.</p>
                                    {(searchTerm || filterType !== 'all') && (
                                        <button
                                            onClick={() => { setSearchTerm(''); setFilterType('all'); }}
                                            className="text-purple-400 text-sm hover:underline mt-2"
                                        >
                                            Clear filters
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-slate-800 bg-slate-900/50 rounded-b-2xl backdrop-blur-md flex justify-between items-center">
                    <div className="text-sm text-slate-400">
                        {selectedResources.length} resource{selectedResources.length !== 1 ? 's' : ''} selected
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 hover:bg-slate-800 text-slate-300 rounded-lg transition-colors font-medium"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={selectedResources.length === 0}
                            className={`px-6 py-2 rounded-lg font-bold transition-all flex items-center gap-2 ${selectedResources.length > 0
                                ? 'bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-900/20'
                                : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                                }`}
                        >
                            <Plus className="w-4 h-4" />
                            Add Selected
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default ResourcePickerModal;
