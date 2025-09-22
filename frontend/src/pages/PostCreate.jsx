import React, { useState } from "react";
import api from "../lib/api";
import { useNavigate } from "react-router-dom";
import "./PostCreate.css";

export default function PostCreate() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const nav = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    try {
      const r = await api.post("/posts/create/", { title, content });
      nav(`/posts/${r.data.id}`);
    } catch (err) {
      alert("Create failed (are you logged in?)");
    }
  };

  return (
    <div className="post-create-container">
      <h2>Create Post</h2>
    <form onSubmit={submit}>
      <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Title" />
      <textarea value={content} onChange={e => setContent(e.target.value)} />
      <button>Create</button>
    </form>
    </div>
  );
}
