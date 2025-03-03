import { useState, useEffect } from "react";
import axios from "axios";
import { User, Edit2, Check, X, ArrowLeft, Calendar, BookOpen, Upload, Trash2, LogOut, Users, Mail, Briefcase, Clock } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

export default function StaffProfile() {
  const [userInfo, setUserInfo] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    designation: "",
    department: "",
    officeHours: "",
    profilePhoto: null,
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Please log in to view your profile");
        return;
      }

      try {
        const response = await axios.get("http://localhost:5000/api/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const user = response.data;
        setUserInfo(user);
        setFormData({
          fullName: user.fullName || "",
          email: user.email || "",
          designation: user.designation || "",
          department: user.department || "",
          officeHours: user.officeHours || "",
          profilePhoto: null,
        });
        setImagePreview(user.profilePhoto ? `http://localhost:5000${user.profilePhoto}` : null);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load profile");
      }
    };

    fetchUserData();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, profilePhoto: file });
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleRemoveImage = () => {
    setFormData({ ...formData, profilePhoto: "" });
    setImagePreview(null);
  };

  const handleSave = async () => {
    const token = localStorage.getItem("token");
    const data = new FormData();

    const editableFields = {
      fullName: formData.fullName,
      designation: formData.designation,
      department: formData.department,
      officeHours: formData.officeHours,
    };
    if (formData.profilePhoto) {
      data.append("profilePhoto", formData.profilePhoto);
    }
    Object.keys(editableFields).forEach((key) => {
      if (editableFields[key] !== null && editableFields[key] !== undefined) {
        data.append(key, editableFields[key]);
      }
    });

    try {
      const response = await axios.put(
        "http://localhost:5000/api/auth/me",
        data,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      const updatedUser = response.data;
      setUserInfo(updatedUser);
      setFormData({
        fullName: updatedUser.fullName || "",
        email: updatedUser.email || "",
        designation: updatedUser.designation || "",
        department: updatedUser.department || "",
        officeHours: updatedUser.officeHours || "",
        profilePhoto: null,
      });
      setImagePreview(updatedUser.profilePhoto ? `http://localhost:5000${updatedUser.profilePhoto}` : null);
      setEditMode(false);
      setError("");
    } catch (err) {
      console.error("Error updating profile:", JSON.stringify(err.response?.data, null, 2));
      setError(err.response?.data?.message || "Failed to update profile");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setUserInfo(null);
    navigate("/LoginPage");
  };

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5F7FA]">
        <p className="text-red-500 text-xl font-semibold">{error}</p>
      </div>
    );
  }

  if (!userInfo) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5F7FA]">
        <p className="text-gray-600 text-xl font-semibold">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-[#F5F7FA]">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-lg p-6 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-[#1B365D]/10 rounded-full flex items-center justify-center overflow-hidden">
              {imagePreview ? (
                <img src={imagePreview} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <User className="w-6 h-6 text-[#1B365D]" />
              )}
            </div>
            <div>
              <h2 className="text-lg font-semibold text-[#1B365D]">{userInfo.fullName}</h2>
              <p className="text-sm text-gray-500">{userInfo.role}</p>
            </div>
          </div>
          <nav className="space-y-4">
            <Link
              to="/StaffDashboard"
              className="flex items-center gap-3 text-[#1B365D] p-3 rounded-lg hover:bg-[#1B365D]/10 transition-all duration-200"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">Back to Dashboard</span>
            </Link>
            <Link
              to="/timetable"
              className="flex items-center gap-3 text-[#1B365D] p-3 rounded-lg hover:bg-[#1B365D]/10 transition-all duration-200"
            >
              <Calendar className="w-5 h-5" />
              <span className="font-medium">Timetable</span>
            </Link>
            <Link
              to="/subjects"
              className="flex items-center gap-3 text-[#1B365D] p-3 rounded-lg hover:bg-[#1B365D]/10 transition-all duration-200"
            >
              <BookOpen className="w-5 h-5" />
              <span className="font-medium">Subjects</span>
            </Link>
            <Link
              to="/batch-details"
              className="flex items-center gap-3 text-[#1B365D] p-3 rounded-lg hover:bg-[#1B365D]/10 transition-all duration-200"
            >
              <Users className="w-5 h-5" />
              <span className="font-medium">Batch Details</span>
            </Link>
          </nav>
        </div>
        <div className="space-y-4">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 text-red-600 p-3 rounded-lg hover:bg-red-100 w-full text-left transition-all duration-200"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Logout</span>
          </button>
          <div className="text-center text-sm text-gray-500">
            © 2025 Academic Scheduler
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-4xl mx-auto">
          {/* Header */}
          <div className="bg-gradient-to-r from-[#1B365D] to-[#2A4A7A] rounded-t-2xl -mx-8 -mt-8 p-6 flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-white">Your Profile</h1>
            <button
              onClick={() => setEditMode(!editMode)}
              className="p-2 bg-white/20 text-white rounded-full hover:bg-white/30 transition-all duration-300"
            >
              <Edit2 className="w-5 h-5" />
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <p className="text-red-500 text-sm text-center mb-6 bg-red-50 p-3 rounded-lg">{error}</p>
          )}

          {/* Profile Photo Section */}
          <div className="mb-10 text-center">
            <div className="w-36 h-36 mx-auto mb-6 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300">
              {imagePreview ? (
                <img src={imagePreview} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <User className="w-16 h-16 text-[#1B365D]" />
              )}
            </div>
            {editMode && (
              <div className="flex justify-center gap-4">
                <label className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#1B365D] to-[#2A4A7A] text-white rounded-lg cursor-pointer hover:from-[#2A4A7A] hover:to-[#3B5B9A] transition-all duration-300 shadow-md">
                  <Upload className="w-5 h-5" />
                  <span>Upload Photo</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
                {imagePreview && (
                  <button
                    onClick={handleRemoveImage}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-300 shadow-md"
                  >
                    <Trash2 className="w-5 h-5" />
                    <span>Remove Photo</span>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Profile Details */}
          <div className="max-h-[400px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-[#1B365D] scrollbar-track-gray-100">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ProfileField
                label="Full Name"
                value={formData.fullName}
                editMode={editMode}
                name="fullName"
                onChange={handleInputChange}
                icon={<User className="w-5 h-5 text-[#1B365D]" />}
              />
              <ProfileField
                label="Email"
                value={userInfo.email}
                editMode={false}
                name="email"
                onChange={handleInputChange}
                icon={<Mail className="w-5 h-5 text-[#1B365D]" />}
              />
              <ProfileField
                label="Designation"
                value={formData.designation}
                editMode={editMode}
                name="designation"
                onChange={handleInputChange}
                type="select"
                options={[
                  { value: "", label: "Select Designation" },
                  { value: "Professor", label: "Professor" },
                  { value: "Associate Professor", label: "Associate Professor" },
                  { value: "Senior Lecturer", label: "Senior Lecturer" },
                  { value: "Lecturer", label: "Lecturer" },
                  { value: "Assistant Lecturer", label: "Assistant Lecturer" },
                  { value: "Instructor", label: "Instructor" },
                ]}
                icon={<Briefcase className="w-5 h-5 text-[#1B365D]" />}
              />
              <ProfileField
                label="Department"
                value={formData.department}
                editMode={editMode}
                name="department"
                onChange={handleInputChange}
                type="select"
                options={[
                  { value: "", label: "Select Department" },
                  { value: "Faculty of Computing", label: "Faculty of Computing" },
                  { value: "Faculty of Business Studies", label: "Faculty of Business Studies" },
                  { value: "Faculty of Engineering", label: "Faculty of Engineering" },
                ]}
                icon={<BookOpen className="w-5 h-5 text-[#1B365D]" />}
              />
              <ProfileField
                label="Office Hours"
                value={formData.officeHours}
                editMode={editMode}
                name="officeHours"
                onChange={handleInputChange}
                icon={<Clock className="w-5 h-5 text-[#1B365D]" />}
              />
            </div>
          </div>

          {/* Edit Mode Buttons */}
          {editMode && (
            <div className="mt-10 flex justify-end gap-4">
              <button
                onClick={() => setEditMode(false)}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-gray-200 to-gray-300 text-[#1B365D] rounded-lg hover:from-gray-300 hover:to-gray-400 transition-all duration-300 shadow-md"
              >
                <X className="w-5 h-5" />
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#1B365D] to-[#2A4A7A] text-white rounded-lg hover:from-[#2A4A7A] hover:to-[#3B5B9A] transition-all duration-300 shadow-md"
              >
                <Check className="w-5 h-5" />
                Save Changes
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

const ProfileField = ({ label, value, editMode, name, onChange, type = "text", options, icon, ...props }) => (
  <div className="space-y-2 bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-all duration-300">
    <label className="text-sm font-semibold text-[#1B365D] flex items-center gap-2">
      {icon}
      {label}
    </label>
    {editMode ? (
      type === "select" ? (
        <select
          name={name}
          value={value}
          onChange={onChange}
          className="w-full p-3 rounded-lg bg-[#F5F7FA] text-[#1B365D] border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1B365D] transition-all duration-200"
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      ) : (
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          className="w-full p-3 rounded-lg bg-[#F5F7FA] text-[#1B365D] border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1B365D] transition-all duration-300"
          {...props}
        />
      )
    ) : (
      <p className="text-gray-700 p-3 bg-[#F5F7FA] rounded-lg font-medium">{value || "Not set"}</p>
    )}
  </div>
);