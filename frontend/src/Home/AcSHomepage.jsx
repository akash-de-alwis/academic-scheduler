import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Book, Users, Calendar, Building2, Bell, ArrowUpRight, Activity } from 'lucide-react';

// Card Components
const Card = ({ children, className = "", ...props }) => (
  <div className={`bg-[#F5F7FA] rounded-lg ${className}`} {...props}>
    {children}
  </div>
);

const CardHeader = ({ children, className = "" }) => (
  <div className={`p-6 ${className}`}>{children}</div>
);

const CardContent = ({ children, className = "" }) => (
  <div className={`p-6 pt-0 ${className}`}>{children}</div>
);

const CardTitle = ({ children, className = "" }) => (
  <h3 className={`text-xl font-semibold text-[#1B365D] ${className}`}>{children}</h3>
);

const CardDescription = ({ children }) => (
  <p className="text-[#1B365D]/70 mt-2">{children}</p>
);

// Dropdown Components
const DropdownMenu = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="relative inline-block">
      {React.Children.map(children, child =>
        React.cloneElement(child, { isOpen, setIsOpen })
      )}
    </div>
  );
};

const DropdownMenuTrigger = ({ children, isOpen, setIsOpen }) => (
  <div onClick={() => setIsOpen(!isOpen)}>{children}</div>
);

const DropdownMenuContent = ({ children, className = "", isOpen }) => (
  isOpen ? (
    <div className={`absolute right-0 mt-2 bg-white rounded-lg shadow-lg z-50 ${className}`}>
      {children}
    </div>
  ) : null
);

const DropdownMenuItem = ({ children, className = "" }) => (
  <div className={`p-2 hover:bg-[#F5F7FA] cursor-pointer ${className}`}>
    {children}
  </div>
);

// Button Component
const Button = ({ children, variant = "default", className = "", ...props }) => {
  const variants = {
    default: "bg-[#1B365D] text-white",
    outline: "border-2 border-[#1B365D] text-[#1B365D]"
  };
  
  return (
    <button 
      className={`px-4 py-2 rounded-lg transition-all hover:opacity-90 ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

// Alert Components
const Alert = ({ children, variant = "default", className = "" }) => {
  const variants = {
    default: "bg-blue-50 border-blue-200",
    destructive: "bg-red-50 border-red-200"
  };
  
  return (
    <div className={`border rounded-lg p-4 ${variants[variant]} ${className}`}>
      {children}
    </div>
  );
};

const AlertTitle = ({ children }) => (
  <h4 className="font-semibold mb-1 text-[#1B365D]">{children}</h4>
);

const AlertDescription = ({ children }) => (
  <p className="text-sm text-[#1B365D]/70">{children}</p>
);

export default function HomePage() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([
    { id: 1, title: "Timetable Conflict", description: "Two classes scheduled in Room L201", type: "warning" },
    { id: 2, title: "New Course Added", description: "Web Development has been added to curriculum", type: "info" }
  ]);

  const modules = [
    {
      title: "Subject Management",
      description: "Manage academic courses, subjects, and their prerequisites",
      icon: <Book className="w-8 h-8" />,
      path: "/SubjectHome",
      color: "bg-blue-100",
      stats: { total: "24 Courses", active: "18 Active" }
    },
    {
      title: "Lecturer & Student Allocation",
      description: "Assign and manage lecturers and students for courses",
      icon: <Users className="w-8 h-8" />,
      path: "/lecHome",
      color: "bg-green-100",
      stats: { total: "45 Staff", active: "892 Students" }
    },
    {
      title: "Timetable Management",
      description: "Create and manage class schedules and detect conflicts",
      icon: <Calendar className="w-8 h-8" />,
      path: "/TimeHome",
      color: "bg-purple-100",
      stats: { total: "86 Classes", active: "12 Rooms" }
    },
    {
      title: "Room & Facility Booking",
      description: "Book and manage lecture halls and facilities",
      icon: <Building2 className="w-8 h-8" />,
      path: "/HallHome",
      color: "bg-orange-100",
      stats: { total: "12 Halls", active: "8 Available" }
    }
  ];

  const activities = [
    {
      action: "New course added",
      detail: "Web Development",
      time: "2 hours ago",
      icon: <Book className="w-4 h-4" />
    },
    {
      action: "Room booked",
      detail: "L201 for Advanced Mathematics",
      time: "3 hours ago",
      icon: <Building2 className="w-4 h-4" />
    },
    {
      action: "Timetable updated",
      detail: "Computer Science department",
      time: "5 hours ago",
      icon: <Calendar className="w-4 h-4" />
    }
  ];

  return (
    <div className="min-h-screen bg-[#FFFFFF] p-8">
      {/* Header Section */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold text-[#1B365D] mb-2">Academic Scheduler</h1>
          <p className="text-[#1B365D]/70">Welcome back, Admin</p>
        </div>
        
        {/* Notifications */}
        <div className="flex gap-4">
          <DropdownMenu>
            <DropdownMenuTrigger>
              <Button variant="outline" className="relative">
                <Bell className="w-5 h-5" />
                {notifications.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center">
                    {notifications.length}
                  </span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-80">
              {notifications.map(notification => (
                <DropdownMenuItem key={notification.id} className="p-3">
                  <Alert variant={notification.type === "warning" ? "destructive" : "default"}>
                    <AlertTitle>{notification.title}</AlertTitle>
                    <AlertDescription>{notification.description}</AlertDescription>
                  </Alert>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-4 gap-6 mb-12">
        {[
          { label: "Total Courses", value: "24", icon: <Book />, trend: "+2" },
          { label: "Active Lecturers", value: "45", icon: <Users />, trend: "+5" },
          { label: "Lecture Halls", value: "12", icon: <Building2 />, trend: "0" },
          { label: "Scheduled Classes", value: "86", icon: <Calendar />, trend: "+12" }
        ].map((stat, index) => (
          <Card key={index} className="hover:shadow-lg transition-all">
            <CardContent className="pt-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-[#1B365D]/70 text-sm mb-1">{stat.label}</p>
                  <p className="text-3xl font-bold text-[#1B365D]">{stat.value}</p>
                </div>
                <div className={`p-2 rounded-lg ${parseInt(stat.trend) > 0 ? 'bg-green-100 text-green-700' : parseInt(stat.trend) < 0 ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'}`}>
                  {stat.trend}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Module Cards */}
      <div className="grid grid-cols-2 gap-6 mb-12">
        {modules.map((module, index) => (
          <Card 
            key={index}
            className="group hover:shadow-xl transition-all cursor-pointer"
            onClick={() => navigate(module.path)}
          >
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className={`${module.color} text-[#1B365D] p-3 rounded-lg`}>
                  {module.icon}
                </div>
                <ArrowUpRight className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <CardTitle className="text-xl mt-4">{module.title}</CardTitle>
              <CardDescription>{module.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 text-sm">
                <span className="text-[#1B365D]/70">{module.stats.total}</span>
                <span className="text-[#1B365D]/70">{module.stats.active}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {activities.map((activity, index) => (
              <div key={index} className="flex items-center gap-4 p-3 hover:bg-white rounded-lg transition-colors">
                <div className="bg-[#1B365D]/10 p-2 rounded-lg">
                  {activity.icon}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-[#1B365D]">{activity.action}</p>
                  <p className="text-sm text-[#1B365D]/70">{activity.detail}</p>
                </div>
                <span className="text-sm text-[#1B365D]/50">{activity.time}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}