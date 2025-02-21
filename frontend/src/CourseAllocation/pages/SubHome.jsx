import React from 'react';
import { Users, BookOpen, Calendar, Star, PlusCircle, FileText, BarChart } from 'lucide-react';

const SubjectManagementDashboard = () => {
  return (
    <div className="bg-[#FFFFFF] min-h-screen p-6">
      {/* Main Content */}
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-[#1B365D]">Subject Management Dashboard</h1>
          <p className="text-gray-600">Overview of academic subjects and resource allocation</p>
        </div>
        
        {/* Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {/* Total Subjects Card */}
          <div className="bg-[#F5F7FA] rounded-lg shadow-sm p-6 flex items-start justify-between">
            <div>
              <h2 className="text-4xl font-bold text-[#1B365D]">56</h2>
              <p className="text-gray-600">Total Subjects Available</p>
            </div>
            <BookOpen size={24} className="text-[#1B365D]" />
          </div>
          
          {/* Departments Card */}
          <div className="bg-[#F5F7FA] rounded-lg shadow-sm p-6 flex items-start justify-between">
            <div>
              <h2 className="text-4xl font-bold text-[#1B365D]">6</h2>
              <p className="text-gray-600">Departments Covered</p>
            </div>
            <Users size={24} className="text-[#1B365D]" />
          </div>
          
          {/* Semesters Card */}
          <div className="bg-[#F5F7FA] rounded-lg shadow-sm p-6 flex items-start justify-between">
            <div>
              <h2 className="text-4xl font-bold text-[#1B365D]">8</h2>
              <p className="text-gray-600">Subjects per Semester</p>
            </div>
            <Calendar size={24} className="text-[#1B365D]" />
          </div>
          
          {/* Most Assigned Subject */}
          <div className="bg-[#F5F7FA] rounded-lg shadow-sm p-6 flex items-start justify-between">
            <div>
              <h2 className="text-lg font-bold text-[#1B365D]">Math 101</h2>
              <p className="text-gray-600">Most Assigned Subject</p>
            </div>
            <Star size={24} className="text-[#1B365D]" />
          </div>
        </div>
        
        {/* Department Distribution Section */}
        <div className="bg-[#F5F7FA] rounded-lg shadow-sm p-6 mb-10">
          <h2 className="text-xl font-bold text-[#1B365D] mb-6">Department Distribution</h2>
          
          <div className="space-y-6">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-[#1B365D]">Engineering</span>
                <span className="text-[#1B365D]">24 subjects</span>
              </div>
              <div className="w-full bg-white rounded-full h-2">
                <div className="bg-[#1B365D] h-2 rounded-full" style={{ width: '80%' }}></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-[#1B365D]">Information Technology</span>
                <span className="text-[#1B365D]">18 subjects</span>
              </div>
              <div className="w-full bg-white rounded-full h-2">
                <div className="bg-[#1B365D] h-2 rounded-full" style={{ width: '65%' }}></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-[#1B365D]">Business Studies</span>
                <span className="text-[#1B365D]">14 subjects</span>
              </div>
              <div className="w-full bg-white rounded-full h-2">
                <div className="bg-[#1B365D] h-2 rounded-full" style={{ width: '50%' }}></div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Quick Actions Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <button className="bg-[#1B365D] text-white py-4 px-6 rounded-lg flex items-center justify-center space-x-2 hover:bg-opacity-90 transition">
            <PlusCircle size={20} />
            <span>Add New Subject</span>
          </button>
          
          <button className="bg-[#1B365D] text-white py-4 px-6 rounded-lg flex items-center justify-center space-x-2 hover:bg-opacity-90 transition">
            <BookOpen size={20} />
            <span>View All Subjects</span>
          </button>
          
          <button className="bg-[#1B365D] text-white py-4 px-6 rounded-lg flex items-center justify-center space-x-2 hover:bg-opacity-90 transition">
            <FileText size={20} />
            <span>Generate Reports</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default SubjectManagementDashboard;