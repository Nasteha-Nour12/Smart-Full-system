// src/components/layout/Sidebar.jsx
import { NavLink } from "react-router-dom";
import { useSelector } from "react-redux";

const baseLink =
  "block px-4 py-2 rounded text-sm font-medium transition hover:bg-slate-700";

const Sidebar = () => {
  const { user } = useSelector((state) => state.auth);

  return (
    <aside className="w-64 bg-slate-800 text-white min-h-screen p-4">
      <nav className="space-y-1">
        {/* ===== ADMIN ===== */}
        {user?.role === "ADMIN" && (
          <>
            <NavItem to="/admin" label="Dashboard" />
            <NavItem to="/admin/users" label="Users" />
            <NavItem to="/admin/companies" label="Companies" />
            <NavItem to="/admin/programs" label="Programs" />
            <NavItem to="/admin/enrollments" label="Enrollments" />
            <NavItem to="/admin/opportunities" label="Opportunities" />
            <NavItem to="/admin/applications" label="Applications" />
            <NavItem to="/admin/internships" label="Internships" />
            <NavItem to="/admin/go-to-work" label="Go To Work" />
            <NavItem to="/admin/certificates" label="Certificates" />
          </>
        )}

        {/* ===== CEO ===== */}
        {user?.role === "CEO" && (
          <>
            <NavItem to="/ceo" label="Dashboard" />
            <NavItem to="/ceo/reports" label="Reports" />
          </>
        )}

        {/* ===== ICT_OFFICER ===== */}
        {user?.role === "ICT_OFFICER" && (
          <>
            <NavItem to="/ict" label="Dashboard" />
            <NavItem to="/ict/operations" label="Operations" />
          </>
        )}

        {/* ===== JOB_SEEKER ===== */}
        {user?.role === "JOB_SEEKER" && (
          <>
            <NavItem to="/job-seeker" label="Dashboard" />
            <NavItem to="/job-seeker/profile" label="My Profile" />
            <NavItem to="/job-seeker/programs" label="Programs" />
            <NavItem to="/job-seeker/enrollments" label="My Enrollments" />
            <NavItem to="/job-seeker/opportunities" label="Opportunities" />
            <NavItem to="/job-seeker/applications" label="My Applications" />
            <NavItem to="/job-seeker/internships" label="Internships" />
            <NavItem to="/job-seeker/go-to-work" label="Go To Work" />
            <NavItem to="/job-seeker/certificates" label="Certificates" />
          </>
        )}

        {/* ===== EMPLOYER ===== */}
        {user?.role === "EMPLOYER" && (
          <>
            <NavItem to="/employer" label="Dashboard" />
            <NavItem to="/employer/company" label="Company Profile" />
            <NavItem to="/employer/programs" label="Programs" />
            <NavItem to="/employer/enrollments" label="Enrollments" />
            <NavItem to="/employer/opportunities" label="Opportunities" />
            <NavItem to="/employer/applications" label="Applications" />
            <NavItem to="/employer/internships" label="Internships" />
            <NavItem to="/employer/go-to-work" label="Go To Work" />
            <NavItem to="/employer/certificates" label="Certificates" />
          </>
        )}
      </nav>
    </aside>
  );
};

const NavItem = ({ to, label }) => {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `${baseLink} ${
          isActive ? "bg-slate-700 text-white" : "text-slate-300"
        }`
      }
      end
    >
      {label}
    </NavLink>
  );
};

export default Sidebar;
