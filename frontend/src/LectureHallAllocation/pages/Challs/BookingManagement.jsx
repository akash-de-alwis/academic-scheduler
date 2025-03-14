import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { User, ArrowLeft, LogOut } from "lucide-react";

export default function BookingManagement() {
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [issues, setIssues] = useState([]);
  const [showDenialModal, setShowDenialModal] = useState(false);
  const [selectedDenialReasons, setSelectedDenialReasons] = useState([]);
  const [userInfo, setUserInfo] = useState(null);
  const [statusFilter, setStatusFilter] = useState("All");
  const navigate = useNavigate();

  // Fetch initial data
  useEffect(() => {
    const fetchInitialData = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/LoginPage");
        return;
      }

      try {
        const userResponse = await axios.get("http://localhost:5000/api/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUserInfo(userResponse.data);
        await Promise.all([fetchBookings(), fetchIssues()]);
      } catch (err) {
        console.error("Error fetching initial data:", err);
        navigate("/LoginPage");
      }
    };

    fetchInitialData();
  }, [navigate]);

  // Data fetching functions
  const fetchBookings = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/bookings");
      setBookings(res.data);
      setFilteredBookings(res.data); // Initially show all bookings
    } catch (err) {
      console.error("Error fetching bookings:", err);
    }
  };

  const fetchIssues = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/facility-issues");
      setIssues(res.data);
    } catch (err) {
      console.error("Error fetching issues:", err);
    }
  };

  // Filter bookings by status
  useEffect(() => {
    if (statusFilter === "All") {
      setFilteredBookings(bookings);
    } else {
      setFilteredBookings(bookings.filter((booking) => booking.status === statusFilter));
    }
  }, [statusFilter, bookings]);

  // Navigation handlers
  const handleBackToBooking = () => navigate("/MeetingRoomBooking");
  const handleBackToDashboard = () => navigate("/StudentDashboard");
  const handleLogout = () => {
    localStorage.removeItem("token");
    setUserInfo(null);
    navigate("/LoginPage");
  };

  // Utility functions
  const calculateTimeDuration = (startTime, endTime) => {
    if (!startTime || !endTime) return "N/A";
    const [startHour, startMinute] = startTime.split(":").map(Number);
    const [endHour, endMinute] = endTime.split(":").map(Number);
    let hours = endHour - startHour;
    let minutes = endMinute - startMinute;
    if (minutes < 0) {
      hours -= 1;
      minutes += 60;
    }
    if (hours < 0) hours += 24;
    return hours + minutes / 60 === 1 ? "1 hour" : `${(hours + minutes / 60).toFixed(1)} hours`;
  };

  const hasLowStudentCount = (booking) =>
    (booking.seatCount === 10 && booking.totalCount < 6) ||
    (booking.seatCount === 5 && booking.totalCount < 3);

  const getDenialReasons = (booking) => {
    let reasons = [];
    const roomIssues = issues.filter(
      (issue) => issue.roomId === booking.meetingRoom && issue.status === "Pending"
    );
    if (roomIssues.length > 0) {
      const issueDetails = roomIssues.map((issue) =>
        formatIssues(issue.issues, issue.description)
      );
      reasons.push(`Maintenance Issues: ${issueDetails.join("; ")}`);
    }
    if (hasLowStudentCount(booking)) reasons.push("Low Student Count");
    return reasons.length > 0 ? reasons : ["No specific reason provided"];
  };

  const formatIssues = (issueList, description) => {
    if (issueList.includes("Other miscellaneous issues")) {
      const filteredIssues = issueList.filter(
        (issue) => issue !== "Other miscellaneous issues"
      );
      if (description.trim()) filteredIssues.push(description);
      return filteredIssues.join(", ");
    }
    return issueList.join(", ");
  };

  // Modal handler
  const handleShowDenialReasons = (booking) => {
    const reasons = booking.status === "Denied" ? getDenialReasons(booking) : ["Booking not denied"];
    setSelectedDenialReasons(reasons);
    setShowDenialModal(true);
  };

  if (!userInfo) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5F7FA]">
        <p className="text-gray-600 text-xl font-semibold">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F5F7FA]">
      {/* Header with Profile and Navigation */}
      <header className="bg-white shadow-lg p-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-[#1B365D]/10 rounded-full flex items-center justify-center overflow-hidden">
            {userInfo.profilePhoto ? (
              <img
                src={`http://localhost:5000${userInfo.profilePhoto}`}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            ) : (
              <User className="w-6 h-6 text-[#1B365D]" />
            )}
          </div>
          <div>
            <h2 className="text-lg font-semibold text-[#1B365D]">{userInfo.fullName}</h2>
            <p className="text-sm text-gray-500">{userInfo.role}</p>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-red-600 hover:text-red-700 text-sm mt-1 transition-all duration-200"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
        <button
          onClick={handleBackToDashboard}
          className="flex items-center gap-2 text-[#1B365D] hover:text-[#1B365D]/70 transition-all duration-200"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-medium">Back to Dashboard</span>
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-8">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold text-[#1B365D]">Booking Management</h2>
            <div className="flex items-center gap-4">
              {/* Status Filter (Styled like RoomList.jsx) */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="p-2 border border-[#F5F7FA] rounded-lg bg-[#F5F7FA] text-[#1B365D]"
              >
                <option value="All">All Statuses</option>
                <option value="Pending">Pending</option>
                <option value="Approved">Approved</option>
                <option value="Denied">Denied</option>
              </select>
              {/* Back to Booking Button */}
              <button
                onClick={handleBackToBooking}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#1B365D] to-[#2A4A7A] text-white rounded-lg hover:from-[#2A4A7A] hover:to-[#3B5B9A] transition-all duration-300 shadow-md focus:outline-none focus:ring-2 focus:ring-[#1B365D] focus:ring-opacity-50"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="font-medium">Back to Booking</span>
              </button>
            </div>
          </div>

          <div className="bg-[#F5F7FA] rounded-lg overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#FFFFFF]">
                  <th className="text-left p-4 font-medium text-[#1B365D]">Department</th>
                  <th className="text-left p-4 font-medium text-[#1B365D]">Floor</th>
                  <th className="text-left p-4 font-medium text-[#1B365D]">Room ID</th>
                  <th className="text-left p-4 font-medium text-[#1B365D]">Day Type</th>
                  <th className="text-left p-4 font-medium text-[#1B365D]">Date</th>
                  <th className="text-left p-4 font-medium text-[#1B365D]">Time Duration</th>
                  <th className="text-left p-4 font-medium text-[#1B365D]">Expected Seats</th>
                  <th className="text-left p-4 font-medium text-[#1B365D]">Total Seats</th>
                  <th className="text-left p-4 font-medium text-[#1B365D]">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredBookings.map((booking) => (
                  <tr key={booking._id} className="border-b border-[#FFFFFF]">
                    <td className="p-4 text-[#1B365D]">{booking.department}</td>
                    <td className="p-4 text-[#1B365D]">{booking.floor}</td>
                    <td className="p-4 text-[#1B365D]">{booking.meetingRoom}</td>
                    <td className="p-4 text-[#1B365D]">{booking.dayType}</td>
                    <td className="p-4 text-[#1B365D]">{new Date(booking.date).toLocaleDateString()}</td>
                    <td className="p-4 text-[#1B365D]">{calculateTimeDuration(booking.startTime, booking.endTime)}</td>
                    <td className="p-4 text-[#1B365D]">{booking.totalCount}</td>
                    <td className="p-4 text-[#1B365D]">{booking.seatCount}</td>
                    <td className="p-4 text-[#1B365D]">
                      {booking.status === "Denied" ? (
                        <button
                          onClick={() => handleShowDenialReasons(booking)}
                          className="text-red-500 hover:text-red-600 underline cursor-pointer"
                        >
                          Denied
                        </button>
                      ) : (
                        <span
                          className={
                            booking.status === "Approved"
                              ? "text-green-500"
                              : booking.status === "Pending"
                              ? "text-yellow-500"
                              : "text-red-500"
                          }
                        >
                          {booking.status}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Denial Reason Modal */}
      {showDenialModal && (
        <div className="fixed inset-0 bg-[#1B365D]/30 backdrop-blur-sm flex justify-center items-center">
          <div className="bg-[#FFFFFF] p-6 rounded-lg w-[400px] shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-[#1B365D]">Denial Reasons</h3>
              <button
                onClick={() => setShowDenialModal(false)}
                className="text-[#1B365D]/70 hover:text-[#1B365D]"
              >
                ✕
              </button>
            </div>
            <div className="text-center">
              <svg
                className="w-12 h-12 mx-auto mb-4 text-red-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 9v2m0 4h.01M12 4a8 8 0 110 16 8 8 0 010-16z"
                />
              </svg>
              <p className="text-[#1B365D] text-lg font-medium">Booking Denied</p>
              <ul className="text-[#6B7280] mt-2 text-left list-disc list-inside">
                {selectedDenialReasons.map((reason, index) => (
                  <li key={index}>{reason}</li>
                ))}
              </ul>
            </div>
            <button
              onClick={() => setShowDenialModal(false)}
              className="w-full mt-6 bg-[#1B365D] text-white py-2 rounded-lg hover:bg-[#1B365D]/90 transition-all duration-200 font-medium shadow-md"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}