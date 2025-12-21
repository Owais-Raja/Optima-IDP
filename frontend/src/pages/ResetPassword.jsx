import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../services/api';

// =================================================================================================
// Reset Password Page
// -------------------------------------------------------------------------------------------------
// Handles setting a new password using a token.
// =================================================================================================

function ResetPassword() {
  // =================================================================================================
  // State Definitions
  // -------------------------------------------------------------------------------------------------
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(token ? null : 'Missing reset token');
  // State Definitions ends here

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) return;
    if (password !== confirm) {
      setError('Passwords do not match');
      return;
    }
    setLoading(true);
    setMessage(null);
    setError(null);
    try {
      await api.post('/auth/reset-password', { token, password });
      setMessage('Password updated. You can now log in with your new password.');
      setPassword('');
      setConfirm('');
    } catch (err) {
      const detail = err?.response?.data;
      setError(detail?.message || 'Could not reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="layout">
      <div className="card">
        <p className="eyebrow">Password reset</p>
        <h1>Set a new password</h1>
        <p className="lede">Choose a strong password to secure your account.</p>

        <form className="form" onSubmit={handleSubmit}>
          <label>
            New password
            <input
              type="password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength={8}
            />
          </label>
          <label>
            Confirm password
            <input
              type="password"
              name="confirm"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="••••••••"
              required
              minLength={8}
            />
          </label>
          <button type="submit" disabled={loading || !token}>
            {loading ? 'Updating…' : 'Reset password'}
          </button>
        </form>

        {message && <p className="success">{message}</p>}
        {error && <p className="error">{error}</p>}

        <div className="form-footnote">
          <Link to="/" className="link subtle">
            Back to login
          </Link>
        </div>
      </div>
    </div>
  );
}

export default ResetPassword;

