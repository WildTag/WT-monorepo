import { BrowserRouter, Route, Routes } from "react-router-dom";
import Home from "./pages/home/Home";
import Login from "./pages/login/Login";
import Register from "./pages/register/Register";
import AdminHomePage from "./pages/admin";
import UserManagement from "./pages/admin/UserManagement";
import PostManagement from "./pages/admin/PostManagement";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/admin" element={<AdminHomePage />} />
        <Route path="/admin/user_management" element={<UserManagement />} />
        <Route path="/admin/post_management" element={<PostManagement />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
