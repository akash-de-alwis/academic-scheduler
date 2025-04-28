import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function BatchList() {
  const [batches, setBatches] = useState([]);
  const [allocations, setAllocations] = useState([]);
  const [expandedBatch, setExpandedBatch] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingBatch, setEditingBatch] = useState(null);
  const [newBatch, setNewBatch] = useState({
    batchName: "",
    batchNo: "BT001",
    intake: "Regular",
    year: "",
    semester: "Semester1",
    department: "Information Technology",
    studentCount: "",
    startDate: "",
    endDate: "",
    scheduleType: "Weekdays",
  });
  const [formErrors, setFormErrors] = useState({});
  const [batchError, setBatchError] = useState(""); // Changed to more generic name
  const [filters, setFilters] = useState({
    department: "",
    scheduleType: "",
    allocated: "",
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");
  const [toast, setToast] = useState({ message: "", visible: false });

  const navigate = useNavigate();

  const showToast = (message) => {
    setToast({ message, visible: true });
    setTimeout(() => {
      setToast((prev) => ({ ...prev, visible: false }));
    }, 3000);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const batchesRes = await axios.get("http://localhost:5000/api/batches");
        const allocationsRes = await axios.get("http://localhost:5000/api/allocations");
        setBatches(batchesRes.data);
        setAllocations(allocationsRes.data);
        
        const nextBatchNo = generateNextBatchNo(batchesRes.data);
        setNewBatch(prev => ({ ...prev, batchNo: nextBatchNo }));
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const deptMap = {
      "Information Technology": "IT",
      "Engineering": "ENG",
      "Business Studies": "BS",
    };

    if (newBatch.department && newBatch.year && newBatch.semester) {
      const deptCode = deptMap[newBatch.department];
      const yearNum = `Y${newBatch.year}`;
      const semesterCode = newBatch.semester === "Semester1" ? "S1" : "S2";
      setNewBatch((prev) => ({
        ...prev,
        batchName: `${deptCode} ${yearNum} ${semesterCode}`,
      }));
    }
  }, [newBatch.department, newBatch.year, newBatch.semester]);

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB");
  };

  const formatDateForInput = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toISOString().split("T")[0];
  };

  const validateForm = () => {
    const errors = {};
    const requiredFields = [
      "year",
      "studentCount",
      "startDate",
      "endDate",
      "department",
      "semester",
      "scheduleType",
      "intake",
    ];

    requiredFields.forEach((field) => {
      if (!newBatch[field]) {
        errors[field] = "This field is required";
      }
    });

    if (
      newBatch.studentCount &&
      (!/^\d+$/.test(newBatch.studentCount) || parseInt(newBatch.studentCount) <= 0)
    ) {
      errors.studentCount = "Must be a positive number";
    }

    if (
      newBatch.startDate &&
      newBatch.endDate &&
      new Date(newBatch.startDate) >= new Date(newBatch.endDate)
    ) {
      errors.endDate = "End date must be after start date";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const generateNextBatchNo = (existingBatches) => {
    try {
      if (!existingBatches || existingBatches.length === 0) {
        return "BT001";
      }
      const lastBatch = existingBatches.sort((a, b) => 
        b.batchNo.localeCompare(a.batchNo)
      )[0];
      const lastNum = lastBatch ? parseInt(lastBatch.batchNo.slice(2)) : 0;
      const nextNum = lastNum + 1;
      return `BT${nextNum.toString().padStart(3, '0')}`;
    } catch (error) {
      console.error("Error generating batch number:", error);
      return "BT001";
    }
  };

  const handleSaveBatch = async () => {
    if (!validateForm()) return;

    try {
      const batchData = {
        ...newBatch,
        year: parseInt(newBatch.year),
      };

      setBatchError("");

      if (editingBatch) {
        const res = await axios.put(`http://localhost:5000/api/batches/${editingBatch._id}`, batchData);
        setBatches((prevBatches) =>
          prevBatches.map((batch) => (batch._id === editingBatch._id ? res.data : batch))
        );
        showToast("Batch updated successfully!");
      } else {
        const res = await axios.post("http://localhost:5000/api/batches", batchData);
        setBatches((prevBatches) => [...prevBatches, res.data]);
        showToast("Batch created successfully!");
        
        const nextBatchNo = generateNextBatchNo([...batches, res.data]);
        setNewBatch(prev => ({ ...prev, batchNo: nextBatchNo }));
      }

      setShowForm(false);
      setNewBatch({
        batchName: "",
        batchNo: newBatch.batchNo,
        intake: "Regular",
        year: "",
        semester: "Semester1",
        department: "Information Technology",
        studentCount: "",
        startDate: "",
        endDate: "",
        scheduleType: "Weekdays",
      });
      setEditingBatch(null);
      setFormErrors({});
    } catch (err) {
      if (err.response && err.response.data && err.response.data.message) {
        // Display the exact error message from the backend
        setBatchError(err.response.data.message);
      } else {
        console.error("Error saving batch:", err);
        setBatchError("An unexpected error occurred while saving the batch");
      }
    }
  };

  const handleDeleteBatch = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/batches/${id}`);
      setBatches(batches.filter((batch) => batch._id !== id));
    } catch (err) {
      console.error("Error deleting batch:", err);
    }
  };

  const handleEdit = (batch) => {
    setNewBatch({
      ...batch,
      startDate: formatDateForInput(batch.startDate),
      endDate: formatDateForInput(batch.endDate),
      year: batch.year.toString(),
    });
    setEditingBatch(batch);
    setShowForm(true);
    setBatchError("");
  };

  const isBatchAllocated = (batchNo) => {
    return allocations.some((allocation) => allocation.batchId === batchNo);
  };

  const toggleExpand = (batchId) => {
    setExpandedBatch(expandedBatch === batchId ? null : batchId);
  };

  const handleQuickAllocate = (batch) => {
    navigate("/allocations", {
      state: {
        batchName: batch.batchName,
        batchId: batch.batchNo,
        quickAllocate: true,
      },
    });
  };

  const filteredBatches = batches
    .filter((batch) => {
      return (
        (filters.department === "" || batch.department === filters.department) &&
        (filters.scheduleType === "" || batch.scheduleType === filters.scheduleType) &&
        (filters.allocated === "" ||
          (filters.allocated === "yes" && isBatchAllocated(batch.batchNo)) ||
          (filters.allocated === "no" && !isBatchAllocated(batch.batchNo))) &&
        (searchQuery === "" || batch.batchName.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    })
    .sort((a, b) => {
      const nameA = a.batchName.toLowerCase();
      const nameB = b.batchName.toLowerCase();
      if (sortOrder === "asc") {
        return nameA < nameB ? -1 : nameA > nameB ? 1 : 0;
      } else {
        return nameA > nameB ? -1 : nameA < nameB ? 1 : 0;
      }
    });

  const handleSortToggle = () => {
    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
  };

  return (
    <div className="min-h-screen p-8 bg-[#FFFFFF] relative">
      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(-10px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-fade-in {
            animation: fadeIn 0.3s ease-out;
          }
          @keyframes blink {
            0% { opacity: 1; }
            50% { opacity: 0; }
            100% { opacity: 1; }
          }
          .animate-blink {
            animation: blink 1s infinite;
          }
          @keyframes popIn {
            0% { transform: translateX(100%) scale(0.8); opacity: 0; }
            60% { transform: translateX(0) scale(1.05); opacity: 1; }
            100% { transform: translateX(0) scale(1); opacity: 1; }
          }
          @keyframes popOut {
            0% { transform: translateX(0) scale(1); opacity: 1; }
            40% { transform: translateX(0) scale(1.05); opacity: 1; }
            100% { transform: translateX(100%) scale(0.8); opacity: 0; }
          }
          .toast {
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 20px;
            background: linear-gradient(135deg, #1B365D 0%, #3B5A9A 100%);
            color: #E6ECF5;
            border-radius: 8px;
            box-shadow: 0 6px 16px rgba(27, 54, 93, 0.4);
            font-size: 0.95rem;
            font-weight: 600;
            z-index: 1000;
            display: flex;
            align-items: center;
            gap: 10px;
            border: 1px solid rgba(255, 255, 255, 0.2);
          }
          .toast.show {
            animation: popIn 0.5s ease-out forwards;
          }
          .toast.hide {
            animation: popOut 0.5s ease-out forwards;
          }
          .toast-icon {
            width: 20px;
            height: 20px;
          }
        `}
      </style>

      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold text-[#1B365D]">Batch Management</h2>
        <div className="flex items-center gap-4">
          <select
            value={filters.department}
            onChange={(e) => setFilters({ ...filters, department: e.target.value })}
            className="p-2 border border-[#E2E8F0] rounded-lg bg-white text-[#1B365D] focus:outline-none focus:ring-2 focus:ring-[#1B365D] transition-all duration-300 ease-in-out text-sm hover:bg-[#F5F7FA] hover:shadow-md"
          >
            <option value="">All Departments</option>
            <option value="Information Technology">Information Technology</option>
            <option value="Engineering">Engineering</option>
            <option value="Business Studies">Business Studies</option>
          </select>
          <select
            value={filters.scheduleType}
            onChange={(e) => setFilters({ ...filters, scheduleType: e.target.value })}
            className="p-2 border border-[#E2E8F0] rounded-lg bg-white text-[#1B365D] focus:outline-none focus:ring-2 focus:ring-[#1B365D] transition-all duration-300 ease-in-out text-sm hover:bg-[#F5F7FA] hover:shadow-md"
          >
            <option value="">All Schedules</option>
            <option value="Weekdays">Weekdays</option>
            <option value="Weekend">Weekend</option>
          </select>
          <select
            value={filters.allocated}
            onChange={(e) => setFilters({ ...filters, allocated: e.target.value })}
            className="p-2 border border-[#E2E8F0] rounded-lg bg-white text-[#1B365D] focus:outline-none focus:ring-2 focus:ring-[#1B365D] transition-all duration-300 ease-in-out text-sm hover:bg-[#F5F7FA] hover:shadow-md"
          >
            <option value="">All Statuses</option>
            <option value="yes">Allocated</option>
            <option value="no">Not Allocated</option>
          </select>
          <button
            onClick={() => {
              setShowForm(true);
              setEditingBatch(null);
              setBatchError("");
            }}
            className="bg-[#1B365D] text-[#FFFFFF] px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-[#1B365D]/90"
          >
            + Add New Batch
          </button>
        </div>
      </div>

      {toast.visible && (
        <div className={`toast ${toast.visible ? "show" : "hide"}`}>
          <svg className="toast-icon" fill="none" stroke="#E6ECF5" viewBox="0 0 24 24" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
          {toast.message}
        </div>
      )}

      <div className="flex justify-between gap-4 mb-8">
        <input
          type="text"
          placeholder="Search batches..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1 px-4 py-2 border border-[#F5F7FA] rounded-lg bg-[#F5F7FA] text-[#1B365D] focus:outline-none focus:ring-2 focus:ring-[#1B365D] transition-all duration-300"
        />
        <button
          onClick={handleSortToggle}
          className="px-4 py-2 bg-[#F5F7FA] border border-[#F5F7FA] rounded-lg flex items-center gap-2 text-[#1B365D] hover:bg-[#E2E8F0] transition-all duration-300"
        >
          <svg
            className={`w-5 h-5 ${sortOrder === "asc" ? "" : "rotate-180"}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
          Sort by Name
        </button>
      </div>

      <div className="space-y-3">
        {filteredBatches.map((batch) => (
          <div
            key={batch._id}
            className="bg-white rounded-xl shadow-md overflow-hidden transition-all duration-500 hover:shadow-xl border border-[#E2E8F0]"
          >
            <div
              className="flex items-center justify-between p-4 cursor-pointer hover:bg-[#F5F7FA] transition-all duration-300"
              onClick={() => toggleExpand(batch._id)}
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 flex items-center justify-center bg-[#1B365D]/10 rounded-lg">
                  <svg
                    className="w-6 h-6 text-[#1B365D]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-[#1B365D]">
                    {batch.batchName} ({batch.intake})
                  </h3>
                  <p className="text-sm text-gray-500">{batch.batchNo}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                    isBatchAllocated(batch.batchNo)
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800 animate-blink"
                  }`}
                >
                  {isBatchAllocated(batch.batchNo) ? (
                    <>
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                      Allocated
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      Not Allocated
                    </>
                  )}
                </span>
                {!isBatchAllocated(batch.batchNo) && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleQuickAllocate(batch);
                    }}
                    className="text-[#1B365D] hover:text-[#1B365D]/70"
                    title="Quick Allocate"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 4v16m8-8H4" />
                    </svg>
                  </button>
                )}
                <svg
                  className={`w-5 h-5 text-[#1B365D] transition-transform duration-300 ${
                    expandedBatch === batch._id ? "rotate-180" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>

            <div
              className={`overflow-hidden transition-all duration-500 ease-in-out ${
                expandedBatch === batch._id ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
              }`}
            >
              <div className="p-6 bg-[#F9FAFB] border-t border-[#E2E8F0]">
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex items-center gap-3 bg-white p-3 rounded-lg border border-[#E2E8F0] hover:bg-[#F5F7FA] transition-all duration-200">
                      <svg
                        className="w-5 h-5 text-[#1B365D]"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h-2m-2 0h-2m-2 0H7"
                        />
                      </svg>
                      <div>
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Department</p>
                        <p className="text-sm font-semibold text-[#1B365D]">{batch.department}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 bg-white p-3 rounded-lg border border-[#E2E8F0] hover:bg-[#F5F7FA] transition-all duration-200">
                      <svg
                        className="w-5 h-5 text-[#1B365D]"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 1.636v-2a3 3 0 013.288-2.979M12 4a4 4 0 110 8 4 4 0 010-8z"
                        />
                      </svg>
                      <div>
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Students</p>
                        <p className="text-sm font-semibold text-[#1B365D]">{batch.studentCount}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 bg-white p-3 rounded-lg border border-[#E2E8F0] hover:bg-[#F5F7FA] transition-all duration-200">
                      <svg
                        className="w-5 h-5 text-[#1B365D]"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <div>
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Year/Semester</p>
                        <p className="text-sm font-semibold text-[#1B365D]">{`${batch.year} - ${batch.semester}`}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 bg-white p-3 rounded-lg border border-[#E2E8F0] hover:bg-[#F5F7FA] transition-all duration-200">
                      <svg
                        className="w-5 h-5 text-[#1B365D]"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                      <div>
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Schedule</p>
                        <p className="text-sm font-semibold text-[#1B365D]">{batch.scheduleType}</p>
                      </div>
                    </div>
                    <div className="sm:col-span-2 flex items-center gap-3 bg-white p-3 rounded-lg border border-[#E2E8F0] hover:bg-[#F5F7FA] transition-all duration-200">
                      <svg
                        className="w-5 h-5 text-[#1B365D]"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <div>
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Duration</p>
                        <p className="text-sm font-semibold text-[#1B365D]">{`${formatDate(
                          batch.startDate
                        )} - ${formatDate(batch.endDate)}`}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end gap-4 mt-4">
                    <button
                      onClick={() => handleEdit(batch)}
                      className="text-[#1B365D] hover:text-[#1B365D]/70"
                    >
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                        <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDeleteBatch(batch._id)}
                      className="text-red-500 hover:text-red-600"
                    >
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M3 6h18" />
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-[#1B365D]/30 backdrop-blur-sm flex justify-center items-center">
          <div className="bg-[#FFFFFF] rounded-lg w-[480px] max-h-[90vh] flex flex-col">
            <div className="p-6 border-b border-[#F5F7FA]">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-[#1B365D]">
                  {editingBatch ? "Edit Batch" : "Add New Batch"}
                </h3>
                <button onClick={() => setShowForm(false)} className="text-[#1B365D]/70 hover:text-[#1B365D]">
                  ✕
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-[#1B365D]">
                      Batch Name (Auto-generated)
                    </label>
                    <input
                      type="text"
                      value={newBatch.batchName}
                      readOnly
                      className="w-full p-2 border border-[#F5F7FA] rounded-lg bg-[#F5F7FA] text-[#1B365D] opacity-70"
                      placeholder="Will be generated based on dept, year, semester"
                    />
                    {batchError && batchError.toLowerCase().includes("batch name") && (
                      <p className="text-red-500 text-xs mt-1">{batchError}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-[#1B365D]">Intake *</label>
                    <select
                      value={newBatch.intake}
                      onChange={(e) => setNewBatch({ ...newBatch, intake: e.target.value })}
                      className={`w-full p-2 border border-[#F5F7FA] rounded-lg bg-[#F5F7FA] text-[#1B365D] ${
                        formErrors.intake ? "border-red-500" : ""
                      }`}
                    >
                      <option value="Regular">Regular</option>
                      <option value="Main">Main</option>
                    </select>
                    {formErrors.intake && <p className="text-red-500 text-xs mt-1">{formErrors.intake}</p>}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-[#1B365D]">
                    Batch Number (Auto-generated)
                  </label>
                  <input
                    type="text"
                    value={newBatch.batchNo}
                    readOnly
                    className="w-full p-2 border border-[#F5F7FA] rounded-lg bg-[#F5F7FA] text-[#1B365D] opacity-70"
                  />
                  {batchError && batchError.toLowerCase().includes("batch id") && (
                    <p className="text-red-500 text-xs mt-1">{batchError}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-[#1B365D]">Year *</label>
                    <select
                      value={newBatch.year}
                      onChange={(e) => setNewBatch({ ...newBatch, year: e.target.value })}
                      className={`w-full p-2 border border-[#F5F7FA] rounded-lg bg-[#F5F7FA] text-[#1B365D] ${
                        formErrors.year ? "border-red-500" : ""
                      }`}
                    >
                      <option value="">Select Year</option>
                      <option value="1">Year 1</option>
                      <option value="2">Year 2</option>
                      <option value="3">Year 3</option>
                      <option value="4">Year 4</option>
                    </select>
                    {formErrors.year && <p className="text-red-500 text-xs mt-1">{formErrors.year}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-[#1B365D]">Semester *</label>
                    <select
                      value={newBatch.semester}
                      onChange={(e) => setNewBatch({ ...newBatch, semester: e.target.value })}
                      className={`w-full p-2 border border-[#F5F7FA] rounded-lg bg-[#F5F7FA] text-[#1B365D] ${
                        formErrors.semester ? "border-red-500" : ""
                      }`}
                    >
                      <option value="Semester1">Semester 1</option>
                      <option value="Semester2">Semester 2</option>
                    </select>
                    {formErrors.semester && (
                      <p className="text-red-500 text-xs mt-1">{formErrors.semester}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-[#1B365D]">Department *</label>
                  <select
                    value={newBatch.department}
                    onChange={(e) => setNewBatch({ ...newBatch, department: e.target.value })}
                    className={`w-full p-2 border border-[#F5F7FA] rounded-lg bg-[#F5F7FA] text-[#1B365D] ${
                      formErrors.department ? "border-red-500" : ""
                    }`}
                  >
                    <option value="Information Technology">Information Technology</option>
                    <option value="Engineering">Engineering</option>
                    <option value="Business Studies">Business Studies</option>
                  </select>
                  {formErrors.department && (
                    <p className="text-red-500 text-xs mt-1">{formErrors.department}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-[#1B365D]">Student Count *</label>
                  <input
                    type="number"
                    value={newBatch.studentCount}
                    onChange={(e) => setNewBatch({ ...newBatch, studentCount: e.target.value })}
                    className={`w-full p-2 border border-[#F5F7FA] rounded-lg bg-[#F5F7FA] text-[#1B365D] ${
                      formErrors.studentCount ? "border-red-500" : ""
                    }`}
                    placeholder="Enter number of students (e.g., 30)"
                  />
                  {formErrors.studentCount && (
                    <p className="text-red-500 text-xs mt-1">{formErrors.studentCount}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-[#1B365D]">Start Date *</label>
                  <input
                    type="date"
                    value={newBatch.startDate}
                    onChange={(e) => setNewBatch({ ...newBatch, startDate: e.target.value })}
                    className={`w-full p-2 border border-[#F5F7FA] rounded-lg bg-[#F5F7FA] text-[#1B365D] ${
                      formErrors.startDate ? "border-red-500" : ""
                    }`}
                  />
                  {formErrors.startDate && (
                    <p className="text-red-500 text-xs mt-1">{formErrors.startDate}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-[#1B365D]">End Date *</label>
                  <input
                    type="date"
                    value={newBatch.endDate}
                    onChange={(e) => setNewBatch({ ...newBatch, endDate: e.target.value })}
                    className={`w-full p-2 border border-[#F5F7FA] rounded-lg bg-[#F5F7FA] text-[#1B365D] ${
                      formErrors.endDate ? "border-red-500" : ""
                    }`}
                  />
                  {formErrors.endDate && <p className="text-red-500 text-xs mt-1">{formErrors.endDate}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-[#1B365D]">Schedule *</label>
                  <div className="flex gap-6">
                    <label className="flex items-center gap-2 text-[#1B365D]">
                      <input
                        type="radio"
                        name="scheduleType"
                        value="Weekdays"
                        checked={newBatch.scheduleType === "Weekdays"}
                        onChange={(e) => setNewBatch({ ...newBatch, scheduleType: e.target.value })}
                        className="w-4 h-4 accent-[#1B365D]"
                      />
                      Weekday
                    </label>
                    <label className="flex items-center gap-2 text-[#1B365D]">
                      <input
                        type="radio"
                        name="scheduleType"
                        value="Weekend"
                        checked={newBatch.scheduleType === "Weekend"}
                        onChange={(e) => setNewBatch({ ...newBatch, scheduleType: e.target.value })}
                        className="w-4 h-4 accent-[#1B365D]"
                      />
                      Weekend
                    </label>
                  </div>
                  {formErrors.scheduleType && (
                    <p className="text-red-500 text-xs mt-1">{formErrors.scheduleType}</p>
                  )}
                </div>

                {/* Display general errors not related to batch name or ID */}
                {batchError && !batchError.toLowerCase().includes("batch name") && 
                 !batchError.toLowerCase().includes("batch id") && (
                  <p className="text-red-500 text-xs mt-1">{batchError}</p>
                )}
              </div>
            </div>

            <div className="p-6 border-t border-[#F5F7FA]">
              <button
                onClick={handleSaveBatch}
                className="w-full bg-[#1B365D] text-[#FFFFFF] py-2 rounded-lg hover:bg-[#1B365D]/90"
              >
                {editingBatch ? "Save Changes" : "Create Batch"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}