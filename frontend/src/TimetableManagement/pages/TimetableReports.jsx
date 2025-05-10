import { useState, useEffect } from "react";
import axios from "axios";
import { ChevronDown, Download } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Bar } from "react-chartjs-2"; // For bar chart
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js";
import { motion } from "framer-motion"; // For animations

// Register ChartJS components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function TimetableReports() {
  const [schedules, setSchedules] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState("");
  const [reportType, setReportType] = useState("batch");
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

    const conflicts = [];
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

  const summaryStatsChartData = () => {
    const stats = getSummaryStats();
    return {
      labels: ["Total Schedules", "Total Hours", "Weekly Schedules", "Conflicts"],
      datasets: [
        {
          label: "Timetable Stats",
          data: [stats.totalSchedules, stats.totalHours, stats.weeklySchedules, stats.conflicts],
          backgroundColor: ["#1B365D", "#2A4A7A", "#3B5E9B", "#FF6B6B"],
          borderColor: ["#1B365D", "#2A4A7A", "#3B5E9B", "#FF6B6B"],
          borderWidth: 1,
        },
      ],
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen p-8 bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <motion.p
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="text-[#1B365D] text-lg font-semibold"
        >
          Loading timetable reports...
        </motion.p>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8 bg-gradient-to-br from-gray-50 to-gray-100">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex justify-between items-center mb-8"
      >
        <h2 className="text-3xl font-bold text-[#1B365D] tracking-tight">Timetable Reports</h2>
        <div className="flex gap-4">
          <div className="relative">
            <select
              value={reportType}
              onChange={(e) => {
                setReportType(e.target.value);
                if (e.target.value === "summary") setSelectedBatch("");
              }}
              className="appearance-none px-4 py-2 pr-8 bg-white border border-gray-200 rounded-lg text-[#1B365D] shadow-md focus:ring-2 focus:ring-[#1B365D]/50 transition-all"
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
                className="appearance-none px-4 py-2 pr-8 bg-white border border-gray-200 rounded-lg text-[#1B365D] shadow-md focus:ring-2 focus:ring-[#1B365D]/50 transition-all"
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
      </motion.div>

      {reportType === "batch" && selectedBatch ? (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="overflow-x-auto shadow-2xl rounded-xl bg-white"
          >
            <div className="min-w-[1200px]">
              <table className="w-full border-collapse rounded-xl overflow-hidden">
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
                        const cell = grid[day][time];
                        if (cell.isOccupied && !cell.isStart) return null;
                        return (
                          <td
                            key={`${day}-${time}`}
                            className={`p-2 ${
                              dayIndex < weekDays.length - 1 ? "border-r-2" : ""
                            } ${
                              timeIndex < timeSlots.length - 1 ? "border-b-2" : ""
                            } border-[#1B365D]/40 align-top`}
                            rowSpan={cell.isStart ? cell.rowSpan : 1}
                          >
                            {cell.isStart && cell.schedule && cell.subject && (
                              <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.3 }}
                                className="bg-gradient-to-br from-white to-gray-50 rounded-lg p-3 shadow-md border-l-4 border-[#1B365D] hover:shadow-lg transition-all"
                              >
                                <div className="font-semibold text-[#1B365D] mb-1">
                                  {cell.subject.subjectName}
                                </div>
                                <div className="text-xs text-gray-700 mb-1">
                                  <span className="font-medium">Lecturer:</span> {cell.subject.lecturer}
                                </div>
                                <div className="text-xs text-gray-700 mb-1">
                                  <span className="font-medium">Room:</span> {cell.subject.room}
                                </div>
                                <div className="text-xs text-gray-700">
                                  <span className="font-medium">Duration:</span> {cell.subject.duration} hr(s)
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

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="flex justify-end gap-4 mt-6"
          >
            <button
              onClick={downloadBatchPDF}
              className="bg-gradient-to-r from-[#1B365D] to-[#2A4A7A] text-white px-6 py-2 rounded-lg flex items-center gap-2 hover:from-[#1B365D]/90 hover:to-[#2A4A7A]/90 shadow-lg hover:shadow-xl transition-all"
            >
              <Download className="w-5 h-5" />
              Download PDF
            </button>
            <button
              onClick={downloadBatchCSV}
              className="bg-gradient-to-r from-[#1B365D] to-[#2A4A7A] text-white px-6 py-2 rounded-lg flex items-center gap-2 hover:from-[#1B365D]/90 hover:to-[#2A4A7A]/90 shadow-lg hover:shadow-xl transition-all"
            >
              <Download className="w-5 h-5" />
              Export CSV
            </button>
          </motion.div>
        </>
      ) : reportType === "summary" ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          {/* Summary Stats Card */}
          <motion.div
            className="bg-white p-6 rounded-xl shadow-xl hover:shadow-2xl transition-shadow"
            whileHover={{ y: -5 }}
          >
            <h3 className="text-xl font-semibold text-[#1B365D] mb-4">Summary Statistics</h3>
            <div className="space-y-4">
              {(() => {
                const stats = getSummaryStats();
                return (
                  <>
                    <div className="bg-gradient-to-r from-[#1B365D]/10 to-transparent p-4 rounded-lg">
                      <p className="text-[#1B365D] font-medium">Total Schedules: <span className="font-bold">{stats.totalSchedules}</span></p>
                    </div>
                    <div className="bg-gradient-to-r from-[#2A4A7A]/10 to-transparent p-4 rounded-lg">
                      <p className="text-[#1B365D] font-medium">Total Hours: <span className="font-bold">{stats.totalHours}</span></p>
                    </div>
                    <div className="bg-gradient-to-r from-[#3B5E9B]/10 to-transparent p-4 rounded-lg">
                      <p className="text-[#1B365D] font-medium">Weekly Schedules: <span className="font-bold">{stats.weeklySchedules}</span></p>
                    </div>
                    <div className="bg-gradient-to-r from-[#FF6B6B]/10 to-transparent p-4 rounded-lg">
                      <p className="text-[#1B365D] font-medium">Conflicts: <span className="font-bold">{stats.conflicts}</span></p>
                    </div>
                  </>
                );
              })()}
            </div>
            {/* Bar Chart */}
            <div className="mt-6">
              <Bar
                data={summaryStatsChartData()}
                options={{
                  responsive: true,
                  plugins: {
                    legend: { display: false },
                    title: { display: true, text: "Timetable Overview", color: "#1B365D", font: { size: 16 } },
                  },
                  scales: {
                    y: { beginAtZero: true, title: { display: true, text: "Count", color: "#1B365D" } },
                    x: { title: { display: true, text: "Metrics", color: "#1B365D" } },
                  },
                }}
              />
            </div>
          </motion.div>

          {/* Upcoming Classes Card */}
          <motion.div
            className="bg-white p-6 rounded-xl shadow-xl hover:shadow-2xl transition-shadow"
            whileHover={{ y: -5 }}
          >
            <h3 className="text-xl font-semibold text-[#1B365D] mb-4">Upcoming Classes (Next 5)</h3>
            <div className="space-y-4">
              {getSummaryStats().upcomingClasses.map((cls, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="bg-gradient-to-r from-[#1B365D]/5 to-transparent p-4 rounded-lg border-l-4 border-[#1B365D]"
                >
                  <p className="text-[#1B365D] font-medium">{cls.date} at {cls.time}</p>
                  <p className="text-sm text-gray-700"><span className="font-medium">Subject:</span> {cls.subjectName}</p>
                  <p className="text-sm text-gray-700"><span className="font-medium">Lecturer:</span> {cls.lecturer}</p>
                  <p className="text-sm text-gray-700"><span className="font-medium">Room:</span> {cls.room}</p>
                  <p className="text-sm text-gray-700"><span className="font-medium">Batch:</span> {cls.batch}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Download Buttons */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="col-span-2 flex justify-end gap-4 mt-6"
          >
            <button
              onClick={downloadSummaryPDF}
              className="bg-gradient-to-r from-[#1B365D] to-[#2A4A7A] text-white px-6 py-2 rounded-lg flex items-center gap-2 hover:from-[#1B365D]/90 hover:to-[#2A4A7A]/90 shadow-lg hover:shadow-xl transition-all"
            >
              <Download className="w-5 h-5" />
              Download PDF
            </button>
            <button
              onClick={downloadSummaryCSV}
              className="bg-gradient-to-r from-[#1B365D] to-[#2A4A7A] text-white px-6 py-2 rounded-lg flex items-center gap-2 hover:from-[#1B365D]/90 hover:to-[#2A4A7A]/90 shadow-lg hover:shadow-xl transition-all"
            >
              <Download className="w-5 h-5" />

              
              Export CSV
            </button>
          </motion.div>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="text-center text-[#1B365D] text-lg mt-20 bg-white p-6 rounded-xl shadow-md"
        >
          Please select a report type and, if applicable, a batch to view and download the report.
        </motion.div>
      )}
    </div>
  );
}