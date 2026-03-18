import { useEffect, useState } from "react";
import PageTitle from "../../components/common/PageTitle";
import Loader from "../../components/ui/Loader";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import {
  approveUserRequest,
  banUserRequest,
  getUserByIdRequest,
  getUsersRequest,
  updateUserRoleRequest,
} from "../../api/user.api";
import { formatDate, getErrorMessage } from "../../utils/formatters";

const roleOptions = ["ADMIN", "CEO", "ICT_OFFICER", "CANDIDATE", "EMPLOYER"];

const Users = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await getUsersRequest();
      setUsers(res.data || []);
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

  const handleRoleChange = async (id, role) => {
    try {
      setSaving(true);
      await updateUserRoleRequest(id, role);
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

  return (
    <div>
      <PageTitle title="Users" subtitle="Approve accounts, assign roles, and manage status" />

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
                  <td className="p-3">{user.role}</td>
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
                value={selectedUser.role}
                onChange={(event) => handleRoleChange(selectedUser._id, event.target.value)}
              >
                {roleOptions.map((role) => (
                  <option key={role} value={role}>
                    {role}
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
    </div>
  );
};

export default Users;
