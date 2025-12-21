import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, Star, TrendingUp, BarChart2, Calendar } from 'lucide-react';
import api from '../services/api';

const EmployeePerformance = () => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedReview, setSelectedReview] = useState(null);

    useEffect(() => {
        fetchReviews();
    }, []);

    const fetchReviews = async () => {
        try {
            const res = await api.get('/performance/my-reports');
            setReviews(res.data);
        } catch (err) {
            console.error("Failed to fetch reviews", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 p-8 fade-in">
            <div className="max-w-7xl mx-auto space-y-8">

                {/* Header */}
                <div>
                    <Link to="/dashboard" className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-4">
                        <ChevronLeft className="w-4 h-4" /> Back to Dashboard
                    </Link>
                    <h1 className="text-3xl font-bold font-display text-white">My Performance</h1>
                    <p className="text-slate-400 mt-2">Track your growth and feedback over time.</p>
                </div>

                {/* Reviews List */}
                <div className="grid grid-cols-1 gap-6">
                    {loading ? (
                        <div className="text-center py-10 text-slate-500">Loading reviews...</div>
                    ) : reviews.length === 0 ? (
                        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center">
                            <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-500">
                                <Star className="w-8 h-8" />
                            </div>
                            <h3 className="text-lg font-bold text-white mb-2">No Reviews Yet</h3>
                            <p className="text-slate-400">You haven't received any performance reviews yet.</p>
                        </div>
                    ) : (
                        reviews.map(review => (
                            <div key={review._id} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 hover:border-purple-500/50 transition-colors">
                                <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-6">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl font-bold ${review.rating >= 4 ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                                                review.rating >= 3 ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                                                    'bg-red-500/10 text-red-400 border border-red-500/20'
                                            }`}>
                                            {review.rating}
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold text-white">{review.reviewPeriod} Review</h3>
                                            <div className="flex items-center gap-2 text-sm text-slate-400">
                                                <Calendar className="w-4 h-4" />
                                                {new Date(review.createdAt).toLocaleDateString()}
                                                <span>•</span>
                                                <span>Reviewed by {review.manager?.name || 'Manager'}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setSelectedReview(review)}
                                        className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-medium transition-colors"
                                    >
                                        View Full Report
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="bg-slate-800/30 rounded-xl p-4">
                                        <div className="text-emerald-400 text-sm font-bold mb-2 flex items-center gap-2">
                                            <TrendingUp className="w-4 h-4" /> Key Strengths
                                        </div>
                                        <p className="text-slate-300 text-sm line-clamp-2">
                                            {review.strengths || "No strengths listed."}
                                        </p>
                                    </div>
                                    <div className="bg-slate-800/30 rounded-xl p-4">
                                        <div className="text-amber-400 text-sm font-bold mb-2 flex items-center gap-2">
                                            <BarChart2 className="w-4 h-4" /> Areas for Improvement
                                        </div>
                                        <p className="text-slate-300 text-sm line-clamp-2">
                                            {review.weaknesses || "No improvements listed."}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* View Details Modal */}
            {selectedReview && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900 sticky top-0 z-10">
                            <div>
                                <h2 className="text-xl font-bold text-white">{selectedReview.reviewPeriod} Performance Review</h2>
                                <p className="text-sm text-slate-400">Reviewed on {new Date(selectedReview.createdAt).toLocaleDateString()}</p>
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
                                    <div className="text-sm text-slate-400 mb-1">Manager</div>
                                    <div className="text-white font-medium">{selectedReview.manager?.name}</div>
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
        </div>
    );
};

export default EmployeePerformance;
