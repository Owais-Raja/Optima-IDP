import { useState, useEffect } from 'react';
import { Calendar } from 'lucide-react';
import api from '../../services/api';

// =================================================================================================
// Create Check-In Modal Component
// -------------------------------------------------------------------------------------------------
// Modal for managers to schedule check-ins.
// Features:
// - Schedule Weekly Syncs, Performance Reviews, 1:1s, etc.
// - Select team members for individual meetings.
// - Set date, time, and agenda.
// =================================================================================================

function CreateCheckInModal({ isOpen, onClose, onCheckInCreated }) {
    // =================================================================================================
    // State Definitions
    // -------------------------------------------------------------------------------------------------
    const [title, setTitle] = useState('');
    const [type, setType] = useState('Weekly Sync');
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');
    const [description, setDescription] = useState('');
    const [attendee, setAttendee] = useState('');
    const [team, setTeam] = useState([]);
    const [loading, setLoading] = useState(false);
    // State Definitions ends here

    useEffect(() => {
        if (isOpen) {
            // Fetch team members when modal opens
            const fetchTeam = async () => {
                try {
                    const res = await api.get('/user/my-team');
                    setTeam(res.data.team || []);
                } catch (err) {
                    console.error("Failed to fetch team", err);
                }
            };
            fetchTeam();
        }
    }, [isOpen]);

    if (!isOpen) return null;

    // Get today's date in YYYY-MM-DD format
    const getTodayDate = () => {
        const today = new Date();
        const yyyy = today.getFullYear();
        const mm = String(today.getMonth() + 1).padStart(2, '0');
        const dd = String(today.getDate()).padStart(2, '0');
        return `${yyyy}-${mm}-${dd}`;
    };

    // Format YYYY-MM-DD to DD/MM/YYYY for display
    const formatDateForDisplay = (isoDate) => {
        if (!isoDate) return '';
        const [yyyy, mm, dd] = isoDate.split('-');
        return `${dd}/${mm}/${yyyy}`;
    };

    // Get current time in HH:MM format
    const getCurrentTime = () => {
        const now = new Date();
        const hh = String(now.getHours()).padStart(2, '0');
        const mm = String(now.getMinutes()).padStart(2, '0');
        return `${hh}:${mm}`;
    };

    const minDate = getTodayDate();
    const minTime = date === minDate ? getCurrentTime() : null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Combine date and time
            const DateTime = new Date(`${date}T${time}`);

            const payload = {
                title,
                type,
                date: DateTime,
                description,
                attendee: (type === 'One-on-One' || type === 'Performance Review') ? attendee : null
            };

            const res = await api.post('/manager/checkins', payload);
            if (onCheckInCreated) onCheckInCreated(res.data.checkIn);
            onClose();
            // Reset form
            setTitle('');
            setTime('');
            setDate('');
            setDescription('');
            setAttendee(''); // Reset attendee
        } catch (err) {
            console.error("Failed to schedule check-in", err);
            // Optionally show error toast here
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md overflow-hidden relative animate-in fade-in zoom-in-95 duration-200">

                {/* Header */}
                <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
                    <h3 className="text-xl font-bold text-white">Schedule Check-in</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Body */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-1">Title</label>
                        <input
                            type="text"
                            required
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-amber-500 transition-colors"
                            placeholder="e.g. Sprint Planning"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-1">Date</label>
                            <div className="relative">
                                {/* Visible Text Input (Formatted) */}
                                <input
                                    type="text"
                                    readOnly
                                    value={formatDateForDisplay(date)}
                                    placeholder="dd/mm/yyyy"
                                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-amber-500 transition-colors pointer-events-none"
                                />
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                                    <Calendar className="w-5 h-5" />
                                </div>
                                {/* Invisible Native Date Input (Trigger) */}
                                <input
                                    type="date"
                                    required
                                    min={minDate}
                                    value={date}
                                    onChange={(e) => setDate(e.target.value)}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-1">Time</label>
                            <input
                                type="time"
                                required
                                min={minTime}
                                value={time}
                                onChange={(e) => setTime(e.target.value)}
                                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-amber-500 transition-colors"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-1">Type</label>
                        <select
                            value={type}
                            onChange={(e) => setType(e.target.value)}
                            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-amber-500 transition-colors"
                        >
                            <option>Weekly Sync</option>
                            <option>Performance Review</option>
                            <option>One-on-One</option>
                            <option>Project Kickoff</option>
                            <option>General</option>
                        </select>
                    </div>

                    {(type === 'One-on-One' || type === 'Performance Review') && (
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-1">Select Team Member</label>
                            <select
                                required
                                value={attendee}
                                onChange={(e) => setAttendee(e.target.value)}
                                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-amber-500 transition-colors"
                            >
                                <option value="">Select an employee...</option>
                                {team.map(member => (
                                    <option key={member._id} value={member._id}>{member.name}</option>
                                ))}
                            </select>
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-1">Description (Optional)</label>
                        <textarea
                            rows="3"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-amber-500 transition-colors"
                            placeholder="Meeting agenda..."
                        ></textarea>
                    </div>

                    <div className="pt-4 flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-slate-400 hover:text-white font-medium transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-6 py-2 bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold rounded-xl transition-all transform hover:scale-105 disabled:opacity-50 disabled:transform-none"
                        >
                            {loading ? 'Scheduling...' : 'Schedule Check-in'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default CreateCheckInModal;
