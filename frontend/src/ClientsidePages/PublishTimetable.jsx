import { useState, useEffect } from "react";
import axios from "axios";
import { ChevronDown, Download, Menu, X, Calendar, LogOut, HelpCircle, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function PublishTimetable() {
  const [batches, setBatches] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [selectedSemester, setSelectedSemester] = useState("");
  const [selectedScheduleType, setSelectedScheduleType] = useState("");
  const [timetable, setTimetable] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date()); // For live clock
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

  // Update clock every second
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

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
      const response = await axios.get("http://localhost:5000/api/timetable/published-timetable", {
        params: { batch: selectedBatch, department: selectedDepartment, semester: selectedSemester, scheduleType: selectedScheduleType },
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

  useEffect(() => {
    if (selectedBatch && selectedDepartment && selectedSemester && selectedScheduleType) {
      fetchTimetable();
    }
  }, [selectedBatch, selectedDepartment, selectedSemester, selectedScheduleType]);

  const departments = [...new Set(batches.map((batch) => batch.department))];
  const semesters = ["Semester1", "Semester2"];
  const scheduleTypes = ["Weekdays", "Weekend"];

  const filteredBatches = batches.filter(
    (batch) =>
      (!selectedDepartment || batch.department === selectedDepartment) &&
      (!selectedSemester || batch.semester === selectedSemester) &&
      (!selectedScheduleType || batch.scheduleType === selectedScheduleType)
  );

  const processTimetableForGrid = () => {
    const grid = {};
    weekDays.forEach((day) => {
      grid[day] = {};
      timeSlots.forEach((timeSlot) => {
        grid[day][timeSlot] = { isOccupied: false, schedule: null, subject: null, isStart: false, rowSpan: 0 };
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

  const downloadPDF = () => {
    if (!timetable) {
      alert("No timetable available to download!");
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

    doc.setFontSize(12);
    doc.text(`Department: ${selectedDepartment} | Semester: ${selectedSemester} | Type: ${selectedScheduleType}`, pageWidth / 2, 40, { align: "center" });

    const tableData = [];
    timeSlots.forEach((time) => {
      const row = [time];
      weekDays.forEach((day) => {
        const cell = grid[day][time];
        if (cell.isStart && cell.subject) {
          row.push(`${cell.subject.subjectName}\nLecturer: ${cell.subject.lecturer}\nRoom: ${cell.subject.room}\nDuration: ${cell.subject.duration} hr(s)`);
        } else {
          row.push("");
        }
      });
      tableData.push(row);
    });

    autoTable(doc, {
      startY: 50,
      head: [["Time", ...weekDays]],
      body: tableData,
      styles: { fontSize: 8, cellPadding: 2, overflow: "linebreak" },
      headStyles: { fillColor: [27, 54, 93], textColor: 255 },
      alternateRowStyles: { fillColor: [245, 247, 250] },
      columnStyles: { 0: { cellWidth: 20 } },
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

  const downloadCSV = () => {
    if (!timetable) {
      alert("No timetable available to export!");
      return;
    }

    const headers = ["Time", ...weekDays];
    const csvRows = [headers.join(",")];

    timeSlots.forEach((time) => {
      const row = [time];
      weekDays.forEach((day) => {
        const cell = grid[day][time];
        if (cell.isStart && cell.subject) {
          const details = `${cell.subject.subjectName},Lecturer: ${cell.subject.lecturer},Room: ${cell.subject.room},Duration: ${cell.subject.duration} hr(s)`;
          row.push(`"${details.replace(/"/g, '""')}"`);
        } else {
          row.push("");
        }
      });
      csvRows.push(row.join(","));
    });

    const metadata = `\n"Department: ${selectedDepartment}, Semester: ${selectedSemester}, Schedule Type: ${selectedScheduleType}"`;
    const csvContent = csvRows.join("\n") + metadata;

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.setAttribute("href", URL.createObjectURL(blob));
    link.setAttribute("download", `Timetable_${selectedBatch}_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex min-h-screen bg-white">
      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 w-64 bg-[#1B365D] text-white transform ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } transition-transform duration-300 ease-in-out z-50 lg:translate-x-0 lg:static lg:inset-0`}
      >
        <div className="flex items-center justify-between p-4 border-b border-[#F5F7FA]/20">
          <h3 className="text-lg font-semibold">Timetable Menu</h3>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden">
            <X className="w-6 h-6" />
          </button>
        </div>
        <nav className="p-4 space-y-2">
          <button
            onClick={() => navigate("/PublishTimetable")}
            className="flex items-center gap-2 w-full px-4 py-2 text-left bg-[#152c4d] rounded-lg"
          >
            <Calendar className="w-5 h-5" />
            View Timetable
          </button>
          <button
            onClick={() => navigate("/help")} // Placeholder for help page
            className="flex items-center gap-2 w-full px-4 py-2 text-left hover:bg-[#152c4d] rounded-lg"
          >
            <HelpCircle className="w-5 h-5" />
            Help
          </button>
          <button
            onClick={() => {
              // Add logout logic here (e.g., clear token, redirect to login)
              navigate("/login");
            }}
            className="flex items-center gap-2 w-full px-4 py-2 text-left hover:bg-[#152c4d] rounded-lg"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-[#1B365D]">View Your Timetable</h2>
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden">
            <Menu className="w-6 h-6 text-[#1B365D]" />
          </button>
        </div>

        {/* Calendar and Clock */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="bg-[#F5F7FA] p-4 rounded-lg shadow-md flex items-center gap-2">
            <Calendar className="w-6 h-6 text-[#1B365D]" />
            <span className="text-[#1B365D] font-medium">
              {currentTime.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
            </span>
          </div>
          <div className="bg-[#F5F7FA] p-4 rounded-lg shadow-md flex items-center gap-2">
            <Clock className="w-6 h-6 text-[#1B365D]" />
            <span className="text-[#1B365D] font-medium">
              {currentTime.toLocaleTimeString("en-US", { hour12: true, hour: "2-digit", minute: "2-digit", second: "2-digit" })}
            </span>
          </div>
        </div>

        {/* Filter Selections */}
        <div className="flex flex-col sm:flex-row justify-start gap-4 mb-8">
          <div className="relative w-64">
            <select
              value={selectedDepartment}
              onChange={(e) => {
                setSelectedDepartment(e.target.value);
                setSelectedBatch("");
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
          <div className="relative w-64">
            <select
              value={selectedSemester}
              onChange={(e) => {
                setSelectedSemester(e.target.value);
                setSelectedBatch("");
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
          <div className="relative w-64">
            <select
              value={selectedScheduleType}
              onChange={(e) => {
                setSelectedScheduleType(e.target.value);
                setSelectedBatch("");
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
        {error && <p className="text-red-500 text-center bg-red-50 p-3 rounded-lg">{error}</p>}

        {/* Timetable Display */}
        {timetable && !loading && !error && (
          <>
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

            {/* Action Buttons */}
            <div className="flex justify-end gap-4 mt-6">
              <button
                onClick={downloadPDF}
                className="bg-[#1B365D] text-white px-6 py-2 rounded-lg flex items-center gap-2 hover:bg-[#1B365D]/90 shadow-lg hover:shadow-xl transition-all"
              >
                <Download className="w-5 h-5" />
                Download PDF
              </button>
              <button
                onClick={downloadCSV}
                className="bg-[#1B365D] text-white px-6 py-2 rounded-lg flex items-center gap-2 hover:bg-[#1B365D]/90 shadow-lg hover:shadow-xl transition-all"
              >
                <Download className="w-5 h-5" />
                Export CSV
              </button>
            </div>
          </>
        )}
      </div>

      {/* Overlay for mobile sidebar */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}
