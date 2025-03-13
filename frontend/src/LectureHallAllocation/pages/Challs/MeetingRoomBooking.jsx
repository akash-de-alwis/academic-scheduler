import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Calendar, Clock } from "lucide-react";

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
  const navigate = useNavigate();

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
    if (!formData.department) newErrors.department = "Department is required";
    if (!formData.floor) newErrors.floor = "Floor is required";
    if (!formData.meetingRoom) newErrors.meetingRoom = "Meeting Room is required";
    if (!formData.date) newErrors.date = "Date is required";
    if (!formData.startTime) newErrors.startTime = "Start time is required";
    if (!formData.endTime) newErrors.endTime = "End time is required";
    if (!formData.totalCount) newErrors.totalCount = "Total count is required";
    else if (isNaN(formData.totalCount) || formData.totalCount <= 0) {
      newErrors.totalCount = "Total count must be a positive number";
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
    setFormData({ ...formData, [name]: value });

    if (name === "department") {
      const filtered = meetingRooms.filter((room) => room.department === value);
      setAvailableFloors([...new Set(filtered.map((room) => room.floor))]);
      setAvailableRooms(filtered);
      setFormData((prev) => ({
        ...prev,
        floor: "",
        meetingRoom: "",
        seatCount: "",
        totalCount: "",
      }));
    } else if (name === "floor") {
      const filtered = meetingRooms.filter(
        (room) => room.department === formData.department && room.floor === value
      );
      setAvailableRooms(filtered);
      setFormData((prev) => ({
        ...prev,
        meetingRoom: "",
        seatCount: "",
        totalCount: "",
      }));
    }
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

  return (
    <div className="min-h-screen bg-gradient-to-br [#FFFFFF] p-8">
      <div className="max-w-lg mx-auto">
        <h2 className="text-3xl font-bold text-[#1B365D] mb-8 tracking-tight">
          Book a Meeting Room
        </h2>

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-xl shadow-lg p-6 space-y-6 border border-[#E2E8F0]"
        >
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
              Date *
            </label>
            <div className="relative">
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
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
              Start Time *
            </label>
            <div className="relative">
              <input
                type="time"
                name="startTime"
                value={formData.startTime}
                onChange={handleChange}
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
              End Time *
            </label>
            <div className="relative">
              <input
                type="time"
                name="endTime"
                value={formData.endTime}
                onChange={handleChange}
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
    </div>
  );
}