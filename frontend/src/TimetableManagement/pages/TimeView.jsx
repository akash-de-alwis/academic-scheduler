import { useState, useEffect } from "react";
import axios from "axios";
import { useLocation } from "react-router-dom";
import { motion } from "framer-motion";

export default function TimeView() {
  const [timetable, setTimetable] = useState(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const batch = location.state?.batch;

  const timeSlots = Array.from({ length: 10 }, (_, i) => {
    const hour = i + 8;
    return `${hour.toString().padStart(2, "0")}:00`;
  });

  const weekDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

  const timeToHour = (timeStr) => parseInt(timeStr.split(":")[0], 10);

  useEffect(() => {
    if (batch) {
      fetchPublishedTimetable();
    }
  }, [batch]);

  const fetchPublishedTimetable = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/timetable/published-timetable", {
        params: { batch },
      });
      setTimetable(response.data);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching published timetable:", err.response ? err.response.data : err.message);
      setLoading(false);
    }
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

    if (!timetable?.schedules) return grid;

    timetable.schedules.forEach((schedule) => {
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

  if (loading) {
    return (
      <div className="min-h-screen p-8 bg-gradient-to-br from-gray-100 to-gray-50 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1 }}
          className="w-10 h-10 border-4 border-t-[#1B365D] border-gray-200 rounded-full"
        />
      </div>
    );
  }

  if (!timetable || !timetable.schedules) {
    return (
      <div className="min-h-screen p-8 bg-gradient-to-br from-gray-100 to-gray-50 flex items-center justify-center">
        <p className="text-[#1B365D] text-lg font-semibold">No timetable found for batch: {batch}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8 bg-gradient-to-br from-gray-100 to-gray-50">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <h2 className="text-3xl font-bold text-[#1B365D] tracking-tight">Published Timetable - Batch {batch}</h2>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
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
                  className={`transition-colors ${timeIndex % 2 === 0 ? "bg-gray-50" : "bg-white"}`}
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
                            className="bg-gradient-to-br from-[#F9FAFB] to-[#E5E7EB] rounded-lg p-4 shadow-sm border-l-4 border-[#1B365D]"
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
    </div>
  );
}