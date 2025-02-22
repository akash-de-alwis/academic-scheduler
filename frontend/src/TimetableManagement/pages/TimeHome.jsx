import React from 'react';
import { Calendar, Users, BookOpen, Clock, AlertCircle, Plus, Eye, Wrench } from 'lucide-react';

// Card Components
const Card = ({ className, children }) => (
  <div className={`rounded-lg shadow-sm ${className}`}>
    {children}
  </div>
);

const CardHeader = ({ className, children }) => (
  <div className={`p-6 pb-2 ${className}`}>
    {children}
  </div>
);

const CardTitle = ({ className, children }) => (
  <h3 className={`font-medium ${className}`}>
    {children}
  </h3>
);

const CardContent = ({ className, children }) => (
  <div className={`p-6 pt-0 ${className}`}>
    {children}
  </div>
);

const TimeHome = () => {
  const upcomingClasses = [
    { id: 1, subject: "Database Systems", time: "09:00 AM", room: "Lab 101", lecturer: "Dr. Smith" },
    { id: 2, subject: "Web Development", time: "11:00 AM", room: "Room 203", lecturer: "Prof. Johnson" },
    { id: 3, subject: "Data Structures", time: "02:00 PM", room: "Lab 102", lecturer: "Dr. Wilson" }
  ];

  return (
    <div className="min-h-screen">
      <div className="p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#1B365D]">Timetable Management Dashboard</h1>
          <p className="text-gray-600">Overview of scheduling and resource allocation</p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-[#F5F7FA]">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-[#1B365D] text-lg">Total Schedules</CardTitle>
              <Calendar className="h-5 w-5 text-[#1B365D]" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-[#1B365D]">248</div>
              <p className="text-gray-600 text-sm">Active this semester</p>
            </CardContent>
          </Card>

          <Card className="bg-[#F5F7FA]">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-[#1B365D] text-lg">Available Rooms</CardTitle>
              <BookOpen className="h-5 w-5 text-[#1B365D]" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-[#1B365D]">15</div>
              <p className="text-gray-600 text-sm">Ready for allocation</p>
            </CardContent>
          </Card>

          <Card className="bg-[#F5F7FA]">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-[#1B365D] text-lg">Active Lecturers</CardTitle>
              <Users className="h-5 w-5 text-[#1B365D]" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-[#1B365D]">42</div>
              <p className="text-gray-600 text-sm">Currently teaching</p>
            </CardContent>
          </Card>

          <Card className="bg-[#F5F7FA]">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-[#1B365D] text-lg">Conflicts</CardTitle>
              <AlertCircle className="h-5 w-5 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-500">2</div>
              <p className="text-gray-600 text-sm">Needs resolution</p>
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <button className="flex items-center justify-center gap-2 bg-[#1B365D] text-white p-4 rounded-lg hover:bg-[#152c4d] transition-colors">
            <Plus className="h-5 w-5" />
            Add New Schedule
          </button>
          <button className="flex items-center justify-center gap-2 bg-[#1B365D] text-white p-4 rounded-lg hover:bg-[#152c4d] transition-colors">
            <Eye className="h-5 w-5" />
            View Timetables
          </button>
          <button className="flex items-center justify-center gap-2 bg-[#1B365D] text-white p-4 rounded-lg hover:bg-[#152c4d] transition-colors">
            <Wrench className="h-5 w-5" />
            Resolve Conflicts
          </button>
        </div>

        {/* Upcoming Classes */}
        <Card className="bg-white">
          <CardHeader>
            <CardTitle className="text-[#1B365D] text-xl">Upcoming Classes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingClasses.map((class_) => (
                <div key={class_.id} className="flex items-center p-4 bg-[#F5F7FA] rounded-lg">
                  <Clock className="h-5 w-5 text-[#1B365D] mr-4" />
                  <div className="flex-1">
                    <h3 className="font-medium text-[#1B365D]">{class_.subject}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mt-2 text-sm text-gray-600">
                      <span>{class_.time}</span>
                      <span>{class_.room}</span>
                      <span>{class_.lecturer}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TimeHome;