export const PAGE_ACCESS_OPTIONS = [
  { key: "dashboard", label: "Dashboard", path: "/admin" },
  { key: "users", label: "Users", path: "/admin/users" },
  { key: "companies", label: "Companies", path: "/admin/companies" },
  { key: "candidate_profiles", label: "Candidate Profiles", path: "/admin/candidate-profiles" },
  { key: "training_programs", label: "Training Programs", path: "/admin/training-programs" },
  { key: "hospitality", label: "Hospitality", path: "/admin/hospitality" },
  { key: "internships", label: "Internships", path: "/admin/internships" },
  { key: "go_to_work", label: "Shaqo Tag", path: "/admin/go-to-work" },
  { key: "documents", label: "Documents", path: "/admin/documents" },
  { key: "reports", label: "Reports", path: "/admin/excel-import" },
  { key: "settings", label: "Settings", path: "/admin/settings" },
];

export const DEFAULT_PAGE_ACCESS = PAGE_ACCESS_OPTIONS.map((item) => item.key);

export const hasPageAccess = (user, requiredPage) => {
  if (!requiredPage) return true;
  const pages = user?.pageAccess;
  if (!Array.isArray(pages) || pages.length === 0) return user?.role === "ADMIN";
  return pages.includes(requiredPage);
};
