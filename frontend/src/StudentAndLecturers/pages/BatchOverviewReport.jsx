import { useState, useEffect } from "react";
import axios from "axios";

export default function BatchOverviewReport() {
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("all"); // all, active, completed

  useEffect(() => {
    const fetchBatches = async () => {
      try {
        setLoading(true);
        const res = await axios.get("http://localhost:5000/api/batches");
        setBatches(res.data);
        setLoading(false);
      } catch (err) {
        setError("Failed to load batches. Please try again later.");
        setLoading(false);
        console.error(err.response ? err.response.data : err);
      }
    };

    fetchBatches();
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB");
  };

  const calculateDurationInWeeks = (startDate, endDate) => {
    if (!startDate || !endDate) return "N/A";
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    // Calculate the difference in milliseconds
    const diffTime = Math.abs(end - start);
    
    // Convert to weeks and round to 1 decimal place
    const diffWeeks = Math.round((diffTime / (1000 * 60 * 60 * 24 * 7)) * 10) / 10;
    
    return `${diffWeeks} weeks`;
  };

  const isActiveBatch = (endDate) => {
    if (!endDate) return false;
    const today = new Date();
    const end = new Date(endDate);
    return end >= today;
  };

  const filteredBatches = batches.filter(batch => {
    if (filter === "all") return true;
    if (filter === "active") return isActiveBatch(batch.endDate);
    if (filter === "completed") return !isActiveBatch(batch.endDate);
    return true;
  });

  // Calculate summary statistics
  const totalStudents = filteredBatches.reduce((sum, batch) => sum + (parseInt(batch.studentCount) || 0), 0);
  const departmentCounts = filteredBatches.reduce((acc, batch) => {
    acc[batch.department] = (acc[batch.department] || 0) + 1;
    return acc;
  }, {});
  const scheduleTypeCounts = filteredBatches.reduce((acc, batch) => {
    acc[batch.scheduleType] = (acc[batch.scheduleType] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="min-h-screen p-8 bg-[#FFFFFF]">
      <div className="flex flex-col gap-8">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-[#1B365D]">Batch Overview Report</h2>
          <div className="flex gap-4">
            <button
              onClick={() => window.print()}
              className="bg-[#1B365D] text-[#FFFFFF] px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-[#1B365D]/90"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              Print Report
            </button>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-4 py-2 border border-[#F5F7FA] rounded-lg bg-[#F5F7FA] text-[#1B365D]"
            >
              <option value="all">All Batches</option>
              <option value="active">Active Batches</option>
              <option value="completed">Completed Batches</option>
            </select>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-[#F5F7FA] p-6 rounded-lg">
            <h3 className="text-lg font-medium text-[#1B365D] mb-2">Total Batches</h3>
            <p className="text-3xl font-bold text-[#1B365D]">{filteredBatches.length}</p>
          </div>
          <div className="bg-[#F5F7FA] p-6 rounded-lg">
            <h3 className="text-lg font-medium text-[#1B365D] mb-2">Total Students</h3>
            <p className="text-3xl font-bold text-[#1B365D]">{totalStudents}</p>
          </div>
          <div className="bg-[#F5F7FA] p-6 rounded-lg">
            <h3 className="text-lg font-medium text-[#1B365D] mb-2">Average Students per Batch</h3>
            <p className="text-3xl font-bold text-[#1B365D]">
              {filteredBatches.length ? Math.round(totalStudents / filteredBatches.length) : 0}
            </p>
          </div>
        </div>

        {/* Distribution Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Department Distribution */}
          <div className="bg-[#F5F7FA] p-6 rounded-lg">
            <h3 className="text-lg font-medium text-[#1B365D] mb-4">Department Distribution</h3>
            <div className="space-y-3">
              {Object.entries(departmentCounts).map(([department, count]) => (
                <div key={department} className="flex justify-between items-center">
                  <span className="text-[#1B365D]">{department}</span>
                  <span className="text-[#1B365D] font-medium">{count} batches</span>
                </div>
              ))}
            </div>
          </div>

          {/* Schedule Type Distribution */}
          <div className="bg-[#F5F7FA] p-6 rounded-lg">
            <h3 className="text-lg font-medium text-[#1B365D] mb-4">Schedule Distribution</h3>
            <div className="space-y-3">
              {Object.entries(scheduleTypeCounts).map(([scheduleType, count]) => (
                <div key={scheduleType} className="flex justify-between items-center">
                  <span className="text-[#1B365D]">{scheduleType}</span>
                  <span className="text-[#1B365D] font-medium">{count} batches</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Main Table */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="loader border-4 border-t-4 border-gray-200 border-t-[#1B365D] rounded-full w-12 h-12 animate-spin"></div>
          </div>
        ) : error ? (
          <div className="py-8 text-center text-red-500">{error}</div>
        ) : (
          <div className="bg-[#F5F7FA] rounded-lg overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#FFFFFF]">
                  <th className="text-left p-4 font-medium text-[#1B365D]">Batch Name</th>
                  <th className="text-left p-4 font-medium text-[#1B365D]">Batch No.</th>
                  <th className="text-left p-4 font-medium text-[#1B365D]">Department</th>
                  <th className="text-left p-4 font-medium text-[#1B365D]">Year</th>
                  <th className="text-left p-4 font-medium text-[#1B365D]">Students</th>
                  <th className="text-left p-4 font-medium text-[#1B365D]">Schedule</th>
                  <th className="text-left p-4 font-medium text-[#1B365D]">Start Date</th>
                  <th className="text-left p-4 font-medium text-[#1B365D]">End Date</th>
                  <th className="text-left p-4 font-medium text-[#1B365D]">Duration</th>
                  <th className="text-left p-4 font-medium text-[#1B365D]">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredBatches.length === 0 ? (
                  <tr>
                    <td colSpan="10" className="p-4 text-center text-[#1B365D]">
                      No batches found
                    </td>
                  </tr>
                ) : (
                  filteredBatches.map((batch) => (
                    <tr key={batch._id} className="border-b border-[#FFFFFF]">
                      <td className="p-4 text-[#1B365D]">{batch.batchName}</td>
                      <td className="p-4">
                        <span className="text-[#1B365D] font-medium">{batch.batchNo}</span>
                      </td>
                      <td className="p-4 text-[#1B365D]">{batch.department}</td>
                      <td className="p-4 text-[#1B365D]">{batch.year}</td>
                      <td className="p-4 text-[#1B365D]">{batch.studentCount}</td>
                      <td className="p-4 text-[#1B365D]">{batch.scheduleType}</td>
                      <td className="p-4 text-[#1B365D]">{formatDate(batch.startDate)}</td>
                      <td className="p-4 text-[#1B365D]">{formatDate(batch.endDate)}</td>
                      <td className="p-4 text-[#1B365D]">
                        {calculateDurationInWeeks(batch.startDate, batch.endDate)}
                      </td>
                      <td className="p-4">
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${
                            isActiveBatch(batch.endDate)
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {isActiveBatch(batch.endDate) ? "Active" : "Completed"}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}