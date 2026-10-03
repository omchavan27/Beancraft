import React, { useState, useEffect } from 'react';
import api from '../utils/api';

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [alertMsg, setAlertMsg] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/orders');
      if (res.data.success) {
        setOrders(res.data.orders);
      }
    } catch (err) {
      console.error('Error fetching admin orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    setUpdatingId(orderId);
    try {
      const res = await api.put(`/api/orders/${orderId}/status`, { status: newStatus });
      if (res.data.success) {
        setAlertMsg(`Order #${orderId} status changed to "${newStatus}" in MySQL!`);
        // Update local state immediately
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
        );
        setTimeout(() => setAlertMsg(''), 4000);
      }
    } catch (err) {
      console.error('Failed to update status:', err);
      alert('Failed to update status in database.');
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredOrders = filterStatus === 'All'
    ? orders
    : orders.filter((o) => o.status === filterStatus);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Completed':
        return <span className="badge badge-status-completed px-3 py-1 rounded-pill"><i className="bi bi-check-circle-fill me-1"></i> Completed</span>;
      case 'Preparing':
        return <span className="badge badge-status-preparing px-3 py-1 rounded-pill"><i className="bi bi-fire me-1"></i> Preparing</span>;
      case 'Cancelled':
        return <span className="badge badge-status-cancelled px-3 py-1 rounded-pill"><i className="bi bi-x-circle-fill me-1"></i> Cancelled</span>;
      default:
        return <span className="badge badge-status-pending px-3 py-1 rounded-pill"><i className="bi bi-hourglass-split me-1"></i> Pending</span>;
    }
  };

  return (
    <div className="container py-4">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div>
          <h1 className="fw-bold text-coffee-dark mb-1">Customer Orders (Admin)</h1>
          <p className="text-muted small mb-0">Live kitchen order queue.</p>
        </div>

        <div className="d-flex align-items-center gap-2">
          {/* Status Filter */}
          <select
            className="form-select form-select-sm"
            style={{ width: '150px' }}
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="All">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Preparing">Preparing</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </select>

          <button onClick={fetchOrders} className="btn btn-outline-secondary btn-sm rounded-pill px-3 d-flex align-items-center gap-1">
            <i className="bi bi-arrow-clockwise"></i>
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {alertMsg && (
        <div className="alert alert-success py-2 d-flex align-items-center gap-2 mb-4 rounded-3 shadow-sm" role="alert">
          <i className="bi bi-check-circle-fill fs-5"></i>
          <div>{alertMsg}</div>
        </div>
      )}

      {loading ? (
        <div className="text-center py-5 text-muted">
          <div className="spinner-border text-coffee mb-2" role="status"></div>
          <div>Loading customer orders from MySQL...</div>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="card card-beancraft border-0 p-5 text-center">
          <i className="bi bi-inbox fs-1 text-muted mb-2"></i>
          <h4 className="fw-bold text-coffee-dark">No orders found</h4>
          <p className="text-muted small">No orders match the selected filter criteria.</p>
        </div>
      ) : (
        <div className="card card-beancraft border-0 p-3 p-md-4">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light small text-uppercase">
                <tr>
                  <th>Order ID</th>
                  <th>Customer Info</th>
                  <th>Items Ordered</th>
                  <th>Amount</th>
                  <th>Date & Time</th>
                  <th>Status</th>
                  <th className="text-end">Update Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => (
                  <tr key={order.id}>
                    <td className="fw-bold text-coffee-dark">
                      #{order.id}
                      {order.payment && (
                        <div>
                          <span className="badge bg-success-subtle text-success border border-success-subtle" style={{ fontSize: '0.68rem' }}>
                            PAID ({order.payment.method})
                          </span>
                        </div>
                      )}
                    </td>

                    <td>
                      <div className="fw-bold text-coffee-dark">{order.customer_name}</div>
                      <div className="text-muted small" style={{ fontSize: '0.78rem' }}>
                        {order.customer_email}
                      </div>
                    </td>

                    <td>
                      <div className="small">
                        {order.items?.map((item) => (
                          <div key={item.id} className="text-truncate" style={{ maxWidth: '220px' }}>
                            <strong className="text-coffee-dark">{item.quantity}x</strong> {item.item_name}
                          </div>
                        ))}
                      </div>
                    </td>

                    <td className="fw-bold text-coffee-accent">
                      ₹{Number(order.total).toFixed(2)}
                    </td>

                    <td className="text-muted small">
                      {new Date(order.order_date).toLocaleDateString()}<br />
                      <span className="text-black-50">{new Date(order.order_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </td>

                    <td>{getStatusBadge(order.status)}</td>

                    <td className="text-end">
                      <div className="d-inline-flex gap-1">
                        <select
                          className="form-select form-select-sm"
                          style={{ minWidth: '130px' }}
                          value={order.status}
                          disabled={updatingId === order.id}
                          onChange={(e) => handleStatusChange(order.id, e.target.value)}
                        >
                          <option value="Pending">Pending</option>
                          <option value="Preparing">Preparing</option>
                          <option value="Completed">Completed</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-3 pt-3 border-top d-flex justify-content-between text-muted small">
            <span>Showing <strong>{filteredOrders.length}</strong> orders</span>
            
          </div>
        </div>
      )}
    </div>
  );
}
