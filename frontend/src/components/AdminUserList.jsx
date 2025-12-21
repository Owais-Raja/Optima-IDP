import { useState, useEffect } from 'react';
import api from '../services/api';
import ConfirmationModal from './Modals/ConfirmationModal';

// =================================================================================================
// Admin User List Component
// -------------------------------------------------------------------------------------------------
// Displays a list of all users with administrative actions.
// Capabilities:
// - View all users and their details.
// - Change user roles (Employee <-> Manager).
// - Resolve profile update requests (e.g., name changes).
// =================================================================================================

function AdminUserList() {
    // =================================================================================================
    // State Definitions
    // -------------------------------------------------------------------------------------------------
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState(null);
    const [modalConfig, setModalConfig] = useState({
        isOpen: false,
        title: '',
        message: '',
        showCancel: false,
        confirmText: 'OK',
        onConfirm: null
    });

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
    // State Definitions ends here

    // =================================================================================================
    // Helper Functions
    // -------------------------------------------------------------------------------------------------
    const fetchUsers = async () => {
        try {
            const res = await api.get('/user');
            console.log("AdminUserList: Fetched users:", res.data);
            setUsers(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleRoleChange = async (userId, newRole) => {
        try {
            await api.put(`/user/${userId}/role`, { role: newRole });
            setUsers(prev => prev.map(u => u._id === userId ? { ...u, role: newRole } : u));
            setMessage(`Role updated to ${newRole}`);
            setTimeout(() => setMessage(null), 3000);
        } catch (err) {
            showAlert('Failed to update role', 'Error');
        }
    };

    const handleResolveRequest = async (userId, status) => {
        try {
            await api.put(`/user/${userId}/resolve-update`, { status });
            // Refresh list or update local state
            setUsers(prev => prev.map(u => {
                if (u._id === userId) {
                    if (status === 'approved') {
                        return {
                            ...u,
                            name: u.profileUpdateRequest?.value || u.name,
                            profileUpdateRequest: { ...u.profileUpdateRequest, status: 'approved' }
                        };
                    } else {
                        return { ...u, profileUpdateRequest: { ...u.profileUpdateRequest, status: 'rejected' } };
                    }
                }
                return u;
            }));
            setMessage(`Request ${status}`);
            setTimeout(() => setMessage(null), 3000);
        } catch (err) {
            showAlert('Failed to resolve request', 'Error');
        }
    };
    // Helper Functions ends here

    if (loading) return <div className="text-slate-400">Loading users...</div>;

    return (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h3 className="text-lg font-semibold text-white">User Management</h3>
                    <p className="text-sm text-slate-400">View and manage all registered users</p>
                </div>
                {message && <span className="text-emerald-400 text-sm font-medium animate-pulse">{message}</span>}
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-slate-800 text-slate-400 text-sm">
                            <th className="py-3 px-4">User</th>
                            <th className="py-3 px-4">Email</th>
                            <th className="py-3 px-4">Role</th>
                            <th className="py-3 px-4">Requests</th>
                            <th className="py-3 px-4">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="text-sm text-slate-300">
                        {users.map(user => (
                            <tr key={user._id} className="border-b border-slate-800/50 hover:bg-slate-800/20 transition-colors">
                                <td className="py-3 px-4 flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center text-xs font-bold text-purple-300">
                                        {user.avatar ? (
                                            <img
                                                src={`${api.defaults.baseURL.replace('/api', '')}/${user.avatar}`}
                                                alt={user.name}
                                                className="w-full h-full rounded-full object-cover"
                                            />
                                        ) : (
                                            user.name.charAt(0).toUpperCase()
                                        )}
                                    </div>
                                    {user.name}
                                </td>
                                <td className="py-3 px-4 text-slate-400">{user.email}</td>
                                <td className="py-3 px-4">
                                    <span className={`px-2 py-1 rounded text-xs font-medium uppercase ${user.role === 'admin' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' :
                                        user.role === 'manager' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                                            'bg-slate-700 text-slate-300'
                                        }`}>
                                        {user.role}
                                    </span>
                                </td>
                                <td className="py-3 px-4">
                                    {user.profileUpdateRequest?.status === 'pending' && (
                                        <div className="flex flex-col gap-1">
                                            <span className="text-xs text-amber-400">Name Change Request:</span>
                                            <span className="text-white font-medium">"{user.profileUpdateRequest.value}"</span>
                                            <div className="flex gap-2 mt-1">
                                                <button
                                                    onClick={() => handleResolveRequest(user._id, 'approved')}
                                                    className="px-2 py-0.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 text-xs rounded transition-colors"
                                                >
                                                    Approve
                                                </button>
                                                <button
                                                    onClick={() => handleResolveRequest(user._id, 'rejected')}
                                                    className="px-2 py-0.5 bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 text-xs rounded transition-colors"
                                                >
                                                    Reject
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </td>
                                <td className="py-3 px-4">
                                    {user.role === 'employee' && (
                                        <button
                                            onClick={() => handleRoleChange(user._id, 'manager')}
                                            className="px-3 py-1 bg-purple-600 hover:bg-purple-500 text-white text-xs font-medium rounded transition-colors"
                                        >
                                            Promote to Manager
                                        </button>
                                    )}
                                    {user.role === 'manager' && (
                                        <button
                                            onClick={() => handleRoleChange(user._id, 'employee')}
                                            className="px-3 py-1 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/50 text-xs font-medium rounded transition-colors"
                                        >
                                            Demote to Employee
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
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
}

export default AdminUserList;
