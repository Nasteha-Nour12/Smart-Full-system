// src/hooks/useRole.js
import { useSelector } from "react-redux";

const useRole = () => {
  const user = useSelector((state) => state.auth.user);

  return {
    isAdmin: user?.role === "ADMIN",
    isTeacher: user?.role === "TEACHER",
    isStudent: user?.role === "STUDENT",
    isParent: user?.role === "PARENT",
    role: user?.role,
  };
};

export default useRole;
