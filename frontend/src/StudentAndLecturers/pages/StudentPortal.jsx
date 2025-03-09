import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { User } from "lucide-react";

const StudentPortal = () => {
  const [batches, setBatches] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState('');
  const [allocations, setAllocations] = useState([]);
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/LoginPage');
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const userResponse = await axios.get("http://localhost:5000/api/auth/me", config);
        setUserInfo(userResponse.data);

        const [batchesRes, allocationsRes] = await Promise.all([
          axios.get('http://localhost:5000/api/batches', config),
          axios.get('http://localhost:5000/api/allocations', config),
        ]);
        setBatches(batchesRes.data);
        setAllocations(allocationsRes.data);

        const userBatch = `${userResponse.data.batch} (${batchesRes.data.find(b => b.batchNo === userResponse.data.batch)?.intake})`;
        if (batchesRes.data.some(b => `${b.batchName} (${b.intake})` === userBatch)) {
          setSelectedBatch(userBatch);
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch data');
        if (err.response?.status === 401 || err.response?.status === 403) {
          localStorage.removeItem('token');
          navigate('/LoginPage');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  const selectedBatchAllocation = selectedBatch
    ? allocations.find((alloc) => {
        const batch = batches.find((b) => b.batchNo === alloc.batchId);
        return batch ? `${alloc.batchName} (${batch.intake})` === selectedBatch : false;
      })
    : null;

  const scheduleType = selectedBatchAllocation
    ? batches.find((b) => b.batchNo === selectedBatchAllocation.batchId)?.scheduleType
    : '';

  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  if (!userInfo && !error) {
    return (
      <div className="min-h-screen bg-[#F5F7FA] flex items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F7FA] font-sans flex flex-col">
      {/* Header (Original, Unchanged) */}
      <header className="bg-gradient-to-r from-[#1B365D] to-[#2A4A7A] text-white p-6 shadow-lg sticky top-0 z-10">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-3xl font-bold tracking-tight">Student Portal</h1>
          <nav>
            <ul className="flex space-x-6">
              <li>
                <button
                  onClick={() => navigate('/StudentDashboard')}
                  className="hover:text-gray-200 transition-colors duration-200 text-lg font-medium"
                >
                  Dashboard
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    localStorage.removeItem('token');
                    navigate('/LoginPage');
                  }}
                  className="hover:text-gray-200 transition-colors duration-200 text-lg font-medium"
                >
                  Logout
                </button>
              </li>
            </ul>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow py-12 px-6">
        <div className="w-full bg-white shadow-xl rounded-2xl p-8 border border-[#E2E8F0]">
          {/* Profile Section */}
          {userInfo && (
            <div className="mb-10 bg-[#F5F7FA] p-6 rounded-xl flex justify-between items-center shadow-sm">
              <div>
                <h1 className="text-3xl font-bold text-[#1B365D] tracking-tight">
                  Welcome, {userInfo.fullName}!
                </h1>
                <p className="text-sm text-gray-600 mt-2">
                  Batch: <span className="font-medium">{userInfo.batch}</span> | Date: <span className="font-medium">
                    {new Date().toLocaleDateString("en-GB", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-[#1B365D]/10 rounded-full flex items-center justify-center overflow-hidden shadow-md">
                  {userInfo.profilePhoto ? (
                    <img
                      src={`http://localhost:5000${userInfo.profilePhoto}`}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-6 h-6 text-[#1B365D]" />
                  )}
                </div>
                <span className="text-[#1B365D] font-semibold text-lg">{userInfo.fullName}</span>
              </div>
            </div>
          )}

          {/* Documentary Header */}
          <div className="mb-10">
            <div className="flex justify-between items-center bg-[#1B365D]/5 p-6 rounded-xl">
              <div>
                <h2 className="text-2xl font-semibold text-[#1B365D] tracking-tight">
                  Academic Schedule - Batch Allocation Details
                </h2>
                <p className="text-sm text-gray-600 mt-2">
                  Institution: <span className="font-medium">University of Knowledge Excellence</span>
                </p>
                <p className="text-sm text-gray-600">
                  Date Issued: <span className="font-medium">{currentDate}</span>
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-[#1B365D]">Document Reference: ACAD-SCH-2025</p>
                <p className="text-sm text-gray-600">Academic Year: <span className="font-medium">2025</span></p>
              </div>
            </div>
          </div>

          {/* Batch Selection */}
          <div className="mb-10">
            <label htmlFor="batch-select" className="block text-sm font-medium text-gray-700 mb-3">
              Select Your Batch
            </label>
            <select
              id="batch-select"
              value={selectedBatch}
              onChange={(e) => setSelectedBatch(e.target.value)}
              className="w-full max-w-lg p-4 border border-[#E2E8F0] rounded-lg shadow-sm focus:ring-2 focus:ring-[#1B365D] focus:border-[#1B365D] text-gray-700 bg-white hover:bg-[#F5F7FA] transition-colors text-base"
            >
              <option value="">-- Select Batch --</option>
              {batches.map((batch) => (
                <option key={batch._id} value={`${batch.batchName} (${batch.intake})`}>
                  {batch.batchName} ({batch.intake}) - {batch.scheduleType}
                </option>
              ))}
            </select>
          </div>

          {/* Error State */}
          {error && (
            <div className="mb-8 bg-red-50 border-l-4 border-red-500 p-6 rounded-lg shadow-sm">
              <p className="text-red-700 font-medium text-base">{error}</p>
            </div>
          )}

          {/* Table View */}
          {selectedBatch && !loading && selectedBatchAllocation && (
            <div className="overflow-x-auto bg-[#F5F7FA] p-6 rounded-xl shadow-sm">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-[#1B365D] text-white">
                    <th className="py-4 px-6 text-left font-semibold text-sm w-1/4">Batch Details</th>
                    <th className="py-4 px-6 text-left font-semibold text-sm w-1/5">Schedule Type</th>
                    <th className="py-4 px-6 text-left font-semibold text-sm w-3/10">Subjects</th>
                    <th className="py-4 px-6 text-left font-semibold text-sm w-3/10">Lecturers</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-[#E2E8F0] hover:bg-white transition-colors">
                    <td className="py-6 px-6 align-top">
                      <div className="space-y-3">
                        <p className="font-semibold text-[#1B365D] text-lg tracking-tight">
                          {selectedBatchAllocation.batchName}
                        </p>
                        <p className="text-sm text-gray-600">
                          Batch ID: <span className="font-medium">{selectedBatchAllocation.batchId}</span>
                        </p>
                        <p className="text-sm text-gray-600">
                          Allocation ID: <span className="font-medium">{selectedBatchAllocation.allocationId}</span>
                        </p>
                      </div>
                    </td>
                    <td className="py-6 px-6 align-top">
                      <span className="inline-block bg-[#1B365D]/10 text-[#1B365D] px-4 py-2 rounded-md text-sm font-medium shadow-sm">
                        {scheduleType}
                      </span>
                    </td>
                    <td className="py-6 px-6 align-top">
                      <ul className="space-y-4">
                        {selectedBatchAllocation.subjects.map((subject, index) => (
                          <li key={index} className="text-gray-700">
                            <span className="font-medium text-base">{subject.subjectName}</span>
                            <br />
                            <span className="text-sm text-gray-500">({subject.subjectId})</span>
                          </li>
                        ))}
                      </ul>
                    </td>
                    <td className="py-6 px-6 align-top">
                      <ul className="space-y-4">
                        {selectedBatchAllocation.subjects.map((subject, index) => (
                          <li key={index} className="text-gray-700">
                            <span className="font-medium text-base">{subject.lecturerName}</span>
                            {subject.lecturerId && (
                              <>
                                <br />
                                <span className="text-sm text-gray-500">({subject.lecturerId})</span>
                              </>
                            )}
                          </li>
                        ))}
                      </ul>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="text-center py-10">
              <div className="inline-flex items-center gap-4 text-[#1B365D]">
                <svg className="animate-spin h-8 w-8" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span className="text-xl font-medium">Loading Academic Schedule...</span>
              </div>
            </div>
          )}

          {/* No Data State */}
          {selectedBatch && !loading && !selectedBatchAllocation && (
            <div className="text-center py-10 bg-[#F5F7FA] rounded-xl shadow-sm">
              <p className="text-xl font-medium text-gray-600">
                No Academic Schedule Available
              </p>
              <p className="text-sm mt-3 text-gray-500">
                Please contact the Academic Office if you believe this is an error.
              </p>
            </div>
          )}
        </div>
      </main>

      {/* Footer (Original) */}
      <footer className="bg-[#1B365D] text-white py-6">
        <div className="container mx-auto text-center">
          <p className="text-sm font-medium">© 2025 Academic Scheduler. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default StudentPortal;