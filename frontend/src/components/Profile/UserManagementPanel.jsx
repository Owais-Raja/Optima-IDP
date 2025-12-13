import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useAuth } from '../../store/useAuth';

const UserManagementPanel = () => {
    const { user: currentUser } = useAuth();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [search, setSearch] = useState('');
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState('');

    // Promotion Modal State
    const [showPromoteModal, setShowPromoteModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [promoteStep, setPromoteStep] = useState('select'); // 'select' or 'confirm'
    const [selectedRole, setSelectedRole] = useState(null);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const response = await api.get('/admin/users', {
                params: {
                    page,
                    limit: 10,
                    search
                }
            });
            setUsers(response.data.users);
            setTotalPages(response.data.pages);
            setError(null);
        } catch (err) {
            console.error("Failed to fetch users:", err);
            setError("Failed to load users.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, [page, search]);

    const handleRoleUpdate = async (userId, newRole) => {
        try {
            await api.put(`/admin/users/${userId}/role`, { role: newRole });
            setSuccessMessage(`User role updated to ${newRole}`);
            fetchUsers(); // Refresh list

            // Clear success message after 3 seconds
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (err) {
            console.error("Failed to update role:", err);
            setError(err.response?.data?.message || "Failed to update user role");
        }
    };

    const handleResolveUpdate = async (userId, status) => {
        try {
            await api.put(`/admin/users/${userId}/resolve-update`, { status });
            setSuccessMessage(`Request ${status} successfully`);
            fetchUsers(); // Refresh list
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (err) {
            console.error("Failed to resolve update:", err);
            setError(err.response?.data?.message || "Failed to resolve request");
        }
    };

    const openPromoteModal = (user) => {
        setSelectedUser(user);
        setPromoteStep('select');
        setSelectedRole(null);
        setShowPromoteModal(true);
    };

    const closePromoteModal = () => {
        setShowPromoteModal(false);
        setSelectedUser(null);
        setPromoteStep('select');
        setSelectedRole(null);
    };

    const handleRoleSelection = (role) => {
        setSelectedRole(role);
        setPromoteStep('confirm');
    };

    const confirmPromotion = async () => {
        if (selectedUser && selectedRole) {
            await handleRoleUpdate(selectedUser._id, selectedRole);
            closePromoteModal();
        }
    };

    return (
        <div className="space-y-6 relative">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-white">User Management</h3>
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Search users..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="bg-slate-800 border border-slate-700 text-slate-200 px-4 py-2 rounded-lg focus:outline-none focus:border-purple-500 w-64"
                    />
                </div>
            </div>

            {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-lg">
                    {error}
                </div>
            )}

            {successMessage && (
                <div className="bg-green-500/10 border border-green-500/20 text-green-400 p-4 rounded-lg">
                    {successMessage}
                </div>
            )}

            <div className="bg-slate-800 rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-700/50 text-slate-300 text-sm uppercase tracking-wider">
                                <th className="p-4 font-medium">Name</th>
                                <th className="p-4 font-medium">Email</th>
                                <th className="p-4 font-medium">Role</th>
                                <th className="p-4 font-medium">Status</th>
                                <th className="p-4 font-medium">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-700">
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="p-8 text-center text-slate-400">Loading...</td>
                                </tr>
                            ) : users.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="p-8 text-center text-slate-400">No users found.</td>
                                </tr>
                            ) : (
                                users.map(user => (
                                    <tr key={user._id} className="hover:bg-slate-700/30 transition-colors">
                                        <td className="p-4 text-slate-200 font-medium">{user.name}</td>
                                        <td className="p-4 text-slate-400">{user.email}</td>
                                        <td className="p-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium border ${user.role === 'admin' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' :
                                                user.role === 'manager' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                                                    'bg-slate-500/10 text-slate-400 border-slate-500/20'
                                                }`}>
                                                {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            {user.profileUpdateRequest?.status === 'pending' ? (
                                                <div className="flex flex-col">
                                                    <span className="text-amber-400 text-sm font-medium flex items-center gap-1">
                                                        <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
                                                        Review Needed
                                                    </span>
                                                    <span className="text-[10px] text-slate-500">
                                                        Rename: {user.profileUpdateRequest.value}
                                                    </span>
                                                </div>
                                            ) : user.isVerified ? (
                                                <span className="text-green-400 text-sm">Verified</span>
                                            ) : (
                                                <span className="text-yellow-400 text-sm">Pending</span>
                                            )}
                                        </td>
                                        <td className="p-4">
                                            {user.profileUpdateRequest?.status === 'pending' ? (
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => handleResolveUpdate(user._id, 'approved')}
                                                        className="text-xs bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded transition-colors"
                                                    >
                                                        Approve
                                                    </button>
                                                    <button
                                                        onClick={() => handleResolveUpdate(user._id, 'rejected')}
                                                        className="text-xs bg-red-600 hover:bg-red-500 text-white px-3 py-1.5 rounded transition-colors"
                                                    >
                                                        Reject
                                                    </button>
                                                </div>
                                            ) : user.role !== 'admin' && (
                                                <div className="flex gap-2">
                                                    {user.role === 'employee' && (
                                                        <button
                                                            onClick={() => openPromoteModal(user)}
                                                            className="text-xs bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded transition-colors"
                                                        >
                                                            Promote
                                                        </button>
                                                    )}
                                                    {user.role === 'manager' && (
                                                        <button
                                                            onClick={() => handleRoleUpdate(user._id, 'employee')}
                                                            className="text-xs bg-slate-600 hover:bg-slate-500 text-white px-3 py-1.5 rounded transition-colors"
                                                        >
                                                            Demote
                                                        </button>
                                                    )}
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-4">
                    <button
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="px-3 py-1 bg-slate-800 text-slate-300 rounded disabled:opacity-50 hover:bg-slate-700"
                    >
                        Previous
                    </button>
                    <span className="px-3 py-1 text-slate-400">
                        Page {page} of {totalPages}
                    </span>
                    <button
                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages}
                        className="px-3 py-1 bg-slate-800 text-slate-300 rounded disabled:opacity-50 hover:bg-slate-700"
                    >
                        Next
                    </button>
                </div>
            )}

            {/* Promotion MOdal */}
            {showPromoteModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-slate-800 border border-slate-700 rounded-xl shadow-2xl max-w-md w-full p-6 space-y-4">
                        <h4 className="text-xl font-semibold text-white">Promote {selectedUser?.name}</h4>

                        {promoteStep === 'select' ? (
                            <div className="space-y-3">
                                <p className="text-slate-400">Select a role to promote this user to:</p>
                                <div className="grid grid-cols-2 gap-4">
                                    <button
                                        onClick={() => handleRoleSelection('manager')}
                                        className="flex flex-col items-center justify-center p-4 bg-slate-700/50 hover:bg-slate-700 border border-slate-600 hover:border-blue-500 rounded-lg transition-all group"
                                    >
                                        <span className="text-blue-400 font-medium group-hover:text-blue-300">Manager</span>
                                        <span className="text-xs text-slate-500 mt-1">Team Management</span>
                                    </button>
                                    <button
                                        onClick={() => handleRoleSelection('admin')}
                                        className="flex flex-col items-center justify-center p-4 bg-slate-700/50 hover:bg-slate-700 border border-slate-600 hover:border-purple-500 rounded-lg transition-all group"
                                    >
                                        <span className="text-purple-400 font-medium group-hover:text-purple-300">Admin</span>
                                        <span className="text-xs text-slate-500 mt-1">Full Access</span>
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
                                    <p className="text-yellow-200 text-sm">
                                        Are you sure you want to promote <strong>{selectedUser?.name}</strong> to <strong>{selectedRole === 'admin' ? 'Admin' : 'Manager'}</strong>?
                                    </p>
                                    <p className="text-yellow-200/60 text-xs mt-2">
                                        {selectedRole === 'admin'
                                            ? 'Admins have full access to all system settings and user data.'
                                            : 'Managers can view and manage their team members and approve IDPs.'}
                                    </p>
                                </div>
                                <div className="flex gap-3 justify-end">
                                    <button
                                        onClick={() => setPromoteStep('select')}
                                        className="px-4 py-2 text-slate-300 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
                                    >
                                        Back
                                    </button>
                                    <button
                                        onClick={confirmPromotion}
                                        className={`px-4 py-2 text-white rounded-lg transition-colors ${selectedRole === 'admin'
                                            ? 'bg-purple-600 hover:bg-purple-500'
                                            : 'bg-blue-600 hover:bg-blue-500'
                                            }`}
                                    >
                                        Confirm Promotion
                                    </button>
                                </div>
                            </div>
                        )}

                        {promoteStep === 'select' && (
                            <div className="flex justify-end pt-2">
                                <button
                                    onClick={closePromoteModal}
                                    className="px-4 py-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
                                >
                                    Cancel
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserManagementPanel;
