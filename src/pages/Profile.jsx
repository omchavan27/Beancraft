import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Profile() {
  const { user } = useAuth();

  return (
    <div className="container py-4">
      <div className="row justify-content-center">
        <div className="col-12 col-md-8 col-lg-6">
          <div className="card card-beancraft border-0 p-4 p-md-5">
            <div className="text-center mb-4">
              <div className="bg-coffee-dark text-warning rounded-circle d-inline-flex p-4 mb-3 shadow-sm">
                <i className="bi bi-person-circle fs-1"></i>
              </div>
              <h2 className="fw-bold text-coffee-dark mb-1">{user?.name || 'Customer'}</h2>
              <span className="badge bg-warning text-dark text-uppercase px-3 py-1 rounded-pill fw-bold">
                {user?.role || 'Customer'}
              </span>
            </div>

            <div className="list-group list-group-flush border-top border-bottom my-3">
              <div className="list-group-item px-0 py-3 d-flex justify-content-between align-items-center">
                <span className="text-muted small">Customer ID:</span>
                <span className="fw-bold text-coffee-dark">USER#{user?.id}</span>
              </div>
              <div className="list-group-item px-0 py-3 d-flex justify-content-between align-items-center">
                <span className="text-muted small">Full Name:</span>
                <span className="fw-bold text-coffee-dark">{user?.name}</span>
              </div>
              <div className="list-group-item px-0 py-3 d-flex justify-content-between align-items-center">
                <span className="text-muted small">Email Address:</span>
                <span className="fw-bold text-coffee-dark">{user?.email}</span>
              </div>
              <div className="list-group-item px-0 py-3 d-flex justify-content-between align-items-center">
                <span className="text-muted small">Account Type:</span>
                <span className="text-success fw-bold">Active Customer</span>
              </div>
            </div>

            <div className="d-grid gap-2 mt-4">
              <Link to="/orders" className="btn btn-coffee rounded-pill py-2">
                <i className="bi bi-receipt me-2"></i> View My Orders
              </Link>
              <Link to="/payments" className="btn btn-outline-secondary rounded-pill py-2">
                <i className="bi bi-credit-card me-2"></i> Payment Receipts
              </Link>
              <Link to="/booking" className="btn btn-outline-secondary rounded-pill py-2">
                <i className="bi bi-calendar-check me-2"></i> Manage Table Reservations
              </Link>
            </div>

            
          </div>
        </div>
      </div>
    </div>
  );
}
