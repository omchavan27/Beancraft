import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout, cart, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const totalCartCount = cart.reduce((count, item) => count + item.quantity, 0);

  const isActive = (path) => {
    return location.pathname === path ? 'text-warning fw-bold' : 'text-white-50';
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark navbar-beancraft py-2 sticky-top shadow-sm">
      <div className="container">
        {/* Brand */}
        <Link to={isAdmin ? "/admin" : (user ? "/customer" : "/login")} className="navbar-brand d-flex items-center gap-2 text-decoration-none">
          <div className="bg-warning text-dark rounded-circle d-flex align-items-center justify-content-center" style={{ width: '36px', height: '36px' }}>
            <i className="bi bi-cup-hot-fill fs-5 text-coffee-dark"></i>
          </div>
          <div>
            <span className="fw-bold fs-4 text-white brand-font tracking-wide">BeanCraft</span>
            
          </div>
        </Link>

        {/* Mobile Toggle Button */}
        <button
          className="navbar-toggler border-0"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#beancraftNavbar"
          aria-controls="beancraftNavbar"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        {/* Nav Links */}
        <div className="collapse navbar-collapse" id="beancraftNavbar">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0 ms-lg-3 gap-1">
            {user && !isAdmin && (
              <>
                <li className="nav-item">
                  <Link className={`nav-link ${isActive('/customer')}`} to="/customer">
                    <i className="bi bi-speedometer2 me-1"></i> Dashboard
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className={`nav-link ${isActive('/menu')}`} to="/menu">
                    <i className="bi bi-journal-text me-1"></i> Menu
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className={`nav-link ${isActive('/cart')} position-relative`} to="/cart">
                    <i className="bi bi-cart3 me-1"></i> Cart
                    {totalCartCount > 0 && (
                      <span className="position-absolute top-1 start-100 translate-middle badge rounded-pill bg-warning text-dark">
                        {totalCartCount}
                      </span>
                    )}
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className={`nav-link ${isActive('/orders')}`} to="/orders">
                    <i className="bi bi-receipt me-1"></i> My Orders
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className={`nav-link ${isActive('/payments')}`} to="/payments">
                    <i className="bi bi-credit-card me-1"></i> Payments
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className={`nav-link ${isActive('/booking')}`} to="/booking">
                    <i className="bi bi-calendar-check me-1"></i> Book Table
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className={`nav-link ${isActive('/profile')}`} to="/profile">
                    <i className="bi bi-person me-1"></i> Profile
                  </Link>
                </li>
              </>
            )}

            {user && isAdmin && (
              <>
                <li className="nav-item">
                  <Link className={`nav-link ${isActive('/admin')}`} to="/admin">
                    <i className="bi bi-graph-up me-1"></i> Dashboard
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className={`nav-link ${isActive('/admin/orders')}`} to="/admin/orders">
                    <i className="bi bi-bag-check me-1"></i> Orders
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className={`nav-link ${isActive('/admin/menu')}`} to="/admin/menu">
                    <i className="bi bi-card-checklist me-1"></i> Menu Items
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className={`nav-link ${isActive('/admin/bookings')}`} to="/admin/bookings">
                    <i className="bi bi-calendar-event me-1"></i> Bookings
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className={`nav-link ${isActive('/admin/customers')}`} to="/admin/customers">
                    <i className="bi bi-people me-1"></i> Customers
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className={`nav-link ${isActive('/admin/payments')}`} to="/admin/payments">
                    <i className="bi bi-cash-stack me-1"></i> Revenue
                  </Link>
                </li>
              </>
            )}
          </ul>

          {/* User Profile / Auth buttons */}
          <div className="d-flex align-items-center gap-2">
            {user ? (
              <div className="d-flex align-items-center gap-3">
                <div className="text-end d-none d-sm-block">
                  <div className="text-white small fw-bold">{user.name}</div>
                  <div className="text-warning small" style={{ fontSize: '0.75rem' }}>
                    {user.role === 'admin' ? 'System Administrator' : 'Customer Account'}
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="btn btn-outline-light btn-sm px-3 rounded-pill d-flex align-items-center gap-1"
                >
                  <i className="bi bi-box-arrow-right"></i>
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <div className="d-flex gap-2">
                <Link to="/login" className="btn btn-outline-light btn-sm px-3 rounded-pill">
                  Login
                </Link>
                <Link to="/signup" className="btn btn-warning text-dark fw-bold btn-sm px-3 rounded-pill">
                  Signup
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
