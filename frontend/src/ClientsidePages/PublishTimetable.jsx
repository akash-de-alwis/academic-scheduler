import { useState, useEffect } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import { ChevronDown } from "lucide-react";

export default function PublishTimetable() {
  const [publishedSchedules, setPublishedSchedules] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState("");
  const [batches, setBatches] = useState([]);
  const location = useLocation();
  const navigate = useNavigate();

  const timeSlots = Array.from({ length: 10 }, (_, i) => {
    const hour = i + 8;
    return `${hour.toString().padStart(2, "0")}:00`;
  });

  const weekDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

  const timeToHour = (timeStr) => {
    const [hours] = timeStr.split(":").map(Number);
    return hours;
  };

  useEffect(() => {
    const batchFromState = location.state?.batch;
    if (batchFromState) {
      setSelectedBatch(batchFromState);
    }

    axios
      .get("http://localhost:5000/api/batches")
      .then((res) => setBatches(res.data))
      .catch((err) =>
        console.error("Error fetching batches:", err.response ? err.response.data : err.message)
      );
  }, [location.state]);

  useEffect(() => {
    if (selectedBatch) {
      axios
        .get(`http://localhost:5000/api/timetable/published-timetable?batch=${selectedBatch}`)
        .then((res) => {
          setPublishedSchedules(res.data.schedules || []);
        })
        .catch((err) =>
          console.error("Error fetching published timetable:", err.response ? err.response.data : err.message)
        );
    }
  }, [selectedBatch]);

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

    publishedSchedules.forEach((schedule) => {
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
        <h2 className="text-2xl font-bold text-[#1B365D]">Published Timetable</h2>
        <div className="relative">
          <select
            value={selectedBatch}
            onChange={(e) => setSelectedBatch(e.target.value)}
            className="appearance-none px-4 py-2 pr-8 bg-[#F5F7FA] border border-[#F5F7FA] rounded-lg text-[#1B365D]"
          >
            <option value="">Select Batch</option>
            {batches.map((batch) => (
              <option key={batch._id} value={batch.batchName}>
                {batch.batchName}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        </div>
      </div>

      {selectedBatch ? (
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
      ) : (
        <p className="text-[#1B365D] text-center">Please select a batch to view the published timetable.</p>
      )}
    </div>
  );
}