import React, { useState } from 'react';
import { MessageSquare, X } from 'lucide-react';

// =================================================================================================
// Feedback Modal Component
// -------------------------------------------------------------------------------------------------
// Simple modal for collecting text feedback.
// Used for rejecting IDPs, requesting changes, or general notes.
// =================================================================================================

const FeedbackModal = ({ isOpen, onClose, onConfirm, title, placeholder = "Enter your feedback..." }) => {
    const [feedback, setFeedback] = useState("");

    if (!isOpen) return null;

    const handleSubmit = () => {
        onConfirm(feedback);
        setFeedback(""); // Reset
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl relative animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="p-6 border-b border-slate-800 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-400">
                            <MessageSquare className="w-5 h-5" />
                        </div>
                        <h3 className="text-xl font-bold text-white">{title || "Provide Feedback"}</h3>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6">
                    <textarea
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-colors resize-none h-32"
                        placeholder={placeholder}
                        value={feedback}
                        onChange={(e) => setFeedback(e.target.value)}
                        autoFocus
                    />
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-slate-800 bg-slate-900/50 flex justify-end gap-3 rounded-b-2xl">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-slate-400 hover:text-white font-medium transition-colors border border-transparent hover:border-slate-800 rounded-lg"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={!feedback.trim()}
                        className="px-6 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-purple-900/20 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Submit Feedback
                    </button>
                </div>
            </div>
        </div>
    );
};

export default FeedbackModal;
