import { useEffect, useState } from "react";
import PageTitle from "../../components/common/PageTitle";
import Input from "../../components/ui/Input";
import Loader from "../../components/ui/Loader";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import {
  approvePasswordRequest,
  approveUserRequest,
  banUserRequest,
  createAdminUserRequest,
  getPendingPasswordRequests,
  getUserByIdRequest,
  getUsersRequest,
  rejectPasswordRequest,
  updateUserRoleRequest,
} from "../../api/user.api";
import { getRolesRequest } from "../../api/roles.api";
import { formatDate, getErrorMessage } from "../../utils/formatters";
import { addNotification } from "../../utils/notifications";

const emptyCreateForm = {
  fullName: "",
  email: "",
  phone: "",
  password: "",
  accessRole: "ADMIN",
  status: "ACTIVE",
};

const Users = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [createForm, setCreateForm] = useState(emptyCreateForm);
  const [roles, setRoles] = useState([]);
  const [passwordRequests, setPasswordRequests] = useState([]);
  const [createOpen, setCreateOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError("");
      const [usersRes, rolesRes, passwordRes] = await Promise.all([
        getUsersRequest(),
        getRolesRequest(),
        getPendingPasswordRequests(),
      ]);
      setUsers(usersRes.data || []);
      setRoles(rolesRes.data || []);
      setPasswordRequests(passwordRes.data || []);
    } catch (err) {
      setError(getErrorMessage(err, "Failed to load users"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const openUser = async (id) => {
    try {
      const res = await getUserByIdRequest(id);
      setSelectedUser(res.data);
    } catch (err) {
      alert(getErrorMessage(err, "Failed to load user details"));
    }
  };

  const handleApprove = async (id) => {
    try {
      setSaving(true);
      await approveUserRequest(id);
      addNotification({ title: "User Approved", message: "A user account was activated.", type: "success" });
      await loadUsers();
      if (selectedUser?._id === id) {
        await openUser(id);
      }
    } catch (err) {
      alert(getErrorMessage(err, "Failed to approve user"));
    } finally {
      setSaving(false);
    }
  };

  const handleBan = async (id) => {
    try {
      setSaving(true);
      await banUserRequest(id);
      addNotification({ title: "User Banned", message: "A user account was banned.", type: "warning" });
      await loadUsers();
      if (selectedUser?._id === id) {
        await openUser(id);
      }
    } catch (err) {
      alert(getErrorMessage(err, "Failed to ban user"));
    } finally {
      setSaving(false);
    }
  };

  const handleRoleChange = async (id, accessRole) => {
    try {
      setSaving(true);
      await updateUserRoleRequest(id, accessRole);
      addNotification({ title: "Role Updated", message: `User access role updated to ${accessRole}.`, type: "info" });
      await loadUsers();
      if (selectedUser?._id === id) {
        await openUser(id);
      }
    } catch (err) {
      alert(getErrorMessage(err, "Failed to update role"));
    } finally {
      setSaving(false);
    }
  };

  const handleCreateUser = async (event) => {
    event.preventDefault();
    try {
      setSaving(true);
      await createAdminUserRequest({
        ...createForm,
        email: createForm.email.trim(),
        phone: createForm.phone.trim(),
      });
      addNotification({ title: "User Created", message: `New user created with role ${createForm.accessRole}.`, type: "success" });
      setCreateForm(emptyCreateForm);
      setCreateOpen(false);
      await loadUsers();
    } catch (err) {
      alert(getErrorMessage(err, "Failed to create user"));
    } finally {
      setSaving(false);
    }
  };

  const handleApprovePassword = async (id) => {
    try {
      setSaving(true);
      await approvePasswordRequest(id);
      addNotification({ title: "Password Approved", message: "Password change request approved.", type: "success" });
      await loadUsers();
    } catch (err) {
      alert(getErrorMessage(err, "Failed to approve password request"));
    } finally {
      setSaving(false);
    }
  };

  const handleRejectPassword = async (id) => {
    try {
      setSaving(true);
      await rejectPasswordRequest(id);
      addNotification({ title: "Password Rejected", message: "Password change request rejected.", type: "warning" });
      await loadUsers();
    } catch (err) {
      alert(getErrorMessage(err, "Failed to reject password request"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <PageTitle title="Users" subtitle="Approve accounts, create users, and assign access roles">
        <Button onClick={() => setCreateOpen(true)}>Create User</Button>
      </PageTitle>

      {loading ? <Loader /> : null}
      {error ? <p className="mb-4 text-sm text-red-600">{error}</p> : null}

      {!loading ? (
        <div className="overflow-x-auto rounded-xl bg-white shadow">
          <table className="w-full text-sm">
            <thead className="bg-slate-100 text-slate-700">
              <tr>
                <th className="p-3 text-left">Name</th>
                <th className="p-3 text-left">Contact</th>
                <th className="p-3 text-left">Role</th>
                <th className="p-3 text-left">Status</th>
                <th className="p-3 text-left">Joined</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user._id} className="border-t">
                  <td className="p-3 font-medium text-slate-800">{user.fullName}</td>
                  <td className="p-3 text-slate-600">{user.email || user.phone || "-"}</td>
                  <td className="p-3">{user.accessRole || user.role}</td>
                  <td className="p-3">{user.status}</td>
                  <td className="p-3">{formatDate(user.createdAt)}</td>
                  <td className="p-3 text-right">
                    <div className="flex flex-wrap justify-end gap-2">
                      <Button variant="secondary" onClick={() => openUser(user._id)}>
                        View
                      </Button>
                      {user.status !== "ACTIVE" ? (
                        <Button onClick={() => handleApprove(user._id)} loading={saving}>
                          Approve
                        </Button>
                      ) : null}
                      {user.status !== "BANNED" ? (
                        <Button variant="danger" onClick={() => handleBan(user._id)} loading={saving}>
                          Ban
                        </Button>
                      ) : null}
                    </div>
                  </td>
                </tr>
              ))}
              {users.length === 0 ? (
                <tr>
                  <td className="p-4 text-center text-slate-500" colSpan={6}>
                    No users found
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      ) : null}

      {!loading ? (
        <div className="mt-6 overflow-x-auto rounded-xl bg-white shadow">
          <div className="border-b bg-slate-50 px-4 py-3">
            <p className="text-sm font-semibold text-slate-700">Pending Password Change Requests</p>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-slate-100 text-slate-700">
              <tr>
                <th className="p-3 text-left">Name</th>
                <th className="p-3 text-left">Contact</th>
                <th className="p-3 text-left">Requested At</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {passwordRequests.map((item) => (
                <tr key={item._id} className="border-t">
                  <td className="p-3 font-medium text-slate-800">{item.fullName}</td>
                  <td className="p-3 text-slate-600">{item.email || item.phone || "-"}</td>
                  <td className="p-3">{formatDate(item.passwordChangeRequestedAt || item.updatedAt)}</td>
                  <td className="p-3 text-right">
                    <div className="flex justify-end gap-2">
                      <Button onClick={() => handleApprovePassword(item._id)} loading={saving}>Approve</Button>
                      <Button variant="danger" onClick={() => handleRejectPassword(item._id)} loading={saving}>Reject</Button>
                    </div>
                  </td>
                </tr>
              ))}
              {passwordRequests.length === 0 ? (
                <tr>
                  <td className="p-4 text-center text-slate-500" colSpan={4}>
                    No pending password requests
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      ) : null}

      <Modal
        open={!!selectedUser}
        title="User Details"
        onClose={() => setSelectedUser(null)}
        footer={null}
      >
        {selectedUser ? (
          <div className="space-y-4">
            <div className="grid gap-3 md:grid-cols-2">
              <div className="rounded-lg bg-slate-50 p-3">
                <p className="text-xs uppercase text-slate-500">Name</p>
                <p className="font-medium text-slate-800">{selectedUser.fullName}</p>
              </div>
              <div className="rounded-lg bg-slate-50 p-3">
                <p className="text-xs uppercase text-slate-500">Contact</p>
                <p className="font-medium text-slate-800">
                  {selectedUser.email || selectedUser.phone || "-"}
                </p>
              </div>
              <div className="rounded-lg bg-slate-50 p-3">
                <p className="text-xs uppercase text-slate-500">Status</p>
                <p className="font-medium text-slate-800">{selectedUser.status}</p>
              </div>
              <div className="rounded-lg bg-slate-50 p-3">
                <p className="text-xs uppercase text-slate-500">Joined</p>
                <p className="font-medium text-slate-800">{formatDate(selectedUser.createdAt)}</p>
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Role</label>
              <select
                className="w-full rounded border border-slate-300 px-3 py-2"
                value={selectedUser.accessRole || "ADMIN"}
                onChange={(event) => handleRoleChange(selectedUser._id, event.target.value)}
              >
                {roles.map((role) => (
                  <option key={role._id} value={role.name}>
                    {role.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-end gap-2">
              <Button
                onClick={() => handleApprove(selectedUser._id)}
                loading={saving}
                disabled={selectedUser.status === "ACTIVE"}
              >
                Activate
              </Button>
              <Button
                variant="danger"
                onClick={() => handleBan(selectedUser._id)}
                loading={saving}
                disabled={selectedUser.status === "BANNED"}
              >
                Ban User
              </Button>
            </div>
          </div>
        ) : null}
      </Modal>

      <Modal
        open={createOpen}
        title="Create User"
        onClose={() => setCreateOpen(false)}
        footer={null}
      >
        <form onSubmit={handleCreateUser} className="space-y-4">
          <Input
            label="Full Name"
            value={createForm.fullName}
            onChange={(event) =>
              setCreateForm((prev) => ({ ...prev, fullName: event.target.value }))
            }
            required
          />
          <div className="grid gap-3 md:grid-cols-2">
            <Input
              label="Email"
              type="email"
              value={createForm.email}
              onChange={(event) =>
                setCreateForm((prev) => ({ ...prev, email: event.target.value }))
              }
            />
            <Input
              label="Phone"
              value={createForm.phone}
              onChange={(event) =>
                setCreateForm((prev) => ({ ...prev, phone: event.target.value }))
              }
            />
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <Input
              label="Password"
              type="password"
              value={createForm.password}
              onChange={(event) =>
                setCreateForm((prev) => ({ ...prev, password: event.target.value }))
              }
              required
            />
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Role</label>
              <select
                className="w-full rounded border border-slate-300 px-3 py-2"
                value={createForm.accessRole}
                onChange={(event) =>
                  setCreateForm((prev) => ({ ...prev, accessRole: event.target.value }))
                }
              >
                {roles.map((role) => (
                  <option key={role._id} value={role.name}>
                    {role.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Status</label>
            <select
              className="w-full rounded border border-slate-300 px-3 py-2"
              value={createForm.status}
              onChange={(event) =>
                setCreateForm((prev) => ({ ...prev, status: event.target.value }))
              }
            >
              <option value="ACTIVE">ACTIVE</option>
              <option value="PENDING">PENDING</option>
              <option value="BANNED">BANNED</option>
            </select>
          </div>
          <div className="flex justify-end">
            <Button type="submit" loading={saving}>
              Create User
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Users;
