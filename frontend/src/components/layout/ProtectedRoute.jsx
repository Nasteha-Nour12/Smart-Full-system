import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import Loader from "../ui/Loader";
import { DEFAULT_PAGE_ACCESS, PAGE_ACCESS_OPTIONS, hasPageAccess } from "../../constants/pageAccess";

const ProtectedRoute = ({ children, roles, requiredPage }) => {
  const { user, isAuthenticated, loading } = useSelector((state) => state.auth);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/admin" replace />;
  }

  if (requiredPage && !hasPageAccess(user, requiredPage)) {
    const pages = Array.isArray(user?.pageAccess) && user.pageAccess.length ? user.pageAccess : DEFAULT_PAGE_ACCESS;
    const fallback = PAGE_ACCESS_OPTIONS.find((item) => pages.includes(item.key));
    return <Navigate to={fallback?.path || "/admin"} replace />;
  }

  return children;
};

export default ProtectedRoute;
