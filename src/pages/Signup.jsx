import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Signup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await signup(name, email, password);
      navigate('/customer');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Registration failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-12 col-md-8 col-lg-5">
          <div className="card card-beancraft border-0 p-4 p-md-5">
            <div className="text-center mb-4">
              <div className="bg-coffee-dark text-warning rounded-circle d-inline-flex p-3 mb-3 shadow-sm">
                <i className="bi bi-person-plus-fill fs-2"></i>
              </div>
              <h2 className="fw-bold text-coffee-dark mb-1">Create Account</h2>
              <p className="text-muted small">Join BeanCraft as a valued customer</p>
            </div>

            {error && (
              <div className="alert alert-danger py-2 small d-flex align-items-center gap-2 mb-3" role="alert">
                <i className="bi bi-exclamation-triangle-fill"></i>
                <div>{error}</div>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label small fw-semibold text-coffee-dark">Full Name</label>
                <div className="input-group">
                  <span className="input-group-text bg-light border-end-0 text-muted">
                    <i className="bi bi-person"></i>
                  </span>
                  <input
                    type="text"
                    className="form-control border-start-0"
                    placeholder="e.g. Priya Patel"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label small fw-semibold text-coffee-dark">Email Address</label>
                <div className="input-group">
                  <span className="input-group-text bg-light border-end-0 text-muted">
                    <i className="bi bi-envelope"></i>
                  </span>
                  <input
                    type="email"
                    className="form-control border-start-0"
                    placeholder="e.g. priya@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="form-label small fw-semibold text-coffee-dark">Password</label>
                <div className="input-group">
                  <span className="input-group-text bg-light border-end-0 text-muted">
                    <i className="bi bi-lock"></i>
                  </span>
                  <input
                    type="password"
                    className="form-control border-start-0"
                    placeholder="Create a secure password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                  />
                </div>
                <div className="form-text small">Minimum 6 characters. Stored securely using bcryptjs.</div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn btn-coffee w-100 py-2 mb-3 shadow-sm d-flex justify-content-center align-items-center gap-2"
              >
                {loading && <span className="spinner-border spinner-border-sm" role="status"></span>}
                <span>{loading ? 'Creating Account...' : 'Sign Up'}</span>
                {!loading && <i className="bi bi-arrow-right"></i>}
              </button>
            </form>

            <div className="text-center mt-3">
              <span className="text-muted small">Already have an account? </span>
              <Link to="/login" className="text-coffee-accent fw-bold text-decoration-none small">
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
