import { useEffect, useMemo, useState } from "react";
import PageTitle from "../../components/common/PageTitle";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import { useUISettings } from "../../context/UISettingsContext";
import { updateMyProfileRequest } from "../../api/user.api";
import { createRoleRequest, deleteRoleRequest, getRolesRequest, updateRoleRequest } from "../../api/roles.api";
import { addNotification } from "../../utils/notifications";
import { PAGE_ACCESS_OPTIONS } from "../../constants/pageAccess";
import { getErrorMessage } from "../../utils/formatters";

const emptyRoleForm = {
  name: "",
  description: "",
  pages: ["dashboard"],
};

const Settings = () => {
  const { language, setLanguage, theme, setTheme } = useUISettings();
  const [activeTab, setActiveTab] = useState("profile");
  const [profileForm, setProfileForm] = useState({ fullName: "", phone: "", oldPassword: "", newPassword: "" });
  const [roles, setRoles] = useState([]);
  const [roleForm, setRoleForm] = useState(emptyRoleForm);
  const [editingRoleId, setEditingRoleId] = useState(null);
  const [saving, setSaving] = useState(false);

  const loadRoles = async () => {
    try {
      const res = await getRolesRequest();
      setRoles(res.data || []);
    } catch (error) {
      addNotification({ title: "Settings", message: getErrorMessage(error, "Failed to load role configurations"), type: "error" });
    }
  };

  useEffect(() => {
    loadRoles();
  }, []);

  const tabClass = (tab) =>
    `rounded-xl px-3 py-2 text-sm font-semibold ${activeTab === tab ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-700"}`;

  const roleNameList = useMemo(() => roles.map((r) => r.name).join(", "), [roles]);

  const handleSaveProfile = async () => {
    try {
      setSaving(true);
      await updateMyProfileRequest(profileForm);
      addNotification({ title: "Profile Updated", message: "Your profile settings were saved.", type: "success" });
      setProfileForm((prev) => ({ ...prev, oldPassword: "", newPassword: "" }));
    } catch (error) {
      addNotification({ title: "Profile Update Failed", message: getErrorMessage(error, "Could not save profile"), type: "error" });
    } finally {
      setSaving(false);
    }
  };

  const handleTogglePage = (pageKey) => {
    setRoleForm((prev) => {
      const has = prev.pages.includes(pageKey);
      return { ...prev, pages: has ? prev.pages.filter((p) => p !== pageKey) : [...prev.pages, pageKey] };
    });
  };

  const handleSubmitRole = async (event) => {
    event.preventDefault();
    try {
      setSaving(true);
      const payload = {
        name: roleForm.name.trim(),
        description: roleForm.description.trim(),
        pages: roleForm.pages,
      };
      if (editingRoleId) {
        await updateRoleRequest(editingRoleId, payload);
        addNotification({ title: "Role Updated", message: `${payload.name} role updated successfully.`, type: "success" });
      } else {
        await createRoleRequest(payload);
        addNotification({ title: "Role Created", message: `${payload.name} role created successfully.`, type: "success" });
      }
      setRoleForm(emptyRoleForm);
      setEditingRoleId(null);
      await loadRoles();
    } catch (error) {
      addNotification({ title: "Role Save Failed", message: getErrorMessage(error, "Could not save role"), type: "error" });
    } finally {
      setSaving(false);
    }
  };

  const handleEditRole = (role) => {
    setEditingRoleId(role._id);
    setRoleForm({ name: role.name, description: role.description || "", pages: role.pages || [] });
  };

  const handleDeleteRole = async (role) => {
    if (!confirm(`Delete role ${role.name}?`)) return;
    try {
      await deleteRoleRequest(role._id);
      addNotification({ title: "Role Deleted", message: `${role.name} role deleted.`, type: "warning" });
      if (editingRoleId === role._id) {
        setEditingRoleId(null);
        setRoleForm(emptyRoleForm);
      }
      await loadRoles();
    } catch (error) {
      addNotification({ title: "Role Delete Failed", message: getErrorMessage(error, "Could not delete role"), type: "error" });
    }
  };

  return (
    <div>
      <PageTitle title="Settings" subtitle="Profile, notifications, and role access configurations" />
      <div className="mb-4 flex flex-wrap gap-2">
        <button type="button" className={tabClass("profile")} onClick={() => setActiveTab("profile")}>Profile</button>
        <button type="button" className={tabClass("notifications")} onClick={() => setActiveTab("notifications")}>Notifications</button>
        <button type="button" className={tabClass("roles")} onClick={() => setActiveTab("roles")}>Role Configurations</button>
      </div>

      {activeTab === "profile" ? (
        <div className="grid gap-4 rounded-xl bg-white p-6 shadow md:grid-cols-2">
          <Input label="Full Name" value={profileForm.fullName} onChange={(e) => setProfileForm((p) => ({ ...p, fullName: e.target.value }))} />
          <Input label="Phone" value={profileForm.phone} onChange={(e) => setProfileForm((p) => ({ ...p, phone: e.target.value }))} />
          <Input label="Old Password" type="password" value={profileForm.oldPassword} onChange={(e) => setProfileForm((p) => ({ ...p, oldPassword: e.target.value }))} />
          <Input label="New Password" type="password" value={profileForm.newPassword} onChange={(e) => setProfileForm((p) => ({ ...p, newPassword: e.target.value }))} />
          <div>
            <label className="mb-1 block text-sm font-semibold text-slate-700">Language</label>
            <select className="w-full rounded-xl border border-slate-300 px-3 py-2.5" value={language} onChange={(e) => setLanguage(e.target.value)}>
              <option value="en">English</option>
              <option value="so">Somali</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-semibold text-slate-700">Theme</label>
            <select className="w-full rounded-xl border border-slate-300 px-3 py-2.5" value={theme} onChange={(e) => setTheme(e.target.value)}>
              <option value="light">Light</option>
              <option value="dark">Dark</option>
            </select>
          </div>
          <div className="md:col-span-2 flex justify-end">
            <Button onClick={handleSaveProfile} loading={saving}>Save Profile</Button>
          </div>
        </div>
      ) : null}

      {activeTab === "notifications" ? (
        <div className="rounded-xl bg-white p-6 shadow">
          <p className="mb-3 text-sm text-slate-600">Notification bell now auto closes after 2.5 seconds and also closes when you click anywhere else.</p>
          <Button
            onClick={() =>
              addNotification({
                title: "System Notification",
                message: "Notification test sent. Click bell icon to verify behavior.",
                type: "info",
              })
            }
          >
            Send Test Notification
          </Button>
        </div>
      ) : null}

      {activeTab === "roles" ? (
        <div className="grid gap-4 md:grid-cols-2">
          <form onSubmit={handleSubmitRole} className="rounded-xl bg-white p-6 shadow space-y-3">
            <Input label="Role Name" value={roleForm.name} onChange={(e) => setRoleForm((p) => ({ ...p, name: e.target.value.toUpperCase() }))} required />
            <Input label="Description" value={roleForm.description} onChange={(e) => setRoleForm((p) => ({ ...p, description: e.target.value }))} />
            <div>
              <p className="mb-2 text-sm font-semibold text-slate-700">Page Access</p>
              <div className="grid gap-2 md:grid-cols-2">
                {PAGE_ACCESS_OPTIONS.map((item) => (
                  <label key={item.key} className="flex items-center gap-2 rounded-lg border border-slate-200 px-2 py-2 text-sm">
                    <input type="checkbox" checked={roleForm.pages.includes(item.key)} onChange={() => handleTogglePage(item.key)} />
                    <span>{item.label}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              {editingRoleId ? (
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    setEditingRoleId(null);
                    setRoleForm(emptyRoleForm);
                  }}
                >
                  Cancel
                </Button>
              ) : null}
              <Button type="submit" loading={saving}>{editingRoleId ? "Update Role" : "Create Role"}</Button>
            </div>
          </form>

          <div className="rounded-xl bg-white p-6 shadow">
            <p className="mb-2 text-sm text-slate-500">Available Roles: {roleNameList || "-"}</p>
            <div className="space-y-3">
              {roles.map((role) => (
                <div key={role._id} className="rounded-lg border border-slate-200 p-3">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-semibold text-slate-800">{role.name}</p>
                    <div className="flex gap-2">
                      <Button variant="secondary" onClick={() => handleEditRole(role)}>Edit</Button>
                      {!role.isSystem ? (
                        <Button variant="danger" onClick={() => handleDeleteRole(role)}>Delete</Button>
                      ) : null}
                    </div>
                  </div>
                  <p className="text-xs text-slate-500">{role.description || "No description"}</p>
                  <p className="mt-2 text-xs text-slate-600">{(role.pages || []).join(", ")}</p>
                </div>
              ))}
              {roles.length === 0 ? <p className="text-sm text-slate-500">No roles found.</p> : null}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default Settings;
