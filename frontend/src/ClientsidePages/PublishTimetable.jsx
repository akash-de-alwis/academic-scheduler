import { useState, useEffect } from "react";
import axios from "axios";
import { ChevronDown, Download, Calendar, LogOut, Clock, RefreshCw } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function PublishTimetable() {
  const [batches, setBatches] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState("");
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [currentTime, setCurrentTime] = useState(new Date());
  const navigate = useNavigate();

  const timeSlots = Array.from({ length: 10 }, (_, i) => {
    const hour = i + 8;
    return `${hour.toString().padStart(2, "0")}:00`;
  });

  const weekDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

  const timeToHour = (timeStr) => parseInt(timeStr.split(":")[0], 10);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchBatchesAndSchedules = async () => {
      setLoading(true);
      try {
        const [batchRes, scheduleRes] = await Promise.all([
          axios.get("http://localhost:5000/api/batches"),
          axios.get("http://localhost:5000/api/timetable"),
        ]);
        setBatches(batchRes.data);
        const updatedSchedules = scheduleRes.data.map((schedule) => ({
          ...schedule,
          subjects: schedule.subjects.map((sub) => ({
            ...sub,
            duration: sub.duration || "1",
          })),
        }));
        setSchedules(updatedSchedules);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    fetchBatchesAndSchedules();
  }, []);

  const filteredSchedules = schedules
    .filter((schedule) => schedule.batch === selectedBatch)
    .map((schedule) => ({
      ...schedule,
      subjects: schedule.subjects.filter((subject) => {
        const subjectDate = new Date(subject.date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return subjectDate >= today;
      }),
    }))
    .filter((schedule) => schedule.subjects.length > 0);

  const processTimetableForGrid = () => {
    const grid = {};
    weekDays.forEach((day) => {
      grid[day] = {};
      timeSlots.forEach((timeSlot) => {
        grid[day][timeSlot] = { isOccupied: false, schedule: null, subject: null, isStart: false, rowSpan: 0 };
      });
    });

    filteredSchedules.forEach((schedule) => {
      schedule.subjects.forEach((subject) => {
        const scheduleDate = new Date(subject.date);
        const scheduleDay = scheduleDate.getDay();
        const day = weekDays[scheduleDay === 0 ? 6 : scheduleDay - 1];
        const scheduleHour = timeToHour(subject.time);
        const scheduleDuration = parseInt(subject.duration || "1");
        const timeSlot = timeSlots.find((ts) => timeToHour(ts) === scheduleHour);
        if (!timeSlot || !grid[day]) return;
        grid[day][timeSlot] = {
          isOccupied: true,
          schedule,
          subject,
          isStart: true,
          rowSpan: scheduleDuration,
        };
        for (let i = 1; i < scheduleDuration; i++) {
          const nextHour = scheduleHour + i;
          if (nextHour > 17) break;
          const nextTimeSlot = `${nextHour.toString().padStart(2, "0")}:00`;
          if (grid[day][nextTimeSlot]) {
            grid[day][nextTimeSlot] = { isOccupied: true, schedule, subject, isStart: false };
          }
        }
      });
    });
    return grid;
  };

  const grid = processTimetableForGrid();

  const downloadPDF = () => {
    if (filteredSchedules.length === 0) {
      alert("No current or future timetable available to download!");
      return;
    }
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    doc.setFontSize(18);
    doc.setTextColor(27, 54, 93);
    doc.text(`Timetable - ${selectedBatch}`, pageWidth / 2, 20, { align: "center" });
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, pageWidth / 2, 30, { align: "center" });

    const tableData = [];
    filteredSchedules.forEach((schedule) => {
      schedule.subjects.forEach((subject) => {
        tableData.push([
          schedule.batch,
          subject.subjectName,
          subject.lecturer,
          subject.room,
          subject.date,
          subject.time,
          `${subject.duration} hr(s)`,
        ]);
      });
    });

    autoTable(doc, {
      startY: 40,
      head: [["Batch", "Subject", "Lecturer", "Room", "Date", "Time", "Duration"]],
      body: tableData,
      styles: { fontSize: 8, cellPadding: 3, overflow: "linebreak" },
      headStyles: { fillColor: [27, 54, 93], textColor: 255 },
      alternateRowStyles: { fillColor: [245, 247, 250] },
      columnStyles: { 0: { cellWidth: 30 }, 1: { cellWidth: 40 } },
    });

    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(100);
      doc.text(`Page ${i} of ${pageCount}`, pageWidth - 20, doc.internal.pageSize.height - 10);
    }
    doc.save(`Timetable_${selectedBatch}_${new Date().toISOString().split("T")[0]}.pdf`);
  };

  const resetFilters = () => {
    setSelectedBatch("");
    setError("");
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="fixed top-0 left-0 h-screen bg-white border-r border-gray-200 w-64 shadow-lg overflow-y-auto z-10">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-[#1B365D] mb-8">Academic Scheduler</h2>
          <nav className="space-y-2">
            <Link
              to="/"
              className="flex items-center py-3 px-4 rounded-lg text-[#1B365D] hover:bg-[#F5F7FA] hover:shadow-sm transition-all duration-300 font-medium"
            >
              <div className="w-8 h-8 flex items-center justify-center mr-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              Home
            </Link>
            <Link
              to="/PublishTimetable"
              className="flex items-center py-3 px-4 rounded-lg text-[#FFFFFF] bg-[#1B365D] hover:bg-[#1B365D]/90 font-semibold transition-all duration-300"
            >
              <div className="w-8 h-8 flex items-center justify-center mr-3">
                <Calendar className="h-5 w-5" />
              </div>
              View Timetable
            </Link>
            <Link
              to="/TimeLecture"
              className="flex items-center py-3 px-4 rounded-lg text-[#1B365D] hover:bg-[#F5F7FA] hover:shadow-sm transition-all duration-300 font-medium"
            >
              <div className="w-8 h-8 flex items-center justify-center mr-3">
                <Clock className="h-5 w-5" />
              </div>
              Lecturer Timetable
            </Link>
            <button
              onClick={() => navigate("/")}
              className="flex items-center py-3 px-4 rounded-lg text-[#1B365D] hover:bg-[#F5F7FA] hover:shadow-sm transition-all duration-300 font-medium w-full text-left"
            >
              <div className="w-8 h-8 flex items-center justify-center mr-3">
                <LogOut className="h-5 w-5" />
              </div>
              Logout
            </button>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8 ml-64">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold text-[#1B365D] bg-gradient-to-r from-[#1B365D] to-[#4A90E2] bg-clip-text text-transparent">
            View Your Timetable
          </h2>
        </div>

        {/* Live Calendar and Clock */}
        <div className="flex flex-col sm:flex-row gap-6 mb-8">
          <div className="relative bg-white p-6 rounded-xl shadow-lg border-l-4 border-[#1B365D] transform hover:scale-105 transition-all duration-300">
            <div className="flex items-center gap-3">
              <Calendar className="w-8 h-8 text-[#1B365D] animate-pulse" />
              <div>
                <p className="text-sm text-gray-500 font-medium">Today</p>
                <p className="text-lg font-semibold text-[#1B365D]">
                  {currentTime.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
                </p>
              </div>
            </div>
            <div className="absolute top-2 right-2 bg-[#1B365D] text-white text-xs font-semibold px-2 py-1 rounded-full shadow-md">
              Live
            </div>
          </div>
          <div className="relative bg-white p-6 rounded-xl shadow-lg border-l-4 border-[#1B365D] transform hover:scale-105 transition-all duration-300">
            <div className="flex items-center gap-3">
              <Clock className="w-8 h-8 text-[#1B365D] animate-spin-slow" />
              <div>
                <p className Comuni="text-sm text-gray-500 font-medium">Current Time</p>
                <p className="text-lg font-semibold text-[#1B365D]">
                  {currentTime.toLocaleTimeString("en-US", { hour12: true, hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                </p>
              </div>
            </div>
            <div className="absolute top-2 right-2 bg-[#1B365D] text-white text-xs font-semibold px-2 py-1 rounded-full shadow-md">
              Live
            </div>
          </div>
        </div>

        {/* Batch Selection */}
        <div className="flex justify-start gap-4 mb-8">
          <div className="relative w-72 group">
            <select
              value={selectedBatch}
              onChange={(e) => setSelectedBatch(e.target.value)}
              className="appearance-none w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-[#1B365D] focus:outline-none focus:ring-2 focus:ring-[#1B365D] shadow-sm hover:shadow-md transition-shadow"
            >
              <option value="">Select Your Batch</option>
              {batches.map((batch) => (
                <option key={batch._id} value={batch.batchName}>
                  {`${batch.batchName} (${batch.department}, ${batch.semester}, ${batch.scheduleType})`}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <span className="absolute -top-6 left-2 text-xs text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity">Batch</span>
          </div>
          <button
            onClick={resetFilters}
            className="flex items-center gap-2 px-4 py-3 bg-[#1B365D] text-white rounded-lg hover:bg-[#1B365D]/90 shadow-lg hover:shadow-xl transition-all"
          >
            <RefreshCw className="w-5 h-5" />
            Reset
          </button>
        </div>

        {/* Loading and Error States */}
        {loading && <p className="text-[#1B365D] text-center animate-pulse">Loading timetable...</p>}
        {error && <p className="text-red-500 text-center bg-red-50 p-3 rounded-lg shadow-md">{error}</p>}

        {/* Timetable Display */}
        {!loading && !error && selectedBatch && (
          filteredSchedules.length > 0 ? (
            <>
              <div className="overflow-x-auto shadow-xl rounded-lg">
                <div className="min-w-[1000px]">
                  <table className="w-full border-collapse bg-white rounded-lg border-2 border-gray-200">
                    <thead>
                      <tr className="bg-gradient-to-r from-[#1B365D] to-[#4A90E2] text-white">
                        <th className="p-4 font-medium border-b-2 border-r-2 border-gray-200 text-left">Time</th>
                        {weekDays.map((day, index) => (
                          <th
                            key={day}
                            className={`p-4 font-medium text-center border-b-2 ${index < weekDays.length - 1 ? "border-r-2" : ""} border-gray-200`}
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
                            className={`p-4 text-[#1B365D] border-r-2 ${timeIndex < timeSlots.length - 1 ? "border-b-2" : ""} border-gray-200 font-medium`}
                          >
                            {time}
                          </td>
                          {weekDays.map((day, dayIndex) => {
                            const cell = grid[day][time];
                            if (cell.isOccupied && !cell.isStart) return null;
                            return (
                              <td
                                key={`${day}-${time}`}
                                className={`p-2 ${dayIndex < weekDays.length - 1 ? "border-r-2" : ""} ${timeIndex < timeSlots.length - 1 ? "border-b-2" : ""} border-gray-200 align-top`}
                                rowSpan={cell.isStart ? cell.rowSpan : 1}
                              >
                                {cell.isStart && cell.subject && (
                                  <div className="bg-white rounded-lg p-3 h-full shadow-md border-l-4 border-[#1B365D] transform hover:scale-105 transition-transform">
                                    <div className="font-semibold text-[#1B365D] mb-1">{cell.subject.subjectName}</div>
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

              {/* Action Buttons */}
              <div className="flex justify-end gap-4 mt-6">
                <button
                  onClick={downloadPDF}
                  className="bg-gradient-to-r from-[#1B365D] to-[#4A90E2] text-white px-6 py-2 rounded-lg flex items-center gap-2 hover:from-[#1B365D]/90 hover:to-[#4A90E2]/90 shadow-lg hover:shadow-xl transition-all"
                >
                  <Download className="w-5 h-5" />
                  Download PDF
                </button>
              </div>
            </>
          ) : (
            <p className="text-[#1B365D] text-lg bg-white p-4 rounded-lg shadow-md">
              No current or future schedules found for {selectedBatch}.
            </p>
          )
        )}
        {!loading && !error && !selectedBatch && (
          <p className="text-[#1B365D] text-lg bg-white p-4 rounded-lg shadow-md">
            Please select a batch to view the timetable.
          </p>
        )}
      </div>
    </div>
  );
}