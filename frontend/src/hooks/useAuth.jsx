// src/hooks/useAuth.js
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { login, registerUser, logoutUser, loadUser } from "../app/authSlice";
import { DEFAULT_PAGE_ACCESS, PAGE_ACCESS_OPTIONS } from "../constants/pageAccess";

const useAuth = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { user, isAuthenticated, loading, error } = useSelector(
    (state) => state.auth
  );

  const goByRole = (_role, userData) => {
    const pageAccess = Array.isArray(userData?.pageAccess) && userData.pageAccess.length
      ? userData.pageAccess
      : DEFAULT_PAGE_ACCESS;
    const firstPage = PAGE_ACCESS_OPTIONS.find((item) => pageAccess.includes(item.key));
    navigate(firstPage?.path || "/admin");
  };

  /* ================= LOGIN ================= */
  const handleLogin = async (data) => {
    const res = await dispatch(login(data));

    if (res.meta.requestStatus === "fulfilled") {
      const role = res.payload?.role || res.payload?.user?.role;
      goByRole(role, res.payload || res.payload?.user);
    }
    return res;
  };

  /* ================= REGISTER ================= */
  const handleRegister = async (data) => {
    // expects { fullName, email?, phone?, password }
    const res = await dispatch(registerUser(data));

    if (res.meta.requestStatus === "fulfilled") {
      const role = res.payload?.role || res.payload?.user?.role || "ADMIN";
      goByRole(role, res.payload || res.payload?.user);
    }
    return res;
  };

  /* ================= LOGOUT ================= */
  const handleLogout = async () => {
    await dispatch(logoutUser());
    navigate("/login");
  };

  /* ================= LOAD USER ================= */
  const handleLoadUser = () => {
    dispatch(loadUser());
  };

  return {
    user,
    isAuthenticated,
    loading,
    error,
    login: handleLogin,
    register: handleRegister, // ✅ muhiim
    logout: handleLogout,
    loadUser: handleLoadUser,
  };
};

export default useAuth;
