// components/ModuleOverview.jsx
import { useState, useEffect } from "react";
import axios from "axios";

export default function ModuleOverview() {
  const [moduleOverviews, setModuleOverviews] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingModule, setEditingModule] = useState(null);
  const [newModule, setNewModule] = useState({
    subject: "",
    description: "",
    labSessionCount: 0,
    vivaSessionCount: 0,
    moduleSessionCount: 1,
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("token");
      try {
        const [subjectsRes, modulesRes] = await Promise.all([
          axios.get("http://localhost:5000/api/subjects", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get("http://localhost:5000/api/module-overviews", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);
        setSubjects(subjectsRes.data);
        setModuleOverviews(modulesRes.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, []);

  const validateForm = () => {
    const newErrors = {};
    
    if (!newModule.subject) newErrors.subject = "Subject is required";
    if (!newModule.description.trim()) {
      newErrors.description = "Description is required";
    } else if (newModule.description.length < 10) {
      newErrors.description = "Description must be at least 10 characters";
    }
    if (newModule.labSessionCount < 1 || newModule.labSessionCount > 40) {
      newErrors.labSessionCount = "Lab sessions must be between 1 and 40";
    }
    if (newModule.vivaSessionCount < 0 || newModule.vivaSessionCount > 20) {
      newErrors.vivaSessionCount = "Viva sessions must be between 0 and 20";
    }
    if (newModule.moduleSessionCount < 1 || newModule.moduleSessionCount > 100) {
      newErrors.moduleSessionCount = "Module sessions must be between 1 and 100";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveModule = async () => {
    setIsSubmitting(true);
    const token = localStorage.getItem("token");

    if (validateForm()) {
      try {
        const moduleData = {
          ...newModule,
          labSessionCount: Number(newModule.labSessionCount),
          vivaSessionCount: Number(newModule.vivaSessionCount),
          moduleSessionCount: Number(newModule.moduleSessionCount),
        };

        let res;
        if (editingModule) {
          res = await axios.put(
            `http://localhost:5000/api/module-overviews/${editingModule._id}`,
            moduleData,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          setModuleOverviews((prev) =>
            prev.map((mod) => (mod._id === editingModule._id ? res.data : mod))
          );
        } else {
          res = await axios.post(
            "http://localhost:5000/api/module-overviews",
            moduleData,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          setModuleOverviews([...moduleOverviews, res.data]);
        }

        setShowForm(false);
        setNewModule({
          subject: "",
          description: "",
          labSessionCount: 0,
          vivaSessionCount: 0,
          moduleSessionCount: 1,
        });
        setEditingModule(null);
        setErrors({});
      } catch (err) {
        setErrors({ api: err.response?.data.error || "An error occurred" });
      }
    }
    setIsSubmitting(false);
  };

  const handleDeleteModule = async (id) => {
    if (window.confirm("Are you sure you want to delete this module overview?")) {
      try {
        const token = localStorage.getItem("token");
        await axios.delete(`http://localhost:5000/api/module-overviews/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setModuleOverviews(moduleOverviews.filter((mod) => mod._id !== id));
      } catch (err) {
        alert("Failed to delete module overview");
        console.error(err);
      }
    }
  };

  const handleEditModule = (module) => {
    setNewModule({
      subject: module.subject._id,
      description: module.description,
      labSessionCount: module.labSessionCount,
      vivaSessionCount: module.vivaSessionCount,
      moduleSessionCount: module.moduleSessionCount,
    });
    setEditingModule(module);
    setShowForm(true);
    setErrors({});
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewModule({ ...newModule, [name]: value });
    if (errors[name]) setErrors({ ...errors, [name]: null });
  };

  return (
    <div className="min-h-screen p-8 bg-[#FFFFFF]">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold text-[#1B365D]">Module Overview</h2>
        <button
          onClick={() => {
            setNewModule({
              subject: "",
              description: "",
              labSessionCount: 0,
              vivaSessionCount: 0,
              moduleSessionCount: 1,
            });
            setEditingModule(null);
            setShowForm(true);
          }}
          className="bg-[#1B365D] text-[#FFFFFF] px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-[#1B365D]/90"
        >
          + Add New Module Overview
        </button>
      </div>

      <div className="bg-[#F5F7FA] rounded-lg">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#FFFFFF]">
              <th className="text-left p-4 font-medium text-[#1B365D]">Subject</th>
              <th className="text-left p-4 font-medium text-[#1B365D]">Description</th>
              <th className="text-left p-4 font-medium text-[#1B365D]">Lab Sessions</th>
              <th className="text-left p-4 font-medium text-[#1B365D]">Viva Sessions</th>
              <th className="text-left p-4 font-medium text-[#1B365D]">Module Sessions</th>
              <th className="text-left p-4 font-medium text-[#1B365D]">Actions</th>
            </tr>
          </thead>
          <tbody>
            {moduleOverviews.length > 0 ? (
              moduleOverviews.map((module) => (
                <tr key={module._id} className="border-b border-[#FFFFFF]">
                  <td className="p-4 text-[#1B365D]">{module.subject?.subjectName}</td>
                  <td className="p-4 text-[#1B365D]">{module.description.substring(0, 50)}...</td>
                  <td className="p-4 text-[#1B365D]">{module.labSessionCount}</td>
                  <td className="p-4 text-[#1B365D]">{module.vivaSessionCount}</td>
                  <td className="p-4 text-[#1B365D]">{module.moduleSessionCount}</td>
                  <td className="p-4">
                    <div className="flex gap-4">
                      <button
                        onClick={() => handleEditModule(module)}
                        className="text-[#1B365D] hover:text-[#1B365D]/70"
                      >
                        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                          <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDeleteModule(module._id)}
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
              ))
            ) : (
              <tr>
                <td colSpan="6" className="p-4 text-center text-[#1B365D]">
                  No module overviews available.
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
                {editingModule ? "Edit Module Overview" : "Add Module Overview"}
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
                <label className="block text-sm font-medium mb-2 text-[#1B365D]">Subject</label>
                <select
                  name="subject"
                  value={newModule.subject}
                  onChange={handleInputChange}
                  className={`w-full p-2 border rounded-lg ${
                    errors.subject ? 'border-red-500 bg-red-50' : 'border-[#F5F7FA] bg-[#F5F7FA]'
                  } text-[#1B365D]`}
                >
                  <option value="">Select a subject</option>
                  {subjects.map((subject) => (
                    <option key={subject._id} value={subject._id}>
                      {subject.subjectName} ({subject.subjectID})
                    </option>
                  ))}
                </select>
                {errors.subject && <p className="mt-1 text-sm text-red-600">{errors.subject}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-[#1B365D]">Description</label>
                <textarea
                  name="description"
                  value={newModule.description}
                  onChange={handleInputChange}
                  className={`w-full p-2 border rounded-lg ${
                    errors.description ? 'border-red-500 bg-red-50' : 'border-[#F5F7FA] bg-[#F5F7FA]'
                  } text-[#1B365D]`}
                  rows="4"
                />
                {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-[#1B365D]">Lab Session Count</label>
                <input
                  type="number"
                  name="labSessionCount"
                  value={newModule.labSessionCount}
                  onChange={handleInputChange}
                  className={`w-full p-2 border rounded-lg ${
                    errors.labSessionCount ? 'border-red-500 bg-red-50' : 'border-[#F5F7FA] bg-[#F5F7FA]'
                  } text-[#1B365D]`}
                />
                {errors.labSessionCount && <p className="mt-1 text-sm text-red-600">{errors.labSessionCount}</p>}
                <p className="text-xs text-gray-500 mt-1">Range: 1-40</p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-[#1B365D]">Viva Session Count</label>
                <input
                  type="number"
                  name="vivaSessionCount"
                  value={newModule.vivaSessionCount}
                  onChange={handleInputChange}
                  className={`w-full p-2 border rounded-lg ${
                    errors.vivaSessionCount ? 'border-red-500 bg-red-50' : 'border-[#F5F7FA] bg-[#F5F7FA]'
                  } text-[#1B365D]`}
                />
                {errors.vivaSessionCount && <p className="mt-1 text-sm text-red-600">{errors.vivaSessionCount}</p>}
                <p className="text-xs text-gray-500 mt-1">Range: 0-20</p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-[#1B365D]">Module Session Count</label>
                <input
                  type="number"
                  name="moduleSessionCount"
                  value={newModule.moduleSessionCount}
                  onChange={handleInputChange}
                  className={`w-full p-2 border rounded-lg ${
                    errors.moduleSessionCount ? 'border-red-500 bg-red-50' : 'border-[#F5F7FA] bg-[#F5F7FA]'
                  } text-[#1B365D]`}
                />
                {errors.moduleSessionCount && <p className="mt-1 text-sm text-red-600">{errors.moduleSessionCount}</p>}
                <p className="text-xs text-gray-500 mt-1">Range: 1-100</p>
              </div>
            </div>

            <button
              onClick={handleSaveModule}
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
                  {editingModule ? "Saving..." : "Creating..."}
                </>
              ) : (
                editingModule ? "Save Changes" : "Create Module Overview"
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}