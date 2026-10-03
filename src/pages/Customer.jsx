import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

export default function Customer() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [payments, setPayments] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [ordersRes, paymentsRes, bookingsRes] = await Promise.all([
        api.get('/api/orders/my'),
        api.get('/api/payments/my'),
        api.get('/api/bookings/my'),
      ]);

      if (ordersRes.data.success) setOrders(ordersRes.data.orders);
      if (paymentsRes.data.success) setPayments(paymentsRes.data.payments);
      if (bookingsRes.data.success) setBookings(bookingsRes.data.bookings);
    } catch (err) {
      console.error('Error fetching customer data:', err);
    } finally {
      setLoading(false);
    }
  };

  const totalSpent = payments.reduce((sum, p) => sum + Number(p.amount), 0);
  const currentOrder = orders.length > 0 ? orders[0] : null;

  return (
    <div className="container py-4">
      {/* Welcome Banner */}
      <div className="card card-beancraft bg-coffee-dark text-white p-4 p-md-5 mb-4 border-0 position-relative overflow-hidden">
        <div className="position-absolute end-0 top-0 opacity-10 p-3 pointer-events-none d-none d-md-block">
          <i className="bi bi-cup-hot" style={{ fontSize: '10rem' }}></i>
        </div>
        <div className="position-relative" style={{ zIndex: 1 }}>
          <div className="d-flex align-items-center gap-2 text-warning mb-2 small fw-semibold text-uppercase tracking-wider">
            <i className="bi bi-stars"></i>
            <span>BeanCraft Hospitality Portal</span>
          </div>
          <h1 className="display-6 fw-bold mb-2">Welcome, {user?.name || 'Customer'}!</h1>
          <p className="lead text-white-50 mb-4" style={{ maxWidth: '600px' }}>
            Fresh artisanal coffee and gourmet snacks prepared with handcrafted love. Order delicious food or reserve your favorite cafe table.
          </p>
          <div className="d-flex flex-wrap gap-3">
            <Link to="/menu" className="btn btn-warning text-dark fw-bold px-4 py-2 rounded-pill shadow-sm">
              <i className="bi bi-journal-text me-2"></i> Browse Menu
            </Link>
            <Link to="/booking" className="btn btn-outline-light px-4 py-2 rounded-pill">
              <i className="bi bi-calendar-check me-2"></i> Book Table
            </Link>
          </div>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="row g-3 mb-4">
        <div className="col-12 col-md-4">
          <div className="card card-beancraft h-100 p-4">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <span className="text-muted small fw-semibold text-uppercase">Total Orders</span>
              <div className="bg-light rounded p-2 text-coffee">
                <i className="bi bi-bag-check fs-5"></i>
              </div>
            </div>
            <h2 className="display-6 fw-bold text-coffee-dark mb-0">{orders.length}</h2>
            <div className="text-muted small mt-2">
              <Link to="/orders" className="text-coffee-accent text-decoration-none fw-semibold">
                View order history &rarr;
              </Link>
            </div>
          </div>
        </div>

        <div className="col-12 col-md-4">
          <div className="card card-beancraft h-100 p-4">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <span className="text-muted small fw-semibold text-uppercase">Total Payments</span>
              <div className="bg-light rounded p-2 text-coffee">
                <i className="bi bi-wallet2 fs-5"></i>
              </div>
            </div>
            <h2 className="display-6 fw-bold text-coffee-dark mb-0">₹{totalSpent.toFixed(2)}</h2>
            <div className="text-muted small mt-2">
              <Link to="/payments" className="text-coffee-accent text-decoration-none fw-semibold">
                View receipts &rarr;
              </Link>
            </div>
          </div>
        </div>

        <div className="col-12 col-md-4">
          <div className="card card-beancraft h-100 p-4">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <span className="text-muted small fw-semibold text-uppercase">Reservations</span>
              <div className="bg-light rounded p-2 text-coffee">
                <i className="bi bi-calendar-heart fs-5"></i>
              </div>
            </div>
            <h2 className="display-6 fw-bold text-coffee-dark mb-0">{bookings.length}</h2>
            <div className="text-muted small mt-2">
              <Link to="/booking" className="text-coffee-accent text-decoration-none fw-semibold">
                Manage tables &rarr;
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Current Order Section */}
      <div className="row">
        <div className="col-12">
          <div className="card card-beancraft p-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h4 className="fw-bold text-coffee-dark mb-0">
                <i className="bi bi-clock-history me-2 text-coffee-accent"></i> Current Order
              </h4>
              {currentOrder && (
                <Link to="/orders" className="btn btn-sm btn-outline-secondary rounded-pill">
                  All Orders
                </Link>
              )}
            </div>

            {loading ? (
              <div className="text-center py-4 text-muted">
                <div className="spinner-border spinner-border-sm text-coffee me-2" role="status"></div>
                Loading latest order details...
              </div>
            ) : currentOrder ? (
              <div className="bg-light rounded-3 p-3 border">
                <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3 pb-2 border-bottom">
                  <div>
                    <span className="fw-bold text-coffee-dark fs-5">Order #{currentOrder.id}</span>
                    <span className="text-muted small ms-3">
                      <i className="bi bi-calendar3 me-1"></i>
                      {new Date(currentOrder.order_date).toLocaleString()}
                    </span>
                  </div>
                  <div>
                    <span className={`badge rounded-pill px-3 py-2 ${
                      currentOrder.status === 'Completed' ? 'badge-status-completed' :
                      currentOrder.status === 'Preparing' ? 'badge-status-preparing' :
                      currentOrder.status === 'Cancelled' ? 'badge-status-cancelled' :
                      'badge-status-pending'
                    }`}>
                      <i className="bi bi-record-fill me-1"></i> {currentOrder.status}
                    </span>
                  </div>
                </div>

                <div className="row align-items-center">
                  <div className="col-md-8">
                    <div className="small fw-semibold text-muted mb-2">ORDER ITEMS:</div>
                    <ul className="list-unstyled mb-0">
                      {currentOrder.items?.map((item) => (
                        <li key={item.id} className="d-flex justify-content-between py-1 small">
                          <span>
                            <strong className="text-coffee-dark">{item.quantity}x</strong> {item.item_name}
                          </span>
                          <span className="text-muted">₹{(item.price * item.quantity).toFixed(2)}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="col-md-4 text-md-end mt-3 mt-md-0 border-start-md ps-md-4">
                    <div className="text-muted small">Total Bill:</div>
                    <div className="fs-3 fw-bold text-coffee-dark mb-2">₹{Number(currentOrder.total).toFixed(2)}</div>
                    {!currentOrder.payment ? (
                      <Link to="/payments" className="btn btn-warning btn-sm text-dark fw-bold w-100 rounded-pill">
                        <i className="bi bi-credit-card me-1"></i> Pay Now
                      </Link>
                    ) : (
                      <span className="badge bg-success-subtle text-success border border-success-subtle px-3 py-2 rounded-pill">
                        <i className="bi bi-check-circle-fill me-1"></i> Paid ({currentOrder.payment.method})
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-5">
                <i className="bi bi-cup-straw text-muted fs-1 mb-2 d-block"></i>
                <h5 className="text-coffee-dark fw-bold">No recent orders yet</h5>
                <p className="text-muted small mb-3">Explore our delicious coffees, pizzas, burgers and brownies.</p>
                <Link to="/menu" className="btn btn-coffee rounded-pill px-4">
                  Browse Menu & Order
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
