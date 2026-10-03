import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await login(email, password);
      if (data.user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/customer');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Login failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  const fillCredentials = (type) => {
    if (type === 'admin') {
      setEmail('admin@beancraft.com');
      setPassword('admin123');
    } else {
      setEmail('customer@beancraft.com');
      setPassword('admin123');
    }
  };

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-12 col-md-8 col-lg-5">
          <div className="card card-beancraft border-0 p-4 p-md-5">
            <div className="text-center mb-4">
              <div className="bg-coffee-dark text-warning rounded-circle d-inline-flex p-3 mb-3 shadow-sm">
                <i className="bi bi-cup-hot-fill fs-2"></i>
              </div>
              <h2 className="fw-bold text-coffee-dark mb-1">Welcome Back</h2>
              <p className="text-muted small">BeanCraft – Restaurant Management System</p>
            </div>

            {error && (
              <div className="alert alert-danger py-2 small d-flex align-items-center gap-2 mb-3" role="alert">
                <i className="bi bi-exclamation-triangle-fill"></i>
                <div>{error}</div>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label small fw-semibold text-coffee-dark">Email Address</label>
                <div className="input-group">
                  <span className="input-group-text bg-light border-end-0 text-muted">
                    <i className="bi bi-envelope"></i>
                  </span>
                  <input
                    type="email"
                    className="form-control border-start-0"
                    placeholder="e.g. name@example.com"
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
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn btn-coffee w-100 py-2 mb-3 shadow-sm d-flex justify-content-center align-items-center gap-2"
              >
                {loading && <span className="spinner-border spinner-border-sm" role="status"></span>}
                <span>{loading ? 'Logging in...' : 'Sign In'}</span>
                {!loading && <i className="bi bi-arrow-right"></i>}
              </button>
            </form>

            {/* Quick Demo Autofill buttons for College Viva presentation */}
            <div className="p-3 bg-light rounded-3 mt-2 border">
              <div className="small fw-bold text-coffee-dark mb-2 text-center">
                <i className="bi bi-lightning-charge-fill text-warning me-1"></i> Quick Demo Autofill:
              </div>
              <div className="d-flex gap-2">
                <button
                  type="button"
                  onClick={() => fillCredentials('admin')}
                  className="btn btn-sm btn-outline-dark w-50 py-1"
                >
                  <i className="bi bi-shield-lock me-1"></i> Admin
                </button>
                <button
                  type="button"
                  onClick={() => fillCredentials('customer')}
                  className="btn btn-sm btn-outline-secondary w-50 py-1"
                >
                  <i className="bi bi-person me-1"></i> Customer
                </button>
              </div>
            </div>

            <div className="text-center mt-4">
              <span className="text-muted small">Don't have an account? </span>
              <Link to="/signup" className="text-coffee-accent fw-bold text-decoration-none small">
                Sign Up as Customer
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
