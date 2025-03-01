// BookingManagement.jsx
import { useState, useEffect } from "react";
import axios from "axios";

export default function BookingManagement() {
  const [bookings, setBookings] = useState([]);

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

  return (
    <div className="min-h-screen p-8 bg-[#FFFFFF]">
      <h2 className="text-2xl font-bold text-[#1B365D] mb-8">Booking Management</h2>
      
      <div className="bg-[#F5F7FA] rounded-lg">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#FFFFFF]">
              <th className="text-left p-4 font-medium text-[#1B365D]">Department</th>
              <th className="text-left p-4 font-medium text-[#1B365D]">Floor</th>
              <th className="text-left p-4 font-medium text-[#1B365D]">Room ID</th>
              <th className="text-left p-4 font-medium text-[#1B365D]">Day Type</th>
              <th className="text-left p-4 font-medium text-[#1B365D]">Date</th>
              <th className="text-left p-4 font-medium text-[#1B365D]">Time</th>
              <th className="text-left p-4 font-medium text-[#1B365D]">Seats</th>
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
                <td className="p-4 text-[#1B365D]">{booking.timeDuration}</td>
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