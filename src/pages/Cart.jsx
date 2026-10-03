import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

export default function Cart() {
  const { cart, updateQuantity, removeFromCart, clearCart, cartTotal } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handlePlaceOrder = async () => {
    if (cart.length === 0) return;
    setLoading(true);
    setError('');

    try {
      const itemsPayload = cart.map((item) => ({
        menu_id: item.id,
        quantity: item.quantity,
      }));

      const res = await api.post('/api/orders', { items: itemsPayload });

      if (res.data.success) {
        const orderId = res.data.orderId;
        clearCart();
        // Redirect to payments page with newly created order highlighted
        navigate('/payments', {
          state: {
            placedOrderId: orderId,
            total: res.data.total,
            message: `Order #${orderId} placed successfully! Please choose your payment method.`
          }
        });
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="container py-5 text-center">
        <div className="card card-beancraft border-0 p-5 mx-auto" style={{ maxWidth: '500px' }}>
          <div className="bg-light rounded-circle p-4 d-inline-flex mx-auto mb-3 text-muted">
            <i className="bi bi-cart-x fs-1"></i>
          </div>
          <h3 className="fw-bold text-coffee-dark mb-2">Your Cart is Empty</h3>
          <p className="text-muted small mb-4">
            Looks like you haven't added anything to your cart yet. Discover our fresh coffees, pizzas, burgers, and desserts!
          </p>
          <Link to="/menu" className="btn btn-coffee rounded-pill px-4 py-2">
            <i className="bi bi-journal-text me-2"></i> Browse Cafe Menu
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="fw-bold text-coffee-dark mb-1">Your Order Cart</h1>
          <p className="text-muted small mb-0">Review items before placing your order with the kitchen</p>
        </div>
        <button
          onClick={clearCart}
          className="btn btn-sm btn-outline-danger rounded-pill px-3"
        >
          <i className="bi bi-trash3 me-1"></i> Clear Cart
        </button>
      </div>

      {error && (
        <div className="alert alert-danger py-2 small d-flex align-items-center gap-2 mb-3" role="alert">
          <i className="bi bi-exclamation-triangle-fill"></i>
          <div>{error}</div>
        </div>
      )}

      <div className="row g-4">
        {/* Cart Items Table */}
        <div className="col-12 col-lg-8">
          <div className="card card-beancraft border-0 p-3 p-md-4">
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light small text-uppercase">
                  <tr>
                    <th>Food Item</th>
                    <th className="text-center">Price</th>
                    <th className="text-center">Quantity</th>
                    <th className="text-end">Subtotal</th>
                    <th className="text-end">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {cart.map((item) => (
                    <tr key={item.id}>
                      <td>
                        <div className="d-flex align-items-center gap-3">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="rounded-3"
                            style={{ width: '56px', height: '56px', objectFit: 'cover' }}
                            onError={(e) => {
                              e.target.src = 'https://images.unsplash.com/photo-1541167760496-1628856ab772?w=600&auto=format&fit=crop&q=80';
                            }}
                          />
                          <div>
                            <div className="fw-bold text-coffee-dark">{item.name}</div>
                            <div className="text-muted small" style={{ fontSize: '0.78rem' }}>
                              Item #{item.id}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="text-center fw-semibold text-muted">
                        ₹{Number(item.price).toFixed(2)}
                      </td>

                      <td className="text-center">
                        <div className="d-inline-flex align-items-center border rounded-pill bg-light p-1">
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="btn btn-sm btn-link text-dark p-0 px-2 text-decoration-none"
                            title="Decrease quantity"
                          >
                            <i className="bi bi-dash"></i>
                          </button>
                          <span className="fw-bold px-2 text-coffee-dark" style={{ minWidth: '24px' }}>
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="btn btn-sm btn-link text-dark p-0 px-2 text-decoration-none"
                            title="Increase quantity"
                          >
                            <i className="bi bi-plus"></i>
                          </button>
                        </div>
                      </td>

                      <td className="text-end fw-bold text-coffee-dark">
                        ₹{(Number(item.price) * item.quantity).toFixed(2)}
                      </td>

                      <td className="text-end">
                        <button
                          type="button"
                          onClick={() => removeFromCart(item.id)}
                          className="btn btn-sm btn-outline-danger border-0 rounded-circle"
                          title="Remove item"
                        >
                          <i className="bi bi-x-lg"></i>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-3 pt-3 border-top d-flex justify-content-between align-items-center">
              <Link to="/menu" className="btn btn-link text-coffee-accent text-decoration-none p-0 fw-semibold small">
                <i className="bi bi-arrow-left me-1"></i> Add More Food Items
              </Link>
              <div className="text-muted small">
                Total items in cart: <strong>{cart.reduce((s, i) => s + i.quantity, 0)}</strong>
              </div>
            </div>
          </div>
        </div>

        {/* Order Summary & Place Order */}
        <div className="col-12 col-lg-4">
          <div className="card card-beancraft border-0 p-4 sticky-top" style={{ top: '80px' }}>
            <h4 className="fw-bold text-coffee-dark mb-3">Order Summary</h4>

            <div className="d-flex justify-content-between mb-2 text-muted small">
              <span>Items Subtotal</span>
              <span>₹{cartTotal.toFixed(2)}</span>
            </div>

            <div className="d-flex justify-content-between mb-2 text-muted small">
              <span>Cafe Service & Taxes (GST 5%)</span>
              <span className="text-success fw-bold">FREE (Inclusive)</span>
            </div>

            <div className="d-flex justify-content-between mb-3 text-muted small">
              <span>Kitchen Order Priority</span>
              <span className="text-success fw-bold">Active</span>
            </div>

            <hr className="my-3" />

            <div className="d-flex justify-content-between align-items-center mb-4">
              <span className="fw-bold fs-5 text-coffee-dark">Grand Total</span>
              <span className="fw-bold fs-3 text-coffee-accent">₹{cartTotal.toFixed(2)}</span>
            </div>

            <button
              onClick={handlePlaceOrder}
              disabled={loading}
              className="btn btn-coffee w-100 py-3 rounded-pill fw-bold shadow-sm d-flex justify-content-center align-items-center gap-2 mb-2"
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm" role="status"></span>
                  <span>Placing Order in MySQL...</span>
                </>
              ) : (
                <>
                  <i className="bi bi-bag-check-fill"></i>
                  <span>Place Order (Status: Pending)</span>
                </>
              )}
            </button>

            <div className="text-center text-muted small mt-2">
              <i className="bi bi-shield-check me-1 text-success"></i>
              Inserts into <code>orders</code> & <code>order_items</code> tables.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
