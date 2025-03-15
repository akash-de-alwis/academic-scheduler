import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function HomePage() {
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState({
    totalLecturers: 0,
    activeBatches: { total: 0, weekday: 0, weekend: 0 },
    totalStudents: 0,
    courseAllocations: 0,
    departmentDistribution: [],
  });
  const [userInfo, setUserInfo] = useState(null); // State for user info
  const [error, setError] = useState(""); // State for error handling

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("token"); // Check for authentication token
      if (!token) {
        setError("Please log in to view the dashboard");
        navigate("/LoginPage");
        return;
      }

      try {
        // Fetch user info
        const userResponse = await axios.get("http://localhost:5000/api/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const user = userResponse.data;
        setUserInfo(user);

        // Fetch dashboard data
        const lecturersRes = await axios.get("http://localhost:5000/api/lecturers");
        const batchesRes = await axios.get("http://localhost:5000/api/batches");
        const allocationsRes = await axios.get("http://localhost:5000/api/allocations");

        const lecturers = lecturersRes.data;
        const batches = batchesRes.data;
        const allocations = allocationsRes.data;

        const weekdayBatches = batches.filter(batch => batch.scheduleType === "Weekdays").length;
        const weekendBatches = batches.filter(batch => batch.scheduleType === "Weekend").length;

        const totalStudentCount = batches.reduce((sum, batch) => sum + parseInt(batch.studentCount || 0), 0);

        const departments = {};
        batches.forEach(batch => {
          if (!departments[batch.department]) {
            departments[batch.department] = { count: 0, students: 0 };
          }
          departments[batch.department].count += 1;
          departments[batch.department].students += parseInt(batch.studentCount || 0);
        });

        const departmentArray = Object.keys(departments).map(dept => ({
          name: dept,
          batches: departments[dept].count,
          students: departments[dept].students,
          percentage: Math.round((departments[dept].count / batches.length) * 100),
        }));

        setDashboardData({
          totalLecturers: lecturers.length,
          activeBatches: { 
            total: batches.length, 
            weekday: weekdayBatches, 
            weekend: weekendBatches,
          },
          totalStudents: totalStudentCount,
          courseAllocations: allocations.length,
          departmentDistribution: departmentArray,
        });
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("Failed to load dashboard data");
      }
    };

    fetchData();
  }, [navigate]);

  // Handle loading and error states
  if (error) {
    return (
      <div className="min-h-screen bg-[#F5F7FA] flex items-center justify-center">
        <p className="text-red-500 text-xl font-semibold">{error}</p>
      </div>
    );
  }

  if (!userInfo) {
    return (
      <div className="min-h-screen bg-[#F5F7FA] flex items-center justify-center">
        <p className="text-gray-600 text-xl font-semibold">Loading...</p>
      </div>
    );
  }

  return (
    <div className="p-8 bg-[#FFFFFF]">
      {/* Header with Name and Profile Image */}
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-[#1B365D]">
            Welcome, {userInfo.fullName}!
          </h1>
          <p className="text-[#1B365D]/70">
            Academic Scheduler Dashboard |{" "}
            {new Date().toLocaleDateString("en-GB", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
        <div className="w-10 h-10 bg-[#1B365D]/10 rounded-full flex items-center justify-center overflow-hidden">
          {userInfo.profilePhoto ? (
            <img
              src={`http://localhost:5000${userInfo.profilePhoto}`}
              alt="Profile"
              className="w-full h-full object-cover"
            />
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-[#1B365D]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-[#F5F7FA] p-4 rounded-lg shadow-sm">
          <div className="flex justify-between items-start mb-2">
            <span className="text-[#1B365D]">Total Lecturers</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-[#1B365D]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-[#1B365D]">{dashboardData.totalLecturers}</h2>
          <p className="text-sm text-[#1B365D]/70">0 with high workload</p>
        </div>

        <div className="bg-[#F5F7FA] p-4 rounded-lg shadow-sm">
          <div className="flex justify-between items-start mb-2">
            <span className="text-[#1B365D]">Active Batches</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-[#1B365D]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-[#1B365D]">{dashboardData.activeBatches.total}</h2>
          <p className="text-sm text-[#1B365D]/70">
            {dashboardData.activeBatches.weekday} Weekday | {dashboardData.activeBatches.weekend} Weekend
          </p>
        </div>

        <div className="bg-[#F5F7FA] p-4 rounded-lg shadow-sm">
          <div className="flex justify-between items-start mb-2">
            <span className="text-[#1B365D]">Total Students</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-[#1B365D]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
              />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-[#1B365D]">{dashboardData.totalStudents}</h2>
          <p className="text-sm text-[#1B365D]/70">Across all active batches</p>
        </div>

        <div className="bg-[#F5F7FA] p-4 rounded-lg shadow-sm">
          <div className="flex justify-between items-start mb-2">
            <span className="text-[#1B365D]">Course Allocations</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-[#1B365D]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-[#1B365D]">{dashboardData.courseAllocations}</h2>
          <p className="text-sm text-[#1B365D]/70">Active course assignments</p>
        </div>
      </div>

      {/* Department Distribution */}
      <div className="bg-[#F5F7FA] p-6 rounded-lg shadow-sm mb-8">
        <h2 className="text-xl font-bold mb-4 text-[#1B365D]">Department Distribution</h2>
        <div className="space-y-4">
          {dashboardData.departmentDistribution.map((dept, index) => (
            <div key={index}>
              <div className="flex justify-between mb-1">
                <span className="text-[#1B365D]">{dept.name}</span>
                <span className="text-[#1B365D]">{dept.batches} batches</span>
              </div>
              <div className="w-full bg-[#FFFFFF] rounded-full h-2.5">
                <div
                  className="bg-[#1B365D] h-2.5 rounded-full"
                  style={{ width: `${dept.percentage}%` }}
                ></div>
              </div>
            </div>
          ))}
          {dashboardData.departmentDistribution.length === 0 && (
            <p className="text-[#1B365D]/70">No department data available</p>
          )}
        </div>
      </div>

      {/* Management Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button
          onClick={() => navigate("/lecturers")}
          className="flex items-center justify-center bg-[#1B365D] text-[#FFFFFF] p-4 rounded-lg hover:bg-[#1B365D]/90 transition-colors"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 mr-2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
          Manage Lecturers
        </button>
        <button
          onClick={() => navigate("/batches")}
          className="flex items-center justify-center bg-[#1B365D] text-[#FFFFFF] p-4 rounded-lg hover:bg-[#1B365D]/90 transition-colors"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 mr-2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
            />
          </svg>
          Manage Batches
        </button>
        <button
          onClick={() => navigate("/allocations")}
          className="flex items-center justify-center bg-[#1B365D] text-[#FFFFFF] p-4 rounded-lg hover:bg-[#1B365D]/90 transition-colors"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 mr-2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          Manage Allocations
        </button>
      </div>
    </div>
  );
}