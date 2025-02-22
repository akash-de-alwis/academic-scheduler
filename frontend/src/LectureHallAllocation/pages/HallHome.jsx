import React from 'react';
import { Calendar, Users, BookOpen, AlertTriangle, Building } from 'lucide-react';

const DashboardStats = ({ icon: Icon, title, value, subtitle }) => (
  <div className="bg-[#F5F7FA] p-6 rounded-lg shadow-sm relative">
    <Icon className="absolute top-6 right-6 w-6 h-6 text-[#1B365D]" />
    <div>
      <p className="text-2xl font-bold text-[#1B365D]">{value}</p>
      <p className="text-sm font-medium text-[#1B365D]">{title}</p>
      <p className="text-xs text-gray-500">{subtitle}</p>
    </div>
  </div>
);

const ResourceAllocation = () => (
  <div className="bg-[#F5F7FA] p-6 rounded-lg shadow-sm mt-6">
    <h2 className="text-xl font-bold text-[#1B365D] mb-4">Resource Distribution</h2>
    {[
      { name: "Lecture Halls", count: "8 venues" },
      { name: "Laboratories", count: "5 labs" },
      { name: "Meeting Rooms", count: "3 rooms" }
    ].map((item) => (
      <div key={item.name} className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-[#1B365D]">{item.name}</span>
          <span className="text-sm text-gray-500">{item.count}</span>
        </div>
        <div className="w-full bg-[#F5F7FA] rounded-full h-2">
          <div className="bg-[#1B365D] h-2 rounded-full" style={{ width: '75%' }} />
        </div>
      </div>
    ))}
  </div>
);

const ActionButtons = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
    {[
      { title: "Add Venues", icon: Building },
      { title: "Bookings", icon: Calendar },
      { title: "Book Meetings", icon: Users },
      { title: "Report Issues", icon: AlertTriangle }
    ].map((action) => (
      <button
        key={action.title}
        className="flex items-center justify-center space-x-2 bg-[#1B365D] text-white p-4 rounded-lg hover:bg-opacity-90 transition-all"
      >
        <action.icon className="w-5 h-5" />
        <span>{action.title}</span>
      </button>
    ))}
  </div>
);

const HallHome = () => {
  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#1B365D]">Resource Management Dashboard</h1>
        <p className="text-gray-500">Overview of lecture halls, labs, and resource allocation</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <DashboardStats
          icon={Building}
          title="Total Venues"
          value="16"
          subtitle="Halls, Labs & Meeting Rooms"
        />
        <DashboardStats
          icon={Calendar}
          title="Active Bookings"
          value="42"
          subtitle="Across all venues"
        />
        <DashboardStats
          icon={AlertTriangle}
          title="Pending Issues"
          value="3"
          subtitle="Maintenance & repairs"
        />
        <DashboardStats
          icon={BookOpen}
          title="Today's Sessions"
          value="12"
          subtitle="Scheduled classes & labs"
        />
      </div>
      <ResourceAllocation />
      <ActionButtons />
    </div>
  );
};

export default HallHome;