import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import PageTitle from "../../components/common/PageTitle";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Loader from "../../components/ui/Loader";
import {
  addSkillRequest,
  getMyCandidateProfileRequest,
  removeSkillRequest,
  saveMyCandidateProfileRequest,
} from "../../api/candidateProfiles.api";
import { updateMyProfileRequest } from "../../api/user.api";
import { getErrorMessage } from "../../utils/formatters";

const emptyProfile = {
  location: "",
  education: "",
  experienceLevel: "NONE",
  bio: "",
  cvUrl: "",
  idUrl: "",
};

const Profile = () => {
  const { user } = useSelector((state) => state.auth);
  const [userForm, setUserForm] = useState({
    fullName: user?.fullName || "",
    phone: user?.phone || "",
    oldPassword: "",
    newPassword: "",
  });
  const [profileForm, setProfileForm] = useState(emptyProfile);
  const [skillForm, setSkillForm] = useState({ name: "", level: "BEGINNER" });
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const loadProfile = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await getMyCandidateProfileRequest();
      const profile = res.data;
      setProfileForm({
        location: profile?.location || "",
        education: profile?.education || "",
        experienceLevel: profile?.experienceLevel || "NONE",
        bio: profile?.bio || "",
        cvUrl: profile?.cvUrl || "",
        idUrl: profile?.idUrl || "",
      });
      setSkills(profile?.skills || []);
    } catch (err) {
      if (err?.response?.status !== 404) {
        setError(getErrorMessage(err, "Failed to load profile"));
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const handleSaveProfile = async (event) => {
    event.preventDefault();
    try {
      setSaving(true);
      await Promise.all([
        saveMyCandidateProfileRequest(profileForm),
        updateMyProfileRequest({
          fullName: userForm.fullName,
          phone: userForm.phone,
          oldPassword: userForm.oldPassword || undefined,
          newPassword: userForm.newPassword || undefined,
        }),
      ]);

      const updatedStoredUser = {
        ...(JSON.parse(localStorage.getItem("smart-ses-user") || "{}")),
        fullName: userForm.fullName,
        phone: userForm.phone,
      };
      localStorage.setItem("smart-ses-user", JSON.stringify(updatedStoredUser));
      setUserForm((prev) => ({ ...prev, oldPassword: "", newPassword: "" }));
      await loadProfile();
      alert("Profile updated successfully");
    } catch (err) {
      alert(getErrorMessage(err, "Failed to save profile"));
    } finally {
      setSaving(false);
    }
  };

  const handleAddSkill = async () => {
    try {
      await addSkillRequest(skillForm);
      setSkillForm({ name: "", level: "BEGINNER" });
      await loadProfile();
    } catch (err) {
      alert(getErrorMessage(err, "Failed to add skill"));
    }
  };

  const handleRemoveSkill = async (skillId) => {
    try {
      await removeSkillRequest(skillId);
      await loadProfile();
    } catch (err) {
      alert(getErrorMessage(err, "Failed to remove skill"));
    }
  };

  return (
    <div>
      <PageTitle title="My Profile" subtitle="Keep your candidate profile complete and up to date" />
      {loading ? <Loader /> : null}
      {error ? <p className="mb-4 text-sm text-red-600">{error}</p> : null}

      <form onSubmit={handleSaveProfile} className="grid gap-6 xl:grid-cols-[2fr_1fr]">
        <div className="space-y-6 rounded-xl bg-white p-6 shadow">
          <div className="grid gap-4 md:grid-cols-2">
            <Input
              label="Full Name"
              value={userForm.fullName}
              onChange={(event) => setUserForm((prev) => ({ ...prev, fullName: event.target.value }))}
              required
            />
            <Input
              label="Phone"
              value={userForm.phone}
              onChange={(event) => setUserForm((prev) => ({ ...prev, phone: event.target.value }))}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Input
              label="Location"
              value={profileForm.location}
              onChange={(event) => setProfileForm((prev) => ({ ...prev, location: event.target.value }))}
            />
            <Input
              label="Education"
              value={profileForm.education}
              onChange={(event) => setProfileForm((prev) => ({ ...prev, education: event.target.value }))}
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Experience Level</label>
            <select
              className="w-full rounded border border-slate-300 px-3 py-2"
              value={profileForm.experienceLevel}
              onChange={(event) =>
                setProfileForm((prev) => ({ ...prev, experienceLevel: event.target.value }))
              }
            >
              <option value="NONE">NONE</option>
              <option value="JUNIOR">JUNIOR</option>
              <option value="MID">MID</option>
              <option value="SENIOR">SENIOR</option>
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Bio</label>
            <textarea
              className="w-full rounded border border-slate-300 px-3 py-2"
              rows="5"
              value={profileForm.bio}
              onChange={(event) => setProfileForm((prev) => ({ ...prev, bio: event.target.value }))}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Input
              label="CV URL"
              value={profileForm.cvUrl}
              onChange={(event) => setProfileForm((prev) => ({ ...prev, cvUrl: event.target.value }))}
            />
            <Input
              label="ID URL"
              value={profileForm.idUrl}
              onChange={(event) => setProfileForm((prev) => ({ ...prev, idUrl: event.target.value }))}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Input
              label="Old Password"
              type="password"
              value={userForm.oldPassword}
              onChange={(event) => setUserForm((prev) => ({ ...prev, oldPassword: event.target.value }))}
            />
            <Input
              label="New Password"
              type="password"
              value={userForm.newPassword}
              onChange={(event) => setUserForm((prev) => ({ ...prev, newPassword: event.target.value }))}
            />
          </div>

          <div className="flex justify-end">
            <Button type="submit" loading={saving}>
              Save Profile
            </Button>
          </div>
        </div>

        <div className="space-y-4 rounded-xl bg-white p-6 shadow">
          <h3 className="text-lg font-semibold text-slate-900">Skills</h3>
          <Input
            label="Skill Name"
            value={skillForm.name}
            onChange={(event) => setSkillForm((prev) => ({ ...prev, name: event.target.value }))}
          />
          <div>
            <label className="mb-1 block text-sm font-medium">Level</label>
            <select
              className="w-full rounded border border-slate-300 px-3 py-2"
              value={skillForm.level}
              onChange={(event) => setSkillForm((prev) => ({ ...prev, level: event.target.value }))}
            >
              <option value="BEGINNER">BEGINNER</option>
              <option value="INTERMEDIATE">INTERMEDIATE</option>
              <option value="ADVANCED">ADVANCED</option>
            </select>
          </div>
          <Button type="button" className="w-full" onClick={handleAddSkill}>
            Add Skill
          </Button>

          <div className="space-y-3">
            {skills.map((skill) => (
              <div key={skill._id} className="flex items-center justify-between rounded-lg bg-slate-50 p-3">
                <div>
                  <p className="font-medium text-slate-800">{skill.name}</p>
                  <p className="text-xs text-slate-500">{skill.level}</p>
                </div>
                <Button variant="danger" onClick={() => handleRemoveSkill(skill._id)}>
                  Remove
                </Button>
              </div>
            ))}
            {skills.length === 0 ? <p className="text-sm text-slate-500">No skills added yet</p> : null}
          </div>
        </div>
      </form>
    </div>
  );
};

export default Profile;
