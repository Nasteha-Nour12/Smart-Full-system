<<<<<<< HEAD
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

=======
import { useCallback, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import PageTitle from "../../components/common/PageTitle";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import { useUISettings } from "../../context/UISettingsContext";
import { updateMyProfileRequest } from "../../api/user.api";
import { getTodayRegistrationsRequest } from "../../api/insights.api";
import { getErrorMessage } from "../../utils/formatters";
import { loadUser } from "../../app/authSlice";
import { addNotification } from "../../utils/notifications";

const Settings = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { language, setLanguage, theme, setTheme } = useUISettings();
  const [profileForm, setProfileForm] = useState({
    fullName: "",
    phone: "",
    oldPassword: "",
    newPassword: "",
  });
  const [stats, setStats] = useState({ date: "", candidateProfilesToday: 0 });
  const [loadingStats, setLoadingStats] = useState(false);
  const [saving, setSaving] = useState(false);
  const previousRegistrationsRef = useRef(null);

  useEffect(() => {
    setProfileForm((prev) => ({
      ...prev,
      fullName: user?.fullName || "",
      phone: user?.phone || "",
    }));
  }, [user]);

  const loadStats = useCallback(async ({ withNotification = false } = {}) => {
    try {
      setLoadingStats(true);
      const res = await getTodayRegistrationsRequest();
      const nextStats = res.data || { date: "", candidateProfilesToday: 0 };
      const nextCount = Number(nextStats.candidateProfilesToday || 0);
      if (
        withNotification &&
        previousRegistrationsRef.current !== null &&
        nextCount !== previousRegistrationsRef.current
      ) {
        const diff = nextCount - previousRegistrationsRef.current;
        addNotification({
          title: "Daily Registrations Updated",
          message:
            diff > 0
              ? `${diff} new candidate registration(s) added today. Total: ${nextCount}.`
              : `Registrations updated. Total today is now ${nextCount}.`,
          type: "info",
        });
      }
      previousRegistrationsRef.current = nextCount;
      setStats(nextStats);
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to load today's registrations"));
    } finally {
      setLoadingStats(false);
    }
  }, []);

  useEffect(() => {
    loadStats({ withNotification: false });
    const timer = setInterval(() => {
      loadStats({ withNotification: true });
    }, 20000);
    return () => clearInterval(timer);
  }, [loadStats]);

  const handleProfileSave = async (event) => {
    event.preventDefault();
    try {
      setSaving(true);
      const payload = {
        fullName: profileForm.fullName.trim(),
        phone: profileForm.phone.trim(),
      };
      if (profileForm.newPassword) {
        payload.oldPassword = profileForm.oldPassword;
        payload.newPassword = profileForm.newPassword;
      }

      await updateMyProfileRequest(payload);
      const currentStored = JSON.parse(localStorage.getItem("smart-ses-user") || "{}");
      localStorage.setItem(
        "smart-ses-user",
        JSON.stringify({
          ...currentStored,
          fullName: payload.fullName,
          phone: payload.phone,
        })
      );
      dispatch(loadUser());
      setProfileForm((prev) => ({ ...prev, oldPassword: "", newPassword: "" }));
      toast.success("Profile settings updated");
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to update profile settings"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <PageTitle title="Settings" subtitle="Manage preferences, profile, and registration notifications" />
      <div className="grid gap-5">
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

        <form onSubmit={handleProfileSave} className="rounded-xl bg-white p-6 shadow">
          <h3 className="text-lg font-semibold text-slate-900">Manage Profile</h3>
          <p className="mt-1 text-sm text-slate-500">Update your name, phone, and password securely.</p>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <Input
              label="Full Name"
              value={profileForm.fullName}
              onChange={(e) => setProfileForm((prev) => ({ ...prev, fullName: e.target.value }))}
              required
            />
            <Input
              label="Phone"
              value={profileForm.phone}
              onChange={(e) => setProfileForm((prev) => ({ ...prev, phone: e.target.value }))}
              placeholder="Digits only"
            />
            <Input
              label="Old Password"
              type="password"
              value={profileForm.oldPassword}
              onChange={(e) => setProfileForm((prev) => ({ ...prev, oldPassword: e.target.value }))}
            />
            <Input
              label="New Password"
              type="password"
              value={profileForm.newPassword}
              onChange={(e) => setProfileForm((prev) => ({ ...prev, newPassword: e.target.value }))}
              placeholder="At least 8 chars with letters and numbers"
            />
          </div>
          <div className="mt-4 flex justify-end">
            <Button type="submit" loading={saving}>
              Save Profile Settings
            </Button>
          </div>
        </form>

        <div className="rounded-xl bg-white p-6 shadow">
          <h3 className="text-lg font-semibold text-slate-900">Daily Registration Notification</h3>
          <p className="mt-1 text-sm text-slate-500">
            Live auto-notification: marka tirada registration-ka maanta is beddesho, bell icon-ka kore si toos ah ayuu kuu ogeysiinayaa.
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-3 rounded-lg border border-slate-200 p-4">
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500">Date</p>
              <p className="text-sm font-medium text-slate-900">{stats.date || "-"}</p>
            </div>
            <div className="ml-0 md:ml-8">
              <p className="text-xs uppercase tracking-wide text-slate-500">Registered Today</p>
              <p className="text-2xl font-bold text-slate-900">{stats.candidateProfilesToday || 0}</p>
            </div>
            <div className="ml-auto flex gap-2">
              <Button type="button" variant="secondary" onClick={loadStats} loading={loadingStats}>
                Refresh
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
>>>>>>> 9129225 (Start real project changes)
