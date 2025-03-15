import { useState, useEffect } from "react";
import axios from "axios";
import { AlertCircle, CheckCircle, Clock, BarChart2, FileText } from "lucide-react"; // Added FileText icon
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function HallIssues() {
  const [issues, setIssues] = useState([]);
  const [filteredIssues, setFilteredIssues] = useState([]);
  const [expandedId, setExpandedId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [urgencyFilter, setUrgencyFilter] = useState("All");
  const [sortBy, setSortBy] = useState("urgency");
  const [showChart, setShowChart] = useState(false);
  const [showReport, setShowReport] = useState(false); // State for report modal

  const allIssueOptions = [
    "A/C malfunctions",
    "Uncomfortable seating arrangements",
    "Non-functional computers in laboratories",
    "Projector, digital screen, or smart TV issues",
    "Insufficient seat count",
    "Sound and electrical problems",
    "Other miscellaneous issues",
  ];

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
    if (status !== "All") filtered = filtered.filter((issue) => issue.status === status);
    if (urgency !== "All") filtered = filtered.filter((issue) => issue.urgency === urgency);
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
    setFilteredIssues(applyFilters(issues, term, statusFilter, urgencyFilter));
  };

  const handleStatusFilterChange = (status) => {
    setStatusFilter(status);
    setFilteredIssues(applyFilters(issues, searchTerm, status, urgencyFilter));
  };

  const handleUrgencyFilterChange = (urgency) => {
    setUrgencyFilter(urgency);
    setFilteredIssues(applyFilters(issues, searchTerm, statusFilter, urgency));
  };

  const handleSortChange = (newSortBy) => {
    setSortBy(newSortBy);
    setFilteredIssues(sortIssues(filteredIssues, newSortBy));
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      const res = await axios.put(`http://localhost:5000/api/facility-issues/${id}`, { status: newStatus });
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
      if (description.trim()) return { issues: formattedIssues, otherDescription: description };
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

  // Chart Data
  const getChartData = () => {
    const issueCounts = {};
    allIssueOptions.forEach((issue) => (issueCounts[issue] = 0));
    filteredIssues.forEach((issue) => {
      issue.issues.forEach((singleIssue) => {
        if (allIssueOptions.includes(singleIssue)) issueCounts[singleIssue] += 1;
      });
    });

    return {
      labels: allIssueOptions,
      datasets: [
        {
          label: "Number of Issues",
          data: allIssueOptions.map((issue) => issueCounts[issue]),
          backgroundColor: "#1B365D",
          borderColor: "#1B365D",
          borderWidth: 1,
        },
      ],
    };
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { position: "top" },
      title: { display: true, text: "Facility Issues Count", color: "#1B365D", font: { size: 18 } },
    },
    scales: {
      x: {
        title: { display: true, text: "Issues", color: "#1B365D" },
        ticks: { autoSkip: false, maxRotation: 45, minRotation: 45 },
      },
      y: {
        title: { display: true, text: "Count", color: "#1B365D" },
        beginAtZero: true,
        ticks: { stepSize: 1 },
      },
    },
  };

  const handleViewChart = () => setShowChart(true);
  const closeChart = () => setShowChart(false);

  const handleGenerateReport = () => setShowReport(true);
  const closeReport = () => setShowReport(false);

  // Report Data
  const getReportData = () => {
    const totalIssues = filteredIssues.length;
    const statusBreakdown = {
      Pending: filteredIssues.filter((i) => i.status === "Pending").length,
      Resolved: filteredIssues.filter((i) => i.status === "Resolved").length,
    };
    const urgencyBreakdown = {
      Urgent: filteredIssues.filter((i) => i.urgency === "Urgent").length,
      Medium: filteredIssues.filter((i) => i.urgency === "Medium").length,
      Low: filteredIssues.filter((i) => i.urgency === "Low").length,
    };
    const generatedDateTime = new Date().toLocaleString();

    return { totalIssues, statusBreakdown, urgencyBreakdown, generatedDateTime };
  };

  const { totalIssues, statusBreakdown, urgencyBreakdown, generatedDateTime } = getReportData();

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
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${getUrgencyColor(issue.urgency)}`}>
                      {issue.urgency}
                    </span>
                    <span className="text-[#1B365D] text-sm transition-transform duration-300">
                      {expandedId === issue._id ? "▲" : "▼"}
                    </span>
                  </div>
                </div>
                <div
                  className={`overflow-hidden transition-all duration-300 ease-in-out ${
                    expandedId === issue._id ? "max-h-[600px] p-6 opacity-100" : "max-h-0 opacity-0"
                  }`}
                >
                  <div className="text-[#1B365D] space-y-6">
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

      {/* Buttons */}
      <div className="mt-8 flex justify-center gap-4">
        <button
          onClick={handleViewChart}
          className="bg-[#1B365D] text-[#FFFFFF] px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-[#1B365D]/90 transition-all duration-200"
        >
          <BarChart2 className="w-5 h-5" />
          View Chart
        </button>
        <button
          onClick={handleGenerateReport}
          className="bg-[#1B365D] text-[#FFFFFF] px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-[#1B365D]/90 transition-all duration-200"
        >
          <FileText className="w-5 h-5" />
          Generate Report
        </button>
      </div>

      {/* Chart Modal */}
      {showChart && (
        <div className="fixed inset-0 bg-[#1B365D]/30 backdrop-blur-sm flex justify-center items-center">
          <div className="bg-[#FFFFFF] p-6 rounded-lg w-[800px] relative">
            <button onClick={closeChart} className="absolute top-4 right-4 text-[#1B365D] hover:text-[#1B365D]/70">
              ✕
            </button>
            <h3 className="text-lg font-semibold text-[#1B365D] mb-4">Issues Distribution</h3>
            <div className="h-[400px]">
              <Bar data={getChartData()} options={chartOptions} />
            </div>
          </div>
        </div>
      )}

      {/* Report Modal */}
      {showReport && (
        <div className="fixed inset-0 bg-[#1B365D]/30 backdrop-blur-sm flex justify-center items-center">
          <div className="bg-[#FFFFFF] p-8 rounded-lg w-[900px] max-h-[90vh] overflow-y-auto relative">
            <button onClick={closeReport} className="absolute top-4 right-4 text-[#1B365D] hover:text-[#1B365D]/70">
              ✕
            </button>
            <div className="report-content">
              <h1 className="text-3xl font-bold text-[#1B365D] mb-6 text-center">Facility Issues Report</h1>

              {/* Summary Section */}
              <section className="mb-8">
                <h2 className="text-xl font-semibold text-[#1B365D] mb-4">Summary</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-[#F5F7FA] p-4 rounded-lg">
                    <p className="text-[#1B365D] font-medium">Total Issues Reported:</p>
                    <p className="text-2xl text-[#1B365D]">{totalIssues}</p>
                  </div>
                  <div className="bg-[#F5F7FA] p-4 rounded-lg">
                    <p className="text-[#1B365D] font-medium">Status Breakdown:</p>
                    <p className="text-[#1B365D]">Pending: {statusBreakdown.Pending}</p>
                    <p className="text-[#1B365D]">Resolved: {statusBreakdown.Resolved}</p>
                  </div>
                  <div className="bg-[#F5F7FA] p-4 rounded-lg col-span-2">
                    <p className="text-[#1B365D] font-medium">Urgency Breakdown:</p>
                    <p className="text-[#1B365D]">Urgent: {urgencyBreakdown.Urgent}</p>
                    <p className="text-[#1B365D]">Medium: {urgencyBreakdown.Medium}</p>
                    <p className="text-[#1B365D]">Low: {urgencyBreakdown.Low}</p>
                  </div>
                </div>
              </section>

              {/* Chart Section */}
              <section className="mb-8">
                <h2 className="text-xl font-semibold text-[#1B365D] mb-4">Issues Distribution Chart</h2>
                <div className="h-[400px] w-full">
                  <Bar data={getChartData()} options={chartOptions} />
                </div>
              </section>

              {/* Detailed List Section */}
              <section className="mb-8">
                <h2 className="text-xl font-semibold text-[#1B365D] mb-4">Detailed Issues List</h2>
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-[#1B365D] text-[#FFFFFF]">
                      <th className="p-2 text-left">Room ID</th>
                      <th className="p-2 text-left">Facility Type</th>
                      <th className="p-2 text-left">Department</th>
                      <th className="p-2 text-left">Issues</th>
                      <th className="p-2 text-left">Urgency</th>
                      <th className="p-2 text-left">Status</th>
                      <th className="p-2 text-left">Reported Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredIssues.map((issue) => {
                      const { issues: issueItems, otherDescription } = formatIssues(issue.issues, issue.description);
                      return (
                        <tr key={issue._id} className="border-b border-[#EDEFF2]">
                          <td className="p-2 text-[#1B365D]">{issue.roomId}</td>
                          <td className="p-2 text-[#1B365D]">{issue.facilityType}</td>
                          <td className="p-2 text-[#1B365D]">{issue.department}</td>
                          <td className="p-2 text-[#1B365D]">
                            {issueItems.length > 0 ? issueItems.join(", ") : "Other: " + otherDescription}
                          </td>
                          <td className="p-2 text-[#1B365D]">{issue.urgency}</td>
                          <td className="p-2 text-[#1B365D]">{issue.status}</td>
                          <td className="p-2 text-[#1B365D]">{new Date(issue.reportedDate).toLocaleDateString()}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </section>

              {/* Generated Date and Time */}
              <footer className="text-center text-[#1B365D] text-sm mt-8">
                Generated on: {generatedDateTime}
              </footer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}