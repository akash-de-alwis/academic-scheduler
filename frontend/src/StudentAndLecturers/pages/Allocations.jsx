import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";

export default function Allocations() {
  const [allocations, setAllocations] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [batches, setBatches] = useState([]);
  const [lecturers, setLecturers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingAllocation, setEditingAllocation] = useState(null);
  const [newAllocation, setNewAllocation] = useState({
    allocationId: "",
    subjects: [{ subjectName: "", subjectId: "", lecturerName: "", lecturerId: "" }],
    batchName: "",
    batchId: "",
  });
  const [batchError, setBatchError] = useState("");
  const [lecturerErrors, setLecturerErrors] = useState({});
  const [suggestedLecturers, setSuggestedLecturers] = useState({});
  const [lecturerDropdownOpen, setLecturerDropdownOpen] = useState({});
  const [selectedBatchSchedule, setSelectedBatchSchedule] = useState(null);

  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [allocationsRes, subjectsRes, batchesRes, lecturersRes] = await Promise.all([
          axios.get("http://localhost:5000/api/allocations"),
          axios.get("http://localhost:5000/api/subjects"),
          axios.get("http://localhost:5000/api/batches"),
          axios.get("http://localhost:5000/api/lecturers"),
        ]);
        setAllocations(allocationsRes.data);
        setSubjects(subjectsRes.data);
        setBatches(batchesRes.data);
        setLecturers(lecturersRes.data);
        console.log("Fetched lecturers:", lecturersRes.data); // Debug lecturer data
      } catch (err) {
        console.error("Error fetching data:", err);
      }
    };
    fetchData();
  }, []);

  const generateAllocationId = () => {
    const prefix = "ALLOC";
    const timestamp = Date.now().toString().slice(-4);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, "0");
    return `${prefix}${timestamp}${random}`;
  };

  const resetForm = () => {
    setNewAllocation({
      allocationId: generateAllocationId(),
      subjects: [{ subjectName: "", subjectId: "", lecturerName: "", lecturerId: "" }],
      batchName: "",
      batchId: "",
    });
    setBatchError("");
    setLecturerErrors({});
    setSuggestedLecturers({});
    setLecturerDropdownOpen({});
    setSelectedBatchSchedule(null);
  };

  useEffect(() => {
    if (location.state?.quickAllocate && batches.length > 0) {
      const selectedBatch = batches.find(
        (b) => b.batchName === location.state.batchName && b.batchNo === location.state.batchId
      );
      if (selectedBatch) {
        setNewAllocation({
          allocationId: generateAllocationId(),
          subjects: [{ subjectName: "", subjectId: "", lecturerName: "", lecturerId: "" }],
          batchName: `${selectedBatch.batchName} (${selectedBatch.intake})`,
          batchId: selectedBatch.batchNo,
        });
        setSelectedBatchSchedule(selectedBatch.scheduleType);
        setShowForm(true);
        setEditingAllocation(null);
      }
    } else if (editingAllocation && batches.length > 0) {
      const batch = batches.find((b) => b.batchNo === editingAllocation.batchId);
      if (batch) {
        setNewAllocation({
          ...editingAllocation,
          batchName: `${batch.batchName} (${batch.intake})`,
          batchId: batch.batchNo,
          subjects: editingAllocation.subjects || [{ subjectName: "", subjectId: "", lecturerName: "", lecturerId: "" }],
        });
        setSelectedBatchSchedule(batch.scheduleType);
      }
    } else if (!showForm) {
      resetForm();
    }
  }, [location.state, editingAllocation, showForm, batches]);

  const addSubjectField = () => {
    setNewAllocation((prev) => ({
      ...prev,
      subjects: [...prev.subjects, { subjectName: "", subjectId: "", lecturerName: "", lecturerId: "" }],
    }));
  };

  const removeSubjectField = (index) => {
    setNewAllocation((prev) => ({
      ...prev,
      subjects: prev.subjects.filter((_, i) => i !== index),
    }));
    setLecturerErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[index];
      return newErrors;
    });
    setSuggestedLecturers((prev) => {
      const newSuggestions = { ...prev };
      delete newSuggestions[index];
      return newSuggestions;
    });
  };

  const handleSubjectChange = (index, value) => {
    const selected = subjects.find((s) => s.subjectName === value);
    setNewAllocation((prev) => {
      const updatedSubjects = [...prev.subjects];
      updatedSubjects[index] = {
        ...updatedSubjects[index],
        subjectName: selected.subjectName,
        subjectId: selected.subjectID,
      };
      return { ...prev, subjects: updatedSubjects };
    });
  };

  const handleLecturerSelect = (index, lecturer) => {
    setNewAllocation((prev) => {
      const updatedSubjects = [...prev.subjects];
      updatedSubjects[index] = {
        ...updatedSubjects[index],
        lecturerName: lecturer.name,
        lecturerId: lecturer.lecturerId,
      };
      return { ...prev, subjects: updatedSubjects };
    });
    setLecturerDropdownOpen((prev) => ({ ...prev, [index]: false }));
  };

  const handleSave = async () => {
    try {
      const batchNameWithoutIntake = newAllocation.batchName.split(" (")[0];
      const saveData = {
        ...newAllocation,
        batchName: batchNameWithoutIntake,
      };

      if (!saveData.batchName) throw new Error("Batch is required");
      if (saveData.subjects.some(s => !s.subjectName)) throw new Error("All subjects must be selected");

      setBatchError("");
      setLecturerErrors({});
      setSuggestedLecturers({});

      if (editingAllocation) {
        const res = await axios.put(
          `http://localhost:5000/api/allocations/${editingAllocation._id}`,
          saveData
        );
        setAllocations(
          allocations.map((allocation) =>
            allocation._id === editingAllocation._id ? res.data : allocation
          )
        );
      } else {
        const res = await axios.post("http://localhost:5000/api/allocations", saveData);
        setAllocations([...allocations, res.data]);
      }
      setShowForm(false);
      resetForm();
      setEditingAllocation(null);
      navigate("/allocations", { replace: true, state: {} });
    } catch (err) {
      if (err.message === "Batch is required") {
        setBatchError("Please select a batch");
      } else if (err.message === "All subjects must be selected") {
        setBatchError("Please ensure all subjects are selected");
      } else if (err.response?.data.message === "This batch is already allocated") {
        setBatchError("This batch is already allocated");
      } else if (err.response?.data.message.includes("Lecturer")) {
        const subjectIndex = newAllocation.subjects.findIndex(
          (s) => s.subjectName === err.response.data.subject
        );
        setLecturerErrors((prev) => ({
          ...prev,
          [subjectIndex]: err.response.data.message,
        }));
        if (err.response.data.suggestedLecturer) {
          setSuggestedLecturers((prev) => ({
            ...prev,
            [subjectIndex]: err.response.data.suggestedLecturer,
          }));
        }
      } else {
        console.log(err.response ? err.response.data : err);
      }
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/allocations/${id}`);
      setAllocations(allocations.filter((allocation) => allocation._id !== id));
    } catch (err) {
      console.log(err.response ? err.response.data : err);
    }
  };

  const handleCloseForm = () => {
    setShowForm(false);
    resetForm();
    setEditingAllocation(null);
    navigate("/allocations", { replace: true, state: {} });
  };

  const handleUseSuggestedLecturer = (index) => {
    const suggested = suggestedLecturers[index];
    if (suggested) {
      setNewAllocation((prev) => {
        const updatedSubjects = [...prev.subjects];
        updatedSubjects[index] = {
          ...updatedSubjects[index],
          lecturerName: suggested.name,
          lecturerId: suggested.lecturerId,
        };
        return { ...prev, subjects: updatedSubjects };
      });
      setLecturerErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[index];
        return newErrors;
      });
      setSuggestedLecturers((prev) => {
        const newSuggestions = { ...prev };
        delete newSuggestions[index];
        return newSuggestions;
      });
    }
  };

  const handleBatchChange = (e) => {
    const selectedBatch = batches.find((b) => `${b.batchName} (${b.intake})` === e.target.value);
    if (selectedBatch) {
      setNewAllocation((prev) => ({
        ...prev,
        batchName: `${selectedBatch.batchName} (${selectedBatch.intake})`,
        batchId: selectedBatch.batchNo,
        subjects: prev.subjects.map(s => ({ ...s, lecturerName: "", lecturerId: "" })),
      }));
      setSelectedBatchSchedule(selectedBatch.scheduleType);
      setLecturerDropdownOpen({});
    }
  };

  const filteredLecturers = selectedBatchSchedule
    ? lecturers.filter((lecturer) => lecturer.scheduleType === selectedBatchSchedule)
    : lecturers;

  return (
    <>
      <div className="min-h-screen p-8">
        <style>{`
          @keyframes slideIn {
            from { transform: translateY(-20px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
          }
          .alert-slide-in {
            animation: slideIn 0.3s ease-out forwards;
          }
          .dropdown-menu {
            max-height: 250px;
            overflow-y: auto;
            scrollbar-width: thin;
            scrollbar-color: #1B365D #F5F7FA;
            width: 100%;
          }
          .dropdown-option:hover {
            background-color: #F0F4F9;
            transform: scale(1.01);
            transition: all 0.2s ease-in-out;
          }
          .card {
            transition: transform 0.2s ease, box-shadow 0.2s ease;
          }
          .card:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 20px rgba(27, 54, 93, 0.15);
          }
          .card-header {
            background: linear-gradient(135deg, #1B365D 0%, #3B5A9A 100%);
          }
          .subject-chip {
            background: #E6ECF5;
            color: #1B365D;
            padding: 4px 10px;
            border-radius: 12px;
            font-size: 0.75rem;
            display: inline-flex;
            align-items: center;
            gap: 4px;
          }
          .icon-circle {
            background: rgba(255, 255, 255, 0.2);
            padding: 6px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .form-section {
            background: #F9FAFB;
            padding: 16px;
            border-radius: 8px;
          }
        `}</style>

        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-[#1B365D] tracking-tight">Subject Allocations</h2>
          <button
            onClick={() => {
              setShowForm(true);
              setEditingAllocation(null);
            }}
            className="bg-[#1B365D] text-white px-5 py-2 rounded-lg flex items-center gap-2 hover:bg-[#2A4A7F] transition-colors shadow-md"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            Add Allocation
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {allocations.map((allocation) => (
            <div
              key={allocation._id}
              className="card bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden"
            >
              <div className="card-header p-4 text-white">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="icon-circle">
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                    </div>
                    <h3 className="font-semibold text-lg tracking-wide">{allocation.allocationId}</h3>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setNewAllocation(allocation);
                        setEditingAllocation(allocation);
                        setShowForm(true);
                      }}
                      className="bg-white/20 p-1.5 rounded-lg hover:bg-white/30 transition-colors"
                      title="Edit"
                    >
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                        <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDelete(allocation._id)}
                      className="bg-white/20 p-1.5 rounded-lg hover:bg-red-400/40 transition-colors"
                      title="Delete"
                    >
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M3 6h18" />
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
              <div className="p-6 space-y-5">
                <div className="flex items-start gap-4">
                  <div className="bg-[#E6ECF5] p-2 rounded-full flex-shrink-0">
                    <svg
                      className="w-6 h-6 text-[#1B365D]"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">
                      Subjects
                    </p>
                    <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto">
                      {allocation.subjects.map((subject, index) => (
                        <div key={index} className="subject-chip">
                          <span className="font-medium">{subject.subjectName}</span>
                          <span className="text-gray-500">({subject.subjectId})</span>
                          {subject.lecturerName && (
                            <span className="ml-1 text-xs"> - {subject.lecturerName}</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="bg-[#E6ECF5] p-2 rounded-full flex-shrink-0">
                    <svg
                      className="w-6 h-6 text-[#1B365D]"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-1">
                      Batch
                    </p>
                    <p className="text-[#1B365D] font-semibold text-lg">{allocation.batchName}</p>
                    <p className="text-sm text-gray-600">{allocation.batchId}</p>
                  </div>
                </div>

                {allocation.lecturerName && (
                  <div className="flex items-start gap-4">
                    <div className="bg-[#E6ECF5] p-2 rounded-full flex-shrink-0">
                      <svg
                        className="w-6 h-6 text-[#1B365D]"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-1">
                        Lecturer
                      </p>
                      <p className="text-[#1B365D] font-semibold text-lg">{allocation.lecturerName}</p>
                      <p className="text-sm text-gray-600">{allocation.lecturerId}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {showForm && (
          <div className="fixed inset-0 bg-[#1B365D]/30 backdrop-blur-sm flex justify-center items-center">
            <div className="bg-white p-8 rounded-xl w-[600px] max-h-[90vh] flex flex-col shadow-2xl">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-[#1B365D] tracking-tight">
                  {editingAllocation ? "Edit Allocation" : "New Allocation"}
                </h3>
                <button onClick={handleCloseForm} className="text-[#1B365D]/70 hover:text-[#1B365D] text-2xl font-medium">
                  ✕
                </button>
              </div>

              <div className="space-y-8 overflow-y-auto flex-grow">
                {/* Batch Section */}
                <div className="form-section">
                  <h4 className="text-base font-medium text-[#1B365D] mb-4">Batch Details</h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-2">Allocation ID</label>
                      <input
                        type="text"
                        value={newAllocation.allocationId}
                        readOnly
                        className="w-full p-3 border border-[#E2E8F0] rounded-lg bg-[#F5F7FA] text-[#1B365D] text-sm shadow-sm"
                        aria-label="Allocation ID (auto-generated)"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-2">Batch Name *</label>
                      <select
                        value={newAllocation.batchName}
                        onChange={handleBatchChange}
                        className="w-full p-3 border border-[#E2E8F0] rounded-lg bg-white text-sm text-[#1B365D] focus:ring-2 focus:ring-[#1B365D] shadow-sm hover:bg-[#F5F7FA] transition-colors"
                        aria-label="Select batch"
                      >
                        <option value="">Choose a batch</option>
                        {batches.map((batch) => (
                          <option key={batch._id} value={`${batch.batchName} (${batch.intake})`}>
                            {batch.batchName} ({batch.intake}) - {batch.scheduleType}
                          </option>
                        ))}
                      </select>
                      {batchError && (
                        <p className="text-red-500 text-sm mt-2 flex items-center gap-2">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {batchError}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Subjects Section */}
                <div className="form-section">
                  <h4 className="text-base font-medium text-[#1B365D] mb-4">Subjects</h4>
                  {newAllocation.subjects.map((subject, index) => (
                    <div key={index} className="mb-6 border-b border-gray-200 pb-6 last:border-b-0">
                      <div className="flex items-center justify-between mb-3">
                        <label className="text-sm font-medium text-gray-600">Subject {index + 1} *</label>
                        {index > 0 && (
                          <button
                            onClick={() => removeSubjectField(index)}
                            className="text-red-500 hover:text-red-700 text-sm font-medium"
                            aria-label={`Remove subject ${index + 1}`}
                          >
                            Remove
                          </button>
                        )}
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <select
                          value={subject.subjectName}
                          onChange={(e) => handleSubjectChange(index, e.target.value)}
                          className="w-full p-3 border border-[#E2E8F0] rounded-lg bg-white text-sm text-[#1B365D] focus:ring-2 focus:ring-[#1B365D] shadow-sm hover:bg-[#F5F7FA] transition-colors"
                          aria-label={`Select subject ${index + 1}`}
                        >
                          <option value="">Choose a subject</option>
                          {subjects.map((subject) => (
                            <option key={subject._id} value={subject.subjectName}>
                              {subject.subjectName}
                            </option>
                          ))}
                        </select>
                        <div className="relative">
                          <div
                            onClick={() => setLecturerDropdownOpen((prev) => ({ ...prev, [index]: !prev[index] }))}
                            className="w-full p-3 border border-[#E2E8F0] rounded-lg bg-white text-sm text-[#1B365D] cursor-pointer flex items-center justify-between hover:bg-[#F5F7FA] shadow-sm transition-colors"
                            aria-label={`Select lecturer for subject ${index + 1}`}
                          >
                            <span>{subject.lecturerName || "Choose lecturer"}</span>
                            <svg
                              className={`w-4 h-4 text-[#1B365D] transition-transform ${lecturerDropdownOpen[index] ? "rotate-180" : ""}`}
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                            </svg>
                          </div>
                          {lecturerDropdownOpen[index] && (
                            <div className="absolute z-10 w-full mt-1 bg-white border border-[#E2E8F0] rounded-lg shadow-lg dropdown-menu">
                              {filteredLecturers.length > 0 ? (
                                filteredLecturers.map((lecturer) => (
                                  <div
                                    key={lecturer._id}
                                    onClick={() => handleLecturerSelect(index, lecturer)}
                                    className="dropdown-option p-3 cursor-pointer hover:bg-[#F0F4F9] text-sm text-[#1B365D]"
                                  >
                                    <div className="flex flex-col">
                                      <span className="font-medium">{lecturer.name}</span>
                                      <span className="text-xs text-gray-500">
                                        Skills: {lecturer.skills && lecturer.skills.length > 0 
                                          ? lecturer.skills.join(", ") 
                                          : "No skills listed"}
                                      </span>
                                    </div>
                                  </div>
                                ))
                              ) : (
                                <div className="p-3 text-gray-500 text-sm">No lecturers available</div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                      {lecturerErrors[index] && (
                        <div className="mt-3 bg-red-50 border-l-4 border-red-400 p-3 text-red-700 text-sm rounded shadow-sm">
                          <p>{lecturerErrors[index]}</p>
                          {suggestedLecturers[index] && (
                            <div className="mt-2">
                              <p>Suggested: <span className="font-medium">{suggestedLecturers[index].name}</span></p>
                              <button
                                onClick={() => handleUseSuggestedLecturer(index)}
                                className="text-[#1B365D] underline hover:text-[#2A4A7F] text-sm"
                              >
                                Use this lecturer
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                  <button
                    onClick={addSubjectField}
                    className="text-[#1B365D] text-sm font-medium hover:underline flex items-center gap-2 mt-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                    </svg>
                    Add another subject
                  </button>
                </div>
              </div>

              <div className="flex justify-end gap-4 mt-8">
                <button
                  onClick={handleCloseForm}
                  className="px-5 py-2 text-[#1B365D] bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors shadow-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="px-5 py-2 bg-[#1B365D] text-white rounded-lg hover:bg-[#2A4A7F] transition-colors shadow-sm font-medium"
                >
                  {editingAllocation ? "Save Changes" : "Create"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}