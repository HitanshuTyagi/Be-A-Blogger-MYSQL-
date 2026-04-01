import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getPostForEdit, updatePost, deletePost } from '../api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Edit, Image, Tag, FolderOpen, X, Upload, Trash2 } from 'lucide-react';

export default function PostEdit() {
  const { id } = useParams();
  const { user } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('');
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [existingImage, setExistingImage] = useState(null);
  const [removeImage, setRemoveImage] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    getPostForEdit(id)
      .then((data) => {
        const p = data.post;
        setTitle(p.title);
        setContent(p.content);
        setCategory(p.category || '');
        setTags(p.tags || []);
        setExistingImage(p.image);
      })
      .catch((err) => {
        addToast(err.message, 'error');
        navigate('/');
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
      setRemoveImage(false);
    }
  };

  const handleRemoveImage = () => {
    setImage(null);
    setPreview(null);
    setExistingImage(null);
    setRemoveImage(true);
  };

  const handleAddTag = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const val = tagInput.trim().replace(',', '');
      if (val && !tags.includes(val)) {
        setTags([...tags, val]);
      }
      setTagInput('');
    }
  };

  const removeTagItem = (t) => setTags(tags.filter((tag) => tag !== t));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('content', content);
      formData.append('category', category);
      formData.append('tags', tags.join(','));
      if (image) formData.append('image', image);
      if (removeImage) formData.append('removeImage', 'true');

      const data = await updatePost(id, formData);
      addToast('Post updated!', 'success');
      navigate(`/posts/${data.post.slug}`);
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this post?')) return;
    try {
      await deletePost(id);
      addToast('Post deleted', 'success');
      navigate('/');
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="post-form-page">
      <div className="post-form-card">
        <div className="post-form-header">
          <Edit size={28} />
          <h1>Edit Post</h1>
        </div>

        <form onSubmit={handleSubmit} className="post-form">
          <div className="form-group">
            <label>Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter your post title"
              required
            />
          </div>

          <div className="form-group">
            <label><Image size={16} /> Cover Image</label>
            <div className="file-upload-area">
              {(preview || existingImage) ? (
                <div className="image-preview">
                  <img src={preview || existingImage} alt="Preview" />
                  <button type="button" className="remove-image" onClick={handleRemoveImage}>
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <label className="file-upload-label">
                  <Upload size={24} />
                  <span>Click to upload an image</span>
                  <input type="file" accept="image/*" onChange={handleImageChange} hidden />
                </label>
              )}
            </div>
          </div>

          <div className="form-group">
            <label><FolderOpen size={16} /> Category</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="">Select a category</option>
              <option value="Technology">Technology</option>
              <option value="Lifestyle">Lifestyle</option>
              <option value="Travel">Travel</option>
              <option value="Food">Food</option>
              <option value="Health">Health</option>
              <option value="Education">Education</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="form-group">
            <label><Tag size={16} /> Tags</label>
            <div className="tags-input-wrapper">
              {tags.map((t) => (
                <span key={t} className="tag-chip">
                  {t}
                  <button type="button" onClick={() => removeTagItem(t)}><X size={12} /></button>
                </span>
              ))}
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleAddTag}
                placeholder="Type and press Enter"
                className="tag-input"
              />
            </div>
          </div>

          <div className="form-group">
            <label>Content</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your post content here..."
              rows={12}
              required
            />
          </div>

          <div className="form-actions-row">
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Updating...' : 'Update Post'}
            </button>
            <button type="button" className="btn btn-danger" onClick={handleDelete}>
              <Trash2 size={16} /> Delete Post
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
