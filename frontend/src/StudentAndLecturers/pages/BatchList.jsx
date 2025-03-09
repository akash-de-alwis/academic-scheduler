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
    intake: "Regular",
    batchNoPrefix: "BT",
    batchNo1: "",
    batchNo2: "",
    batchNo3: "",
    year: "",
    semester: "Semester1",
    department: "Information Technology",
    studentCount: "",
    startDate: "",
    endDate: "",
    scheduleType: "Weekdays",
  });
  const [formErrors, setFormErrors] = useState({});
  const [duplicateBatchNoError, setDuplicateBatchNoError] = useState("");
  const [filters, setFilters] = useState({
    department: "",
    scheduleType: "",
    allocated: "",
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");

  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const batchesRes = await axios.get("http://localhost:5000/api/batches");
        const allocationsRes = await axios.get("http://localhost:5000/api/allocations");
        setBatches(batchesRes.data);
        setAllocations(allocationsRes.data);
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

    if (newBatch.department && newBatch.startDate) {
      const year = new Date(newBatch.startDate).getFullYear().toString();
      const deptCode = deptMap[newBatch.department];
      setNewBatch((prev) => ({
        ...prev,
        batchName: `${deptCode}-${year}`,
      }));
    }
  }, [newBatch.department, newBatch.startDate]);

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
      "batchNo1",
      "batchNo2",
      "batchNo3",
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

    if (newBatch.batchNo1 && !/^\d+$/.test(newBatch.batchNo1)) {
      errors.batchNo1 = "Must be numbers only";
    }
    if (newBatch.batchNo2 && !/^\d+$/.test(newBatch.batchNo2)) {
      errors.batchNo2 = "Must be numbers only";
    }
    if (newBatch.batchNo3 && !/^\d+$/.test(newBatch.batchNo3)) {
      errors.batchNo3 = "Must be numbers only";
    }

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

  const handleSaveBatch = async () => {
    if (!validateForm()) return;

    try {
      const batchData = {
        ...newBatch,
        batchNo: `${newBatch.batchNoPrefix}${newBatch.batchNo1}${newBatch.batchNo2}${newBatch.batchNo3}`,
      };

      setDuplicateBatchNoError("");

      if (editingBatch) {
        const res = await axios.put(`http://localhost:5000/api/batches/${editingBatch._id}`, batchData);
        setBatches((prevBatches) =>
          prevBatches.map((batch) => (batch._id === editingBatch._id ? res.data : batch))
        );
      } else {
        const res = await axios.post("http://localhost:5000/api/batches", batchData);
        setBatches((prevBatches) => [...prevBatches, res.data]);
      }
      setShowForm(false);
      setNewBatch({
        batchName: "",
        intake: "Regular",
        batchNoPrefix: "BT",
        batchNo1: "",
        batchNo2: "",
        batchNo3: "",
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
      if (err.response && err.response.data.message === "Batch ID already exists") {
        setDuplicateBatchNoError("Batch ID already exists");
      } else {
        console.log(err.response ? err.response.data : err);
      }
    }
  };

  const handleDeleteBatch = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/batches/${id}`);
      setBatches(batches.filter((batch) => batch._id !== id));
    } catch (err) {
      console.log(err.response ? err.response.data : err);
    }
  };

  const handleEdit = (batch) => {
    const batchNoParts = batch.batchNo.match(/BT(\d)(\d)(\d)/);
    setNewBatch({
      ...batch,
      batchNoPrefix: "BT",
      batchNo1: batchNoParts ? batchNoParts[1] : "",
      batchNo2: batchNoParts ? batchNoParts[2] : "",
      batchNo3: batchNoParts ? batchNoParts[3] : "",
      startDate: formatDateForInput(batch.startDate),
      endDate: formatDateForInput(batch.endDate),
      year: batch.year.toString(),
    });
    setEditingBatch(batch);
    setShowForm(true);
    setDuplicateBatchNoError("");
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
    <div className="min-h-screen p-8 bg-[#FFFFFF]">
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
            }}
            className="bg-[#1B365D] text-[#FFFFFF] px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-[#1B365D]/90"
          >
            + Add New Batch
          </button>
        </div>
      </div>

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
                      placeholder="Will be generated based on department and start date"
                    />
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
                  <label className="block text-sm font-medium mb-2 text-[#1B365D]">Batch Number *</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newBatch.batchNoPrefix}
                      readOnly
                      className="w-16 p-2 border border-[#F5F7FA] rounded-lg bg-[#F5F7FA] text-[#1B365D] opacity-70 text-center"
                    />
                    <input
                      type="text"
                      value={newBatch.batchNo1}
                      onChange={(e) => setNewBatch({ ...newBatch, batchNo1: e.target.value })}
                      maxLength={1}
                      className={`w-12 p-2 border border-[#F5F7FA] rounded-lg bg-[#F5F7FA] text-[#1B365D] text-center ${
                        formErrors.batchNo1 ? "border-red-500" : ""
                      }`}
                      placeholder="0"
                    />
                    <input
                      type="text"
                      value={newBatch.batchNo2}
                      onChange={(e) => setNewBatch({ ...newBatch, batchNo2: e.target.value })}
                      maxLength={1}
                      className={`w-12 p-2 border border-[#F5F7FA] rounded-lg bg-[#F5F7FA] text-[#1B365D] text-center ${
                        formErrors.batchNo2 ? "border-red-500" : ""
                      }`}
                      placeholder="0"
                    />
                    <input
                      type="text"
                      value={newBatch.batchNo3}
                      onChange={(e) => setNewBatch({ ...newBatch, batchNo3: e.target.value })}
                      maxLength={1}
                      className={`w-12 p-2 border border-[#F5F7FA] rounded-lg bg-[#F5F7FA] text-[#1B365D] text-center ${
                        formErrors.batchNo3 ? "border-red-500" : ""
                      }`}
                      placeholder="0"
                    />
                  </div>
                  {(formErrors.batchNo1 || formErrors.batchNo2 || formErrors.batchNo3) && (
                    <p className="text-red-500 text-xs mt-1">
                      {formErrors.batchNo1 || formErrors.batchNo2 || formErrors.batchNo3}
                    </p>
                  )}
                  {duplicateBatchNoError && (
                    <p className="text-red-500 text-xs mt-1">{duplicateBatchNoError}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-[#1B365D]">Year *</label>
                    <input
                      type="number"
                      value={newBatch.year}
                      onChange={(e) => setNewBatch({ ...newBatch, year: e.target.value })}
                      className={`w-full p-2 border border-[#F5F7FA] rounded-lg bg-[#F5F7FA] text-[#1B365D] ${
                        formErrors.year ? "border-red-500" : ""
                      }`}
                      placeholder="e.g., 2025"
                    />
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