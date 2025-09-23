import React, { useEffect, useState, useContext } from "react";
import api from "../lib/api";
import { AuthContext } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { FiSearch } from "react-icons/fi";
import './Home.css';

export default function Home() {
  const [posts, setPosts] = useState([]);
  const [searchOpen, setSearchOpen] = useState(false);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/posts/').then(r => setPosts(r.data)).catch(()=>setPosts([]));
  }, []);

  return (
    <div className="site-container d-flex gap-4">
      <div style={{flex:1}}>
        <div className={`search-wrap ${searchOpen ? 'search-open' : 'search-collapsed'}`}>
          <div className="search-box">
            <button className="btn-ghost" onClick={() => setSearchOpen(v=>!v)}>
              <FiSearch size={18} />
            </button>
            <input className="search-input" placeholder="Search posts by title, content..." />
          </div>

          <div>
            {user ? (
              <Link to="/posts/create" className="btn btn-primary">Create Post</Link>
            ) : (
              <button onClick={() => navigate('/login', {state: {next: '/posts/create'}})} className="btn btn-outline-primary">Login to create</button>
            )}
          </div>
        </div>
        


        <div className="cards-grid cards-grid-centered">
          {posts.map(post => (
            
              <article className="post-card" 
              key={post.id}
              style = {{cursor: 'pointer'}}
              onClick ={()=> {
                if (user){
                  navigate(`/posts/${post.id}`);
                }else{
                  navigate('/login', {state: {next: `/posts/${post.id}`}});
              }
              }}
              >
                <div className="post-title">{post.title}</div>
                <div className="post-meta">{post.author_name} • {new Date(post.created_at).toLocaleDateString()}</div>
                <p className="mb-2">{post.content}</p>
                <div className="d-flex justify-content-between muted">
                  <span>{post.comments_count} comments</span>
                  <span>{post.likes_count} likes</span>
                </div>

                <div className="action-bar" onClick={e => e.stopPropagation()}>
                  <button
                    className={`action-btn action-like ${!user ? 'action-disabled' : ''}`}
                    onClick={() => user ? api.post(`/posts/${post.id}/like/`).then(()=>{/* refresh */}) : navigate('/login')}
                  >
                    Like
                  </button>

                  <button
                    className={`action-btn action-comment ${!user ? 'action-disabled' : ''}`}
                    onClick={() => user ? navigate(`/posts/${post.id}`) : navigate('/login')}
                  >
                    Comment
                  </button>

                  {user && user.email === post.author_name && (
                    <>
                      <button className="action-btn action-edit" onClick={() => navigate(`/posts/${post.id}/edit`)}>Edit</button>
                      <button className="action-btn action-delete" onClick={() => {
                        if(!window.confirm('Delete post?')) return;
                        api.delete(`/posts/${post.id}/`).then(()=>setPosts(prev=>prev.filter(p=>p.id!==post.id)));
                      }}>Delete</button>
                    </>
                  )}
                </div>
              </article>
            
          ))}
        </div>
      </div>

      {/* Right-side filters panel (desktop only) */}
      <aside style={{width:260}}>
        <div className="filters-panel">
          <h5>Filters</h5>
          <div className="filter-row">
            <label>Author email</label>
            <input className="form-control" placeholder="author@example.com" />
          </div>
          <div className="filter-row">
            <label>Date from</label>
            <input type="date" className="form-control" />
          </div>
          <div className="filter-row">
            <label>Has comments</label>
            <select className="form-control">
              <option value="">Any</option>
              <option value="true">Yes</option>
              <option value="false">No</option>
            </select>
          </div>
          <div className="filter-row">
            <label>Min comments</label>
            <input type="number" className="form-control" />
          </div>
          {/* add more filters as needed */}
          <div className="mt-3">
            <button className="btn btn-sm btn-primary me-2">Apply</button>
            <button className="btn btn-sm btn-outline-secondary">Clear</button>
          </div>
        </div>
      </aside>
    </div>
  );
}
