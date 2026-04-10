import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";
import PageTitle from "../../components/common/PageTitle";
import FileUploadField from "../../components/common/FileUploadField";
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
import { loadUser } from "../../app/authSlice";
import useAuth from "../../hooks/useAuth";

const emptyProfile = {
  idNo: "",
  gender: "OTHER",
  contact: "",
  district: "",
  location: "",
  education: "",
  faculty: "",
  experienceLevel: "NONE",
  bio: "",
  cvUrl: "",
  idUrl: "",
  coverLetterUrl: "",
  secondaryCertificateUrl: "",
  universityCertificateUrl: "",
  passportPhoto1Url: "",
  passportPhoto2Url: "",
  contractLetterUrl: "",
};

const Profile = () => {
  const dispatch = useDispatch();
  const { logout } = useAuth();
  const { user } = useSelector((state) => state.auth);
  const [userForm, setUserForm] = useState({
    fullName: user?.fullName || "",
    phone: user?.phone || "",
  });
  const [profileForm, setProfileForm] = useState(emptyProfile);
  const [skillForm, setSkillForm] = useState({ name: "", level: "BEGINNER" });
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setUserForm((prev) => ({
      ...prev,
      fullName: user?.fullName || "",
      phone: user?.phone || "",
    }));
  }, [user]);

  const profileCompletion = [
    profileForm.location,
    profileForm.education,
    profileForm.faculty,
    profileForm.bio,
    profileForm.cvUrl,
    profileForm.idUrl,
    profileForm.coverLetterUrl,
    profileForm.secondaryCertificateUrl,
    profileForm.universityCertificateUrl,
    profileForm.passportPhoto1Url,
    profileForm.passportPhoto2Url,
    profileForm.contractLetterUrl,
    skills.length > 0 ? "skills" : "",
  ].filter(Boolean).length;

  const loadProfile = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await getMyCandidateProfileRequest();
      const profile = res.data;
      setProfileForm({
        idNo: profile?.idNo || "",
        gender: profile?.gender || "OTHER",
        contact: profile?.contact || "",
        district: profile?.district || "",
        location: profile?.location || "",
        education: profile?.education || "",
        faculty: profile?.faculty || "",
        experienceLevel: profile?.experienceLevel || "NONE",
        bio: profile?.bio || "",
        cvUrl: profile?.cvUrl || "",
        idUrl: profile?.idUrl || "",
        coverLetterUrl: profile?.coverLetterUrl || "",
        secondaryCertificateUrl: profile?.secondaryCertificateUrl || "",
        universityCertificateUrl: profile?.universityCertificateUrl || "",
        passportPhoto1Url: profile?.passportPhoto1Url || "",
        passportPhoto2Url: profile?.passportPhoto2Url || "",
        contractLetterUrl: profile?.contractLetterUrl || "",
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
        }),
      ]);

      const updatedStoredUser = {
        ...(JSON.parse(localStorage.getItem("smart-ses-user") || "{}")),
        fullName: userForm.fullName,
        phone: userForm.phone,
      };
      localStorage.setItem("smart-ses-user", JSON.stringify(updatedStoredUser));
      dispatch(loadUser());
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
      await saveMyCandidateProfileRequest(profileForm);
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

      <div className="mb-6 rounded-xl bg-gradient-to-r from-slate-900 to-slate-700 p-5 text-white shadow">
        <p className="text-sm text-slate-200">Profile Completion</p>
        <div className="mt-3 flex items-center justify-between gap-4">
          <div className="flex-1">
            <div className="h-3 overflow-hidden rounded-full bg-white/20">
              <div
                className="h-full rounded-full bg-emerald-400 transition-all"
                style={{ width: `${(profileCompletion / 12) * 100}%` }}
              />
            </div>
          </div>
          <p className="text-lg font-semibold">{Math.round((profileCompletion / 12) * 100)}%</p>
        </div>
        <p className="mt-2 text-sm text-slate-200">
          Buuxi xogtaada iyo ugu yaraan hal skill si profile-kaagu u noqdo mid diyaar u ah fursadaha.
        </p>
      </div>

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
              label="ID No"
              value={profileForm.idNo}
              onChange={(event) => setProfileForm((prev) => ({ ...prev, idNo: event.target.value }))}
            />
            <Input
              label="District"
              value={profileForm.district}
              onChange={(event) => setProfileForm((prev) => ({ ...prev, district: event.target.value }))}
            />
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <label className="mb-1 block text-sm font-medium">Gender</label>
              <select
                className="w-full rounded border border-slate-300 px-3 py-2"
                value={profileForm.gender}
                onChange={(event) => setProfileForm((prev) => ({ ...prev, gender: event.target.value }))}
              >
                <option value="MALE">MALE</option>
                <option value="FEMALE">FEMALE</option>
                <option value="OTHER">OTHER</option>
              </select>
            </div>
            <Input
              label="Contact"
              value={profileForm.contact}
              onChange={(event) => setProfileForm((prev) => ({ ...prev, contact: event.target.value }))}
            />
            <Input
              label="Faculty"
              value={profileForm.faculty}
              onChange={(event) => setProfileForm((prev) => ({ ...prev, faculty: event.target.value }))}
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
            <FileUploadField
              label="CV Upload"
              value={profileForm.cvUrl}
              accept=".pdf,.doc,.docx,image/*"
              buttonLabel="Upload CV"
              helperText="PDF, DOC, DOCX, ama image"
              onUploaded={(url) => setProfileForm((prev) => ({ ...prev, cvUrl: url }))}
            />
            <FileUploadField
              label="ID Upload"
              value={profileForm.idUrl}
              accept=".pdf,image/*"
              buttonLabel="Upload ID"
              helperText="National ID, passport, ama PDF"
              onUploaded={(url) => setProfileForm((prev) => ({ ...prev, idUrl: url }))}
            />
            <FileUploadField
              label="Cover Letter"
              value={profileForm.coverLetterUrl}
              accept=".pdf,.doc,.docx,image/*"
              buttonLabel="Upload Cover Letter"
              onUploaded={(url) => setProfileForm((prev) => ({ ...prev, coverLetterUrl: url }))}
            />
            <FileUploadField
              label="Secondary Certificate"
              value={profileForm.secondaryCertificateUrl}
              accept=".pdf,.doc,.docx,image/*"
              buttonLabel="Upload Secondary Certificate"
              onUploaded={(url) => setProfileForm((prev) => ({ ...prev, secondaryCertificateUrl: url }))}
            />
            <FileUploadField
              label="University Certificate"
              value={profileForm.universityCertificateUrl}
              accept=".pdf,.doc,.docx,image/*"
              buttonLabel="Upload University Certificate"
              onUploaded={(url) => setProfileForm((prev) => ({ ...prev, universityCertificateUrl: url }))}
            />
            <FileUploadField
              label="Passport Photo 1"
              value={profileForm.passportPhoto1Url}
              accept="image/*"
              buttonLabel="Upload Passport Photo 1"
              onUploaded={(url) => setProfileForm((prev) => ({ ...prev, passportPhoto1Url: url }))}
            />
            <FileUploadField
              label="Passport Photo 2"
              value={profileForm.passportPhoto2Url}
              accept="image/*"
              buttonLabel="Upload Passport Photo 2"
              onUploaded={(url) => setProfileForm((prev) => ({ ...prev, passportPhoto2Url: url }))}
            />
            <FileUploadField
              label="Contract Letter"
              value={profileForm.contractLetterUrl}
              accept=".pdf,.doc,.docx,image/*"
              buttonLabel="Upload Contract Letter"
              onUploaded={(url) => setProfileForm((prev) => ({ ...prev, contractLetterUrl: url }))}
            />
          </div>

          <div className="flex justify-end">
            <Button type="submit" loading={saving}>
              Save Profile
            </Button>
          </div>
        </div>

        <div className="space-y-4 rounded-xl bg-white p-6 shadow">
          <h3 className="text-lg font-semibold text-slate-900">Account Actions</h3>
          <p className="text-sm text-slate-500">
            Halkan waxaad ka bixi kartaa account-kaaga. Password change hadda waan ka saarnay section-kan.
          </p>
          <Button type="button" variant="danger" className="w-full" onClick={logout}>
            Logout
          </Button>

          <div className="border-t pt-4">
            <h4 className="text-lg font-semibold text-slate-900">Skills</h4>
          </div>
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
