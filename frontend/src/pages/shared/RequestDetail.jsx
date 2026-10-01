import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';
import { ArrowLeft, Send } from 'lucide-react';

const RequestDetail = () => {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [request, setRequest] = useState(null);
  const [commentText, setCommentText] = useState('');
  const [feedback, setFeedback] = useState({ rating: 5, text: '' });

  const fetchRequest = async () => {
    try {
      const res = await axios.get(`/api/requests/${id}`);
      setRequest(res.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchRequest();
  }, [id]);

  const handleStatusUpdate = async (status) => {
    try {
      await axios.put(`/api/requests/${id}/status`, { status });
      fetchRequest();
    } catch (err) {
      console.error(err);
    }
  };

  const handleCloseRequest = async () => {
    try {
      await axios.put(`/api/requests/${id}/status`, { 
        status: 'CLOSED', 
        rating: feedback.rating, 
        feedback: feedback.text 
      });
      fetchRequest();
    } catch (err) {
      console.error(err);
    }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    try {
      await axios.post(`/api/requests/${id}/comments`, { text: commentText });
      setCommentText('');
      fetchRequest();
    } catch (err) {
      console.error(err);
    }
  };

  if (!request) return <div>Loading...</div>;

  return (
    <div className="animate-fade-in">
      <button onClick={() => navigate(-1)} className="btn btn-secondary mb-6" style={{ padding: '0.5rem 1rem' }}>
        <ArrowLeft size={16} /> Back
      </button>

      <div className="flex gap-6" style={{ display: 'flex', flexDirection: 'row', gap: '2rem' }}>
        {/* Left Col - Details */}
        <div className="glass-panel p-6" style={{ flex: 2, padding: '2rem' }}>
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">{request.requestId}</h2>
              <div className="flex gap-3 mt-2">
                <span className={`badge badge-${request.status}`}>{request.status.replace('_', ' ')}</span>
                <span className="badge" style={{ background: 'rgba(255,255,255,0.1)' }}>{request.priority} PRIORITY</span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted">Submitted on</p>
              <p className="font-semibold">{new Date(request.createdAt).toLocaleDateString()}</p>
            </div>
          </div>

          <div className="mb-6 p-4 rounded-lg" style={{ background: 'rgba(0,0,0,0.2)' }}>
            <h4 className="text-sm text-muted mb-2">Description</h4>
            <p className="text-lg">{request.description}</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
            <div>
              <h4 className="text-sm text-muted mb-1">Category & Dept</h4>
              <p className="font-semibold">{request.category?.name}</p>
              <p className="text-sm">{request.department?.name}</p>
            </div>
            <div>
              <h4 className="text-sm text-muted mb-1">Location</h4>
              <p className="font-semibold">{request.location}</p>
            </div>
            <div>
              <h4 className="text-sm text-muted mb-1">Student Details</h4>
              <p className="font-semibold">{request.student?.name} ({request.student?.rollNumber})</p>
              <p className="text-sm">Room: {request.student?.roomNumber}</p>
            </div>
            <div>
              <h4 className="text-sm text-muted mb-1">Assigned Staff</h4>
              <p className="font-semibold">{request.assignedStaff?.name || 'Unassigned'}</p>
            </div>
          </div>

          {/* Action Buttons based on Role */}
          {user.role === 'STAFF' && request.status === 'ASSIGNED' && (
            <button onClick={() => handleStatusUpdate('IN_PROGRESS')} className="btn btn-primary">
              Mark as In Progress
            </button>
          )}
          {user.role === 'STAFF' && request.status === 'IN_PROGRESS' && (
            <button onClick={() => handleStatusUpdate('RESOLVED')} className="btn btn-success">
              Mark as Resolved
            </button>
          )}

          {/* Student Feedback section if Resolved */}
          {user.role === 'STUDENT' && request.status === 'RESOLVED' && (
            <div className="mt-8 p-6 border border-green-500/30 rounded-xl" style={{ background: 'rgba(16, 185, 129, 0.1)' }}>
              <h3 className="text-xl font-bold mb-4 text-success">Rate the Resolution</h3>
              <div className="form-group mb-4">
                <label className="form-label">Rating (1-5)</label>
                <input type="number" min="1" max="5" className="form-input w-full max-w-xs" value={feedback.rating} onChange={e => setFeedback({...feedback, rating: e.target.value})} />
              </div>
              <div className="form-group mb-4">
                <label className="form-label">Feedback Comments</label>
                <textarea className="form-textarea" rows="3" value={feedback.text} onChange={e => setFeedback({...feedback, text: e.target.value})}></textarea>
              </div>
              <button onClick={handleCloseRequest} className="btn btn-success">Submit Feedback & Close Request</button>
            </div>
          )}

          {request.status === 'CLOSED' && request.rating && (
            <div className="mt-6 p-4 rounded-lg" style={{ background: 'rgba(255,255,255,0.05)' }}>
              <h4 className="text-sm text-muted mb-2">Student Feedback</h4>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-yellow-400 font-bold text-xl">★ {request.rating}/5</span>
              </div>
              <p>{request.feedback}</p>
            </div>
          )}
        </div>

        {/* Right Col - Comments / History */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="glass-panel p-6">
            <h3 className="font-bold mb-4">Discussion</h3>
            <div className="flex-col gap-4 flex" style={{ maxHeight: '300px', overflowY: 'auto', paddingRight: '0.5rem', marginBottom: '1rem' }}>
              {request.comments.length === 0 ? (
                <p className="text-muted text-sm text-center">No comments yet</p>
              ) : (
                request.comments.map(c => (
                  <div key={c._id} className="p-3 rounded-lg" style={{ background: c.user?._id === user._id ? 'rgba(59, 130, 246, 0.2)' : 'rgba(255,255,255,0.05)' }}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-bold">{c.user?.name} ({c.user?.role})</span>
                      <span className="text-xs text-muted">{new Date(c.createdAt).toLocaleString()}</span>
                    </div>
                    <p className="text-sm">{c.text}</p>
                  </div>
                ))
              )}
            </div>

            <form onSubmit={handleComment} className="flex gap-2">
              <input type="text" className="form-input flex-1" style={{ flex: 1, padding: '0.5rem' }} placeholder="Type a message..." value={commentText} onChange={e => setCommentText(e.target.value)} />
              <button type="submit" className="btn btn-primary" style={{ padding: '0.5rem' }}><Send size={18} /></button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RequestDetail;
