// src/components/layout/Navbar.jsx
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { logoutUser } from "../../app/authSlice";

const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logoutUser());
    navigate("/login");
  };

  const goToDashboard = () => {
    if (!user) return;

    switch (user.role) {
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

  return (
    <header className="bg-slate-900 text-white px-6 py-3 flex justify-between items-center shadow">
      
      {/* LEFT SIDE */}
      <div
        onClick={goToDashboard}
        className="cursor-pointer text-lg font-semibold tracking-wide"
      >
        Smart Skill System
      </div>

      {/* RIGHT SIDE */}
      <div className="flex items-center gap-4">
        <span className="text-sm text-slate-300">
          {user?.fullName} · {user?.role}
        </span>

        <button
          onClick={handleLogout}
          className="bg-red-500 hover:bg-red-600 px-3 py-1.5 rounded text-sm font-medium transition"
        >
          Logout
        </button>
      </div>
    </header>
  );
};

export default Navbar;