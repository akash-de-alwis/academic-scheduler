import { useState, useEffect } from "react";
import axios from "axios";

const API_URL = "http://localhost:5000/api/allocations";
const LECTURER_API = "http://localhost:5000/api/lecturers";
const BATCH_API = "http://localhost:5000/api/batches";

const Allocations = () => {
  const [allocations, setAllocations] = useState([]);
  const [lecturers, setLecturers] = useState([]);
  const [batches, setBatches] = useState([]);
  const [form, setForm] = useState({
    courseId: "",
    courseName: "",
    batchId: "",
    batchName: "",
    lecturerId: "",
    lecturerName: "",
  });

  // Fetch Data from Backend
  useEffect(() => {
    fetchAllocations();
    fetchLecturers();
    fetchBatches();
  }, []);

  const fetchAllocations = async () => {
    try {
      const response = await axios.get(API_URL);
      setAllocations(response.data);
    } catch (error) {
      console.error("Error fetching allocations:", error);
    }
  };

  const fetchLecturers = async () => {
    try {
      const response = await axios.get(LECTURER_API);
      setLecturers(response.data);
    } catch (error) {
      console.error("Error fetching lecturers:", error);
    }
  };

  const fetchBatches = async () => {
    try {
      const response = await axios.get(BATCH_API);
      setBatches(response.data);
    } catch (error) {
      console.error("Error fetching batches:", error);
    }
  };

  // Handle input changes
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Auto-fill batch name when batch ID is selected
  const handleBatchSelect = (e) => {
    const selectedBatch = batches.find((b) => b.id === e.target.value);
    setForm({ ...form, batchId: e.target.value, batchName: selectedBatch?.name || "" });
  };

  // Auto-fill lecturer name when lecturer ID is selected
  const handleLecturerSelect = (e) => {
    const selectedLecturer = lecturers.find((l) => l.id === e.target.value);
    setForm({ ...form, lecturerId: e.target.value, lecturerName: selectedLecturer?.name || "" });
  };

  // Add new allocation
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.courseId || !form.courseName || !form.batchId || !form.lecturerId) {
      alert("Please fill in all fields");
      return;
    }

    try {
      await axios.post(API_URL, form);
      fetchAllocations();
      setForm({ courseId: "", courseName: "", batchId: "", batchName: "", lecturerId: "", lecturerName: "" });
    } catch (error) {
      console.error("Error adding allocation:", error);
    }
  };

  // Delete allocation
  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API_URL}/${id}`);
      fetchAllocations();
    } catch (error) {
      console.error("Error deleting allocation:", error);
    }
  };

  return (
    <div className="min-h-screen p-8 bg-gray-100">
      <h1 className="text-2xl font-bold mb-4">Allocations</h1>

      {/* Allocations List */}
      <div className="mb-6">
        {allocations.length === 0 ? (
          <p>No allocations found.</p>
        ) : (
          <ul className="space-y-2">
            {allocations.map((allocation) => (
              <li key={allocation._id} className="p-4 bg-white shadow rounded-lg flex justify-between">
                <span>
                  {allocation.courseName} - {allocation.batchName} ({allocation.lecturerName})
                </span>
                <button 
                  onClick={() => handleDelete(allocation._id)}
                  className="bg-red-500 text-white px-3 py-1 rounded"
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Add Allocation Form */}
      <div className="p-6 bg-white shadow rounded-lg max-w-md">
        <h2 className="text-lg font-semibold mb-3">Add New Allocation</h2>
        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="text"
            name="courseId"
            placeholder="Course ID"
            value={form.courseId}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          />
          <input
            type="text"
            name="courseName"
            placeholder="Course Name"
            value={form.courseName}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          />

          <select name="batchId" onChange={handleBatchSelect} className="w-full p-2 border rounded">
            <option value="">Select Batch</option>
            {batches.map((batch) => (
              <option key={batch.id} value={batch.id}>
                {batch.name}
              </option>
            ))}
          </select>

          <input
            type="text"
            name="batchName"
            placeholder="Batch Name"
            value={form.batchName}
            readOnly
            className="w-full p-2 border rounded bg-gray-200"
          />

          <select name="lecturerId" onChange={handleLecturerSelect} className="w-full p-2 border rounded">
            <option value="">Select Lecturer</option>
            {lecturers.map((lecturer) => (
              <option key={lecturer.id} value={lecturer.id}>
                {lecturer.name}
              </option>
            ))}
          </select>

          <input
            type="text"
            name="lecturerName"
            placeholder="Lecturer Name"
            value={form.lecturerName}
            readOnly
            className="w-full p-2 border rounded bg-gray-200"
          />

          <button type="submit" className="w-full bg-blue-500 text-white p-2 rounded">
            Allocate
          </button>
        </form>
      </div>
    </div>
  );
};

export default Allocations;
