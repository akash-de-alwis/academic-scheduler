import React, { useState, useEffect } from "react";
import axios from "axios";
import { Users, BookOpen, Calendar, Star, PlusCircle, FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";

const SubjectManagementDashboard = () => {
  const [subjects, setSubjects] = useState([]);
  const [departmentCounts, setDepartmentCounts] = useState({});
  const [mostAssignedSubject, setMostAssignedSubject] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    axios.get("http://localhost:5000/api/subjects")
      .then((res) => {
        setSubjects(res.data);
        countDepartments(res.data);
      })
      .catch((err) => console.error("Error fetching subjects:", err));
  }, []);

  const countDepartments = (data) => {
    const departmentMap = {};
    data.forEach((subject) => {
      departmentMap[subject.department] = (departmentMap[subject.department] || 0) + 1;
    });
    setDepartmentCounts(departmentMap);

    const mostFrequent = data.reduce((acc, subject) => {
      acc[subject.subjectName] = (acc[subject.subjectName] || 0) + 1;
      return acc;
    }, {});
    const mostAssigned = Object.keys(mostFrequent).reduce((a, b) => (mostFrequent[a] > mostFrequent[b] ? a : b), "");
    setMostAssignedSubject(mostAssigned || "N/A");
  };

  const navigateToSubjectList = () => {
    navigate("/SubjectList");
  };

  const navigateToAddSubject = () => {
    navigate("/SubjectList", { state: { showForm: true } });
  };

  const navigateToReportGeneration = () => {
    navigate("/ReportGeneration");
  };

  return (
    <div className="bg-[#FFFFFF] min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-[#1B365D]">Subject Management Dashboard</h1>
          <p className="text-gray-600">Overview of academic subjects and resource allocation</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <div className="bg-[#F5F7FA] rounded-lg shadow-sm p-6 flex items-start justify-between">
            <div>
              <h2 className="text-4xl font-bold text-[#1B365D]">{subjects.length}</h2>
              <p className="text-gray-600">Total Subjects Available</p>
            </div>
            <BookOpen size={24} className="text-[#1B365D]" />
          </div>

          <div className="bg-[#F5F7FA] rounded-lg shadow-sm p-6 flex items-start justify-between">
            <div>
              <h2 className="text-4xl font-bold text-[#1B365D]">{Object.keys(departmentCounts).length}</h2>
              <p className="text-gray-600">Departments Covered</p>
            </div>
            <Users size={24} className="text-[#1B365D]" />
          </div>

          <div className="bg-[#F5F7FA] rounded-lg shadow-sm p-6 flex items-start justify-between">
            <div>
              <h2 className="text-4xl font-bold text-[#1B365D]">{(subjects.length / 8).toFixed(1)}</h2>
              <p className="text-gray-600">Subjects per Semester</p>
            </div>
            <Calendar size={24} className="text-[#1B365D]" />
          </div>

          <div className="bg-[#F5F7FA] rounded-lg shadow-sm p-6 flex items-start justify-between">
            <div>
              <h2 className="text-lg font-bold text-[#1B365D]">{mostAssignedSubject}</h2>
              <p className="text-gray-600">Most Assigned Subject</p>
            </div>
            <Star size={24} className="text-[#1B365D]" />
          </div>
        </div>

        <div className="bg-[#F5F7FA] rounded-lg shadow-sm p-6 mb-10">
          <h2 className="text-xl font-bold text-[#1B365D] mb-6">Department Distribution</h2>
          <div className="space-y-6">
            {Object.entries(departmentCounts).map(([dept, count]) => (
              <div key={dept}>
                <div className="flex justify-between mb-1">
                  <span className="text-[#1B365D]">{dept}</span>
                  <span className="text-[#1B365D]">{count} subjects</span>
                </div>
                <div className="w-full bg-white rounded-full h-2">
                  <div className="bg-[#1B365D] h-2 rounded-full" style={{ width: `${(count / subjects.length) * 100}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <button 
            onClick={navigateToAddSubject}
            className="bg-[#1B365D] text-white py-4 px-6 rounded-lg flex items-center justify-center space-x-2 hover:bg-opacity-90 transition"
          >
            <PlusCircle size={20} />
            <span>Add New Subject</span>
          </button>

          <button 
            onClick={navigateToSubjectList}
            className="bg-[#1B365D] text-white py-4 px-6 rounded-lg flex items-center justify-center space-x-2 hover:bg-opacity-90 transition"
          >
            <BookOpen size={20} />
            <span>View All Subjects</span>
          </button>

          <button 
            onClick={navigateToReportGeneration}
            className="bg-[#1B365D] text-white py-4 px-6 rounded-lg flex items-center justify-center space-x-2 hover:bg-opacity-90 transition"
          >
            <FileText size={20} />
            <span>Generate Reports</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default SubjectManagementDashboard;