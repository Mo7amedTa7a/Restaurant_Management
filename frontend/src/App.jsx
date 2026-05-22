import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Login from './pages/Login';
import POS from './pages/POS';
import Dashboard from './pages/Dashboard';

const ProtectedRoute = ({ children }) => {
  const { token } = useSelector((state) => state.auth);
  if (!token) return <Navigate to="/login" />;
  return children;
};

const Layout = ({ children }) => {
  return (
    <div className="h-screen bg-fomo-dark-bg">
      <div className="h-full overflow-hidden">
        {children}
      </div>
    </div>
  );
};

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout><POS /></Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;
