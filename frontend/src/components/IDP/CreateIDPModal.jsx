import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useAuth } from '../../store/useAuth';
import ConfirmationModal from '../Modals/ConfirmationModal';

// =================================================================================================
// Create IDP Modal Component
// -------------------------------------------------------------------------------------------------
// Multi-step wizard for creating a new Individual Development Plan (IDP).
// Steps:
// 1. Select Target Skill & Define Goal.
// 2. AI Recommendations (Resources & Activities).
// 3. Finalize & Create.
// =================================================================================================

const CreateIDPModal = ({ isOpen, onClose, onCreated }) => {
    // =================================================================================================
    // State Definitions
    // -------------------------------------------------------------------------------------------------
    const { user } = useAuth();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [skills, setSkills] = useState([]);

    // Form State
    const [targetSkillId, setTargetSkillId] = useState('');
    const [targetSkillName, setTargetSkillName] = useState('');
    const [targetLevel, setTargetLevel] = useState(5); // Default to 5
    const [goals, setGoals] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [selectedResources, setSelectedResources] = useState([]);
    const [modalConfig, setModalConfig] = useState({
        isOpen: false,
        title: '',
        message: '',
        type: 'info',
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
    // Fetch skills on mount
    useEffect(() => {
        if (isOpen) {
            fetchSkills();
            setStep(1);
            setSuggestions([]);
            setSelectedResources([]);
            setTargetSkillId('');
            setGoals('');
        }
    }, [isOpen]);

    const fetchSkills = async () => {
        try {
            // Using api service which automatically handles the token
            const res = await api.get('/skill/all');
            setSkills(res.data.skills || []);
        } catch (err) {
            console.error("Failed to fetch skills", err);
            setSkills([]);
        }
    };

    const handleGenerate = async () => {
        if (!targetSkillId) return;
        setLoading(true);
        try {
            // Prepare payload for backend
            const payload = {
                targetSkills: [{ skillId: targetSkillId, targetLevel: targetLevel }] // Dynamic target level
            };

            const res = await api.post('/recommender/suggestions', payload);

            setSuggestions(res.data.recommendations);
            // Auto-select top 3
            setSelectedResources(res.data.recommendations.slice(0, 3).map(r => r.resourceId));
            setStep(2);
        } catch (err) {
            console.error("Failed to generate suggestions", err);
            showAlert("Failed to generate suggestions. Please try again.", "Error");
        } finally {
            setLoading(false);
        }
    };

    const toggleResource = (id) => {
        if (selectedResources.includes(id)) {
            setSelectedResources(selectedResources.filter(r => r !== id));
        } else {
            setSelectedResources([...selectedResources, id]);
        }
    };

    const handleCreate = async () => {
        setLoading(true);
        try {
            const payload = {
                goals,
                skillsToImprove: [{ skill: targetSkillId, targetLevel: targetLevel }],
                recommendedResources: selectedResources
            };

            await api.post('/idp/create', payload);

            onCreated();
            onClose();
        } catch (err) {
            console.error("Failed to create IDP. Details:", err.response?.data || err);
            const errMsg = err.response?.data?.message || err.response?.data?.error || "Unknown error occurred";
            alert(`Failed to create IDP: ${errMsg}`);
        } finally {
            setLoading(false);
        }
    };
    // Helper Functions ends here

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="p-6 border-b border-slate-800 bg-slate-900/50">
                    <div className="flex justify-between items-center">
                        <h2 className="text-xl font-bold text-white">Create Development Plan</h2>
                        <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    </div>
                    {/* Progress Steps */}
                    <div className="flex gap-2 mt-4">
                        <div className={`h-1 flex-1 rounded-full ${step >= 1 ? 'bg-purple-500' : 'bg-slate-700'}`} />
                        <div className={`h-1 flex-1 rounded-full ${step >= 2 ? 'bg-purple-500' : 'bg-slate-700'}`} />
                    </div>
                </div>

                {/* content */}
                <div className="p-6 overflow-y-auto flex-1">
                    {step === 1 && (
                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">Target Skill</label>
                                <select
                                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                                    value={targetSkillId}
                                    onChange={(e) => {
                                        setTargetSkillId(e.target.value);
                                        const skill = skills.find(s => s._id === e.target.value);
                                        if (skill) setTargetSkillName(skill.name);
                                    }}
                                >
                                    <option value="">Select a skill to improve...</option>
                                    {Array.from(new Map(skills.map(skill => [skill._id, skill])).values()).map(skill => (
                                        <option key={skill._id} value={skill._id}>{skill.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex gap-4">
                                <div className="flex-1">
                                    <label className="block text-sm font-medium text-slate-300 mb-2">Target Proficiency Level (1-10)</label>
                                    <select
                                        className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                                        value={targetLevel}
                                        onChange={(e) => setTargetLevel(parseInt(e.target.value))}
                                    >
                                        {[...Array(10)].map((_, i) => (
                                            <option key={i + 1} value={i + 1}>Level {i + 1} {i + 1 === 5 ? '(Intermediate)' : i + 1 === 10 ? '(Expert)' : ''}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">Goal Statement</label>
                                <textarea
                                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all h-32 resize-none"
                                    placeholder="e.g. I want to master backend development to lead the next project..."
                                    value={goals}
                                    onChange={(e) => setGoals(e.target.value)}
                                />
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-6">
                            <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-4">
                                <h3 className="text-purple-300 font-semibold mb-1">AI Recommendations</h3>
                                <p className="text-sm text-purple-200/70">Based on your goal to improve <span className="text-white font-medium">{targetSkillName}</span></p>
                            </div>

                            <div className="space-y-3">
                                {Array.from(new Map(suggestions.map(rec => [rec.resourceId, rec])).values()).map((rec) => (
                                    <label key={rec.resourceId} className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all ${selectedResources.includes(rec.resourceId) ? 'bg-slate-800 border-purple-500/50' : 'bg-slate-900 border-slate-800 hover:border-slate-700'}`}>
                                        <input
                                            type="checkbox"
                                            className="mt-1 w-4 h-4 rounded border-slate-600 text-purple-600 focus:ring-purple-500 bg-slate-700"
                                            checked={selectedResources.includes(rec.resourceId)}
                                            onChange={() => toggleResource(rec.resourceId)}
                                        />
                                        <div className="flex-1">
                                            <div className="flex justify-between items-start mb-1">
                                                <h4 className="font-medium text-slate-200">{rec.title}</h4>
                                                <span className="text-xs font-mono text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded">Match: {(rec.score * 100).toFixed(0)}%</span>
                                            </div>
                                            <p className="text-sm text-slate-400 mb-2 line-clamp-2">{rec.provider} • {rec.type} • {rec.difficulty}</p>
                                            <div className="flex gap-2 items-center flex-wrap">
                                                {/* Reasons tags */}
                                                <span className="text-[10px] text-slate-500 bg-slate-800 px-1.5 py-0.5 rounded border border-slate-700">Skill Gap: {rec.scoreBreakdown.skill_gap.toFixed(2)}</span>

                                                {/* "Too Basic" Warning: If user wants level X but resource is too basic */}
                                                {/* Assuming we can infer level from difficulty or it's passed. Here we use a heuristic based on gap or explicit level if available */}
                                                {/* If skill_gap is very low or negative (not possible here usually), or if we had user current level. */}
                                                {/* Let's presume backend sends `isBasic` or similar, or we calculate based on difficulty vs target. */}
                                                {/* For now, let's look at difficulty vs targetLevel (1-3: Beginner, 4-7: Intermediate, 8-10: Advanced) */}
                                                {(
                                                    (targetLevel >= 8 && rec.difficulty === 'beginner') ||
                                                    (targetLevel >= 8 && rec.difficulty === 'intermediate') ||
                                                    (targetLevel >= 5 && rec.difficulty === 'beginner')
                                                ) && (
                                                        <span className="text-[10px] text-amber-400 bg-amber-400/10 px-1.5 py-0.5 rounded border border-amber-400/20 flex items-center gap-1">
                                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                                                            Too Basic?
                                                        </span>
                                                    )}
                                            </div>
                                        </div>
                                    </label>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-slate-800 bg-slate-900/50 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-slate-400 hover:text-white font-medium transition-colors"
                    >
                        Cancel
                    </button>

                    {step === 1 ? (
                        <button
                            onClick={handleGenerate}
                            disabled={!targetSkillId || loading}
                            className="px-6 py-2 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-lg shadow-lg shadow-purple-900/20 transition-all flex items-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Generating...
                                </>
                            ) : (
                                <>
                                    Generate Plan
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                                </>
                            )}
                        </button>
                    ) : (
                        <button
                            onClick={handleCreate}
                            disabled={loading || selectedResources.length === 0}
                            className="px-6 py-2 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-lg shadow-lg shadow-purple-900/20 transition-all flex items-center gap-2"
                        >
                            {loading ? 'Creating...' : 'Create IDP'}
                        </button>
                    )}
                </div>

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

export default CreateIDPModal;
