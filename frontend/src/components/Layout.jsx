import React, { useContext } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { LogOut, Home, FileText, PlusCircle, Users, Settings, Grid } from 'lucide-react';

const Layout = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navLinks = {
    STUDENT: [
      { path: '/student', label: 'Dashboard', icon: Home },
      { path: '/student/new', label: 'New Request', icon: PlusCircle },
      { path: '/student/requests', label: 'My Requests', icon: FileText }
    ],
    STAFF: [
      { path: '/staff', label: 'Dashboard', icon: Home }
    ],
    ADMIN: [
      { path: '/admin', label: 'Dashboard', icon: Home }
    ]
  };

  const links = navLinks[user?.role] || [];

  return (
    <div className="app-layout">
      {/* Sidebar */}
      <aside className="sidebar glass-panel" style={{ margin: '1rem', height: 'calc(100vh - 2rem)', borderRadius: '16px' }}>
        <div className="flex items-center gap-2 mb-8">
          <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center font-bold text-xl" style={{ background: 'var(--accent-primary)' }}>
            CF
          </div>
          <h1 className="text-xl font-bold">CampusFlow</h1>
        </div>

        <nav className="flex-col gap-2 flex" style={{ flex: 1 }}>
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                className="flex items-center gap-4"
                style={{
                  padding: '0.75rem 1rem',
                  borderRadius: '12px',
                  textDecoration: 'none',
                  color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                  background: isActive ? 'rgba(59, 130, 246, 0.15)' : 'transparent',
                  fontWeight: isActive ? '600' : '500',
                  transition: 'all 0.3s ease'
                }}
              >
                <Icon size={20} color={isActive ? 'var(--accent-primary)' : 'currentColor'} />
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto">
          <div className="mb-4 p-3 rounded-xl user-profile" style={{ background: 'rgba(255,255,255,0.05)', overflow: 'hidden' }}>
            <div className="user-name font-bold" style={{ fontSize: '0.95rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', lineHeight: '1.2' }}>
              {user?.name}
            </div>
            <div className="user-role text-xs text-muted" style={{ marginTop: '0.25rem', fontWeight: 500, letterSpacing: '0.05em' }}>
              {user?.role}
            </div>
          </div>
          <button onClick={handleLogout} className="btn w-full justify-start text-danger" style={{ background: 'rgba(239, 68, 68, 0.1)' }}>
            <LogOut size={18} /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <header className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold">
            {links.find(l => l.path === location.pathname)?.label || 'Dashboard'}
          </h2>
          {/* Top nav / notifications could go here */}
        </header>
        <div className="animate-fade-in">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;
