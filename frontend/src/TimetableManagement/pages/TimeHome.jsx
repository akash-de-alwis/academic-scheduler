import React, { useState, useEffect } from "react";
import { Calendar, Clock, BookOpen, AlertCircle, Plus, Eye, Wrench, RefreshCw } from "lucide-react"; // Added RefreshCw
import axios from "axios";
import { useNavigate } from "react-router-dom";

// Card Components
const Card = ({ className, children }) => (
  <div className={`rounded-lg shadow-sm ${className}`}>{children}</div>
);

const CardHeader = ({ className, children }) => (
  <div className={`p-6 pb-2 ${className}`}>{children}</div>
);

const CardTitle = ({ className, children }) => (
  <h3 className={`font-medium ${className}`}>{children}</h3>
);

const CardContent = ({ className, children }) => (
  <div className={`p-6 pt-0 ${className}`}>{children}</div>
);

const TimeHome = () => {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null); // Added error state
  const navigate = useNavigate();

  // Function to fetch schedules
  const fetchSchedules = async () => {
    try {
      setLoading(true);
      setError(null); // Reset error state
      const res = await axios.get("http://localhost:5000/api/timetable");
      const updatedSchedules = res.data.map((schedule) => ({
        ...schedule,
        subjects: schedule.subjects.map((sub) => ({
          ...sub,
          duration: sub.duration || "1",
        })),
      }));
      setSchedules(updatedSchedules);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching timetables:", err.response ? err.response.data : err.message);
      setError(err.response ? err.response.data.message : "Failed to fetch schedules");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedules();
  }, []); // Runs on mount

  // Calculate Statistics
  const getStats = () => {
    // Total Schedules (number of unique timetable entries)
    const totalSchedules = schedules.length;

    // Total Hours Scheduled
    const totalHours = schedules.reduce(
      (sum, s) => sum + s.subjects.reduce((subSum, sub) => subSum + parseInt(sub.duration || "1"), 0),
      0
    );

    // Weekly Schedules (current week)
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

    // Conflicts (same room, same time, same date)
    const conflicts = [];
    const timeRoomMap = {};
    schedules.forEach((s) => {
      s.subjects.forEach((sub) => {
        const key = `${sub.date}-${sub.time}-${sub.room}`;
        if (timeRoomMap[key]) {
          conflicts.push({ schedule1: timeRoomMap[key], schedule2: s, subject: sub });
        } else {
          timeRoomMap[key] = s;
        }
      });
    });

    // Upcoming Classes (next 3)
    const upcomingClasses = schedules
      .flatMap((s) => s.subjects.map((sub) => ({ ...sub, batch: s.batch })))
      .filter((sub) => new Date(`${sub.date} ${sub.time}`) >= new Date())
      .sort((a, b) => new Date(`${a.date} ${a.time}`) - new Date(`${b.date} ${b.time}`))
      .slice(0, 3)
      .map((sub) => ({
        id: `${sub.date}-${sub.time}-${sub.subjectName}`,
        subject: sub.subjectName,
        time: sub.time,
        room: sub.room,
        lecturer: sub.lecturer,
        date: sub.date,
      }));

    return { totalSchedules, totalHours, weeklySchedules, conflicts: conflicts.length, upcomingClasses };
  };

  const stats = getStats();

  // Refresh handler
  const handleRefresh = () => {
    fetchSchedules();
  };

  if (loading) {
    return (
      <div className="min-h-screen p-8 bg-white flex items-center justify-center">
        <p className="text-[#1B365D] text-lg animate-pulse">Loading dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen p-8 bg-white flex items-center justify-center flex-col gap-4">
        <p className="text-red-500 text-lg">Error: {error}</p>
        <button
          onClick={handleRefresh}
          className="flex items-center gap-2 bg-[#1B365D] text-white px-4 py-2 rounded-lg hover:bg-[#152c4d]"
        >
          <RefreshCw className="h-5 w-5" />
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="p-8">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-[#1B365D]">Timetable Management Dashboard</h1>
            <p className="text-gray-600">Overview of scheduling and resource allocation</p>
          </div>
          <button
            onClick={handleRefresh}
            className="flex items-center gap-2 bg-[#1B365D] text-white px-4 py-2 rounded-lg hover:bg-[#152c4d]"
          >
            <RefreshCw className="h-5 w-5" />
            Refresh
          </button>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-[#F5F7FA]">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-[#1B365D] text-lg">Total Schedules</CardTitle>
              <Calendar className="h-5 w-5 text-[#1B365D]" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-[#1B365D]">{stats.totalSchedules}</div>
              <p className="text-gray-600 text-sm">Active this semester</p>
            </CardContent>
          </Card>

          <Card className="bg-[#F5F7FA]">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-[#1B365D] text-lg">Hours Scheduled</CardTitle>
              <Clock className="h-5 w-5 text-[#1B365D]" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-[#1B365D]">{stats.totalHours}</div>
              <p className="text-gray-600 text-sm">Total hours this semester</p>
            </CardContent>
          </Card>

          <Card className="bg-[#F5F7FA]">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-[#1B365D] text-lg">Weekly Schedules</CardTitle>
              <BookOpen className="h-5 w-5 text-[#1B365D]" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-[#1B365D]">{stats.weeklySchedules}</div>
              <p className="text-gray-600 text-sm">This week</p>
            </CardContent>
          </Card>

          <Card className="bg-[#F5F7FA]">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-[#1B365D] text-lg">Conflicts</CardTitle>
              <AlertCircle className="h-5 w-5 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-500">{stats.conflicts}</div>
              <p className="text-gray-600 text-sm">Needs resolution</p>
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <button
            onClick={() => navigate("/timetable-list")}
            className="flex items-center justify-center gap-2 bg-[#1B365D] text-white p-4 rounded-lg hover:bg-[#152c4d] transition-colors"
          >
            <Plus className="h-5 w-5" />
            Add New Schedule
          </button>
          <button
            onClick={() => navigate("/timetable-view")}
            className="flex items-center justify-center gap-2 bg-[#1B365D] text-white p-4 rounded-lg hover:bg-[#152c4d] transition-colors"
          >
            <Eye className="h-5 w-5" />
            View Timetables
          </button>
          <button
            onClick={() => navigate("/resolve-conflicts")}
            className="flex items-center justify-center gap-2 bg-[#1B365D] text-white p-4 rounded-lg hover:bg-[#152c4d] transition-colors"
          >
            <Wrench className="h-5 w-5" />
            Resolve Conflicts
          </button>
        </div>

        {/* Upcoming Classes */}
        <Card className="bg-white">
          <CardHeader>
            <CardTitle className="text-[#1B365D] text-xl">Upcoming Classes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.upcomingClasses.length > 0 ? (
                stats.upcomingClasses.map((class_) => (
                  <div key={class_.id} className="flex items-center p-4 bg-[#F5F7FA] rounded-lg">
                    <Clock className="h-5 w-5 text-[#1B365D] mr-4" />
                    <div className="flex-1">
                      <h3 className="font-medium text-[#1B365D]">{class_.subject}</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mt-2 text-sm text-gray-600">
                        <span>{class_.date} {class_.time}</span>
                        <span>{class_.room}</span>
                        <span>{class_.lecturer}</span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-600">No upcoming classes scheduled.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TimeHome;