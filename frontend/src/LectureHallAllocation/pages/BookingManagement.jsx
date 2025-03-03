// BookingManagement.jsx
import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export default function BookingManagement() {
  const [bookings, setBookings] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/bookings");
      setBookings(res.data);
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
    if (hours < 0) hours += 24; // Handle overnight bookings

    const totalHours = hours + (minutes / 60);
    return totalHours === 1 ? "1 hour" : `${totalHours.toFixed(1)} hours`;
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
                  <span className={
                    booking.status === "Approved" ? "text-green-500" :
                    booking.status === "Denied" ? "text-red-500" : "text-yellow-500"
                  }>
                    {booking.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}