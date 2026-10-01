import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { PlusCircle, Clock, CheckCircle } from 'lucide-react';

const Dashboard = () => {
  const [requests, setRequests] = useState([]);
  const [stats, setStats] = useState({ total: 0, pending: 0, resolved: 0 });

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const res = await axios.get('/api/requests');
        const reqs = res.data.data;
        setRequests(reqs.slice(0, 5)); // show recent 5
        setStats({
          total: reqs.length,
          pending: reqs.filter(r => ['SUBMITTED', 'ASSIGNED', 'IN_PROGRESS'].includes(r.status)).length,
          resolved: reqs.filter(r => r.status === 'RESOLVED' || r.status === 'CLOSED').length
        });
      } catch (err) {
        console.error(err);
      }
    };
    fetchRequests();
  }, []);

  return (
    <div className="animate-fade-in">
      {/* Stats row */}
      <div className="flex gap-6 mb-8" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
        <div className="stat-card glass-panel">
          <div className="stat-icon" style={{ background: 'rgba(59, 130, 246, 0.1)', color: 'var(--accent-primary)' }}>
            <PlusCircle size={28} />
          </div>
          <div>
            <p className="text-muted text-sm font-semibold mb-1">Total Requests</p>
            <h3 className="text-3xl font-bold">{stats.total}</h3>
          </div>
        </div>
        <div className="stat-card glass-panel">
          <div className="stat-icon" style={{ background: 'rgba(245, 158, 11, 0.1)', color: 'var(--warning)' }}>
            <Clock size={28} />
          </div>
          <div>
            <p className="text-muted text-sm font-semibold mb-1">Pending / In Progress</p>
            <h3 className="text-3xl font-bold">{stats.pending}</h3>
          </div>
        </div>
        <div className="stat-card glass-panel">
          <div className="stat-icon" style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)' }}>
            <CheckCircle size={28} />
          </div>
          <div>
            <p className="text-muted text-sm font-semibold mb-1">Resolved</p>
            <h3 className="text-3xl font-bold">{stats.resolved}</h3>
          </div>
        </div>
      </div>

      {/* Recent Requests */}
      <div className="glass-panel p-6" style={{ padding: '1.5rem' }}>
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold">Recent Requests</h3>
          <Link to="/student/requests" className="text-primary text-sm font-semibold" style={{ textDecoration: 'none' }}>View All</Link>
        </div>
        
        {requests.length === 0 ? (
          <div className="text-center py-8 text-muted">
            <p>No requests found. You're all good!</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Request ID</th>
                  <th>Category</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {requests.map(req => (
                  <tr key={req._id}>
                    <td className="font-semibold text-primary">{req.requestId}</td>
                    <td>{req.category?.name || 'Uncategorized'}</td>
                    <td><span className={`badge badge-${req.status}`}>{req.status.replace('_', ' ')}</span></td>
                    <td>{new Date(req.createdAt).toLocaleDateString()}</td>
                    <td>
                      <Link to={`/student/requests/${req._id}`} className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>
                        Track
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
