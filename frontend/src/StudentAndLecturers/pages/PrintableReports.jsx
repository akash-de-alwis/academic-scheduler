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
    const [selectedScheduleType, setSelectedScheduleType] = useState('');
    const [departments, setDepartments] = useState([]);
    const [scheduleTypes, setScheduleTypes] = useState([]);
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
                const [lecturersRes, allocationsRes] = await Promise.all([
                    axios.get('http://localhost:5000/api/lecturers'),
                    axios.get('http://localhost:5000/api/allocations'),
                ]);
                
                setLecturers(lecturersRes.data);
                setAllocations(allocationsRes.data);
                
                const processedData = processWorkloadData(lecturersRes.data, allocationsRes.data);
                setWorkloadData(processedData);
                
                const uniqueDepartments = [...new Set(lecturersRes.data.map(l => l.department))];
                const uniqueScheduleTypes = [...new Set(lecturersRes.data.map(l => l.scheduleType))];
                setDepartments(uniqueDepartments);
                setScheduleTypes(uniqueScheduleTypes);
                
                if (uniqueDepartments.length > 0) setSelectedDepartment(uniqueDepartments[0]);
                if (uniqueScheduleTypes.length > 0) setSelectedScheduleType(uniqueScheduleTypes[0]);
                
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
            const assignedCourses = allocationsData
                .flatMap(allocation => 
                    allocation.subjects
                        .filter(subject => subject.lecturerId === lecturer.lecturerId)
                        .map(subject => ({
                            subjectId: subject.subjectId,
                            subjectName: subject.subjectName,
                            batchName: allocation.batchName,
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
                workloadPercentage: workloadPercentage > 100 ? 100 : workloadPercentage,
            };
        });
    };

    const generateReport = () => {
        setIsGenerating(true);
        
        try {
            if (reportType === 'department') {
                const departmentLecturers = workloadData.filter(
                    l => l.department === selectedDepartment
                );
                
                const totalCourses = departmentLecturers.reduce((sum, l) => sum + l.courseCount, 0);
                const averageWorkload = departmentLecturers.length > 0 
                    ? departmentLecturers.reduce((sum, l) => sum + l.workloadPercentage, 0) / departmentLecturers.length 
                    : 0;
                const overloadedLecturers = departmentLecturers.filter(l => l.courseCount > maxAllowedCourses).length;
                
                setReportData({
                    type: 'department',
                    title: `Department Workload Report: ${selectedDepartment}`,
                    date: new Date().toLocaleDateString(),
                    summary: {
                        totalLecturers: departmentLecturers.length,
                        totalCourses,
                        averageWorkload: averageWorkload.toFixed(1),
                        overloadedLecturers,
                    },
                    lecturers: departmentLecturers,
                });
            } else if (reportType === 'schedule') {
                const scheduleLecturers = workloadData.filter(
                    l => l.scheduleType === selectedScheduleType
                );
                
                const totalCourses = scheduleLecturers.reduce((sum, l) => sum + l.courseCount, 0);
                const averageWorkload = scheduleLecturers.length > 0 
                    ? scheduleLecturers.reduce((sum, l) => sum + l.workloadPercentage, 0) / scheduleLecturers.length 
                    : 0;
                const overloadedLecturers = scheduleLecturers.filter(l => l.courseCount > maxAllowedCourses).length;
                
                setReportData({
                    type: 'schedule',
                    title: `Schedule Type Workload Report: ${selectedScheduleType}`,
                    date: new Date().toLocaleDateString(),
                    summary: {
                        totalLecturers: scheduleLecturers.length,
                        totalCourses,
                        averageWorkload: averageWorkload.toFixed(1),
                        overloadedLecturers,
                    },
                    lecturers: scheduleLecturers,
                });
            } else {
                const lecturer = workloadData.find(l => l.lecturerId === selectedLecturer);
                if (lecturer) {
                    setReportData({
                        type: 'individual',
                        title: `Individual Workload Report: ${lecturer.name}`,
                        date: new Date().toLocaleDateString(),
                        lecturer,
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
            const pdf = new jsPDF('p', 'mm', 'a4');
            const content = reportRef.current;
            const canvas = await html2canvas(content, { scale: 2, useCORS: true });
            const imgWidth = 210;
            const pageHeight = 295;
            const imgHeight = (canvas.height * imgWidth) / canvas.width;
            const imgData = canvas.toDataURL('image/png');
            
            let heightLeft = imgHeight;
            let position = 0;
            
            pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
            heightLeft -= pageHeight;
            
            while (heightLeft > 0) {
                position = heightLeft - imgHeight;
                pdf.addPage();
                pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
                heightLeft -= pageHeight;
            }
            
            pdf.save(`${reportData.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf`);
        } catch (error) {
            console.error("Error generating PDF:", error);
            alert("Error generating PDF. Please try again.");
        } finally {
            setIsDownloading(false);
        }
    };

    const handleDownloadCSV = () => {
        if (!reportData) return;
        
        let csvContent = "data:text/csv;charset=utf-8,";
        
        if (reportType === 'department' || reportType === 'schedule') {
            csvContent += "Lecturer,ID,Department,Schedule Type,Course Count,Workload Percentage,Courses\n";
            reportData.lecturers.forEach(l => {
                const courses = l.assignedCourses.map(c => `${c.subjectName} (${c.subjectId}) - ${c.batchName}`).join('; ');
                csvContent += `${l.name},${l.lecturerId},${l.department},${l.scheduleType},${l.courseCount},${l.workloadPercentage.toFixed(1)}%,"${courses}"\n`;
            });
        } else {
            const l = reportData.lecturer;
            csvContent += "Name,ID,Department,Schedule Type,Course Count,Workload Percentage\n";
            csvContent += `${l.name},${l.lecturerId},${l.department},${l.scheduleType},${l.courseCount},${l.workloadPercentage.toFixed(1)}%\n`;
            csvContent += "\nAssigned Courses\nSubject ID,Subject Name,Batch\n";
            l.assignedCourses.forEach(c => {
                csvContent += `${c.subjectId},${c.subjectName},${c.batchName}\n`;
            });
        }
        
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement('a');
        link.setAttribute('href', encodedUri);
        link.setAttribute('download', `${reportData.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const renderWorkloadBar = (percentage) => {
        const getGradient = (percent) => {
            if (percent < 40) return 'linear-gradient(90deg, #10B981, #34D399)';
            if (percent < 60) return 'linear-gradient(90deg, #3B82F6, #60A5FA)';
            if (percent < 80) return 'linear-gradient(90deg, #F59E0B, #FBBF24)';
            if (percent < 100) return 'linear-gradient(90deg, #F97316, #FB923C)';
            return 'linear-gradient(90deg, #EF4444, #F87171)';
        };
        
        return (
            <div className="print-workload-bar">
                <div className="print-workload-track">
                    <div 
                        className="print-workload-progress"
                        style={{ 
                            width: `${percentage}%`, 
                            background: getGradient(percentage),
                            boxShadow: percentage >= 80 ? '0 0 5px rgba(0, 0, 0, 0.3)' : 'none'
                        }}
                    ></div>
                </div>
                <span className="print-workload-percent">{percentage.toFixed(1)}%</span>
            </div>
        );
    };

    return (
        <div className="min-h-screen p-8">
            <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-bold text-[#1B365D]">Workload Reports</h2>
                <button
                    onClick={() => window.location.href = '/'}
                    className="bg-[#1B365D] text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-[#2A4A7F] transition-all"
                >
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                    Back to Dashboard
                </button>
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
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
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
                                <option value="schedule">Schedule Type Summary</option>
                                <option value="individual">Individual Lecturer</option>
                            </select>
                        </div>
                        
                        {reportType === 'department' && (
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
                        )}
                        
                        {reportType === 'schedule' && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Select Schedule Type</label>
                                <select
                                    value={selectedScheduleType}
                                    onChange={(e) => setSelectedScheduleType(e.target.value)}
                                    className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-[#1B365D] focus:border-[#1B365D]"
                                >
                                    {scheduleTypes.map((type) => (
                                        <option key={type} value={type}>{type}</option>
                                    ))}
                                </select>
                            </div>
                        )}
                        
                        {reportType === 'individual' && (
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
                                className="bg-[#1B365D] text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-[#2A4A7F] transition-all disabled:bg-gray-300 disabled:cursor-not-allowed"
                            >
                                {isGenerating ? (
                                    <>
                                        <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Generating...
                                    </>
                                ) : (
                                    <>
                                        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                        Generate Report
                                    </>
                                )}
                            </button>
                        </div>
                        
                        {reportData && (
                            <>
                                <div className="flex items-end">
                                    <button
                                        onClick={handleDownloadPDF}
                                        disabled={isDownloading}
                                        className="bg-[#1B365D] text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-[#2A4A7F] transition-all disabled:bg-gray-300 disabled:cursor-not-allowed"
                                    >
                                        {isDownloading ? (
                                            <>
                                                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                Downloading...
                                            </>
                                        ) : (
                                            <>
                                                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <path d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                </svg>
                                                Download PDF
                                            </>
                                        )}
                                    </button>
                                </div>
                                <div className="flex items-end">
                                    <button
                                        onClick={handleDownloadCSV}
                                        className="bg-[#4CAF50] text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-[#45A049] transition-all"
                                    >
                                        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                        Download CSV
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                    
                    {reportData && (
                        <div className="mt-8 border rounded-xl overflow-hidden shadow-lg">
                            <h4 className="bg-[#1B365D] text-white p-3 font-semibold">Report Preview</h4>
                            <div className="p-4 max-h-[600px] overflow-y-auto">
                                <div ref={reportRef} className="p-6 bg-white">
                                    <div className="print-header">
                                        <div className="print-logo">
                                            <svg width="50" height="50" viewBox="0 0 24 24" fill="none" stroke="#1B365D" strokeWidth="2">
                                                <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="#1B365D"/>
                                                <path d="M2 17L12 22L22 17" stroke="#1B365D"/>
                                                <path d="M2 12L12 17L22 12" stroke="#1B365D"/>
                                            </svg>
                                        </div>
                                        <div>
                                            <h1 className="print-title">{reportData.title}</h1>
                                            <p className="print-subtitle">University Workload Management System</p>
                                        </div>
                                    </div>
                                    
                                    <div className="print-date">Generated on: <span>{reportData.date}</span></div>
                                    
                                    {(reportData.type === 'department' || reportData.type === 'schedule') && (
                                        <>
                                            <div className="print-summary">
                                                <div className="print-summary-item">
                                                    <span>Total Lecturers</span>
                                                    <strong>{reportData.summary.totalLecturers}</strong>
                                                </div>
                                                <div className="print-summary-item">
                                                    <span>Total Courses</span>
                                                    <strong>{reportData.summary.totalCourses}</strong>
                                                </div>
                                                <div className="print-summary-item">
                                                    <span>Avg Workload</span>
                                                    <strong>{reportData.summary.averageWorkload}%</strong>
                                                </div>
                                                <div className="print-summary-item">
                                                    <span>Overloaded</span>
                                                    <strong>{reportData.summary.overloadedLecturers}</strong>
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
                                        <div className="individual-report">
                                            <div className="print-individual-header">
                                                <div className="print-individual-avatar">
                                                    <svg className="avatar-icon" viewBox="0 0 24 24" fill="#FFFFFF" stroke="#1B365D" strokeWidth="1.5">
                                                        <circle cx="12" cy="7" r="4" fill="#FFFFFF" stroke="#1B365D"/>
                                                        <path d="M5 21a7 7 0 0114 0H5z" fill="#FFFFFF" stroke="#1B365D"/>
                                                    </svg>
                                                </div>
                                                <div>
                                                    <h2 className="print-individual-title">{reportData.lecturer.name}</h2>
                                                    <p className="print-individual-subtitle">{reportData.lecturer.lecturerId} | {reportData.lecturer.department}</p>
                                                </div>
                                            </div>
                                            
                                            <div className="print-individual-content">
                                                <div className="print-individual-info">
                                                    <h3 className="print-section-title">Profile</h3>
                                                    <div className="print-info-card">
                                                        <p><strong>ID:</strong> {reportData.lecturer.lecturerId}</p>
                                                        <p><strong>Department:</strong> {reportData.lecturer.department}</p>
                                                        <p><strong>Schedule Type:</strong> {reportData.lecturer.scheduleType}</p>
                                                    </div>
                                                </div>
                                                
                                                <div className="print-individual-workload">
                                                    <h3 className="print-section-title">Workload Overview</h3>
                                                    <div className="print-workload-card">
                                                        <div className="print-workload-stats">
                                                            <div className="print-stat-item">
                                                                <span>Courses Assigned</span>
                                                                <strong>{reportData.lecturer.courseCount} / {maxAllowedCourses}</strong>
                                                            </div>
                                                            <div className="print-stat-item">
                                                                <span>Workload</span>
                                                                <strong>{reportData.lecturer.workloadPercentage.toFixed(1)}%</strong>
                                                            </div>
                                                            <div className="print-stat-item">
                                                                <span>Status</span>
                                                                <strong>
                                                                    {reportData.lecturer.courseCount === 0 ? 'No Courses' :
                                                                     reportData.lecturer.courseCount === maxAllowedCourses ? 'Full Workload' :
                                                                     reportData.lecturer.courseCount > maxAllowedCourses ? 'Overloaded' :
                                                                     `${reportData.lecturer.courseCount}/${maxAllowedCourses} Courses`}
                                                                </strong>
                                                            </div>
                                                        </div>
                                                        <div className="print-workload-bar-large">
                                                            {renderWorkloadBar(reportData.lecturer.workloadPercentage)}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            <h3 className="print-section-title">Assigned Courses</h3>
                                            {reportData.lecturer.assignedCourses.length === 0 ? (
                                                <p className="print-no-courses">No courses assigned.</p>
                                            ) : (
                                                <table className="print-table print-course-table">
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
                                        </div>
                                    )}
                                    
                                    <div className="print-footer">
                                        <p>Generated by University Workload Management System</p>
                                        <p className="print-page-number">Page <span className="pageNumber"></span> of <span className="totalPages"></span></p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                    
                    <style type="text/css">{`
                        .print-header {
                            display: flex;
                            align-items: center;
                            margin-bottom: 20px;
                            padding-bottom: 10px;
                            border-bottom: 2px solid #1B365D;
                        }
                        .print-logo {
                            margin-right: 15px;
                        }
                        .print-title {
                            font-size: 24px;
                            font-weight: bold;
                            color: #1B365D;
                            margin: 0;
                        }
                        .print-subtitle {
                            font-size: 14px;
                            color: #4B5563;
                            margin: 5px 0 0;
                        }
                        .print-date {
                            text-align: right;
                            font-size: 12px;
                            color: #6B7280;
                            margin-bottom: 20px;
                        }
                        .print-date span {
                            font-weight: bold;
                            color: #1B365D;
                        }
                        .print-summary {
                            display: grid;
                            grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
                            gap: 10px;
                            margin-bottom: 20px;
                            background: #F9FAFB;
                            padding: 15px;
                            border-radius: 8px;
                        }
                        .print-summary-item {
                            text-align: center;
                        }
                        .print-summary-item span {
                            font-size: 12px;
                            color: #6B7280;
                            display: block;
                        }
                        .print-summary-item strong {
                            font-size: 18px;
                            color: #1B365D;
                            font-weight: bold;
                        }
                        .print-section-title {
                            font-size: 18px;
                            font-weight: bold;
                            color: #1B365D;
                            margin: 20px 0 10px;
                            border-bottom: 1px solid #E5E7EB;
                            padding-bottom: 5px;
                        }
                        .print-table {
                            width: 100%;
                            border-collapse: collapse;
                            margin-bottom: 20px;
                            font-size: 12px;
                        }
                        .print-table th, .print-table td {
                            border: 1px solid #E5E7EB;
                            padding: 8px;
                            text-align: left;
                        }
                        .print-table th {
                            background: #1B365D;
                            color: white;
                            font-weight: bold;
                        }
                        .print-table-label {
                            background: #F3F4F6;
                            font-weight: bold;
                            width: 30%;
                        }
                        .print-workload-bar {
                            display: flex;
                            align-items: center;
                            gap: 8px;
                        }
                        .print-workload-track {
                            height: 10px;
                            width: 100px;
                            background: #E5E7EB;
                            border-radius: 5px;
                            overflow: hidden;
                        }
                        .print-workload-progress {
                            height: 100%;
                            border-radius: 5px;
                        }
                        .print-workload-percent {
                            font-size: 12px;
                            font-weight: bold;
                            color: #1B365D;
                        }
                        .print-footer {
                            margin-top: 20px;
                            padding-top: 10px;
                            border-top: 1px solid #E5E7EB;
                            font-size: 10px;
                            color: #6B7280;
                            text-align: center;
                        }
                        .print-page-number {
                            margin-top: 5px;
                        }

                        /* Individual Report Styles */
                        .individual-report {
                            background: #F9FAFB;
                            padding: 20px;
                            border-radius: 8px;
                        }
                        .print-individual-header {
                            display: flex;
                            align-items: center;
                            background: linear-gradient(135deg, #1B365D 0%, #3B5A9A 100%);
                            color: white;
                            padding: 15px;
                            border-radius: 8px 8px 0 0;
                            margin: -20px -20px 20px;
                        }
                        .print-individual-avatar {
                            margin-right: 15px;
                            background: rgba(255, 255, 255, 0.2);
                            border-radius: 50%;
                            padding: 5px;
                        }
                        .avatar-icon {
                            width: 50px;
                            height: 50px;
                        }
                        .print-individual-title {
                            font-size: 22px;
                            font-weight: bold;
                            margin: 0;
                        }
                        .print-individual-subtitle {
                            font-size: 14px;
                            margin: 5px 0 0;
                            opacity: 0.9;
                        }
                        .print-individual-content {
                            display: grid;
                            grid-template-columns: 1fr 1fr;
                            gap: 20px;
                            margin-bottom: 20px;
                        }
                        .print-info-card {
                            background: white;
                            padding: 15px;
                            border-radius: 8px;
                            box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
                        }
                        .print-info-card p {
                            margin: 5px 0;
                            font-size: 12px;
                        }
                        .print-info-card strong {
                            color: #1B365D;
                            margin-right: 5px;
                        }
                        .print-workload-card {
                            background: white;
                            padding: 15px;
                            border-radius: 8px;
                            box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
                        }
                        .print-workload-stats {
                            display: grid;
                            grid-template-columns: 1fr 1fr 1fr;
                            gap: 10px;
                            margin-bottom: 15px;
                        }
                        .print-stat-item {
                            text-align: center;
                        }
                        .print-stat-item span {
                            font-size: 12px;
                            color: #6B7280;
                            display: block;
                        }
                        .print-stat-item strong {
                            font-size: 16px;
                            color: #1B365D;
                            font-weight: bold;
                        }
                        .print-workload-bar-large .print-workload-track {
                            width: 100%;
                            height: 15px;
                            background: #E5E7EB;
                            border-radius: 8px;
                        }
                        .print-workload-bar-large .print-workload-progress {
                            height: 100%;
                            border-radius: 8px;
                        }
                        .print-workload-bar-large .print-workload-percent {
                            font-size: 14px;
                            margin-left: 10px;
                        }
                        .print-course-table th {
                            background: #2A4A7F;
                        }
                        .print-no-courses {
                            font-style: italic;
                            color: #6B7280;
                            text-align: center;
                            padding: 10px;
                        }
                    `}</style>
                </div>
            )}
        </div>
    );
}