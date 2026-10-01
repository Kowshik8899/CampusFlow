import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    rollNumber: '',
    roomNumber: ''
  });
  const [error, setError] = useState('');
  const { register, user } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate(`/${user.role.toLowerCase()}`);
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = await register(formData);
      navigate(`/${data.user.role.toLowerCase()}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="flex items-center justify-center min-h-screen py-10">
      <div className="glass-panel p-8 max-w-md w-full animate-fade-in" style={{ padding: '2.5rem' }}>
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Student Registration</h1>
          <p className="text-muted">Create an account to submit service requests.</p>
        </div>
        
        {error && <div className="p-3 mb-4 text-sm text-danger bg-red-500/10 rounded-md border border-red-500/20">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input type="text" name="name" className="form-input" onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label className="form-label">Email (College ID)</label>
            <input type="email" name="email" className="form-input" onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label className="form-label">Roll Number</label>
            <input type="text" name="rollNumber" className="form-input" onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label className="form-label">Room Number</label>
            <input type="text" name="roomNumber" className="form-input" onChange={handleChange} required />
          </div>
          <div className="form-group mb-6">
            <label className="form-label">Password</label>
            <input type="password" name="password" className="form-input" onChange={handleChange} required />
          </div>
          
          <button type="submit" className="btn btn-primary w-full" style={{ width: '100%', padding: '0.875rem' }}>
            Register Account
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-muted">
          Already have an account? <Link to="/login" className="text-primary font-semibold" style={{ textDecoration: 'none' }}>Login here</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
