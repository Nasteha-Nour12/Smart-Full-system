import PageTitle from "../../components/common/PageTitle";
import { useUISettings } from "../../context/UISettingsContext";

const Settings = () => {
  const { language, setLanguage, theme, setTheme } = useUISettings();

  return (
    <div>
      <PageTitle title="Settings" subtitle="System preferences for language and theme" />
      <div className="grid gap-4 rounded-xl bg-white p-6 shadow md:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-semibold text-slate-700">Language</label>
          <select
            className="w-full rounded-xl border border-slate-300 px-3 py-2.5"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
          >
            <option value="en">English</option>
            <option value="so">Somali</option>
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm font-semibold text-slate-700">Theme</label>
          <select
            className="w-full rounded-xl border border-slate-300 px-3 py-2.5"
            value={theme}
            onChange={(e) => setTheme(e.target.value)}
          >
            <option value="light">Light</option>
            <option value="dark">Dark</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default Settings;

