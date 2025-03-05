import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";

export default function AllocationReport() {
  const [allocations, setAllocations] = useState([]);
  const [batches, setBatches] = useState([]);
  const [lecturers, setLecturers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const reportRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [allocationsRes, batchesRes, lecturersRes] = await Promise.all([
          axios.get("http://localhost:5000/api/allocations"),
          axios.get("http://localhost:5000/api/batches"),
          axios.get("http://localhost:5000/api/lecturers"),
        ]);
        setAllocations(allocationsRes.data);
        setBatches(batchesRes.data);
        setLecturers(lecturersRes.data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load report data");
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const downloadPDF = () => {
    const input = reportRef.current;
    html2canvas(input, { scale: 2, useCORS: true }).then((canvas) => {
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgProps = pdf.getImageProperties(imgData);
      const imgHeight = (imgProps.height * pdfWidth) / imgProps.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, "PNG", 0, position, pdfWidth, imgHeight);
      heightLeft -= pdfHeight;

      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, pdfWidth, imgHeight);
        heightLeft -= pdfHeight;
      }

      pdf.save("Allocation_Report.pdf");
    }).catch((err) => {
      console.error("Error generating PDF:", err);
      alert("Failed to generate PDF due to a rendering issue. Please try again.");
    });
  };

  const getBatchDetails = (batchId) => {
    return batches.find((batch) => batch.batchNo === batchId) || {};
  };

  const getLecturerDetails = (lecturerId) => {
    return lecturers.find((lecturer) => lecturer.lecturerId === lecturerId) || {};
  };

  if (loading) {
    return (
      <div className="min-h-screen p-8 bg-[#FFFFFF] flex justify-center items-center">
        <p className="text-[#1B365D] text-lg">Loading report data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen p-8 bg-[#FFFFFF] flex justify-center items-center">
        <p className="text-red-500 text-lg">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8 bg-[#FFFFFF]">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold text-[#1B365D]">Allocation Report</h2>
        <button
          onClick={downloadPDF}
          className="bg-[#1B365D] text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-[#2A4A7F]"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 4v12m-6-6l6 6 6-6" />
            <path d="M4 20h16" />
          </svg>
          Download PDF
        </button>
      </div>

      <div ref={reportRef} className="bg-white p-6 rounded-lg shadow-md border border-[#E2E8F0]">
        <h3 className="text-lg font-semibold text-[#1B365D] mb-4">Resource Allocation Summary</h3>
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-[#1B365D] text-white">
              <th className="p-2 text-left border border-[#FFFFFF]">Allocation ID</th>
              <th className="p-2 text-left border border-[#FFFFFF]">Batch Name</th>
              <th className="p-2 text-left border border-[#FFFFFF]">Batch Details</th>
              <th className="p-2 text-left border border-[#FFFFFF]">Subjects</th>
              <th className="p-2 text-left border border-[#FFFFFF]">Lecturer</th>
              <th className="p-2 text-left border border-[#FFFFFF]">Lecturer Skills</th>
            </tr>
          </thead>
          <tbody>
            {allocations.map((allocation) => {
              const batch = getBatchDetails(allocation.batchId);
              const lecturer = getLecturerDetails(allocation.lecturerId);

              return (
                <tr key={allocation._id} className="border-b border-[#E2E8F0]">
                  <td className="p-2 text-[#1B365D]">{allocation.allocationId}</td>
                  <td className="p-2 text-[#1B365D]">{allocation.batchName}</td>
                  <td className="p-2 text-[#1B365D]">
                    <div>ID: {allocation.batchId}</div>
                    <div>Intake: {batch.intake}</div>
                    <div>Dept: {batch.department}</div>
                    <div>Students: {batch.studentCount}</div>
                    <div>Semester: {batch.semester}</div>
                    <div>Schedule: {batch.scheduleType}</div>
                  </td>
                  <td className="p-2 text-[#1B365D]">
                    {allocation.subjects.map((subject, index) => (
                      <div key={index}>
                        {subject.subjectName} ({subject.subjectId})
                      </div>
                    ))}
                  </td>
                  <td className="p-2 text-[#1B365D]">
                    {allocation.lecturerName} ({allocation.lecturerId})
                  </td>
                  <td className="p-2 text-[#1B365D]">
                    {lecturer.skills && lecturer.skills.length > 0
                      ? lecturer.skills.join(", ")
                      : "N/A"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {allocations.length === 0 && (
          <p className="text-center text-[#6B7280] mt-4">No allocations found.</p>
        )}
      </div>

      <div className="mt-6 text-[#6B7280] text-sm">
        Generated on: {new Date().toLocaleString()}
      </div>
    </div>
  );
}