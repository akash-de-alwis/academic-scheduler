import { useState, useEffect } from "react";
import axios from "axios";

export default function BatchList() {
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

  const formatDateForInput = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
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

  const handleEdit = (batch) => {
    setNewBatch({
      ...batch,
      startDate: formatDateForInput(batch.startDate),
      endDate: formatDateForInput(batch.endDate),
      year: batch.year.toString()
    });
    setEditingBatch(batch);
    setShowForm(true);
  };

  return (
    <div className="min-h-screen p-8 bg-[#FFFFFF]">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold text-[#1B365D]">Batch Management</h2>
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

      <div className="flex justify-between gap-4 mb-8">
        <input
          type="text"
          placeholder="Search batches..."
          className="flex-1 px-4 py-2 border border-[#F5F7FA] rounded-lg bg-[#F5F7FA] text-[#1B365D]"
        />
        <button className="px-4 py-2 bg-[#F5F7FA] border border-[#F5F7FA] rounded-lg flex items-center gap-2 text-[#1B365D]">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
          </svg>
          Sort by name
        </button>
      </div>

      <div className="bg-[#F5F7FA] rounded-lg">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#FFFFFF]">
              <th className="text-left p-4 font-medium text-[#1B365D]">Name</th>
              <th className="text-left p-4 font-medium text-[#1B365D]">Batch Number</th>
              <th className="text-left p-4 font-medium text-[#1B365D]">Department</th>
              <th className="text-left p-4 font-medium text-[#1B365D]">Students</th>
              <th className="text-left p-4 font-medium text-[#1B365D]">Schedule</th>
              <th className="text-left p-4 font-medium text-[#1B365D]">Duration</th>
              <th className="text-left p-4 font-medium text-[#1B365D]">Actions</th>
            </tr>
          </thead>
          <tbody>
            {batches.map((batch) => (
              <tr key={batch._id} className="border-b border-[#FFFFFF]">
                <td className="p-4 text-[#1B365D]">{batch.batchName}</td>
                <td className="p-4"><span className="text-[#1B365D] font-medium">{batch.batchNo}</span></td>
                <td className="p-4 text-[#1B365D]">{batch.department}</td>
                <td className="p-4 text-[#1B365D]">{batch.studentCount}</td>
                <td className="p-4 text-[#1B365D]">{batch.scheduleType}</td>
                <td className="p-4 text-[#1B365D]">{`${formatDate(batch.startDate)} - ${formatDate(batch.endDate)}`}</td>
                <td className="p-4">
                  <div className="flex gap-4">
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
                  <label className="block text-sm font-medium mb-2 text-[#1B365D]">Batch Name</label>
                  <input
                    type="text"
                    value={newBatch.batchName}
                    onChange={(e) => setNewBatch({ ...newBatch, batchName: e.target.value })}
                    className="w-full p-2 border border-[#F5F7FA] rounded-lg bg-[#F5F7FA] text-[#1B365D]"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2 text-[#1B365D]">Batch Number</label>
                  <input
                    type="text"
                    value={newBatch.batchNo}
                    onChange={(e) => setNewBatch({ ...newBatch, batchNo: e.target.value })}
                    className="w-full p-2 border border-[#F5F7FA] rounded-lg bg-[#F5F7FA] text-[#1B365D]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-[#1B365D]">Year</label>
                  <input
                    type="number"
                    value={newBatch.year}
                    onChange={(e) => setNewBatch({ ...newBatch, year: e.target.value })}
                    className="w-full p-2 border border-[#F5F7FA] rounded-lg bg-[#F5F7FA] text-[#1B365D]"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2 text-[#1B365D]">Department</label>
                  <select
                    value={newBatch.department}
                    onChange={(e) => setNewBatch({ ...newBatch, department: e.target.value })}
                    className="w-full p-2 border border-[#F5F7FA] rounded-lg bg-[#F5F7FA] text-[#1B365D]"
                  >
                    <option>Information Technology</option>
                    <option>Engineering</option>
                    <option>Business Studies</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-[#1B365D]">Student Count</label>
                  <input
                    type="number"
                    value={newBatch.studentCount}
                    onChange={(e) => setNewBatch({ ...newBatch, studentCount: e.target.value })}
                    className="w-full p-2 border border-[#F5F7FA] rounded-lg bg-[#F5F7FA] text-[#1B365D]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-[#1B365D]">Start Date</label>
                  <input
                    type="date"
                    value={newBatch.startDate}
                    onChange={(e) => setNewBatch({ ...newBatch, startDate: e.target.value })}
                    className="w-full p-2 border border-[#F5F7FA] rounded-lg bg-[#F5F7FA] text-[#1B365D]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-[#1B365D]">End Date</label>
                  <input
                    type="date"
                    value={newBatch.endDate}
                    onChange={(e) => setNewBatch({ ...newBatch, endDate: e.target.value })}
                    className="w-full p-2 border border-[#F5F7FA] rounded-lg bg-[#F5F7FA] text-[#1B365D]"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2 text-[#1B365D]">Schedule</label>
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