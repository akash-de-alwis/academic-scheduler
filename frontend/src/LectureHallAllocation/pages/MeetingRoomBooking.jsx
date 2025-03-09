// MeetingRoomBooking.jsx
import { useState, useEffect } from "react";
import axios from "axios";

export default function MeetingRoomBooking() {
  const [meetingRooms, setMeetingRooms] = useState([]);
  const [formData, setFormData] = useState({
    department: "",
    floor: "",
    meetingRoom: "",
    dayType: "Weekday",
    date: "",
    timeDuration: "",
    seatCount: "",
    status: "Pending", // Added status field
  });
  const [errors, setErrors] = useState({});
  const [availableRooms, setAvailableRooms] = useState([]);
  const [availableFloors, setAvailableFloors] = useState([]);

  useEffect(() => {
    axios.get("http://localhost:5000/api/rooms").then((res) => {
      const filteredMeetingRooms = res.data.filter(room => room.hallType === "Meeting Room");
      setMeetingRooms(filteredMeetingRooms);
      setAvailableRooms(filteredMeetingRooms);
      setAvailableFloors([...new Set(filteredMeetingRooms.map(room => room.floor))]);
    });
  }, []);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.department) newErrors.department = "Department is required";
    if (!formData.floor) newErrors.floor = "Floor is required";
    if (!formData.meetingRoom) newErrors.meetingRoom = "Meeting Room is required";
    if (!formData.date) newErrors.date = "Date is required";
    if (!formData.timeDuration) newErrors.timeDuration = "Time duration is required";
    if (!formData.seatCount) newErrors.seatCount = "Seat count is required";
    else if (isNaN(formData.seatCount) || formData.seatCount <= 0) {
      newErrors.seatCount = "Seat count must be a positive number";
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
        timeDuration: "",
        seatCount: "",
        status: "Pending",
      });
      setErrors({});
    } catch (err) {
      console.error(err.response ? err.response.data : err);
      alert("Booking submission failed: " + (err.response?.data?.message || "Unknown error"));
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    if (name === "department") {
      const filtered = meetingRooms.filter(room => room.department === value);
      setAvailableFloors([...new Set(filtered.map(room => room.floor))]);
      setAvailableRooms(filtered);
      setFormData(prev => ({ ...prev, floor: "", meetingRoom: "", seatCount: "" }));
    } else if (name === "floor") {
      const filtered = meetingRooms.filter(room => 
        room.department === formData.department && room.floor === value
      );
      setAvailableRooms(filtered);
      setFormData(prev => ({ ...prev, meetingRoom: "", seatCount: "" }));
    } else if (name === "meetingRoom") {
      const room = meetingRooms.find(room => room.LID === value);
      setFormData(prev => ({ ...prev, seatCount: room?.totalSeats || "" }));
    }
  };

  return (
    <div className="min-h-screen p-8 bg-[#FFFFFF]">
      <h2 className="text-2xl font-bold text-[#1B365D] mb-8">Book a Meeting Room</h2>
      
      <form onSubmit={handleSubmit} className="max-w-md mx-auto space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2 text-[#1B365D]">Department *</label>
          <select
            name="department"
            value={formData.department}
            onChange={handleChange}
            className={`w-full p-2 border rounded-lg ${errors.department ? 'border-red-500' : 'border-[#F5F7FA]'} bg-[#F5F7FA] text-[#1B365D]`}
          >
            <option value="">Select Department</option>
            {[...new Set(meetingRooms.map(room => room.department))].map(dept => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>
          {errors.department && <p className="text-red-500 text-xs mt-1">{errors.department}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium mb-2 text-[#1B365D]">Floor *</label>
          <select
            name="floor"
            value={formData.floor}
            onChange={handleChange}
            className={`w-full p-2 border rounded-lg ${errors.floor ? 'border-red-500' : 'border-[#F5F7FA]'} bg-[#F5F7FA] text-[#1B365D]`}
            disabled={!formData.department}
          >
            <option value="">Select Floor</option>
            {availableFloors.map(floor => (
              <option key={floor} value={floor}>{floor}</option>
            ))}
          </select>
          {errors.floor && <p className="text-red-500 text-xs mt-1">{errors.floor}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium mb-2 text-[#1B365D]">Meeting Room *</label>
          <select
            name="meetingRoom"
            value={formData.meetingRoom}
            onChange={handleChange}
            className={`w-full p-2 border rounded-lg ${errors.meetingRoom ? 'border-red-500' : 'border-[#F5F7FA]'} bg-[#F5F7FA] text-[#1B365D]`}
            disabled={!formData.floor}
          >
            <option value="">Select Meeting Room</option>
            {availableRooms.map(room => (
              <option key={room._id} value={room.LID}>{room.LID}</option>
            ))}
          </select>
          {errors.meetingRoom && <p className="text-red-500 text-xs mt-1">{errors.meetingRoom}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium mb-2 text-[#1B365D]">Day Type *</label>
          <div className="flex gap-6">
            <label className="flex items-center gap-2 text-[#1B365D]">
              <input
                type="radio"
                name="dayType"
                value="Weekday"
                checked={formData.dayType === "Weekday"}
                onChange={handleChange}
                className="w-4 h-4 accent-[#1B365D]"
              />
              Weekday
            </label>
            <label className="flex items-center gap-2 text-[#1B365D]">
              <input
                type="radio"
                name="dayType"
                value="Weekend"
                checked={formData.dayType === "Weekend"}
                onChange={handleChange}
                className="w-4 h-4 accent-[#1B365D]"
              />
              Weekend
            </label>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2 text-[#1B365D]">Date *</label>
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            className={`w-full p-2 border rounded-lg ${errors.date ? 'border-red-500' : 'border-[#F5F7FA]'} bg-[#F5F7FA] text-[#1B365D]`}
          />
          {errors.date && <p className="text-red-500 text-xs mt-1">{errors.date}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium mb-2 text-[#1B365D]">Time Duration *</label>
          <input
            type="time"
            name="timeDuration"
            value={formData.timeDuration}
            onChange={handleChange}
            className={`w-full p-2 border rounded-lg ${errors.timeDuration ? 'border-red-500' : 'border-[#F5F7FA]'} bg-[#F5F7FA] text-[#1B365D]`}
          />
          {errors.timeDuration && <p className="text-red-500 text-xs mt-1">{errors.timeDuration}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium mb-2 text-[#1B365D]">Seat Count *</label>
          <input
            type="number"
            name="seatCount"
            value={formData.seatCount}
            onChange={handleChange}
            className={`w-full p-2 border rounded-lg ${errors.seatCount ? 'border-red-500' : 'border-[#F5F7FA]'} bg-[#F5F7FA] text-[#1B365D]`}
            min="1"
          />
          {errors.seatCount && <p className="text-red-500 text-xs mt-1">{errors.seatCount}</p>}
        </div>

        <button
          type="submit"
          className="w-full bg-[#1B365D] text-[#FFFFFF] py-2 rounded-lg hover:bg-[#1B365D]/90"
        >
          Submit Booking
        </button>
      </form>
    </div>
  );
}