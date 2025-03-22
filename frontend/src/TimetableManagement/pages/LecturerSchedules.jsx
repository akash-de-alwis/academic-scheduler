import { useState, useEffect } from "react";
import axios from "axios";
import { ChevronDown, Mail } from "lucide-react";

export default function LecturerSchedules() {
  const [schedules, setSchedules] = useState([]);
  const [lecturers, setLecturers] = useState([]);
  const [selectedLecturer, setSelectedLecturer] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  // Function to generate HTML email content for Outlook
  const generateEmailContent = () => {
    if (!selectedLecturer || filteredSchedules.length === 0) return "";

    let htmlContent = `
      <html>
        <body style="font-family: Arial, sans-serif; color: #333;">
          <h2 style="color: #1B365D;">Timetable for ${selectedLecturer}</h2>
          <p style="margin-bottom: 20px;">Below is your allocated schedule:</p>
          <table style="width: 100%; border-collapse: collapse; background-color: #fff; border: 1px solid #ddd;">
            <thead>
              <tr style="background-color: #1B365D; color: white;">
                <th style="padding: 12px; text-align: left; border-bottom: 2px solid #ddd;">Batch</th>
                <th style="padding: 12px; text-align: left; border-bottom: 2px solid #ddd;">Subject</th>
                <th style="padding: 12px; text-align: left; border-bottom: 2px solid #ddd;">Room</th>
                <th style="padding: 12px; text-align: left; border-bottom: 2px solid #ddd;">Date</th>
                <th style="padding: 12px; text-align: left; border-bottom: 2px solid #ddd;">Time</th>
                <th style="padding: 12px; text-align: left; border-bottom: 2px solid #ddd;">Duration</th>
              </tr>
            </thead>
            <tbody>
    `;

    filteredSchedules.forEach((schedule, scheduleIndex) => {
      schedule.subjects
        .filter((subject) => subject.lecturer === selectedLecturer)
        .forEach((subject, subjectIndex) => {
          const rowBgColor = (scheduleIndex + subjectIndex) % 2 === 0 ? "#F5F7FA" : "#FFFFFF";
          htmlContent += `
            <tr style="background-color: ${rowBgColor};">
              <td style="padding: 12px; border-bottom: 1px solid #ddd; color: #1B365D;">${schedule.batch}</td>
              <td style="padding: 12px; border-bottom: 1px solid #ddd; color: #1B365D;">${subject.subjectName}</td>
              <td style="padding: 12px; border-bottom: 1px solid #ddd; color: #1B365D;">${subject.room}</td>
              <td style="padding: 12px; border-bottom: 1px solid #ddd; color: #1B365D;">${subject.date}</td>
              <td style="padding: 12px; border-bottom: 1px solid #ddd; color: #1B365D;">${subject.time}</td>
              <td style="padding: 12px; border-bottom: 1px solid #ddd; color: #1B365D;">${subject.duration} hr(s)</td>
            </tr>
          `;
        });
    });

    htmlContent += `
            </tbody>
          </table>
          <p style="margin-top: 20px; font-size: 12px; color: #666;">This email was generated from the Timetable Management System.</p>
        </body>
      </html>
    `;

    return encodeURIComponent(htmlContent);
  };

  // Function to open Outlook with timetable
  const handleSendEmail = () => {
    if (!selectedLecturer) {
      alert("Please select a lecturer first.");
      return;
    }
    if (filteredSchedules.length === 0) {
      alert("No schedules available to send.");
      return;
    }

    const subject = encodeURIComponent(`Timetable for ${selectedLecturer}`);
    const body = generateEmailContent();
    const mailtoLink = `mailto:?subject=${subject}&body=${body}`;

    // Open Outlook (or default email client)
    window.location.href = mailtoLink;
  };

  if (loading) {
    return (
      <div className="min-h-screen p-8 bg-white flex justify-center items-center">
        <p className="text-[#1B365D] text-lg">Loading schedules...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen p-8 bg-white flex justify-center items-center">
        <p className="text-red-500 text-lg">Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8 bg-white">
      <h2 className="text-2xl font-bold text-[#1B365D] mb-8">Lecturer Schedules</h2>

      {/* Lecturer Selection and Email Button */}
      <div className="flex justify-between gap-4 mb-8">
        <div className="relative w-72">
          <select
            value={selectedLecturer}
            onChange={handleLecturerChange}
            className="appearance-none w-full px-4 py-2 pr-8 bg-[#F5F7FA] border border-[#F5F7FA] rounded-lg text-[#1B365D] shadow-sm focus:outline-none focus:ring-2 focus:ring-[#1B365D] focus:border-transparent"
          >
            <option value="">Select a Lecturer</option>
            {lecturers.map((lecturer) => (
              <option key={lecturer} value={lecturer}>
                {lecturer}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        </div>
        <button
          onClick={handleSendEmail}
          className="bg-[#1B365D] text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-[#1B365D]/90 transition-colors duration-200"
        >
          <Mail className="w-5 h-5" />
          Send via Outlook
        </button>
      </div>

      {/* Display Schedules */}
      {selectedLecturer ? (
        filteredSchedules.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full bg-white rounded-lg shadow-md border border-gray-200">
              <thead className="bg-[#1B365D] text-white">
                <tr>
                  <th className="p-4 font-semibold text-left rounded-tl-lg">Batch</th>
                  <th className="p-4 font-semibold text-left">Subject</th>
                  <th className="p-4 font-semibold text-left">Room</th>
                  <th className="p-4 font-semibold text-left">Date</th>
                  <th className="p-4 font-semibold text-left">Time</th>
                  <th className="p-4 font-semibold text-left rounded-tr-lg">Duration</th>
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
                          (scheduleIndex + subjectIndex) % 2 === 0 ? "bg-[#F5F7FA]" : "bg-white"
                        } hover:bg-[#1B365D]/10 transition-colors duration-200`}
                      >
                        <td className="p-4 text-[#1B365D] font-medium">{schedule.batch}</td>
                        <td className="p-4 text-[#1B365D]">{subject.subjectName}</td>
                        <td className="p-4 text-[#1B365D]">{subject.room}</td>
                        <td className="p-4 text-[#1B365D]">{subject.date}</td>
                        <td className="p-4 text-[#1B365D]">{subject.time}</td>
                        <td className="p-4 text-[#1B365D]">{subject.duration} hr(s)</td>
                      </tr>
                    ))
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-[#1B365D] text-lg bg-[#F5F7FA] p-4 rounded-lg shadow-sm">
            No schedules found for {selectedLecturer}.
          </p>
        )
      ) : (
        <p className="text-[#1B365D] text-lg bg-[#F5F7FA] p-4 rounded-lg shadow-sm">
          Please select a lecturer to view their schedules.
        </p>
      )}
    </div>
  );
}