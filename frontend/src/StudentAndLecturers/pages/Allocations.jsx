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
    subjects: [{ subjectName: "", subjectId: "" }],
    batchName: "",
    batchId: "",
    lecturerName: "",
    lecturerId: "",
  });

  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    axios.get("http://localhost:5000/api/allocations").then((res) => setAllocations(res.data));
    axios.get("http://localhost:5000/api/subjects").then((res) => setSubjects(res.data));
    axios.get("http://localhost:5000/api/batches").then((res) => setBatches(res.data));
    axios.get("http://localhost:5000/api/lecturers").then((res) => setLecturers(res.data));
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
      subjects: [{ subjectName: "", subjectId: "" }],
      batchName: "",
      batchId: "",
      lecturerName: "",
      lecturerId: "",
    });
  };

  // Handle quick allocate navigation and form state
  useEffect(() => {
    if (location.state?.quickAllocate) {
      // Auto-fill form with batch data from BatchList
      setNewAllocation({
        allocationId: generateAllocationId(),
        subjects: [{ subjectName: "", subjectId: "" }],
        batchName: location.state.batchName || "",
        batchId: location.state.batchId || "",
        lecturerName: "",
        lecturerId: "",
      });
      setShowForm(true); // Open the form
      setEditingAllocation(null); // Ensure it's a new allocation
    } else if (editingAllocation) {
      // Editing an existing allocation
      setNewAllocation({
        ...editingAllocation,
        subjects: editingAllocation.subjects || [{ subjectName: "", subjectId: "" }],
      });
    } else if (!showForm) {
      // Reset form when not showing or editing
      resetForm();
    }
  }, [location.state, editingAllocation, showForm]);

  const addSubjectField = () => {
    setNewAllocation((prev) => ({
      ...prev,
      subjects: [...prev.subjects, { subjectName: "", subjectId: "" }],
    }));
  };

  const removeSubjectField = (index) => {
    setNewAllocation((prev) => ({
      ...prev,
      subjects: prev.subjects.filter((_, i) => i !== index),
    }));
  };

  const handleSubjectChange = (index, value) => {
    const selected = subjects.find((s) => s.subjectName === value);
    setNewAllocation((prev) => {
      const updatedSubjects = [...prev.subjects];
      updatedSubjects[index] = {
        subjectName: selected.subjectName,
        subjectId: selected.subjectID,
      };
      return { ...prev, subjects: updatedSubjects };
    });
  };

  const handleSave = async () => {
    try {
      if (editingAllocation) {
        const res = await axios.put(
          `http://localhost:5000/api/allocations/${editingAllocation._id}`,
          newAllocation
        );
        setAllocations(
          allocations.map((allocation) =>
            allocation._id === editingAllocation._id ? res.data : allocation
          )
        );
      } else {
        const res = await axios.post("http://localhost:5000/api/allocations", newAllocation);
        setAllocations([...allocations, res.data]);
      }
      setShowForm(false);
      resetForm();
      setEditingAllocation(null);
      navigate("/allocations", { replace: true, state: {} }); // Clear navigation state
    } catch (err) {
      console.log(err.response ? err.response.data : err);
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
    navigate("/allocations", { replace: true, state: {} }); // Clear navigation state
  };

  return (
    <div className="min-h-screen p-8 bg-[#FFFFFF]">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold text-[#1B365D]">Subject Allocation Management</h2>
        <button
          onClick={() => {
            setShowForm(true);
            setEditingAllocation(null);
          }}
          className="bg-[#1B365D] text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-opacity-90"
        >
          + Add New Allocation
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {allocations.map((allocation) => (
          <div
            key={allocation._id}
            className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden"
          >
            <div className="bg-gradient-to-r from-[#1B365D] to-[#2A4A7F] p-4 text-white">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="bg-white/20 p-1.5 rounded-lg">
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <h3 className="font-medium text-sm tracking-wider">{allocation.allocationId}</h3>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setNewAllocation(allocation);
                      setEditingAllocation(allocation);
                      setShowForm(true);
                    }}
                    className="bg-white/20 p-1.5 rounded-lg hover:bg-white/30"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                      <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleDelete(allocation._id)}
                    className="bg-white/20 p-1.5 rounded-lg hover:bg-red-400/40"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M3 6h18" />
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
            <div className="p-5">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="bg-[#F0F4F9] p-2 rounded-lg">
                    <svg
                      className="w-5 h-5 text-[#1B365D]"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                  <div className="w-full">
                    <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">
                      Subjects
                    </p>
                    <div className="max-h-24 overflow-y-auto">
                      {allocation.subjects.map((subject, index) => (
                        <div key={index} className="mb-2">
                          <p className="text-[#1B365D] font-semibold">{subject.subjectName}</p>
                          <p className="text-xs text-gray-400 mt-0.5">{subject.subjectId}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="bg-[#F0F4F9] p-2 rounded-lg">
                    <svg
                      className="w-5 h-5 text-[#1B365D]"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Batch</p>
                    <p className="text-[#1B365D] font-semibold">{allocation.batchName}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{allocation.batchId}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="bg-[#F0F4F9] p-2 rounded-lg">
                    <svg
                      className="w-5 h-5 text-[#1B365D]"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Lecturer</p>
                    <p className="text-[#1B365D] font-semibold">{allocation.lecturerName}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{allocation.lecturerId}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-[#1B365D]/30 backdrop-blur-sm flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg w-[480px] max-h-[80vh] flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-[#1B365D]">
                {editingAllocation ? "Edit Allocation" : "Add New Allocation"}
              </h3>
              <button onClick={handleCloseForm} className="text-[#1B365D]/70 hover:text-[#1B365D]">
                ✕
              </button>
            </div>

            <div className="space-y-4 overflow-y-auto flex-grow">
              <div>
                <label className="block text-sm font-medium mb-2 text-[#1B365D]">Allocation ID</label>
                <input
                  type="text"
                  value={newAllocation.allocationId}
                  readOnly
                  className="w-full p-2 border border-[#F5F7FA] rounded-lg bg-[#F5F7FA] text-[#1B365D] opacity-75"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-[#1B365D]">Batch Name</label>
                <select
                  value={newAllocation.batchName}
                  onChange={(e) => {
                    const selected = batches.find((b) => b.batchName === e.target.value);
                    setNewAllocation((prev) => ({
                      ...prev,
                      batchName: selected.batchName,
                      batchId: selected.batchNo,
                    }));
                  }}
                  className="w-full p-2 border border-[#F5F7FA] rounded-lg bg-[#F5F7FA] text-[#1B365D]"
                >
                  <option value="">Select Batch</option>
                  {batches.map((batch) => (
                    <option key={batch._id} value={batch.batchName}>
                      {batch.batchName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-[#1B365D]">Batch ID</label>
                <input
                  type="text"
                  value={newAllocation.batchId}
                  readOnly
                  className="w-full p-2 border border-[#F5F7FA] rounded-lg bg-[#F5F7FA] text-[#1B365D] opacity-75"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-[#1B365D]">Subjects</label>
                {newAllocation.subjects.map((subject, index) => (
                  <div key={index} className="flex gap-2 mb-2 items-center">
                    <select
                      value={subject.subjectName}
                      onChange={(e) => handleSubjectChange(index, e.target.value)}
                      className="w-full p-2 border border-[#F5F7FA] rounded-lg bg-[#F5F7FA] text-[#1B365D]"
                    >
                      <option value="">Select Subject</option>
                      {subjects.map((subject) => (
                        <option key={subject._id} value={subject.subjectName}>
                          {subject.subjectName}
                        </option>
                      ))}
                    </select>
                    <input
                      type="text"
                      value={subject.subjectId}
                      readOnly
                      className="w-1/3 p-2 border border-[#F5F7FA] rounded-lg bg-[#F5F7FA] text-[#1B365D] opacity-75"
                    />
                    {index > 0 && (
                      <button
                        onClick={() => removeSubjectField(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}
                <button
                  onClick={addSubjectField}
                  className="mt-2 bg-[#1B365D] text-white px-3 py-1 rounded-lg flex items-center gap-2 hover:bg-opacity-90"
                >
                  + Add Subject
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-[#1B365D]">Lecturer Name</label>
                <select
                  value={newAllocation.lecturerName}
                  onChange={(e) => {
                    const selected = lecturers.find((l) => l.name === e.target.value);
                    setNewAllocation((prev) => ({
                      ...prev,
                      lecturerName: selected.name,
                      lecturerId: selected.lecturerId,
                    }));
                  }}
                  className="w-full p-2 border border-[#F5F7FA] rounded-lg bg-[#F5F7FA] text-[#1B365D]"
                >
                  <option value="">Select Lecturer</option>
                  {lecturers.map((lecturer) => (
                    <option key={lecturer._id} value={lecturer.name}>
                      {lecturer.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-[#1B365D]">Lecturer ID</label>
                <input
                  type="text"
                  value={newAllocation.lecturerId}
                  readOnly
                  className="w-full p-2 border border-[#F5F7FA] rounded-lg bg-[#F5F7FA] text-[#1B365D] opacity-75"
                />
              </div>
            </div>

            <button
              onClick={handleSave}
              className="w-full mt-6 bg-[#1B365D] text-white py-2 rounded-lg hover:bg-opacity-90"
            >
              {editingAllocation ? "Save Changes" : "Create Allocation"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}