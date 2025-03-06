import { useState, useEffect } from "react";
import axios from "axios";

export default function LecturerList() {
  const [lecturers, setLecturers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingLecturer, setEditingLecturer] = useState(null);
  const [newLecturer, setNewLecturer] = useState({
    name: "",
    lecturerId: "LEC",
    email: "",
    department: "Faculty of Computing",
    scheduleType: "Weekdays",
    skills: [],
  });
  const [skillInput, setSkillInput] = useState("");
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    axios.get("http://localhost:5000/api/lecturers").then((res) => {
      setLecturers(res.data);
    });
  }, []);

  const validateForm = () => {
    const errors = {};
    
    if (!newLecturer.name.trim()) errors.name = "Name is required";
    
    if (!newLecturer.lecturerId) errors.lecturerId = "Lecturer ID is required";
    else if (!/^LEC\d{3}$/.test(newLecturer.lecturerId)) 
      errors.lecturerId = "Must be LEC followed by 3 numbers";
    
    if (!newLecturer.email.trim()) errors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newLecturer.email)) 
      errors.email = "Invalid email format";
    
    if (newLecturer.skills.length < 3) 
      errors.skills = "At least 3 skills are required";

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSaveLecturer = async () => {
    if (!validateForm()) return;

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
      setNewLecturer({
        name: "",
        lecturerId: "LEC",
        email: "",
        department: "Faculty of Computing",
        scheduleType: "Weekdays",
        skills: [],
      });
      setEditingLecturer(null);
      setSkillInput("");
      setFormErrors({});
    } catch (err) {
      console.log(err.response ? err.response.data : err);
    }
  };

  const handleAddSkill = (e) => {
    if (e.key === "Enter" && skillInput.trim()) {
      setNewLecturer({
        ...newLecturer,
        skills: [...newLecturer.skills, skillInput.trim()],
      });
      setSkillInput("");
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setNewLecturer({
      ...newLecturer,
      skills: newLecturer.skills.filter((skill) => skill !== skillToRemove),
    });
  };

  const handleDeleteLecturer = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/lecturers/${id}`);
      setLecturers(lecturers.filter((lect) => lect._id !== id));
    } catch (err) {
      console.log(err.response ? err.response.data : err);
    }
  };

  const handleLecturerIdChange = (index, value) => {
    const idArray = newLecturer.lecturerId.split("");
    while (idArray.length < 6) idArray.push("");
    
    // Only allow changes for the number positions (3, 4, 5)
    if (index > 2 && value && !/^\d$/.test(value)) return;
    if (index <= 2) return; // Prevent changes to L, E, C
    
    idArray[index] = value;
    setNewLecturer({ ...newLecturer, lecturerId: idArray.join("") });
  };

  // Lecturer stats
  const totalLecturers = lecturers.length;
  const deptCounts = {
    "Faculty of Computing": lecturers.filter((lect) => lect.department === "Faculty of Computing").length,
    "Faculty of Engineering": lecturers.filter((lect) => lect.department === "Faculty of Engineering").length,
    "Faculty of Business Studies": lecturers.filter((lect) => lect.department === "Faculty of Business Studies").length,
  };
  const weekdaysCount = lecturers.filter((lect) => lect.scheduleType === "Weekdays").length;
  const weekendCount = lecturers.filter((lect) => lect.scheduleType === "Weekend").length;

  // Skills Distribution calculation
  const skillsCount = {};
  lecturers.forEach((lecturer) => {
    lecturer.skills.forEach((skill) => {
      skillsCount[skill] = (skillsCount[skill] || 0) + 1;
    });
  });
  const topSkills = Object.entries(skillsCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 2);

  return (
    <div className="min-h-screen p-8 bg-[#FFFFFF]">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold text-[#1B365D]">Lecturer Management</h2>
        <div className="flex gap-3">
          <button
            onClick={() => window.location.href = "/LecturerWorkload"}
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-md p-6 border border-[#E2E8F0] flex items-center gap-4 hover:shadow-lg transition-all duration-300">
          <div className="bg-[#1B365D]/10 p-3 rounded-full">
            <svg className="w-6 h-6 text-[#1B365D]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Total Lecturers</p>
            <p className="text-2xl font-bold text-[#1B365D]">{totalLecturers}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 border border-[#E2E8F0] flex items-center gap-4 hover:shadow-lg transition-all duration-300">
          <div className="bg-[#1B365D]/10 p-3 rounded-full">
            <svg className="w-6 h-6 text-[#1B365D]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 21v-6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v6" />
              <path d="M7 13V7a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v6" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">By Department</p>
            <p className="text-lg font-semibold text-[#1B365D]">
              {deptCounts["Faculty of Computing"]} Computing
            </p>
            <p className="text-sm text-gray-600">
              {deptCounts["Faculty of Engineering"]} Eng | {deptCounts["Faculty of Business Studies"]} Bus
            </p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 border border-[#E2E8F0] flex items-center gap-4 hover:shadow-lg transition-all duration-300">
          <div className="bg-[#1B365D]/10 p-3 rounded-full">
            <svg className="w-6 h-6 text-[#1B365D]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2v2m0 16v2m-8-10H2m20 0h-2m-4.14-5.86l-1.42 1.42m-5.66 5.66L7.34 9.8m11.32 0l-1.42-1.42M9.8 16.46l-1.42 1.42" />
              <circle cx="12" cy="12" r="4" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Availability</p>
            <p className="text-lg font-semibold text-[#1B365D]">{weekdaysCount} Weekdays</p>
            <p className="text-sm text-gray-600">{weekendCount} Weekends</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 border border-[#E2E8F0] flex items-center gap-4 hover:shadow-lg transition-all duration-300">
          <div className="bg-[#1B365D]/10 p-3 rounded-full">
            <svg className="w-6 h-6 text-[#1B365D]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Top Skills</p>
            {topSkills.length > 0 ? (
              <>
                <p className="text-lg font-semibold text-[#1B365D]">{topSkills[0][0]} ({topSkills[0][1]})</p>
                <p className="text-sm text-gray-600">
                  {topSkills[1] ? `${topSkills[1][0]} (${topSkills[1][1]})` : "N/A"}
                </p>
              </>
            ) : (
              <p className="text-sm text-gray-600">No skills data</p>
            )}
          </div>
        </div>
      </div>

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

      <div className="bg-[#F5F7FA] rounded-lg">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#FFFFFF]">
              <th className="text-left p-4 font-medium text-[#1B365D]">Name</th>
              <th className="text-left p-4 font-medium text-[#1B365D]">Lecturer ID</th>
              <th className="text-left p-4 font-medium text-[#1B365D]">Department</th>
              <th className="text-left p-4 font-medium text-[#1B365D]">Availability</th>
              <th className="text-left p-4 font-medium text-[#1B365D]">Skills</th>
              <th className="text-left p-4 font-medium text-[#1B365D]">Actions</th>
            </tr>
          </thead>
          <tbody>
            {lecturers.map((lecturer) => (
              <tr key={lecturer._id} className="border-b border-[#FFFFFF]">
                <td className="p-4 text-[#1B365D]">{lecturer.name}</td>
                <td className="p-4">
                  <span className="text-[#1B365D] font-medium">{lecturer.lecturerId}</span>
                </td>
                <td className="p-4 text-[#1B365D]">{lecturer.department}</td>
                <td className="p-4 text-[#1B365D]">{lecturer.scheduleType}</td>
                <td className="p-4">
                  <div className="flex flex-wrap gap-2">
                    {lecturer.skills.map((skill, index) => (
                      <span
                        key={index}
                        className="bg-[#1B365D] text-white text-xs px-2 py-1 rounded-full"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </td>
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
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M3 6h18" />
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
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
                <label className="block text-sm font-medium mb-2 text-[#1B365D]">
                  Lecturer Name
                </label>
                <input
                  type="text"
                  value={newLecturer.name}
                  onChange={(e) => setNewLecturer({ ...newLecturer, name: e.target.value })}
                  placeholder="Enter lecturer name"
                  className={`w-full p-2 border ${formErrors.name ? 'border-red-500' : 'border-[#F5F7FA]'} rounded-lg bg-[#F5F7FA] text-[#1B365D]`}
                />
                {formErrors.name && <p className="text-red-500 text-xs mt-1">{formErrors.name}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-[#1B365D]">
                  Lecturer ID (LEC###)
                </label>
                <div className="flex gap-1">
                  {[...Array(6)].map((_, i) => (
                    <input
                      key={i}
                      type="text"
                      maxLength={1}
                      value={i === 0 ? "L" : i === 1 ? "E" : i === 2 ? "C" : newLecturer.lecturerId[i] || ""}
                      onChange={(e) => handleLecturerIdChange(i, e.target.value)}
                      disabled={i < 3}
                      className={`w-12 p-2 text-center border ${formErrors.lecturerId ? 'border-red-500' : 'border-[#F5F7FA]'} rounded-lg bg-[#F5F7FA] text-[#1B365D] ${i < 3 ? 'cursor-not-allowed opacity-75' : ''}`}
                    />
                  ))}
                </div>
                {formErrors.lecturerId && <p className="text-red-500 text-xs mt-1">{formErrors.lecturerId}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-[#1B365D]">
                  Email
                </label>
                <input
                  type="email"
                  value={newLecturer.email}
                  onChange={(e) => setNewLecturer({ ...newLecturer, email: e.target.value })}
                  placeholder="Enter email (e.g., name@domain.com)"
                  className={`w-full p-2 border ${formErrors.email ? 'border-red-500' : 'border-[#F5F7FA]'} rounded-lg bg-[#F5F7FA] text-[#1B365D]`}
                />
                {formErrors.email && <p className="text-red-500 text-xs mt-1">{formErrors.email}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-[#1B365D]">
                  Department
                </label>
                <select
                  value={newLecturer.department}
                  onChange={(e) => setNewLecturer({ ...newLecturer, department: e.target.value })}
                  className="w-full p-2 border border-[#F5F7FA] rounded-lg bg-[#F5F7FA] text-[#1B365D]"
                >
                  <option value="Faculty of Computing">Faculty of Computing</option>
                  <option value="Faculty of Engineering">Faculty of Engineering</option>
                  <option value="Faculty of Business Studies">Faculty of Business Studies</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-[#1B365D]">
                  Availability
                </label>
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

              <div>
                <label className="block text-sm font-medium mb-2 text-[#1B365D]">
                  Skills (Press Enter to add, minimum 3 required)
                </label>
                <input
                  type="text"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyPress={handleAddSkill}
                  placeholder="Type a skill and press Enter"
                  className={`w-full p-2 border ${formErrors.skills ? 'border-red-500' : 'border-[#F5F7FA]'} rounded-lg bg-[#F5F7FA] text-[#1B365D]`}
                />
                <div className="mt-2 flex flex-wrap gap-2">
                  {newLecturer.skills.map((skill, index) => (
                    <div
                      key={index}
                      className="bg-[#1B365D] text-white text-xs px-2 py-1 rounded-full flex items-center gap-1"
                    >
                      {skill}
                      <button
                        onClick={() => handleRemoveSkill(skill)}
                        className="text-white hover:text-gray-200"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
                {formErrors.skills && <p className="text-red-500 text-xs mt-1">{formErrors.skills}</p>}
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