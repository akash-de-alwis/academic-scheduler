import { useState, useEffect } from "react";
import axios from "axios";
import { ChevronDown, Download } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable"; // Import autoTable explicitly

export default function TimetableReports() {
  const [schedules, setSchedules] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState("");
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
    axios
      .get("http://localhost:5000/api/timetable")
      .then((res) => {
        const updatedSchedules = res.data.map((schedule) => ({
          ...schedule,
          subjects: schedule.subjects.map((sub) => ({
            ...sub,
            duration: sub.duration || "1",
          })),
        }));
        setSchedules(updatedSchedules);
        const uniqueBatches = [...new Set(updatedSchedules.map((s) => s.batch))];
        setBatches(uniqueBatches);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching timetables:", err.response ? err.response.data : err.message);
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
      ? schedules.filter((s) => s.batch === selectedBatch)
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

  const downloadPDF = () => {
    if (!selectedBatch) {
      alert("Please select a batch to download the timetable!");
      return;
    }

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    // Add header
    doc.setFontSize(18);
    doc.setTextColor(27, 54, 93); // #1B365D
    doc.text(`Timetable Report - Batch ${selectedBatch}`, pageWidth / 2, 20, { align: "center" });

    // Add date
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, pageWidth / 2, 30, { align: "center" });

    // Prepare table data
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

    // Use autoTable as a function
    autoTable(doc, {
      startY: 40,
      head: [["Time", ...weekDays]],
      body: tableData,
      styles: { fontSize: 8, cellPadding: 2, overflow: "linebreak" },
      headStyles: { fillColor: [27, 54, 93], textColor: 255 },
      alternateRowStyles: { fillColor: [245, 247, 250] },
      columnStyles: { 0: { cellWidth: 20 } },
    });

    // Add footer
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(100);
      doc.text(`Page ${i} of ${pageCount}`, pageWidth - 20, doc.internal.pageSize.height - 10);
    }

    // Download the PDF
    doc.save(`Timetable_${selectedBatch}_${new Date().toISOString().split("T")[0]}.pdf`);
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
        <div className="relative">
          <select
            value={selectedBatch}
            onChange={(e) => setSelectedBatch(e.target.value)}
            className="appearance-none px-4 py-2 pr-8 bg-[#F5F7FA] border border-[#F5F7FA] rounded-lg text-[#1B365D] shadow-md focus:ring-2 focus:ring-[#1B365D]/50"
          >
            <option value="">Select Batch</option>
            {batches.map((batch) => (
              <option key={batch} value={batch}>
                {batch}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        </div>
      </div>

      {selectedBatch ? (
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

          <div className="flex justify-end mt-6">
            <button
              onClick={downloadPDF}
              className="bg-[#1B365D] text-white px-6 py-2 rounded-lg flex items-center gap-2 hover:bg-[#1B365D]/90 shadow-lg hover:shadow-xl transition-all"
            >
              <Download className="w-5 h-5" />
              Download PDF
            </button>
          </div>
        </>
      ) : (
        <div className="text-center text-[#1B365D] text-lg mt-20">
          Please select a batch to view and download the timetable report.
        </div>
      )}
    </div>
  );
}