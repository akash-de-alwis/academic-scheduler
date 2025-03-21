import { useState, useEffect } from "react";
import axios from "axios";
import { ChevronDown, Download } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function TimetableReports() {
  const [schedules, setSchedules] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState("");
  const [reportType, setReportType] = useState("batch"); // "batch" or "summary"
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);

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
    setLoading(true);
    Promise.all([
      axios.get("http://localhost:5000/api/timetable"),
      axios.get("http://localhost:5000/api/batches"),
    ])
      .then(([timetableRes, batchesRes]) => {
        const updatedSchedules = timetableRes.data.map((schedule) => ({
          ...schedule,
          subjects: schedule.subjects.map((sub) => ({
            ...sub,
            duration: sub.duration || "1",
          })),
        }));
        setSchedules(updatedSchedules);
        setBatches(batchesRes.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching data:", err.response ? err.response.data : err.message);
        setLoading(false);
      });
  }, []);

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

    const filteredSchedules = selectedBatch
      ? schedules.filter((s) => `${s.batch} (${batches.find((b) => b.batchName === s.batch)?.intake || ""})` === selectedBatch)
      : schedules;

    filteredSchedules.forEach((schedule) => {
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

  // Calculate Summary Statistics
  const getSummaryStats = () => {
    const totalSchedules = schedules.length;
    const totalHours = schedules.reduce((sum, s) => 
      sum + s.subjects.reduce((subSum, sub) => subSum + parseInt(sub.duration || "1"), 0), 0);
    
    const today = new Date();
    const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay() + (today.getDay() === 0 ? -6 : 1)));
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(endOfWeek.getDate() + 6);
    
    const weeklySchedules = schedules.filter((s) => 
      s.subjects.some((sub) => {
        const subDate = new Date(sub.date);
        return subDate >= startOfWeek && subDate <= endOfWeek;
      })
    ).length;

    const conflicts = []; // Simplified conflict detection (room/lecturer overlap)
    const timeRoomMap = {};
    schedules.forEach((s) => {
      s.subjects.forEach((sub) => {
        const key = `${sub.date}-${sub.time}-${sub.room}`;
        if (timeRoomMap[key]) conflicts.push({ schedule1: timeRoomMap[key], schedule2: s, subject: sub });
        else timeRoomMap[key] = s;
      });
    });

    const upcomingClasses = schedules
      .flatMap((s) => s.subjects.map((sub) => ({ ...sub, batch: s.batch })))
      .filter((sub) => new Date(sub.date) >= new Date())
      .sort((a, b) => new Date(a.date + " " + a.time) - new Date(b.date + " " + b.time))
      .slice(0, 5);

    return { totalSchedules, totalHours, weeklySchedules, conflicts: conflicts.length, upcomingClasses };
  };

  // Batch-Specific PDF
  const downloadBatchPDF = () => {
    if (!selectedBatch) {
      alert("Please select a batch to download the timetable!");
      return;
    }

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    doc.setFontSize(18);
    doc.setTextColor(27, 54, 93);
    doc.text(`Timetable Report - ${selectedBatch}`, pageWidth / 2, 20, { align: "center" });

    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, pageWidth / 2, 30, { align: "center" });

    const batchDetails = batches.find((b) => `${b.batchName} (${b.intake})` === selectedBatch);
    if (batchDetails) {
      doc.setFontSize(12);
      doc.text(`Semester: ${batchDetails.semester} | Schedule Type: ${batchDetails.scheduleType}`, pageWidth / 2, 40, {
        align: "center",
      });
    }

    const tableData = [];
    timeSlots.forEach((time) => {
      const row = [time];
      weekDays.forEach((day) => {
        const cell = grid[day][time];
        if (cell.isStart && cell.subject) {
          row.push(
            `${cell.subject.subjectName}\nLecturer: ${cell.subject.lecturer}\nRoom: ${cell.subject.room}\nDuration: ${cell.subject.duration} hr(s)`
          );
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

    doc.save(`Timetable_${selectedBatch.replace(" ", "_")}_${new Date().toISOString().split("T")[0]}.pdf`);
  };

  // Batch-Specific CSV
  const downloadBatchCSV = () => {
    if (!selectedBatch) {
      alert("Please select a batch to export the timetable!");
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

    const batchDetails = batches.find((b) => `${b.batchName} (${b.intake})` === selectedBatch);
    const metadata = batchDetails ? `\n"Semester: ${batchDetails.semester}, Schedule Type: ${batchDetails.scheduleType}"` : "";
    const csvContent = csvRows.join("\n") + metadata;

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.setAttribute("href", URL.createObjectURL(blob));
    link.setAttribute("download", `Timetable_${selectedBatch.replace(" ", "_")}_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Summary PDF
  const downloadSummaryPDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const stats = getSummaryStats();

    doc.setFontSize(18);
    doc.setTextColor(27, 54, 93);
    doc.text("Timetable Summary Report", pageWidth / 2, 20, { align: "center" });

    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, pageWidth / 2, 30, { align: "center" });

    doc.setFontSize(12);
    let yPos = 40;
    doc.text(`Total Schedules: ${stats.totalSchedules}`, 20, yPos);
    yPos += 10;
    doc.text(`Total Hours Scheduled: ${stats.totalHours}`, 20, yPos);
    yPos += 10;
    doc.text(`Weekly Schedules: ${stats.weeklySchedules}`, 20, yPos);
    yPos += 10;
    doc.text(`Conflicts Detected: ${stats.conflicts}`, 20, yPos);

    yPos += 20;
    doc.setFontSize(14);
    doc.text("Upcoming Classes (Next 5)", 20, yPos);
    yPos += 10;

    const upcomingTable = stats.upcomingClasses.map((cls) => [
      cls.date,
      cls.time,
      cls.subjectName,
      cls.lecturer,
      cls.room,
      cls.batch,
    ]);

    autoTable(doc, {
      startY: yPos,
      head: [["Date", "Time", "Subject", "Lecturer", "Room", "Batch"]],
      body: upcomingTable,
      styles: { fontSize: 8, cellPadding: 2, overflow: "linebreak" },
      headStyles: { fillColor: [27, 54, 93], textColor: 255 },
      alternateRowStyles: { fillColor: [245, 247, 250] },
    });

    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(100);
      doc.text(`Page ${i} of ${pageCount}`, pageWidth - 20, doc.internal.pageSize.height - 10);
    }

    doc.save(`Summary_Report_${new Date().toISOString().split("T")[0]}.pdf`);
  };

  // Summary CSV
  const downloadSummaryCSV = () => {
    const stats = getSummaryStats();
    const csvRows = [
      "Statistic,Value",
      `Total Schedules,${stats.totalSchedules}`,
      `Total Hours Scheduled,${stats.totalHours}`,
      `Weekly Schedules,${stats.weeklySchedules}`,
      `Conflicts Detected,${stats.conflicts}`,
      "",
      "Upcoming Classes",
      "Date,Time,Subject,Lecturer,Room,Batch",
      ...stats.upcomingClasses.map((cls) =>
        `"${cls.date}","${cls.time}","${cls.subjectName}","${cls.lecturer}","${cls.room}","${cls.batch}"`
      ),
    ];

    const csvContent = csvRows.join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.setAttribute("href", URL.createObjectURL(blob));
    link.setAttribute("download", `Summary_Report_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="min-h-screen p-8 bg-white flex items-center justify-center">
        <p className="text-[#1B365D] text-lg animate-pulse">Loading timetable reports...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8 bg-white">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold text-[#1B365D]">Timetable Reports</h2>
        <div className="flex gap-4">
          <div className="relative">
            <select
              value={reportType}
              onChange={(e) => {
                setReportType(e.target.value);
                if (e.target.value === "summary") setSelectedBatch("");
              }}
              className="appearance-none px-4 py-2 pr-8 bg-[#F5F7FA] border border-[#F5F7FA] rounded-lg text-[#1B365D] shadow-md focus:ring-2 focus:ring-[#1B365D]/50"
            >
              <option value="batch">Batch-Specific Report</option>
              <option value="summary">Summary Report</option>
            </select>
            <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          </div>
          {reportType === "batch" && (
            <div className="relative">
              <select
                value={selectedBatch}
                onChange={(e) => setSelectedBatch(e.target.value)}
                className="appearance-none px-4 py-2 pr-8 bg-[#F5F7FA] border border-[#F5F7FA] rounded-lg text-[#1B365D] shadow-md focus:ring-2 focus:ring-[#1B365D]/50"
              >
                <option value="">Select Batch</option>
                {batches.map((batch) => (
                  <option key={batch._id} value={`${batch.batchName} (${batch.intake})`}>
                    {`${batch.batchName} (${batch.intake})`}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            </div>
          )}
        </div>
      </div>

      {reportType === "batch" && selectedBatch ? (
        <>
          <div className="overflow-x-auto shadow-lg rounded-lg">
            <div className="min-w-[1200px]">
              <table className="w-full border-collapse bg-[#F5F7FA] rounded-lg border-2 border-gray-300">
                <thead>
                  <tr>
                    <th className="p-4 font-medium text-[#1B365D] border-b-2 border-r-2 border-gray-300 text-left bg-[#1B365D]/10">
                      Time
                    </th>
                    {weekDays.map((day, index) => (
                      <th
                        key={day}
                        className={`p-4 font-medium text-[#1B365D] text-center border-b-2 ${
                          index < weekDays.length - 1 ? "border-r-2" : ""
                        } border-gray-300 bg-[#1B365D]/10`}
                      >
                        {day}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {timeSlots.map((time, timeIndex) => (
                    <tr key={`time-${time}`} className="hover:bg-gray-100 transition-colors">
                      <td
                        className={`p-4 text-[#1B365D] border-r-2 ${
                          timeIndex < timeSlots.length - 1 ? "border-b-2" : ""
                        } border-gray-300 font-medium`}
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
                              <div className="bg-white rounded-lg p-3 shadow-md border-l-4 border-[#1B365D] transform hover:scale-105 transition-transform">
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

          <div className="flex justify-end gap-4 mt-6">
            <button
              onClick={downloadBatchPDF}
              className="bg-[#1B365D] text-white px-6 py-2 rounded-lg flex items-center gap-2 hover:bg-[#1B365D]/90 shadow-lg hover:shadow-xl transition-all"
            >
              <Download className="w-5 h-5" />
              Download PDF
            </button>
            <button
              onClick={downloadBatchCSV}
              className="bg-[#1B365D] text-white px-6 py-2 rounded-lg flex items-center gap-2 hover:bg-[#1B365D]/90 shadow-lg hover:shadow-xl transition-all"
            >
              <Download className="w-5 h-5" />
              Export CSV
            </button>
          </div>
        </>
      ) : reportType === "summary" ? (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold text-[#1B365D] mb-4">Summary Statistics</h3>
          {(() => {
            const stats = getSummaryStats();
            return (
              <>
                <p className="text-[#1B365D] mb-2">Total Schedules: {stats.totalSchedules}</p>
                <p className="text-[#1B365D] mb-2">Total Hours Scheduled: {stats.totalHours}</p>
                <p className="text-[#1B365D] mb-2">Weekly Schedules: {stats.weeklySchedules}</p>
                <p className="text-[#1B365D] mb-4">Conflicts Detected: {stats.conflicts}</p>
                <h4 className="text-lg font-medium text-[#1B365D] mb-2">Upcoming Classes (Next 5)</h4>
                <ul className="list-disc pl-5 text-[#1B365D]">
                  {stats.upcomingClasses.map((cls, idx) => (
                    <li key={idx} className="mb-2">
                      {cls.date} at {cls.time}: {cls.subjectName} (Lecturer: {cls.lecturer}, Room: {cls.room}, Batch: {cls.batch})
                    </li>
                  ))}
                </ul>
                <div className="flex justify-end gap-4 mt-6">
                  <button
                    onClick={downloadSummaryPDF}
                    className="bg-[#1B365D] text-white px-6 py-2 rounded-lg flex items-center gap-2 hover:bg-[#1B365D]/90 shadow-lg hover:shadow-xl transition-all"
                  >
                    <Download className="w-5 h-5" />
                    Download PDF
                  </button>
                  <button
                    onClick={downloadSummaryCSV}
                    className="bg-[#1B365D] text-white px-6 py-2 rounded-lg flex items-center gap-2 hover:bg-[#1B365D]/90 shadow-lg hover:shadow-xl transition-all"
                  >
                    <Download className="w-5 h-5" />
                    Export CSV
                  </button>
                </div>
              </>
            );
          })()}
        </div>
      ) : (
        <div className="text-center text-[#1B365D] text-lg mt-20">
          Please select a report type and, if applicable, a batch to view and download the report.
        </div>
      )}
    </div>
  );
}