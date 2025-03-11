import { useState, useEffect } from "react";
import axios from "axios";
import { Search, ChevronDown, Upload, User, BookOpen } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function TimetableList() {
  const [schedules, setSchedules] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState(null);
  const [selectedBatch, setSelectedBatch] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [userType, setUserType] = useState(null);
  const [allocations, setAllocations] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [newSchedule, setNewSchedule] = useState({
    allocationId: "",
    batch: "",
    subjects: [],
  });
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/timetable")
      .then((res) => {
        const updatedSchedules = res.data.map((schedule) => ({
          ...schedule,
          subjects: schedule.subjects.map((sub) => ({
            ...sub,
            duration: sub.duration || "1",
          })),
        }));
        setSchedules(updatedSchedules);
      })
      .catch((err) =>
        console.error("Error fetching timetables:", err.response ? err.response.data : err.message)
      );

    axios
      .get("http://localhost:5000/api/allocations")
      .then((res) => setAllocations(res.data))
      .catch((err) =>
        console.error("Error fetching allocations:", err.response ? err.response.data : err.message)
      );

    axios
      .get("http://localhost:5000/api/rooms")
      .then((res) => setRooms(res.data))
      .catch((err) =>
        console.error("Error fetching rooms:", err.response ? err.response.data : err.message)
      );
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
      resetForm();
      setEditingSchedule(null);
    } catch (err) {
      console.log(err.response ? err.response.data : err);
    }
  };

  const resetForm = () => {
    setNewSchedule({
      allocationId: "",
      batch: selectedBatch,
      subjects: [],
    });
  };

  const handleDeleteSchedule = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/timetable/${id}`);
      setSchedules(schedules.filter((s) => s._id !== id));
    } catch (err) {
      console.log(err.response ? err.response.data : err);
    }
  };

  const handleUploadTimetable = async () => {
    try {
      // Filter schedules for the selected batch
      const batchSchedules = schedules.filter((s) => s.batch === selectedBatch);
      if (batchSchedules.length === 0) {
        alert("No schedules to upload for this batch!");
        return;
      }

      // Validate that all subjects have required fields
      for (const schedule of batchSchedules) {
        for (const subject of schedule.subjects) {
          if (!subject.room || !subject.date || !subject.time) {
            alert("All subjects must have a room, date, and time before uploading.");
            return;
          }
        }
      }

      // Step 1: Upload the timetable
      console.log("Uploading timetable for batch:", selectedBatch);
      const postResponse = await axios.post(
        "http://localhost:5000/api/timetable/published-timetable",
        {
          batch: selectedBatch,
          schedules: batchSchedules,
        }
      );
      console.log("Upload response:", postResponse.data);

      // Verify successful upload
      if (postResponse.status !== 200 && postResponse.status !== 201) {
        throw new Error("Failed to upload timetable: Server returned an error status.");
      }

      // Step 2: Attempt to delete schedules (non-critical step)
      try {
        console.log("Deleting schedules for batch:", selectedBatch);
        const deleteResponse = await axios.delete("http://localhost:5000/api/timetable/batch", {
          data: { batch: selectedBatch },
        });
        console.log("Delete response:", deleteResponse.data);

        if (deleteResponse.status !== 200) {
          console.warn("Delete step returned an unexpected status but upload succeeded.");
        }
      } catch (deleteErr) {
        // Log the delete error but don’t fail the upload
        console.error(
          "Failed to delete schedules after upload:",
          deleteErr.response ? deleteErr.response.data : deleteErr.message
        );
      }

      // Update local state and navigate regardless of delete success
      setSchedules(schedules.filter((s) => s.batch !== selectedBatch));
      setSelectedBatch("");
      alert(`Timetable for ${selectedBatch} uploaded successfully!`);
      navigate("/TimeView", { state: { batch: selectedBatch } });
    } catch (err) {
      // Handle critical errors (e.g., POST failure)
      const errorMessage = err.response
        ? `Server Error: ${err.response.status} - ${JSON.stringify(err.response.data)}`
        : `Client Error: ${err.message}`;
      console.error("Upload timetable error:", errorMessage);
      alert(`Failed to upload timetable: ${errorMessage}. Please check the console for details.`);
    }
  };

  const handleUserTypeSelect = (type) => {
    setUserType(type);
    console.log(`Timetable identified for: ${type}`);
    alert(`Timetable identified for: ${type}`);
  };

  const handleAllocationChange = (e) => {
    const selectedAllocation = allocations.find((a) => a.allocationId === e.target.value);
    if (selectedAllocation) {
      setNewSchedule({
        allocationId: selectedAllocation.allocationId,
        batch: selectedAllocation.batchName,
        subjects: selectedAllocation.subjects.map((sub) => ({
          subjectName: sub.subjectName,
          lecturer: sub.lecturerName,
          room: "",
          date: "",
          time: "",
          duration: "1",
        })),
      });
    } else {
      resetForm();
    }
  };

  const timeSlots = Array.from({ length: 10 }, (_, i) => {
    const hour = i + 8;
    return `${hour.toString().padStart(2, "0")}:00`;
  });

  const weekDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

  const timeToHour = (timeStr) => {
    const [hours] = timeStr.split(":").map(Number);
    return hours;
  };

  const processSchedulesForGrid = () => {
    const grid = {};
    weekDays.forEach((day) => {
      grid[day] = {};
      timeSlots.forEach((timeSlot) => {
        grid[day][timeSlot] = {
          isOccupied: false,
          schedule: null,
          subject: null,
          isStart: false,
          rowSpan: 0,
        };
      });
    });

    const filteredSchedules = selectedBatch
      ? schedules.filter((s) => s.batch === selectedBatch)
      : schedules;

    filteredSchedules.forEach((schedule) => {
      schedule.subjects.forEach((subject) => {
        const scheduleDate = new Date(subject.date);
        const scheduleDay = scheduleDate.getDay();
        const day = weekDays[scheduleDay === 0 ? 6 : scheduleDay - 1];
        const scheduleHour = timeToHour(subject.time);
        const scheduleDuration = parseInt(subject.duration || "1");
        const timeSlot = timeSlots.find((ts) => timeToHour(ts) === scheduleHour);
        if (!timeSlot) return;

        if (grid[day] && grid[day][timeSlot]) {
          grid[day][timeSlot].isOccupied = true;
          grid[day][timeSlot].schedule = schedule;
          grid[day][timeSlot].subject = subject;
          grid[day][timeSlot].isStart = true;
          grid[day][timeSlot].rowSpan = scheduleDuration;

          for (let i = 1; i < scheduleDuration; i++) {
            const nextHour = scheduleHour + i;
            if (nextHour > 17) break;
            const nextTimeSlot = `${nextHour.toString().padStart(2, "0")}:00`;
            if (grid[day][nextTimeSlot]) {
              grid[day][nextTimeSlot].isOccupied = true;
              grid[day][nextTimeSlot].schedule = schedule;
              grid[day][nextTimeSlot].subject = subject;
              grid[day][nextTimeSlot].isStart = false;
            }
          }
        }
      });
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
            <option value="">Select Batch</option>
            {allocations.map((allocation) => (
              <option key={allocation._id} value={allocation.batchName}>
                {allocation.batchName}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        </div>
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-[1200px]">
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
                        {cell.isStart && cell.schedule && cell.subject && (
                          <div className="bg-white rounded-lg p-3 h-full shadow-md border-l-4 border-[#1B365D]">
                            <div className="font-medium text-[#1B365D] mb-1">
                              {cell.subject.subjectName}
                            </div>
                            <div className="text-sm text-gray-600 mb-1">
                              <span className="font-medium">Lecturer:</span> {cell.subject.lecturer}
                            </div>
                            <div className="text-sm text-gray-600 mb-1">
                              <span className="font-medium">Room:</span> {cell.subject.room}
                            </div>
                            <div className="text-sm text-gray-600 mb-1">
                              <span className="font-medium">Batch:</span> {cell.schedule.batch}
                            </div>
                            <div className="text-sm text-gray-600 mb-2">
                              <span className="font-medium">Duration:</span> {cell.subject.duration} hr(s)
                            </div>
                            <div className="flex gap-2 mt-1 justify-end">
                              <button
                                onClick={() => {
                                  setNewSchedule(cell.schedule);
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
          <div className="bg-white p-6 rounded-lg w-[600px] max-h-[80vh] flex flex-col overflow-y-auto">
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

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-[#1B365D]">Batch</label>
                <input
                  type="text"
                  value={newSchedule.batch}
                  readOnly
                  className="w-full p-2 border border-[#F5F7FA] rounded-lg bg-[#F5F7FA] text-[#1B365D]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-[#1B365D]">Allocation ID</label>
                <select
                  value={newSchedule.allocationId}
                  onChange={handleAllocationChange}
                  className="w-full p-2 border border-[#F5F7FA] rounded-lg bg-[#F5F7FA] text-[#1B365D]"
                >
                  <option value="">Select Allocation</option>
                  {allocations
                    .filter((a) => a.batchName === selectedBatch)
                    .map((allocation) => (
                      <option key={allocation._id} value={allocation.allocationId}>
                        {allocation.allocationId}
                      </option>
                    ))}
                </select>
              </div>

              {newSchedule.subjects.map((subject, index) => (
                <div key={index} className="border p-4 rounded-lg">
                  <h4 className="text-sm font-medium mb-2 text-[#1B365D]">{subject.subjectName}</h4>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-[#1B365D]">Lecturer</label>
                    <input
                      type="text"
                      value={subject.lecturer}
                      readOnly
                      className="w-full p-2 border border-[#F5F7FA] rounded-lg bg-[#F5F7FA] text-[#1B365D]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-[#1B365D]">Room</label>
                    <select
                      value={subject.room}
                      onChange={(e) =>
                        setNewSchedule((prev) => {
                          const updatedSubjects = [...prev.subjects];
                          updatedSubjects[index].room = e.target.value;
                          return { ...prev, subjects: updatedSubjects };
                        })
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
                    <label className="block text-sm font-medium mb-2 text-[#1B365D]">Date</label>
                    <input
                      type="date"
                      value={subject.date}
                      onChange={(e) =>
                        setNewSchedule((prev) => {
                          const updatedSubjects = [...prev.subjects];
                          updatedSubjects[index].date = e.target.value;
                          return { ...prev, subjects: updatedSubjects };
                        })
                      }
                      className="w-full p-2 border border-[#F5F7FA] rounded-lg bg-[#F5F7FA] text-[#1B365D]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-[#1B365D]">Time</label>
                    <input
                      type="time"
                      value={subject.time}
                      onChange={(e) =>
                        setNewSchedule((prev) => {
                          const updatedSubjects = [...prev.subjects];
                          updatedSubjects[index].time = e.target.value;
                          return { ...prev, subjects: updatedSubjects };
                        })
                      }
                      className="w-full p-2 border border-[#F5F7FA] rounded-lg bg-[#F5F7FA] text-[#1B365D]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-[#1B365D]">Duration (hours)</label>
                    <select
                      value={subject.duration}
                      onChange={(e) =>
                        setNewSchedule((prev) => {
                          const updatedSubjects = [...prev.subjects];
                          updatedSubjects[index].duration = e.target.value;
                          return { ...prev, subjects: updatedSubjects };
                        })
                      }
                      className="w-full p-2 border border-[#F5F7FA] rounded-lg bg-[#F5F7FA] text-[#1B365D]"
                    >
                      <option value="1">1 hour</option>
                      <option value="2">2 hours</option>
                      <option value="3">3 hours</option>
                      <option value="4">4 hours</option>
                    </select>
                  </div>
                </div>
              ))}
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