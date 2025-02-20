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
    <div className="min-h-screen p-8">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold">Lecturer Management</h2>
        <button
          onClick={() => {
            setShowForm(true);
            setEditingLecturer(null);
          }}
          className="bg-gray-900 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          + Add New Lecturer
        </button>
      </div>

      {/* Search Bar */}
      <div className="flex justify-between gap-4 mb-8">
        <input
          type="text"
          placeholder="Search lecturers..."
          className="flex-1 px-4 py-2 border border-gray-200 rounded-lg"
        />
        <button className="px-4 py-2 bg-white border border-gray-200 rounded-lg flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
          </svg>
          Sort by name
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-left p-4 font-medium text-gray-600">Name</th>
              <th className="text-left p-4 font-medium text-gray-600">Lecturer ID</th>
              <th className="text-left p-4 font-medium text-gray-600">Department</th>
              <th className="text-left p-4 font-medium text-gray-600">Availability</th>
              <th className="text-left p-4 font-medium text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody>
            {lecturers.map((lecturer) => (
              <tr key={lecturer._id} className="border-b border-gray-100">
                <td className="p-4">{lecturer.name}</td>
                <td className="p-4"><span className="text-blue-800">{lecturer.lecturerId}</span></td>
                <td className="p-4">{lecturer.department}</td>
                <td className="p-4">{lecturer.scheduleType}</td>
                <td className="p-4">
                  <div className="flex gap-4">
                    <button
                      onClick={() => {
                        setNewLecturer(lecturer);
                        setEditingLecturer(lecturer);
                        setShowForm(true);
                      }}
                    >
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                        <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDeleteLecturer(lecturer._id)}
                      className="text-red-500"
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
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg w-[480px]">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold">Add New Lecturer</h3>
              <button onClick={() => setShowForm(false)} className="text-gray-400">
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Lecturer Name</label>
                <input
                  type="text"
                  value={newLecturer.name}
                  onChange={(e) => setNewLecturer({ ...newLecturer, name: e.target.value })}
                  className="w-full p-2 border border-gray-200 rounded-lg"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Lecturer ID</label>
                <input
                  type="text"
                  value={newLecturer.lecturerId}
                  onChange={(e) => setNewLecturer({ ...newLecturer, lecturerId: e.target.value })}
                  className="w-full p-2 border border-gray-200 rounded-lg"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Department</label>
                <select
                  value={newLecturer.department}
                  onChange={(e) => setNewLecturer({ ...newLecturer, department: e.target.value })}
                  className="w-full p-2 border border-gray-200 rounded-lg"
                >
                  <option>Faculty of Computing</option>
                  <option>Faculty of Engineering</option>
                  <option>Faculty of Business Studies</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Availability</label>
                <div className="flex gap-6">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="scheduleType"
                      value="Weekdays"
                      checked={newLecturer.scheduleType === "Weekdays"}
                      onChange={(e) => setNewLecturer({ ...newLecturer, scheduleType: e.target.value })}
                      className="w-4 h-4"
                    />
                    Weekday
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="scheduleType"
                      value="Weekend"
                      checked={newLecturer.scheduleType === "Weekend"}
                      onChange={(e) => setNewLecturer({ ...newLecturer, scheduleType: e.target.value })}
                      className="w-4 h-4"
                    />
                    Weekend
                  </label>
                </div>
              </div>
            </div>
            
            <button
              onClick={handleSaveLecturer}
              className="w-full mt-6 bg-gray-900 text-white py-2 rounded-lg"
            >
              Create Lecturer
            </button>
          </div>
        </div>
      )}
    </div>
  );
}