import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/orders/my');
      if (res.data.success) {
        setOrders(res.data.orders);
        if (res.data.orders.length > 0 && !selectedOrder) {
          setSelectedOrder(res.data.orders[0]);
        }
      }
    } catch (err) {
      console.error('Error fetching orders:', err);
    } finally {
      setLoading(false);
    }
  };

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
      <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-3 mb-4">
        <div>
          <h1 className="fw-bold text-coffee-dark mb-1">My Orders</h1>
          <p className="text-muted small mb-0">Track live preparation status and view ordered cafe items</p>
        </div>
        <div className="d-flex gap-2">
          <button onClick={fetchOrders} className="btn btn-outline-secondary btn-sm rounded-pill px-3 d-flex align-items-center gap-1">
            <i className="bi bi-arrow-clockwise"></i>
            <span>Refresh Status</span>
          </button>
          <Link to="/menu" className="btn btn-coffee btn-sm rounded-pill px-3">
            <i className="bi bi-plus-lg me-1"></i> New Order
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-5 text-muted">
          <div className="spinner-border text-coffee mb-2" role="status"></div>
          <div>Loading your order history...</div>
        </div>
      ) : orders.length === 0 ? (
        <div className="card card-beancraft border-0 p-5 text-center">
          <i className="bi bi-receipt text-muted fs-1 mb-2"></i>
          <h4 className="fw-bold text-coffee-dark">No orders placed yet</h4>
          <p className="text-muted small mb-3">Your order history and live kitchen updates will appear here.</p>
          <div>
            <Link to="/menu" className="btn btn-coffee rounded-pill px-4">
              Browse Menu
            </Link>
          </div>
        </div>
      ) : (
        <div className="row g-4">
          {/* Orders List */}
          <div className="col-12 col-lg-7">
            <div className="card card-beancraft border-0 p-3 p-md-4">
              <h5 className="fw-bold text-coffee-dark mb-3">All Orders ({orders.length})</h5>
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-light small text-uppercase">
                    <tr>
                      <th>Order ID</th>
                      <th>Date</th>
                      <th>Amount</th>
                      <th>Status</th>
                      <th className="text-end">Details</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => {
                      const isSelected = selectedOrder?.id === order.id;
                      return (
                        <tr
                          key={order.id}
                          onClick={() => setSelectedOrder(order)}
                          style={{ cursor: 'pointer' }}
                          className={isSelected ? 'table-warning' : ''}
                        >
                          <td className="fw-bold text-coffee-dark">#{order.id}</td>
                          <td className="text-muted small">
                            {new Date(order.order_date).toLocaleDateString()}{' '}
                            <span className="d-none d-sm-inline">{new Date(order.order_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          </td>
                          <td className="fw-bold text-coffee-accent">₹{Number(order.total).toFixed(2)}</td>
                          <td>{getStatusBadge(order.status)}</td>
                          <td className="text-end">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedOrder(order);
                              }}
                              className={`btn btn-sm ${isSelected ? 'btn-coffee text-white' : 'btn-outline-secondary'} rounded-pill px-3`}
                            >
                              <i className="bi bi-eye me-1"></i> Items
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Selected Order Item Details */}
          <div className="col-12 col-lg-5">
            {selectedOrder ? (
              <div className="card card-beancraft border-0 p-4 sticky-top" style={{ top: '80px' }}>
                <div className="d-flex justify-content-between align-items-center mb-3 pb-2 border-bottom">
                  <div>
                    <h5 className="fw-bold text-coffee-dark mb-0">Order #{selectedOrder.id} Items</h5>
                    <span className="text-muted small">
                      {new Date(selectedOrder.order_date).toLocaleString()}
                    </span>
                  </div>
                  <div>{getStatusBadge(selectedOrder.status)}</div>
                </div>

                <div className="mb-4">
                  <div className="text-muted small fw-semibold text-uppercase mb-2">Itemized Breakdown:</div>
                  <div className="list-group list-group-flush border-top border-bottom">
                    {selectedOrder.items?.map((item) => (
                      <div key={item.id} className="list-group-item px-0 py-2 d-flex justify-content-between align-items-center">
                        <div className="d-flex align-items-center gap-2">
                          <span className="badge bg-light text-dark border">
                            {item.quantity}x
                          </span>
                          <span className="fw-semibold text-coffee-dark">{item.item_name}</span>
                        </div>
                        <span className="fw-semibold text-muted">
                          ₹{(item.price * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="d-flex justify-content-between align-items-center mb-3">
                  <span className="fw-bold text-coffee-dark">Total Bill</span>
                  <span className="fw-bold fs-4 text-coffee-accent">₹{Number(selectedOrder.total).toFixed(2)}</span>
                </div>

                {/* Payment Status / Action */}
                <div className="p-3 bg-light rounded-3 mb-3 border">
                  <div className="d-flex justify-content-between align-items-center">
                    <span className="small text-muted">Payment Status:</span>
                    {selectedOrder.payment ? (
                      <span className="badge bg-success-subtle text-success border border-success-subtle px-3 py-1 rounded-pill">
                        <i className="bi bi-check-circle-fill me-1"></i> Paid ({selectedOrder.payment.method})
                      </span>
                    ) : (
                      <span className="badge bg-warning-subtle text-warning-emphasis border border-warning px-3 py-1 rounded-pill">
                        <i className="bi bi-exclamation-circle me-1"></i> Unpaid
                      </span>
                    )}
                  </div>
                </div>

                {!selectedOrder.payment ? (
                  <Link
                    to="/payments"
                    state={{ placedOrderId: selectedOrder.id, total: selectedOrder.total }}
                    className="btn btn-warning text-dark fw-bold w-100 py-2 rounded-pill shadow-sm"
                  >
                    <i className="bi bi-credit-card me-2"></i> Make Payment for #{selectedOrder.id}
                  </Link>
                ) : (
                  <Link to="/payments" className="btn btn-outline-secondary w-100 py-2 rounded-pill small">
                    <i className="bi bi-receipt me-2"></i> View Payment Receipt
                  </Link>
                )}
              </div>
            ) : (
              <div className="card card-beancraft border-0 p-4 text-center text-muted">
                <i className="bi bi-info-circle fs-3 mb-2"></i>
                <div>Select an order from the list to view its items</div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
