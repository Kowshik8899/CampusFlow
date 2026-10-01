import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const AdminDashboard = () => {
  const [analytics, setAnalytics] = useState(null);
  const [requests, setRequests] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [staffList, setStaffList] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resAn, resReq, resDept, resUsers] = await Promise.all([
          axios.get('/api/admin/analytics'),
          axios.get('/api/requests'),
          axios.get('/api/data/departments'),
          axios.get('/api/admin/users')
        ]);
        setAnalytics(resAn.data.data);
        setRequests(resReq.data.data);
        setDepartments(resDept.data.data);
        setStaffList(resUsers.data.data.filter(u => u.role === 'STAFF'));
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, []);

  const handleAssign = async (reqId, staffId, deptId) => {
    try {
      await axios.put(`/api/requests/${reqId}/status`, {
        status: 'ASSIGNED',
        assignedStaff: staffId,
        department: deptId
      });
      // Refresh requests
      const resReq = await axios.get('/api/requests');
      setRequests(resReq.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  if (!analytics) return <div>Loading Analytics...</div>;

  const unassignedRequests = requests.filter(r => r.status === 'SUBMITTED');

  return (
    <div className="animate-fade-in">
      <div className="flex gap-6 mb-8" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
        <div className="stat-card glass-panel text-center flex-col justify-center">
          <h3 className="text-4xl font-bold text-primary">{analytics.totalRequests}</h3>
          <p className="text-muted text-sm font-semibold mt-2">Total Requests</p>
        </div>
        <div className="stat-card glass-panel text-center flex-col justify-center">
          <h3 className="text-4xl font-bold text-warning">{unassignedRequests.length}</h3>
          <p className="text-muted text-sm font-semibold mt-2">Needs Assignment</p>
        </div>
        <div className="stat-card glass-panel text-center flex-col justify-center">
          <h3 className="text-4xl font-bold text-yellow-400">{analytics.avgRating ? analytics.avgRating.toFixed(1) : 'N/A'}</h3>
          <p className="text-muted text-sm font-semibold mt-2">Avg Rating</p>
        </div>
      </div>

      <div className="glass-panel p-6" style={{ padding: '2rem' }}>
        <h3 className="text-xl font-bold mb-6 text-warning">Pending Assignments</h3>
        
        {unassignedRequests.length === 0 ? (
          <div className="text-center py-8 text-muted">
            <p>No pending requests to assign.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Request ID</th>
                  <th>Category / Issue</th>
                  <th>Assign To</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {unassignedRequests.map(req => {
                  // Recommend staff based on category's department
                  const deptId = req.department?._id;
                  const relevantStaff = staffList.filter(s => s.department?._id === deptId);

                  return (
                    <tr key={req._id}>
                      <td className="font-semibold text-primary">{req.requestId}</td>
                      <td>
                        <div className="font-semibold">{req.category?.name}</div>
                        <div className="text-xs text-muted truncate max-w-xs">{req.description}</div>
                      </td>
                      <td>
                        <select 
                          className="form-select" 
                          style={{ padding: '0.4rem', fontSize: '0.85rem', width: '200px' }}
                          id={`assign-${req._id}`}
                          defaultValue=""
                        >
                          <option value="" disabled>Select Staff</option>
                          {relevantStaff.map(s => (
                            <option key={s._id} value={s._id}>{s.name} (Suggested)</option>
                          ))}
                          {staffList.filter(s => s.department?._id !== deptId).map(s => (
                            <option key={s._id} value={s._id}>{s.name} ({s.department?.name})</option>
                          ))}
                        </select>
                      </td>
                      <td>
                        <div className="flex gap-2">
                          <button 
                            className="btn btn-primary" 
                            style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
                            onClick={() => {
                              const staffId = document.getElementById(`assign-${req._id}`).value;
                              if (staffId) {
                                const selectedStaff = staffList.find(s => s._id === staffId);
                                handleAssign(req._id, staffId, selectedStaff.department._id);
                              }
                            }}
                          >
                            Assign
                          </button>
                          <Link to={`/admin/requests/${req._id}`} className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>
                            View
                          </Link>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="glass-panel p-6 mt-8" style={{ padding: '2rem' }}>
         <h3 className="text-xl font-bold mb-6">Recent Activity (All Requests)</h3>
         <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Request ID</th>
                  <th>Status</th>
                  <th>Assigned Staff</th>
                  <th>Date</th>
                  <th>View</th>
                </tr>
              </thead>
              <tbody>
                {requests.slice(0, 10).map(req => (
                  <tr key={req._id}>
                    <td className="font-semibold text-primary">{req.requestId}</td>
                    <td><span className={`badge badge-${req.status}`}>{req.status.replace('_', ' ')}</span></td>
                    <td>{req.assignedStaff?.name || '-'}</td>
                    <td>{new Date(req.createdAt).toLocaleDateString()}</td>
                    <td>
                      <Link to={`/admin/requests/${req._id}`} className="text-primary hover:underline font-semibold text-sm">
                        Details
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
