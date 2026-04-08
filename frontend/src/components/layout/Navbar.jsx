import { useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Bell, CheckCheck, Menu, Moon, Sun } from "lucide-react";
import { logoutUser } from "../../app/authSlice";
import { useUISettings } from "../../context/UISettingsContext";
import coaLogo from "../../assets/coa-logo.svg";
import {
  getNotifications,
  markAllNotificationsRead,
  subscribeNotifications,
} from "../../utils/notifications";

const Navbar = ({ onMenuToggle }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { language, setLanguage, theme, setTheme, t } = useUISettings();
  const [notifications, setNotifications] = useState(() => getNotifications());
  const [openNotifications, setOpenNotifications] = useState(false);
  const [ringing, setRinging] = useState(false);
  const previousUnreadCount = useRef(0);
  const autoCloseTimerRef = useRef(null);

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

  useEffect(() => {
    const unsubscribe = subscribeNotifications((items) => setNotifications(items));
    setNotifications(getNotifications());
    return unsubscribe;
  }, []);

  const unreadCount = useMemo(() => notifications.filter((item) => !item.read).length, [notifications]);

  useEffect(() => {
    if (unreadCount > previousUnreadCount.current) {
      setRinging(true);
      setOpenNotifications(true);
      const bounceTimer = setTimeout(() => setRinging(false), 900);
      if (autoCloseTimerRef.current) clearTimeout(autoCloseTimerRef.current);
      autoCloseTimerRef.current = setTimeout(() => {
        setOpenNotifications(false);
      }, 2500);
      previousUnreadCount.current = unreadCount;
      return () => clearTimeout(bounceTimer);
    }
    previousUnreadCount.current = unreadCount;
  }, [unreadCount]);

  useEffect(() => {
    return () => {
      if (autoCloseTimerRef.current) clearTimeout(autoCloseTimerRef.current);
    };
  }, []);

  const handleMarkAllRead = () => {
    markAllNotificationsRead();
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
          <div className="relative">
            <button
              type="button"
              onClick={() => setOpenNotifications((prev) => !prev)}
              className={`inline-flex h-9 w-9 items-center justify-center rounded-lg border border-white/20 bg-white/10 text-cyan-100 ${ringing ? "animate-bounce" : ""}`}
              aria-label="Notifications"
            >
              <Bell className="h-4 w-4" />
              {unreadCount > 0 ? (
                <span className="absolute -right-1 -top-1 inline-flex min-h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              ) : null}
            </button>
            {openNotifications ? (
              <div className="absolute right-0 mt-2 w-80 rounded-xl border border-white/15 bg-slate-900/95 p-3 text-slate-100 shadow-2xl">
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-sm font-semibold">Notifications</p>
                  <button
                    type="button"
                    onClick={handleMarkAllRead}
                    className="inline-flex items-center gap-1 text-xs text-cyan-200 hover:text-cyan-100"
                  >
                    <CheckCheck className="h-3.5 w-3.5" />
                    Mark all read
                  </button>
                </div>
                <div className="max-h-72 space-y-2 overflow-y-auto">
                  {notifications.length ? (
                    notifications.map((item) => (
                      <div
                        key={item.id}
                        className={`rounded-lg border p-2 ${item.read ? "border-white/10 bg-white/5" : "border-cyan-300/40 bg-cyan-500/10"}`}
                      >
                        <p className="text-sm font-semibold">{item.title}</p>
                        <p className="text-xs text-slate-300">{item.message}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-300">No notifications yet</p>
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
