import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { BookOpen, Calendar, Star } from "lucide-react";

const StudentDashboard = () => {
  const [studentData, setStudentData] = useState(null);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/LoginPage");
      return;
    }

    // Fetch student-specific data (e.g., enrolled subjects)
    axios
      .get("http://localhost:5000/api/student/profile", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setStudentData(res.data);
      })
      .catch((err) => {
        console.error("Error fetching student data:", err);
        setError("Failed to load dashboard. Please try again.");
        if (err.response?.status === 401) {
          localStorage.removeItem("token");
          navigate("/LoginPage");
        }
      });
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/LoginPage");
  };

  return (
    <div className="bg-[#FFFFFF] min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-[#1B365D]">Student Dashboard</h1>
            <p className="text-gray-600">Welcome, {studentData?.fullName || "Student"}!</p>
          </div>
          <button
            onClick={handleLogout}
            className="bg-[#1B365D] text-white py-2 px-4 rounded-lg hover:bg-opacity-90 transition"
          >
            Logout
          </button>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg shadow-sm mb-6">
            {error}
          </div>
        )}

        {/* Dashboard Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
          <div className="bg-[#F5F7FA] rounded-lg shadow-sm p-6 flex items-start justify-between">
            <div>
              <h2 className="text-4xl font-bold text-[#1B365D]">
                {studentData?.enrolledSubjects?.length || 0}
              </h2>
              <p className="text-gray-600">Enrolled Subjects</p>
            </div>
            <BookOpen size={24} className="text-[#1B365D]" />
          </div>

          <div className="bg-[#F5F7FA] rounded-lg shadow-sm p-6 flex items-start justify-between">
            <div>
              <h2 className="text-4xl font-bold text-[#1B365D]">
                {studentData?.upcomingClasses?.length || 0}
              </h2>
              <p className="text-gray-600">Upcoming Classes</p>
            </div>
            <Calendar size={24} className="text-[#1B365D]" />
          </div>

          <div className="bg-[#F5F7FA] rounded-lg shadow-sm p-6 flex items-start justify-between">
            <div>
              <h2 className="text-4xl font-bold text-[#1B365D]">
                {studentData?.totalCredits || 0}
              </h2>
              <p className="text-gray-600">Total Credits</p>
            </div>
            <Star size={24} className="text-[#1B365D]" />
          </div>
        </div>

        {/* Placeholder for Additional Content */}
        <div className="bg-[#F5F7FA] rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-bold text-[#1B365D] mb-4">Your Schedule</h2>
          <p className="text-gray-600">
            {studentData?.enrolledSubjects?.length > 0
              ? "View your enrolled subjects and class schedule here."
              : "No subjects enrolled yet."}
          </p>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;