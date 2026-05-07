import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { BarChart3, TrendingUp, Users, X, Info, Zap, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AnalyticsDashboard = ({ onClose }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInsights = async () => {
      try {
        const response = await api.get('/api/analytics/insights');
        setData(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching insights:', error);
        setLoading(false);
      }
    };
    fetchInsights();
  }, []);

  return (
    <div className="analytics-overlay" onClick={onClose}>
      <motion.div 
        className="analytics-modal glass-card"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="analytics-header-premium">
          <div className="header-left">
            <div className="icon-box-premium"><BarChart3 size={20} /></div>
            <div>
              <h2 className="premium-gradient-text">Demand Insights</h2>
              <p>Real-time platform activity metrics</p>
            </div>
          </div>
          <button className="close-btn-minimal" onClick={onClose}><X size={20} /></button>
        </div>

        {loading ? (
          <div className="analytics-loader">
            <Loader2 className="animate-spin" size={40} color="var(--primary)" />
            <p>Gathering fresh insights...</p>
          </div>
        ) : (
          <div className="analytics-body-premium">
            <div className="stats-row-premium">
              <div className="stat-card-modern glass-card">
                <div className="stat-header">
                  <div className="stat-icon-small"><Users size={16} /></div>
                  <span className="stat-label-modern">Total Searches</span>
                </div>
                <div className="stat-value-modern">{data?.totalSearches || 0}</div>
                <div className="stat-trend positive">
                  <TrendingUp size={12} /> 12% vs last hour
                </div>
              </div>

              <div className="stat-card-modern glass-card">
                <div className="stat-header">
                  <div className="stat-icon-small"><Zap size={16} /></div>
                  <span className="stat-label-modern">High Traffic</span>
                </div>
                <div className="stat-value-modern">{data?.topStores?.length || 0}</div>
                <div className="stat-trend">
                  Stores currently trending
                </div>
              </div>
            </div>

            <div className="chart-section-premium glass-card">
              <div className="section-header">
                <h3>Top Visited Stores</h3>
                <span className="live-pill">Live Data</span>
              </div>
              
              <div className="bars-container-premium">
                {data?.topStores?.map((store, i) => {
                   const maxVal = data.topStores[0]?.count || 1;
                   const percentage = (store.count / maxVal) * 100;
                   return (
                    <div key={i} className="bar-row-premium">
                      <div className="bar-info-top">
                        <span className="store-name-analytic">{store.name}</span>
                        <span className="store-visit-count">{store.count} visits</span>
                      </div>
                      <div className="bar-track-premium">
                        <motion.div 
                          className="bar-fill-premium"
                          initial={{ width: 0 }}
                          animate={{ width: `${percentage}%` }}
                          transition={{ duration: 1, delay: i * 0.1 }}
                        />
                      </div>
                    </div>
                   );
                })}
              </div>
            </div>

            <div className="analytics-footer-premium">
              <Info size={14} />
              <span>Insights are updated automatically every 10 seconds.</span>
            </div>
          </div>
        )}
      </motion.div>

      <style>{`
        .analytics-overlay {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(0, 0, 0, 0.6);
          backdrop-filter: blur(10px);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 3000;
          padding: 20px;
        }

        .analytics-modal {
          width: 100%;
          max-width: 500px;
          padding: 32px;
          background: #0f172a;
          border-radius: 24px;
        }

        .analytics-header-premium {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 32px;
        }

        .header-left { display: flex; gap: 16px; align-items: center; }
        .header-left h2 { font-size: 24px; font-weight: 800; }
        .header-left p { font-size: 13px; color: var(--text-muted); }

        .icon-box-premium {
          width: 44px; height: 44px; background: rgba(255, 63, 108, 0.1);
          border-radius: 12px; display: flex; align-items: center; justify-content: center;
          color: var(--primary);
        }

        .close-btn-minimal {
          background: none; border: none; color: var(--text-muted);
          cursor: pointer; transition: color 0.3s;
        }
        .close-btn-minimal:hover { color: white; }

        .analytics-loader {
          padding: 60px 0; text-align: center;
          display: flex; flex-direction: column; gap: 16px; align-items: center;
        }

        .stats-row-premium { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 24px; }
        .stat-card-modern { padding: 20px; border-radius: 20px; }
        .stat-header { display: flex; align-items: center; gap: 8px; margin-bottom: 12px; }
        .stat-icon-small { color: var(--primary); }
        .stat-label-modern { font-size: 12px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px; }
        .stat-value-modern { font-size: 32px; font-weight: 800; margin-bottom: 8px; }
        .stat-trend { font-size: 11px; color: var(--text-muted); display: flex; align-items: center; gap: 4px; }
        .stat-trend.positive { color: #03a685; }

        .chart-section-premium { padding: 24px; border-radius: 20px; }
        .section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
        .section-header h3 { font-size: 16px; font-weight: 700; }
        .live-pill { font-size: 9px; font-weight: 800; background: rgba(3, 166, 133, 0.1); color: #03a685; padding: 4px 8px; border-radius: 100px; text-transform: uppercase; }

        .bars-container-premium { display: flex; flex-direction: column; gap: 20px; }
        .bar-info-top { display: flex; justify-content: space-between; margin-bottom: 8px; }
        .store-name-analytic { font-size: 13px; font-weight: 600; color: var(--text-main); }
        .store-visit-count { font-size: 12px; color: var(--text-muted); }
        
        .bar-track-premium { height: 8px; background: rgba(255, 255, 255, 0.05); border-radius: 10px; overflow: hidden; }
        .bar-fill-premium { height: 100%; background: linear-gradient(to right, var(--primary), #fb7185); border-radius: 10px; }

        .analytics-footer-premium {
          display: flex; align-items: center; gap: 8px; margin-top: 32px;
          padding-top: 20px; border-top: 1px solid var(--border);
          font-size: 11px; color: var(--text-muted);
        }

        .Loader2 { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default AnalyticsDashboard;
