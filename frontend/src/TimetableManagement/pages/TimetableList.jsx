import { useState, useEffect } from "react";
import axios from "axios";
import { Search, ChevronDown, User, RefreshCw } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

export default function TimetableList() {
  const [schedules, setSchedules] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState(null);
  const [editingSubjectIndex, setEditingSubjectIndex] = useState(null);
  const [selectedBatch, setSelectedBatch] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [allocations, setAllocations] = useState([]);
  const [batches, setBatches] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [newSchedule, setNewSchedule] = useState({
    allocationId: "",
    batch: "",
    subjects: [],
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const fetchData = async () => {
    setLoading(true);
    try {
      const [timetableRes, allocationsRes, batchesRes, roomsRes] = await Promise.all([
        axios.get("http://localhost:5000/api/timetable"),
        axios.get("http://localhost:5000/api/allocations"),
        axios.get("http://localhost:5000/api/batches"),
        axios.get("http://localhost:5000/api/rooms"),
      ]);

      const updatedSchedules = timetableRes.data.map((schedule) => ({
        ...schedule,
        subjects: schedule.subjects.map((sub) => ({
          ...sub,
          duration: sub.duration || "1",
        })),
      }));
      setSchedules(updatedSchedules);
      setAllocations(allocationsRes.data);
      setBatches(batchesRes.data);
      setRooms(roomsRes.data.filter((room) => room.hallType !== "Meeting Room"));
    } catch (err) {
      console.error("Error fetching data:", err.response ? err.response.data : err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const validateForm = () => {
    const newErrors = {};
    if (!editingSchedule && !newSchedule.allocationId) newErrors.allocationId = "Allocation ID is required";

    const selectedBatchData = batches.find((b) => b.batchName === newSchedule.batch);
    const isWeekendBatch = selectedBatchData?.scheduleType === "Weekend";
    const isWeekdaysBatch = selectedBatchData?.scheduleType === "Weekdays";

    newSchedule.subjects.forEach((subject, index) => {
      const subjectErrors = {};
      if (!subject.room) subjectErrors.room = "Room is required";
      if (!subject.date) {
        subjectErrors.date = "Date is required";
      } else {
        const selectedDate = new Date(subject.date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (selectedDate < today) subjectErrors.date = "Date cannot be in the past";
        else if (isWeekendBatch && ![0, 6].includes(selectedDate.getDay()))
          subjectErrors.date = "Weekend batches can only be scheduled on Saturday or Sunday";
        else if (isWeekdaysBatch && ![1, 2, 3, 4, 5].includes(selectedDate.getDay()))
          subjectErrors.date = "Weekdays batches can only be scheduled on Monday to Friday";
      }

      if (!subject.time) {
        subjectErrors.time = "Time is required";
      } else {
        const [hours] = subject.time.split(":").map(Number);
        if (hours < 8 || hours > 17) subjectErrors.time = "Time must be between 08:00 and 17:00";
      }

      if (!subject.duration) {
        subjectErrors.duration = "Duration is required";
      } else if (isNaN(subject.duration) || subject.duration < 1 || subject.duration > 4) {
        subjectErrors.duration = "Duration must be between 1 and 4 hours";
      }

      if (subject.room && subject.date && subject.time && subject.duration) {
        const startTime = new Date(`${subject.date}T${subject.time}:00`);
        const endTime = new Date(startTime);
        endTime.setHours(endTime.getHours() + parseInt(subject.duration));
        schedules.forEach((existingSchedule) => {
          if (editingSchedule && existingSchedule._id === editingSchedule._id) return;
          existingSchedule.subjects.forEach((existingSubject) => {
            const existingStartTime = new Date(`${existingSubject.date}T${existingSubject.time}:00`);
            const existingEndTime = new Date(existingStartTime);
            existingEndTime.setHours(existingEndTime.getHours() + parseInt(existingSubject.duration));
            if (
              existingSubject.room === subject.room &&
              startTime < existingEndTime &&
              endTime > existingStartTime
            ) {
              subjectErrors.room = `Room ${subject.room} is booked from ${existingSubject.time} to ${existingEndTime.toTimeString().slice(0, 5)} on ${existingSubject.date}`;
            }
          });
        });
      }

      if (Object.keys(subjectErrors).length > 0) newErrors[`subject${index}`] = subjectErrors;
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveSchedule = async () => {
    if (!validateForm()) return;
    setLoading(true);
    try {
      if (editingSchedule) {
        const updatedSubjects = editingSubjectIndex !== null
          ? editingSchedule.subjects.map((sub, idx) => (idx === editingSubjectIndex ? newSchedule.subjects[0] : sub))
          : newSchedule.subjects;
        const res = await axios.put(`http://localhost:5000/api/timetable/${editingSchedule._id}`, {
          ...newSchedule,
          subjects: updatedSubjects,
        });
        setSchedules((prev) => prev.map((s) => (s._id === editingSchedule._id ? res.data : s)));
      } else {
        const res = await axios.post("http://localhost:5000/api/timetable", newSchedule);
        setSchedules((prev) => [...prev, res.data]);
      }
      setShowForm(false);
      resetForm();
      setEditingSchedule(null);
      setEditingSubjectIndex(null);
    } catch (err) {
      console.error(err.response ? err.response.data : err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSubject = async (scheduleId, subjectIndex) => {
    const schedule = schedules.find((s) => s._id === scheduleId);
    const updatedSubjects = schedule.subjects.filter((_, idx) => idx !== subjectIndex);
    try {
      if (updatedSubjects.length === 0) {
        await axios.delete(`http://localhost:5000/api/timetable/${scheduleId}`);
        setSchedules(schedules.filter((s) => s._id !== scheduleId));
      } else {
        const res = await axios.put(`http://localhost:5000/api/timetable/${scheduleId}`, {
          ...schedule,
          subjects: updatedSubjects,
        });
        setSchedules((prev) => prev.map((s) => (s._id === scheduleId ? res.data : s)));
      }
    } catch (err) {
      console.error(err.response ? err.response.data : err);
    }
  };

  const resetForm = () => {
    setNewSchedule({ allocationId: "", batch: selectedBatch, subjects: [] });
    setEditingSubjectIndex(null);
    setErrors({});
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
      setErrors({});
    } else {
      resetForm();
    }
  };

  const timeSlots = Array.from({ length: 10 }, (_, i) => `${(i + 8).toString().padStart(2, "0")}:00`);
  const weekDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  const timeToHour = (timeStr) => parseInt(timeStr.split(":")[0], 10);

  const processSchedulesForGrid = () => {
    const grid = {};
    weekDays.forEach((day) => {
      grid[day] = {};
      timeSlots.forEach((timeSlot) => {
        grid[day][timeSlot] = { isOccupied: false, schedule: null, subject: null, isStart: false, rowSpan: 0 };
      });
    });

    let filteredSchedules = selectedBatch ? schedules.filter((s) => s.batch === selectedBatch) : schedules;
    if (searchTerm.trim()) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      filteredSchedules = filteredSchedules.filter((schedule) =>
        schedule.batch.toLowerCase().includes(lowerSearchTerm) ||
        schedule.subjects.some((subject) =>
          subject.subjectName.toLowerCase().includes(lowerSearchTerm) ||
          subject.lecturer.toLowerCase().includes(lowerSearchTerm) ||
          subject.room.toLowerCase().includes(lowerSearchTerm)
        )
      );
    }

    filteredSchedules.forEach((schedule) => {
      schedule.subjects.forEach((subject, subjectIndex) => {
        const scheduleDate = new Date(subject.date);
        const day = weekDays[scheduleDate.getDay() === 0 ? 6 : scheduleDate.getDay() - 1];
        const scheduleHour = timeToHour(subject.time);
        const scheduleDuration = parseInt(subject.duration || "1");
        const timeSlot = timeSlots.find((ts) => timeToHour(ts) === scheduleHour);
        if (timeSlot && grid[day]?.[timeSlot]) {
          grid[day][timeSlot] = {
            isOccupied: true,
            schedule: { ...schedule, subjectIndex },
            subject,
            isStart: true,
            rowSpan: scheduleDuration,
          };
          for (let i = 1; i < scheduleDuration; i++) {
            const nextHour = scheduleHour + i;
            if (nextHour > 17) break;
            const nextTimeSlot = `${nextHour.toString().padStart(2, "0")}:00`;
            if (grid[day][nextTimeSlot]) {
              grid[day][nextTimeSlot] = { isOccupied: true, schedule: { ...schedule, subjectIndex }, subject, isStart: false };
            }
          }
        }
      });
    });
    return grid;
  };

  const grid = processSchedulesForGrid();

  return (
    <div className="min-h-screen p-8 bg-gradient-to-br from-gray-100 to-gray-50">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex justify-between items-center mb-8"
      >
        <h2 className="text-3xl font-bold text-[#1B365D] tracking-tight">Timetable Management</h2>
        <div className="flex space-x-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={fetchData}
            className="bg-[#1B365D] text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-[#1B365D]/80 transition-colors shadow-md"
          >
            <RefreshCw className="w-5 h-5" /> Refresh
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              setShowForm(true);
              setEditingSchedule(null);
              resetForm();
            }}
            className="bg-gradient-to-r from-[#1B365D] to-[#2A4A7A] text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:from-[#1B365D]/80 hover:to-[#2A4A7A]/80 transition-all shadow-md"
          >
            + Add New Schedule
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/LecturerSchedules")}
            className="bg-[#1B365D] text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-[#1B365D]/80 transition-colors shadow-md"
          >
            <User className="w-5 h-5" /> Lecturer Schedules
          </motion.button>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="flex justify-between gap-4 mb-8"
      >
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
          <input
            type="text"
            placeholder="Search schedules..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-[#1B365D] transition-all"
          />
        </div>
        <div className="relative">
          <select
            value={selectedBatch}
            onChange={(e) => setSelectedBatch(e.target.value)}
            className="appearance-none px-4 py-2 pr-8 bg-white border border-gray-200 rounded-lg text-[#1B365D] w-72 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#1B365D] transition-all"
          >
            <option value="">Select Batch</option>
            {batches.map((batch) => (
              <option key={batch._id} value={batch.batchName}>
                {`${batch.batchName} (${batch.semester}, ${batch.scheduleType})`}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        </div>
      </motion.div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1 }}
            className="w-10 h-10 border-4 border-t-[#1B365D] border-gray-200 rounded-full"
          />
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="overflow-x-auto"
        >
          <div className="min-w-[1200px] shadow-xl rounded-xl overflow-hidden bg-white border border-gray-200">
            <table className="w-full border-collapse">
              <thead className="bg-gradient-to-r from-[#1B365D] to-[#2A4A7A] text-white">
                <tr>
                  <th className="p-4 font-semibold text-left sticky left-0 z-20 bg-gradient-to-r from-[#1B365D] to-[#2A4A7A] border-b border-r border-[#2A4A7A]">
                    Time
                  </th>
                  {weekDays.map((day, index) => (
                    <th
                      key={day}
                      className={`p-4 font-semibold text-center border-b ${index < weekDays.length - 1 ? "border-r" : ""} border-[#2A4A7A]`}
                    >
                      {day}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {timeSlots.map((time, timeIndex) => (
                  <tr
                    key={`time-${time}`}
                    className={`transition-colors ${timeIndex % 2 === 0 ? "bg-gray-50" : "bg-white"} hover:bg-gray-100`}
                  >
                    <td
                      className="p-4 text-[#1B365D] font-semibold text-sm sticky left-0 z-10 bg-inherit border-r border-b border-gray-200"
                    >
                      {time}
                    </td>
                    {weekDays.map((day, dayIndex) => {
                      const cell = grid[day][time];
                      if (cell.isOccupied && !cell.isStart) return null;
                      return (
                        <td
                          key={`${day}-${time}`}
                          className={`p-3 border-b border-r border-gray-200 align-top`}
                          rowSpan={cell.isStart ? cell.rowSpan : 1}
                        >
                          {cell.isStart && cell.schedule && cell.subject && (
                            <motion.div
                              initial={{ opacity: 0, scale: 0.95 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ duration: 0.3 }}
                              className="bg-gradient-to-br from-[#F9FAFB] to-[#E5E7EB] rounded-lg p-4 shadow-sm border-l-4 border-[#1B365D] hover:shadow-md transition-all transform hover:-translate-y-1"
                            >
                              <div className="flex justify-between items-start">
                                <div className="font-bold text-[#1B365D] text-lg mb-2">{cell.subject.subjectName}</div>
                                <span className="text-xs bg-[#1B365D] text-white px-2 py-1 rounded-full">
                                  {cell.subject.duration} hr{cell.subject.duration > 1 ? "s" : ""}
                                </span>
                              </div>
                              <div className="text-sm text-gray-800 mb-1">
                                <span className="font-medium text-[#2A4A7A]">Lecturer:</span> {cell.subject.lecturer}
                              </div>
                              <div className="text-sm text-gray-800 mb-1">
                                <span className="font-medium text-[#2A4A7A]">Room:</span> {cell.subject.room}
                              </div>
                              <div className="text-sm text-gray-800 mb-3">
                                <span className="font-medium text-[#2A4A7A]">Batch:</span> {cell.schedule.batch}
                              </div>
                              <div className="flex gap-2 justify-end">
                                <motion.button
                                  whileHover={{ scale: 1.1 }}
                                  onClick={() => {
                                    setNewSchedule({ ...cell.schedule, subjects: [cell.subject] });
                                    setEditingSchedule(cell.schedule);
                                    setEditingSubjectIndex(cell.schedule.subjectIndex);
                                    setShowForm(true);
                                    setErrors({});
                                  }}
                                  className="text-[#1B365D] bg-gray-200 p-2 rounded-full hover:bg-[#1B365D] hover:text-white transition-colors"
                                >
                                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                                    <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                                  </svg>
                                </motion.button>
                                <motion.button
                                  whileHover={{ scale: 1.1 }}
                                  onClick={() => handleDeleteSubject(cell.schedule._id, cell.schedule.subjectIndex)}
                                  className="text-red-500 bg-gray-200 p-2 rounded-full hover:bg-red-500 hover:text-white transition-colors"
                                >
                                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M3 6h18" />
                                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                  </svg>
                                </motion.button>
                              </div>
                            </motion.div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-[#1B365D]/50 backdrop-blur-sm flex justify-center items-center"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white p-6 rounded-xl w-[650px] max-h-[85vh] shadow-2xl overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-[#1B365D]">
                  {editingSchedule && editingSubjectIndex !== null ? "Edit Subject" : editingSchedule ? "Edit Schedule" : "Add New Schedule"}
                </h3>
                <button onClick={() => setShowForm(false)} className="text-[#1B365D] hover:text-[#1B365D]/70 text-2xl">
                  ✕
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2 text-[#1B365D]">Batch</label>
                  <input
                    type="text"
                    value={newSchedule.batch}
                    readOnly
                    className="w-full p-3 border border-gray-200 rounded-lg bg-gray-100 text-[#1B365D] shadow-sm"
                  />
                </div>

                {!editingSubjectIndex && (
                  <div>
                    <label className="block text-sm font-medium mb-2 text-[#1B365D]">Allocation ID *</label>
                    <select
                      value={newSchedule.allocationId}
                      onChange={handleAllocationChange}
                      className={`w-full p-3 border rounded-lg bg-white text-[#1B365D] shadow-sm focus:outline-none focus:ring-2 focus:ring-[#1B365D] ${
                        errors.allocationId ? "border-red-500" : "border-gray-200"
                      }`}
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
                    {errors.allocationId && <p className="text-red-500 text-xs mt-1">{errors.allocationId}</p>}
                  </div>
                )}

                {newSchedule.subjects.map((subject, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="border border-gray-200 p-5 rounded-lg bg-gray-50"
                  >
                    <h4 className="text-md font-semibold mb-3 text-[#1B365D]">{subject.subjectName}</h4>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-1 text-[#1B365D]">Lecturer</label>
                        <input
                          type="text"
                          value={subject.lecturer}
                          readOnly
                          className="w-full p-3 border border-gray-200 rounded-lg bg-gray-100 text-[#1B365D]"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1 text-[#1B365D]">Room *</label>
                        <select
                          value={subject.room}
                          onChange={(e) =>
                            setNewSchedule((prev) => {
                              const updatedSubjects = [...prev.subjects];
                              updatedSubjects[index].room = e.target.value;
                              return { ...prev, subjects: updatedSubjects };
                            })
                          }
                          className={`w-full p-3 border rounded-lg bg-white text-[#1B365D] shadow-sm focus:outline-none focus:ring-2 focus:ring-[#1B365D] ${
                            errors[`subject${index}`]?.room ? "border-red-500" : "border-gray-200"
                          }`}
                        >
                          <option value="">Select Room</option>
                          {rooms.map((room) => (
                            <option key={room._id} value={room.LID}>
                              {room.LID} ({room.hallType})
                            </option>
                          ))}
                        </select>
                        {errors[`subject${index}`]?.room && (
                          <p className="text-red-500 text-xs mt-1">{errors[`subject${index}`].room}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1 text-[#1B365D]">Date *</label>
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
                          className={`w-full p-3 border rounded-lg bg-white text-[#1B365D] shadow-sm focus:outline-none focus:ring-2 focus:ring-[#1B365D] ${
                            errors[`subject${index}`]?.date ? "border-red-500" : "border-gray-200"
                          }`}
                        />
                        {errors[`subject${index}`]?.date && (
                          <p className="text-red-500 text-xs mt-1">{errors[`subject${index}`].date}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1 text-[#1B365D]">Time *</label>
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
                          className={`w-full p-3 border rounded-lg bg-white text-[#1B365D] shadow-sm focus:outline-none focus:ring-2 focus:ring-[#1B365D] ${
                            errors[`subject${index}`]?.time ? "border-red-500" : "border-gray-200"
                          }`}
                        />
                        {errors[`subject${index}`]?.time && (
                          <p className="text-red-500 text-xs mt-1">{errors[`subject${index}`].time}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1 text-[#1B365D]">Duration (hours) *</label>
                        <select
                          value={subject.duration}
                          onChange={(e) =>
                            setNewSchedule((prev) => {
                              const updatedSubjects = [...prev.subjects];
                              updatedSubjects[index].duration = e.target.value;
                              return { ...prev, subjects: updatedSubjects };
                            })
                          }
                          className={`w-full p-3 border rounded-lg bg-white text-[#1B365D] shadow-sm focus:outline-none focus:ring-2 focus:ring-[#1B365D] ${
                            errors[`subject${index}`]?.duration ? "border-red-500" : "border-gray-200"
                          }`}
                        >
                          <option value="">Select Duration</option>
                          {[1, 2, 3, 4].map((h) => (
                            <option key={h} value={h}>
                              {h} hour{h > 1 ? "s" : ""}
                            </option>
                          ))}
                        </select>
                        {errors[`subject${index}`]?.duration && (
                          <p className="text-red-500 text-xs mt-1">{errors[`subject${index}`].duration}</p>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSaveSchedule}
                disabled={loading}
                className={`w-full mt-6 bg-gradient-to-r from-[#1B365D] to-[#2A4A7A] text-white py-3 rounded-lg flex items-center justify-center gap-2 hover:from-[#1B365D]/80 hover:to-[#2A4A7A]/80 transition-all shadow-md ${
                  loading ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                {loading ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1 }}
                    className="w-5 h-5 border-2 border-t-white border-gray-300 rounded-full"
                  />
                ) : editingSchedule && editingSubjectIndex !== null ? (
                  "Save Subject Changes"
                ) : editingSchedule ? (
                  "Save Schedule Changes"
                ) : (
                  "Create Schedule"
                )}
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}