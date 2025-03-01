import { useState, useEffect } from "react";
import axios from "axios";
import { Search, ChevronDown, Upload, User, BookOpen } from "lucide-react";

export default function TimetableList() {
  const [schedules, setSchedules] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState(null);
  const [selectedBatch, setSelectedBatch] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [userType, setUserType] = useState(null);
  const [allocations, setAllocations] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [newSchedule, setNewSchedule] = useState({
    allocationId: "",
    subject: "",
    date: "",
    time: "",
    duration: "1",
    room: "",
    lecturer: "",
    batch: "",
  });

  useEffect(() => {
    axios.get("http://localhost:5000/api/timetable").then((res) => {
      const updatedSchedules = res.data.map((schedule) => ({
        ...schedule,
        duration: schedule.duration || "1",
      }));
      setSchedules(updatedSchedules);
    });
    axios.get("http://localhost:5000/api/allocations").then((res) => setAllocations(res.data));
    axios.get("http://localhost:5000/api/rooms").then((res) => setRooms(res.data));
  }, []);

  const handleSaveSchedule = async () => {
    try {
      if (editingSchedule) {
        const res = await axios.put(
          `http://localhost:5000/api/timetable/${editingSchedule._id}`,
          newSchedule
        );
        setSchedules((prev) =>
          prev.map((s) => (s._id === editingSchedule._id ? res.data : s))
        );
      } else {
        const res = await axios.post("http://localhost:5000/api/timetable", newSchedule);
        setSchedules((prev) => [...prev, res.data]);
      }
      setShowForm(false);
      setNewSchedule({
        allocationId: "",
        subject: "",
        date: "",
        time: "",
        duration: "1",
        room: "",
        lecturer: "",
        batch: "",
      });
      setEditingSchedule(null);
    } catch (err) {
      console.log(err.response ? err.response.data : err);
    }
  };

  const handleDeleteSchedule = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/timetable/${id}`);
      setSchedules(schedules.filter((s) => s._id !== id));
    } catch (err) {
      console.log(err.response ? err.response.data : err);
    }
  };

  const handleUploadTimetable = () => {
    console.log("Upload timetable functionality");
    alert("Timetable ready to be uploaded!");
  };

  const handleUserTypeSelect = (type) => {
    setUserType(type);
    console.log(`Timetable identified for: ${type}`);
    alert(`Timetable identified for: ${type}`);
  };

  const handleAllocationChange = (e) => {
    const selectedAllocation = allocations.find(
      (a) => a.allocationId === e.target.value
    );
    if (selectedAllocation) {
      setNewSchedule({
        ...newSchedule,
        allocationId: selectedAllocation.allocationId,
        subject: selectedAllocation.subjectName,
        lecturer: selectedAllocation.lecturerName,
        batch: selectedAllocation.batchName,
      });
    } else {
      setNewSchedule({
        ...newSchedule,
        allocationId: "",
        subject: "",
        lecturer: "",
        batch: "",
      });
    }
  };

  const timeSlots = Array.from({ length: 10 }, (_, i) => {
    const hour = i + 8;
    return `${hour.toString().padStart(2, "0")}:00`;
  });

  // Updated to include Saturday and Sunday
  const weekDays = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];

  const timeToHour = (timeStr) => {
    const [hours] = timeStr.split(":").map(Number);
    return hours;
  };

  const processSchedulesForGrid = () => {
    const grid = {};
    weekDays.forEach((day) => {
      const dayIndex = weekDays.indexOf(day) + 1; // Monday=1, ..., Sunday=7
      grid[day] = {};
      timeSlots.forEach((timeSlot) => {
        grid[day][timeSlot] = {
          isOccupied: false,
          schedule: null,
          isStart: false,
          rowSpan: 0,
        };
      });
    });

    schedules.forEach((schedule) => {
      const scheduleDate = new Date(schedule.date);
      const scheduleDay = scheduleDate.getDay(); // 0=Sunday, 1=Monday, ..., 6=Saturday
      // Map getDay() values to weekDays array indices (Sunday=6, Monday=0, ..., Saturday=5)
      const day = weekDays[scheduleDay === 0 ? 6 : scheduleDay - 1]; // Adjust for Sunday (0 -> 6)
      const scheduleHour = timeToHour(schedule.time);
      const scheduleDuration = parseInt(schedule.duration || "1");
      const timeSlot = timeSlots.find((ts) => timeToHour(ts) === scheduleHour);
      if (!timeSlot) return;

      if (grid[day] && grid[day][timeSlot]) {
        grid[day][timeSlot].isOccupied = true;
        grid[day][timeSlot].schedule = schedule;
        grid[day][timeSlot].isStart = true;
        grid[day][timeSlot].rowSpan = scheduleDuration;

        for (let i = 1; i < scheduleDuration; i++) {
          const nextHour = scheduleHour + i;
          if (nextHour > 17) break; // Still limits to 5 PM
          const nextTimeSlot = `${nextHour.toString().padStart(2, "0")}:00`;
          if (grid[day][nextTimeSlot]) {
            grid[day][nextTimeSlot].isOccupied = true;
            grid[day][nextTimeSlot].schedule = schedule;
            grid[day][nextTimeSlot].isStart = false;
          }
        }
      }
    });
    return grid;
  };

  const grid = processSchedulesForGrid();

  return (
    <div className="min-h-screen p-8 bg-white">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold text-[#1B365D]">Timetable Management</h2>
        <div className="flex space-x-3">
          <button
            onClick={() => handleUserTypeSelect("student")}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
              userType === "student"
                ? "bg-[#1B365D] text-white"
                : "bg-[#F5F7FA] text-[#1B365D] hover:bg-[#1B365D]/10"
            }`}
          >
            <BookOpen className="w-4 h-4" />
            Student
          </button>
          <button
            onClick={() => handleUserTypeSelect("lecturer")}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
              userType === "lecturer"
                ? "bg-[#1B365D] text-white"
                : "bg-[#F5F7FA] text-[#1B365D] hover:bg-[#1B365D]/10"
            }`}
          >
            <User className="w-4 h-4" />
            Lecturer
          </button>
          <button
            onClick={() => {
              setShowForm(true);
              setEditingSchedule(null);
            }}
            className="bg-[#1B365D] text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-[#1B365D]/90"
          >
            + Add New Schedule
          </button>
        </div>
      </div>

      <div className="flex justify-between gap-4 mb-8">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-600 w-5 h-5" />
          <input
            type="text"
            placeholder="Search schedules..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-[#F5F7FA] rounded-lg bg-[#F5F7FA] text-[#1B365D]"
          />
        </div>
        <div className="relative">
          <select
            value={selectedBatch}
            onChange={(e) => setSelectedBatch(e.target.value)}
            className="appearance-none px-4 py-2 pr-8 bg-[#F5F7FA] border border-[#F5F7FA] rounded-lg text-[#1B365D]"
          >
            <option value="All">All Batches</option>
            <option value="2023">Batch 2023</option>
            <option value="2024">Batch 2024</option>
          </select>
          <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        </div>
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-[1200px]"> {/* Increased min width to accommodate extra days */}
          <table className="w-full border-collapse bg-[#F5F7FA] rounded-lg border-2 border-gray-300">
            <thead>
              <tr>
                <th className="p-4 font-medium text-[#1B365D] border-b-2 border-r-2 border-gray-300 text-left">
                  Time
                </th>
                {weekDays.map((day, index) => (
                  <th
                    key={day}
                    className={`p-4 font-medium text-[#1B365D] text-center border-b-2 ${
                      index < weekDays.length - 1 ? "border-r-2" : ""
                    } border-gray-300`}
                  >
                    {day}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {timeSlots.map((time, timeIndex) => (
                <tr key={`time-${time}`}>
                  <td
                    className={`p-4 text-[#1B365D] border-r-2 ${
                      timeIndex < timeSlots.length - 1 ? "border-b-2" : ""
                    } border-gray-300`}
                  >
                    {time}
                  </td>
                  {weekDays.map((day, dayIndex) => {
                    const cell = grid[day][time];
                    if (cell.isOccupied && !cell.isStart) return null;
                    return (
                      <td
                        key={`${day}-${time}`}
                        className={`p-2 ${
                          dayIndex < weekDays.length - 1 ? "border-r-2" : ""
                        } ${
                          timeIndex < timeSlots.length - 1 ? "border-b-2" : ""
                        } border-gray-300 align-top`}
                        rowSpan={cell.isStart ? cell.rowSpan : 1}
                      >
                        {cell.isStart && cell.schedule && (
                          <div className="bg-white rounded-lg p-3 h-full shadow-md border-l-4 border-[#1B365D]">
                            <div className="font-medium text-[#1B365D] mb-1">
                              {cell.schedule.subject}
                            </div>
                            <div className="text-sm text-gray-600 mb-1">
                              <span className="font-medium">Lecturer:</span>{" "}
                              {cell.schedule.lecturer}
                            </div>
                            <div className="text-sm text-gray-600 mb-1">
                              <span className="font-medium">Room:</span>{" "}
                              {cell.schedule.room}
                            </div>
                            <div className="text-sm text-gray-600 mb-1">
                              <span className="font-medium">Batch:</span>{" "}
                              {cell.schedule.batch}
                            </div>
                            <div className="text-sm text-gray-600 mb-2">
                              <span className="font-medium">Duration:</span>{" "}
                              {cell.schedule.duration} hr(s)
                            </div>
                            <div className="flex gap-2 mt-1 justify-end">
                              <button
                                onClick={() => {
                                  setNewSchedule({
                                    ...cell.schedule,
                                    duration: cell.schedule.duration || "1",
                                  });
                                  setEditingSchedule(cell.schedule);
                                  setShowForm(true);
                                }}
                                className="text-[#1B365D] hover:text-[#1B365D]/70 bg-gray-100 p-1 rounded"
                              >
                                <svg
                                  className="w-4 h-4"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                >
                                  <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                                  <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                                </svg>
                              </button>
                              <button
                                onClick={() => handleDeleteSchedule(cell.schedule._id)}
                                className="text-red-500 hover:text-red-600 bg-gray-100 p-1 rounded"
                              >
                                <svg
                                  className="w-4 h-4"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                >
                                  <path d="M3 6h18" />
                                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                </svg>
                              </button>
                            </div>
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex justify-end mt-6">
        <button
          onClick={handleUploadTimetable}
          className="bg-[#1B365D] text-white px-6 py-2 rounded-lg flex items-center gap-2 hover:bg-[#1B365D]/90"
        >
          <Upload className="w-5 h-5" />
          Upload Timetable
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-[#1B365D]/30 backdrop-blur-sm flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg w-[480px] max-h-[80vh] flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-[#1B365D]">
                {editingSchedule ? "Edit Schedule" : "Add New Schedule"}
              </h3>
              <button
                onClick={() => setShowForm(false)}
                className="text-[#1B365D]/70 hover:text-[#1B365D]"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 overflow-y-auto flex-1">
              <div>
                <label className="block text-sm font-medium mb-2 text-[#1B365D]">
                  Allocation ID
                </label>
                <select
                  value={newSchedule.allocationId}
                  onChange={handleAllocationChange}
                  className="w-full p-2 border border-[#F5F7FA] rounded-lg bg-[#F5F7FA] text-[#1B365D]"
                >
                  <option value="">Select Allocation</option>
                  {allocations.map((allocation) => (
                    <option key={allocation._id} value={allocation.allocationId}>
                      {allocation.allocationId}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-[#1B365D]">
                  Subject
                </label>
                <input
                  type="text"
                  value={newSchedule.subject}
                  onChange={(e) =>
                    setNewSchedule({ ...newSchedule, subject: e.target.value })
                  }
                  className="w-full p-2 border border-[#F5F7FA] rounded-lg bg-[#F5F7FA] text-[#1B365D]"
                  readOnly={!!newSchedule.allocationId}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-[#1B365D]">
                  Date
                </label>
                <input
                  type="date"
                  value={newSchedule.date}
                  onChange={(e) =>
                    setNewSchedule({ ...newSchedule, date: e.target.value })
                  }
                  className="w-full p-2 border border-[#F5F7FA] rounded-lg bg-[#F5F7FA] text-[#1B365D]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-[#1B365D]">
                  Time
                </label>
                <input
                  type="time"
                  value={newSchedule.time}
                  onChange={(e) =>
                    setNewSchedule({ ...newSchedule, time: e.target.value })
                  }
                  className="w-full p-2 border border-[#F5F7FA] rounded-lg bg-[#F5F7FA] text-[#1B365D]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-[#1B365D]">
                  Duration (hours)
                </label>
                <select
                  value={newSchedule.duration}
                  onChange={(e) =>
                    setNewSchedule({ ...newSchedule, duration: e.target.value })
                  }
                  className="w-full p-2 border border-[#F5F7FA] rounded-lg bg-[#F5F7FA] text-[#1B365D]"
                >
                  <option value="1">1 hour</option>
                  <option value="2">2 hours</option>
                  <option value="3">3 hours</option>
                  <option value="4">4 hours</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-[#1B365D]">
                  Room
                </label>
                <select
                  value={newSchedule.room}
                  onChange={(e) =>
                    setNewSchedule({ ...newSchedule, room: e.target.value })
                  }
                  className="w-full p-2 border border-[#F5F7FA] rounded-lg bg-[#F5F7FA] text-[#1B365D]"
                >
                  <option value="">Select Room</option>
                  {rooms.map((room) => (
                    <option key={room._id} value={room.LID}>
                      {room.LID} ({room.hallType})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-[#1B365D]">
                  Lecturer
                </label>
                <input
                  type="text"
                  value={newSchedule.lecturer}
                  onChange={(e) =>
                    setNewSchedule({ ...newSchedule, lecturer: e.target.value })
                  }
                  className="w-full p-2 border border-[#F5F7FA] rounded-lg bg-[#F5F7FA] text-[#1B365D]"
                  readOnly={!!newSchedule.allocationId}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-[#1B365D]">
                  Batch
                </label>
                <input
                  type="text"
                  value={newSchedule.batch}
                  onChange={(e) =>
                    setNewSchedule({ ...newSchedule, batch: e.target.value })
                  }
                  className="w-full p-2 border border-[#F5F7FA] rounded-lg bg-[#F5F7FA] text-[#1B365D]"
                  readOnly={!!newSchedule.allocationId}
                />
              </div>
            </div>

            <button
              onClick={handleSaveSchedule}
              className="w-full mt-6 bg-[#1B365D] text-white py-2 rounded-lg hover:bg-[#1B365D]/90"
            >
              {editingSchedule ? "Save Changes" : "Create Schedule"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}