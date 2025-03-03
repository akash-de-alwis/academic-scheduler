import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Book, Users, Calendar, Building2, Bell, ArrowUpRight, Activity } from 'lucide-react';

// Enhanced Card Components
const Card = ({ children, className = "", ...props }) => (
  <div className={`bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-300 ${className}`} {...props}>
    {children}
  </div>
);

const CardHeader = ({ children, className = "" }) => (
  <div className={`p-5 border-b border-gray-200 ${className}`}>{children}</div>
);

const CardContent = ({ children, className = "" }) => (
  <div className={`p-5 ${className}`}>{children}</div>
);

const CardTitle = ({ children, className = "" }) => (
  <h3 className={`text-xl font-semibold text-[#1B365D] ${className}`}>{children}</h3>
);

// Enhanced Button Component
const Button = ({ children, variant = "default", className = "", ...props }) => {
  const variants = {
    default: "bg-[#1B365D] text-white hover:bg-[#2A4A7A]",
    outline: "border border-[#1B365D] text-[#1B365D] hover:bg-[#F5F7FA]"
  };
  
  return (
    <button 
      className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

// Enhanced Dropdown Components
export const DropdownMenu = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="relative">
      {React.Children.map(children, child =>
        React.cloneElement(child, { isOpen, setIsOpen })
      )}
    </div>
  );
};

export const DropdownMenuTrigger = ({ children, isOpen, setIsOpen }) => (
  <div onClick={() => setIsOpen(!isOpen)}>{children}</div>
);

export const DropdownMenuContent = ({ children, isOpen }) => (
  isOpen ? (
    <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
      {children}
    </div>
  ) : null
);

export const DropdownMenuItem = ({ children }) => (
  <div className="p-3 hover:bg-[#F5F7FA] cursor-pointer first:rounded-t-lg last:rounded-b-lg">
    {children}
  </div>
);

export default function HomePage() {
  const navigate = useNavigate();
  const [notifications] = useState([
    { id: 1, title: "Timetable Conflict", description: "Two classes scheduled in Room L201", type: "warning" },
    { id: 2, title: "New Course Added", description: "Web Development has been added to curriculum", type: "info" }
  ]);

  const modules = [
    {
      title: "Subject Management",
      description: "Efficiently oversee courses and curriculum",
      icon: <Book className="w-6 h-6" />,
      path: "/SubjectHome",
      color: "text-[#1B365D]",
      stats: "24 Courses • 18 Active"
    },
    {
      title: "Staff & Students",
      description: "Manage lecturer and student assignments",
      icon: <Users className="w-6 h-6" />,
      path: "/lecHome",
      color: "text-[#1B365D]",
      stats: "45 Staff • 892 Students"
    },
    {
      title: "Timetabling",
      description: "Create conflict-free schedules",
      icon: <Calendar className="w-6 h-6" />,
      path: "/TimeHome",
      color: "text-[#1B365D]",
      stats: "86 Classes • 12 Rooms"
    },
    {
      title: "Facilities",
      description: "Coordinate room and resource booking",
      icon: <Building2 className="w-6 h-6" />,
      path: "/HallHome",
      color: "text-[#1B365D]",
      stats: "12 Halls • 8 Available"
    }
  ];

  const activities = [
    { action: "New course added", detail: "Web Development", time: "2h ago", icon: <Book className="w-5 h-5" /> },
    { action: "Room booked", detail: "L201 - Advanced Mathematics", time: "3h ago", icon: <Building2 className="w-5 h-5" /> },
    { action: "Timetable updated", detail: "Computer Science", time: "5h ago", icon: <Calendar className="w-5 h-5" /> }
  ];

  return (
    <div className="min-h-screen bg-[#F5F7FA]">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-[#1B365D]">Academic Scheduler</h1>
            <p className="text-gray-600 mt-1">Welcome back, Administrator</p>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger>
              <Button variant="outline" className="relative">
                <Bell className="w-5 h-5" />
                {notifications.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 text-xs flex items-center justify-center">
                    {notifications.length}
                  </span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {notifications.map(notification => (
                <DropdownMenuItem key={notification.id}>
                  <div className="flex items-start gap-3">
                    <div className={`mt-1 w-2 h-2 rounded-full ${notification.type === "warning" ? "bg-red-500" : "bg-[#1B365D]"}`}></div>
                    <div>
                      <p className="font-medium text-[#1B365D]">{notification.title}</p>
                      <p className="text-sm text-gray-600">{notification.description}</p>
                    </div>
                  </div>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
          {[
            { label: "Courses", value: "24", trend: "+2", color: "text-[#1B365D]" },
            { label: "Lecturers", value: "45", trend: "+5", color: "text-[#1B365D]" },
            { label: "Halls", value: "12", trend: "0", color: "text-[#1B365D]" },
            { label: "Classes", value: "86", trend: "+12", color: "text-[#1B365D]" }
          ].map((stat, index) => (
            <Card key={index}>
              <CardContent>
                <p className="text-sm text-gray-600">{stat.label}</p>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-semibold text-[#1B365D]">{stat.value}</span>
                  <span className={`text-sm ${stat.trend.startsWith('+') ? 'text-green-600' : 'text-gray-600'}`}>
                    {stat.trend}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Modules */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          {modules.map((module, index) => (
            <Card
              key={index}
              className="cursor-pointer hover:border-[#1B365D]"
              onClick={() => navigate(module.path)}
            >
              <CardContent className="flex items-start gap-4">
                <div className={`${module.color} bg-[#F5F7FA] p-3 rounded-lg`}>{module.icon}</div>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <CardTitle>{module.title}</CardTitle>
                    <ArrowUpRight className="w-5 h-5 text-gray-400 hover:text-[#1B365D]" />
                  </div>
                  <p className="text-gray-600 text-sm mt-1">{module.description}</p>
                  <p className="text-sm text-gray-500 mt-2">{module.stats}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-[#1B365D]" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            {activities.map((activity, index) => (
              <div key={index} className="flex items-center gap-4 py-3 border-b border-gray-200 last:border-0">
                <div className="text-[#1B365D] bg-[#F5F7FA] p-2 rounded-lg">{activity.icon}</div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-[#1B365D]">{activity.action}</p>
                  <p className="text-sm text-gray-600">{activity.detail}</p>
                </div>
                <span className="text-xs text-gray-500">{activity.time}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}