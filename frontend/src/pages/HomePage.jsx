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
    departmentDistribution: []
  });
  
  // Fetch all required data for the dashboard
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch lecturers data
        const lecturersRes = await axios.get("http://localhost:5000/api/lecturers");
        
        // Fetch batches data
        const batchesRes = await axios.get("http://localhost:5000/api/batches");
        
        // Calculate dashboard metrics
        const lecturers = lecturersRes.data;
        const batches = batchesRes.data;
        
        // Count active batches by schedule type
        const weekdayBatches = batches.filter(batch => batch.scheduleType === "Weekdays").length;
        const weekendBatches = batches.filter(batch => batch.scheduleType === "Weekend").length;
        
        // Calculate total students
        const totalStudentCount = batches.reduce((sum, batch) => sum + parseInt(batch.studentCount || 0), 0);
        
        // Create department distribution data
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
          // Calculate percentage for progress bar
          percentage: Math.round((departments[dept].count / batches.length) * 100)
        }));
        
        // Set all the dashboard data
        setDashboardData({
          totalLecturers: lecturers.length,
          activeBatches: { 
            total: batches.length, 
            weekday: weekdayBatches, 
            weekend: weekendBatches 
          },
          totalStudents: totalStudentCount,
          courseAllocations: 2, // This could be dynamic if you have allocations data
          departmentDistribution: departmentArray
        });
        
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      }
    };
    
    fetchDashboardData();
  }, []);

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Academic Scheduler Dashboard</h1>
        <p className="text-gray-600">Overview of academic scheduling and resource allocation</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        {/* Total Lecturers Card */}
        <div className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm">
          <div className="flex justify-between items-start mb-2">
            <span className="text-gray-700">Total Lecturers</span>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold">{dashboardData.totalLecturers}</h2>
          <p className="text-sm text-gray-500">0 with high workload</p>
        </div>

        {/* Active Batches Card */}
        <div className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm">
          <div className="flex justify-between items-start mb-2">
            <span className="text-gray-700">Active Batches</span>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold">{dashboardData.activeBatches.total}</h2>
          <p className="text-sm text-gray-500">
            {dashboardData.activeBatches.weekday} Weekday | {dashboardData.activeBatches.weekend} Weekend
          </p>
        </div>

        {/* Total Students Card */}
        <div className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm">
          <div className="flex justify-between items-start mb-2">
            <span className="text-gray-700">Total Students</span>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold">{dashboardData.totalStudents}</h2>
          <p className="text-sm text-gray-500">Across all active batches</p>
        </div>

        {/* Course Allocations Card */}
        <div className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm">
          <div className="flex justify-between items-start mb-2">
            <span className="text-gray-700">Course Allocations</span>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold">{dashboardData.courseAllocations}</h2>
          <p className="text-sm text-gray-500">Active course assignments</p>
        </div>
      </div>

      {/* Department Distribution */}
      <div className="bg-white p-6 rounded-lg border border-gray-100 shadow-sm mb-8">
        <h2 className="text-xl font-bold mb-4">Department Distribution</h2>
        
        <div className="space-y-4">
          {dashboardData.departmentDistribution.map((dept, index) => (
            <div key={index}>
              <div className="flex justify-between mb-1">
                <span>{dept.name}</span>
                <span>{dept.batches} batches</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div 
                  className="bg-gray-800 h-2.5 rounded-full" 
                  style={{ width: `${dept.percentage}%` }}
                ></div>
              </div>
            </div>
          ))}
          
          {dashboardData.departmentDistribution.length === 0 && (
            <p className="text-gray-500">No department data available</p>
          )}
        </div>
      </div>

      {/* Management Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button 
          onClick={() => navigate("/lecturers")}
          className="flex items-center justify-center bg-gray-900 text-white p-4 rounded-lg hover:bg-gray-800 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          Manage Lecturers
        </button>
        
        <button 
          onClick={() => navigate("/batches")}
          className="flex items-center justify-center bg-gray-900 text-white p-4 rounded-lg hover:bg-gray-800 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          Manage Batches
        </button>
        
        <button 
          onClick={() => navigate("/allocations")}
          className="flex items-center justify-center bg-gray-900 text-white p-4 rounded-lg hover:bg-gray-800 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          Manage Allocations
        </button>
      </div>
    </div>
  );
}