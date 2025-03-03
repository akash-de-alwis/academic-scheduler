import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

export default function PrintableReports() {
    const [lecturers, setLecturers] = useState([]);
    const [allocations, setAllocations] = useState([]);
    const [workloadData, setWorkloadData] = useState([]);
    const [reportType, setReportType] = useState('department');
    const [selectedDepartment, setSelectedDepartment] = useState('');
    const [selectedLecturer, setSelectedLecturer] = useState('');
    const [departments, setDepartments] = useState([]);
    const [reportData, setReportData] = useState(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);
    const [loading, setLoading] = useState(true);
    const [maxAllowedCourses] = useState(5);
    
    const reportRef = useRef(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const lecturersRes = await axios.get('http://localhost:5000/api/lecturers');
                const allocationsRes = await axios.get('http://localhost:5000/api/allocations');
                
                setLecturers(lecturersRes.data);
                setAllocations(allocationsRes.data);
                
                const processedData = processWorkloadData(lecturersRes.data, allocationsRes.data);
                setWorkloadData(processedData);
                
                const uniqueDepartments = [...new Set(lecturersRes.data.map(lecturer => lecturer.department))];
                setDepartments(uniqueDepartments);
                
                if (uniqueDepartments.length > 0) {
                    setSelectedDepartment(uniqueDepartments[0]);
                }
                
                setLoading(false);
            } catch (err) {
                console.error("Error fetching data:", err);
                setLoading(false);
            }
        };
        
        fetchData();
    }, []);

    const processWorkloadData = (lecturersData, allocationsData) => {
        return lecturersData.map(lecturer => {
            const lecturerAllocations = allocationsData.filter(
                allocation => allocation.lecturerId === lecturer.lecturerId
            );
            
            // Updated to handle multiple subjects per allocation
            const assignedCourses = lecturerAllocations.flatMap(allocation => 
                allocation.subjects.map(subject => ({
                    subjectId: subject.subjectId,
                    subjectName: subject.subjectName,
                    batchName: allocation.batchName
                }))
            );
            
            const workloadPercentage = (assignedCourses.length / maxAllowedCourses) * 100;
            
            return {
                _id: lecturer._id,
                name: lecturer.name,
                lecturerId: lecturer.lecturerId,
                department: lecturer.department,
                scheduleType: lecturer.scheduleType,
                assignedCourses,
                courseCount: assignedCourses.length,
                workloadPercentage: workloadPercentage > 100 ? 100 : workloadPercentage
            };
        });
    };

    const generateReport = () => {
        setIsGenerating(true);
        
        try {
            if (reportType === 'department') {
                const departmentLecturers = workloadData.filter(
                    lecturer => lecturer.department === selectedDepartment
                );
                
                const totalCourses = departmentLecturers.reduce(
                    (sum, lecturer) => sum + lecturer.assignedCourses.length, 0
                );
                
                const averageWorkload = departmentLecturers.length > 0 
                    ? departmentLecturers.reduce((sum, lecturer) => sum + lecturer.workloadPercentage, 0) / departmentLecturers.length 
                    : 0;
                
                const overloadedLecturers = departmentLecturers.filter(
                    lecturer => lecturer.courseCount > maxAllowedCourses
                ).length;
                
                setReportData({
                    type: 'department',
                    title: `Department Workload Report: ${selectedDepartment}`,
                    date: new Date().toLocaleDateString(),
                    summary: {
                        totalLecturers: departmentLecturers.length,
                        totalCourses,
                        averageWorkload: averageWorkload.toFixed(1),
                        overloadedLecturers
                    },
                    lecturers: departmentLecturers
                });
            } else {
                const lecturer = workloadData.find(l => l.lecturerId === selectedLecturer);
                
                if (lecturer) {
                    setReportData({
                        type: 'individual',
                        title: `Individual Workload Report: ${lecturer.name}`,
                        date: new Date().toLocaleDateString(),
                        lecturer
                    });
                }
            }
        } catch (err) {
            console.error("Error generating report:", err);
        } finally {
            setIsGenerating(false);
        }
    };

    const handleDownloadPDF = async () => {
        if (!reportRef.current) return;
        
        setIsDownloading(true);
        
        try {
            const fileName = reportData.title.replace(/[^a-z0-9]/gi, '_').toLowerCase() + '.pdf';
            const pdf = new jsPDF('p', 'mm', 'a4');
            const content = reportRef.current;
            
            const canvas = await html2canvas(content, {
                scale: 2,
                useCORS: true,
                logging: false,
                letterRendering: true,
            });
            
            const imgWidth = 210;
            const pageHeight = 295;
            const imgHeight = (canvas.height * imgWidth) / canvas.width;
            
            const imgData = canvas.toDataURL('image/png');
            pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
            
            let heightLeft = imgHeight;
            let position = 0;
            
            heightLeft -= pageHeight;
            
            while (heightLeft > 0) {
                position = heightLeft - imgHeight;
                pdf.addPage();
                pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
                heightLeft -= pageHeight;
            }
            
            pdf.save(fileName);
        } catch (error) {
            console.error("Error generating PDF:", error);
            alert("There was an error generating the PDF. Please try again.");
        } finally {
            setIsDownloading(false);
        }
    };

    const renderWorkloadBar = (percentage) => {
        const getColor = (percent) => {
            if (percent < 40) return '#10B981';
            if (percent < 60) return '#3B82F6';
            if (percent < 80) return '#F59E0B';
            if (percent < 100) return '#F97316';
            return '#EF4444';
        };
        
        return (
            <div className="print-workload-bar">
                <div className="print-workload-track">
                    <div 
                        className="print-workload-progress"
                        style={{ 
                            width: `${percentage}%`, 
                            backgroundColor: getColor(percentage)
                        }}
                    ></div>
                </div>
                <div className="print-workload-percent">{percentage.toFixed(1)}%</div>
            </div>
        );
    };

    return (
        <div className="min-h-screen p-8">
            <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-bold text-[#1B365D]">Workload Reports</h2>
                <div className="flex gap-3">
                    <button
                        onClick={() => window.location.href = '/'}
                        className="bg-[#1B365D] text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-opacity-90 transition-all"
                    >
                        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                        </svg>
                        Back to Dashboard
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center items-center p-12 bg-white rounded-xl shadow-md">
                    <svg className="animate-spin h-8 w-8 text-[#1B365D]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span className="ml-3 text-[#1B365D]">Loading data...</span>
                </div>
            ) : (
                <div className="bg-white rounded-xl shadow-md p-6 mb-8">
                    <h3 className="text-xl font-bold text-[#1B365D] mb-6">Generate Printable Reports</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Report Type</label>
                            <select
                                value={reportType}
                                onChange={(e) => {
                                    setReportType(e.target.value);
                                    setReportData(null);
                                }}
                                className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-[#1B365D] focus:border-[#1B365D]"
                            >
                                <option value="department">Department Summary</option>
                                <option value="individual">Individual Lecturer</option>
                            </select>
                        </div>
                        
                        {reportType === 'department' ? (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Select Department</label>
                                <select
                                    value={selectedDepartment}
                                    onChange={(e) => setSelectedDepartment(e.target.value)}
                                    className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-[#1B365D] focus:border-[#1B365D]"
                                >
                                    {departments.map((dept) => (
                                        <option key={dept} value={dept}>{dept}</option>
                                    ))}
                                </select>
                            </div>
                        ) : (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Select Lecturer</label>
                                <select
                                    value={selectedLecturer}
                                    onChange={(e) => setSelectedLecturer(e.target.value)}
                                    className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-[#1B365D] focus:border-[#1B365D]"
                                >
                                    <option value="">-- Select Lecturer --</option>
                                    {lecturers.map((lecturer) => (
                                        <option key={lecturer.lecturerId} value={lecturer.lecturerId}>
                                            {lecturer.name} ({lecturer.lecturerId})
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}
                        
                        <div className="flex items-end">
                            <button
                                onClick={generateReport}
                                disabled={isGenerating || (reportType === 'individual' && !selectedLecturer)}
                                className="bg-[#1B365D] text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-opacity-90 transition-all disabled:bg-gray-300 disabled:cursor-not-allowed"
                            >
                                {isGenerating ? (
                                    <>
                                        <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        <span>Generating...</span>
                                    </>
                                ) : (
                                    <>
                                        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                        <span>Generate Report</span>
                                    </>
                                )}
                            </button>
                        </div>
                        
                        {reportData && (
                            <div className="flex items-end">
                                <button
                                    onClick={handleDownloadPDF}
                                    disabled={isDownloading}
                                    className="bg-[#1B365D] text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-opacity-90 transition-all disabled:bg-opacity-70 disabled:cursor-not-allowed"
                                >
                                    {isDownloading ? (
                                        <>
                                            <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            <span>Downloading...</span>
                                        </>
                                    ) : (
                                        <>
                                            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                            </svg>
                                            <span>Download PDF</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        )}
                    </div>
                    
                    {reportData && (
                        <div className="mt-8 border rounded-xl overflow-hidden shadow-lg">
                            <h4 className="bg-[#1B365D] text-white p-3 font-semibold">Report Preview</h4>
                            <div className="p-4 max-h-[600px] overflow-y-auto">
                                <div ref={reportRef} className="p-8 bg-white">
                                    <div className="print-header">
                                        <div className="print-logo">
                                            <svg width="60" height="60" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="#1B365D"/>
                                                <path d="M2 17L12 22L22 17" stroke="#1B365D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                                <path d="M2 12L12 17L22 12" stroke="#1B365D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                            </svg>
                                        </div>
                                        <div>
                                            <h1 className="print-title">{reportData.title}</h1>
                                            <p className="print-subtitle">University Workload Management System</p>
                                        </div>
                                    </div>
                                    
                                    <div className="print-date">
                                        Generated on: <span>{reportData.date}</span>
                                    </div>
                                    
                                    {reportData.type === 'department' && (
                                        <>
                                            <div className="print-summary">
                                                <div className="print-summary-item">
                                                    <div className="print-summary-label">Total Lecturers</div>
                                                    <div className="print-summary-value">{reportData.summary.totalLecturers}</div>
                                                </div>
                                                <div className="print-summary-item">
                                                    <div className="print-summary-label">Total Courses Allocated</div>
                                                    <div className="print-summary-value">{reportData.summary.totalCourses}</div>
                                                </div>
                                                <div className="print-summary-item">
                                                    <div className="print-summary-label">Average Workload</div>
                                                    <div className="print-summary-value">{reportData.summary.averageWorkload}%</div>
                                                </div>
                                                <div className="print-summary-item">
                                                    <div className="print-summary-label">Overloaded Lecturers</div>
                                                    <div className="print-summary-value">{reportData.summary.overloadedLecturers}</div>
                                                </div>
                                            </div>
                                            
                                            <h2 className="print-section-title">Lecturer Details</h2>
                                            
                                            <table className="print-table">
                                                <thead>
                                                    <tr>
                                                        <th>Lecturer</th>
                                                        <th>ID</th>
                                                        <th>Schedule Type</th>
                                                        <th>Courses</th>
                                                        <th>Workload</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {reportData.lecturers.sort((a, b) => b.workloadPercentage - a.workloadPercentage).map((lecturer) => (
                                                        <tr key={lecturer.lecturerId}>
                                                            <td>{lecturer.name}</td>
                                                            <td>{lecturer.lecturerId}</td>
                                                            <td>{lecturer.scheduleType}</td>
                                                            <td>{lecturer.courseCount}</td>
                                                            <td>{renderWorkloadBar(lecturer.workloadPercentage)}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </>
                                    )}
                                    
                                    {reportData.type === 'individual' && (
                                        <>
                                            <div className="print-individual-container">
                                                <div className="print-individual-info">
                                                    <h2 className="print-section-title">Lecturer Information</h2>
                                                    <table className="print-table">
                                                        <tbody>
                                                            <tr>
                                                                <td className="print-table-label">Name</td>
                                                                <td>{reportData.lecturer.name}</td>
                                                            </tr>
                                                            <tr>
                                                                <td className="print-table-label">ID</td>
                                                                <td>{reportData.lecturer.lecturerId}</td>
                                                            </tr>
                                                            <tr>
                                                                <td className="print-table-label">Department</td>
                                                                <td>{reportData.lecturer.department}</td>
                                                            </tr>
                                                            <tr>
                                                                <td className="print-table-label">Schedule Type</td>
                                                                <td>{reportData.lecturer.scheduleType}</td>
                                                            </tr>
                                                        </tbody>
                                                    </table>
                                                </div>
                                                
                                                <div className="print-individual-summary">
                                                    <h2 className="print-section-title">Workload Summary</h2>
                                                    <div className="print-workload-summary">
                                                        <p><span>Courses Assigned:</span> {reportData.lecturer.courseCount} / {maxAllowedCourses}</p>
                                                        <p><span>Workload Percentage:</span> {reportData.lecturer.workloadPercentage.toFixed(1)}%</p>
                                                        <p><span>Status:</span> {
                                                            reportData.lecturer.courseCount === 0 ? 'No Courses' :
                                                            reportData.lecturer.courseCount === maxAllowedCourses ? 'Full Workload' :
                                                            reportData.lecturer.courseCount > maxAllowedCourses ? 'Overloaded' :
                                                            `${reportData.lecturer.courseCount}/${maxAllowedCourses} Courses`
                                                        }</p>
                                                        <div className="print-workload-visualization">
                                                            {renderWorkloadBar(reportData.lecturer.workloadPercentage)}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            <h2 className="print-section-title">Assigned Courses</h2>
                                            
                                            {reportData.lecturer.assignedCourses.length === 0 ? (
                                                <p className="print-no-courses">No courses currently assigned to this lecturer.</p>
                                            ) : (
                                                <table className="print-table">
                                                    <thead>
                                                        <tr>
                                                            <th>#</th>
                                                            <th>Subject ID</th>
                                                            <th>Subject Name</th>
                                                            <th>Batch</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {reportData.lecturer.assignedCourses.map((course, index) => (
                                                            <tr key={index}>
                                                                <td>{index + 1}</td>
                                                                <td>{course.subjectId}</td>
                                                                <td>{course.subjectName}</td>
                                                                <td>{course.batchName}</td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            )}
                                            
                                            <div className="print-footer">
                                                <p>
                                                    This report is automatically generated and provides a summary of the current workload 
                                                    status for {reportData.lecturer.name}. Please contact the Academic Affairs Office 
                                                    for any inquiries regarding course allocations.
                                                </p>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                    
                    <style type="text/css">
                    {`
                    .print-header {
                        display: flex;
                        align-items: center;
                        margin-bottom: 30px;
                        border-bottom: 3px solid #1B365D;
                        padding-bottom: 15px;
                    }
                    
                    .print-logo {
                        margin-right: 20px;
                    }
                    
                    .print-title {
                        color: #1B365D;
                        font-size: 24px;
                        font-weight: bold;
                        margin: 0 0 5px 0;
                    }
                    
                    .print-subtitle {
                        color: #4B5563;
                        font-size: 16px;
                        margin: 0;
                    }
                    
                    .print-date {
                        text-align: right;
                        color: #6B7280;
                        font-size: 14px;
                        margin-bottom: 30px;
                        font-style: italic;
                    }
                    
                    .print-date span {
                        font-weight: 500;
                        color: #4B5563;
                    }
                    
                    .print-section-title {
                        color: #1B365D;
                        font-size: 18px;
                        font-weight: bold;
                        margin: 25px 0 15px 0;
                        padding-bottom: 5px;
                        border-bottom: 1px solid #E5E7EB;
                    }
                    
                    .print-summary {
                        display: grid;
                        grid-template-columns: repeat(2, 1fr);
                        gap: 15px;
                        margin-bottom: 30px;
                    }
                    
                    .print-summary-item {
                        padding: 15px;
                        background-color: #F9FAFB;
                        border-radius: 8px;
                        border-left: 4px solid #1B365D;
                        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
                    }
                    
                    .print-summary-label {
                        font-size: 14px;
                        color: #6B7280;
                        margin-bottom: 5px;
                    }
                    
                    .print-summary-value {
                        font-size: 24px;
                        font-weight: bold;
                        color: #1B365D;
                    }
                    
                    .print-table {
                        width: 100%;
                        border-collapse: collapse;
                        margin-bottom: 25px;
                        border-radius: 8px;
                        overflow: hidden;
                        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
                    }
                    
                    .print-table th {
                        background-color: #F3F4F6;
                        text-align: left;
                        padding: 12px;
                        font-weight: 600;
                        color: #374151;
                        border: 1px solid #E5E7EB;
                    }
                    
                    .print-table td {
                        padding: 12px;
                        border: 1px solid #E5E7EB;
                        color: #4B5563;
                    }
                    
                    .print-table-label {
                        font-weight: 600;
                        background-color: #F9FAFB;
                        color: #374151;
                    }
                    
                    .print-workload-bar {
                        display: flex;
                        align-items: center;
                        gap: 10px;
                    }
                    
                    .print-workload-track {
                        height: 12px;
                        width: 100%;
                        background-color: #F3F4F6;
                        border-radius: 6px;
                        overflow: hidden;
                        box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.1);
                    }
                    
                    .print-workload-progress {
                        height: 100%;
                        border-radius: 6px;
                        transition: width 0.5s ease;
                    }
                    
                    .print-workload-percent {
                        min-width: 50px;
                        font-weight: bold;
                    }
                    
                    .print-no-courses {
                        color: #6B7280;
                        font-style: italic;
                        padding: 12px;
                    }
                    
                    .print-footer {
                        margin-top: 25px;
                        padding-top: 15px;
                        border-top: 1px solid #E5E7EB;
                        color: #6B7280;
                        font-size: 12px;
                    }
                    `}
                    </style>
                </div>
            )}
        </div>
    );
}