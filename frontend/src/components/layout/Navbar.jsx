import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Menu, Moon, Sun } from "lucide-react";
import { logoutUser } from "../../app/authSlice";
import { useUISettings } from "../../context/UISettingsContext";
import coaLogo from "../../assets/coa-logo.svg";

const Navbar = ({ onMenuToggle }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { language, setLanguage, theme, setTheme, t } = useUISettings();

  const handleLogout = () => {
    dispatch(logoutUser());
    navigate("/login");
  };

  const goToDashboard = () => {
    if (!user) return;
    if (user.role === "ADMIN") {
      navigate("/admin");
      return;
    }
    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-30 border-b border-white/30 bg-slate-950/85 px-3 py-3 text-white backdrop-blur-md sm:px-6">
      <div className="mx-auto flex w-full max-w-[1600px] items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onMenuToggle}
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/20 bg-white/10 text-cyan-100 md:hidden"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div
            onClick={goToDashboard}
            className="flex cursor-pointer items-center gap-2"
          >
            <img src={coaLogo} alt="System logo" className="h-10 w-10 rounded-xl border border-white/20 bg-white/10 p-1" />
            <span className="text-sm font-semibold tracking-[0.2em] text-cyan-100 sm:text-base">SMART</span>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          <span className="hidden rounded-full border border-white/20 bg-white/10 px-3 py-1 text-sm text-slate-100 md:inline-flex">
            {user?.fullName || "User"} - {user?.role || "-"}
          </span>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="hidden rounded-lg border border-white/20 bg-white/10 px-2 py-1 text-xs text-slate-100 md:inline-flex"
            aria-label={t("language")}
          >
            <option value="en">EN</option>
            <option value="so">SO</option>
          </select>
          <button
            type="button"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-white/20 bg-white/10 text-cyan-100"
            aria-label={t("theme")}
          >
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>

          <button
            onClick={handleLogout}
            className="rounded-lg bg-red-500 px-3 py-1.5 text-sm font-semibold text-white transition hover:bg-red-600"
          >
            {t("logout")}
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
