import { useState, useEffect } from "react";
import axios from "axios";
import { ChevronDown } from "lucide-react";

export default function PublishTimetable() {
  const [batches, setBatches] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [selectedSemester, setSelectedSemester] = useState("");
  const [selectedScheduleType, setSelectedScheduleType] = useState("");
  const [timetable, setTimetable] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Fetch batches on component mount
  useEffect(() => {
    const fetchBatches = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/batches");
        setBatches(response.data);
      } catch (err) {
        console.error("Error fetching batches:", err);
        setError("Failed to load batches. Please try again later.");
      }
    };
    fetchBatches();
  }, []);

  // Fetch timetable based on selections
  const fetchTimetable = async () => {
    if (!selectedBatch || !selectedDepartment || !selectedSemester || !selectedScheduleType) {
      setError("Please select all filters to view the timetable.");
      setTimetable(null);
      return;
    }

    setLoading(true);
    setError("");
    setTimetable(null);

    try {
      // Fetch published timetable with all filters
      const response = await axios.get("http://localhost:5000/api/timetable/published-timetable", {
        params: {
          batch: selectedBatch,
          department: selectedDepartment,
          semester: selectedSemester,
          scheduleType: selectedScheduleType,
        },
      });
      if (response.data && response.data.schedules) {
        setTimetable(response.data);
      } else {
        setError("No timetable found for the selected filters.");
      }
    } catch (err) {
      console.error("Error fetching timetable:", err);
      setError("Failed to load timetable. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Trigger timetable fetch when all selections are made
  useEffect(() => {
    if (selectedBatch && selectedDepartment && selectedSemester && selectedScheduleType) {
      fetchTimetable();
    }
  }, [selectedBatch, selectedDepartment, selectedSemester, selectedScheduleType]);

  // Define unique options for filters
  const departments = [...new Set(batches.map((batch) => batch.department))];
  const semesters = ["Semester1", "Semester2"];
  const scheduleTypes = ["Weekdays", "Weekend"];

  // Filter batches based on selected department, semester, and schedule type
  const filteredBatches = batches.filter(
    (batch) =>
      (!selectedDepartment || batch.department === selectedDepartment) &&
      (!selectedSemester || batch.semester === selectedSemester) &&
      (!selectedScheduleType || batch.scheduleType === selectedScheduleType)
  );

  // Define time slots and weekdays for the grid
  const timeSlots = Array.from({ length: 10 }, (_, i) => {
    const hour = i + 8;
    return `${hour.toString().padStart(2, "0")}:00`;
  });

  const weekDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

  const timeToHour = (timeStr) => {
    const [hours] = timeStr.split(":").map(Number);
    return hours;
  };

  // Process timetable data into a grid format
  const processTimetableForGrid = () => {
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

    if (timetable && timetable.schedules) {
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
    }
    return grid;
  };

  const grid = processTimetableForGrid();

  return (
    <div className="min-h-screen p-8 bg-white">
      <h2 className="text-2xl font-bold text-[#1B365D] mb-8">View Your Timetable</h2>

      {/* Filter Selections */}
      <div className="flex flex-col sm:flex-row justify-start gap-4 mb-8">
        {/* Department Selection */}
        <div className="relative w-64">
          <select
            value={selectedDepartment}
            onChange={(e) => {
              setSelectedDepartment(e.target.value);
              setSelectedBatch(""); // Reset batch when department changes
              setTimetable(null);
            }}
            className="appearance-none w-full px-4 py-2 pr-8 bg-[#F5F7FA] border border-[#F5F7FA] rounded-lg text-[#1B365D] focus:outline-none focus:ring-2 focus:ring-[#1B365D]"
          >
            <option value="">Select Department</option>
            {departments.map((dept) => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        </div>

        {/* Semester Selection */}
        <div className="relative w-64">
          <select
            value={selectedSemester}
            onChange={(e) => {
              setSelectedSemester(e.target.value);
              setSelectedBatch(""); // Reset batch when semester changes
              setTimetable(null);
            }}
            className="appearance-none w-full px-4 py-2 pr-8 bg-[#F5F7FA] border border-[#F5F7FA] rounded-lg text-[#1B365D] focus:outline-none focus:ring-2 focus:ring-[#1B365D]"
          >
            <option value="">Select Semester</option>
            {semesters.map((sem) => (
              <option key={sem} value={sem}>
                {sem}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        </div>

        {/* Schedule Type Selection */}
        <div className="relative w-64">
          <select
            value={selectedScheduleType}
            onChange={(e) => {
              setSelectedScheduleType(e.target.value);
              setSelectedBatch(""); // Reset batch when schedule type changes
              setTimetable(null);
            }}
            className="appearance-none w-full px-4 py-2 pr-8 bg-[#F5F7FA] border border-[#F5F7FA] rounded-lg text-[#1B365D] focus:outline-none focus:ring-2 focus:ring-[#1B365D]"
          >
            <option value="">Select Schedule Type</option>
            {scheduleTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        </div>

        {/* Batch Selection */}
        <div className="relative w-64">
          <select
            value={selectedBatch}
            onChange={(e) => setSelectedBatch(e.target.value)}
            className="appearance-none w-full px-4 py-2 pr-8 bg-[#F5F7FA] border border-[#F5F7FA] rounded-lg text-[#1B365D] focus:outline-none focus:ring-2 focus:ring-[#1B365D]"
            disabled={!selectedDepartment || !selectedSemester || !selectedScheduleType}
          >
            <option value="">Select Your Batch</option>
            {filteredBatches.map((batch) => (
              <option key={batch._id} value={batch.batchName}>
                {batch.batchName} ({batch.intake})
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        </div>
      </div>

      {/* Loading and Error States */}
      {loading && <p className="text-[#1B365D] text-center">Loading timetable...</p>}
      {error && (
        <p className="text-red-500 text-center bg-red-50 p-3 rounded-lg">{error}</p>
      )}

      {/* Timetable Display */}
      {timetable && !loading && !error && (
        <div className="overflow-x-auto">
          <div className="min-w-[1000px]">
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
                          {cell.isStart && cell.subject && (
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
                                <span className="font-medium">Date:</span>{" "}
                                {new Date(cell.subject.date).toLocaleDateString()}
                              </div>
                              <div className="text-sm text-gray-600">
                                <span className="font-medium">Duration:</span> {cell.subject.duration} hr(s)
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
      )}
    </div>
  );
}