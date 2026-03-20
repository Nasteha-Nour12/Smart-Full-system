import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import Loader from "../ui/Loader";

const ProtectedRoute = ({ children, roles }) => {
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
    if (user.role === "ADMIN") return <Navigate to="/admin" replace />;
    if (user.role === "CEO") return <Navigate to="/ceo" replace />;
    if (user.role === "ICT_OFFICER") return <Navigate to="/ict" replace />;
    if (user.role === "JOB_SEEKER") return <Navigate to="/job-seeker" replace />;
    if (user.role === "EMPLOYER") return <Navigate to="/employer" replace />;
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
