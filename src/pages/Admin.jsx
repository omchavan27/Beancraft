import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import api from '../utils/api';

export default function Admin() {
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    totalCustomers: 0,
    totalBookings: 0,
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [revenueData, setRevenueData] = useState([]);
  const [dbStatus, setDbStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdminDashboard();
  }, []);

  const fetchAdminDashboard = async () => {
    try {
      setLoading(true);
      const [statsRes, revRes] = await Promise.all([
        api.get('/api/dashboard/stats'),
        api.get('/api/dashboard/revenue'),
      ]);

      if (statsRes.data.success) {
        setStats(statsRes.data.stats);
        setRecentOrders(statsRes.data.recentOrders || []);
        setDbStatus(statsRes.data.dbStatus);
      }

      if (revRes.data.success) {
        setRevenueData(revRes.data.revenueData || []);
      }
    } catch (err) {
      console.error('Error fetching admin dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Completed':
        return <span className="badge badge-status-completed px-2 py-1 rounded-pill"><i className="bi bi-check-circle me-1"></i>Completed</span>;
      case 'Preparing':
        return <span className="badge badge-status-preparing px-2 py-1 rounded-pill"><i className="bi bi-fire me-1"></i>Preparing</span>;
      case 'Cancelled':
        return <span className="badge badge-status-cancelled px-2 py-1 rounded-pill"><i className="bi bi-x me-1"></i>Cancelled</span>;
      default:
        return <span className="badge badge-status-pending px-2 py-1 rounded-pill"><i className="bi bi-clock me-1"></i>Pending</span>;
    }
  };

  return (
    <div className="container py-4">
      {/* Top Header & DB Status */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div>
          <h1 className="fw-bold text-coffee-dark mb-1">Admin Dashboard</h1>
          <p className="text-muted small mb-0">Overview of BeanCraft cafe operations</p>
        </div>

        <div className="d-flex align-items-center gap-2">
         
          <button onClick={fetchAdminDashboard} className="btn btn-outline-secondary btn-sm rounded-pill px-3 d-flex align-items-center gap-1">
            <i className="bi bi-arrow-clockwise"></i>
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* 4 Stats Cards */}
      <div className="row g-3 mb-4">
        {/* Total Revenue */}
        <div className="col-12 col-sm-6 col-lg-3">
          <div className="card card-beancraft h-100 p-3 p-md-4 border-0">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <span className="text-muted small fw-semibold text-uppercase">Total Revenue</span>
              <div className="bg-success-subtle text-success rounded p-2">
                <i className="bi bi-currency-rupee fs-5"></i>
              </div>
            </div>
            <h2 className="display-6 fw-bold text-coffee-dark mb-0">
              ₹{Number(stats.totalRevenue).toFixed(2)}
            </h2>
            <div className="text-muted small mt-2 d-flex align-items-center gap-1">
              
              
            </div>
          </div>
        </div>

        {/* Total Orders */}
        <div className="col-12 col-sm-6 col-lg-3">
          <div className="card card-beancraft h-100 p-3 p-md-4 border-0">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <span className="text-muted small fw-semibold text-uppercase">Total Orders</span>
              <div className="bg-primary-subtle text-primary rounded p-2">
                <i className="bi bi-bag-check fs-5"></i>
              </div>
            </div>
            <h2 className="display-6 fw-bold text-coffee-dark mb-0">
              {stats.totalOrders}
            </h2>
            <div className="text-muted small mt-2 d-flex align-items-center gap-1">
              
            </div>
          </div>
        </div>

        {/* Total Customers */}
        <div className="col-12 col-sm-6 col-lg-3">
          <div className="card card-beancraft h-100 p-3 p-md-4 border-0">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <span className="text-muted small fw-semibold text-uppercase">Total Customers</span>
              <div className="bg-warning-subtle text-dark rounded p-2">
                <i className="bi bi-people fs-5"></i>
              </div>
            </div>
            <h2 className="display-6 fw-bold text-coffee-dark mb-0">
              {stats.totalCustomers}
            </h2>
            <div className="text-muted small mt-2 d-flex align-items-center gap-1">
              
            </div>
          </div>
        </div>

        {/* Total Bookings */}
        <div className="col-12 col-sm-6 col-lg-3">
          <div className="card card-beancraft h-100 p-3 p-md-4 border-0">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <span className="text-muted small fw-semibold text-uppercase">Total Bookings</span>
              <div className="bg-info-subtle text-info-emphasis rounded p-2">
                <i className="bi bi-calendar2-heart fs-5"></i>
              </div>
            </div>
            <h2 className="display-6 fw-bold text-coffee-dark mb-0">
              {stats.totalBookings}
            </h2>
            <div className="text-muted small mt-2 d-flex align-items-center gap-1">
              
            </div>
          </div>
        </div>
      </div>

      {/* Revenue Graph & Quick Links */}
      <div className="row g-4 mb-4">
        {/* Recharts Revenue Graph */}
        <div className="col-12 col-lg-8">
          <div className="card card-beancraft border-0 p-4 h-100">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <div>
                <h5 className="fw-bold text-coffee-dark mb-0">
                  <i className="bi bi-graph-up-arrow me-2 text-coffee-accent"></i> Revenue Trend (Recharts)
                </h5>
                
              </div>
              <span className="badge bg-light text-dark border">Daily Aggregate</span>
            </div>

            <div style={{ width: '100%', height: '280px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={revenueData}
                  margin={{ top: 10, right: 20, left: 0, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#C67C4E" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#C67C4E" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0ebe4" />
                  <XAxis dataKey="date" stroke="#8D6E63" fontSize={12} />
                  <YAxis stroke="#8D6E63" fontSize={12} tickFormatter={(val) => `₹${val}`} />
                  <Tooltip
                    formatter={(value) => [`₹${Number(value).toFixed(2)}`, 'Revenue']}
                    labelFormatter={(label) => `Date: ${label}`}
                    contentStyle={{ backgroundColor: '#2C1810', color: '#fff', borderRadius: '8px', border: 'none' }}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="#C67C4E" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Quick Admin Actions */}
        <div className="col-12 col-lg-4">
          <div className="card card-beancraft border-0 p-4 h-100 d-flex flex-column justify-content-between">
            <div>
              <h5 className="fw-bold text-coffee-dark mb-3">
                <i className="bi bi-lightning-charge me-2 text-warning"></i> Quick Operations
              </h5>
              <div className="d-grid gap-2">
                <Link to="/admin/orders" className="btn btn-outline-dark py-2 text-start d-flex justify-content-between align-items-center">
                  <span><i className="bi bi-bag-check me-2"></i> Manage Orders</span>
                  <i className="bi bi-chevron-right small"></i>
                </Link>
                <Link to="/admin/menu" className="btn btn-outline-dark py-2 text-start d-flex justify-content-between align-items-center">
                  <span><i className="bi bi-card-checklist me-2"></i> Update Cafe Menu</span>
                  <i className="bi bi-chevron-right small"></i>
                </Link>
                <Link to="/admin/bookings" className="btn btn-outline-dark py-2 text-start d-flex justify-content-between align-items-center">
                  <span><i className="bi bi-calendar-event me-2"></i> Confirm Table Bookings</span>
                  <i className="bi bi-chevron-right small"></i>
                </Link>
                <Link to="/admin/customers" className="btn btn-outline-dark py-2 text-start d-flex justify-content-between align-items-center">
                  <span><i className="bi bi-people me-2"></i> Customer Analytics</span>
                  <i className="bi bi-chevron-right small"></i>
                </Link>
                <Link to="/admin/payments" className="btn btn-outline-dark py-2 text-start d-flex justify-content-between align-items-center">
                  <span><i className="bi bi-cash-stack me-2"></i> Payments Ledger</span>
                  <i className="bi bi-chevron-right small"></i>
                </Link>
              </div>
            </div>

           
          </div>
        </div>
      </div>

      {/* Recent Orders Table */}
      <div className="card card-beancraft border-0 p-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="fw-bold text-coffee-dark mb-0">
            <i className="bi bi-clock-history me-2 text-coffee-accent"></i> Recent Cafe Orders
          </h5>
          <Link to="/admin/orders" className="btn btn-sm btn-coffee rounded-pill px-3">
            View All Orders
          </Link>
        </div>

        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light small text-uppercase">
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Amount</th>
                <th>Date & Time</th>
                <th>Status</th>
                <th className="text-end">Manage</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-4 text-muted">
                    No orders logged in database yet.
                  </td>
                </tr>
              ) : (
                recentOrders.map((ord) => (
                  <tr key={ord.id}>
                    <td className="fw-bold text-coffee-dark">#{ord.id}</td>
                    <td>
                      <div className="fw-semibold text-coffee-dark">{ord.customer_name}</div>
                    </td>
                    <td className="fw-bold text-coffee-accent">₹{Number(ord.total).toFixed(2)}</td>
                    <td className="text-muted small">
                      {new Date(ord.order_date).toLocaleString()}
                    </td>
                    <td>{getStatusBadge(ord.status)}</td>
                    <td className="text-end">
                      <Link to="/admin/orders" className="btn btn-sm btn-outline-secondary rounded-pill px-2">
                        Update Status
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
