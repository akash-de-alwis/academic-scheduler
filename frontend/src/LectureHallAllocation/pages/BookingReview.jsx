// BookingReview.jsx
import { useState, useEffect } from "react";
import axios from "axios";

export default function BookingReview() {
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/bookings?status=Pending");
      setBookings(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await axios.put(`http://localhost:5000/api/bookings/${id}`, { status: newStatus });
      fetchBookings(); // Refresh the list
      alert(`Booking ${newStatus.toLowerCase()} successfully!`);
    } catch (err) {
      console.error(err);
      alert("Failed to update booking status");
    }
  };

  return (
    <div className="min-h-screen p-8 bg-[#FFFFFF]">
      <h2 className="text-2xl font-bold text-[#1B365D] mb-8">Booking Review (Under Review)</h2>
      
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
              <th className="text-left p-4 font-medium text-[#1B365D]">Actions</th>
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
                <td className="p-4">
                  <div className="flex gap-4">
                    <button
                      onClick={() => handleStatusChange(booking._id, "Approved")}
                      className="text-green-500 hover:text-green-600"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleStatusChange(booking._id, "Denied")}
                      className="text-red-500 hover:text-red-600"
                    >
                      Deny
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}