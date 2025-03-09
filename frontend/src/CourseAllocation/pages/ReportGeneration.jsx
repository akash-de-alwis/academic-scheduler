import React, { useState, useEffect } from "react";
import axios from "axios";
import { FileText, Download } from "lucide-react";
import { useNavigate } from "react-router-dom";
import jsPDF from "jspdf";

const ReportGeneration = () => {
  const [subjects, setSubjects] = useState([]);
  const [filteredSubjects, setFilteredSubjects] = useState([]);
  const [departmentFilter, setDepartmentFilter] = useState("All");
  const [yearFilter, setYearFilter] = useState("All");
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/subjects")
      .then((res) => {
        setSubjects(res.data);
        setFilteredSubjects(res.data);
      })
      .catch((err) => {
        console.error("Error fetching subjects:", err);
        setError("Failed to load subjects. Please try again.");
      });
  }, []);

  useEffect(() => {
    let filtered = [...subjects];
    if (departmentFilter !== "All") {
      filtered = filtered.filter((subject) => subject.department === departmentFilter);
    }
    if (yearFilter !== "All") {
      filtered = filtered.filter((subject) => subject.year === yearFilter);
    }
    setFilteredSubjects(filtered);
  }, [departmentFilter, yearFilter, subjects]);

  const generateReport = () => {
    try {
      const doc = new jsPDF();

      // Creative Header with Gradient
      doc.setFillColor(27, 54, 93); // #1B365D base
      doc.rect(0, 0, 210, 40, "F");
      doc.setFillColor(50, 80, 120); // Lighter gradient shade
      doc.triangle(0, 0, 210, 0, 105, 40, "F"); // Gradient effect
      doc.setFontSize(22);
      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.text("Subject Insights", 14, 25);
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text(`Date: ${new Date().toLocaleDateString()}`, 170, 25);

      // Filter Info with Accent
      doc.setFontSize(12);
      doc.setTextColor(27, 54, 93);
      doc.text("Filters Applied:", 14, 50);
      doc.setFillColor(27, 54, 93);
      doc.circle(10, 48, 2, "F"); // Small accent circle
      doc.text(`Dept: ${departmentFilter === "All" ? "All Departments" : departmentFilter}`, 14, 60);
      doc.text(`Year: ${yearFilter === "All" ? "All Years" : yearFilter}`, 14, 70);
      doc.setLineWidth(0.5);
      doc.setDrawColor(27, 54, 93);
      doc.line(14, 75, 70, 75); // Short underline

      // Card Generation
      let yPosition = 85;
      const cardWidth = 182;
      const cardHeight = 80;
      const marginLeft = 14;

      if (filteredSubjects.length > 0) {
        filteredSubjects.forEach((subject, index) => {
          if (yPosition + cardHeight > 270) {
            doc.addPage();
            yPosition = 20;
          }

          // Card Background with Shadow Effect
          doc.setFillColor(245, 247, 250); // #F5F7FA
          doc.roundedRect(marginLeft, yPosition, cardWidth, cardHeight, 5, 5, "F");
          doc.setFillColor(200, 200, 200); // Shadow
          doc.roundedRect(marginLeft + 2, yPosition + 2, cardWidth, cardHeight, 5, 5, "F");
          doc.setFillColor(245, 247, 250);
          doc.roundedRect(marginLeft, yPosition, cardWidth, cardHeight, 5, 5, "F");

          // Card Accent Bar
          doc.setFillColor(27, 54, 93);
          doc.rect(marginLeft, yPosition, 5, cardHeight, "F");

          // Card Content
          doc.setFontSize(14);
          doc.setTextColor(27, 54, 93);
          doc.setFont("helvetica", "bold");
          doc.text(`${subject.subjectName || "N/A"}`, marginLeft + 10, yPosition + 20);
          doc.setFontSize(10);
          doc.setFont("helvetica", "normal");
          doc.text(`ID: ${subject.subjectID || "N/A"}`, marginLeft + 10, yPosition + 35);
          doc.text(`Credit: ${subject.credit || "N/A"}`, marginLeft + 10, yPosition + 45);
          doc.text(`Time: ${subject.timeDuration || "N/A"} hr`, marginLeft + 10, yPosition + 55);
          doc.text(`Dept: ${subject.department || "N/A"}`, marginLeft + 90, yPosition + 35);
          doc.text(`Year: ${subject.year || "N/A"}`, marginLeft + 90, yPosition + 45);

          // Decorative Circle
          doc.setFillColor(27, 54, 93);
          doc.circle(marginLeft + cardWidth - 10, yPosition + 10, 3, "F");

          yPosition += cardHeight + 15;
        });

        // Summary Section
        if (yPosition + 40 > 270) {
          doc.addPage();
          yPosition = 20;
        }
        doc.setFillColor(27, 54, 93);
        doc.roundedRect(marginLeft, yPosition, cardWidth, 40, 5, 5, "F");
        doc.setFontSize(14);
        doc.setTextColor(255, 255, 255);
        doc.text("Summary", marginLeft + 10, yPosition + 15);
        doc.setFontSize(10);
        doc.text(`Total Subjects: ${filteredSubjects.length}`, marginLeft + 10, yPosition + 30);
        doc.text(
          `Avg Credits: ${(filteredSubjects.reduce((sum, s) => sum + (parseFloat(s.credit) || 0), 0) / filteredSubjects.length || 0).toFixed(1)}`,
          marginLeft + 90, yPosition + 30
        );

        // Footer
        const pageCount = doc.internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
          doc.setPage(i);
          doc.setFontSize(10);
          doc.setTextColor(100);
          doc.text(`Page ${i} of ${pageCount}`, 180, 287);
          doc.setFillColor(27, 54, 93);
          doc.rect(0, 290, 210, 7, "F");
          doc.setTextColor(255, 255, 255);
          doc.text("Subject Management System", 14, 294);
        }
      } else {
        doc.setFontSize(12);
        doc.setTextColor(27, 54, 93);
        doc.text("No subjects found for the selected filters", 14, 85);
      }

      doc.save(`Subject_Report_${new Date().toISOString().slice(0,10)}.pdf`);
    } catch (err) {
      console.error("Error generating PDF:", err);
      setError("Failed to generate PDF. Please check console for details.");
    }
  };

  return (
    <div className="bg-[#FFFFFF] min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-[#1B365D]">Report Generation</h1>
          <p className="text-gray-600">Generate and download subject reports based on filters</p>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg shadow-sm mb-6">
            {error}
          </div>
        )}

        {/* Filter Section */}
        <div className="bg-[#F5F7FA] rounded-lg shadow-sm p-6 mb-10">
          <h2 className="text-xl font-bold text-[#1B365D] mb-6">Filters</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2 text-[#1B365D]">Department</label>
              <select
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
                className="w-full p-2 border border-[#F5F7FA] rounded-lg bg-[#FFFFFF] text-[#1B365D] focus:ring-2 focus:ring-[#1B365D] focus:outline-none"
              >
                <option value="All">All Departments</option>
                <option value="Faculty of Computing">Faculty of Computing</option>
                <option value="Faculty of Engineering">Faculty of Engineering</option>
                <option value="Faculty of Business Studies">Faculty of Business Studies</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-[#1B365D]">Year</label>
              <select
                value={yearFilter}
                onChange={(e) => setYearFilter(e.target.value)}
                className="w-full p-2 border border-[#F5F7FA] rounded-lg bg-[#FFFFFF] text-[#1B365D] focus:ring-2 focus:ring-[#1B365D] focus:outline-none"
              >
                <option value="All">All Years</option>
                <option value="1 Year">1 Year</option>
                <option value="2 Year">2 Year</option>
                <option value="3 Year">3 Year</option>
                <option value="4 Year">4 Year</option>
              </select>
            </div>
          </div>
        </div>

        {/* Preview Table */}
        <div className="bg-[#F5F7FA] rounded-lg shadow-sm mb-10">
          <h2 className="text-xl font-bold text-[#1B365D] p-6">Report Preview</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#FFFFFF]">
                  <th className="text-left p-4 font-medium text-[#1B365D]">Subject Name</th>
                  <th className="text-left p-4 font-medium text-[#1B365D]">Subject ID</th>
                  <th className="text-left p-4 font-medium text-[#1B365D]">Credit</th>
                  <th className="text-left p-4 font-medium text-[#1B365D]">Time (hr)</th>
                  <th className="text-left p-4 font-medium text-[#1B365D]">Department</th>
                  <th className="text-left p-4 font-medium text-[#1B365D]">Year</th>
                </tr>
              </thead>
              <tbody>
                {filteredSubjects.length > 0 ? (
                  filteredSubjects.map((subject) => (
                    <tr key={subject._id} className="border-b border-[#FFFFFF] hover:bg-[#1B365D]/10">
                      <td className="p-4 text-[#1B365D]">{subject.subjectName || "N/A"}</td>
                      <td className="p-4 text-[#1B365D]">{subject.subjectID || "N/A"}</td>
                      <td className="p-4 text-[#1B365D]">{subject.credit || "N/A"}</td>
                      <td className="p-4 text-[#1B365D]">{subject.timeDuration || "N/A"}</td>
                      <td className="p-4 text-[#1B365D]">{subject.department || "N/A"}</td>
                      <td className="p-4 text-[#1B365D]">{subject.year || "N/A"}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="p-4 text-center text-[#1B365D]">
                      No subjects found for the selected filters
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Generate Button */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-start-3">
            <button
              onClick={generateReport}
              disabled={filteredSubjects.length === 0}
              className={`w-full bg-[#1B365D] text-white py-4 px-6 rounded-lg flex items-center justify-center space-x-2 hover:bg-opacity-90 transition
                ${filteredSubjects.length === 0 ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              <Download size={20} />
              <span>Generate & Download PDF Report</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportGeneration;

export { ReportGeneration };