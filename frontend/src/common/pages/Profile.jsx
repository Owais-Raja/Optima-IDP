import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../store/useAuth.jsx';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend } from 'recharts';
import { Award, Zap, Star, TrendingUp, Target, Shield, BookOpen } from 'lucide-react';

// Helper to get full image URL
const getImageUrl = (path) => {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  return `${api.defaults.baseURL.replace('/api', '')}/${path}`;
};

function Profile() {
  const { user, logout } = useAuth();
  const [profile, setProfile] = useState(null);
  const [learnerStats, setLearnerStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  const [message, setMessage] = useState({ type: '', text: '' });
  const fileInputRef = useRef(null);

  // Form states
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Fetch Profile Data
  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await api.get('/user/me');
      setProfile(res.data.user);

      // Acknowledge notification if status is resolved (clears it for next reload)
      if (['approved', 'rejected'].includes(res.data.user.profileUpdateRequest?.status)) {
        api.post('/user/acknowledge-update').catch(err => console.error("Failed to ack update:", err));
      }

    } catch (err) {
      console.error("Failed to fetch profile:", err);
      setMessage({ type: 'error', text: 'Failed to load profile data' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
    // Fetch metrics for learner level
    api.get('/idp/metrics/employee')
      .then(res => setLearnerStats(res.data))
      .catch(err => console.error("Failed to fetch metrics:", err));
  }, []);

  useEffect(() => {
    if (profile) {
      setFormData(prev => ({
        ...prev,
        name: profile.name || '',
        email: profile.email || ''
      }));
    }
  }, [profile]);

  // Transform profile skills for the Radar Chart
  const skillsData = (profile?.skills || []).map(s => ({
    subject: s.skillId?.name || 'Unknown',
    A: (s.level || 1) * 30, // Map level 1-5 to 30-150
    fullMark: 150
  }));

  // If no skills, provide a placeholder or empty state to avoid chart errors
  const chartData = skillsData.length > 0 ? skillsData : [
    { subject: 'No Skills', A: 0, fullMark: 150 },
    { subject: 'Add Skills', A: 0, fullMark: 150 },
    { subject: 'To See', A: 0, fullMark: 150 },
  ];

  const [team, setTeam] = useState([]);

  useEffect(() => {
    if (activeTab === 'team' && user?.role === 'manager') {
      api.get('/user/my-team').then(res => {
        setTeam(res.data.team || []);
      }).catch(err => console.error("Failed to fetch team", err));
    }
  }, [activeTab, user]);

  const getInitials = (name) => {
    return name
      ?.split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2) || '??';
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setMessage({ type: 'error', text: 'Image size too large (max 5MB)' });
      return;
    }

    const uploadData = new FormData();
    uploadData.append('avatar', file);

    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const res = await api.put('/user/me', uploadData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setProfile(res.data.user);
      setMessage({ type: 'success', text: 'Profile picture updated!' });
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to upload image' });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });
    setLoading(true);

    try {
      if (activeTab === 'general') {
        // Check if name changed
        if (profile && formData.name !== profile.name) {
          if (user.role === 'admin') {
            // Admin can update directly
            await api.put('/user/me', { name: formData.name });
            setProfile(prev => ({ ...prev, name: formData.name }));
            setMessage({ type: 'success', text: 'Name updated successfully' });
          } else {
            // Others must request
            await api.post('/user/request-update', { name: formData.name });
            setMessage({ type: 'success', text: 'Name change requested. Awaiting admin approval.' });
            // Refetch profile to show pending status if applicable
            fetchProfile();
          }
        } else {
          setMessage({ type: 'info', text: 'No changes to save' });
        }
      } else if (activeTab === 'security') {
        if (formData.newPassword !== formData.confirmPassword) {
          throw new Error('New passwords do not match');
        }
        await api.put('/user/me', {
          password: formData.currentPassword,
          newPassword: formData.newPassword
        });
        setMessage({ type: 'success', text: 'Password updated successfully' });

        // Clear password fields
        setFormData(prev => ({
          ...prev,
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        }));
      }

    } catch (err) {
      setMessage({
        type: 'error',
        text: err.response?.data?.message || err.message || 'Update failed'
      });
    } finally {
      setLoading(false);
    }
  };

  if (!profile && loading) return <div className="p-8 text-white">Loading...</div>;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 sm:p-8 font-sans flex justify-center">
      <div className="max-w-7xl w-full">

        {/* Header */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 mb-8 flex flex-col md:flex-row items-center gap-8 shadow-xl relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-purple-600/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />

          <div className="relative group cursor-pointer z-10" onClick={handleAvatarClick}>
            <div className="h-24 w-24 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-3xl font-bold text-white shadow-lg shadow-purple-900/40 overflow-hidden relative">
              {profile?.avatar ? (
                <img src={getImageUrl(profile.avatar)} alt="Profile" className="h-full w-full object-cover" />
              ) : (
                getInitials(profile?.name)
              )}
            </div>
            <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <span className="text-xs font-medium text-white">Change</span>
            </div>
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/*"
              onChange={handleFileChange}
            />
          </div>

          <div className="text-center md:text-left flex-1 z-10">
            <h1 className="text-3xl font-bold text-white mb-2">{profile?.name}</h1>
            <div className="flex flex-wrap gap-3 justify-center md:justify-start items-center">
              <span className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-sm font-medium border border-purple-500/30 capitalize flex items-center gap-2">
                <Shield className="w-3 h-3" />
                {profile?.role}
              </span>
              <span className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-sm font-medium border border-blue-500/30 flex items-center gap-2">
                <Star className="w-3 h-3" />
                Level {learnerStats?.learnerLevel?.level || 1} {learnerStats?.learnerLevel?.title || 'Learner'}
              </span>
            </div>
          </div>
          <div className="flex gap-4 z-10">
            <button
              onClick={logout}
              className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg transition-colors font-medium"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-6 gap-8">
          {/* Sidebar Tabs */}
          <div className="lg:col-span-1 space-y-2 lg:sticky lg:top-28 h-fit">
            <button
              onClick={() => setActiveTab('general')}
              className={`w-full text-left px-4 py-3 rounded-lg font-medium transition-colors flex items-center gap-3 ${activeTab === 'general'
                ? 'bg-purple-600/10 text-purple-400 border border-purple-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-transparent'
                }`}
            >
              <Target className="w-4 h-4" />
              General
            </button>
            <button
              onClick={() => setActiveTab('skills')}
              className={`w-full text-left px-4 py-3 rounded-lg font-medium transition-colors flex items-center gap-3 ${activeTab === 'skills'
                ? 'bg-purple-600/10 text-purple-400 border border-purple-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-transparent'
                }`}
            >
              <Zap className="w-4 h-4" />
              Skills & Growth
            </button>
            <button
              onClick={() => setActiveTab('security')}
              className={`w-full text-left px-4 py-3 rounded-lg font-medium transition-colors flex items-center gap-3 ${activeTab === 'security'
                ? 'bg-purple-600/10 text-purple-400 border border-purple-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-transparent'
                }`}
            >
              <Shield className="w-4 h-4" />
              Security
            </button>

            {profile?.role === 'manager' && (
              <>
                <button
                  onClick={() => setActiveTab('team')}
                  className={`w-full text-left px-4 py-3 rounded-lg font-medium transition-colors flex items-center gap-3 ${activeTab === 'team'
                    ? 'bg-purple-600/10 text-purple-400 border border-purple-500/20'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-transparent'
                    }`}
                >
                  <Award className="w-4 h-4" />
                  My Team
                </button>
                <div className="pt-4 mt-4 border-t border-slate-800">
                  <Link to="/manager/settings" className="block w-full text-left px-4 py-3 rounded-lg font-medium text-slate-400 hover:text-white hover:bg-slate-900 transition-colors">
                    Manager Settings
                  </Link>
                </div>
              </>
            )}
          </div>

          {/* Form Area */}
          <div className="lg:col-span-5">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 min-h-[500px]">
              <h2 className="text-xl font-semibold text-white mb-6 border-b border-slate-800 pb-4 flex items-center gap-2">
                {activeTab === 'general' && <>General Information</>}
                {activeTab === 'skills' && <>Skills & Achievements</>}
                {activeTab === 'security' && <>Change Password</>}
                {activeTab === 'team' && <>Team Overview</>}
              </h2>

              {message.text && (
                <div className={`p-4 rounded-lg mb-6 text-sm font-medium ${message.type === 'error' ? 'bg-red-500/10 text-red-500 border border-red-500/20' : 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                  }`}>
                  {message.text}
                </div>
              )}

              {activeTab === 'general' && (
                <div className="space-y-6 max-w-xl">
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">Full Name</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name || ''}
                      onChange={handleChange}
                      className="w-full bg-slate-950/50 border border-slate-800 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-purple-500 transition-colors"
                    />
                    {profile?.profileUpdateRequest?.status === 'pending' && (
                      <p className="text-xs text-amber-400 mt-2 bg-amber-400/10 p-2 rounded">
                        <span className="font-bold">Pending Approval:</span> Request to change name to "{profile.profileUpdateRequest.value}"
                      </p>
                    )}
                    {profile?.profileUpdateRequest?.status === 'rejected' && (
                      <p className="text-xs text-red-400 mt-2 bg-red-400/10 p-2 rounded">
                        <span className="font-bold">Request Rejected:</span> Change to "{profile.profileUpdateRequest.value}" was declined by admin.
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">Email Address</label>
                    <div className="w-full bg-slate-950/30 border border-slate-800 rounded-lg px-4 py-2.5 text-slate-400 cursor-not-allowed">
                      {profile?.email}
                    </div>
                  </div>

                  <div className="pt-4">
                    <button
                      onClick={handleUpdate}
                      disabled={loading}
                      className="px-6 py-2 bg-purple-600 hover:bg-purple-500 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
                    >
                      {loading ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </div>
              )}

              {activeTab === 'skills' && (
                <div className="space-y-12">
                  {/* 1. Radar Chart Section */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                    <div>
                      <h3 className="text-lg font-bold text-white mb-4">Skill Capability Matrix</h3>
                      <p className="text-slate-400 text-sm mb-6">
                        Visual representation of your technical competencies based on completed courses, assessments, and peer reviews.
                      </p>
                      <div className="space-y-3">
                        {chartData.map((skill, idx) => (
                          <div key={idx} className="flex justify-between items-center text-sm">
                            <span className="text-slate-300">{skill.subject}</span>
                            <div className="flex bg-slate-800 h-2 w-32 rounded-full overflow-hidden">
                              <div
                                className="bg-purple-500 h-full rounded-full"
                                style={{ width: `${(skill.A / skill.fullMark) * 100}%` }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="h-64 md:h-80 w-full bg-slate-950/50 rounded-xl border border-slate-800 flex items-center justify-center">
                      <ResponsiveContainer width="100%" height="100%">
                        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={chartData}>
                          <PolarGrid stroke="#334155" />
                          <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                          <PolarRadiusAxis angle={30} domain={[0, 150]} tick={false} axisLine={false} />
                          <Radar
                            name="My Skills"
                            dataKey="A"
                            stroke="#8b5cf6"
                            strokeWidth={3}
                            fill="#8b5cf6"
                            fillOpacity={0.3}
                          />
                          <Legend wrapperStyle={{ paddingTop: '20px' }} />
                        </RadarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* 2. Achievements Section */}
                  <div>
                    <h3 className="text-lg font-bold text-white mb-6">Recent Achievements</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                      {(learnerStats?.achievements || []).length > 0 ? (
                        learnerStats.achievements.map((badge, idx) => {
                          const IconComponent = { Zap, Award, Star, Target }[badge.icon] || Award;
                          return (
                            <div key={idx} className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 flex items-center gap-4">
                              <div className={`p-3 rounded-full ${badge.bg} ${badge.color}`}>
                                <IconComponent className="w-6 h-6" />
                              </div>
                              <div>
                                <h4 className="font-bold text-white text-sm">{badge.title}</h4>
                                <p className="text-xs text-slate-400">{badge.desc}</p>
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <div className="col-span-full p-4 text-slate-400 text-center bg-slate-800/30 rounded-lg">
                          Start learning to unlock achievements!
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'security' && (
                <div className="space-y-8 max-w-xl">
                  {/* Password Update - Available for everyone */}
                  <form onSubmit={handleUpdate} className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-slate-400 mb-2">Current Password</label>
                      <input
                        type="password"
                        name="currentPassword"
                        value={formData.currentPassword}
                        onChange={handleChange}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors"
                        placeholder="Enter current password"
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-slate-400 mb-2">New Password</label>
                        <input
                          type="password"
                          name="newPassword"
                          value={formData.newPassword}
                          onChange={handleChange}
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors"
                          placeholder="Min. 8 characters"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-400 mb-2">Confirm New Password</label>
                        <input
                          type="password"
                          name="confirmPassword"
                          value={formData.confirmPassword}
                          onChange={handleChange}
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors"
                          placeholder="Confirm new password"
                        />
                      </div>
                    </div>
                    <div className="pt-2">
                      <button type="submit" disabled={loading} className="px-6 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-medium rounded-lg transition-colors disabled:opacity-50">
                        {loading ? 'Updating...' : 'Update Password'}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {activeTab === 'team' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {team.length > 0 ? (
                    team.map(member => (
                      <div key={member._id} className="bg-slate-950/50 border border-slate-800 rounded-xl p-6 flex flex-col items-center text-center hover:border-purple-500/30 transition-colors">
                        <div className="w-16 h-16 rounded-full bg-slate-800 overflow-hidden mb-4">
                          {member.avatar ? (
                            <img src={getImageUrl(member.avatar)} alt={member.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-xl font-bold text-slate-500">
                              {member.name?.[0]}
                            </div>
                          )}
                        </div>
                        <h3 className="font-bold text-white mb-1">{member.name}</h3>
                        <p className="text-sm text-slate-400 mb-4">{member.email}</p>
                        <button className="text-sm text-purple-400 hover:text-purple-300 font-medium">
                          View IDP Status
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-full text-center py-12 text-slate-500">
                      No team members found.
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;
