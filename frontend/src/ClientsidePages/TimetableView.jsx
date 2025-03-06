import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";

export default function TimetableView() {
  const [schedules, setSchedules] = useState([]);
  const location = useLocation();
  const { batch } = location.state || {};

  useEffect(() => {
    if (batch) {
      axios
        .get("http://localhost:5000/api/timetable/published-timetable", { params: { batch } })
        .then((res) => setSchedules(res.data.schedules || []))
        .catch((err) => console.log(err.response ? err.response.data : err));
    }
  }, [batch]);

  const timeSlots = Array.from({ length: 10 }, (_, i) => {
    const hour = i + 8;
    return `${hour.toString().padStart(2, "0")}:00`;
  });

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

    schedules.forEach((schedule) => {
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
      <h2 className="text-2xl font-bold text-[#1B365D] mb-8">
        Timetable for Batch: {batch || "Unknown"}
      </h2>
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
                              <span className="font-medium">Lecturer:</span>{" "}
                              {cell.subject.lecturer}
                            </div>
                            <div className="text-sm text-gray-600 mb-1">
                              <span className="font-medium">Room:</span>{" "}
                              {cell.subject.room}
                            </div>
                            <div className="text-sm text-gray-600 mb-1">
                              <span className="font-medium">Batch:</span>{" "}
                              {cell.schedule.batch}
                            </div>
                            <div className="text-sm text-gray-600 mb-2">
                              <span className="font-medium">Duration:</span>{" "}
                              {cell.subject.duration} hr(s)
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
    </div>
  );
}