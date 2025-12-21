import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../store/useAuth.jsx';

// =================================================================================================
// Protected Route Wrapper
// -------------------------------------------------------------------------------------------------
// Checks for authentication token.
// Redirects to login if missing, otherwise renders child route.
// =================================================================================================

function ProtectedRoute() {
  const { accessToken } = useAuth();
  if (!accessToken) {
    return <Navigate to="/" replace />;
  }
  return <Outlet />;
}

export default ProtectedRoute;

