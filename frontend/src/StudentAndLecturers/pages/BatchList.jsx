import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import axios from "axios";

export default function BatchList() {
  const [batches, setBatches] = useState([]);
  const [allocations, setAllocations] = useState([]);
  const [expandedBatch, setExpandedBatch] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingBatch, setEditingBatch] = useState(null);
  const [newBatch, setNewBatch] = useState({
    batchName: "",
    batchNo: "",
    year: "",
    department: "Information Technology",
    studentCount: "",
    startDate: "",
    endDate: "",
    scheduleType: "Weekdays",
  });
  const [filters, setFilters] = useState({
    department: "",
    scheduleType: "",
    allocated: "",
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");

  const navigate = useNavigate(); // Initialize navigate

  useEffect(() => {
    axios.get("http://localhost:5000/api/batches").then((res) => {
      setBatches(res.data);
    });
    axios.get("http://localhost:5000/api/allocations").then((res) => {
      setAllocations(res.data);
    });
  }, []);

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

  const handleSaveBatch = async () => {
    try {
      if (editingBatch) {
        const res = await axios.put(
          `http://localhost:5000/api/batches/${editingBatch._id}`,
          newBatch
        );
        setBatches((prevBatches) =>
          prevBatches.map((batch) =>
            batch._id === editingBatch._id ? res.data : batch
          )
        );
      } else {
        const res = await axios.post("http://localhost:5000/api/batches", newBatch);
        setBatches((prevBatches) => [...prevBatches, res.data]);
      }
      setShowForm(false);
      setNewBatch({
        batchName: "",
        batchNo: "",
        year: "",
        department: "Information Technology",
        studentCount: "",
        startDate: "",
        endDate: "",
        scheduleType: "Weekdays",
      });
      setEditingBatch(null);
    } catch (err) {
      console.log(err.response ? err.response.data : err);
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
    setNewBatch({
      ...batch,
      startDate: formatDateForInput(batch.startDate),
      endDate: formatDateForInput(batch.endDate),
      year: batch.year.toString(),
    });
    setEditingBatch(batch);
    setShowForm(true);
  };

  const isBatchAllocated = (batchName) => {
    return allocations.some((allocation) => allocation.batchName === batchName);
  };

  const toggleExpand = (batchId) => {
    setExpandedBatch(expandedBatch === batchId ? null : batchId);
  };

  const handleQuickAllocate = (batch) => {
    // Navigate to Allocations and pass batch data
    navigate("/allocations", {
      state: {
        batchName: batch.batchName,
        batchId: batch.batchNo,
        quickAllocate: true, // Flag to trigger form popup
      },
    });
  };

  const filteredBatches = batches
    .filter((batch) => {
      return (
        (filters.department === "" || batch.department === filters.department) &&
        (filters.scheduleType === "" || batch.scheduleType === filters.scheduleType) &&
        (filters.allocated === "" ||
          (filters.allocated === "yes" && isBatchAllocated(batch.batchName)) ||
          (filters.allocated === "no" && !isBatchAllocated(batch.batchName))) &&
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
                <div className="w-12 h-12 rounded-full bg-[#1B365D] flex items-center justify-center text-white text-lg font-semibold">
                  {batch.batchName.charAt(0)}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-[#1B365D]">{batch.batchName}</h3>
                  <p className="text-sm text-gray-500">{batch.batchNo}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                    isBatchAllocated(batch.batchName)
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800 animate-blink"
                  }`}
                >
                  {isBatchAllocated(batch.batchName) ? (
                    <>
                      <svg
                        className="w-4 h-4 mr-1"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      Allocated
                    </>
                  ) : (
                    <>
                      <svg
                        className="w-4 h-4 mr-1"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                      Not Allocated
                    </>
                  )}
                </span>
                {/* Quick Allocate Icon for Unallocated Batches */}
                {!isBatchAllocated(batch.batchName) && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent triggering toggleExpand
                      handleQuickAllocate(batch);
                    }}
                    className="text-[#1B365D] hover:text-[#1B365D]/70"
                    title="Quick Allocate"
                  >
                    <svg
                      className="w-5 h-5"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
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
              <div className="p-4 bg-[#F9FAFB] border-t border-[#E2E8F0]">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Department</p>
                    <p className="text-[#1B365D]">{batch.department}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Students</p>
                    <p className="text-[#1B365D]">{batch.studentCount}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Schedule</p>
                    <p className="text-[#1B365D]">{batch.scheduleType}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Duration</p>
                    <p className="text-[#1B365D]">{`${formatDate(batch.startDate)} - ${formatDate(
                      batch.endDate
                    )}`}</p>
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
                <div>
                  <label className="block text-sm font-medium mb-2 text-[#1B365D]">
                    Batch Name
                  </label>
                  <input
                    type="text"
                    value={newBatch.batchName}
                    onChange={(e) =>
                      setNewBatch({ ...newBatch, batchName: e.target.value })
                    }
                    className="w-full p-2 border border-[#F5F7FA] rounded-lg bg-[#F5F7FA] text-[#1B365D]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-[#1B365D]">
                    Batch Number
                  </label>
                  <input
                    type="text"
                    value={newBatch.batchNo}
                    onChange={(e) =>
                      setNewBatch({ ...newBatch, batchNo: e.target.value })
                    }
                    className="w-full p-2 border border-[#F5F7FA] rounded-lg bg-[#F5F7FA] text-[#1B365D]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-[#1B365D]">
                    Year
                  </label>
                  <input
                    type="number"
                    value={newBatch.year}
                    onChange={(e) =>
                      setNewBatch({ ...newBatch, year: e.target.value })
                    }
                    className="w-full p-2 border border-[#F5F7FA] rounded-lg bg-[#F5F7FA] text-[#1B365D]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-[#1B365D]">
                    Department
                  </label>
                  <select
                    value={newBatch.department}
                    onChange={(e) =>
                      setNewBatch({ ...newBatch, department: e.target.value })
                    }
                    className="w-full p-2 border border-[#F5F7FA] rounded-lg bg-[#F5F7FA] text-[#1B365D]"
                  >
                    <option>Information Technology</option>
                    <option>Engineering</option>
                    <option>Business Studies</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-[#1B365D]">
                    Student Count
                  </label>
                  <input
                    type="number"
                    value={newBatch.studentCount}
                    onChange={(e) =>
                      setNewBatch({ ...newBatch, studentCount: e.target.value })
                    }
                    className="w-full p-2 border border-[#F5F7FA] rounded-lg bg-[#F5F7FA] text-[#1B365D]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-[#1B365D]">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={newBatch.startDate}
                    onChange={(e) =>
                      setNewBatch({ ...newBatch, startDate: e.target.value })
                    }
                    className="w-full p-2 border border-[#F5F7FA] rounded-lg bg-[#F5F7FA] text-[#1B365D]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-[#1B365D]">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={newBatch.endDate}
                    onChange={(e) =>
                      setNewBatch({ ...newBatch, endDate: e.target.value })
                    }
                    className="w-full p-2 border border-[#F5F7FA] rounded-lg bg-[#F5F7FA] text-[#1B365D]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-[#1B365D]">
                    Schedule
                  </label>
                  <div className="flex gap-6">
                    <label className="flex items-center gap-2 text-[#1B365D]">
                      <input
                        type="radio"
                        name="scheduleType"
                        value="Weekdays"
                        checked={newBatch.scheduleType === "Weekdays"}
                        onChange={(e) =>
                          setNewBatch({ ...newBatch, scheduleType: e.target.value })
                        }
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
                        onChange={(e) =>
                          setNewBatch({ ...newBatch, scheduleType: e.target.value })
                        }
                        className="w-4 h-4 accent-[#1B365D]"
                      />
                      Weekend
                    </label>
                  </div>
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