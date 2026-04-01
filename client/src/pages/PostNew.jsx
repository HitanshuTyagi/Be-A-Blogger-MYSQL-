import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPost } from '../api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { PenSquare, Image, Tag, FolderOpen, X, Upload } from 'lucide-react';

export default function PostNew() {
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
  const [submitting, setSubmitting] = useState(false);

  if (!user) {
    navigate('/login');
    return null;
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
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

  const removeTag = (t) => setTags(tags.filter((tag) => tag !== t));

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

      const data = await createPost(formData);
      addToast('Post created!', 'success');
      navigate(`/posts/${data.post.slug}`);
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="post-form-page">
      <div className="post-form-card">
        <div className="post-form-header">
          <PenSquare size={28} />
          <h1>Create New Post</h1>
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
              {preview ? (
                <div className="image-preview">
                  <img src={preview} alt="Preview" />
                  <button type="button" className="remove-image" onClick={() => { setImage(null); setPreview(null); }}>
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
                  <button type="button" onClick={() => removeTag(t)}><X size={12} /></button>
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

          <button type="submit" className="btn btn-primary btn-full" disabled={submitting}>
            {submitting ? 'Publishing...' : 'Publish Post'}
          </button>
        </form>
      </div>
    </div>
  );
}
