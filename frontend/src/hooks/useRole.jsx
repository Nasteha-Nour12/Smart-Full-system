// src/hooks/useRole.js
import { useSelector } from "react-redux";

const useRole = () => {
  const user = useSelector((state) => state.auth.user);

  return {
    isAdmin: user?.role === "ADMIN",
    role: user?.role,
  };
};

export default useRole;
