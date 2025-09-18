import React, { useEffect, useState } from "react";
import api from "../lib/api";
import { Link } from "react-router-dom";

export default function Home() {
  const [posts, setPosts] = useState([]);
  useEffect(() => {
    api.get("/posts/").then(r => setPosts(r.data)).catch(() => setPosts([]));
  }, []);
  return (
    <div>
      <h1>Posts</h1>
      {posts.map(p => (
        <div key={p.id}>
          <h3><Link to={`/posts/${p.id}`}>{p.title}</Link></h3>
          <p>{p.author_name} • {new Date(p.created_at).toLocaleString()}</p>
          <p>{p.content.slice(0, 120)}</p>
        </div>
      ))}
    </div>
  );
}
