import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getAdminDashboard, getAdminPosts, deletePost } from '../api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Users, FileText, MessageCircle, Shield, Trash2, Eye, Calendar, User, Search } from 'lucide-react';

export default function AdminDashboard() {
  const { user } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/');
      return;
    }
    Promise.all([getAdminDashboard(), getAdminPosts()])
      .then(([statsData, postsData]) => {
        setStats(statsData);
        setPosts(postsData.posts);
      })
      .catch((err) => {
        addToast(err.message, 'error');
        navigate('/');
      })
      .finally(() => setLoading(false));
  }, [user]);

  const handleDeletePost = async (id, title) => {
    if (!confirm(`Delete post "${title}"? This will also delete all its comments.`)) return;
    try {
      await deletePost(id);
      setPosts(posts.filter((p) => p.id !== id));
      setStats((prev) => ({ ...prev, totalPosts: prev.totalPosts - 1 }));
      addToast('Post deleted', 'success');
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  const filteredPosts = posts.filter((p) =>
    p.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) return <div className="loading-spinner"><div className="spinner"></div><p>Loading dashboard...</p></div>;
  if (!stats) return null;

  return (
    <div className="admin-page">
      <div className="admin-header">
        <Shield size={28} />
        <h1>Admin Dashboard</h1>
        <Link to="/admin/users" className="btn btn-primary">
          <Users size={16} /> Manage Users
        </Link>
      </div>

      <div className="stats-grid">
        <div className="stat-card stat-users">
          <div className="stat-icon"><Users size={28} /></div>
          <div className="stat-info">
            <h3>{stats.totalUsers}</h3>
            <p>Total Users</p>
          </div>
        </div>
        <div className="stat-card stat-posts">
          <div className="stat-icon"><FileText size={28} /></div>
          <div className="stat-info">
            <h3>{stats.totalPosts}</h3>
            <p>Total Posts</p>
          </div>
        </div>
        <div className="stat-card stat-comments">
          <div className="stat-icon"><MessageCircle size={28} /></div>
          <div className="stat-info">
            <h3>{stats.totalComments}</h3>
            <p>Total Comments</p>
          </div>
        </div>
      </div>

      <div className="admin-section">
        <div className="admin-section-header">
          <h2><FileText size={20} /> All Posts</h2>
          <div className="admin-search">
            <Search size={16} />
            <input
              type="text"
              placeholder="Search posts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Author</th>
                <th>Category</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPosts.map((post) => (
                <tr key={post.id}>
                  <td>
                    <span className="post-title-cell">{post.title}</span>
                  </td>
                  <td>
                    <span className="author-cell">
                      <User size={14} /> {post.author?.username || 'Unknown'}
                    </span>
                  </td>
                  <td>
                    {post.category ? (
                      <span className="category-badge">{post.category}</span>
                    ) : (
                      <span className="text-muted">—</span>
                    )}
                  </td>
                  <td>
                    <span className="date-cell">
                      <Calendar size={13} /> {new Date(post.createdAt).toLocaleDateString()}
                    </span>
                  </td>
                  <td className="actions-cell">
                    <Link to={`/posts/${post.slug}`} className="btn btn-sm btn-secondary" title="View">
                      <Eye size={14} /> View
                    </Link>
                    <button className="btn btn-sm btn-danger" onClick={() => handleDeletePost(post.id, post.title)} title="Delete">
                      <Trash2 size={14} /> Delete
                    </button>
                  </td>
                </tr>
              ))}
              {filteredPosts.length === 0 && (
                <tr>
                  <td colSpan="5" className="empty-table">No posts found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
