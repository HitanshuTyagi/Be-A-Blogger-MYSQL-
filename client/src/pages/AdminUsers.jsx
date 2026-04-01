import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getAdminUsers, deleteUser, makeAdmin } from '../api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Users, Shield, Trash2, ArrowLeft, Crown } from 'lucide-react';

export default function AdminUsers() {
  const { user } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/');
      return;
    }
    fetchUsers();
  }, [user]);

  const fetchUsers = () => {
    setLoading(true);
    getAdminUsers()
      .then((data) => setUsers(data.users))
      .catch((err) => {
        addToast(err.message, 'error');
        navigate('/admin');
      })
      .finally(() => setLoading(false));
  };

  const handleDelete = async (id, username) => {
    if (!confirm(`Are you sure you want to delete user "${username}"? This will delete all their posts and comments.`)) return;
    try {
      await deleteUser(id);
      setUsers(users.filter((u) => u.id !== id));
      addToast('User deleted', 'success');
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  const handleMakeAdmin = async (id) => {
    try {
      const data = await makeAdmin(id);
      addToast(data.message, 'success');
      fetchUsers();
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="admin-page">
      <div className="admin-header">
        <Shield size={28} />
        <h1>Manage Users</h1>
        <Link to="/admin" className="btn btn-secondary">
          <ArrowLeft size={16} /> Back to Dashboard
        </Link>
      </div>

      <div className="admin-table-wrapper">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Username</th>
              <th>Email</th>
              <th>Role</th>
              <th>Joined</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td>
                  <span className="user-name">
                    {u.role === 'admin' && <Crown size={14} className="admin-badge" />}
                    {u.username}
                  </span>
                </td>
                <td>{u.email}</td>
                <td>
                  <span className={`role-badge ${u.role}`}>{u.role}</span>
                </td>
                <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                <td className="actions-cell">
                  {u.id !== user.id && (
                    <>
                      {u.role !== 'admin' && (
                        <button className="btn btn-sm btn-secondary" onClick={() => handleMakeAdmin(u.id)}>
                          <Shield size={14} /> Make Admin
                        </button>
                      )}
                      <button className="btn btn-sm btn-danger" onClick={() => handleDelete(u.id, u.username)}>
                        <Trash2 size={14} /> Delete
                      </button>
                    </>
                  )}
                  {u.id === user.id && <span className="you-label">You</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
