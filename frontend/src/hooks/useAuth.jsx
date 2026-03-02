// src/hooks/useAuth.js
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { login, registerUser, logoutUser, loadUser } from "../app/authSlice";

const useAuth = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { user, isAuthenticated, loading, error } = useSelector(
    (state) => state.auth
  );

  const goByRole = (role) => {
    switch (role) {
      case "ADMIN":
        navigate("/admin");
        break;
      case "CEO":
        navigate("/ceo");
        break;
      case "ICT_OFFICER":
        navigate("/ict");
        break;
      case "CANDIDATE":
        navigate("/candidate");
        break;
      case "EMPLOYER":
        navigate("/employer");
        break;
      default:
        navigate("/login");
    }
  };

  /* ================= LOGIN ================= */
  const handleLogin = async (data) => {
    const res = await dispatch(login(data));

    if (res.meta.requestStatus === "fulfilled") {
      const role = res.payload?.role || res.payload?.user?.role;
      goByRole(role);
    }
    return res;
  };

  /* ================= REGISTER ================= */
  const handleRegister = async (data) => {
    // expects { fullName, email?, phone?, password }
    const res = await dispatch(registerUser(data));

    if (res.meta.requestStatus === "fulfilled") {
      const role = res.payload?.role || res.payload?.user?.role || "CANDIDATE";
      goByRole(role);
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