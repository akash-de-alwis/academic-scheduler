import { useState, useEffect } from "react";
import axios from "axios";
import { AlertCircle, CheckCircle, Clock } from "lucide-react";

export default function HallIssues() {
  const [issues, setIssues] = useState([]);
  const [filteredIssues, setFilteredIssues] = useState([]);
  const [expandedId, setExpandedId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [urgencyFilter, setUrgencyFilter] = useState("All");
  const [sortBy, setSortBy] = useState("urgency");

  useEffect(() => {
    fetchIssues();
  }, []);

  const fetchIssues = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/facility-issues");
      const sortedIssues = sortIssues(res.data, sortBy);
      setIssues(sortedIssues);
      setFilteredIssues(applyFilters(sortedIssues, searchTerm, statusFilter, urgencyFilter));
    } catch (err) {
      console.error(err);
    }
  };

  const sortIssues = (data, sortType) => {
    const urgencyOrder = { Urgent: 3, Medium: 2, Low: 1 };
    return [...data].sort((a, b) => {
      if (sortType === "urgency") {
        const urgencyDiff = urgencyOrder[b.urgency] - urgencyOrder[a.urgency];
        return urgencyDiff !== 0 ? urgencyDiff : new Date(b.reportedDate) - new Date(a.reportedDate);
      } else if (sortType === "status") {
        return b.status.localeCompare(a.status) || new Date(b.reportedDate) - new Date(a.reportedDate);
      } else if (sortType === "date") {
        return new Date(b.reportedDate) - new Date(a.reportedDate);
      }
      return 0;
    });
  };

  const applyFilters = (issuesList, search, status, urgency) => {
    let filtered = [...issuesList];

    if (status !== "All") {
      filtered = filtered.filter((issue) => issue.status === status);
    }

    if (urgency !== "All") {
      filtered = filtered.filter((issue) => issue.urgency === urgency);
    }

    if (search) {
      filtered = filtered.filter((issue) =>
        issue.roomId.toLowerCase().includes(search.toLowerCase()) ||
        issue.facilityType.toLowerCase().includes(search.toLowerCase()) ||
        issue.department.toLowerCase().includes(search.toLowerCase())
      );
    }

    return filtered;
  };

  const handleSearch = (term) => {
    setSearchTerm(term);
    const filtered = applyFilters(issues, term, statusFilter, urgencyFilter);
    setFilteredIssues(filtered);
  };

  const handleStatusFilterChange = (status) => {
    setStatusFilter(status);
    const filtered = applyFilters(issues, searchTerm, status, urgencyFilter);
    setFilteredIssues(filtered);
  };

  const handleUrgencyFilterChange = (urgency) => {
    setUrgencyFilter(urgency);
    const filtered = applyFilters(issues, searchTerm, statusFilter, urgency);
    setFilteredIssues(filtered);
  };

  const handleSortChange = (newSortBy) => {
    setSortBy(newSortBy);
    const sorted = sortIssues(filteredIssues, newSortBy);
    setFilteredIssues(sorted);
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      const res = await axios.put(`http://localhost:5000/api/facility-issues/${id}`, {
        status: newStatus,
      });
      const updatedIssues = issues.map((issue) =>
        issue._id === id ? { ...issue, status: res.data.status } : issue
      );
      setIssues(updatedIssues);
      setFilteredIssues(applyFilters(updatedIssues, searchTerm, statusFilter, urgencyFilter));
    } catch (err) {
      console.error(err);
    }
  };

  const formatIssues = (issueList, description) => {
    let formattedIssues = [...issueList];
    if (formattedIssues.includes("Other miscellaneous issues")) {
      formattedIssues = formattedIssues.filter((issue) => issue !== "Other miscellaneous issues");
      if (description.trim()) {
        return { issues: formattedIssues, otherDescription: description };
      }
    }
    return { issues: formattedIssues, otherDescription: null };
  };

  const getUrgencyColor = (urgency) => {
    switch (urgency) {
      case "Urgent": return "bg-red-100 text-red-800 border-red-200";
      case "Medium": return "bg-orange-100 text-orange-800 border-orange-200";
      case "Low": return "bg-blue-100 text-blue-800 border-blue-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <div className="min-h-screen p-8 bg-[#FFFFFF]">
      {/* Page Header */}
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold text-[#1B365D]">Reported Facility Issues</h2>
      </div>

      {/* Filters and Search */}
      <div className="flex justify-between gap-4 mb-8">
        <input
          type="text"
          placeholder="Search issues by room, type, or department..."
          value={searchTerm}
          onChange={(e) => handleSearch(e.target.value)}
          className="flex-1 px-4 py-2 border border-[#F5F7FA] rounded-lg bg-[#F5F7FA] text-[#1B365D]"
        />
        <div className="flex gap-4">
          <select
            value={statusFilter}
            onChange={(e) => handleStatusFilterChange(e.target.value)}
            className="p-2 border border-[#F5F7FA] rounded-lg bg-[#F5F7FA] text-[#1B365D] text-sm"
          >
            <option value="All">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Resolved">Resolved</option>
          </select>
          <select
            value={urgencyFilter}
            onChange={(e) => handleUrgencyFilterChange(e.target.value)}
            className="p-2 border border-[#F5F7FA] rounded-lg bg-[#F5F7FA] text-[#1B365D] text-sm"
          >
            <option value="All">All Urgencies</option>
            <option value="Urgent">Urgent</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
          <select
            value={sortBy}
            onChange={(e) => handleSortChange(e.target.value)}
            className="p-2 border border-[#F5F7FA] rounded-lg bg-[#F5F7FA] text-[#1B365D] text-sm"
          >
            <option value="urgency">Sort by Urgency</option>
            <option value="status">Sort by Status</option>
            <option value="date">Sort by Date</option>
          </select>
        </div>
      </div>

      {/* Issues List */}
      <div className="space-y-4">
        {filteredIssues.length === 0 ? (
          <p className="text-[#1B365D] text-center">No issues match the current filters.</p>
        ) : (
          filteredIssues.map((issue) => {
            const { issues: issueItems, otherDescription } = formatIssues(issue.issues, issue.description);

            return (
              <div
                key={issue._id}
                className={`bg-[#F5F7FA] rounded-lg shadow-md hover:shadow-xl transition-all duration-300 ease-in-out border-l-4 ${getUrgencyColor(issue.urgency).split(' ')[0].replace('bg-', 'border-')}`}
              >
                {/* Accordion Header */}
                <div
                  className="p-4 flex justify-between items-center cursor-pointer hover:bg-[#EDEFF2] transition-colors duration-200"
                  onClick={() => setExpandedId(expandedId === issue._id ? null : issue._id)}
                >
                  <div className="flex items-center space-x-3">
                    <span className={`w-3 h-3 rounded-full ${issue.status === "Pending" ? "bg-yellow-400" : "bg-green-400"}`}></span>
                    <h3 className="text-lg font-semibold text-[#1B365D]">{issue.roomId}</h3>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span
                      className={`text-xs px-2 py-1 rounded-full font-medium ${
                        issue.status === "Pending" ? "bg-yellow-100 text-yellow-800" : "bg-green-100 text-green-800"
                      }`}
                    >
                      {issue.status}
                    </span>
                    <span
                      className={`text-xs px-2 py-1 rounded-full font-medium ${getUrgencyColor(issue.urgency)}`}
                    >
                      {issue.urgency}
                    </span>
                    <span className="text-[#1B365D] text-sm transition-transform duration-300">
                      {expandedId === issue._id ? "▲" : "▼"}
                    </span>
                  </div>
                </div>

                {/* Accordion Content */}
                <div
                  className={`overflow-hidden transition-all duration-300 ease-in-out ${
                    expandedId === issue._id ? "max-h-[600px] p-6 opacity-100" : "max-h-0 opacity-0"
                  }`}
                >
                  <div className="text-[#1B365D] space-y-6">
                    {/* General Info */}
                    <section>
                      <h4 className="font-semibold text-[#1B365D] mb-3 flex items-center">
                        <Clock className="w-5 h-5 mr-2" /> General Information
                      </h4>
                      <div className="grid grid-cols-2 gap-4 bg-white p-4 rounded-md shadow-sm">
                        <p><span className="font-medium">Facility Type:</span> {issue.facilityType}</p>
                        <p><span className="font-medium">Department:</span> {issue.department}</p>
                        <p><span className="font-medium">Reported Date:</span> {new Date(issue.reportedDate).toLocaleDateString()}</p>
                        <p><span className="font-medium">Urgency:</span> {issue.urgency}</p>
                        <div className="col-span-2">
                          <span className="font-medium">Status:</span>
                          <select
                            value={issue.status}
                            onChange={(e) => handleStatusChange(issue._id, e.target.value)}
                            className={`ml-2 p-1 rounded-full text-xs border-none cursor-pointer focus:outline-none ${
                              issue.status === "Pending" ? "bg-yellow-100 text-yellow-800" : "bg-green-100 text-green-800"
                            }`}
                          >
                            <option value="Pending">Pending</option>
                            <option value="Resolved">Resolved</option>
                          </select>
                        </div>
                      </div>
                    </section>

                    {/* Issues Section */}
                    <section className="border-t border-[#EDEFF2] pt-4">
                      <h4 className="font-semibold text-[#1B365D] mb-3 flex items-center">
                        <AlertCircle className="w-5 h-5 mr-2" /> Reported Issues
                      </h4>
                      {issueItems.length > 0 ? (
                        <ul className="list-disc pl-5 space-y-2 bg-white p-4 rounded-md shadow-sm">
                          {issueItems.map((item, index) => (
                            <li key={index} className="text-[#1B365D]">{item}</li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-[#1B365D] italic bg-white p-4 rounded-md shadow-sm">Other miscellaneous issues</p>
                      )}
                    </section>

                    {/* Additional Details (if applicable) */}
                    {otherDescription && (
                      <section className="border-t border-[#EDEFF2] pt-4">
                        <h4 className="font-semibold text-[#1B365D] mb-3 flex items-center">
                          <CheckCircle className="w-5 h-5 mr-2" /> Additional Details
                        </h4>
                        <p className="text-[#1B365D] bg-white p-4 rounded-md shadow-sm">{otherDescription}</p>
                      </section>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}