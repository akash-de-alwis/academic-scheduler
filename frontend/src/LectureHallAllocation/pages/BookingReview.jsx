import { useState, useEffect } from "react";
import axios from "axios";
import { AlertTriangle } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function BookingReview() {
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [expandedIssues, setExpandedIssues] = useState({});
  const [expandedWarnings, setExpandedWarnings] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("All");
  const navigate = useNavigate();

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/bookings?status=Pending");
      setBookings(res.data);
      setFilteredBookings(applyFilters(res.data, searchTerm, departmentFilter));
    } catch (err) {
      console.error(err);
    }
  };

  const applyFilters = (bookingsList, search, dept) => {
    let filtered = [...bookingsList];
    
    if (dept !== "All") {
      filtered = filtered.filter(booking => booking.department === dept);
    }

    if (search) {
      filtered = filtered.filter((booking) =>
        booking.department.toLowerCase().includes(search.toLowerCase()) ||
        booking.meetingRoom.toLowerCase().includes(search.toLowerCase()) ||
        booking.dayType.toLowerCase().includes(search.toLowerCase())
      );
    }

    return filtered;
  };

  const handleSearch = (term) => {
    const filtered = applyFilters(bookings, term, departmentFilter);
    setFilteredBookings(filtered);
    setSearchTerm(term);
  };

  const handleFilterChange = (dept) => {
    setDepartmentFilter(dept);
    const filtered = applyFilters(bookings, searchTerm, dept);
    setFilteredBookings(filtered);
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      let updateData = { status: newStatus };
      const booking = bookings.find((b) => b._id === id);

      if (newStatus === "Denied") {
        let denialReason = [];
        if (hasIssue(booking)) {
          denialReason.push("Maintenance Issues");
        }
        if (hasLowStudentCount(booking)) {
          denialReason.push("Low Student Count");
        }
        updateData.denialReason = denialReason.length > 0 ? denialReason : ["No specific reason"];
      }

      await axios.put(`http://localhost:5000/api/bookings/${id}`, updateData);
      fetchBookings();
      alert(`Booking ${newStatus.toLowerCase()} successfully!`);
    } catch (err) {
      console.error(err);
      alert("Failed to update booking status");
    }
  };

  const toggleIssueDetails = (bookingId) => {
    setExpandedIssues((prev) => ({
      ...prev,
      [bookingId]: !prev[bookingId],
    }));
  };

  const toggleWarningDetails = (bookingId) => {
    setExpandedWarnings((prev) => ({
      ...prev,
      [bookingId]: !prev[bookingId],
    }));
  };

  const formatTimeDuration = (startTime, endTime) => {
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

  const hasIssue = (booking) => {
    return booking.issues && booking.issues.length > 0;
  };

  const hasLowStudentCount = (booking) => {
    const { seatCount, totalCount } = booking;
    if (seatCount === 10 && totalCount < 6) return true;
    if (seatCount === 5 && totalCount < 3) return true;
    return false;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br [#FFFFFF] p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-[#1B365D] tracking-tight">
            Booking Review <span className="text-gray-400 text-xl font-normal">(Under Review)</span>
          </h2>
          <button
            onClick={() => navigate("/BookingHistory")}
            className="bg-[#1B365D] text-[#FFFFFF] px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-[#1B365D]/90"
          >
            View Booking History
          </button>
        </div>

        <div className="flex justify-between gap-4 mb-8">
          <input
            type="text"
            placeholder="Search bookings..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            className="flex-1 px-4 py-2 border border-[#F5F7FA] rounded-lg bg-[#F5F7FA] text-[#1B365D]"
          />
          <select
            value={departmentFilter}
            onChange={(e) => handleFilterChange(e.target.value)}
            className="p-2 border border-[#F5F7FA] rounded-lg bg-[#F5F7FA] text-[#1B365D]"
          >
            <option value="All">All Departments</option>
            <option value="Computer Faculty">Computer Faculty</option>
            <option value="Engineer Faculty">Engineer Faculty</option>
            <option value="Business Faculty">Business Faculty</option>
          </select>
        </div>

        <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-[#E2E8F0]">
          <table className="w-full text-left">
            <thead className="bg-[#F8FAFC] text-[#1B365D]">
              <tr className="border-b border-[#E2E8F0]">
                <th className="p-5 font-semibold text-sm uppercase tracking-wide">Department</th>
                <th className="p-5 font-semibold text-sm uppercase tracking-wide">Floor</th>
                <th className="p-5 font-semibold text-sm uppercase tracking-wide">Room ID</th>
                <th className="p-5 font-semibold text-sm uppercase tracking-wide">Day Type</th>
                <th className="p-5 font-semibold text-sm uppercase tracking-wide">Date</th>
                <th className="p-5 font-semibold text-sm uppercase tracking-wide">Time</th>
                <th className="p-5 font-semibold text-sm uppercase tracking-wide">Seats</th>
                <th className="p-5 font-semibold text-sm uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredBookings.length > 0 ? (
                filteredBookings.map((booking) => (
                  <tr
                    key={booking._id}
                    className="border-b border-[#E2E8F0] hover:bg-[#F8FAFC] transition-all duration-200 ease-in-out"
                  >
                    <td className="p-5 text-[#1B365D] font-medium">{booking.department}</td>
                    <td className="p-5 text-[#1B365D] font-medium">{booking.floor}</td>
                    <td className="p-5 text-[#1B365D] font-medium">{booking.meetingRoom}</td>
                    <td className="p-5 text-[#1B365D] font-medium">{booking.dayType}</td>
                    <td className="p-5 text-[#1B365D] font-medium">{new Date(booking.date).toLocaleDateString()}</td>
                    <td className="p-5 text-[#1B365D] font-medium">{formatTimeDuration(booking.startTime, booking.endTime)}</td>
                    <td className="p-5 text-[#1B365D] font-medium">{booking.totalCount}/{booking.seatCount}</td>
                    <td className="p-5">
                      <div className="flex flex-col gap-3">
                        <div className="flex items-center gap-4">
                          <button
                            onClick={() => handleStatusChange(booking._id, "Approved")}
                            className="relative px-3 py-1 bg-green-100 text-green-700 rounded-full hover:bg-green-200 hover:text-green-800 transition-all duration-200 font-medium text-sm shadow-sm"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleStatusChange(booking._id, "Denied")}
                            className="relative px-3 py-1 bg-red-100 text-red-700 rounded-full hover:bg-red-200 hover:text-red-800 transition-all duration-200 font-medium text-sm shadow-sm"
                          >
                            Deny
                          </button>
                          {hasIssue(booking) && (
                            <button
                              onClick={() => toggleIssueDetails(booking._id)}
                              className="w-3 h-3 bg-red-500 rounded-full animate-pulse hover:bg-red-600 transition-all duration-200"
                              title="View Issues"
                            />
                          )}
                          {hasLowStudentCount(booking) && (
                            <button
                              onClick={() => toggleWarningDetails(booking._id)}
                              className="text-yellow-600 hover:text-yellow-700 transition-all duration-200"
                              title="Low Student Count Warning"
                            >
                              <AlertTriangle className="w-5 h-5" />
                            </button>
                          )}
                        </div>
                        {hasIssue(booking) && expandedIssues[booking._id] && (
                          <div className="text-sm text-gray-700 bg-red-50 p-2 rounded-md shadow-inner max-w-xs">
                            {booking.issues.map((issue, index) => (
                              <p key={index} className="truncate">
                                {issue.issues.join(", ")}
                                {issue.description && ` - ${issue.description}`}
                              </p>
                            ))}
                          </div>
                        )}
                        {hasLowStudentCount(booking) && expandedWarnings[booking._id] && (
                          <div className="text-sm text-yellow-700 bg-yellow-50 p-2 rounded-md shadow-inner">
                            Student count is low
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="p-5 text-center text-gray-500 font-medium">
                    No pending bookings found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}