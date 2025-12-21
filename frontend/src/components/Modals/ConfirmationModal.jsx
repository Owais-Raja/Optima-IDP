import React from 'react';
import { AlertCircle } from 'lucide-react';

// =================================================================================================
// Confirmation Modal Component
// -------------------------------------------------------------------------------------------------
// Generic modal for confirming actions.
// Supports destructive warning styles and custom text.
// =================================================================================================

function ConfirmationModal({ isOpen, onClose, onConfirm, title, message, confirmText = "Confirm", isDestructive = false, showCancel = true }) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-sm overflow-hidden relative shadow-2xl animate-in zoom-in-95 duration-200">
                <div className="p-6 text-center">
                    <div className={`mx-auto w-12 h-12 rounded-full flex items-center justify-center mb-4 ${isDestructive ? 'bg-red-500/10 text-red-500' : 'bg-slate-800 text-slate-400'}`}>
                        <AlertCircle className="w-6 h-6" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
                    <p className="text-slate-400 text-sm mb-6">{message}</p>

                    <div className="flex gap-3 justify-center">
                        {showCancel && (
                            <button
                                onClick={onClose}
                                className="px-4 py-2 text-slate-400 hover:text-white font-medium transition-colors border border-transparent hover:border-slate-800 rounded-lg"
                            >
                                Cancel
                            </button>
                        )}
                        <button
                            onClick={onConfirm}
                            className={`px-6 py-2 font-bold rounded-xl transition-all shadow-lg ${isDestructive
                                ? 'bg-red-500 hover:bg-red-400 text-white shadow-red-900/20'
                                : 'bg-amber-500 hover:bg-amber-400 text-slate-900 shadow-amber-900/20'
                                }`}
                        >
                            {confirmText}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ConfirmationModal;
