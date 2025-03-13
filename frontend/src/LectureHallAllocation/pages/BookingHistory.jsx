import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function BookingHistory() {
  const [bookings, setBookings] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchBookingHistory();
  }, []);

  const fetchBookingHistory = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/bookings");
      // Filter for past bookings (Approved or Denied)
      const pastBookings = res.data.filter(
        (booking) => booking.status === "Approved" || booking.status === "Denied"
      );
      setBookings(pastBookings);
    } catch (err) {
      console.error(err);
    }
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
    const totalHours = hours + (minutes / 60);
    return totalHours === 1 ? "1 hour" : `${totalHours.toFixed(1)} hours`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br [#FFFFFF] p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-[#1B365D] tracking-tight">
            Booking History <span className="text-gray-400 text-xl font-normal">(Past Bookings)</span>
          </h2>
          <button
            onClick={() => navigate("/BookingReview")}
            className="px-4 py-2 bg-[#1B365D] text-white rounded-full hover:bg-[#1B365D]/90 transition-all duration-200 font-medium shadow-md"
          >
            Back to Review
          </button>
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
                <th className="p-5 font-semibold text-sm uppercase tracking-wide">Status</th>
              </tr>
            </thead>
            <tbody>
              {bookings.length > 0 ? (
                bookings.map((booking) => (
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
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium shadow-sm ${
                          booking.status === "Approved"
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {booking.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="p-5 text-center text-gray-500 font-medium">
                    No past bookings found
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