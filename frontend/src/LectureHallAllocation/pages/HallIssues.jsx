import { useState, useEffect } from "react";
import axios from "axios";
import { AlertCircle, CheckCircle, Clock, BarChart2, FileText, Download } from "lucide-react";
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
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

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
  const [showReport, setShowReport] = useState(false);

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

  const getChartData = () => {
    const issueCounts = {};
    filteredIssues.forEach((issue) => {
      issue.issues.forEach((singleIssue) => {
        issueCounts[singleIssue] = (issueCounts[singleIssue] || 0) + 1;
      });
    });

    const uniqueIssues = Object.keys(issueCounts);
    const issueFrequencies = Object.values(issueCounts);

    return {
      labels: uniqueIssues.length > 0 ? uniqueIssues : ["No Issues Reported"],
      datasets: [
        {
          label: "Number of Issues",
          data: uniqueIssues.length > 0 ? issueFrequencies : [0],
          backgroundColor: "rgba(27, 54, 93, 0.8)",
          borderColor: "#1B365D",
          borderWidth: 1,
          borderRadius: 4,
          barThickness: uniqueIssues.length > 15 ? 30 : uniqueIssues.length > 10 ? 40 : 60,
          maxBarThickness: 60,
        },
      ],
    };
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: "top", labels: { color: "#1B365D", font: { size: 14, weight: "bold" } } },
      title: { display: true, text: "Facility Issues Distribution", color: "#1B365D", font: { size: 18, weight: "bold" }, padding: { top: 10, bottom: 20 } },
      tooltip: { backgroundColor: "#1B365D", titleColor: "#FFFFFF", bodyColor: "#FFFFFF", borderColor: "#EDEFF2", borderWidth: 1 },
    },
    scales: {
      x: {
        title: { display: true, text: "Issue Types", color: "#1B365D", font: { size: 14, weight: "bold" } },
        ticks: { color: "#1B365D", font: { size: 10 }, maxRotation: 90, minRotation: 45, autoSkip: false, padding: 5 },
        grid: { display: false },
      },
      y: {
        title: { display: true, text: "Count", color: "#1B365D", font: { size: 14, weight: "bold" } },
        ticks: { color: "#1B365D", font: { size: 12 }, stepSize: 1 },
        beginAtZero: true,
        grid: { color: "#EDEFF2" },
      },
    },
  };

  const handleViewChart = () => setShowChart(true);
  const closeChart = () => setShowChart(false);
  const handleGenerateReport = () => setShowReport(true);
  const closeReport = () => setShowReport(false);

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

  const downloadReport = () => {
    const pdf = new jsPDF("p", "mm", "a4");
    const width = pdf.internal.pageSize.getWidth();
    const height = pdf.internal.pageSize.getHeight();
    const margin = 15;
    const contentWidth = width - 2 * margin;
    let yPosition = margin;
    let pageNumber = 1;

    // Function to add page number
    const addPageNumber = () => {
      pdf.setFontSize(8);
      pdf.setTextColor(80, 80, 80);
      pdf.text(`Page ${pageNumber}`, width - margin - 10, height - 8, { align: "right" });
    };

    // Function to check and add new page if needed
    const checkPageBreak = (requiredHeight) => {
      if (yPosition + requiredHeight > height - margin - 15) {
        addPageNumber();
        pdf.addPage();
        pageNumber++;
        yPosition = margin;
      }
    };

    // Header Design
    pdf.setFillColor(27, 54, 93);
    pdf.rect(0, 0, width, 30, "F");
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(20);
    pdf.setFont("helvetica", "bold");
    pdf.text("Facility Issues Report", margin, 20);
    
    // Date stamp
    pdf.setFontSize(10);
    pdf.setFont("helvetica", "normal");
    pdf.text(`Generated: ${new Date().toLocaleString()}`, width - margin, 20, { align: "right" });

    yPosition += 40;

    // Section Header Styling Function
    const addSectionHeader = (title) => {
      checkPageBreak(20);
      pdf.setFillColor(240, 245, 250);
      pdf.rect(margin, yPosition - 4, contentWidth, 12, "F");
      pdf.setTextColor(27, 54, 93);
      pdf.setFontSize(14);
      pdf.setFont("helvetica", "bold");
      pdf.text(title, margin + 5, yPosition + 4);
      yPosition += 15;
    };

    // Summary Section
    addSectionHeader("Summary");
    
    pdf.setFontSize(11);
    pdf.setTextColor(0, 0, 0);
    pdf.setFont("helvetica", "normal");
    
    // Summary Boxes
    pdf.setFillColor(245, 247, 250);
    pdf.rect(margin, yPosition, contentWidth/2 - 5, 40, "F");
    pdf.text("Total Issues Reported", margin + 5, yPosition + 10);
    pdf.setFontSize(16);
    pdf.setFont("helvetica", "bold");
    pdf.text(`${totalIssues}`, margin + 5, yPosition + 25);
    
    pdf.setFontSize(11);
    pdf.setFont("helvetica", "normal");
    pdf.setFillColor(245, 247, 250);
    pdf.rect(margin + contentWidth/2 + 5, yPosition, contentWidth/2 - 5, 40, "F");
    pdf.text("Status Breakdown", margin + contentWidth/2 + 10, yPosition + 10);
    pdf.text(`Pending: ${statusBreakdown.Pending}`, margin + contentWidth/2 + 10, yPosition + 20);
    pdf.text(`Resolved: ${statusBreakdown.Resolved}`, margin + contentWidth/2 + 10, yPosition + 30);
    
    yPosition += 50;
    
    pdf.setFillColor(245, 247, 250);
    pdf.rect(margin, yPosition, contentWidth, 30, "F");
    pdf.text("Urgency Breakdown", margin + 5, yPosition + 10);
    pdf.text(`Urgent: ${urgencyBreakdown.Urgent}  |  Medium: ${urgencyBreakdown.Medium}  |  Low: ${urgencyBreakdown.Low}`, 
      margin + 5, yPosition + 20);
    yPosition += 40;

    // Issues Distribution Chart
    addSectionHeader("Issues Distribution Chart");
    
    const chartElement = document.querySelector(".chart-container");
    html2canvas(chartElement, { scale: 2 }).then((canvas) => {
      const imgData = canvas.toDataURL("image/png");
      const imgHeight = (canvas.height * contentWidth) / canvas.width;
      const maxChartHeight = 120;

      pdf.addImage(imgData, "PNG", margin, yPosition, contentWidth, Math.min(imgHeight, maxChartHeight));
      yPosition += Math.min(imgHeight, maxChartHeight) + 20;

      // Detailed Issues List
      addSectionHeader("Detailed Issues List");

      // Table Header
      pdf.setFillColor(27, 54, 93);
      pdf.rect(margin, yPosition, contentWidth, 10, "F");
      pdf.setFontSize(10);
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(255, 255, 255);
      pdf.text("Room", margin + 2, yPosition + 7);
      pdf.text("Facility", margin + 20, yPosition + 7);
     // pdf.text("Dept", margin + 55, yPosition + 7);
      pdf.text("Issues", margin + 50, yPosition + 7);
      pdf.text("Urgency", margin + 110, yPosition + 7);
      pdf.text("Status", margin + 135, yPosition + 7);
      pdf.text("Date", margin + 160, yPosition + 7);
      yPosition += 12;

      // Table Content
      pdf.setFont("helvetica", "normal");
      pdf.setTextColor(0, 0, 0);
      pdf.setFontSize(9);
      filteredIssues.forEach((issue, index) => {
        const { issues: issueItems, otherDescription } = formatIssues(issue.issues, issue.description);
        const issueText = issueItems.length > 0 ? issueItems.join(", ") : `Other: ${otherDescription}`;
        const lines = pdf.splitTextToSize(issueText, 50);
        const rowHeight = Math.max(6, lines.length * 5);

        checkPageBreak(rowHeight + 2);
        
        pdf.setFillColor(index % 2 === 0 ? 245 : 255, 247, 250);
        pdf.rect(margin, yPosition - 2, contentWidth, rowHeight + 2, "F");
        
        pdf.text(issue.roomId, margin + 2, yPosition + 3);
        pdf.text(issue.facilityType.slice(0, 15) + (issue.facilityType.length > 15 ? "..." : ""), margin + 20, yPosition + 3);
       // pdf.text(issue.department.slice(0, 15) + (issue.department.length > 15 ? "..." : ""), margin + 55, yPosition + 3);
        lines.forEach((line, index) => {
          pdf.text(line, margin + 50, yPosition + 3 + (index * 5));
        });
        pdf.text(issue.urgency, margin + 110, yPosition + 3);
        pdf.text(issue.status, margin + 135, yPosition + 3);
        // Modified date format to show 2-digit year
        const date = new Date(issue.reportedDate);
        const formattedDate = `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
        pdf.text(formattedDate, margin + 160, yPosition + 3);
        
        yPosition += rowHeight + 2;
      });

      // Add page numbers to all pages
      for (let i = 1; i <= pageNumber; i++) {
        pdf.setPage(i);
        addPageNumber();
      }

      pdf.save("Facility_Issues_Report.pdf");
    }).catch((error) => {
      console.error("Error generating PDF:", error);
    });
  };

  return (
    <div className="min-h-screen p-8 bg-[#FFFFFF]">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold text-[#1B365D]">Reported Facility Issues</h2>
      </div>

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
                      className={`text-xs px-2 py-1 rounded-full font-medium ${issue.status === "Pending" ? "bg-yellow-100 text-yellow-800" : "bg-green-100 text-green-800"}`}
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
                  className={`overflow-hidden transition-all duration-300 ease-in-out ${expandedId === issue._id ? "max-h-[600px] p-6 opacity-100" : "max-h-0 opacity-0"}`}
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
                            className={`ml-2 p-1 rounded-full text-xs border-none cursor-pointer focus:outline-none ${issue.status === "Pending" ? "bg-yellow-100 text-yellow-800" : "bg-green-100 text-green-800"}`}
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

      {showChart && (
        <div className="fixed inset-0 bg-[#1B365D]/30 backdrop-blur-sm flex justify-center items-center">
          <div className="bg-[#FFFFFF] p-6 rounded-xl shadow-lg w-[1200px] relative border border-[#EDEFF2]">
            <button onClick={closeChart} className="absolute top-4 right-4 text-[#1B365D] hover:text-[#1B365D]/70 text-lg">
              ✕
            </button>
            <h3 className="text-xl font-bold text-[#1B365D] mb-6">Issues Distribution</h3>
            <div className="h-[500px]">
              <Bar data={getChartData()} options={chartOptions} />
            </div>
          </div>
        </div>
      )}

      {showReport && (
        <div className="fixed inset-0 bg-[#1B365D]/30 backdrop-blur-sm flex justify-center items-center">
          <div className="bg-[#FFFFFF] p-8 rounded-xl w-[1200px] max-h-[90vh] overflow-y-auto relative shadow-xl border border-[#EDEFF2]">
            <button onClick={closeReport} className="absolute top-1 right-2 text-[#1B365D] hover:text-[#1B365D]/70 text-lg">
              ✕
            </button>
            <button
              onClick={downloadReport}
              className="absolute top-12 left-10 bg-[#1B365D] text-white p-2 rounded-full hover:bg-[#1B365D]/90 transition-all duration-200"
              title="Download Report as PDF"
            >
              <Download className="w-5 h-5" />
            </button>
            <div className="report-content">
              <header className="bg-gradient-to-r from-[#1B365D] to-[#2A4A7A] text-white p-6 rounded-t-xl shadow-md mb-8">
                <div className="flex items-center justify-center gap-3">
                  <FileText className="w-8 h-8" />
                  <h1 className="text-3xl font-bold tracking-tight">Facility Issues Report</h1>
                </div>
              </header>

              <section className="mb-8 bg-white p-6 rounded-lg shadow-md border border-[#EDEFF2]">
                <h2 className="text-xl font-semibold text-[#1B365D] mb-4 flex items-center">
                  <CheckCircle className="w-5 h-5 mr-2" /> Summary
                </h2>
                <div className="grid grid-cols-2 gap-6">
                  <div className="bg-[#F5F7FA] p-4 rounded-lg shadow-sm transition-all hover:shadow-md">
                    <p className="text-[#1B365D] font-medium text-sm">Total Issues Reported</p>
                    <p className="text-3xl font-bold text-[#1B365D]">{totalIssues}</p>
                  </div>
                  <div className="bg-[#F5F7FA] p-4 rounded-lg shadow-sm transition-all hover:shadow-md">
                    <p className="text-[#1B365D] font-medium text-sm">Status Breakdown</p>
                    <p className="text-[#1B365D] text-lg">Pending: <span className="font-semibold">{statusBreakdown.Pending}</span></p>
                    <p className="text-[#1B365D] text-lg">Resolved: <span className="font-semibold">{statusBreakdown.Resolved}</span></p>
                  </div>
                  <div className="bg-[#F5F7FA] p-4 rounded-lg shadow-sm col-span-2 transition-all hover:shadow-md">
                    <p className="text-[#1B365D] font-medium text-sm">Urgency Breakdown</p>
                    <div className="grid grid-cols-3 gap-2">
                      <p className="text-[#1B365D] text-lg">Urgent: <span className="font-semibold">{urgencyBreakdown.Urgent}</span></p>
                      <p className="text-[#1B365D] text-lg">Medium: <span className="font-semibold">{urgencyBreakdown.Medium}</span></p>
                      <p className="text-[#1B365D] text-lg">Low: <span className="font-semibold">{urgencyBreakdown.Low}</span></p>
                    </div>
                  </div>
                </div>
              </section>

              <section className="mb-8 bg-white p-6 rounded-lg shadow-md border border-[#EDEFF2]">
                <h2 className="text-xl font-semibold text-[#1B365D] mb-4 flex items-center">
                  <BarChart2 className="w-5 h-5 mr-2" /> Issues Distribution Chart
                </h2>
                <div className="h-[500px] w-full chart-container">
                  <Bar data={getChartData()} options={chartOptions} />
                </div>
              </section>

              <section className="mb-8 bg-white p-6 rounded-lg shadow-md border border-[#EDEFF2]">
                <h2 className="text-xl font-semibold text-[#1B365D] mb-4 flex items-center">
                  <AlertCircle className="w-5 h-5 mr-2" /> Detailed Issues List
                </h2>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-[#1B365D] text-[#FFFFFF]">
                        <th className="p-3 text-left text-sm font-semibold">Room ID</th>
                        <th className="p-3 text-left text-sm font-semibold">Facility Type</th>
                        <th className="p-3 text-left text-sm font-semibold">Department</th>
                        <th className="p-3 text-left text-sm font-semibold">Issues</th>
                        <th className="p-3 text-left text-sm font-semibold">Urgency</th>
                        <th className="p-3 text-left text-sm font-semibold">Status</th>
                        <th className="p-3 text-left text-sm font-semibold">Reported Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredIssues.map((issue, index) => {
                        const { issues: issueItems, otherDescription } = formatIssues(issue.issues, issue.description);
                        return (
                          <tr
                            key={issue._id}
                            className={`border-b border-[#EDEFF2] transition-colors duration-200 ${index % 2 === 0 ? "bg-[#F5F7FA]" : "bg-white"} hover:bg-[#EDEFF2]`}
                          >
                            <td className="p-3 text-[#1B365D]">{issue.roomId}</td>
                            <td className="p-3 text-[#1B365D]">{issue.facilityType}</td>
                            <td className="p-3 text-[#1B365D]">{issue.department}</td>
                            <td className="p-3 text-[#1B365D]">
                              {issueItems.length > 0 ? issueItems.join(", ") : "Other: " + otherDescription}
                            </td>
                            <td className="p-3 text-[#1B365D]">{issue.urgency}</td>
                            <td className="p-3 text-[#1B365D]">{issue.status}</td>
                            <td className="p-3 text-[#1B365D]">{new Date(issue.reportedDate).toLocaleDateString()}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </section>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}