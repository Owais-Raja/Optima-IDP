import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, Plus, Star, Search, User, TrendingUp, BarChart2, Edit, Trash2 } from 'lucide-react';
import api from '../services/api';

// =================================================================================================
// Manager Performance Page
// -------------------------------------------------------------------------------------------------
// Allows managers to write and view performance reviews for their team.
// =================================================================================================

const ManagerPerformance = () => {
    const [reviews, setReviews] = useState([]);
    const [team, setTeam] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [selectedReview, setSelectedReview] = useState(null);
    const [editingId, setEditingId] = useState(null);

    // Form State
    const [formData, setFormData] = useState({
        employeeId: '',
        reviewPeriod: 'Q1 2025',
        rating: 5,
        strengths: '',
        weaknesses: '',
        managerComments: ''
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [reviewsRes, teamRes] = await Promise.all([
                api.get('/performance/created-by-me'),
                api.get('/user/my-team')
            ]);
            setReviews(reviewsRes.data);
            setTeam(teamRes.data.team);
        } catch (err) {
            console.error("Failed to fetch performance data", err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingId) {
                await api.put(`/performance/${editingId}`, formData);
            } else {
                await api.post('/performance/add', formData);
            }
            setShowModal(false);
            setEditingId(null);
            setFormData({
                employeeId: '',
                reviewPeriod: 'Q1 2025',
                rating: 5,
                strengths: '',
                weaknesses: '',
                managerComments: ''
            });
            fetchData(); // Refresh list
        } catch (err) {
            console.error("Failed to save review", err);
            alert("Failed to save review");
        }
    };

    const handleEdit = (review) => {
        setEditingId(review._id);
        setFormData({
            employeeId: review.employee?._id,
            reviewPeriod: review.reviewPeriod,
            rating: review.rating,
            strengths: review.strengths,
            weaknesses: review.weaknesses,
            managerComments: review.managerComments
        });
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this review?")) {
            try {
                await api.delete(`/performance/${id}`);
                setReviews(reviews.filter(r => r._id !== id));
            } catch (err) {
                console.error("Failed to delete review", err);
                alert("Failed to delete review");
            }
        }
    };

    const openCreateModal = () => {
        setEditingId(null);
        setFormData({
            employeeId: '',
            reviewPeriod: 'Q1 2025',
            rating: 5,
            strengths: '',
            weaknesses: '',
            managerComments: ''
        });
        setShowModal(true);
    };

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 p-8 fade-in">
            <div className="max-w-7xl mx-auto space-y-8">

                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                    <div>
                        <Link to="/dashboard" className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-4">
                            <ChevronLeft className="w-4 h-4" /> Back to Dashboard
                        </Link>
                        <h1 className="text-3xl font-bold font-display text-white">Performance Reviews</h1>
                        <p className="text-slate-400 mt-2">Evaluate and track your team's performance.</p>
                    </div>
                    <button
                        onClick={openCreateModal}
                        className="px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-medium shadow-lg shadow-purple-900/20 transition-all hover:scale-105 flex items-center gap-2"
                    >
                        <Plus className="w-5 h-5" /> New Review
                    </button>
                </div>

                {/* Statistics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
                        <div className="text-slate-400 text-sm font-medium mb-1">Total Reviews</div>
                        <div className="text-3xl font-bold text-white">{reviews.length}</div>
                    </div>
                    <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
                        <div className="text-slate-400 text-sm font-medium mb-1">Avg Rating</div>
                        <div className="text-3xl font-bold text-white">
                            {reviews.length > 0
                                ? (reviews.reduce((a, b) => a + b.rating, 0) / reviews.length).toFixed(1)
                                : 'N/A'
                            }
                        </div>
                    </div>
                    <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
                        <div className="text-slate-400 text-sm font-medium mb-1">Team Coverage</div>
                        <div className="text-3xl font-bold text-white">
                            {team.length > 0
                                ? Math.round((new Set(reviews.map(r => r.employee?._id)).size / team.length) * 100)
                                : 0}%
                        </div>
                    </div>
                </div>

                {/* Reviews List */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
                    <div className="p-6 border-b border-slate-800">
                        <h2 className="text-xl font-bold text-white">Review History</h2>
                    </div>

                    {loading ? (
                        <div className="p-8 text-center text-slate-500">Loading reviews...</div>
                    ) : reviews.length === 0 ? (
                        <div className="p-12 text-center flex flex-col items-center">
                            <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mb-4 text-slate-500">
                                <Star className="w-8 h-8" />
                            </div>
                            <h3 className="text-lg font-bold text-white mb-2">No Reviews Yet</h3>
                            <p className="text-slate-400 max-w-sm">Start by creating a performance review for one of your team members.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-slate-950/50 text-slate-400 text-sm uppercase tracking-wider">
                                    <tr>
                                        <th className="p-4 font-medium">Employee</th>
                                        <th className="p-4 font-medium">Period</th>
                                        <th className="p-4 font-medium">Rating</th>
                                        <th className="p-4 font-medium">Date</th>
                                        <th className="p-4 font-medium text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-800">
                                    {reviews.map(review => (
                                        <tr key={review._id} className="hover:bg-slate-800/50 transition-colors">
                                            <td className="p-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center overflow-hidden">
                                                        {review.employee?.avatar ? (
                                                            <img src={review.employee.avatar} alt="" className="w-full h-full object-cover" />
                                                        ) : (
                                                            <span className="text-white font-bold text-sm">{review.employee?.name?.[0]}</span>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <div className="font-medium text-white">{review.employee?.name}</div>
                                                        <div className="text-xs text-slate-400">{review.employee?.email}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-4 text-slate-300">{review.reviewPeriod}</td>
                                            <td className="p-4">
                                                <div className="flex items-center gap-1">
                                                    <span className={`font-bold ${review.rating >= 4 ? 'text-emerald-400' :
                                                        review.rating >= 3 ? 'text-amber-400' : 'text-red-400'
                                                        }`}>
                                                        {review.rating}/5
                                                    </span>
                                                    <div className="flex">
                                                        {[1, 2, 3, 4, 5].map(star => (
                                                            <Star
                                                                key={star}
                                                                className={`w-3 h-3 ${star <= review.rating ? 'fill-current text-amber-400' : 'text-slate-700'}`}
                                                            />
                                                        ))}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-4 text-slate-400 text-sm">
                                                {new Date(review.createdAt).toLocaleDateString()}
                                            </td>
                                            <td className="p-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => setSelectedReview(review)}
                                                        className="text-purple-400 hover:text-white text-sm font-medium transition-colors"
                                                    >
                                                        View Details
                                                    </button>
                                                    <button
                                                        onClick={() => handleEdit(review)}
                                                        className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                                                        title="Edit Review"
                                                    >
                                                        <Edit className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(review._id)}
                                                        className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-lg transition-colors"
                                                        title="Delete Review"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* View Details Modal */}
            {selectedReview && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900 sticky top-0 z-10">
                            <div>
                                <h2 className="text-xl font-bold text-white">Review Details</h2>
                                <p className="text-sm text-slate-400">{selectedReview.employee?.name} - {selectedReview.reviewPeriod}</p>
                            </div>
                            <button onClick={() => setSelectedReview(null)} className="text-slate-400 hover:text-white">✕</button>
                        </div>

                        <div className="p-8 space-y-8">
                            <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-xl border border-slate-800">
                                <div>
                                    <div className="text-sm text-slate-400 mb-1">Overall Rating</div>
                                    <div className="flex items-center gap-2">
                                        <span className={`text-2xl font-bold ${selectedReview.rating >= 4 ? 'text-emerald-400' :
                                            selectedReview.rating >= 3 ? 'text-amber-400' : 'text-red-400'
                                            }`}>
                                            {selectedReview.rating}/5
                                        </span>
                                        <div className="flex">
                                            {[1, 2, 3, 4, 5].map(star => (
                                                <Star
                                                    key={star}
                                                    className={`w-5 h-5 ${star <= selectedReview.rating ? 'fill-current text-amber-400' : 'text-slate-700'}`}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-sm text-slate-400 mb-1">Date</div>
                                    <div className="text-white font-medium">{new Date(selectedReview.createdAt).toLocaleDateString()}</div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div>
                                    <h3 className="text-emerald-400 font-bold mb-3 flex items-center gap-2">
                                        <TrendingUp className="w-4 h-4" /> Key Strengths
                                    </h3>
                                    <div className="bg-slate-800/30 border border-slate-800 rounded-xl p-4 text-slate-300 leading-relaxed whitespace-pre-wrap">
                                        {selectedReview.strengths || "No specific strengths listed."}
                                    </div>
                                </div>
                                <div>
                                    <h3 className="text-amber-400 font-bold mb-3 flex items-center gap-2">
                                        <BarChart2 className="w-4 h-4" /> Areas for Improvement
                                    </h3>
                                    <div className="bg-slate-800/30 border border-slate-800 rounded-xl p-4 text-slate-300 leading-relaxed whitespace-pre-wrap">
                                        {selectedReview.weaknesses || "No specific improvements listed."}
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h3 className="text-white font-bold mb-3">Manager Comments</h3>
                                <div className="bg-slate-800/30 border border-slate-800 rounded-xl p-6 text-slate-300 leading-relaxed whitespace-pre-wrap">
                                    {selectedReview.managerComments || "No additional comments."}
                                </div>
                            </div>

                            {selectedReview.relatedSkills && selectedReview.relatedSkills.length > 0 && (
                                <div>
                                    <h3 className="text-white font-bold mb-3">Related Skills</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {selectedReview.relatedSkills.map((skill, idx) => (
                                            <span key={idx} className="px-3 py-1 bg-purple-500/10 text-purple-300 border border-purple-500/20 rounded-full text-sm">
                                                {skill.name}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="p-6 border-t border-slate-800 flex justify-end bg-slate-900 sticky bottom-0">
                            <button
                                onClick={() => setSelectedReview(null)}
                                className="px-6 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-medium transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Create/Edit Review Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg">
                        <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900 rounded-t-2xl">
                            <h2 className="text-xl font-bold text-white">{editingId ? 'Edit Review' : 'New Review'}</h2>
                            <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white">✕</button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            {!editingId && (
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-1">Employee</label>
                                    <select
                                        required
                                        className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-white focus:ring-2 focus:ring-purple-500 outline-none"
                                        value={formData.employeeId}
                                        onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                                    >
                                        <option value="">Select Employee</option>
                                        {team.map(member => (
                                            <option key={member._id} value={member._id}>{member.name}</option>
                                        ))}
                                    </select>
                                </div>
                            )}
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-2">Review Period</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. Q1 2025"
                                    className="w-full bg-slate-800 border-slate-700 rounded-xl text-white focus:ring-purple-500 focus:border-purple-500 p-3"
                                    value={formData.reviewPeriod}
                                    onChange={e => setFormData({ ...formData, reviewPeriod: e.target.value })}
                                />
                            </div>


                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-2">Rating</label>
                                <div className="flex gap-4">
                                    {[1, 2, 3, 4, 5].map(num => (
                                        <button
                                            key={num}
                                            type="button"
                                            onClick={() => setFormData({ ...formData, rating: num })}
                                            className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg transition-all ${formData.rating === num
                                                ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/40 scale-105'
                                                : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                                                }`}
                                        >
                                            {num}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-2">Key Strengths</label>
                                    <textarea
                                        className="w-full bg-slate-800 border-slate-700 rounded-xl text-white focus:ring-purple-500 focus:border-purple-500 p-3 h-32"
                                        placeholder="What did they do well?"
                                        value={formData.strengths}
                                        onChange={e => setFormData({ ...formData, strengths: e.target.value })}
                                    ></textarea>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-2">Areas for Improvement</label>
                                    <textarea
                                        className="w-full bg-slate-800 border-slate-700 rounded-xl text-white focus:ring-purple-500 focus:border-purple-500 p-3 h-32"
                                        placeholder="Where can they grow?"
                                        value={formData.weaknesses}
                                        onChange={e => setFormData({ ...formData, weaknesses: e.target.value })}
                                    ></textarea>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-2">Overall Comments</label>
                                <textarea
                                    className="w-full bg-slate-800 border-slate-700 rounded-xl text-white focus:ring-purple-500 focus:border-purple-500 p-3 h-32"
                                    placeholder="Summary of performance..."
                                    value={formData.managerComments}
                                    onChange={e => setFormData({ ...formData, managerComments: e.target.value })}
                                ></textarea>
                            </div>

                            <div className="flex justify-end gap-4 pt-4 border-t border-slate-800">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="px-6 py-3 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white font-medium transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-medium shadow-lg shadow-purple-900/20 transition-all hover:scale-105"
                                >
                                    Submit Review
                                </button>
                            </div>
                        </form>
                    </div>
                </div >
            )}
        </div >
    );
};

export default ManagerPerformance;
