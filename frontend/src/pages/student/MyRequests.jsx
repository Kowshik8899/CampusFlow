import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Search } from 'lucide-react';

const MyRequests = () => {
  const [requests, setRequests] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchRequests = async () => {
      const res = await axios.get('/api/requests');
      setRequests(res.data.data);
    };
    fetchRequests();
  }, []);

  const filtered = requests.filter(r => 
    r.requestId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.category?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="animate-fade-in glass-panel p-6" style={{ padding: '2rem' }}>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold">My Service Requests</h3>
        
        <div className="relative" style={{ width: '300px' }}>
          <Search className="absolute left-3 top-1/2" style={{ transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} size={18} />
          <input 
            type="text" 
            className="form-input w-full" 
            style={{ paddingLeft: '2.5rem', width: '100%' }}
            placeholder="Search by Request ID or Category..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      
      {filtered.length === 0 ? (
        <div className="text-center py-12 text-muted">
          <p>No requests found matching your search.</p>
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Request ID</th>
                <th>Category</th>
                <th>Status</th>
                <th>Priority</th>
                <th>Date Submitted</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(req => (
                <tr key={req._id}>
                  <td className="font-semibold text-primary">{req.requestId}</td>
                  <td>
                    <div>{req.category?.name || 'Uncategorized'}</div>
                    <div className="text-xs text-muted mt-1">{req.department?.name}</div>
                  </td>
                  <td><span className={`badge badge-${req.status}`}>{req.status.replace('_', ' ')}</span></td>
                  <td>
                    <span className={`badge`} style={{ 
                      background: 'transparent',
                      border: `1px solid ${req.priority === 'HIGH' ? 'var(--danger)' : req.priority === 'MEDIUM' ? 'var(--warning)' : 'var(--text-secondary)'}`,
                      color: req.priority === 'HIGH' ? 'var(--danger)' : req.priority === 'MEDIUM' ? 'var(--warning)' : 'var(--text-secondary)'
                    }}>
                      {req.priority}
                    </span>
                  </td>
                  <td>{new Date(req.createdAt).toLocaleDateString()}</td>
                  <td>
                    <Link to={`/student/requests/${req._id}`} className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>
                      Track Details
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default MyRequests;
