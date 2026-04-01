import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { getPosts } from '../api';
import { Calendar, User, Tag, Heart } from 'lucide-react';

export default function Home() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const q = searchParams.get('q') || '';

  useEffect(() => {
    setLoading(true);
    getPosts(q)
      .then((data) => setPosts(data.posts))
      .catch(() => setPosts([]))
      .finally(() => setLoading(false));
  }, [q]);

  return (
    <div className="home-page">
      <section className="hero">
        <h1>Welcome to <span className="accent">Be A Blogger</span></h1>
        <p>Discover stories, ideas, and insights from writers around the world.</p>
      </section>

      {q && (
        <p className="search-results-info">
          Search results for: <strong>"{q}"</strong> ({posts.length} found)
        </p>
      )}

      {loading ? (
        <div className="loading">Loading posts...</div>
      ) : posts.length === 0 ? (
        <div className="empty-state">
          <p>No posts found. {q ? 'Try a different search.' : 'Be the first to write one!'}</p>
        </div>
      ) : (
        <div className="posts-grid">
          {posts.map((post) => (
            <Link to={`/posts/${post.slug}`} key={post.id} className="post-card">
              {post.image && (
                <div className="post-card-image">
                  <img src={post.image} alt={post.title} />
                </div>
              )}
              <div className="post-card-body">
                {post.category && <span className="post-category">{post.category}</span>}
                <h2 className="post-card-title">{post.title}</h2>
                <p className="post-card-excerpt">
                  {post.content?.replace(/<[^>]+>/g, '').substring(0, 120)}...
                </p>
                <div className="post-card-meta">
                  <span><User size={14} /> {post.author?.username || 'Unknown'}</span>
                  <span><Calendar size={14} /> {new Date(post.createdAt).toLocaleDateString()}</span>
                  {post.likes && <span><Heart size={14} /> {post.likes.length}</span>}
                </div>
                {post.tags && post.tags.length > 0 && (
                  <div className="post-card-tags">
                    {post.tags.slice(0, 3).map((tag, i) => (
                      <span key={i} className="tag"><Tag size={12} /> {tag}</span>
                    ))}
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
