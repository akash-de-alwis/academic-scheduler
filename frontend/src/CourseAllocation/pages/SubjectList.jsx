  import { useState, useEffect } from "react";
  import axios from "axios";
  import { useLocation } from "react-router-dom";

  export default function SubjectList() {
    const location = useLocation();
    const [subjects, setSubjects] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [editingSubject, setEditingSubject] = useState(null);
    const [newSubject, setNewSubject] = useState({
      subjectName: "",
      subjectID: "",
      credit: "",
      timeDuration: 40,
      department: "Faculty of Computing",
      year: "1 Year"
    });

    useEffect(() => {
      axios.get("http://localhost:5000/api/subjects").then((res) => {
        setSubjects(res.data);
      });
    }, []);

    // Check for navigation state on component mount
    useEffect(() => {
      if (location.state?.showForm) {
        setShowForm(true);
      }
    }, [location.state]);

    const handleSaveSubject = async () => {
      try {
        if (editingSubject) {
          const res = await axios.put(
            `http://localhost:5000/api/subjects/${editingSubject._id}`,
            newSubject
          );
          setSubjects((prevSubjects) =>
            prevSubjects.map((subj) => (subj._id === editingSubject._id ? res.data : subj))
          );
        } else {
          const res = await axios.post("http://localhost:5000/api/subjects", newSubject);
          setSubjects((prevSubjects) => [...prevSubjects, res.data]);
        }
        setShowForm(false);
        setNewSubject({
          subjectName: "",
          subjectID: "",
          credit: "",
          timeDuration: 40,
          department: "Faculty of Computing",
          year: "1 Year"
        });
        setEditingSubject(null);
      } catch (err) {
        console.log(err.response ? err.response.data : err);
      }
    };

    const handleDeleteSubject = async (id) => {
      try {
        await axios.delete(`http://localhost:5000/api/subjects/${id}`);
        setSubjects(subjects.filter((subj) => subj._id !== id));
      } catch (err) {
        console.log(err.response ? err.response.data : err);
      }
    };

    return (
      <div className="min-h-screen p-8 bg-[#FFFFFF]">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-[#1B365D]">Subject Management</h2>
          <button
            onClick={() => {
              setShowForm(true);
              setEditingSubject(null);
            }}
            className="bg-[#1B365D] text-[#FFFFFF] px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-[#1B365D]/90"
          >
            + Add New Subject
          </button>
        </div>

        {/* Search Bar */}
        <div className="flex justify-between gap-4 mb-8">
          <input
            type="text"
            placeholder="Search subjects..."
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
                <th className="text-left p-4 font-medium text-[#1B365D]">Subject Name</th>
                <th className="text-left p-4 font-medium text-[#1B365D]">Subject ID</th>
                <th className="text-left p-4 font-medium text-[#1B365D]">Credit</th>
                <th className="text-left p-4 font-medium text-[#1B365D]">Time Duration (hr)</th>
                <th className="text-left p-4 font-medium text-[#1B365D]">Department</th>
                <th className="text-left p-4 font-medium text-[#1B365D]">Year</th>
                <th className="text-left p-4 font-medium text-[#1B365D]">Actions</th>
              </tr>
            </thead>
            <tbody>
              {subjects.map((subject) => (
                <tr key={subject._id} className="border-b border-[#FFFFFF]">
                  <td className="p-4 text-[#1B365D]">{subject.subjectName}</td>
                  <td className="p-4"><span className="text-[#1B365D] font-medium">{subject.subjectID}</span></td>
                  <td className="p-4 text-[#1B365D]">{subject.credit}</td>
                  <td className="p-4 text-[#1B365D]">{subject.timeDuration}</td>
                  <td className="p-4 text-[#1B365D]">{subject.department}</td>
                  <td className="p-4 text-[#1B365D]">{subject.year}</td>
                  <td className="p-4">
                    <div className="flex gap-4">
                      <button
                        onClick={() => {
                          setNewSubject(subject);
                          setEditingSubject(subject);
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
                        onClick={() => handleDeleteSubject(subject._id)}
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
                  {editingSubject ? "Edit Subject" : "Add New Subject"}
                </h3>
                <button onClick={() => setShowForm(false)} className="text-[#1B365D]/70 hover:text-[#1B365D]">
                  ✕
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-[#1B365D]">Subject Name</label>
                  <input
                    type="text"
                    value={newSubject.subjectName}
                    onChange={(e) => setNewSubject({ ...newSubject, subjectName: e.target.value })}
                    className="w-full p-2 border border-[#F5F7FA] rounded-lg bg-[#F5F7FA] text-[#1B365D]"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2 text-[#1B365D]">Subject ID</label>
                  <input
                    type="text"
                    value={newSubject.subjectID}
                    onChange={(e) => setNewSubject({ ...newSubject, subjectID: e.target.value })}
                    className="w-full p-2 border border-[#F5F7FA] rounded-lg bg-[#F5F7FA] text-[#1B365D]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-[#1B365D]">Credit</label>
                  <input
                    type="number"
                    value={newSubject.credit}
                    onChange={(e) => setNewSubject({ ...newSubject, credit: e.target.value })}
                    className="w-full p-2 border border-[#F5F7FA] rounded-lg bg-[#F5F7FA] text-[#1B365D]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-[#1B365D]">Time Duration (hours)</label>
                  <input
                    type="number"
                    min="40"
                    max="60"
                    placeholder="Time Duration (40hr - 60hr)"
                    value={newSubject.timeDuration}
                    onChange={(e) => setNewSubject({ ...newSubject, timeDuration: e.target.value })}
                    className="w-full p-2 border border-[#F5F7FA] rounded-lg bg-[#F5F7FA] text-[#1B365D]"
                  />
                  <span className="text-sm text-gray-500 mt-1">Range: 40-60 hours</span>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2 text-[#1B365D]">Department</label>
                  <select
                    value={newSubject.department}
                    onChange={(e) => setNewSubject({ ...newSubject, department: e.target.value })}
                    className="w-full p-2 border border-[#F5F7FA] rounded-lg bg-[#F5F7FA] text-[#1B365D]"
                  >
                    <option>Faculty of Computing</option>
                    <option>Faculty of Engineering</option>
                    <option>Faculty of Business Studies</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2 text-[#1B365D]">Year</label>
                  <select
                    value={newSubject.year}
                    onChange={(e) => setNewSubject({ ...newSubject, year: e.target.value })}
                    className="w-full p-2 border border-[#F5F7FA] rounded-lg bg-[#F5F7FA] text-[#1B365D]"
                  >
                    <option>1 Year</option>
                    <option>2 Year</option>
                    <option>3 Year</option>
                    <option>4 Year</option>
                  </select>
                </div>
              </div>
              
              <button
                onClick={handleSaveSubject}
                className="w-full mt-6 bg-[#1B365D] text-[#FFFFFF] py-2 rounded-lg hover:bg-[#1B365D]/90"
              >
                {editingSubject ? "Save Changes" : "Create Subject"}
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }