import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const StaffDashboard = () => {
  const [requests, setRequests] = useState([]);
  const [stats, setStats] = useState({ assigned: 0, inProgress: 0, resolved: 0 });

  useEffect(() => {
    const fetchRequests = async () => {
      const res = await axios.get('/api/requests');
      const reqs = res.data.data;
      setRequests(reqs);
      
      setStats({
        assigned: reqs.filter(r => r.status === 'ASSIGNED').length,
        inProgress: reqs.filter(r => r.status === 'IN_PROGRESS').length,
        resolved: reqs.filter(r => r.status === 'RESOLVED' || r.status === 'CLOSED').length
      });
    };
    fetchRequests();
  }, []);

  return (
    <div className="animate-fade-in">
      <div className="flex gap-6 mb-8" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
        <div className="stat-card glass-panel" style={{ borderLeft: '4px solid var(--warning)' }}>
          <div>
            <h3 className="text-3xl font-bold">{stats.assigned}</h3>
            <p className="text-muted text-sm font-semibold mt-1">New Assigned</p>
          </div>
        </div>
        <div className="stat-card glass-panel" style={{ borderLeft: '4px solid #a78bfa' }}>
          <div>
            <h3 className="text-3xl font-bold">{stats.inProgress}</h3>
            <p className="text-muted text-sm font-semibold mt-1">In Progress</p>
          </div>
        </div>
        <div className="stat-card glass-panel" style={{ borderLeft: '4px solid var(--success)' }}>
          <div>
            <h3 className="text-3xl font-bold">{stats.resolved}</h3>
            <p className="text-muted text-sm font-semibold mt-1">Resolved Tasks</p>
          </div>
        </div>
      </div>

      <div className="glass-panel p-6" style={{ padding: '2rem' }}>
        <h3 className="text-xl font-bold mb-6">Assigned Work Orders</h3>
        
        {requests.length === 0 ? (
          <div className="text-center py-8 text-muted">
            <p>You have no assigned requests at the moment.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Request ID</th>
                  <th>Student Info</th>
                  <th>Location</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {requests.map(req => (
                  <tr key={req._id}>
                    <td className="font-semibold text-primary">{req.requestId}</td>
                    <td>
                      <div>{req.student?.name}</div>
                      <div className="text-xs text-muted mt-1">{req.student?.roomNumber}</div>
                    </td>
                    <td>{req.location}</td>
                    <td><span className={`badge`} style={{ border: '1px solid var(--border-color)' }}>{req.priority}</span></td>
                    <td><span className={`badge badge-${req.status}`}>{req.status.replace('_', ' ')}</span></td>
                    <td>
                      <Link to={`/staff/requests/${req._id}`} className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>
                        Manage
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

export default StaffDashboard;
