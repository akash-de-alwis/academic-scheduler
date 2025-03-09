import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom"; // Added Link for profile navigation
import axios from "axios";
import {
  Book,
  Users,
  Calendar,
  Building2,
  Bell,
  ArrowUpRight,
  Activity,
  LogOut,
  User, // Added User icon for profile
} from "lucide-react";

// Enhanced Card Components (unchanged)
const Card = ({ children, className = "", ...props }) => (
  <div
    className={`bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-300 ${className}`}
    {...props}
  >
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
  <h3 className={`text-xl font-semibold text-[#1B365D] ${className}`}>
    {children}
  </h3>
);

// Enhanced Button Component (unchanged)
const Button = ({ children, variant = "default", className = "", ...props }) => {
  const variants = {
    default: "bg-[#1B365D] text-white hover:bg-[#2A4A7A]",
    outline: "border border-[#1B365D] text-[#1B365D] hover:bg-[#F5F7FA]",
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

// Enhanced Dropdown Components (unchanged)
export const DropdownMenu = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="relative">
      {React.Children.map(children, (child) =>
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

export default function StaffDashboard() {
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState(null);
  const [error, setError] = useState("");
  const [notifications] = useState([
    {
      id: 1,
      title: "Timetable Conflict",
      description: "Two classes scheduled in Room L201",
      type: "warning",
    },
    {
      id: 2,
      title: "New Course Assigned",
      description: "Web Development assigned to you",
      type: "info",
    },
  ]);

  // State for dynamic data
  const [stats, setStats] = useState({
    courses: { value: 0, trend: "+0" },
    lecturers: { value: 0, trend: "+0" },
    halls: { value: 0, trend: "+0" },
    classes: { value: 0, trend: "+0" },
  });
  const [modulesData, setModulesData] = useState({
    subjects: { count: 0, active: 0 },
    staffStudents: { staff: 0, students: 0 },
    timetabling: { classes: 0, rooms: 0 },
    facilities: { halls: 0, available: 0 },
  });

  // Fetch staff-specific data
  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Please log in to view your dashboard");
        navigate("/LoginPage");
        return;
      }

      try {
        // Fetch user info
        const userResponse = await axios.get("http://localhost:5000/api/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const user = userResponse.data;
        if (user.role !== "Staff") {
          setError("Access denied: Staff only");
          navigate("/LoginPage");
          return;
        }
        setUserInfo(user);

        // Fetch Subjects assigned to this staff
        const subjectsRes = await axios.get("http://localhost:5000/api/subjects", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const subjects = subjectsRes.data.filter(
          (sub) => sub.lecturer === user.fullName
        );
        const activeSubjects = subjects.filter(
          (sub) => sub.timeDuration > 0
        ).length;

        // Fetch Staff (total lecturers for context)
        const lecturersRes = await axios.get("http://localhost:5000/api/lecturers", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const lecturers = lecturersRes.data;

        // Fetch Rooms (Halls)
        const roomsRes = await axios.get("http://localhost:5000/api/rooms", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const rooms = roomsRes.data.filter((room) => room.hallType !== "Meeting Room");
        const availableRooms = rooms.filter((room) => !room.isBooked).length;

        // Fetch Teaching Classes for this staff
        const timetableRes = await axios.get("http://localhost:5000/api/timetable", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const classes = timetableRes.data.filter(
          (schedule) => schedule.lecturer === user.fullName
        );

        // Update stats
        setStats({
          courses: { value: subjects.length, trend: `+${subjects.length - 5}` },
          lecturers: { value: lecturers.length, trend: `+${lecturers.length - 45}` },
          halls: { value: rooms.length, trend: `+${rooms.length - 12}` },
          classes: { value: classes.length, trend: `+${classes.length - 10}` },
        });

        // Update modules data
        setModulesData({
          subjects: { count: subjects.length, active: activeSubjects },
          staffStudents: { staff: lecturers.length, students: 892 },
          timetabling: { classes: classes.length, rooms: rooms.length },
          facilities: { halls: rooms.length, available: availableRooms },
        });
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load dashboard data");
        console.error("Error fetching data:", err);
      }
    };
    fetchData();
  }, [navigate]);

  const modules = [
    {
      title: "Assigned Subjects",
      description: "View and manage your teaching courses",
      icon: <Book className="w-6 h-6" />,
      path: "/subjectHome",
      color: "text-[#1B365D]",
      stats: `${modulesData.subjects.count} Courses • ${modulesData.subjects.active} Active`,
    },
    {
      title: "Staff & Students",
      description: "View staff and student details",
      icon: <Users className="w-6 h-6" />,
      path: "/lecHome",
      color: "text-[#1B365D]",
      stats: `${modulesData.staffStudents.staff} Staff • ${modulesData.staffStudents.students} Students`,
    },
    {
      title: "Teaching Schedule",
      description: "View your class timetable",
      icon: <Calendar className="w-6 h-6" />,
      path: "/timetable",
      color: "text-[#1B365D]",
      stats: `${modulesData.timetabling.classes} Classes • ${modulesData.timetabling.rooms} Rooms`,
    },
    {
      title: "Facilities",
      description: "View room availability",
      icon: <Building2 className="w-6 h-6" />,
      path: "/HallHome",
      color: "text-[#1B365D]",
      stats: `${modulesData.facilities.halls} Halls • ${modulesData.facilities.available} Available`,
    },
  ];

  const activities = [
    {
      action: "New course assigned",
      detail: "Web Development",
      time: "2h ago",
      icon: <Book className="w-5 h-5" />,
    },
    {
      action: "Room booked",
      detail: "L201 - Advanced Mathematics",
      time: "3h ago",
      icon: <Building2 className="w-5 h-5" />,
    },
    {
      action: "Schedule updated",
      detail: "Computer Science",
      time: "5h ago",
      icon: <Calendar className="w-5 h-5" />,
    },
  ];

  const handleLogout = () => {
    localStorage.removeItem("token");
    setUserInfo(null);
    navigate("/LoginPage");
  };

  if (error) {
    return (
      <div className="min-h-screen bg-[#F5F7FA] flex items-center justify-center">
        <p className="text-red-500 text-xl font-semibold">{error}</p>
      </div>
    );
  }

  if (!userInfo) {
    return (
      <div className="min-h-screen bg-[#F5F7FA] flex items-center justify-center">
        <p className="text-gray-600 text-xl font-semibold">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F7FA]">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-[#1B365D]">
              Welcome, {userInfo.fullName}!
            </h1>
            <p className="text-gray-600 mt-1">
              {userInfo.role} Dashboard |{" "}
              {new Date().toLocaleDateString("en-GB", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
          <div className="flex items-center gap-4">
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
                {notifications.map((notification) => (
                  <DropdownMenuItem key={notification.id}>
                    <div className="flex items-start gap-3">
                      <div
                        className={`mt-1 w-2 h-2 rounded-full ${
                          notification.type === "warning"
                            ? "bg-red-500"
                            : "bg-[#1B365D]"
                        }`}
                      ></div>
                      <div>
                        <p className="font-medium text-[#1B365D]">
                          {notification.title}
                        </p>
                        <p className="text-sm text-gray-600">
                          {notification.description}
                        </p>
                      </div>
                    </div>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            {/* Profile Icon */}
            <Link to="/StaffProfile" className="flex items-center gap-2">
              <div className="w-10 h-10 bg-[#1B365D]/10 rounded-full flex items-center justify-center overflow-hidden">
                {userInfo.profilePhoto ? (
                  <img
                    src={`http://localhost:5000${userInfo.profilePhoto}`}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-5 h-5 text-[#1B365D]" />
                )}
              </div>
              <span className="text-[#1B365D] font-medium hidden md:block">
                {userInfo.fullName}
              </span>
            </Link>
            <Button
              variant="outline"
              className="flex items-center gap-2 text-red-600 border-red-600 hover:bg-red-100"
              onClick={handleLogout}
            >
              <LogOut className="w-5 h-5" />
              Logout
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
          {[
            {
              label: "Assigned Courses",
              value: stats.courses.value,
              trend: stats.courses.trend,
              color: "text-[#1B365D]",
            },
            {
              label: "Lecturers",
              value: stats.lecturers.value,
              trend: stats.lecturers.trend,
              color: "text-[#1B365D]",
            },
            {
              label: "Halls",
              value: stats.halls.value,
              trend: stats.halls.trend,
              color: "text-[#1B365D]",
            },
            {
              label: "Classes",
              value: stats.classes.value,
              trend: stats.classes.trend,
              color: "text-[#1B365D]",
            },
          ].map((stat, index) => (
            <Card key={index}>
              <CardContent>
                <p className="text-sm text-gray-600">{stat.label}</p>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-semibold text-[#1B365D]">
                    {stat.value}
                  </span>
                  <span
                    className={`text-sm ${
                      stat.trend.startsWith("+")
                        ? "text-green-600"
                        : "text-gray-600"
                    }`}
                  >
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
                <div className={`${module.color} bg-[#F5F7FA] p-3 rounded-lg`}>
                  {module.icon}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <CardTitle>{module.title}</CardTitle>
                    <ArrowUpRight className="w-5 h-5 text-gray-400 hover:text-[#1B365D]" />
                  </div>
                  <p className="text-gray-600 text-sm mt-1">
                    {module.description}
                  </p>
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
              <div
                key={index}
                className="flex items-center gap-4 py-3 border-b border-gray-200 last:border-0"
              >
                <div className="text-[#1B365D] bg-[#F5F7FA] p-2 rounded-lg">
                  {activity.icon}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-[#1B365D]">
                    {activity.action}
                  </p>
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