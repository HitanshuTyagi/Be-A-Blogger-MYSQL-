import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getPost, likePost, addComment, deleteComment, deletePost } from '../api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Heart, Calendar, User, Tag, Edit, Trash2, MessageCircle, Send } from 'lucide-react';

export default function PostShow() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToast } = useToast();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState('');
  const [loading, setLoading] = useState(true);
  const [likeCount, setLikeCount] = useState(0);
  const [liked, setLiked] = useState(false);

  useEffect(() => {
    setLoading(true);
    getPost(slug)
      .then((data) => {
        setPost(data.post);
        setComments(data.comments);
        setLikeCount(data.post.likes?.length || 0);
        setLiked(user ? data.post.likes?.includes(user.id) : false);
      })
      .catch(() => {
        addToast('Post not found', 'error');
        navigate('/');
      })
      .finally(() => setLoading(false));
  }, [slug]);

  const handleLike = async () => {
    if (!user) {
      addToast('Please login to like posts', 'error');
      return;
    }
    try {
      const data = await likePost(post.id);
      if (data.ok) {
        setLikeCount(data.likes);
        setLiked(data.likedByUser);
      }
    } catch {
      addToast('Failed to like post', 'error');
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    try {
      const data = await addComment(slug, commentText, user?.username || 'Anonymous');
      setComments([data.comment, ...comments]);
      setCommentText('');
      addToast('Comment added!', 'success');
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!confirm('Delete this comment?')) return;
    try {
      await deleteComment(slug, commentId);
      setComments(comments.filter((c) => c.id !== commentId));
      addToast('Comment deleted', 'success');
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  const handleDeletePost = async () => {
    if (!confirm('Are you sure you want to delete this post?')) return;
    try {
      await deletePost(post.id);
      addToast('Post deleted', 'success');
      navigate('/');
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (!post) return null;

  const isOwner = user && user.id === post.authorId;
  const isAdmin = user && user.role === 'admin';

  return (
    <div className="post-show-page">
      <article className="post-article">
        {post.image && (
          <div className="post-hero-image">
            <img src={post.image} alt={post.title} />
          </div>
        )}

        <div className="post-header">
          {post.category && <span className="post-category">{post.category}</span>}
          <h1 className="post-title">{post.title}</h1>

          <div className="post-meta">
            <span className="post-author">
              {post.author?.profileImage && (
                <img src={post.author.profileImage} alt="" className="author-avatar" />
              )}
              <User size={16} /> {post.author?.username || 'Unknown'}
            </span>
            <span><Calendar size={16} /> {new Date(post.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
          </div>

          {post.tags && post.tags.length > 0 && (
            <div className="post-tags">
              {post.tags.map((tag, i) => (
                <span key={i} className="tag"><Tag size={12} /> {tag}</span>
              ))}
            </div>
          )}
        </div>

        <div className="post-content" dangerouslySetInnerHTML={{ __html: post.content }} />

        <div className="post-actions">
          <button className={`like-btn ${liked ? 'liked' : ''}`} onClick={handleLike}>
            <Heart size={20} fill={liked ? 'currentColor' : 'none'} /> {likeCount}
          </button>

          {(isOwner || isAdmin) && (
            <div className="owner-actions">
              {isOwner && (
                <Link to={`/posts/${post.id}/edit`} className="btn btn-secondary">
                  <Edit size={16} /> Edit
                </Link>
              )}
              <button className="btn btn-danger" onClick={handleDeletePost}>
                <Trash2 size={16} /> Delete
              </button>
            </div>
          )}
        </div>
      </article>

      <section className="comments-section">
        <h2><MessageCircle size={20} /> Comments ({comments.length})</h2>

        <form onSubmit={handleAddComment} className="comment-form">
          <textarea
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder={user ? 'Write a comment...' : 'Login to comment...'}
            rows={3}
            required
          />
          <button type="submit" className="btn btn-primary" disabled={!user}>
            <Send size={16} /> Post Comment
          </button>
        </form>

        <div className="comments-list">
          {comments.map((comment) => (
            <div key={comment.id} className="comment">
              <div className="comment-header">
                <span className="comment-author">
                  <User size={14} /> {comment.authorName || comment.author?.username || 'Anonymous'}
                </span>
                <span className="comment-date">
                  {new Date(comment.createdAt).toLocaleDateString()}
                </span>
              </div>
              <p className="comment-text">{comment.text}</p>
              {user && (user.id === comment.authorId || user.role === 'admin') && (
                <button
                  className="comment-delete"
                  onClick={() => handleDeleteComment(comment.id)}
                >
                  <Trash2 size={14} /> Delete
                </button>
              )}
            </div>
          ))}
          {comments.length === 0 && (
            <p className="no-comments">No comments yet. Be the first!</p>
          )}
        </div>
      </section>
    </div>
  );
}
