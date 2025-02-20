import { useState, useEffect } from "react";
import axios from "axios";

export default function BatchList() {
  // Previous state declarations remain the same
  const [batches, setBatches] = useState([]);
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

  // Previous useEffect and handlers remain the same
  useEffect(() => {
    axios.get("http://localhost:5000/api/batches").then((res) => {
      setBatches(res.data);
    });
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB");
  };

  const handleSaveBatch = async () => {
    try {
      if (editingBatch) {
        const res = await axios.put(
          `http://localhost:5000/api/batches/${editingBatch._id}`,
          newBatch
        );
        setBatches((prevBatches) =>
          prevBatches.map((batch) => (batch._id === editingBatch._id ? res.data : batch))
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

  return (
    <div className="p-6 bg-white">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold">Batch Management</h2>
        <button
          onClick={() => {
            setShowForm(true);
            setEditingBatch(null);
          }}
          className="flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-800"
        >
          <span className="text-xl">+</span> Add New Batch
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex justify-center items-center">
          <div className="bg-white rounded-lg shadow-lg w-[500px] max-h-[90vh] relative">
            <div className="p-8">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold">
                  {editingBatch ? "Edit Batch" : "Add New Batch"}
                </h3>
                <button 
                  onClick={() => setShowForm(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              </div>
              <div className="overflow-y-auto max-h-[calc(90vh-200px)] pr-2">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Batch Name</label>
                    <input
                      type="text"
                      value={newBatch.batchName}
                      onChange={(e) => setNewBatch({ ...newBatch, batchName: e.target.value })}
                      className="w-full p-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Batch Number</label>
                    <input
                      type="text"
                      value={newBatch.batchNo}
                      onChange={(e) => setNewBatch({ ...newBatch, batchNo: e.target.value })}
                      className="w-full p-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Year</label>
                    <input
                      type="number"
                      value={newBatch.year}
                      onChange={(e) => setNewBatch({ ...newBatch, year: e.target.value })}
                      className="w-full p-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Department</label>
                    <select
                      value={newBatch.department}
                      onChange={(e) => setNewBatch({ ...newBatch, department: e.target.value })}
                      className="w-full p-2 border border-gray-300 rounded-lg"
                    >
                      <option>Information Technology</option>
                      <option>Engineering</option>
                      <option>Business Studies</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Student Count</label>
                    <input
                      type="number"
                      value={newBatch.studentCount}
                      onChange={(e) => setNewBatch({ ...newBatch, studentCount: e.target.value })}
                      className="w-full p-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Start Date</label>
                    <input
                      type="date"
                      value={newBatch.startDate}
                      onChange={(e) => setNewBatch({ ...newBatch, startDate: e.target.value })}
                      className="w-full p-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">End Date</label>
                    <input
                      type="date"
                      value={newBatch.endDate}
                      onChange={(e) => setNewBatch({ ...newBatch, endDate: e.target.value })}
                      className="w-full p-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Schedule</label>
                    <div className="flex gap-6">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="scheduleType"
                          value="Weekdays"
                          checked={newBatch.scheduleType === "Weekdays"}
                          onChange={(e) => setNewBatch({ ...newBatch, scheduleType: e.target.value })}
                          className="mr-2"
                        />
                        Weekday
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="scheduleType"
                          value="Weekend"
                          checked={newBatch.scheduleType === "Weekend"}
                          onChange={(e) => setNewBatch({ ...newBatch, scheduleType: e.target.value })}
                          className="mr-2"
                        />
                        Weekend
                      </label>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-8">
                <button
                  onClick={handleSaveBatch}
                  className="w-full bg-gray-900 text-white py-3 rounded-lg hover:bg-gray-800"
                >
                  {editingBatch ? "Update Batch" : "Create Batch"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Rest of the table code remains the same */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="text-left border-b border-gray-200">
              <th className="py-4 px-6 font-medium">Name</th>
              <th className="py-4 px-6 font-medium">Batch Number</th>
              <th className="py-4 px-6 font-medium">Department</th>
              <th className="py-4 px-6 font-medium">Students</th>
              <th className="py-4 px-6 font-medium">Schedule</th>
              <th className="py-4 px-6 font-medium">Duration</th>
              <th className="py-4 px-6 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {batches.map((batch) => (
              <tr key={batch._id} className="border-b border-gray-100">
                <td className="py-4 px-6">{batch.batchName}</td>
                <td className="py-4 px-6">{batch.batchNo}</td>
                <td className="py-4 px-6">{batch.department}</td>
                <td className="py-4 px-6">{batch.studentCount}</td>
                <td className="py-4 px-6">{batch.scheduleType}</td>
                <td className="py-4 px-6">
                  {`${formatDate(batch.startDate)} - ${formatDate(batch.endDate)}`}
                </td>
                <td className="py-4 px-6">
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setNewBatch(batch);
                        setEditingBatch(batch);
                        setShowForm(true);
                      }}
                      className="p-2"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDeleteBatch(batch._id)}
                      className="p-2 text-red-500"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 6h18"/>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}