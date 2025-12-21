import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

// =================================================================================================
// Forgot Password Page
// -------------------------------------------------------------------------------------------------
// Handles password reset request by email.
// =================================================================================================

function ForgotPassword() {
  // =================================================================================================
  // State Definitions
  // -------------------------------------------------------------------------------------------------
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  // State Definitions ends here

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    setError(null);
    try {
      await api.post('/auth/forgot-password', { email });
      setMessage('If an account exists, a reset link has been sent to your email.');
      setEmail('');
    } catch (err) {
      const detail = err?.response?.data;
      setError(detail?.message || 'Could not send reset email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="layout">
      <div className="card">
        <p className="eyebrow">Password reset</p>
        <h1>Forgot password</h1>
        <p className="lede">Enter your email to receive a reset link.</p>

        <form className="form" onSubmit={handleSubmit}>
          <label>
            Email
            <input
              type="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />
          </label>
          <button type="submit" disabled={loading}>
            {loading ? 'Sending…' : 'Send reset link'}
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

export default ForgotPassword;

