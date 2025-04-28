import { useState, useEffect } from "react";
import axios from "axios";
import { ChevronDown, Download, Calendar, LogOut, HelpCircle } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function TimeLecture() {
  const [schedules, setSchedules] = useState([]);
  const [lecturers, setLecturers] = useState([]);
  const [selectedLecturer, setSelectedLecturer] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSchedules = async () => {
      try {
        setLoading(true);
        const res = await axios.get("http://localhost:5000/api/timetable");
        const updatedSchedules = res.data.map((schedule) => ({
          ...schedule,
          subjects: schedule.subjects.map((sub) => ({
            ...sub,
            duration: sub.duration || "1",
          })),
        }));
        setSchedules(updatedSchedules);

        const lecturerSet = new Set();
        updatedSchedules.forEach((schedule) => {
          schedule.subjects.forEach((subject) => {
            if (subject.lecturer) {
              lecturerSet.add(subject.lecturer);
            }
          });
        });
        setLecturers([...lecturerSet].sort());
        setLoading(false);
      } catch (err) {
        setError(err.response ? err.response.data : err.message);
        setLoading(false);
      }
    };

    fetchSchedules();
  }, []);

  const filteredSchedules = schedules.filter((schedule) =>
    schedule.subjects.some((subject) => subject.lecturer === selectedLecturer)
  );

  const handleLecturerChange = (e) => {
    setSelectedLecturer(e.target.value);
  };

  const downloadTimetablePDF = () => {
    if (!selectedLecturer || filteredSchedules.length === 0) {
      alert("Please select a lecturer with available schedules to download.");
      return;
    }

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    doc.setFontSize(18);
    doc.setTextColor(27, 54, 93);
    doc.text(`Timetable for ${selectedLecturer}`, pageWidth / 2, 20, { align: "center" });

    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, pageWidth / 2, 30, { align: "center" });

    const tableData = [];
    filteredSchedules.forEach((schedule) => {
      schedule.subjects
        .filter((subject) => subject.lecturer === selectedLecturer)
        .forEach((subject) => {
          tableData.push([
            schedule.batch,
            subject.subjectName,
            subject.room,
            subject.date,
            subject.time,
            `${subject.duration} hr(s)`,
          ]);
        });
    });

    autoTable(doc, {
      startY: 40,
      head: [["Batch", "Subject", "Room", "Date", "Time", "Duration"]],
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

    doc.save(`Timetable_${selectedLecturer}_${new Date().toISOString().split("T")[0]}.pdf`);
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
              className="flex items-center py-3 px-4 rounded-lg text-[#1B365D] hover:bg-[#F5F7FA] hover:shadow-sm transition-all duration-300 font-medium"
            >
              <div className="w-8 h-8 flex items-center justify-center mr-3">
                <Calendar className="h-5 w-5" />
              </div>
              View Timetable
            </Link>
            <Link
              to="/TimeLecture"
              className="flex items-center py-3 px-4 rounded-lg text-[#FFFFFF] bg-[#1B365D] hover:bg-[#1B365D]/90 font-semibold transition-all duration-300"
            >
              <div className="w-8 h-8 flex items-center justify-center mr-3">
                <HelpCircle className="h-5 w-5" />
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
        <h2 className="text-3xl font-bold text-[#1B365D] mb-8 tracking-tight bg-gradient-to-r from-[#1B365D] to-[#4A90E2] bg-clip-text text-transparent">
          My Timetable
        </h2>

        {/* Lecturer Selection and Download Button */}
        <div className="flex justify-between gap-4 mb-8">
          <div className="relative w-72">
            <select
              value={selectedLecturer}
              onChange={handleLecturerChange}
              className="appearance-none w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-[#1B365D] shadow-sm focus:outline-none focus:ring-2 focus:ring-[#1B365D] transition-all"
            >
              <option value="">Select Your Name</option>
              {lecturers.map((lecturer) => (
                <option key={lecturer} value={lecturer}>
                  {lecturer}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          </div>
          <button
            onClick={downloadTimetablePDF}
            className="bg-gradient-to-r from-[#1B365D] to-[#4A90E2] text-white px-6 py-2 rounded-lg flex items-center gap-2 hover:from-[#1B365D]/80 hover:to-[#4A90E2]/80 transition-all shadow-md"
          >
            <Download className="w-5 h-5" />
            Download PDF
          </button>
        </div>

        {/* Loading and Error States */}
        {loading && (
          <div className="flex justify-center items-center h-64">
            <div className="w-10 h-10 border-4 border-t-[#1B365D] border-gray-200 rounded-full animate-spin" />
          </div>
        )}
        {error && (
          <p className="text-red-500 text-lg bg-white p-4 rounded-lg shadow-md text-center">
            Error: {error}
          </p>
        )}

        {/* Display Schedules */}
        {!loading && !error && (
          selectedLecturer ? (
            filteredSchedules.length > 0 ? (
              <div className="overflow-x-auto shadow-lg rounded-lg border-2 border-[#1B365D]/20">
                <table className="w-full border-collapse bg-white">
                  <thead className="bg-gradient-to-r from-[#1B365D] to-[#4A90E2] text-white">
                    <tr>
                      <th className="p-4 font-semibold text-left rounded-tl-lg border-b-2 border-r-2 border-[#2A4A7A]">Batch</th>
                      <th className="p-4 font-semibold text-left border-b-2 border-r-2 border-[#2A4A7A]">Subject</th>
                      <th className="p-4 font-semibold text-left border-b-2 border-r-2 border-[#2A4A7A]">Room</th>
                      <th className="p-4 font-semibold text-left border-b-2 border-r-2 border-[#2A4A7A]">Date</th>
                      <th className="p-4 font-semibold text-left border-b-2 border-r-2 border-[#2A4A7A]">Time</th>
                      <th className="p-4 font-semibold text-left border-b-2 rounded-tr-lg">Duration</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSchedules.map((schedule, scheduleIndex) =>
                      schedule.subjects
                        .filter((subject) => subject.lecturer === selectedLecturer)
                        .map((subject, subjectIndex) => (
                          <tr
                            key={`${schedule._id}-${subjectIndex}`}
                            className={`border-b border-gray-200 ${
                              (scheduleIndex + subjectIndex) % 2 === 0 ? "bg-gray-50" : "bg-white"
                            } hover:bg-[#1B365D]/10 transition-colors duration-200`}
                          >
                            <td className="p-4 text-[#1B365D] font-medium border-r border-[#1B365D]/40">{schedule.batch}</td>
                            <td className="p-4 text-[#1B365D] border-r border-[#1B365D]/40">{subject.subjectName}</td>
                            <td className="p-4 text-[#1B365D] border-r border-[#1B365D]/40">{subject.room}</td>
                            <td className="p-4 text-[#1B365D] border-r border-[#1B365D]/40">{subject.date}</td>
                            <td className="p-4 text-[#1B365D] border-r border-[#1B365D]/40">{subject.time}</td>
                            <td className="p-4 text-[#1B365D]">{subject.duration} hr(s)</td>
                          </tr>
                        ))
                    )}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-[#1B365D] text-lg bg-white p-4 rounded-lg shadow-md">
                No schedules found for {selectedLecturer}.
              </p>
            )
          ) : (
            <p className="text-[#1B365D] text-lg bg-white p-4 rounded-lg shadow-md">
              Please select your name to view and download your timetable.
            </p>
          )
        )}
      </div>
    </div>
  );
}