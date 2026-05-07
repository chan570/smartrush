import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, ShoppingBag, ChevronLeft, CreditCard, 
  Smartphone, Banknote, CheckCircle, Loader2,
  Package, MapPin, Star, Clock, Maximize2, Minimize2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';

const InventoryModal = ({ store, onClose }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('browse');
  const [selectedItem, setSelectedItem] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);

  useEffect(() => {
    if (store.isRealTime) {
      setInventory([]);
      setLoading(false);
      return;
    }

    const fetchInventory = async () => {
      try {
        const response = await api.get(`/api/stores/${store._id}/inventory`);
        setInventory(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching inventory:', error);
        setLoading(false);
      }
    };
    fetchInventory();
  }, [store]);

  const loadScript = (src) => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = src;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleOrder = async () => {
    if (!user) {
      alert("Please login to place an order");
      return;
    }

    setIsProcessing(true);

    try {
      const items = [{
        product: selectedItem.product._id,
        inventoryId: selectedItem._id,
        name: selectedItem.product.name,
        price: selectedItem.product.price,
        quantity: 1
      }];

      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      const token = userInfo?.token;
      const config = { headers: { Authorization: `Bearer ${token}` } };

      // Check for COD
      if (paymentMethod === 'COD') {
        await api.post('/api/payments/create-order', {
          storeId: store._id,
          items,
          totalAmount: selectedItem.product.price,
          customerDetails: { name: user.name, address: 'Current Location' },
          paymentMethod: 'COD'
        }, config);
        
        setIsProcessing(false);
        setView('success');
        return;
      }

      // Prepaid Flow (Razorpay)
      const resScript = await loadScript('https://checkout.razorpay.com/v1/checkout.js');
      if (!resScript) {
        alert('Razorpay SDK failed to load. Are you online?');
        setIsProcessing(false);
        return;
      }

      const { data: keyData } = await api.get('/api/payments/get-key');

      const { data } = await api.post('/api/payments/create-order', {
        storeId: store._id,
        items,
        totalAmount: selectedItem.product.price,
        customerDetails: { name: user.name, address: 'Current Location' },
        paymentMethod: 'Prepaid'
      });

      const options = {
        key: keyData.key,
        amount: data.razorpayOrder.amount,
        currency: data.razorpayOrder.currency,
        name: 'SmartRush',
        description: `Order from ${store.name}`,
        order_id: data.razorpayOrder.id,
        handler: async function (response) {
          try {
            await api.post('/api/payments/verify-payment', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              dbOrderId: data.order._id
            }, config);
            
            setIsProcessing(false);
            setView('success');
          } catch (err) {
            console.error('Payment verification failed:', err);
            setIsProcessing(false);
            alert('Payment Verification Failed!');
          }
        },
        prefill: {
          name: user.name,
          email: user.email,
          contact: '9999999999'
        },
        theme: {
          color: '#ff3f6c'
        },
        modal: {
          ondismiss: function() {
            setIsProcessing(false);
          }
        }
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();

      paymentObject.on('payment.failed', function (response) {
        setIsProcessing(false);
        alert(response.error.description);
      });

    } catch (error) {
      console.error('Order failed:', error);
      setIsProcessing(false);
      alert(error.response?.data?.message || 'Failed to initiate order');
    }
  };

  const renderBrowse = () => (
    <div className="inventory-grid">
      {loading ? (
        <div style={{ gridColumn: 'span 3', padding: '60px', textAlign: 'center' }}>
          <Loader2 className="animate-spin" size={40} style={{ color: 'var(--primary)', margin: '0 auto' }} />
        </div>
      ) : inventory.length > 0 ? (
        inventory.map(item => (
          <motion.div 
            key={item._id} 
            className="inventory-card glass-card"
            whileHover={{ y: -5, borderColor: 'rgba(255, 63, 108, 0.3)' }}
            onClick={() => {
              setSelectedItem(item);
              setView('detail');
            }}
          >
            <div className="product-image">
              <img src={item.product.image} alt={item.product.name} />
              <div className="image-overlay" />
              {item.stockLevel < 10 && (
                <span className="stock-alert-badge">
                  ONLY {item.stockLevel} LEFT
                </span>
              )}
            </div>
            <div className="product-info-premium">
              <span className="category-tag">{item.product.category}</span>
              <h4 className="product-name">{item.product.name}</h4>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px' }}>
                <p className="product-price-premium">₹{item.product.price}</p>
                <div className="add-icon-circle"><PlusIcon size={16} /></div>
              </div>
            </div>
          </motion.div>
        ))
      ) : (
        <div className="empty-state">
          <ShoppingBag size={48} />
          <p>No products available currently.</p>
        </div>
      )}
    </div>
  );

  const renderDetail = () => (
    <motion.div className="product-detail-view" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
      <div className="big-image-premium glass-card">
        <img src={selectedItem.product.image} alt={selectedItem.product.name} />
      </div>
      <div className="detail-info-premium">
        <button className="back-link" onClick={() => setView('browse')}>
          <ChevronLeft size={20} /> BACK TO STORE
        </button>
        <h2 className="premium-gradient-text">{selectedItem.product.name}</h2>
        <p className="detail-desc">{selectedItem.product.description}</p>
        
        <div className="detail-price-box">
          <span className="price-label">Price</span>
          <span className="price-value">₹{selectedItem.product.price}</span>
        </div>
        
        <div className="specs-section">
          <h4>Specifications</h4>
          <div className="specs-grid">
            {selectedItem.product.features?.map((f, i) => (
              <div key={i} className="spec-chip">{f}</div>
            )) || <p style={{ fontSize: '13px', opacity: 0.6 }}>Standard quality checked.</p>}
          </div>
        </div>

        <button className="primary-btn" style={{ width: '100%', padding: '20px' }} onClick={() => setView('checkout')}>
          PROCEED TO CHECKOUT
        </button>
      </div>
    </motion.div>
  );

  const renderCheckout = () => (
    <motion.div className="checkout-view-premium" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
      <button className="back-link" onClick={() => setView('detail')}>
        <ChevronLeft size={20} /> BACK
      </button>
      <h2>Order Summary</h2>
      
      <div className="summary-card glass-card">
        <div className="item-row">
          <div className="item-thumb">
            <img src={selectedItem.product.image} alt="" />
          </div>
          <div className="item-details">
            <h4>{selectedItem.product.name}</h4>
            <p>Quantity: 1</p>
            <span className="item-price">₹{selectedItem.product.price}</span>
          </div>
        </div>
        
        <div className="bill-details">
          <div className="bill-row">
            <span>Bag Total</span>
            <span>₹{selectedItem.product.price}</span>
          </div>
          <div className="bill-row free">
            <span>Delivery Fee</span>
            <span>FREE</span>
          </div>
          <div className="bill-row total">
            <span>Total Payable</span>
            <span>₹{selectedItem.product.price}</span>
          </div>
        </div>
      </div>
      
      <button className="primary-btn" style={{ width: '100%', marginTop: '32px' }} onClick={() => setView('payment')}>
        CONTINUE TO PAYMENT
      </button>
    </motion.div>
  );

  const renderPayment = () => (
    <motion.div className="payment-view-premium" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <button className="back-link" onClick={() => setView('checkout')}>
        <ChevronLeft size={20} /> BACK
      </button>
      <h2 className="payment-title-premium">Choose Payment Mode</h2>
      
      <div className="payment-options-grid">
        {[
          { id: 'UPI', name: 'UPI / Google Pay', icon: <Smartphone />, desc: 'Instant & Secure' },
          { id: 'Card', name: 'Cards', icon: <CreditCard />, desc: 'Visa, Mastercard' },
          { id: 'COD', name: 'Cash on Delivery', icon: <Banknote />, desc: 'Pay on arrival' }
        ].map((method) => (
          <div 
            key={method.id} 
            className={`payment-card-premium glass-card ${paymentMethod === method.id ? 'active' : ''}`}
            onClick={() => setPaymentMethod(method.id)}
          >
            <div className="method-icon-box">{method.icon}</div>
            <div className="method-text">
              <div className="method-name">{method.name}</div>
              <div className="method-desc">{method.desc}</div>
            </div>
            {paymentMethod === method.id && <CheckCircle size={20} className="check-icon" />}
          </div>
        ))}
      </div>

      <button 
        className="primary-btn pay-now-btn" 
        onClick={handleOrder}
        disabled={isProcessing}
      >
        {isProcessing ? (
          <><Loader2 className="animate-spin" /> {paymentMethod === 'COD' ? 'PLACING ORDER...' : 'SECURING PAYMENT...'}</>
        ) : (
          `${paymentMethod === 'COD' ? 'PLACE ORDER' : 'PAY ₹' + selectedItem.product.price + ' NOW'}`
        )}
      </button>
    </motion.div>
  );

  const renderSuccess = () => (
    <motion.div className="success-view-premium" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
      <div className="success-lottie-mock">
        <CheckCircle size={80} color="#03a685" />
      </div>
      <h2 className="premium-gradient-text">Order Successful!</h2>
      <p className="success-msg">
        Your order from <strong>{store.name}</strong> is confirmed. 
        A SmartRush delivery partner will reach your location in <span className="time-highlight">24 mins</span>.
      </p>
      <div className="success-actions">
        <button className="primary-btn" onClick={() => navigate('/my-orders')} style={{ width: '100%' }}>TRACK MY RUSH</button>
        <button className="secondary-btn" onClick={onClose} style={{ width: '100%' }}>BACK TO SHOPPING</button>
      </div>
    </motion.div>
  );

  return (
    <div className="modal-backdrop-premium" onClick={onClose}>
      <motion.div 
        className={`modal-container-premium glass-card ${isMaximized ? 'maximized' : ''}`}
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        onClick={e => e.stopPropagation()}
      >
        <div className="modal-header-premium">
          <div className="store-badge">
             <Package size={16} /> <span>SmartStore Verified</span>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button className="header-icon-btn" onClick={() => setIsMaximized(!isMaximized)}>
              {isMaximized ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
            </button>
            <button className="header-icon-btn close-btn-premium" onClick={onClose}><X size={24} /></button>
          </div>
        </div>

        <div className="store-header-premium">
          <h1 className="premium-gradient-text">{store.name}</h1>
          <div className="store-meta">
            <span className="meta-item"><MapPin size={14} /> {store.address}</span>
            <span className="meta-item"><Star size={14} fill="#fbbf24" color="#fbbf24" /> {store.rating}</span>
            <span className="meta-item"><Clock size={14} /> 30-min Rush</span>
          </div>
        </div>

        <div className="modal-body-premium">
          <AnimatePresence mode="wait">
            {view === 'browse' && renderBrowse()}
            {view === 'detail' && renderDetail()}
            {view === 'checkout' && renderCheckout()}
            {view === 'payment' && renderPayment()}
            {view === 'success' && renderSuccess()}
          </AnimatePresence>
        </div>
      </motion.div>

      <style>{`
        .modal-backdrop-premium {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(0, 0, 0, 0.8);
          backdrop-filter: blur(8px);
          display: flex;
          justify-content: center;
          align-items: flex-end;
          z-index: 2000;
          padding: 20px;
        }

        .modal-container-premium {
          width: 100%;
          max-width: 900px;
          height: 85vh;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          background: #0f172a;
          border-radius: 32px 32px 0 0;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .modal-container-premium.maximized {
          max-width: 100vw;
          height: 100vh;
          border-radius: 0;
        }

        .modal-header-premium {
          padding: 24px 32px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .header-icon-btn {
          background: var(--glass);
          border: 1px solid var(--border);
          color: white;
          width: 44px;
          height: 44px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.3s;
        }

        .header-icon-btn:hover { background: rgba(255, 255, 255, 0.1); }

        .store-badge {
          background: rgba(255, 63, 108, 0.1);
          color: var(--primary);
          padding: 6px 12px;
          border-radius: 100px;
          font-size: 11px;
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 6px;
          text-transform: uppercase;
        }

        .store-header-premium {
          padding: 0 32px 32px;
          border-bottom: 1px solid var(--border);
        }

        .store-header-premium h1 {
          font-size: 36px;
          font-weight: 800;
          margin-bottom: 8px;
        }

        .store-meta {
          display: flex;
          gap: 20px;
        }

        .meta-item {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 13px;
          color: var(--text-muted);
        }

        .modal-body-premium {
          flex: 1;
          overflow-y: auto;
          padding: 32px;
        }

        /* Browse View */
        .inventory-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
          gap: 24px;
        }

        .inventory-card {
          cursor: pointer;
          overflow: hidden;
        }

        .product-image {
          height: 200px;
          position: relative;
        }

        .product-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .image-overlay {
          position: absolute;
          top: 0; left: 0; right: 0; bottom: 0;
          background: linear-gradient(to bottom, transparent 50%, rgba(15, 23, 42, 0.8));
        }

        .stock-alert-badge {
          position: absolute;
          top: 12px; left: 12px;
          background: var(--primary);
          color: white;
          padding: 4px 10px;
          border-radius: 6px;
          font-size: 10px;
          font-weight: 800;
        }

        .product-info-premium {
          padding: 20px;
        }

        .category-tag {
          font-size: 10px;
          font-weight: 700;
          color: var(--primary);
          text-transform: uppercase;
          margin-bottom: 6px;
          display: block;
        }

        .product-name { font-size: 18px; font-weight: 600; }
        .product-price-premium { font-size: 20px; font-weight: 800; }

        .add-icon-circle {
          width: 32px; height: 32px; border-radius: 50%;
          background: var(--glass);
          display: flex; align-items: center; justify-content: center;
          color: var(--primary);
        }

        /* Detail View */
        .product-detail-view { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; }
        .big-image-premium img { width: 100%; border-radius: 16px; }
        .back-link {
          background: none; border: none; color: var(--primary);
          font-weight: 800; display: flex; align-items: center; gap: 6px;
          cursor: pointer; margin-bottom: 24px;
        }
        .detail-desc { color: var(--text-muted); margin-bottom: 24px; font-size: 15px; }
        .detail-price-box {
          background: var(--glass); padding: 16px 24px; border-radius: 16px;
          display: flex; justify-content: space-between; align-items: center; margin-bottom: 32px;
        }
        .price-label { font-size: 14px; color: var(--text-muted); }
        .price-value { font-size: 28px; font-weight: 800; }
        .specs-section h4 { margin-bottom: 16px; }
        .specs-grid { display: flex; flex-wrap: wrap; gap: 10px; margin-bottom: 32px; }
        .spec-chip { background: var(--glass); padding: 8px 16px; border-radius: 100px; font-size: 13px; border: 1px solid var(--border); }

        /* Checkout View */
        .summary-card { padding: 24px; margin-bottom: 24px; }
        .item-row { display: flex; gap: 20px; padding-bottom: 24px; border-bottom: 1px solid var(--border); }
        .item-thumb { width: 100px; height: 120px; border-radius: 12px; overflow: hidden; }
        .item-thumb img { width: 100%; height: 100%; object-fit: cover; }
        .item-details h4 { font-size: 20px; margin-bottom: 8px; }
        .item-price { font-size: 22px; font-weight: 800; color: var(--primary); display: block; margin-top: 12px; }
        .bill-details { padding-top: 24px; }
        .bill-row { display: flex; justify-content: space-between; margin-bottom: 12px; color: var(--text-muted); }
        .bill-row.free { color: #03a685; font-weight: 700; }
        .bill-row.total { color: white; font-size: 22px; font-weight: 800; padding-top: 16px; border-top: 1px dashed var(--border); }

        /* Payment View */
        .payment-options-grid { display: flex; flex-direction: column; gap: 16px; margin-bottom: 40px; }
        .payment-card-premium { 
          padding: 20px; display: flex; align-items: center; gap: 20px; cursor: pointer; transition: all 0.3s;
        }
        .payment-card-premium.active { border-color: var(--primary); background: rgba(255, 63, 108, 0.05); }
        .method-icon-box { 
          width: 50px; height: 50px; background: var(--glass); border-radius: 12px;
          display: flex; align-items: center; justify-content: center; color: var(--primary);
        }
        .method-name { font-weight: 700; font-size: 16px; }
        .method-desc { font-size: 13px; color: var(--text-muted); }
        .check-icon { margin-left: auto; color: var(--primary); }
        .pay-now-btn { width: 100%; padding: 20px; font-size: 18px; }

        /* Success View */
        .success-view-premium { text-align: center; padding: 40px 0; }
        .success-lottie-mock { margin-bottom: 32px; }
        .success-msg { color: var(--text-muted); max-width: 500px; margin: 16px auto 40px; line-height: 1.7; }
        .time-highlight { color: #03a685; font-weight: 800; }
        .success-actions { display: flex; flex-direction: column; gap: 16px; max-width: 400px; margin: 0 auto; }
      `}</style>
    </div>
  );
};

const PlusIcon = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"></line>
    <line x1="5" y1="12" x2="19" y2="12"></line>
  </svg>
);

export default InventoryModal;
