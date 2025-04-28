import { useState, useEffect } from "react";
import axios from "axios";
import { User, Calendar, BookOpen, Users, Home, ArrowLeft, LogOut } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

export default function RaisingIssues() {
  const [rooms, setRooms] = useState([]);
  const [formData, setFormData] = useState({
    facilityType: "Select",
    department: "Select",
    roomId: "",
    issues: [],
    description: "",
    urgency: "Low" // Default urgency
  });
  const [errors, setErrors] = useState({});
  const [userInfo, setUserInfo] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/LoginPage");
        return;
      }
      try {
        const response = await axios.get("http://localhost:5000/api/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUserInfo(response.data);
      } catch (err) {
        console.error("Failed to fetch user data:", err);
        navigate("/LoginPage");
      }
    };

    fetchUserData();
  }, [navigate]);

  useEffect(() => {
    if (formData.facilityType !== "Select" && formData.department !== "Select") {
      fetchRooms();
    }
  }, [formData.facilityType, formData.department]);

  const fetchRooms = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/rooms");
      const filteredRooms = res.data.filter(room => 
        room.hallType === formData.facilityType && 
        room.department === formData.department
      );
      setRooms(filteredRooms);
    } catch (err) {
      console.error(err);
    }
  };

  const issueOptions = [
    "A/C malfunctions",
    "Uncomfortable seating arrangements",
    "Non-functional computers in laboratories",
    "Projector, digital screen, or smart TV issues",
    "Insufficient seat count",
    "Sound and electrical problems",
    "Other miscellaneous issues"
  ];

  const handleIssueChange = (issue) => {
    const updatedIssues = formData.issues.includes(issue)
      ? formData.issues.filter(i => i !== issue)
      : [...formData.issues, issue];
    setFormData({ ...formData, issues: updatedIssues });
  };

  const validateForm = () => {
    const newErrors = {};
    if (formData.facilityType === "Select") newErrors.facilityType = "Please select a facility type";
    if (formData.department === "Select") newErrors.department = "Please select a department";
    if (!formData.roomId) newErrors.roomId = "Please select a room";
    if (formData.issues.length === 0) newErrors.issues = "Please select at least one issue";
    if (formData.issues.includes("Other miscellaneous issues") && !formData.description.trim()) {
      newErrors.description = "Please provide a description for miscellaneous issues";
    }
    if (!["Urgent", "Medium", "Low"].includes(formData.urgency)) newErrors.urgency = "Please select an urgency level";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      await axios.post("http://localhost:5000/api/facility-issues", {
        ...formData,
        reportedDate: new Date(),
        status: "Pending"
      });
      alert("Issue reported successfully!");
      setFormData({
        facilityType: "Select",
        department: "Select",
        roomId: "",
        issues: [],
        description: "",
        urgency: "Low"
      });
    } catch (err) {
      console.error(err);
      alert("Failed to report issue");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setUserInfo(null);
    navigate("/LoginPage");
  };

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
              {userInfo.profilePhoto ? (
                <img src={`http://localhost:5000${userInfo.profilePhoto}`} alt="Profile" className="w-full h-full object-cover" />
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
            <Link to="/StudentDashboard" className="flex items-center gap-3 text-[#1B365D] p-3 rounded-lg hover:bg-[#1B365D]/10 transition-all duration-200">
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">Back to Dashboard</span>
            </Link>
            <Link to="/StudentProfile" className="flex items-center gap-3 text-[#1B365D] p-3 rounded-lg hover:bg-[#1B365D]/10 transition-all duration-200">
              <User className="w-5 h-5" />
              <span className="font-medium">Profile</span>
            </Link>
            <Link to="/timetable" className="flex items-center gap-3 text-[#1B365D] p-3 rounded-lg hover:bg-[#1B365D]/10 transition-all duration-200">
              <Calendar className="w-5 h-5" />
              <span className="font-medium">Timetable</span>
            </Link>
            <Link to="/subjects" className="flex items-center gap-3 text-[#1B365D] p-3 rounded-lg hover:bg-[#1B365D]/10 transition-all duration-200">
              <BookOpen className="w-5 h-5" />
              <span className="font-medium">Subjects</span>
            </Link>
            <Link to="/MeetingRoomBooking" className="flex items-center gap-3 text-[#1B365D] p-3 rounded-lg hover:bg-[#1B365D]/10 transition-all duration-200">
              <Home className="w-5 h-5" />
              <span className="font-medium">Meeting Room</span>
            </Link>
            <Link to="/batch-details" className="flex items-center gap-3 text-[#1B365D] p-3 rounded-lg hover:bg-[#1B365D]/10 transition-all duration-200">
              <Users className="w-5 h-5" />
              <span className="font-medium">Batch</span>
            </Link>
          </nav>
        </div>
        <div className="space-y-4">
          <button onClick={handleLogout} className="flex items-center gap-3 text-red-600 p-3 rounded-lg hover:bg-red-100 w-full text-left transition-all duration-200">
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
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-[#1B365D] mb-8">Report Facility Issue</h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Facility Type */}
            <div>
              <label className="block text-sm font-medium mb-2 text-[#1B365D]">Facility Type *</label>
              <select
                value={formData.facilityType}
                onChange={(e) => setFormData({ ...formData, roomId: "", facilityType: e.target.value })}
                className="w-full p-2 border border-[#F5F7FA] rounded-lg bg-[#F5F7FA] text-[#1B365D]"
              >
                <option value="Select">Select</option>
                <option value="Lecturer Hall">Lecturer Hall</option>
                <option value="Laboratory">Laboratory</option>
                <option value="Meeting Room">Meeting Room</option>
              </select>
              {errors.facilityType && <p className="text-red-500 text-xs mt-1">{errors.facilityType}</p>}
            </div>

            {/* Department */}
            <div>
              <label className="block text-sm font-medium mb-2 text-[#1B365D]">Department *</label>
              <select
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, roomId: "", department: e.target.value })}
                className="w-full p-2 border border-[#F5F7FA] rounded-lg bg-[#F5F7FA] text-[#1B365D]"
              >
                <option value="Select">Select</option>
                <option value="Computer Faculty">Computer Faculty</option>
                <option value="Engineer Faculty">Engineer Faculty</option>
                <option value="Business Faculty">Business Faculty</option>
              </select>
              {errors.department && <p className="text-red-500 text-xs mt-1">{errors.department}</p>}
            </div>

            {/* Room Selection */}
            <div>
              <label className="block text-sm font-medium mb-2 text-[#1B365D]">Select Room *</label>
              <div className="grid grid-cols-3 gap-4 max-h-40 overflow-y-auto">
                {rooms.map(room => (
                  <div
                    key={room._id}
                    onClick={() => setFormData({ ...formData, roomId: room.LID })}
                    className={`p-3 border rounded-lg cursor-pointer text-center ${
                      formData.roomId === room.LID 
                        ? "bg-[#1B365D] text-white" 
                        : "bg-[#F5F7FA] text-[#1B365D]"
                    }`}
                  >
                    {room.LID}
                  </div>
                ))}
              </div>
              {errors.roomId && <p className="text-red-500 text-xs mt-1">{errors.roomId}</p>}
            </div>

            {/* Issues */}
            <div>
              <label className="block text-sm font-medium mb-2 text-[#1B365D]">Select Issues *</label>
              <div className="space-y-2">
                {issueOptions.map(issue => (
                  (issue !== "Non-functional computers in laboratories" || formData.facilityType === "Laboratory") && (
                    <label key={issue} className="flex items-center gap-2 text-[#1B365D]">
                      <input
                        type="checkbox"
                        checked={formData.issues.includes(issue)}
                        onChange={() => handleIssueChange(issue)}
                        className="w-4 h-4 accent-[#1B365D]"
                      />
                      {issue}
                    </label>
                  )
                ))}
              </div>
              {errors.issues && <p className="text-red-500 text-xs mt-1">{errors.issues}</p>}
              
              {/* Description for Miscellaneous Issues */}
              {formData.issues.includes("Other miscellaneous issues") && (
                <div className="mt-4">
                  <label className="block text-sm font-medium mb-2 text-[#1B365D]">
                    Description of Miscellaneous Issue *
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className={`w-full p-2 border rounded-lg ${
                      errors.description ? 'border-red-500' : 'border-[#F5F7FA]'
                    } bg-[#F5F7FA] text-[#1B365D]`}
                    rows="4"
                    placeholder="Please describe the issue..."
                  />
                  {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
                </div>
              )}
            </div>

            {/* Urgency */}
            <div>
              <label className="block text-sm font-medium mb-2 text-[#1B365D]">Urgency *</label>
              <div className="flex space-x-6">
                <label className="flex items-center gap-2 text-[#1B365D]">
                  <input
                    type="radio"
                    name="urgency"
                    value="Urgent"
                    checked={formData.urgency === "Urgent"}
                    onChange={(e) => setFormData({ ...formData, urgency: e.target.value })}
                    className="w-4 h-4 accent-[#1B365D]"
                  />
                  Urgent
                </label>
                <label className="flex items-center gap-2 text-[#1B365D]">
                  <input
                    type="radio"
                    name="urgency"
                    value="Medium"
                    checked={formData.urgency === "Medium"}
                    onChange={(e) => setFormData({ ...formData, urgency: e.target.value })}
                    className="w-4 h-4 accent-[#1B365D]"
                  />
                  Medium
                </label>
                <label className="flex items-center gap-2 text-[#1B365D]">
                  <input
                    type="radio"
                    name="urgency"
                    value="Low"
                    checked={formData.urgency === "Low"}
                    onChange={(e) => setFormData({ ...formData, urgency: e.target.value })}
                    className="w-4 h-4 accent-[#1B365D]"
                  />
                  Low
                </label>
              </div>
              {errors.urgency && <p className="text-red-500 text-xs mt-1">{errors.urgency}</p>}
            </div>

            <button
              type="submit"
              className="w-full bg-[#1B365D] text-[#FFFFFF] py-2 rounded-lg hover:bg-[#1B365D]/90 transition-all duration-200"
            >
              Submit Issue
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}