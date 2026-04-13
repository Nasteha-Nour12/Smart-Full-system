/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useMemo, useState } from "react";

const dictionary = {
  en: {
    dashboard: "Dashboard",
    users: "Users",
    companies: "Companies",
    candidate_profiles: "Visitor Profiles",
    training_programs: "Training Programs",
    hospitality: "Hospitality",
    internships: "Internships",
    go_to_work: "Shaqo Tag",
    documents: "Documents",
    reports: "Reports",
    excel_import: "Excel Import",
    settings: "Settings",
    logout: "Logout",
    navigation: "Navigation",
    language: "Language",
    theme: "Theme",
    light: "Light",
    dark: "Dark",
  },
  so: {
    dashboard: "Guddiga",
    users: "Isticmaaleyaal",
    companies: "Shirkado",
    candidate_profiles: "Xogta Visitor-ka",
    training_programs: "Barnaamijyada Tababarka",
    hospitality: "Hoteel/So-dhaweyn",
    internships: "Internship",
    go_to_work: "Shaqo Tag",
    documents: "Dukumiintiyo",
    reports: "Warbixinno",
    excel_import: "Soo Gelin Excel",
    settings: "Dejino",
    logout: "Ka Bax",
    navigation: "Hagitaan",
    language: "Luqad",
    theme: "Muuqaal",
    light: "Iftiin",
    dark: "Mugdi",
  },
};

const UISettingsContext = createContext(null);

export const UISettingsProvider = ({ children }) => {
  const [language, setLanguage] = useState(localStorage.getItem("ses-language") || "en");
  const [theme, setTheme] = useState(localStorage.getItem("ses-theme") || "light");

  useEffect(() => {
    localStorage.setItem("ses-language", language);
  }, [language]);

  useEffect(() => {
    localStorage.setItem("ses-theme", theme);
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  const value = useMemo(
    () => ({
      language,
      setLanguage,
      theme,
      setTheme,
      t: (key) => dictionary[language]?.[key] || dictionary.en[key] || key,
    }),
    [language, theme]
  );

  return <UISettingsContext.Provider value={value}>{children}</UISettingsContext.Provider>;
};

export const useUISettings = () => {
  const ctx = useContext(UISettingsContext);
  if (!ctx) throw new Error("useUISettings must be used within UISettingsProvider");
  return ctx;
};
