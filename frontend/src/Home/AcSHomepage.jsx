import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Book, Users, Calendar, Building2, Bell, ArrowUpRight, Activity } from 'lucide-react';

// Card Components
const Card = ({ children, className = "", ...props }) => (
  <div className={`backdrop-blur-md bg-white/80 rounded-2xl shadow-xl border border-gray-100/50 ${className}`} {...props}>
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
  <h3 className={`text-2xl font-extrabold text-[#1B365D] ${className}`}>{children}</h3>
);

const CardDescription = ({ children }) => (
  <p className="text-gray-600 mt-2">{children}</p>
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
    <div className={`absolute right-0 mt-2 bg-white/90 backdrop-blur-md rounded-xl shadow-2xl z-50 w-80 border border-gray-100/50 ${className}`}>
      {children}
    </div>
  ) : null
);

const DropdownMenuItem = ({ children, className = "" }) => (
  <div className={`p-3 hover:bg-[#F5F7FA]/80 cursor-pointer rounded-lg ${className}`}>
    {children}
  </div>
);

// Button Component
const Button = ({ children, variant = "default", className = "", ...props }) => {
  const variants = {
    default: "bg-gradient-to-r from-[#1B365D] to-[#2A4A7A] text-white",
    outline: "border-2 border-[#1B365D] text-[#1B365D] bg-transparent"
  };
  
  return (
    <button 
      className={`px-6 py-3 rounded-full font-semibold transition-all duration-300 hover:scale-105 ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

// Alert Components
const Alert = ({ children, variant = "default", className = "" }) => {
  const variants = {
    default: "bg-blue-50/80 border-blue-200/50",
    destructive: "bg-red-50/80 border-red-200/50"
  };
  
  return (
    <div className={`border rounded-lg p-4 backdrop-blur-md ${variants[variant]} ${className}`}>
      {children}
    </div>
  );
};

const AlertTitle = ({ children }) => (
  <h4 className="font-semibold text-[#1B365D]">{children}</h4>
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
      description: "Manage courses and subjects with ease",
      icon: <Book className="w-10 h-10" />,
      path: "/SubjectHome",
      color: "bg-blue-200/50",
      stats: { total: "24 Courses", active: "18 Active" }
    },
    {
      title: "Lecturer & Student Allocation",
      description: "Assign lecturers and students seamlessly",
      icon: <Users className="w-10 h-10" />,
      path: "/lecHome",
      color: "bg-green-200/50",
      stats: { total: "45 Staff", active: "892 Students" }
    },
    {
      title: "Timetable Management",
      description: "Schedule classes without conflicts",
      icon: <Calendar className="w-10 h-10" />,
      path: "/TimeHome",
      color: "bg-purple-200/50",
      stats: { total: "86 Classes", active: "12 Rooms" }
    },
    {
      title: "Room & Facility Booking",
      description: "Book halls and facilities effortlessly",
      icon: <Building2 className="w-10 h-10" />,
      path: "/HallHome",
      color: "bg-orange-200/50",
      stats: { total: "12 Halls", active: "8 Available" }
    }
  ];

  const activities = [
    {
      action: "New course added",
      detail: "Web Development",
      time: "2 hours ago",
      icon: <Book className="w-6 h-6" />
    },
    {
      action: "Room booked",
      detail: "L201 for Advanced Mathematics",
      time: "3 hours ago",
      icon: <Building2 className="w-6 h-6" />
    },
    {
      action: "Timetable updated",
      detail: "Computer Science department",
      time: "5 hours ago",
      icon: <Calendar className="w-6 h-6" />
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#E8ECEF] via-[#F5F7FA] to-white font-sans relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-r from-[#1B365D] to-[#2A4A7A] opacity-20 rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute bottom-0 right-0 w-72 h-72 bg-gradient-to-r from-[#2A4A7A] to-[#1B365D] opacity-20 rounded-full blur-3xl animate-pulse-slow animation-delay-1000"></div>
        <svg className="absolute bottom-0 left-0 w-full h-40 text-[#1B365D] opacity-10" viewBox="0 0 1440 320">
          <path fill="currentColor" d="M0,224L48,213.3C96,203,192,181,288,181.3C384,181,480,203,576,192C672,181,768,139,864,133.3C960,128,1056,160,1152,170.7C1248,181,1344,171,1392,165.3L1440,160L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z" />
        </svg>
      </div>

      {/* Main Content */}
      <div className="relative z-10 p-8 max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#1B365D] to-[#2A4A7A] mb-3 animate-fade-in-up">
              Academic Scheduler
            </h1>
            <p className="text-xl text-gray-700 animate-fade-in-up animation-delay-200">Welcome back, Admin</p>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger>
              <Button variant="outline" className="relative hover:bg-[#F5F7FA]/80">
                <Bell className="w-7 h-7 text-[#1B365D]" />
                {notifications.length > 0 && (
                  <span className="absolute -top-2 -right-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-full w-6 h-6 text-xs flex items-center justify-center animate-bounce">
                    {notifications.length}
                  </span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {notifications.map(notification => (
                <DropdownMenuItem key={notification.id}>
                  <Alert variant={notification.type === "warning" ? "destructive" : "default"} className="w-full">
                    <AlertTitle>{notification.title}</AlertTitle>
                    <AlertDescription>{notification.description}</AlertDescription>
                  </Alert>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          {[
            { label: "Total Courses", value: "24", icon: <Book className="w-10 h-10" />, trend: "+2" },
            { label: "Active Lecturers", value: "45", icon: <Users className="w-10 h-10" />, trend: "+5" },
            { label: "Lecture Halls", value: "12", icon: <Building2 className="w-10 h-10" />, trend: "0" },
            { label: "Scheduled Classes", value: "86", icon: <Calendar className="w-10 h-10" />, trend: "+12" }
          ].map((stat, index) => (
            <Card key={index} className="hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 animate-fade-in-up" style={{ animationDelay: `${index * 100}ms` }}>
              <CardContent className="pt-6 flex items-center gap-4">
                <div className="p-3 bg-gradient-to-r from-[#1B365D] to-[#2A4A7A] text-white rounded-full">{stat.icon}</div>
                <div>
                  <p className="text-sm text-gray-600">{stat.label}</p>
                  <div className="flex items-center gap-3">
                    <p className="text-4xl font-extrabold text-[#1B365D]">{stat.value}</p>
                    <span className={`text-sm font-semibold px-2 py-1 rounded-full ${parseInt(stat.trend) > 0 ? 'bg-green-100 text-green-700' : parseInt(stat.trend) < 0 ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'}`}>
                      {stat.trend}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Module Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {modules.map((module, index) => (
            <Card
              key={index}
              className="group hover:shadow-2xl hover:-translate-y-3 transition-all duration-500 cursor-pointer animate-fade-in-up"
              onClick={() => navigate(module.path)}
              style={{ animationDelay: `${index * 150}ms` }}
            >
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className={`${module.color} text-[#1B365D] p-4 rounded-full shadow-md`}>{module.icon}</div>
                  <ArrowUpRight className="w-7 h-7 text-[#1B365D] opacity-0 group-hover:opacity-100 transform group-hover:rotate-45 transition-all duration-300" />
                </div>
                <CardTitle className="mt-4">{module.title}</CardTitle>
                <CardDescription>{module.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-6 text-sm text-gray-600 font-medium">
                  <span>{module.stats.total}</span>
                  <span>{module.stats.active}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Recent Activity */}
        <Card className="hover:shadow-2xl transition-all duration-300">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <Activity className="w-7 h-7 text-[#1B365D]" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activities.map((activity, index) => (
                <div
                  key={index}
                  className="flex items-center gap-4 p-4 hover:bg-[#F5F7FA]/80 rounded-lg transition-all duration-300"
                >
                  <div className="bg-gradient-to-r from-[#1B365D] to-[#2A4A7A] text-white p-3 rounded-full shadow-md">{activity.icon}</div>
                  <div className="flex-1">
                    <p className="font-semibold text-[#1B365D]">{activity.action}</p>
                    <p className="text-sm text-gray-600">{activity.detail}</p>
                  </div>
                  <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">{activity.time}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}