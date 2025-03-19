import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { User, Calendar, BookOpen, Home, Users, ArrowLeft, LogOut, Clock } from "lucide-react";
import { Link } from "react-router-dom";

export default function MeetingRoomBooking() {
  const [meetingRooms, setMeetingRooms] = useState([]);
  const [formData, setFormData] = useState({
    department: "",
    floor: "",
    meetingRoom: "",
    dayType: "Weekday",
    date: "",
    startTime: "",
    endTime: "",
    seatCount: "",
    totalCount: "",
    status: "Pending",
  });
  const [errors, setErrors] = useState({});
  const [availableRooms, setAvailableRooms] = useState([]);
  const [availableFloors, setAvailableFloors] = useState([]);
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
    axios.get("http://localhost:5000/api/rooms").then((res) => {
      const filteredMeetingRooms = res.data.filter((room) => room.hallType === "Meeting Room");
      setMeetingRooms(filteredMeetingRooms);
      setAvailableRooms(filteredMeetingRooms);
      setAvailableFloors([...new Set(filteredMeetingRooms.map((room) => room.floor))]);
    });
  }, []);

  const validateForm = () => {
    const newErrors = {};

    // Basic field validations
    if (!formData.department) newErrors.department = "Department is required";
    if (!formData.floor) newErrors.floor = "Floor is required";
    if (!formData.meetingRoom) newErrors.meetingRoom = "Meeting Room is required";
    
    // Date validation with Day Type check
    if (!formData.date) {
      newErrors.date = "Date is required";
    } else {
      const selectedDate = new Date(formData.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selectedDate < today) {
        newErrors.date = "Date cannot be in the past";
      } else {
        const dayOfWeek = selectedDate.getDay(); // 0 = Sunday, 6 = Saturday
        const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
        if (formData.dayType === "Weekday" && isWeekend) {
          newErrors.date = "Please select a weekday (Monday-Friday)";
        } else if (formData.dayType === "Weekend" && !isWeekend) {
          newErrors.date = "Please select a weekend day (Saturday or Sunday)";
        }
      }
    }

    // Time validations
    if (!formData.startTime) {
      newErrors.startTime = "Start time is required";
    }
    if (!formData.endTime) {
      newErrors.endTime = "End time is required";
    }
    if (formData.startTime && formData.endTime) {
      const start = new Date(`2000-01-01T${formData.startTime}`);
      const end = new Date(`2000-01-01T${formData.endTime}`);
      const minStart = new Date(`2000-01-01T09:00`);
      const maxEnd = new Date(`2000-01-01T17:00`);
      
      if (start < minStart) {
        newErrors.startTime = "Start time must be 9:00 AM or later";
      }
      if (end > maxEnd) {
        newErrors.endTime = "End time must be 5:00 PM or earlier";
      }
      if (start >= end) {
        newErrors.endTime = "End time must be after start time";
      } else {
        const durationMinutes = (end - start) / (1000 * 60);
        if (durationMinutes < 30) {
          newErrors.endTime = "Minimum booking duration is 30 minutes";
        }
        if (durationMinutes > 480) {
          newErrors.endTime = "Maximum booking duration is 8 hours";
        }
      }
    }

    // Total count validation
    if (!formData.totalCount) {
      newErrors.totalCount = "Total count is required";
    } else if (isNaN(formData.totalCount) || formData.totalCount <= 0) {
      newErrors.totalCount = "Total count must be a positive number";
    } else if (!Number.isInteger(Number(formData.totalCount))) {
      newErrors.totalCount = "Total count must be a whole number";
    } else if (
      formData.seatCount &&
      parseInt(formData.totalCount) > parseInt(formData.seatCount)
    ) {
      newErrors.totalCount = "Total count cannot exceed room capacity";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      await axios.post("http://localhost:5000/api/bookings", formData);
      alert("Booking submitted successfully! Status: Under Review");
      setFormData({
        department: "",
        floor: "",
        meetingRoom: "",
        dayType: "Weekday",
        date: "",
        startTime: "",
        endTime: "",
        seatCount: "",
        totalCount: "",
        status: "Pending",
      });
      setErrors({});
      navigate("/BookingManagement");
    } catch (err) {
      console.error(err.response ? err.response.data : err);
      alert("Booking submission failed: " + (err.response?.data?.message || "Unknown error"));
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const newData = { ...prev, [name]: value };

      // Reset date when dayType changes to enforce validation
      if (name === "dayType") {
        newData.date = "";
      }

      if (name === "department") {
        const filtered = meetingRooms.filter((room) => room.department === value);
        setAvailableFloors([...new Set(filtered.map((room) => room.floor))]);
        setAvailableRooms(filtered);
        return {
          ...newData,
          floor: "",
          meetingRoom: "",
          seatCount: "",
          totalCount: "",
        };
      } else if (name === "floor") {
        const filtered = meetingRooms.filter(
          (room) => room.department === newData.department && room.floor === value
        );
        setAvailableRooms(filtered);
        return {
          ...newData,
          meetingRoom: "",
          seatCount: "",
          totalCount: "",
        };
      }
      return newData;
    });
  };

  const handleRoomSelect = (roomId) => {
    const room = meetingRooms.find((room) => room.LID === roomId);
    setFormData((prev) => ({
      ...prev,
      meetingRoom: roomId,
      seatCount: room?.totalSeats || "",
      totalCount: "",
    }));
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setUserInfo(null);
    navigate("/LoginPage");
  };

  const getMinEndTime = () => {
    if (!formData.startTime) return "09:00";
    const [hours, minutes] = formData.startTime.split(":");
    const date = new Date();
    date.setHours(parseInt(hours));
    date.setMinutes(parseInt(minutes) + 30);
    return date.toTimeString().slice(0, 5);
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
            <Link
              to="/StudentDashboard"
              className="flex items-center gap-3 text-[#1B365D] p-3 rounded-lg hover:bg-[#1B365D]/10 transition-all duration-200"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">Back to Dashboard</span>
            </Link>
            <Link
              to="/StudentProfile"
              className="flex items-center gap-3 text-[#1B365D] p-3 rounded-lg hover:bg-[#1B365D]/10 transition-all duration-200"
            >
              <User className="w-5 h-5" />
              <span className="font-medium">Profile</span>
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
              to="/RaisingIssues"
              className="flex items-center gap-3 text-[#1B365D] p-3 rounded-lg hover:bg-[#1B365D]/10 transition-all duration-200"
            >
              <Home className="w-5 h-5" />
              <span className="font-medium">Issues</span>
            </Link>
            <Link
              to="/batch-details"
              className="flex items-center gap-3 text-[#1B365D] p-3 rounded-lg hover:bg-[#1B365D]/10 transition-all duration-200"
            >
              <Users className="w-5 h-5" />
              <span className="font-medium">Batch</span>
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
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-lg mx-auto">
          <h2 className="text-3xl font-bold text-[#1B365D] mb-8 tracking-tight">
            Book a Meeting Room
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-[#1B365D] mb-2">
                Department *
              </label>
              <select
                name="department"
                value={formData.department}
                onChange={handleChange}
                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#1B365D] focus:border-[#1B365D] transition-all duration-200 ${
                  errors.department ? "border-red-500" : "border-[#E2E8F0]"
                } bg-[#F8FAFC] text-[#1B365D] shadow-sm`}
              >
                <option value="">Select Department</option>
                {[...new Set(meetingRooms.map((room) => room.department))].map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
              {errors.department && (
                <p className="text-red-500 text-xs mt-1">{errors.department}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#1B365D] mb-2">
                Floor *
              </label>
              <select
                name="floor"
                value={formData.floor}
                onChange={handleChange}
                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#1B365D] focus:border-[#1B365D] transition-all duration-200 ${
                  errors.floor ? "border-red-500" : "border-[#E2E8F0]"
                } bg-[#F8FAFC] text-[#1B365D] shadow-sm`}
                disabled={!formData.department}
              >
                <option value="">Select Floor</option>
                {availableFloors.map((floor) => (
                  <option key={floor} value={floor}>
                    {floor}
                  </option>
                ))}
              </select>
              {errors.floor && (
                <p className="text-red-500 text-xs mt-1">{errors.floor}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#1B365D] mb-2">
                Meeting Room *
              </label>
              {formData.department ? (
                <div className="grid grid-cols-3 gap-4 max-h-40 overflow-y-auto">
                  {availableRooms.length > 0 ? (
                    availableRooms.map((room) => (
                      <div
                        key={room._id}
                        onClick={() => handleRoomSelect(room.LID)}
                        className={`p-3 border rounded-lg cursor-pointer text-center font-medium transition-all duration-200 ${
                          formData.meetingRoom === room.LID
                            ? "bg-[#1B365D] text-white shadow-md"
                            : "bg-[#F8FAFC] text-[#1B365D] hover:bg-[#1B365D]/10 border-[#E2E8F0]"
                        }`}
                      >
                        {room.LID}
                      </div>
                    ))
                  ) : (
                    <p className="col-span-3 text-center text-gray-500">
                      No meeting rooms available
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">Please select a department to view meeting rooms</p>
              )}
              {errors.meetingRoom && (
                <p className="text-red-500 text-xs mt-1">{errors.meetingRoom}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#1B365D] mb-2">
                Day Type *
              </label>
              <div className="flex gap-6">
                <label className="flex items-center gap-2 text-[#1B365D] font-medium">
                  <input
                    type="radio"
                    name="dayType"
                    value="Weekday"
                    checked={formData.dayType === "Weekday"}
                    onChange={handleChange}
                    className="w-4 h-4 accent-[#1B365D] focus:ring-[#1B365D]"
                  />
                  Weekday
                </label>
                <label className="flex items-center gap-2 text-[#1B365D] font-medium">
                  <input
                    type="radio"
                    name="dayType"
                    value="Weekend"
                    checked={formData.dayType === "Weekend"}
                    onChange={handleChange}
                    className="w-4 h-4 accent-[#1B365D] focus:ring-[#1B365D]"
                  />
                  Weekend
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#1B365D] mb-2">
                Date * {formData.dayType === "Weekday" ? "(Mon-Fri)" : "(Sat-Sun)"}
              </label>
              <div className="relative">
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  min={new Date().toISOString().split("T")[0]}
                  className={`w-full p-3 pl-10 border rounded-lg focus:ring-2 focus:ring-[#1B365D] focus:border-[#1B365D] transition-all duration-200 ${
                    errors.date ? "border-red-500" : "border-[#E2E8F0]"
                  } bg-[#F8FAFC] text-[#1B365D] shadow-sm`}
                />
                <Calendar
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#1B365D]"
                />
              </div>
              {errors.date && (
                <p className="text-red-500 text-xs mt-1">{errors.date}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#1B365D] mb-2">
                Start Time * (9:00 AM - 4:30 PM)
              </label>
              <div className="relative">
                <input
                  type="time"
                  name="startTime"
                  value={formData.startTime}
                  onChange={handleChange}
                  min="09:00"
                  max="16:30"
                  step="1800" // 30-minute intervals
                  className={`w-full p-3 pl-10 border rounded-lg focus:ring-2 focus:ring-[#1B365D] focus:border-[#1B365D] transition-all duration-200 ${
                    errors.startTime ? "border-red-500" : "border-[#E2E8F0]"
                  } bg-[#F8FAFC] text-[#1B365D] shadow-sm`}
                />
                <Clock
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#1B365D]"
                />
              </div>
              {errors.startTime && (
                <p className="text-red-500 text-xs mt-1">{errors.startTime}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#1B365D] mb-2">
                End Time * (Max 5:00 PM)
              </label>
              <div className="relative">
                <input
                  type="time"
                  name="endTime"
                  value={formData.endTime}
                  onChange={handleChange}
                  min={getMinEndTime()}
                  max="17:00"
                  step="1800" // 30-minute intervals
                  className={`w-full p-3 pl-10 border rounded-lg focus:ring-2 focus:ring-[#1B365D] focus:border-[#1B365D] transition-all duration-200 ${
                    errors.endTime ? "border-red-500" : "border-[#E2E8F0]"
                  } bg-[#F8FAFC] text-[#1B365D] shadow-sm`}
                />
                <Clock
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#1B365D]"
                />
              </div>
              {errors.endTime && (
                <p className="text-red-500 text-xs mt-1">{errors.endTime}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#1B365D] mb-2">
                Seat Count (Room Capacity)
              </label>
              <input
                type="number"
                name="seatCount"
                value={formData.seatCount}
                readOnly
                className="w-full p-3 border rounded-lg border-[#E2E8F0] bg-[#F8FAFC] text-[#1B365D] cursor-not-allowed shadow-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#1B365D] mb-2">
                Total Count *
              </label>
              <input
                type="number"
                name="totalCount"
                value={formData.totalCount}
                onChange={handleChange}
                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#1B365D] focus:border-[#1B365D] transition-all duration-200 ${
                  errors.totalCount ? "border-red-500" : "border-[#E2E8F0]"
                } bg-[#F8FAFC] text-[#1B365D] shadow-sm`}
                min="1"
                max={formData.seatCount}
                step="1"
              />
              {errors.totalCount && (
                <p className="text-red-500 text-xs mt-1">{errors.totalCount}</p>
              )}
            </div>

            <button
              type="submit"
              className="w-full bg-[#1B365D] text-white py-3 rounded-lg hover:bg-[#1B365D]/90 transition-all duration-200 font-medium shadow-md"
            >
              Submit Booking
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}