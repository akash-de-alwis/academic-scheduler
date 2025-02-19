import { useState, useEffect } from "react";
import axios from "axios";

const API_URL = "http://localhost:5000/api/lecturers";

const Lecturers = () => {
  const [lecturers, setLecturers] = useState([]);
  const [form, setForm] = useState({
    name: "",
    id: "",
    department: "",
    availability: "weekdays",
  });

  // Fetch lecturers from backend
  useEffect(() => {
    fetchLecturers();
  }, []);

  const fetchLecturers = async () => {
    try {
      const response = await axios.get(API_URL);
      setLecturers(response.data);
    } catch (error) {
      console.error("Error fetching lecturers:", error);
    }
  };

  // Handle input changes
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Add a new lecturer
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.id || !form.department) {
      alert("Please fill in all fields");
      return;
    }

    try {
      await axios.post(API_URL, form);
      fetchLecturers(); // Refresh list
      setForm({ name: "", id: "", department: "", availability: "weekdays" });
    } catch (error) {
      console.error("Error adding lecturer:", error);
    }
  };

  // Delete lecturer
  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API_URL}/${id}`);
      fetchLecturers();
    } catch (error) {
      console.error("Error deleting lecturer:", error);
    }
  };

  return (
    <div className="min-h-screen p-8 bg-gray-100">
      <h1 className="text-2xl font-bold mb-4">Lecturer List</h1>

      {/* Lecturer List */}
      <div className="mb-6">
        {lecturers.length === 0 ? (
          <p>No lecturers added yet.</p>
        ) : (
          <ul className="space-y-2">
            {lecturers.map((lecturer) => (
              <li key={lecturer._id} className="p-4 bg-white shadow rounded-lg flex justify-between">
                <span>{lecturer.name} - {lecturer.department} ({lecturer.availability})</span>
                <button 
                  onClick={() => handleDelete(lecturer._id)}
                  className="bg-red-500 text-white px-3 py-1 rounded"
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Add Lecturer Form */}
      <div className="p-6 bg-white shadow rounded-lg max-w-md">
        <h2 className="text-lg font-semibold mb-3">Add New Lecturer</h2>
        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="text"
            name="name"
            placeholder="Lecturer Name"
            value={form.name}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          />
          <input
            type="text"
            name="id"
            placeholder="Lecturer ID"
            value={form.id}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          />
          <select
            name="department"
            value={form.department}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          >
            <option value="">Select Department</option>
            <option value="Information Technology">Information Technology</option>
            <option value="Engineering">Engineering</option>
            <option value="Business Studies">Business Studies</option>
          </select>
          <div className="flex gap-4">
            <label>
              <input
                type="radio"
                name="availability"
                value="weekdays"
                checked={form.availability === "weekdays"}
                onChange={handleChange}
              />{" "}
              Weekdays
            </label>
            <label>
              <input
                type="radio"
                name="availability"
                value="weekend"
                checked={form.availability === "weekend"}
                onChange={handleChange}
              />{" "}
              Weekend
            </label>
          </div>
          <button type="submit" className="w-full bg-blue-500 text-white p-2 rounded">
            Add Lecturer
          </button>
        </form>
      </div>
    </div>
  );
};

export default Lecturers;
