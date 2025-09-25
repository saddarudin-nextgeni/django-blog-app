import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { PostsProvider } from "./context/PostsContext";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import PostCreate from "./pages/PostCreate";
import Post from "./pages/Post";
import MyPosts from "./pages/MyPosts";
import Comments from "./pages/Comments";

function App() {
  return (
    <AuthProvider>
      <PostsProvider>
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/posts/create" element={<PostCreate />} />
          <Route path="/posts/:id" element={<Post />} />
          <Route path="/posts/:id/comments" element={<Comments />} />
          <Route path="/myposts" element={<MyPosts />} />
        </Routes>
      </BrowserRouter>
      </PostsProvider>
    </AuthProvider>
  );
}

export default App;