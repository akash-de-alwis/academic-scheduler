import { useState, useEffect } from "react";
import axios from "axios";
import { ChevronDown, Search } from "lucide-react";
import { motion } from "framer-motion";

export default function LecturerSchedules() {
  const [schedules, setSchedules] = useState([]);
  const [lecturers, setLecturers] = useState([]);
  const [selectedLecturer, setSelectedLecturer] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("date"); // Default sort by date
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
            if (subject.lecturer) lecturerSet.add(subject.lecturer);
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

  // Filter schedules by selected lecturer and search query
  const filteredSchedules = schedules
    .filter((schedule) =>
      schedule.subjects.some((subject) => subject.lecturer === selectedLecturer)
    )
    .map((schedule) => ({
      ...schedule,
      subjects: schedule.subjects.filter(
        (subject) =>
          subject.lecturer === selectedLecturer &&
          (subject.subjectName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            schedule.batch.toLowerCase().includes(searchQuery.toLowerCase()))
      ),
    }))
    .filter((schedule) => schedule.subjects.length > 0);

  // Sort schedules based on selected criteria
  const sortedSchedules = [...filteredSchedules].sort((a, b) => {
    const subjectA = a.subjects[0];
    const subjectB = b.subjects[0];
    if (sortBy === "date") {
      return new Date(subjectA.date) - new Date(subjectB.date);
    } else if (sortBy === "batch") {
      return a.batch.localeCompare(b.batch);
    } else if (sortBy === "subject") {
      return subjectA.subjectName.localeCompare(subjectB.subjectName);
    }
    return 0;
  });

  // Calculate total hours for the selected lecturer
  const totalHours = filteredSchedules.reduce((acc, schedule) => {
    return (
      acc +
      schedule.subjects.reduce((sum, subject) => sum + parseInt(subject.duration || "1"), 0)
    );
  }, 0);

  if (loading) {
    return (
      <div className="min-h-screen p-8 bg-gradient-to-br from-blue-50 to-gray-100 flex justify-center items-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1 }}
          className="w-12 h-12 border-4 border-t-blue-900 border-gray-200 rounded-full"
        />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen p-8 bg-gradient-to-br from-blue-50 to-gray-100 flex justify-center items-center">
        <p className="text-red-600 text-lg font-medium bg-white p-4 rounded-lg shadow-md">
          Error: {error}
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8 bg-gradient-to-br from-blue-50 to-gray-100">
      {/* Header */}
      <motion.h2
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-4xl font-extrabold text-blue-900 mb-8 tracking-wide"
      >
        Lecturer Schedules
      </motion.h2>

      {/* Controls Section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.6 }}
        className="flex flex-col md:flex-row gap-6 mb-10"
      >
        {/* Lecturer Selection */}
        <div className="relative w-full md:w-80">
          <select
            value={selectedLecturer}
            onChange={(e) => setSelectedLecturer(e.target.value)}
            className="appearance-none w-full px-5 py-3 bg-white border-2 border-blue-200 rounded-full text-blue-900 font-medium shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          >
            <option value="">Select a Lecturer</option>
            {lecturers.map((lecturer) => (
              <option key={lecturer} value={lecturer}>
                {lecturer}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 text-blue-500 w-6 h-6" />
        </div>

        {/* Search Bar */}
        <div className="relative w-full md:w-80">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by subject or batch..."
            className="w-full px-5 py-3 pl-10 bg-white border-2 border-blue-200 rounded-full text-blue-900 font-medium shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-500 w-5 h-5" />
        </div>

        {/* Sort Dropdown */}
        <div className="relative w-full md:w-60">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="appearance-none w-full px-5 py-3 bg-white border-2 border-blue-200 rounded-full text-blue-900 font-medium shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          >
            <option value="date">Sort by Date</option>
            <option value="batch">Sort by Batch</option>
            <option value="subject">Sort by Subject</option>
          </select>
          <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 text-blue-500 w-6 h-6" />
        </div>
      </motion.div>

      {/* Summary Section */}
      {selectedLecturer && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="mb-8 bg-white p-6 rounded-xl shadow-lg border border-blue-100"
        >
          <h3 className="text-xl font-semibold text-blue-900 mb-2">
            Summary for {selectedLecturer}
          </h3>
          <p className="text-gray-700">
            Total Scheduled Hours: <span className="font-medium text-blue-900">{totalHours} hr(s)</span>
          </p>
          <p className="text-gray-700">
            Number of Classes: <span className="font-medium text-blue-900">{filteredSchedules.reduce((acc, s) => acc + s.subjects.length, 0)}</span>
          </p>
        </motion.div>
      )}

      {/* Schedules Table */}
      {selectedLecturer ? (
        sortedSchedules.length > 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="overflow-x-auto"
          >
            <table className="w-full bg-white rounded-xl shadow-lg border border-blue-100">
              <thead className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white">
                <tr>
                  <th className="p-4 font-semibold text-left rounded-tl-xl">Batch</th>
                  <th className="p-4 font-semibold text-left">Subject</th>
                  <th className="p-4 font-semibold text-left">Room</th>
                  <th className="p-4 font-semibold text-left">Date</th>
                  <th className="p-4 font-semibold text-left">Time</th>
                  <th className="p-4 font-semibold text-left rounded-tr-xl">Duration</th>
                </tr>
              </thead>
              <tbody>
                {sortedSchedules.map((schedule, scheduleIndex) =>
                  schedule.subjects.map((subject, subjectIndex) => (
                    <tr
                      key={`${schedule._id}-${subjectIndex}`}
                      className={`border-b border-blue-100 ${
                        (scheduleIndex + subjectIndex) % 2 === 0 ? "bg-blue-50" : "bg-white"
                      } hover:bg-blue-200/50 transition-colors duration-200`}
                    >
                      <td className="p-4 text-blue-900 font-medium">{schedule.batch}</td>
                      <td className="p-4 text-blue-900">{subject.subjectName}</td>
                      <td className="p-4 text-blue-900">{subject.room}</td>
                      <td className="p-4 text-blue-900">{subject.date}</td>
                      <td className="p-4 text-blue-900">{subject.time}</td>
                      <td className="p-4 text-blue-900">{subject.duration} hr(s)</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </motion.div>
        ) : (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="text-blue-900 text-lg bg-white p-6 rounded-xl shadow-md border border-blue-100"
          >
            No schedules found for {selectedLecturer} matching your search.
          </motion.p>
        )
      ) : (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="text-blue-900 text-lg bg-white p-6 rounded-xl shadow-md border border-blue-100"
        >
          Please select a lecturer to view their schedules.
        </motion.p>
      )}
    </div>
  );
}