import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Sidebar from "./components/Sidebar";
import Categories from "./pages/Categories";
import Items from "./pages/Items";
import Transactions from "./pages/Transactions";
import TransactionHistory from "./pages/TransactionHistory";
import ActiveBorrows from "./pages/ActiveBorrows";
import Reports from "./pages/Reports";

// Login Component
function Login({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const users = {
  [import.meta.env.VITE_ADMIN_USERNAME]: { 
    password: import.meta.env.VITE_ADMIN_PASSWORD, 
    role: "admin" 
  },
  [import.meta.env.VITE_VIEWER_USERNAME]: { 
    password: import.meta.env.VITE_VIEWER_PASSWORD, 
    role: "viewer" 
  }
};

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (users[username] && users[username].password === password) {
      onLogin({ username, role: users[username].role });
    } else {
      setError("Invalid username or password");
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Factory Store</h1>
          <p className="text-gray-600">Management System</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter username"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter password"
              required
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition shadow-lg"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
}

// Protected Route Component
function ProtectedRoute({ children, user, requireAdmin = false }) {
  if (!user) {
    return <Navigate to="/login" />;
  }

  if (requireAdmin && user.role !== "admin") {
    return (
      <div className="p-8 text-center">
        <div className="bg-red-50 border border-red-200 rounded-xl p-8 max-w-md mx-auto">
          <h2 className="text-2xl font-bold text-red-700 mb-2">Access Denied</h2>
          <p className="text-red-600">You don't have permission to access this page.</p>
          <p className="text-sm text-gray-600 mt-4">Only admins can perform this action.</p>
        </div>
      </div>
    );
  }

  return children;
}

export default function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const savedUser = localStorage.getItem("factoryUser");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem("factoryUser", JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("factoryUser");
  };

  return (
    <Router>
      <Routes>
        <Route
          path="/login"
          element={
            user ? <Navigate to="/reports" /> : <Login onLogin={handleLogin} />
          }
        />

        <Route
          path="/*"
          element={
            user ? (
              <div className="flex min-h-screen bg-gray-100">
                <Sidebar user={user} onLogout={handleLogout} />
                <div className="flex-1 md:ml-64">
                  <Routes>
                    <Route path="/" element={<Navigate to="/reports" />} />
                    
                    {/* Admin Only Routes */}
                    <Route
                      path="/categories"
                      element={
                        <ProtectedRoute user={user} requireAdmin={true}>
                          <Categories />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/items"
                      element={
                        <ProtectedRoute user={user} requireAdmin={true}>
                          <Items />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/transactions"
                      element={
                        <ProtectedRoute user={user} requireAdmin={true}>
                          <Transactions />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/active-borrows"
                      element={
                        <ProtectedRoute user={user} requireAdmin={true}>
                          <ActiveBorrows />
                        </ProtectedRoute>
                      }
                    />

                    {/* Both Can Access */}
                    <Route
                      path="/transactions/history"
                      element={
                        <ProtectedRoute user={user}>
                          <TransactionHistory />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/reports"
                      element={
                        <ProtectedRoute user={user}>
                          <Reports />
                        </ProtectedRoute>
                      }
                    />
                  </Routes>
                </div>
              </div>
            ) : (
              <Navigate to="/login" />
            )
          }
        />
      </Routes>
    </Router>
  );
}