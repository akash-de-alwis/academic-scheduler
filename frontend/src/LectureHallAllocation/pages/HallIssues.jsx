import { useState, useEffect } from "react";
import axios from "axios";

export default function HallIssues() {
  const [issues, setIssues] = useState([]);

  useEffect(() => {
    fetchIssues();
  }, []);

  const fetchIssues = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/facility-issues");
      setIssues(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      const res = await axios.put(`http://localhost:5000/api/facility-issues/${id}`, {
        status: newStatus
      });
      setIssues(issues.map(issue => 
        issue._id === id ? { ...issue, status: res.data.status } : issue
      ));
    } catch (err) {
      console.error(err);
    }
  };

  const formatIssues = (issueList, description) => {
    if (issueList.includes("Other miscellaneous issues")) {
      // Replace "Other miscellaneous issues" with the description if it exists
      const filteredIssues = issueList.filter(issue => issue !== "Other miscellaneous issues");
      if (description.trim()) {
        filteredIssues.push(description);
      }
      return filteredIssues.join(", ");
    }
    return issueList.join(", ");
  };

  return (
    <div className="min-h-screen p-8 bg-[#FFFFFF]">
      <h2 className="text-2xl font-bold text-[#1B365D] mb-8">Reported Facility Issues</h2>
      
      <div className="bg-[#F5F7FA] rounded-lg">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#FFFFFF]">
              <th className="text-left p-4 font-medium text-[#1B365D]">Room ID</th>
              <th className="text-left p-4 font-medium text-[#1B365D]">Facility Type</th>
              <th className="text-left p-4 font-medium text-[#1B365D]">Department</th>
              <th className="text-left p-4 font-medium text-[#1B365D]">Issues</th>
              <th className="text-left p-4 font-medium text-[#1B365D]">Status</th>
              <th className="text-left p-4 font-medium text-[#1B365D]">Reported Date</th>
            </tr>
          </thead>
          <tbody>
            {issues.map(issue => (
              <tr key={issue._id} className="border-b border-[#FFFFFF]">
                <td className="p-4 text-[#1B365D]">{issue.roomId}</td>
                <td className="p-4 text-[#1B365D]">{issue.facilityType}</td>
                <td className="p-4 text-[#1B365D]">{issue.department}</td>
                <td className="p-4 text-[#1B365D]">
                  {formatIssues(issue.issues, issue.description)}
                </td>
                <td className="p-4">
                  <select
                    value={issue.status}
                    onChange={(e) => handleStatusChange(issue._id, e.target.value)}
                    className={`p-1 rounded-full text-xs border-none ${
                      issue.status === "Pending" ? "bg-yellow-100 text-yellow-800" :
                      issue.status === "Resolved" ? "bg-green-100 text-green-800" :
                      "bg-gray-100 text-gray-800"
                    }`}
                  >
                    <option value="Pending">Pending</option>
                    <option value="Resolved">Resolved</option>
                  </select>
                </td>
                <td className="p-4 text-[#1B365D]">
                  {new Date(issue.reportedDate).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}