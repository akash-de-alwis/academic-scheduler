import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export default function BookingManagement() {
  const [bookings, setBookings] = useState([]);
  const [issues, setIssues] = useState([]);
  const [showDenialModal, setShowDenialModal] = useState(false);
  const [selectedDenialReasons, setSelectedDenialReasons] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchBookings();
    fetchIssues();
  }, []);

  const fetchBookings = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/bookings");
      setBookings(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchIssues = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/facility-issues");
      setIssues(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleBack = () => {
    navigate("/MeetingRoomBooking");
  };

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
    const totalHours = hours + minutes / 60;
    return totalHours === 1 ? "1 hour" : `${totalHours.toFixed(1)} hours`;
  };

  const hasLowStudentCount = (booking) => {
    const { seatCount, totalCount } = booking;
    if (seatCount === 10 && totalCount < 6) return true;
    if (seatCount === 5 && totalCount < 3) return true;
    return false;
  };

  const getDenialReasons = (booking) => {
    let reasons = [];

    // Check for maintenance issues from facility-issues
    const roomIssues = issues.filter(
      (issue) => issue.roomId === booking.meetingRoom && issue.status === "Pending"
    );
    if (roomIssues.length > 0) {
      const issueDetails = roomIssues.map((issue) =>
        formatIssues(issue.issues, issue.description)
      );
      reasons.push(`Maintenance Issues: ${issueDetails.join("; ")}`);
    }

    // Check for low student count
    if (hasLowStudentCount(booking)) {
      reasons.push("Low Student Count");
    }

    // Fallback if no specific reasons are found
    if (reasons.length === 0) {
      reasons.push("No specific reason provided");
    }

    return reasons;
  };

  const formatIssues = (issueList, description) => {
    if (issueList.includes("Other miscellaneous issues")) {
      const filteredIssues = issueList.filter(
        (issue) => issue !== "Other miscellaneous issues"
      );
      if (description.trim()) {
        filteredIssues.push(description);
      }
      return filteredIssues.join(", ");
    }
    return issueList.join(", ");
  };

  const handleShowDenialReasons = (booking) => {
    const reasons = booking.status === "Denied" ? getDenialReasons(booking) : ["Booking not denied"];
    setSelectedDenialReasons(reasons);
    setShowDenialModal(true);
  };

  return (
    <div className="min-h-screen p-8 bg-[#FFFFFF]">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold text-[#1B365D]">Booking Management</h2>
        <button
          onClick={handleBack}
          className="flex items-center space-x-2 text-[#1B365D] hover:text-[#1B365D]/70"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Booking</span>
        </button>
      </div>

      <div className="bg-[#F5F7FA] rounded-lg">
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
            {bookings.map((booking) => (
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