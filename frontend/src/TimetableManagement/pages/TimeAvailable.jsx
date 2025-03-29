import { useState, useEffect } from "react";
import axios from "axios";
import { RefreshCw } from "lucide-react";
import { motion } from "framer-motion";

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
    if (availableRoomsCount === 0) return "bg-red-100";
    if (availableRoomsCount <= 2) return "bg-yellow-100";
    return "bg-green-100";
  };

  return (
    <div className="min-h-screen p-8 bg-gradient-to-br from-gray-100 to-gray-50">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex justify-between items-center mb-8"
      >
        <h2 className="text-3xl font-bold text-[#1B365D] tracking-tight">Available Time Slots</h2>
        <div className="flex space-x-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={fetchAvailabilityData}
            className="bg-[#1B365D] text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-[#1B365D]/80 transition-colors shadow-md"
          >
            <RefreshCw className="w-5 h-5" /> Refresh
          </motion.button>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="mb-8"
      >
        <div className="relative w-72">
          <select
            value={selectedBatch}
            onChange={(e) => setSelectedBatch(e.target.value)}
            className="appearance-none px-4 py-2 pr-8 bg-white border border-gray-200 rounded-lg text-[#1B365D] w-full shadow-sm focus:outline-none focus:ring-2 focus:ring-[#1B365D] transition-all"
          >
            <option value="">Select Batch</option>
            {batches.map((batch) => (
              <option key={batch._id} value={batch.batchName}>
                {`${batch.batchName} (${batch.semester}, ${batch.scheduleType})`}
              </option>
            ))}
          </select>
          <svg
            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
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
          <div className="min-w-[1200px] shadow-lg rounded-lg overflow-hidden border-2 border-[#1B365D]/20">
            <table className="w-full border-collapse bg-white">
              <thead className="bg-gradient-to-r from-[#1B365D] to-[#2A4A7A] text-white">
                <tr>
                  <th className="p-4 font-semibold text-left border-b-2 border-r-2 border-[#2A4A7A] sticky left-0 bg-gradient-to-r from-[#1B365D] to-[#2A4A7A] z-10">
                    Time
                  </th>
                  {weekDays.map((day) => (
                    <th
                      key={day}
                      className="p-4 font-semibold text-center border-b-2 border-r-2 border-[#2A4A7A]"
                    >
                      {day}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {timeSlots.map((time, timeIndex) => (
                  <tr key={`time-${time}`} className="hover:bg-gray-50 transition-colors">
                    <td
                      className={`p-4 text-[#1B365D] font-medium border-r-2 ${
                        timeIndex < timeSlots.length - 1 ? "border-b-2" : ""
                      } border-[#1B365D]/40 sticky left-0 bg-white z-10 shadow-sm`}
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
                          className={`p-3 ${
                            dayIndex < weekDays.length - 1 ? "border-r-2" : ""
                          } ${
                            timeIndex < timeSlots.length - 1 ? "border-b-2" : ""
                          } border-[#1B365D]/40 ${getCellBackground(availableRoomsCount)}`}
                        >
                          {cell.occupied ? (
                            <div className="text-red-600 font-medium">
                              Occupied
                              <p className="text-xs text-gray-600">No rooms available</p>
                            </div>
                          ) : (
                            <div className="text-green-600 font-medium">
                              Available
                              <p className="text-xs text-gray-700 mt-1">
                                <span className="font-medium">Rooms ({availableRoomsCount}):</span>{" "}
                                {availableRoomsCount > 0
                                  ? cell.availableRooms.map((r) => r.LID).join(", ")
                                  : "None"}
                              </p>
                              <p className="text-xs text-gray-700 mt-1">
                                <span className="font-medium">Lecturers ({availableLecturersCount}):</span>{" "}
                                {availableLecturersCount > 0
                                  ? cell.availableLecturers.map((l) => l.name).join(", ")
                                  : "None"}
                              </p>
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
    </div>
  );
}