import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import ResourceManager from '../components/Admin/ResourceManager';

// =================================================================================================
// Manager Resources Page
// -------------------------------------------------------------------------------------------------
// Wrapper for ResourceManager component for Manager role.
// =================================================================================================

const ManagerResources = () => {
    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 p-8">
            <div className="max-w-7xl mx-auto space-y-6">
                <div>
                    <Link to="/manager/settings" className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-4">
                        <ChevronLeft className="w-4 h-4" /> Back to Settings
                    </Link>
                    <h1 className="text-3xl font-bold font-display text-white">Team Resources</h1>
                    <p className="text-slate-400 mt-2">
                        Manage learning resources available to your team.
                    </p>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8">
                    <ResourceManager />
                </div>
            </div>
        </div>
    );
};

export default ManagerResources;
