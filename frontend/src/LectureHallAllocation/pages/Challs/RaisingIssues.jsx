import { useState, useEffect } from "react";
import axios from "axios";

export default function RaisingIssues() {
  const [rooms, setRooms] = useState([]);
  const [formData, setFormData] = useState({
    facilityType: "Select",
    department: "Select",
    roomId: "",
    issues: [],
    description: "" // Added for miscellaneous issues
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (formData.facilityType !== "Select" && formData.department !== "Select") {
      fetchRooms();
    }
  }, [formData.facilityType, formData.department]);

  const fetchRooms = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/rooms");
      const filteredRooms = res.data.filter(room => 
        room.hallType === formData.facilityType && 
        room.department === formData.department
      );
      setRooms(filteredRooms);
    } catch (err) {
      console.error(err);
    }
  };

  const issueOptions = [
    "A/C malfunctions",
    "Uncomfortable seating arrangements",
    "Non-functional computers in laboratories",
    "Projector, digital screen, or smart TV issues",
    "Insufficient seat count",
    "Sound and electrical problems",
    "Other miscellaneous issues"
  ];

  const handleIssueChange = (issue) => {
    const updatedIssues = formData.issues.includes(issue)
      ? formData.issues.filter(i => i !== issue)
      : [...formData.issues, issue];
    setFormData({ ...formData, issues: updatedIssues });
  };

  const validateForm = () => {
    const newErrors = {};
    if (formData.facilityType === "Select") newErrors.facilityType = "Please select a facility type";
    if (formData.department === "Select") newErrors.department = "Please select a department";
    if (!formData.roomId) newErrors.roomId = "Please select a room";
    if (formData.issues.length === 0) newErrors.issues = "Please select at least one issue";
    if (formData.issues.includes("Other miscellaneous issues") && !formData.description.trim()) {
      newErrors.description = "Please provide a description for miscellaneous issues";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      await axios.post("http://localhost:5000/api/facility-issues", {
        ...formData,
        reportedDate: new Date(),
        status: "Pending"
      });
      alert("Issue reported successfully!");
      setFormData({
        facilityType: "Select",
        department: "Select",
        roomId: "",
        issues: [],
        description: ""
      });
    } catch (err) {
      console.error(err);
      alert("Failed to report issue");
    }
  };

  return (
    <div className="min-h-screen p-8 bg-[#FFFFFF]">
      <h2 className="text-2xl font-bold text-[#1B365D] mb-8">Report Facility Issue</h2>
      
      <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-6">
        {/* Facility Type */}
        <div>
          <label className="block text-sm font-medium mb-2 text-[#1B365D]">Facility Type *</label>
          <select
            value={formData.facilityType}
            onChange={(e) => setFormData({ ...formData, roomId: "", facilityType: e.target.value })}
            className="w-full p-2 border border-[#F5F7FA] rounded-lg bg-[#F5F7FA] text-[#1B365D]"
          >
            <option value="Select">Select</option>
            <option value="Lecturer Hall">Lecturer Hall</option>
            <option value="Laboratory">Laboratory</option>
            <option value="Meeting Room">Meeting Room</option>
          </select>
          {errors.facilityType && <p className="text-red-500 text-xs mt-1">{errors.facilityType}</p>}
        </div>

        {/* Department */}
        <div>
          <label className="block text-sm font-medium mb-2 text-[#1B365D]">Department *</label>
          <select
            value={formData.department}
            onChange={(e) => setFormData({ ...formData, roomId: "", department: e.target.value })}
            className="w-full p-2 border border-[#F5F7FA] rounded-lg bg-[#F5F7FA] text-[#1B365D]"
          >
            <option value="Select">Select</option>
            <option value="Computer Faculty">Computer Faculty</option>
            <option value="Engineer Faculty">Engineer Faculty</option>
            <option value="Business Faculty">Business Faculty</option>
          </select>
          {errors.department && <p className="text-red-500 text-xs mt-1">{errors.department}</p>}
        </div>

        {/* Room Selection */}
        <div>
          <label className="block text-sm font-medium mb-2 text-[#1B365D]">Select Room *</label>
          <div className="grid grid-cols-3 gap-4 max-h-40 overflow-y-auto">
            {rooms.map(room => (
              <div
                key={room._id}
                onClick={() => setFormData({ ...formData, roomId: room.LID })}
                className={`p-3 border rounded-lg cursor-pointer text-center ${
                  formData.roomId === room.LID 
                    ? "bg-[#1B365D] text-white" 
                    : "bg-[#F5F7FA] text-[#1B365D]"
                }`}
              >
                {room.LID}
              </div>
            ))}
          </div>
          {errors.roomId && <p className="text-red-500 text-xs mt-1">{errors.roomId}</p>}
        </div>

        {/* Issues */}
        <div>
          <label className="block text-sm font-medium mb-2 text-[#1B365D]">Select Issues *</label>
          <div className="space-y-2">
            {issueOptions.map(issue => (
              (issue !== "Non-functional computers in laboratories" || formData.facilityType === "Laboratory") && (
                <label key={issue} className="flex items-center gap-2 text-[#1B365D]">
                  <input
                    type="checkbox"
                    checked={formData.issues.includes(issue)}
                    onChange={() => handleIssueChange(issue)}
                    className="w-4 h-4 accent-[#1B365D]"
                  />
                  {issue}
                </label>
              )
            ))}
          </div>
          {errors.issues && <p className="text-red-500 text-xs mt-1">{errors.issues}</p>}
          
          {/* Description for Miscellaneous Issues */}
          {formData.issues.includes("Other miscellaneous issues") && (
            <div className="mt-4">
              <label className="block text-sm font-medium mb-2 text-[#1B365D]">
                Description of Miscellaneous Issue *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className={`w-full p-2 border rounded-lg ${
                  errors.description ? 'border-red-500' : 'border-[#F5F7FA]'
                } bg-[#F5F7FA] text-[#1B365D]`}
                rows="4"
                placeholder="Please describe the issue..."
              />
              {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
            </div>
          )}
        </div>

        <button
          type="submit"
          className="w-full bg-[#1B365D] text-[#FFFFFF] py-2 rounded-lg hover:bg-[#1B365D]/90"
        >
          Submit Issue
        </button>
      </form>
    </div>
  );
}