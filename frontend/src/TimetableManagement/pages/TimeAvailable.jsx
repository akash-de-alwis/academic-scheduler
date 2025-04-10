import { useState, useEffect } from "react";
import axios from "axios";
import { RefreshCw, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function TimeAvailable() {
  const [availabilityGrid, setAvailabilityGrid] = useState({});
  const [loading, setLoading] = useState(false);
  const [rooms, setRooms] = useState([]);
  const [batches, setBatches] = useState([]);
  const [lecturers, setLecturers] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState("");
  const timeSlots = Array.from({ length: 10 }, (_, i) => `${(i + 8).toString().padStart(2, "0")}:00`);
  const weekDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

  const fetchAvailabilityData = async () => {
    setLoading(true);
    try {
      const [timetablesRes, roomsRes, batchesRes, lecturersRes] = await Promise.all([
        axios.get("http://localhost:5000/api/timetable"),
        axios.get("http://localhost:5000/api/rooms"),
        axios.get("http://localhost:5000/api/batches"),
        axios.get("http://localhost:5000/api/lecturers"),
      ]);

      const timetables = selectedBatch
        ? timetablesRes.data.filter((t) => t.batch === selectedBatch)
        : timetablesRes.data;
      setRooms(roomsRes.data.filter((room) => room.hallType !== "Meeting Room"));
      setBatches(batchesRes.data);
      setLecturers(lecturersRes.data);

      const grid = {};
      weekDays.forEach((day) => {
        grid[day] = {};
        timeSlots.forEach((timeSlot) => {
          grid[day][timeSlot] = {
            availableRooms: [...roomsRes.data.filter((r) => r.hallType !== "Meeting Room")],
            availableLecturers: [...lecturersRes.data],
            occupied: false,
          };
        });
      });

      timetables.forEach((schedule) => {
        schedule.subjects.forEach((subject) => {
          const scheduleDate = new Date(subject.date);
          const dayIndex = scheduleDate.getDay() === 0 ? 6 : scheduleDate.getDay() - 1;
          const day = weekDays[dayIndex];
          const startHour = parseInt(subject.time.split(":")[0]);
          const duration = parseInt(subject.duration || "1");

          for (let i = 0; i < duration; i++) {
            const hour = startHour + i;
            if (hour >= 8 && hour <= 17) {
              const timeSlot = `${hour.toString().padStart(2, "0")}:00`;
              if (grid[day][timeSlot]) {
                grid[day][timeSlot].occupied = true;
                grid[day][timeSlot].availableRooms = grid[day][timeSlot].availableRooms.filter(
                  (room) => room.LID !== subject.room
                );
                grid[day][timeSlot].availableLecturers = grid[day][timeSlot].availableLecturers.filter(
                  (lecturer) => lecturer.name !== subject.lecturer
                );
              }
            }
          }
        });
      });

      // Filter based on batch schedule type
      if (selectedBatch) {
        const selectedBatchData = batchesRes.data.find((b) => b.batchName === selectedBatch);
        const isWeekendBatch = selectedBatchData?.scheduleType === "Weekend";
        weekDays.forEach((day, index) => {
          if (isWeekendBatch && ![5, 6].includes(index)) { // Saturday (5), Sunday (6)
            timeSlots.forEach((timeSlot) => {
              grid[day][timeSlot].occupied = true;
              grid[day][timeSlot].availableRooms = [];
              grid[day][timeSlot].availableLecturers = [];
            });
          } else if (!isWeekendBatch && [5, 6].includes(index)) { // Weekdays only
            timeSlots.forEach((timeSlot) => {
              grid[day][timeSlot].occupied = true;
              grid[day][timeSlot].availableRooms = [];
              grid[day][timeSlot].availableLecturers = [];
            });
          }
        });
      }

      setAvailabilityGrid(grid);
    } catch (err) {
      console.error("Error fetching availability data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAvailabilityData();
  }, [selectedBatch]); // Re-fetch when selectedBatch changes

  const getCellBackground = (availableRoomsCount) => {
    if (availableRoomsCount === 0) return "bg-red-50 border-red-200";
    if (availableRoomsCount <= 2) return "bg-amber-50 border-amber-200";
    return "bg-emerald-50 border-emerald-200";
  };

  const getCellTextColor = (availableRoomsCount) => {
    if (availableRoomsCount === 0) return "text-red-600";
    if (availableRoomsCount <= 2) return "text-amber-600";
    return "text-emerald-600";
  };

  return (
    <div className="min-h-screen p-8 bg-gradient-to-br from-slate-50 to-white">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="flex justify-between items-center mb-8"
      >
        <div>
          <h2 className="text-4xl font-bold text-[#1B365D] tracking-tight mb-2">
            Available Time Slots
          </h2>
          <p className="text-slate-600">View and manage available time slots for scheduling</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={fetchAvailabilityData}
          className="bg-gradient-to-r from-[#1B365D] to-[#2A4A7A] text-white px-6 py-3 rounded-xl flex items-center gap-2 hover:shadow-lg transition-all duration-300 font-medium"
        >
          <RefreshCw className="w-5 h-5" />
          Refresh Schedule
        </motion.button>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="mb-8"
      >
        <div className="relative w-80">
          <div className="relative">
            <select
              value={selectedBatch}
              onChange={(e) => setSelectedBatch(e.target.value)}
              className="appearance-none w-full px-5 py-3 bg-white border-2 border-slate-200 rounded-xl text-[#1B365D] shadow-sm focus:outline-none focus:ring-2 focus:ring-[#1B365D] focus:border-transparent transition-all duration-200 font-medium"
            >
              <option value="">Select a Batch</option>
              {batches.map((batch) => (
                <option key={batch._id} value={batch.batchName}>
                  {`${batch.batchName} (${batch.semester}, ${batch.scheduleType})`}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5 pointer-events-none" />
          </div>
        </div>
      </motion.div>

      <AnimatePresence>
        {loading ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center h-64 gap-4"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
              className="w-12 h-12 border-4 border-t-[#1B365D] border-slate-200 rounded-full"
            />
            <p className="text-slate-600 font-medium">Loading schedule...</p>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="overflow-x-auto rounded-2xl shadow-xl border border-slate-200"
          >
            <div className="min-w-[1200px]">
              <table className="w-full border-collapse bg-white">
                <thead>
                  <tr className="bg-gradient-to-r from-[#1B365D] to-[#2A4A7A]">
                    <th className="p-5 font-semibold text-left text-white border-b border-r border-slate-700/20 sticky left-0 bg-gradient-to-r from-[#1B365D] to-[#2A4A7A] z-10">
                      Time
                    </th>
                    {weekDays.map((day) => (
                      <th
                        key={day}
                        className="p-5 font-semibold text-center text-white border-b border-r border-slate-700/20"
                      >
                        {day}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {timeSlots.map((time, timeIndex) => (
                    <tr key={`time-${time}`} className="group">
                      <td
                        className={`p-5 text-[#1B365D] font-medium border-r ${
                          timeIndex < timeSlots.length - 1 ? "border-b" : ""
                        } border-slate-200 sticky left-0 bg-white z-10 shadow-sm group-hover:bg-slate-50 transition-colors duration-200`}
                      >
                        {time}
                      </td>
                      {weekDays.map((day, dayIndex) => {
                        const cell = availabilityGrid[day]?.[time] || {};
                        const availableRoomsCount = cell.availableRooms?.length || 0;
                        const availableLecturersCount = cell.availableLecturers?.length || 0;

                        return (
                          <td
                            key={`${day}-${time}`}
                            className={`p-4 ${dayIndex < weekDays.length - 1 ? "border-r" : ""} 
                            ${timeIndex < timeSlots.length - 1 ? "border-b" : ""} 
                            border-slate-200 ${getCellBackground(availableRoomsCount)}
                            transition-all duration-200 hover:shadow-inner`}
                          >
                            {cell.occupied ? (
                              <div className="space-y-2">
                                <div className="text-red-600 font-semibold flex items-center gap-2">
                                  <span className="inline-block w-2 h-2 bg-red-500 rounded-full"></span>
                                  Occupied
                                </div>
                                <p className="text-xs text-slate-500">No rooms available</p>
                              </div>
                            ) : (
                              <div className="space-y-2">
                                <div className={`font-semibold flex items-center gap-2 ${getCellTextColor(availableRoomsCount)}`}>
                                  <span className={`inline-block w-2 h-2 rounded-full ${
                                    availableRoomsCount === 0 ? "bg-red-500" :
                                    availableRoomsCount <= 2 ? "bg-amber-500" : "bg-emerald-500"
                                  }`}></span>
                                  Available
                                </div>
                                <div className="space-y-1.5">
                                  <p className="text-xs text-slate-600">
                                    <span className="font-medium">Rooms ({availableRoomsCount}):</span>{" "}
                                    <span className="text-slate-700">
                                      {availableRoomsCount > 0
                                        ? cell.availableRooms.map((r) => r.LID).join(", ")
                                        : "None"}
                                    </span>
                                  </p>
                                  <p className="text-xs text-slate-600">
                                    <span className="font-medium">Lecturers ({availableLecturersCount}):</span>{" "}
                                    <span className="text-slate-700">
                                      {availableLecturersCount > 0
                                        ? cell.availableLecturers.map((l) => l.name).join(", ")
                                        : "None"}
                                    </span>
                                  </p>
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
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}