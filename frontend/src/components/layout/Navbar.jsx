import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { Bell, Menu, Moon, Sun } from "lucide-react";
import { logoutUser } from "../../app/authSlice";
import { useUISettings } from "../../context/UISettingsContext";
import coaLogo from "../../assets/coa-logo.svg";
import { getNotifications, markAllNotificationsRead, subscribeNotifications } from "../../utils/notifications";

const Navbar = ({ onMenuToggle }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { language, setLanguage, theme, setTheme, t } = useUISettings();
  const [openBell, setOpenBell] = useState(false);
  const [items, setItems] = useState(() => getNotifications());
  const bellWrapRef = useRef(null);

  const handleLogout = () => {
    dispatch(logoutUser());
    navigate("/login");
  };

  const goToDashboard = () => {
    if (!user) return;
    navigate("/admin");
  };

  useEffect(() => {
    const unsub = subscribeNotifications((list) => setItems(list));
    return unsub;
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setItems(getNotifications());
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const onClickOutside = (event) => {
      if (bellWrapRef.current && !bellWrapRef.current.contains(event.target)) {
        setOpenBell(false);
      }
    };
    document.addEventListener("click", onClickOutside);
    return () => document.removeEventListener("click", onClickOutside);
  }, []);

  const toggleBell = () => {
    const next = !openBell;
    setOpenBell(next);
    if (next) {
      markAllNotificationsRead();
    }
  };

  const unreadCount = items.filter((item) => !item.read).length;

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
            <span className="text-xs font-semibold tracking-[0.12em] text-cyan-100 sm:text-sm">SMART EMPLOYMENT SERVICES</span>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          <span className="hidden rounded-full border border-white/20 bg-white/10 px-3 py-1 text-sm text-slate-100 md:inline-flex">
            {user?.fullName || "User"} - {user?.accessRole || user?.role || "-"}
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
          <div className="relative" ref={bellWrapRef}>
            <button
              type="button"
              onClick={toggleBell}
              className="relative inline-flex h-9 w-9 items-center justify-center rounded-lg border border-white/20 bg-white/10 text-cyan-100"
              aria-label="Notifications"
            >
              <Bell className="h-4 w-4" />
              {unreadCount > 0 ? (
                <span className="absolute -right-1 -top-1 rounded-full bg-red-500 px-1.5 text-[10px] font-bold leading-4 text-white">
                  {unreadCount}
                </span>
              ) : null}
            </button>
            {openBell ? (
              <div className="absolute right-0 mt-2 w-80 rounded-xl border border-white/15 bg-slate-900/95 p-3 shadow-2xl">
                <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-cyan-200">Notifications</p>
                <div className="max-h-64 space-y-2 overflow-auto">
                  {items.length === 0 ? (
                    <p className="rounded-lg bg-white/5 px-2 py-2 text-xs text-slate-300">No notifications yet.</p>
                  ) : (
                    items.slice(0, 8).map((item) => (
                      <div key={item.id} className="rounded-lg border border-white/10 bg-white/5 px-2 py-2">
                        <p className="text-xs font-semibold text-white">{item.title}</p>
                        <p className="text-xs text-slate-300">{item.message}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            ) : null}
          </div>

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
