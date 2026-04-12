import { NavLink } from "react-router-dom";
import { useSelector } from "react-redux";
import { BriefcaseBusiness, Building2, ClipboardList, LayoutDashboard, Users, UserRound, ShieldCheck, X } from "lucide-react";
import { hasPageAccess } from "../../constants/pageAccess";
import { useUISettings } from "../../context/UISettingsContext";

const baseLink =
  "flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium transition";

const navItems = [
  { key: "dashboard", to: "/admin", labelKey: "dashboard", icon: <LayoutDashboard className="h-4 w-4" /> },
  { key: "users", to: "/admin/users", labelKey: "users", icon: <Users className="h-4 w-4" /> },
  { key: "companies", to: "/admin/companies", labelKey: "companies", icon: <Building2 className="h-4 w-4" /> },
  { key: "candidate_profiles", to: "/admin/candidate-profiles", labelKey: "candidate_profiles", icon: <UserRound className="h-4 w-4" /> },
  { key: "training_programs", to: "/admin/training-programs", labelKey: "training_programs", icon: <ClipboardList className="h-4 w-4" /> },
  { key: "hospitality", to: "/admin/hospitality", labelKey: "hospitality", icon: <ClipboardList className="h-4 w-4" /> },
  { key: "internships", to: "/admin/internships", labelKey: "internships", icon: <BriefcaseBusiness className="h-4 w-4" /> },
  { key: "go_to_work", to: "/admin/go-to-work", labelKey: "go_to_work", icon: <ClipboardList className="h-4 w-4" /> },
  { key: "documents", to: "/admin/documents", labelKey: "documents", icon: <ClipboardList className="h-4 w-4" /> },
  { key: "reports", to: "/admin/excel-import", labelKey: "reports", icon: <ClipboardList className="h-4 w-4" /> },
  { key: "settings", to: "/admin/settings", labelKey: "settings", icon: <ShieldCheck className="h-4 w-4" /> },
];

const Sidebar = ({ open, onClose }) => {
  const { user } = useSelector((state) => state.auth);
  const { t } = useUISettings();

  return (
    <>
      <div
        className={`fixed inset-0 z-20 bg-slate-900/45 transition md:hidden ${open ? "opacity-100" : "pointer-events-none opacity-0"}`}
        onClick={onClose}
      />
      <aside
        className={`ses-panel ses-sidebar fixed left-3 top-[84px] z-30 h-[calc(100vh-100px)] w-[270px] shrink-0 rounded-2xl p-4 text-slate-800 transition-transform md:static md:z-auto md:h-auto md:w-64 md:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-[120%]"
        }`}
      >
        <div className="mb-3 flex items-center justify-between md:hidden">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">{t("navigation")}</p>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500"
            aria-label="Close menu"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <nav className="space-y-1">
        {user?.role === "ADMIN" ? navItems
          .filter((item) => hasPageAccess(user, item.key))
          .map((item) => (
            <NavItem key={item.key} to={item.to} label={t(item.labelKey)} icon={item.icon} onClick={onClose} />
          )) : null}
        </nav>
      </aside>
    </>
  );
};

const NavItem = ({ to, label, icon, onClick }) => {
  return (
    <NavLink
      to={to}
      onClick={onClick}
      className={({ isActive }) =>
        `${baseLink} ${
          isActive
            ? "bg-slate-900 text-white shadow-sm"
            : "text-slate-700 hover:bg-slate-100 hover:text-slate-900"
        }`
      }
      end
    >
      {icon}
      {label}
    </NavLink>
  );
};

export default Sidebar;
