import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getProfile, updateProfile } from '../api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { User, Mail, Calendar, Edit, Upload, Camera, Search } from 'lucide-react';

export default function Profile() {
  const { user } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [bio, setBio] = useState('');
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    getProfile()
      .then((data) => {
        setProfile(data.user);
        setPosts(data.posts);
        setBio(data.user.bio || '');
      })
      .catch((err) => {
        addToast(err.message, 'error');
        navigate('/');
      })
      .finally(() => setLoading(false));
  }, [user]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('bio', bio);
      if (image) formData.append('profileImage', image);

      const data = await updateProfile(formData);
      setProfile((prev) => ({ ...prev, bio: data.user.bio, profileImage: data.user.profileImage }));
      setEditing(false);
      setImage(null);
      setPreview(null);
      addToast('Profile updated!', 'success');
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredPosts = posts.filter((p) =>
    p.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) return <div className="loading">Loading...</div>;
  if (!profile) return null;

  return (
    <div className="profile-page">
      <div className="profile-card">
        <div className="profile-avatar-section">
          <div className="profile-avatar">
            {preview || profile.profileImage ? (
              <img src={preview || profile.profileImage} alt={profile.username} />
            ) : (
              <div className="avatar-placeholder">
                <User size={48} />
              </div>
            )}
            {editing && (
              <label className="avatar-upload-btn">
                <Camera size={16} />
                <input type="file" accept="image/*" onChange={handleImageChange} hidden />
              </label>
            )}
          </div>

          <h1>{profile.username}</h1>
          <p className="profile-email"><Mail size={14} /> {profile.email}</p>
          <p className="profile-joined"><Calendar size={14} /> Joined {new Date(profile.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}</p>
        </div>

        {editing ? (
          <form onSubmit={handleSave} className="profile-edit-form">
            <div className="form-group">
              <label>Bio</label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell us about yourself..."
                rows={4}
                maxLength={500}
              />
              <span className="char-count">{bio.length}/500</span>
            </div>
            <div className="form-actions-row">
              <button type="submit" className="btn btn-primary" disabled={submitting}>
                {submitting ? 'Saving...' : 'Save Profile'}
              </button>
              <button type="button" className="btn btn-secondary" onClick={() => { setEditing(false); setPreview(null); setImage(null); }}>
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <div className="profile-bio-section">
            <p className="profile-bio">{profile.bio || 'No bio yet.'}</p>
            <button className="btn btn-secondary" onClick={() => setEditing(true)}>
              <Edit size={16} /> Edit Profile
            </button>
          </div>
        )}
      </div>

      <div className="profile-posts">
        <div className="profile-posts-header">
          <h2>My Posts ({posts.length})</h2>
          <div className="profile-search">
            <Search size={16} />
            <input
              type="text"
              placeholder="Search your posts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {filteredPosts.length === 0 ? (
          <div className="empty-state">
            <p>No posts found.</p>
          </div>
        ) : (
          <div className="profile-posts-list">
            {filteredPosts.map((post) => (
              <Link to={`/posts/${post.slug}`} key={post.id} className="profile-post-item">
                {post.image && <img src={post.image} alt="" className="profile-post-thumb" />}
                <div className="profile-post-info">
                  <h3>{post.title}</h3>
                  <span className="profile-post-date">
                    <Calendar size={12} /> {new Date(post.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
