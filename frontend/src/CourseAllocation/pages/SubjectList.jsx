import { useState, useEffect } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";

export default function SubjectList() {
  const location = useLocation();
  const navigate = useNavigate();
  const [subjects, setSubjects] = useState([]);
  const [filteredSubjects, setFilteredSubjects] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingSubject, setEditingSubject] = useState(null);
  const [newSubject, setNewSubject] = useState({
    subjectName: "",
    subjectID: "",
    credit: "",
    timeDuration: 40,
    department: "Faculty of Computing",
    year: "1 Year",
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchSubjects = async () => {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:5000/api/subjects", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSubjects(res.data);
      setFilteredSubjects(res.data);
    };
    fetchSubjects();
  }, []);

  useEffect(() => {
    if (location.state?.showForm) {
      setShowForm(true);
    }
  }, [location.state]);

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredSubjects(subjects);
    } else {
      const lowercasedSearch = searchTerm.toLowerCase();
      const filtered = subjects.filter(
        (subject) =>
          subject.subjectName.toLowerCase().includes(lowercasedSearch) ||
          subject.subjectID.toLowerCase().includes(lowercasedSearch) ||
          subject.department.toLowerCase().includes(lowercasedSearch) ||
          subject.year.toLowerCase().includes(lowercasedSearch)
      );
      setFilteredSubjects(filtered);
    }
  }, [searchTerm, subjects]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!newSubject.subjectName.trim()) {
      newErrors.subjectName = "Subject name is required";
    } else if (newSubject.subjectName.length < 3) {
      newErrors.subjectName = "Subject name must be at least 3 characters";
    } else if (newSubject.subjectName.length > 100) {
      newErrors.subjectName = "Subject name cannot exceed 100 characters";
    }
    
    if (!newSubject.subjectID.trim()) {
      newErrors.subjectID = "Subject ID is required";
    } else if (!/^[A-Z]{2,4}\d{4}$/.test(newSubject.subjectID)) {
      newErrors.subjectID = "Subject ID must be in format: 2-4 uppercase letters followed by 4 digits (e.g., CS1234)";
    }
    
    if (!editingSubject && subjects.some(subject => subject.subjectID === newSubject.subjectID)) {
      newErrors.subjectID = "Subject ID already exists";
    }
    
    if (!newSubject.credit) {
      newErrors.credit = "Credit value is required";
    } else if (isNaN(newSubject.credit) || Number(newSubject.credit) <= 0) {
      newErrors.credit = "Credit must be a positive number";
    } else if (Number(newSubject.credit) > 10) {
      newErrors.credit = "Credit cannot exceed 10";
    }
    
    if (!newSubject.timeDuration) {
      newErrors.timeDuration = "Time duration is required";
    } else if (
      isNaN(newSubject.timeDuration) || 
      Number(newSubject.timeDuration) < 40 || 
      Number(newSubject.timeDuration) > 60
    ) {
      newErrors.timeDuration = "Time duration must be between 40 and 60 hours";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveSubject = async () => {
    setIsSubmitting(true);
    const token = localStorage.getItem("token");
    
    if (validateForm()) {
      try {
        const subjectData = {
          ...newSubject,
          credit: Number(newSubject.credit),
          timeDuration: Number(newSubject.timeDuration),
        };

        if (editingSubject) {
          const res = await axios.put(
            `http://localhost:5000/api/subjects/${editingSubject._id}`,
            subjectData,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          setSubjects((prevSubjects) =>
            prevSubjects.map((subj) => (subj._id === editingSubject._id ? res.data : subj))
          );
        } else {
          const res = await axios.post("http://localhost:5000/api/subjects", subjectData, {
            headers: { Authorization: `Bearer ${token}` },
          });
          setSubjects((prevSubjects) => [...prevSubjects, res.data]);
        }

        // Navigate to /SubjectList after successful save
        navigate("/SubjectList");
        setShowForm(false);
        setNewSubject({
          subjectName: "",
          subjectID: "",
          credit: "",
          timeDuration: 40,
          department: "Faculty of Computing",
          year: "1 Year",
        });
        setEditingSubject(null);
        setErrors({});
      } catch (err) {
        console.log(err.response ? err.response.data : err);
        if (err.response && err.response.data) {
          setErrors({ api: err.response.data.error || "An error occurred" });
        } else {
          setErrors({ api: "Could not connect to server" });
        }
      }
    }
    
    setIsSubmitting(false);
  };

  const handleDeleteSubject = async (id) => {
    if (window.confirm("Are you sure you want to delete this subject?")) {
      try {
        const token = localStorage.getItem("token");
        await axios.delete(`http://localhost:5000/api/subjects/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSubjects(subjects.filter((subj) => subj._id !== id));
      } catch (err) {
        console.log(err.response ? err.response.data : err);
        alert("Failed to delete subject");
      }
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewSubject({ ...newSubject, [name]: value });
    if (errors[name]) {
      setErrors({ ...errors, [name]: null });
    }
  };

  const hasError = (field) => Boolean(errors[field]);

  return (
    <div className="min-h-screen p-8 bg-[#FFFFFF]">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold text-[#1B365D]">Subject Management</h2>
        <button
          onClick={() => {
            setShowForm(true);
            setEditingSubject(null);
            setNewSubject({
              subjectName: "",
              subjectID: "",
              credit: "",
              timeDuration: 40,
              department: "Faculty of Computing",
              year: "1 Year",
            });
            setErrors({});
          }}
          className="bg-[#1B365D] text-[#FFFFFF] px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-[#1B365D]/90"
        >
          + Add New Subject
        </button>
      </div>

      <div className="flex justify-between gap-4 mb-8">
        <input
          type="text"
          placeholder="Search subjects..."
          value={searchTerm}
          onChange={handleSearch}
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
            {filteredSubjects.length > 0 ? (
              filteredSubjects.map((subject) => (
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
                          setErrors({});
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
              ))
            ) : (
              <tr>
                <td colSpan="7" className="p-4 text-center text-[#1B365D]">
                  {searchTerm.trim() !== "" ? 
                    "No subjects found matching your search." : 
                    "No subjects available."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-[#1B365D]/30 backdrop-blur-sm flex justify-center items-center">
          <div className="bg-[#FFFFFF] p-6 rounded-lg w-[480px] max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-[#1B365D]">
                {editingSubject ? "Edit Subject" : "Add New Subject"}
              </h3>
              <button onClick={() => setShowForm(false)} className="text-[#1B365D]/70 hover:text-[#1B365D]">
                ✕
              </button>
            </div>
            
            {errors.api && (
              <div className="mb-4 p-3 rounded-lg bg-red-100 text-red-600 text-sm">
                {errors.api}
              </div>
            )}
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-[#1B365D]">Subject Name</label>
                <input
                  type="text"
                  name="subjectName"
                  value={newSubject.subjectName}
                  onChange={handleInputChange}
                  className={`w-full p-2 border rounded-lg ${
                    hasError('subjectName') 
                      ? 'border-red-500 bg-red-50' 
                      : 'border-[#F5F7FA] bg-[#F5F7FA]'
                  } text-[#1B365D]`}
                />
                {errors.subjectName && (
                  <p className="mt-1 text-sm text-red-600">{errors.subjectName}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2 text-[#1B365D]">Subject ID</label>
                <input
                  type="text"
                  name="subjectID"
                  value={newSubject.subjectID}
                  onChange={handleInputChange}
                  className={`w-full p-2 border rounded-lg ${
                    hasError('subjectID') 
                      ? 'border-red-500 bg-red-50' 
                      : 'border-[#F5F7FA] bg-[#F5F7FA]'
                  } text-[#1B365D]`}
                />
                {errors.subjectID && (
                  <p className="mt-1 text-sm text-red-600">{errors.subjectID}</p>
                )}
                <p className="text-xs text-gray-500 mt-1">Format: 2-4 uppercase letters followed by 4 digits (e.g., CS1234)</p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-[#1B365D]">Credit</label>
                <input
                  type="number"
                  name="credit"
                  min="1"
                  max="10"
                  value={newSubject.credit}
                  onChange={handleInputChange}
                  className={`w-full p-2 border rounded-lg ${
                    hasError('credit') 
                      ? 'border-red-500 bg-red-50' 
                      : 'border-[#F5F7FA] bg-[#F5F7FA]'
                  } text-[#1B365D]`}
                />
                {errors.credit && (
                  <p className="mt-1 text-sm text-red-600">{errors.credit}</p>
                )}
                <p className="text-xs text-gray-500 mt-1">Range: 1-10</p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-[#1B365D]">Time Duration (hours)</label>
                <input
                  type="number"
                  name="timeDuration"
                  min="40"
                  max="60"
                  value={newSubject.timeDuration}
                  onChange={handleInputChange}
                  className={`w-full p-2 border rounded-lg ${
                    hasError('timeDuration') 
                      ? 'border-red-500 bg-red-50' 
                      : 'border-[#F5F7FA] bg-[#F5F7FA]'
                  } text-[#1B365D]`}
                />
                {errors.timeDuration && (
                  <p className="mt-1 text-sm text-red-600">{errors.timeDuration}</p>
                )}
                <p className="text-xs text-gray-500 mt-1">Range: 40-60 hours</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2 text-[#1B365D]">Department</label>
                <select
                  name="department"
                  value={newSubject.department}
                  onChange={handleInputChange}
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
                  name="year"
                  value={newSubject.year}
                  onChange={handleInputChange}
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
              disabled={isSubmitting}
              className={`w-full mt-6 ${
                isSubmitting 
                  ? 'bg-[#1B365D]/70 cursor-not-allowed' 
                  : 'bg-[#1B365D] hover:bg-[#1B365D]/90'
              } text-[#FFFFFF] py-2 rounded-lg flex items-center justify-center`}
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {editingSubject ? "Saving..." : "Creating..."}
                </>
              ) : (
                editingSubject ? "Save Changes" : "Create Subject"
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}