import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('student@campusflow.com');
  const [password, setPassword] = useState('Student@123');
  const [error, setError] = useState('');
  const { login, user } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate(`/${user.role.toLowerCase()}`);
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = await login(email, password);
      navigate(`/${data.user.role.toLowerCase()}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="glass-panel p-8 max-w-md w-full animate-fade-in" style={{ padding: '2.5rem' }}>
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">CampusFlow</h1>
          <p className="text-muted">Welcome back! Please login to continue.</p>
        </div>
        
        {error && <div className="p-3 mb-4 text-sm text-danger bg-red-500/10 rounded-md border border-red-500/20">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input 
              type="email" 
              className="form-input" 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              required
            />
          </div>
          <div className="form-group mb-6">
            <label className="form-label">Password</label>
            <input 
              type="password" 
              className="form-input" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              required
            />
          </div>
          
          <button type="submit" className="btn btn-primary w-full" style={{ width: '100%', padding: '0.875rem' }}>
            Login to Account
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-muted">
          Don't have an account? <Link to="/register" className="text-primary font-semibold" style={{ textDecoration: 'none' }}>Register here</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
