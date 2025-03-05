import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import PrintableReports from './PrintableReports';

export default function LecturerWorkload() {
    const [lecturers, setLecturers] = useState([]);
    const [allocations, setAllocations] = useState([]);
    const [workloadData, setWorkloadData] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [maxAllowedCourses] = useState(5);

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
                setFilteredData(processedData);
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
            // Collect all subjects assigned to this lecturer across all allocations
            const assignedCourses = allocationsData
                .flatMap(allocation => 
                    allocation.subjects
                        .filter(subject => subject.lecturerId === lecturer.lecturerId)
                        .map(subject => ({
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

    const handleSearch = (e) => {
        const value = e.target.value;
        setSearchTerm(value);
        
        if (value.trim() === '') {
            setFilteredData(workloadData);
        } else {
            const filtered = workloadData.filter(lecturer => 
                lecturer.name.toLowerCase().includes(value.toLowerCase()) ||
                lecturer.lecturerId.toLowerCase().includes(value.toLowerCase()) ||
                lecturer.department.toLowerCase().includes(value.toLowerCase()) ||
                lecturer.assignedCourses.some(course => 
                    course.subjectName.toLowerCase().includes(value.toLowerCase()) ||
                    course.subjectId.toLowerCase().includes(value.toLowerCase()) ||
                    course.batchName.toLowerCase().includes(value.toLowerCase())
                )
            );
            setFilteredData(filtered);
        }
    };

    const getWorkloadColor = (percentage) => {
        if (percentage < 40) return 'bg-green-500';
        if (percentage < 60) return 'bg-blue-500';
        if (percentage < 80) return 'bg-yellow-500';
        if (percentage < 100) return 'bg-orange-500';
        return 'bg-red-500';
    };
    
    const getWorkloadGradient = (percentage) => {
        if (percentage < 40) return 'from-green-300 to-green-500';
        if (percentage < 60) return 'from-blue-300 to-blue-500';
        if (percentage < 80) return 'from-yellow-300 to-yellow-500';
        if (percentage < 100) return 'from-orange-300 to-orange-500';
        return 'from-red-300 to-red-500';
    };
    
    const getWorkloadTextColor = (percentage) => {
        if (percentage < 40) return 'text-green-500';
        if (percentage < 60) return 'text-blue-500';
        if (percentage < 80) return 'text-yellow-500';
        if (percentage < 100) return 'text-orange-500';
        return 'text-red-500';
    };

    const getWorkloadStatus = (courseCount) => {
        if (courseCount === 0) return 'No Courses';
        if (courseCount === maxAllowedCourses) return 'Full Workload';
        if (courseCount > maxAllowedCourses) return 'Overloaded';
        return `${courseCount}/${maxAllowedCourses} Courses`;
    };

    return (
        <div className="min-h-screen p-8">
            {/* Header and summary cards remain unchanged */}
            <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-bold text-[#1B365D]">Lecturer Workload Dashboard</h2>
                <div className="flex gap-3">
                    <button onClick={() => window.location.href = '/lecturers'} className="bg-[#1B365D] text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-opacity-90 transition-all">
                        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        Manage Lecturers
                    </button>
                    <button onClick={() => window.location.href = '/allocations'} className="bg-[#1B365D] text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-opacity-90 transition-all">
                        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                        Subject Allocations
                    </button>
                    <Link to="/PrintableReports" className="bg-[#4CAF50] text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-opacity-90 transition-all">
                        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Generate Reports
                    </Link>
                </div>
            </div>

            {/* Summary cards remain unchanged */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {/* ... Existing summary cards code ... */}
            </div>

            {/* Search bar remains unchanged */}
            <div className="mb-8">
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                        </svg>
                    </div>
                    <input
                        type="text"
                        placeholder="Search by name, ID, department or course..."
                        className="w-full pl-10 pr-4 py-3 border border-[#E2E8F0] rounded-lg bg-white text-[#1B365D] focus:ring-2 focus:ring-[#1B365D] focus:border-transparent transition-all"
                        value={searchTerm}
                        onChange={handleSearch}
                    />
                </div>
                {searchTerm && (
                    <div className="mt-2 text-sm text-gray-500">
                        Showing {filteredData.length} result{filteredData.length !== 1 ? 's' : ''} for "{searchTerm}"
                    </div>
                )}
            </div>

            {/* Lecturer Workload Cards - Design Unchanged */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                    <div className="col-span-3 flex justify-center items-center p-12">
                        <svg className="animate-spin h-8 w-8 text-[#1B365D]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span className="ml-3 text-[#1B365D]">Loading workload data...</span>
                    </div>
                ) : filteredData.length === 0 ? (
                    <div className="col-span-3 bg-white p-8 rounded-xl shadow-md text-center">
                        <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                        <h3 className="text-lg font-medium text-[#1B365D] mb-1">No results found</h3>
                        <p className="text-gray-500">No lecturers match your search criteria. Try a different search term.</p>
                    </div>
                ) : (
                    filteredData.map(lecturer => (
                        <div key={lecturer._id} className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden hover:shadow-lg transition-all">
                            <div className="bg-gradient-to-r from-[#1B365D] to-[#2A4A7F] p-4 text-white">
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-2">
                                        <div className="bg-white/20 p-1.5 rounded-lg">
                                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                            </svg>
                                        </div>
                                        <h3 className="font-medium tracking-wider">{lecturer.name}</h3>
                                    </div>
                                    <div className="bg-white/20 px-2 py-1 rounded-lg text-xs font-medium">
                                        {lecturer.scheduleType}
                                    </div>
                                </div>
                            </div>
                            
                            <div className="p-5">
                                <div className="mb-6">
                                    <div className="flex justify-between mb-2">
                                        <p className="text-sm font-medium text-[#1B365D]">Workload Status</p>
                                        <p className={`text-sm font-medium ${getWorkloadTextColor(lecturer.workloadPercentage)}`}>
                                            {getWorkloadStatus(lecturer.courseCount)}
                                        </p>
                                    </div>
                                    <div className="relative h-4 w-full bg-[#F5F7FA] rounded-full overflow-hidden">
                                        <div 
                                            className={`h-full bg-gradient-to-r ${getWorkloadGradient(lecturer.workloadPercentage)} rounded-full transition-all duration-500 ease-in-out relative`}
                                            style={{ width: `${lecturer.workloadPercentage}%` }}
                                        >
                                            {lecturer.workloadPercentage >= 80 && (
                                                <div className="absolute inset-0 bg-white opacity-30 animate-pulse"></div>
                                            )}
                                        </div>
                                        <div className="absolute inset-0 flex">
                                            {[1, 2, 3, 4].map((marker) => (
                                                <div key={marker} className="flex-1 border-r border-white/50"></div>
                                            ))}
                                            <div className="flex-1"></div>
                                        </div>
                                    </div>
                                    <div className="flex justify-between text-xs text-gray-400 mt-1 px-1">
                                        {[1, 2, 3, 4, 5].map((num) => (
                                            <span 
                                                key={num} 
                                                className={`${lecturer.courseCount >= num ? getWorkloadTextColor(lecturer.workloadPercentage) : 'text-gray-400'} font-medium`}
                                            >
                                                {num}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                                
                                <div className="flex items-start gap-3 mb-4">
                                    <div className="bg-[#F5F7FA] p-2 rounded-lg">
                                        <svg className="w-5 h-5 text-[#1B365D]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5M10 6a2 2 0 002-2h0a2 2 0 002 2M10 6a2 2 0 012 2v0a2 2 0 01-2 2M9 16h6" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">ID & Department</p>
                                        <p className="text-[#1B365D] font-semibold">{lecturer.lecturerId}</p>
                                        <p className="text-xs text-gray-500">{lecturer.department}</p>
                                    </div>
                                </div>
                                
                                {/* Assigned Courses Section */}
                                <div>
                                    <div className="flex justify-between items-center mb-2">
                                        <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Assigned Courses</p>
                                        <span className="text-xs text-gray-500">{lecturer.assignedCourses.length} course{lecturer.assignedCourses.length !== 1 ? 's' : ''}</span>
                                    </div>
                                    {lecturer.assignedCourses.length === 0 ? (
                                        <p className="text-gray-500 text-sm italic">No courses assigned</p>
                                    ) : (
                                        <div className="space-y-3 max-h-40 overflow-y-auto">
                                            {lecturer.assignedCourses.map((course, idx) => (
                                                <div key={idx} className="bg-[#F5F7FA] p-3 rounded-lg hover:bg-[#E6EBF2] transition-colors">
                                                    <div className="flex justify-between items-start">
                                                        <div>
                                                            <p className="font-medium text-sm text-[#1B365D]">{course.subjectName}</p>
                                                            <p className="text-xs text-gray-500 mt-1">{course.subjectId}</p>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="text-xs font-medium text-gray-600">{course.batchName}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}