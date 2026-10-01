import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Sparkles } from 'lucide-react';

const NewRequest = () => {
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({ category: '', location: '', description: '', priority: '' });
  const [suggestion, setSuggestion] = useState(null);
  const [typingTimeout, setTypingTimeout] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCategories = async () => {
      const res = await axios.get('/api/data/categories');
      setCategories(res.data.data);
    };
    fetchCategories();
  }, []);

  const handleDescChange = (e) => {
    const desc = e.target.value;
    setFormData({ ...formData, description: desc });

    if (typingTimeout) clearTimeout(typingTimeout);
    
    // Smart Request Assistant - wait for user to stop typing
    if (desc.length > 10) {
      setTypingTimeout(setTimeout(async () => {
        try {
          const res = await axios.post('/api/requests/assistant', { description: desc });
          if (res.data.suggestion) {
            setSuggestion(res.data.suggestion);
          } else {
            setSuggestion(null);
          }
        } catch (err) {
          console.error(err);
        }
      }, 1000));
    } else {
      setSuggestion(null);
    }
  };

  const applySuggestion = () => {
    setFormData({
      ...formData,
      category: suggestion.categoryId,
      priority: suggestion.priority
    });
    setSuggestion(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/requests', formData);
      navigate('/student/requests');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="animate-fade-in max-w-3xl">
      <div className="glass-panel p-8" style={{ padding: '2rem' }}>
        <h2 className="text-2xl font-bold mb-6">Create New Service Request</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Problem Description</label>
            <textarea 
              className="form-textarea" 
              rows="4"
              value={formData.description}
              onChange={handleDescChange}
              placeholder="E.g., The tap in room A-101 is leaking continuously..."
              required
            ></textarea>
          </div>

          {suggestion && (
            <div className="mb-6 p-4 rounded-xl border border-blue-500/30 flex items-start gap-4" style={{ background: 'rgba(59, 130, 246, 0.1)' }}>
              <Sparkles className="text-primary mt-1" />
              <div style={{ flex: 1 }}>
                <h4 className="font-bold text-primary mb-1">Smart Assistant Suggestion</h4>
                <p className="text-sm text-muted mb-3">
                  Based on your description, this seems related to <strong>{suggestion.categoryName}</strong> 
                  ({suggestion.departmentName}) with a default priority of <strong>{suggestion.priority}</strong>.
                </p>
                <button type="button" onClick={applySuggestion} className="btn btn-primary text-sm" style={{ padding: '0.4rem 1rem' }}>
                  Apply Suggestion
                </button>
              </div>
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Category</label>
            <select 
              className="form-select" 
              value={formData.category} 
              onChange={e => setFormData({...formData, category: e.target.value})}
              required
            >
              <option value="">-- Select Category --</option>
              {categories.map(c => (
                <option key={c._id} value={c._id}>{c.name} ({c.department.name})</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Location</label>
            <input 
              type="text" 
              className="form-input" 
              value={formData.location} 
              onChange={e => setFormData({...formData, location: e.target.value})}
              placeholder="E.g., Hostel Block A, Room 101"
              required 
            />
          </div>

          <div className="form-group mb-8">
            <label className="form-label">Priority (Optional)</label>
            <select 
              className="form-select" 
              value={formData.priority} 
              onChange={e => setFormData({...formData, priority: e.target.value})}
            >
              <option value="">-- Default based on category --</option>
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
            </select>
          </div>

          <div className="flex gap-4">
            <button type="submit" className="btn btn-primary px-8">Submit Request</button>
            <button type="button" onClick={() => navigate('/student')} className="btn btn-secondary px-8">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewRequest;
