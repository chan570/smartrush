import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { Mail, Lock, Loader2, ArrowRight } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await login(email, password);
      if (result.success) {
        navigate('/');
      } else {
        alert(result.message);
      }
    } catch (error) {
      alert('An error occurred during login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container-premium">
      <div className="auth-bg-blobs">
        <div className="blob blob-1"></div>
        <div className="blob blob-2"></div>
      </div>
      
      <motion.div 
        className="auth-card-premium glass-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="auth-header">
          <div className="logo-box">SR</div>
          <h1 className="premium-gradient-text">Welcome Back</h1>
          <p>The fastest way to shop your favorite brands.</p>
        </div>

        <form onSubmit={handleSubmit} className="premium-form">
          <div className="form-group-premium">
            <label>Email Address</label>
            <div className="input-with-icon">
              <Mail size={18} />
              <input 
                type="email" 
                placeholder="name@example.com" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                required 
              />
            </div>
          </div>

          <div className="form-group-premium">
            <label>Password</label>
            <div className="input-with-icon">
              <Lock size={18} />
              <input 
                type="password" 
                placeholder="••••••••" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                required 
              />
            </div>
          </div>

          <button type="submit" className="primary-btn auth-btn" disabled={loading}>
            {loading ? <Loader2 className="animate-spin" /> : <>Login to SmartRush <ArrowRight size={18} /></>}
          </button>
        </form>

        <p className="auth-footer">
          New here? <Link to="/register">Create an account</Link>
        </p>
      </motion.div>

      <style>{`
        .auth-container-premium {
          height: 100vh;
          width: 100vw;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #020617;
          position: relative;
          overflow: hidden;
        }

        .auth-bg-blobs {
          position: absolute;
          width: 100%;
          height: 100%;
          z-index: 0;
        }

        .blob {
          position: absolute;
          width: 500px;
          height: 500px;
          border-radius: 50%;
          filter: blur(80px);
          opacity: 0.15;
          animation: float 20s infinite alternate;
        }

        .blob-1 { background: var(--primary); top: -100px; right: -100px; }
        .blob-2 { background: #3b82f6; bottom: -100px; left: -100px; animation-delay: -10s; }

        @keyframes float {
          from { transform: translate(0, 0); }
          to { transform: translate(50px, 100px); }
        }

        .auth-card-premium {
          width: 100%;
          max-width: 440px;
          padding: 48px;
          z-index: 10;
          text-align: center;
        }

        .auth-header { margin-bottom: 40px; }
        .auth-header .logo-box { margin: 0 auto 24px; width: 44px; height: 44px; font-size: 20px; }
        .auth-header h1 { font-size: 32px; font-weight: 800; margin-bottom: 8px; }
        .auth-header p { color: var(--text-muted); font-size: 15px; }

        .form-group-premium { text-align: left; margin-bottom: 24px; }
        .form-group-premium label { display: block; font-size: 13px; font-weight: 700; color: var(--text-muted); margin-bottom: 8px; margin-left: 4px; }
        
        .input-with-icon {
          position: relative;
          display: flex;
          align-items: center;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid var(--border);
          border-radius: 12px;
          padding: 0 16px;
          transition: all 0.3s;
        }

        .input-with-icon:focus-within {
          border-color: var(--primary);
          background: rgba(255, 255, 255, 0.08);
          box-shadow: 0 0 0 4px rgba(255, 63, 108, 0.1);
        }

        .input-with-icon svg { color: var(--text-muted); }
        .input-with-icon input {
          background: none;
          border: none;
          color: white;
          padding: 14px 12px;
          width: 100%;
          outline: none;
          font-size: 15px;
        }

        .auth-btn { width: 100%; margin-top: 8px; padding: 16px; }
        
        .auth-footer { margin-top: 32px; color: var(--text-muted); font-size: 14px; }
        .auth-footer a { color: var(--primary); font-weight: 700; text-decoration: none; }
        .auth-footer a:hover { text-decoration: underline; }

        .Loader2 { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default Login;
