import { useState, useEffect } from "react";
import axios from "axios";

export default function LecturerList() {
  const [lecturers, setLecturers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingLecturer, setEditingLecturer] = useState(null);
  const [newLecturer, setNewLecturer] = useState({
    name: "",
    lecturerId: "",
    department: "Faculty of Computing",
    scheduleType: "Weekdays",
  });

  useEffect(() => {
    axios.get("http://localhost:5000/api/lecturers").then((res) => {
      setLecturers(res.data);
    });
  }, []);

  const handleSaveLecturer = async () => {
    try {
      if (editingLecturer) {
        const res = await axios.put(
          `http://localhost:5000/api/lecturers/${editingLecturer._id}`,
          newLecturer
        );
        setLecturers((prevLecturers) =>
          prevLecturers.map((lect) => (lect._id === editingLecturer._id ? res.data : lect))
        );
      } else {
        const res = await axios.post("http://localhost:5000/api/lecturers", newLecturer);
        setLecturers((prevLecturers) => [...prevLecturers, res.data]);
      }
      setShowForm(false);
      setNewLecturer({ name: "", lecturerId: "", department: "Faculty of Computing", scheduleType: "Weekdays" });
      setEditingLecturer(null);
    } catch (err) {
      console.log(err.response ? err.response.data : err);
    }
  };

  const handleDeleteLecturer = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/lecturers/${id}`);
      setLecturers(lecturers.filter((lect) => lect._id !== id));
    } catch (err) {
      console.log(err.response ? err.response.data : err);
    }
  };

  return (
    <div className="min-h-screen p-8 bg-[#FFFFFF]">
      <div className="flex justify-between items-center mb-8">
  <h2 className="text-2xl font-bold text-[#1B365D]">Lecturer Management</h2>
        <div className="flex gap-3">
          <button
            onClick={() => window.location.href = '/LecturerWorkload'}
            className="bg-[#1B365D] text-[#FFFFFF] px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-[#1B365D]/90"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            Lecture Workload
          </button>
          <button
            onClick={() => {
              setShowForm(true);
              setEditingLecturer(null);
            }}
            className="bg-[#1B365D] text-[#FFFFFF] px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-[#1B365D]/90"
          >
            + Add New Lecturer
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex justify-between gap-4 mb-8">
        <input
          type="text"
          placeholder="Search lecturers..."
          className="flex-1 px-4 py-2 border border-[#F5F7FA] rounded-lg bg-[#F5F7FA] text-[#1B365D]"
        />
        <button className="px-4 py-2 bg-[#F5F7FA] border border-[#F5F7FA] rounded-lg flex items-center gap-2 text-[#1B365D]">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
          </svg>
          Sort by name
        </button>
      </div>

      {/* Table */}
      <div className="bg-[#F5F7FA] rounded-lg">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#FFFFFF]">
              <th className="text-left p-4 font-medium text-[#1B365D]">Name</th>
              <th className="text-left p-4 font-medium text-[#1B365D]">Lecturer ID</th>
              <th className="text-left p-4 font-medium text-[#1B365D]">Department</th>
              <th className="text-left p-4 font-medium text-[#1B365D]">Availability</th>
              <th className="text-left p-4 font-medium text-[#1B365D]">Actions</th>
            </tr>
          </thead>
          <tbody>
            {lecturers.map((lecturer) => (
              <tr key={lecturer._id} className="border-b border-[#FFFFFF]">
                <td className="p-4 text-[#1B365D]">{lecturer.name}</td>
                <td className="p-4"><span className="text-[#1B365D] font-medium">{lecturer.lecturerId}</span></td>
                <td className="p-4 text-[#1B365D]">{lecturer.department}</td>
                <td className="p-4 text-[#1B365D]">{lecturer.scheduleType}</td>
                <td className="p-4">
                  <div className="flex gap-4">
                    <button
                      onClick={() => {
                        setNewLecturer(lecturer);
                        setEditingLecturer(lecturer);
                        setShowForm(true);
                      }}
                      className="text-[#1B365D] hover:text-[#1B365D]/70"
                    >
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                        <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDeleteLecturer(lecturer._id)}
                      className="text-red-500 hover:text-red-600"
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

      {/* Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-[#1B365D]/30 backdrop-blur-sm flex justify-center items-center">
          <div className="bg-[#FFFFFF] p-6 rounded-lg w-[480px]">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-[#1B365D]">
                {editingLecturer ? "Edit Lecturer" : "Add New Lecturer"}
              </h3>
              <button onClick={() => setShowForm(false)} className="text-[#1B365D]/70 hover:text-[#1B365D]">
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-[#1B365D]">Lecturer Name</label>
                <input
                  type="text"
                  value={newLecturer.name}
                  onChange={(e) => setNewLecturer({ ...newLecturer, name: e.target.value })}
                  className="w-full p-2 border border-[#F5F7FA] rounded-lg bg-[#F5F7FA] text-[#1B365D]"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2 text-[#1B365D]">Lecturer ID</label>
                <input
                  type="text"
                  value={newLecturer.lecturerId}
                  onChange={(e) => setNewLecturer({ ...newLecturer, lecturerId: e.target.value })}
                  className="w-full p-2 border border-[#F5F7FA] rounded-lg bg-[#F5F7FA] text-[#1B365D]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-[#1B365D]">Email</label>
                <input
                  type="email"
                  value={newLecturer.email}
                  onChange={(e) => setNewLecturer({ ...newLecturer, email: e.target.value })}
                  className="w-full p-2 border border-[#F5F7FA] rounded-lg bg-[#F5F7FA] text-[#1B365D]"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2 text-[#1B365D]">Department</label>
                <select
                  value={newLecturer.department}
                  onChange={(e) => setNewLecturer({ ...newLecturer, department: e.target.value })}
                  className="w-full p-2 border border-[#F5F7FA] rounded-lg bg-[#F5F7FA] text-[#1B365D]"
                >
                  <option>Faculty of Computing</option>
                  <option>Faculty of Engineering</option>
                  <option>Faculty of Business Studies</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2 text-[#1B365D]">Availability</label>
                <div className="flex gap-6">
                  <label className="flex items-center gap-2 text-[#1B365D]">
                    <input
                      type="radio"
                      name="scheduleType"
                      value="Weekdays"
                      checked={newLecturer.scheduleType === "Weekdays"}
                      onChange={(e) => setNewLecturer({ ...newLecturer, scheduleType: e.target.value })}
                      className="w-4 h-4 accent-[#1B365D]"
                    />
                    Weekday
                  </label>
                  <label className="flex items-center gap-2 text-[#1B365D]">
                    <input
                      type="radio"
                      name="scheduleType"
                      value="Weekend"
                      checked={newLecturer.scheduleType === "Weekend"}
                      onChange={(e) => setNewLecturer({ ...newLecturer, scheduleType: e.target.value })}
                      className="w-4 h-4 accent-[#1B365D]"
                    />
                    Weekend
                  </label>
                </div>
              </div>
            </div>
            
            <button
              onClick={handleSaveLecturer}
              className="w-full mt-6 bg-[#1B365D] text-[#FFFFFF] py-2 rounded-lg hover:bg-[#1B365D]/90"
            >
              {editingLecturer ? "Save Changes" : "Create Lecturer"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}