import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';
import { logout as logoutApi } from '../api';
import { Sun, Moon, Menu, X, Search, LogIn, UserPlus, User, Shield, LogOut, PenSquare } from 'lucide-react';

export default function Header() {
  const { user, setUser } = useAuth();
  const { dark, toggle } = useTheme();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleLogout = async () => {
    try {
      await logoutApi();
      setUser(null);
      addToast('Logged out', 'success');
      navigate('/');
    } catch {
      addToast('Logout failed', 'error');
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(`/?q=${encodeURIComponent(searchQuery)}`);
    setMenuOpen(false);
  };

  return (
    <header className="header">
      <div className="header-container">
        <Link to="/" className="logo">
          <span className="logo-icon">✍️</span>
          <span className="logo-text">Be A Blogger</span>
        </Link>

        <form className="search-form" onSubmit={handleSearch}>
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="Search posts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </form>

        <nav className={`nav-links ${menuOpen ? 'open' : ''}`}>
          {user ? (
            <>
              <Link to="/posts/new" className="nav-link nav-btn" onClick={() => setMenuOpen(false)}>
                <PenSquare size={16} /> Write
              </Link>
              <Link to="/profile" className="nav-link" onClick={() => setMenuOpen(false)}>
                <User size={16} /> {user.username}
              </Link>
              {user.role === 'admin' && (
                <Link to="/admin" className="nav-link" onClick={() => setMenuOpen(false)}>
                  <Shield size={16} /> Admin
                </Link>
              )}
              <button className="nav-link logout-btn" onClick={handleLogout}>
                <LogOut size={16} /> Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-link" onClick={() => setMenuOpen(false)}>
                <LogIn size={16} /> Login
              </Link>
              <Link to="/register" className="nav-link nav-btn" onClick={() => setMenuOpen(false)}>
                <UserPlus size={16} /> Register
              </Link>
            </>
          )}

          <button className="theme-toggle" onClick={toggle} title="Toggle theme">
            {dark ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </nav>

        <button className="hamburger" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>
    </header>
  );
}
