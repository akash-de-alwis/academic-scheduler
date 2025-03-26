import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { AlertCircle, Wrench, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";

const TimeConflicts = () => {
  const { state } = useLocation();
  const { conflicts, schedules } = state || { conflicts: [], schedules: [] };
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPopup, setShowPopup] = useState(null); // null or conflict index

  const timeSlots = Array.from({ length: 10 }, (_, i) => `${(i + 8).toString().padStart(2, "0")}:00`);
  const weekDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  const timeToHour = (timeStr) => parseInt(timeStr.split(":")[0], 10);

  const handleDeleteBoth = async (conflict) => {
    setLoading(true);
    try {
      const { schedule1, schedule2, subject1, subject2 } = conflict;
      const subject1Index = schedule1.subjects.findIndex((s) => s === subject1);
      const subject2Index = schedule2.subjects.findIndex((s) => s === subject2);

      // Delete subject1 from schedule1
      const updatedSubjects1 = schedule1.subjects.filter((_, idx) => idx !== subject1Index);
      if (updatedSubjects1.length === 0) {
        await axios.delete(`http://localhost:5000/api/timetable/${schedule1._id}`);
      } else {
        await axios.put(`http://localhost:5000/api/timetable/${schedule1._id}`, {
          ...schedule1,
          subjects: updatedSubjects1,
        });
      }

      // Delete subject2 from schedule2
      const updatedSubjects2 = schedule2.subjects.filter((_, idx) => idx !== subject2Index);
      if (updatedSubjects2.length === 0) {
        await axios.delete(`http://localhost:5000/api/timetable/${schedule2._id}`);
      } else {
        await axios.put(`http://localhost:5000/api/timetable/${schedule2._id}`, {
          ...schedule2,
          subjects: updatedSubjects2,
        });
      }

      navigate("/TimeHome"); // Redirect to TimeHome.jsx
    } catch (err) {
      console.error("Error deleting subjects:", err.response ? err.response.data : err.message);
      alert("Failed to delete subjects. Check console for details.");
    } finally {
      setLoading(false);
    }
  };

  const handleEditSelection = async (conflict, keepSchedule) => {
    setLoading(true);
    try {
      const { schedule1, schedule2, subject1, subject2 } = conflict;
      const keep = keepSchedule === "schedule1" ? schedule1 : schedule2;
      const remove = keepSchedule === "schedule1" ? schedule2 : schedule1;
      const removeSubject = keepSchedule === "schedule1" ? subject2 : subject1;
      const removeSubjectIndex = remove.subjects.findIndex((s) => s === removeSubject);

      // Remove the unselected schedule's subject
      const updatedSubjects = remove.subjects.filter((_, idx) => idx !== removeSubjectIndex);
      if (updatedSubjects.length === 0) {
        await axios.delete(`http://localhost:5000/api/timetable/${remove._id}`);
      } else {
        await axios.put(`http://localhost:5000/api/timetable/${remove._id}`, {
          ...remove,
          subjects: updatedSubjects,
        });
      }

      setShowPopup(null); // Close popup
      navigate("/TimeHome"); // Redirect to TimeHome.jsx
    } catch (err) {
      console.error("Error resolving conflict:", err.response ? err.response.data : err.message);
      alert("Failed to resolve conflict. Check console for details.");
    } finally {
      setLoading(false);
    }
  };

  const processConflictGrid = () => {
    const grid = {};
    weekDays.forEach((day) => {
      grid[day] = {};
      timeSlots.forEach((timeSlot) => {
        grid[day][timeSlot] = { conflicts: [] };
      });
    });

    conflicts.forEach((conflict) => {
      const { subject1 } = conflict;
      const scheduleDate = new Date(subject1.date);
      const day = weekDays[scheduleDate.getDay() === 0 ? 6 : scheduleDate.getDay() - 1];
      const scheduleHour = timeToHour(subject1.time);
      const scheduleDuration = parseInt(subject1.duration || "1");
      const timeSlot = timeSlots.find((ts) => timeToHour(ts) === scheduleHour);

      if (timeSlot && grid[day]?.[timeSlot]) {
        grid[day][timeSlot].conflicts.push(conflict);
        for (let i = 1; i < scheduleDuration; i++) {
          const nextHour = scheduleHour + i;
          if (nextHour > 17) break;
          const nextTimeSlot = `${nextHour.toString().padStart(2, "0")}:00`;
          if (grid[day][nextTimeSlot]) {
            grid[day][nextTimeSlot].conflicts.push(conflict);
          }
        }
      }
    });

    return grid;
  };

  const grid = processConflictGrid();

  return (
    <div className="min-h-screen p-8 bg-gradient-to-br from-gray-100 to-gray-50">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex justify-between items-center mb-8"
      >
        <h2 className="text-3xl font-bold text-[#1B365D] tracking-tight">Resolve Timetable Conflicts</h2>
        <button
          onClick={() => navigate("/TimeHome")}
          className="bg-[#1B365D] text-white px-4 py-2 rounded-lg hover:bg-[#152c4d] transition-colors shadow-md"
        >
          Back to Dashboard
        </button>
      </motion.div>

      {conflicts.length === 0 ? (
        <div className="text-center text-gray-600 text-lg">No conflicts detected.</div>
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
                  {weekDays.map((day, index) => (
                    <th
                      key={day}
                      className={`p-4 font-semibold text-center border-b-2 ${
                        index < weekDays.length - 1 ? "border-r-2" : ""
                      } border-[#2A4A7A]`}
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
                      const cellConflicts = grid[day][time].conflicts;
                      if (cellConflicts.length === 0) {
                        return (
                          <td
                            key={`${day}-${time}`}
                            className={`p-3 ${
                              dayIndex < weekDays.length - 1 ? "border-r-2" : ""
                            } ${timeIndex < timeSlots.length - 1 ? "border-b-2" : ""} border-[#1B365D]/40`}
                          />
                        );
                      }
                      const conflict = cellConflicts[0];
                      const duration = parseInt(conflict.subject1.duration || "1");
                      const isStart = timeToHour(time) === timeToHour(conflict.subject1.time);
                      if (!isStart) return null;

                      return (
                        <td
                          key={`${day}-${time}`}
                          className={`p-3 ${
                            dayIndex < weekDays.length - 1 ? "border-r-2" : ""
                          } ${timeIndex < timeSlots.length - 1 ? "border-b-2" : ""} border-[#1B365D]/40 align-top`}
                          rowSpan={duration}
                        >
                          <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.3 }}
                            className="bg-gradient-to-br from-red-50 to-white rounded-lg p-4 shadow-md border-l-4 border-red-500 hover:shadow-lg transition-all"
                          >
                            <div className="font-semibold text-red-600 mb-2 text-lg flex items-center gap-2">
                              <AlertCircle className="w-5 h-5" /> Conflict Detected
                            </div>
                            <div className="text-sm text-gray-700 mb-2">
                              <span className="font-medium">Schedule 1:</span> {conflict.subject1.subjectName} (
                              {conflict.schedule1.batch})<br />
                              <span className="ml-4">
                                {conflict.subject1.time} - {conflict.subject1.room} - {conflict.subject1.lecturer}
                              </span>
                            </div>
                            <div className="text-sm text-gray-700 mb-3">
                              <span className="font-medium">Schedule 2:</span> {conflict.subject2.subjectName} (
                              {conflict.schedule2.batch})<br />
                              <span className="ml-4">
                                {conflict.subject2.time} - {conflict.subject2.room} - {conflict.subject2.lecturer}
                              </span>
                            </div>
                            <div className="flex gap-3 justify-end">
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                onClick={() => setShowPopup(conflicts.indexOf(conflict))}
                                disabled={loading}
                                className="text-[#1B365D] bg-gray-100 p-2 rounded-full hover:bg-gray-200 transition-colors"
                              >
                                <Wrench className="w-5 h-5" />
                              </motion.button>
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                onClick={() => handleDeleteBoth(conflict)}
                                disabled={loading}
                                className="text-red-500 bg-gray-100 p-2 rounded-full hover:bg-red-100 transition-colors"
                              >
                                <Trash2 className="w-5 h-5" />
                              </motion.button>
                            </div>
                          </motion.div>
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

      {/* Popup for Edit Selection */}
      <AnimatePresence>
        {showPopup !== null && (
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
              className="bg-white p-6 rounded-xl w-[400px] shadow-2xl"
            >
              <h3 className="text-xl font-semibold text-[#1B365D] mb-4">Resolve Conflict</h3>
              <p className="text-gray-600 mb-4">Select which schedule to keep:</p>
              <div className="space-y-4">
                <button
                  onClick={() => handleEditSelection(conflicts[showPopup], "schedule1")}
                  disabled={loading}
                  className="w-full text-left p-3 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors text-[#1B365D]"
                >
                  <span className="font-medium">Schedule 1:</span> {conflicts[showPopup].subject1.subjectName} (
                  {conflicts[showPopup].schedule1.batch})
                </button>
                <button
                  onClick={() => handleEditSelection(conflicts[showPopup], "schedule2")}
                  disabled={loading}
                  className="w-full text-left p-3 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors text-[#1B365D]"
                >
                  <span className="font-medium">Schedule 2:</span> {conflicts[showPopup].subject2.subjectName} (
                  {conflicts[showPopup].schedule2.batch})
                </button>
              </div>
              <button
                onClick={() => setShowPopup(null)}
                disabled={loading}
                className="mt-4 text-[#1B365D] hover:text-[#1B365D]/70 text-lg w-full text-center"
              >
                Cancel
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TimeConflicts;