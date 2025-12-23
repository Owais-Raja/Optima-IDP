import React, { useState } from 'react';
import { Upload, X, CheckCircle, Link as LinkIcon } from 'lucide-react';

// =================================================================================================
// Evidence Modal Component
// -------------------------------------------------------------------------------------------------
// Modal for collecting proof of completion (URL) and verification method.
// Used for completing Resources and verifying Skills.
// =================================================================================================

const EvidenceModal = ({ isOpen, onClose, onConfirm, title = "Add Evidence", showVerificationMethod = false, defaultEvidence = "", defaultMethod = "none" }) => {
    const [evidence, setEvidence] = useState(defaultEvidence);
    const [method, setMethod] = useState(defaultMethod);

    if (!isOpen) return null;

    const handleSubmit = () => {
        onConfirm({ evidence, verificationMethod: method });
        setEvidence(""); // Reset
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl relative animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="p-6 border-b border-slate-800 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400">
                            <Upload className="w-5 h-5" />
                        </div>
                        <h3 className="text-xl font-bold text-white">{title}</h3>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 space-y-6">
                    {/* Evidence URL Input */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                            <LinkIcon className="w-4 h-4 text-purple-400" />
                            Evidence URL (Proof of Completion)
                        </label>
                        <input
                            type="url"
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-colors"
                            placeholder="https://coursera.org/certificate/..."
                            value={evidence}
                            onChange={(e) => setEvidence(e.target.value)}
                            autoFocus
                        />
                        <p className="text-xs text-slate-500">Paste a link to your certificate, project, or completion badge.</p>
                    </div>

                    {/* Verification Method Dropdown (Optional) */}
                    {showVerificationMethod && (
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                                <CheckCircle className="w-4 h-4 text-emerald-400" />
                                Verification Method
                            </label>
                            <select
                                value={method}
                                onChange={(e) => setMethod(e.target.value)}
                                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-purple-500 transition-colors cursor-pointer appearance-none"
                            >
                                <option value="none">None (Self-Reported)</option>
                                <option value="quiz">Quiz / Assessment</option>
                                <option value="manual">Manual Verification (Manager)</option>
                                <option value="certificate">External Certificate</option>
                            </select>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-slate-800 bg-slate-900/50 flex justify-end gap-3 rounded-b-2xl">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-slate-400 hover:text-white font-medium transition-colors border border-transparent hover:border-slate-800 rounded-lg"
                    >
                        Skip / Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-900/20"
                    >
                        Confirm
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EvidenceModal;
