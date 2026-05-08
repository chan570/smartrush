import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Package, Truck, CheckCircle, Clock, 
  ChevronRight, ArrowLeft, MapPin, Smartphone,
  ShoppingBag, Calendar, Loader2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await api.get('/api/payments/my-orders');
        setOrders(res.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching orders:', error);
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'Delivered': return '#03a685';
      case 'Out for Delivery': return '#3b82f6';
      case 'Picked Up': return '#f59e0b';
      case 'Confirmed': return '#10b981';
      default: return 'var(--primary)';
    }
  };

  const renderOrderList = () => (
    <div className="orders-list-premium">
      <div className="orders-header">
        <button className="back-btn-premium" onClick={() => navigate('/')}><ArrowLeft size={20} /> Back to Shop</button>
        <h1 className="premium-gradient-text">My Orders</h1>
        <p>{orders.length} items ordered so far</p>
      </div>

      <div className="orders-grid">
        {orders.map((order, idx) => (
          <motion.div 
            key={order._id}
            className="order-card-premium glass-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            onClick={() => setSelectedOrder(order)}
          >
            <div className="order-card-header">
              <div className="store-info-mini">
                <Package size={16} color="var(--primary)" />
                <span>{order.store?.name}</span>
              </div>
              <span className="order-status-badge" style={{ backgroundColor: `${getStatusColor(order.deliveryStatus)}20`, color: getStatusColor(order.deliveryStatus) }}>
                {order.deliveryStatus}
              </span>
            </div>

            <div className="order-card-body">
              <div className="order-items-preview">
                {order.items.slice(0, 2).map((item, i) => (
                  <span key={i}>{item.name}{i < order.items.length - 1 ? ', ' : ''}</span>
                ))}
                {order.items.length > 2 && <span> +{order.items.length - 2} more</span>}
              </div>
              <div className="order-meta-info">
                <span>₹{order.totalAmount}</span>
                <span className="dot" />
                <span>{new Date(order.createdAt).toLocaleDateString()}</span>
              </div>
            </div>

            <div className="order-card-footer">
              <span>Track Order</span>
              <ChevronRight size={16} />
            </div>
          </motion.div>
        ))}

        {orders.length === 0 && (
          <div className="empty-orders">
            <ShoppingBag size={64} opacity={0.2} />
            <h2>No orders yet</h2>
            <p>Looks like you haven't rushed for anything yet.</p>
            <button className="primary-btn" onClick={() => navigate('/')}>Start Shopping</button>
          </div>
        )}
      </div>
    </div>
  );

  const renderOrderTracking = () => {
    const statusSteps = ['Placed', 'Confirmed', 'Picked Up', 'Out for Delivery', 'Delivered'];
    const currentStepIdx = statusSteps.indexOf(selectedOrder.deliveryStatus);

    return (
      <motion.div className="tracking-view-premium" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <button className="back-btn-premium" onClick={() => setSelectedOrder(null)}><ArrowLeft size={20} /> Back to Orders</button>
        
        <div className="tracking-main-card glass-card">
          <div className="tracking-header">
            <div className="order-id-box">
              <p>Order ID</p>
              <h3>#{selectedOrder._id.slice(-8).toUpperCase()}</h3>
            </div>
            <div className="order-total-box">
              <p>Total Paid</p>
              <h3>₹{selectedOrder.totalAmount}</h3>
            </div>
          </div>

          {/* Timeline */}
          <div className="tracking-timeline">
            {statusSteps.map((step, idx) => (
              <div key={step} className={`timeline-step ${idx <= currentStepIdx ? 'active' : ''} ${idx === currentStepIdx ? 'current' : ''}`}>
                <div className="step-marker">
                  {idx < currentStepIdx ? <CheckCircle size={16} /> : <div className="dot" />}
                </div>
                <div className="step-label">{step}</div>
                {idx < statusSteps.length - 1 && <div className="step-line" />}
              </div>
            ))}
          </div>

          <div className="tracking-details-grid">
            <div className="tracking-section glass-card">
              <h4><Truck size={18} /> Delivery Partner</h4>
              {selectedOrder.deliveryPerson ? (
                <div className="partner-box">
                   <div className="partner-avatar">{selectedOrder.deliveryPerson.name[0]}</div>
                   <div className="partner-info">
                     <p className="p-name">{selectedOrder.deliveryPerson.name}</p>
                     <p className="p-desc">{selectedOrder.deliveryPerson.vehicle} • <Smartphone size={12} style={{display:'inline'}}/> {selectedOrder.deliveryPerson.phone}</p>
                   </div>
                </div>
              ) : (
                <p className="no-partner">Assigning a partner soon...</p>
              )}
            </div>

            <div className="tracking-section glass-card">
              <h4><MapPin size={18} /> Delivery Address</h4>
              <p className="address-text">{selectedOrder.customerDetails?.address || 'Current Location'}</p>
              <p className="customer-name">{selectedOrder.customerDetails?.name}</p>
            </div>
          </div>

          <div className="order-items-list">
             <h4>Items in this order</h4>
             {selectedOrder.items.map((item, i) => (
               <div key={i} className="item-row-mini">
                 <div className="item-img-placeholder"><Package size={20} /></div>
                 <div className="item-info-mini">
                    <p className="i-name">{item.name}</p>
                    <p className="i-meta">Qty: {item.quantity} • ₹{item.price}</p>
                 </div>
               </div>
             ))}
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="my-orders-container-premium">
      <div className="bg-decor">
        <div className="decor-blob blob-1"></div>
        <div className="decor-blob blob-2"></div>
      </div>

      <div className="content-wrapper-premium">
        <AnimatePresence mode="wait">
          {loading ? (
            <div className="loading-state">
              <Loader2 className="animate-spin" size={48} color="var(--primary)" />
            </div>
          ) : selectedOrder ? renderOrderTracking() : renderOrderList()}
        </AnimatePresence>
      </div>

      <style>{`
        .my-orders-container-premium {
          min-height: 100vh;
          background: #020617;
          color: white;
          padding: 40px 20px;
          position: relative;
          overflow-x: hidden;
        }

        .bg-decor { position: absolute; inset: 0; pointer-events: none; z-index: 0; }
        .decor-blob { position: absolute; width: 600px; height: 600px; filter: blur(100px); opacity: 0.1; }
        .blob-1 { background: var(--primary); top: -200px; right: -200px; }
        .blob-2 { background: #3b82f6; bottom: -200px; left: -200px; }

        .content-wrapper-premium {
          max-width: 1000px;
          margin: 0 auto;
          position: relative;
          z-index: 10;
        }

        .orders-header { margin-bottom: 48px; }
        .back-btn-premium { 
          background: none; border: none; color: var(--text-muted); 
          display: flex; align-items: center; gap: 8px; cursor: pointer; 
          font-weight: 600; margin-bottom: 24px; transition: color 0.3s;
        }
        .back-btn-premium:hover { color: var(--primary); }
        .orders-header h1 { font-size: 40px; font-weight: 800; margin-bottom: 8px; }
        .orders-header p { color: var(--text-muted); font-size: 16px; }

        .orders-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 24px; }
        
        .order-card-premium { 
          padding: 24px; cursor: pointer; border-radius: 20px; 
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .order-card-premium:hover { transform: translateY(-5px); border-color: var(--primary); }

        .order-card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
        .store-info-mini { display: flex; align-items: center; gap: 8px; font-weight: 700; font-size: 14px; }
        .order-status-badge { padding: 4px 12px; border-radius: 100px; font-size: 11px; font-weight: 700; text-transform: uppercase; }

        .order-card-body { margin-bottom: 24px; }
        .order-items-preview { font-size: 14px; font-weight: 500; color: var(--text-main); margin-bottom: 8px; line-height: 1.4; }
        .order-meta-info { display: flex; align-items: center; gap: 8px; font-size: 13px; color: var(--text-muted); }
        .dot { width: 4px; height: 4px; border-radius: 50%; background: var(--border); }

        .order-card-footer { 
          display: flex; justify-content: space-between; align-items: center; 
          padding-top: 16px; border-top: 1px solid var(--border);
          color: var(--primary); font-size: 13px; font-weight: 700;
        }

        /* Tracking View */
        .tracking-main-card { padding: 40px; border-radius: 32px; }
        .tracking-header { display: flex; justify-content: space-between; margin-bottom: 48px; }
        .order-id-box p, .order-total-box p { font-size: 13px; color: var(--text-muted); margin-bottom: 4px; }
        .order-id-box h3, .order-total-box h3 { font-size: 24px; font-weight: 800; }

        .tracking-timeline { 
          display: flex; justify-content: space-between; position: relative; 
          margin-bottom: 60px; padding: 0 20px;
        }
        .timeline-step { display: flex; flex-direction: column; align-items: center; gap: 12px; position: relative; z-index: 2; flex: 1; }
        .step-marker { 
          width: 32px; height: 32px; border-radius: 50%; background: var(--bg-dark); 
          border: 2px solid var(--border); display: flex; align-items: center; justify-content: center;
          transition: all 0.3s;
        }
        .step-marker .dot { width: 8px; height: 8px; background: var(--border); transition: all 0.3s; }
        
        .timeline-step.active .step-marker { border-color: var(--primary); color: var(--primary); }
        .timeline-step.active .step-marker .dot { background: var(--primary); }
        .timeline-step.current .step-marker { box-shadow: 0 0 0 6px var(--accent-glow); background: var(--primary); color: white; }
        .timeline-step.current .step-marker .dot { background: white; }

        .step-label { font-size: 11px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; text-align: center; }
        .timeline-step.active .step-label { color: white; }

        .step-line { 
          position: absolute; top: 16px; left: 50%; width: 100%; height: 2px; 
          background: var(--border); z-index: -1; 
        }
        .timeline-step.active .step-line { background: var(--primary); }

        .tracking-details-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 40px; }
        .tracking-section { padding: 24px; }
        .tracking-section h4 { display: flex; align-items: center; gap: 8px; margin-bottom: 20px; font-size: 16px; color: var(--primary); }
        
        .partner-box { display: flex; align-items: center; gap: 16px; }
        .partner-avatar { width: 44px; height: 44px; border-radius: 12px; background: var(--primary); display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 18px; }
        .p-name { font-weight: 700; font-size: 15px; }
        .p-desc { font-size: 12px; color: var(--text-muted); margin-top: 4px; }
        
        .address-text { font-weight: 600; line-height: 1.6; margin-bottom: 8px; }
        .customer-name { font-size: 13px; color: var(--text-muted); }

        .item-row-mini { display: flex; gap: 16px; padding: 12px; background: var(--glass); border-radius: 12px; margin-bottom: 12px; border: 1px solid var(--border); }
        .item-img-placeholder { width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; color: var(--text-muted); }
        .i-name { font-size: 14px; font-weight: 600; }
        .i-meta { font-size: 12px; color: var(--text-muted); margin-top: 2px; }

        @media (max-width: 768px) {
          .my-orders-container-premium { padding: 20px 16px; }
          .orders-header h1 { font-size: 32px; }
          .tracking-main-card { padding: 24px 16px; border-radius: 20px; }
          .tracking-header { flex-direction: column; gap: 20px; }
          .tracking-timeline { padding: 0; }
          .step-label { font-size: 8px; }
          .tracking-details-grid { grid-template-columns: 1fr; gap: 16px; }
          .order-id-box h3, .order-total-box h3 { font-size: 20px; }
        }
      `}</style>
    </div>
  );
};

export default MyOrders;
