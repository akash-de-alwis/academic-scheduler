import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
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
  User,
} from "lucide-react";

// Card Components
const Card = ({ children, className = "", ...props }) => (
  <div
    className={`bg-white rounded-lg shadow-sm border border-gray-100 transition-all duration-200 hover:shadow-md ${className}`}
    {...props}
  >
    {children}
  </div>
);

const CardHeader = ({ children, className = "" }) => (
  <div className={`p-4 bg-[#1B365D] rounded-t-lg text-white ${className}`}>
    {children}
  </div>
);

const CardContent = ({ children, className = "" }) => (
  <div className={`p-4 ${className}`}>{children}</div>
);

const CardTitle = ({ children, className = "" }) => (
  <h3 className={`text-lg font-semibold ${className}`}>{children}</h3>
);

const Button = ({ children, variant = "default", className = "", ...props }) => {
  const variants = {
    default: "bg-[#1B365D] text-white hover:bg-[#2A4A7A]",
    outline: "border border-[#1B365D] text-[#1B365D] hover:bg-gray-50",
  };
  return (
    <button
      className={`px-4 py-2 rounded-md font-medium transition-all duration-200 ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

// Dropdown Components (unchanged for brevity)
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
    <div className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-xl border border-gray-100 z-50">
      {children}
    </div>
  ) : null
);

export const DropdownMenuItem = ({ children }) => (
  <div className="p-3 hover:bg-gray-50 cursor-pointer first:rounded-t-lg last:rounded-b-lg">
    {children}
  </div>
);

export default function StaffDashboard() {
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState(null);
  const [error, setError] = useState("");
  const [notifications] = useState([
    { id: 1, title: "Timetable Conflict", description: "Two classes scheduled in Room L201", type: "warning" },
    { id: 2, title: "New Course Assigned", description: "Web Development assigned to you", type: "info" },
  ]);

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

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Please log in to view your dashboard");
        navigate("/LoginPage");
        return;
      }

      try {
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

        const subjectsRes = await axios.get("http://localhost:5000/api/subjects", { headers: { Authorization: `Bearer ${token}` } });
        const subjects = subjectsRes.data.filter((sub) => sub.lecturer === user.fullName);
        const activeSubjects = subjects.filter((sub) => sub.timeDuration > 0).length;

        const lecturersRes = await axios.get("http://localhost:5000/api/lecturers", { headers: { Authorization: `Bearer ${token}` } });
        const lecturers = lecturersRes.data;

        const roomsRes = await axios.get("http://localhost:5000/api/rooms", { headers: { Authorization: `Bearer ${token}` } });
        const rooms = roomsRes.data.filter((room) => room.hallType !== "Meeting Room");
        const availableRooms = rooms.filter((room) => !room.isBooked).length;

        const timetableRes = await axios.get("http://localhost:5000/api/timetable", { headers: { Authorization: `Bearer ${token}` } });
        const classes = timetableRes.data.filter((schedule) => schedule.lecturer === user.fullName);

        setStats({
          courses: { value: subjects.length, trend: `+${subjects.length - 5}` },
          lecturers: { value: lecturers.length, trend: `+${lecturers.length - 45}` },
          halls: { value: rooms.length, trend: `+${rooms.length - 12}` },
          classes: { value: classes.length, trend: `+${classes.length - 10}` },
        });

        setModulesData({
          subjects: { count: subjects.length, active: activeSubjects },
          staffStudents: { staff: lecturers.length, students: 892 },
          timetabling: { classes: classes.length, rooms: rooms.length },
          facilities: { halls: rooms.length, available: availableRooms },
        });
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load dashboard data");
      }
    };
    fetchData();
  }, [navigate]);

  const modules = [
    {
      title: "Assigned Subjects",
      description: "Manage your teaching courses",
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
      stats: `${modulesData.staffStudents.staff} Staff • ${modulesData.staffStudents.students} Students`,
    },
    {
      title: "Teaching Schedule",
      description: "View your class timetable",
      icon: <Calendar className="w-6 h-6" />,
      path: "/TimeHome",
      stats: `${modulesData.timetabling.classes} Classes • ${modulesData.timetabling.rooms} Rooms`,
    },
    {
      title: "Facilities",
      description: "View room availability",
      icon: <Building2 className="w-6 h-6" />,
      path: "/HallHome",
      stats: `${modulesData.facilities.halls} Halls • ${modulesData.facilities.available} Available`,
    },
  ];

  const activities = [
    { action: "New course assigned", detail: "Web Development", time: "2h ago", icon: <Book className="w-5 h-5" /> },
    { action: "Room booked", detail: "L201 - Advanced Mathematics", time: "3h ago", icon: <Building2 className="w-5 h-5" /> },
    { action: "Schedule updated", detail: "Computer Science", time: "5h ago", icon: <Calendar className="w-5 h-5" /> },
  ];

  const handleLogout = () => {
    localStorage.removeItem("token");
    setUserInfo(null);
    navigate("/LoginPage");
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-red-600 text-lg font-medium">{error}</p>
      </div>
    );
  }

  if (!userInfo) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600 text-lg font-medium">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation */}
      <header className="bg-white shadow-sm p-4 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-xl font-semibold text-[#1B365D]">Academic Scheduler</h1>
          <div className="flex items-center gap-6">
            <nav className="hidden md:flex gap-6">
              {modules.map((module, index) => (
                <Link
                  key={index}
                  to={module.path}
                  className="text-[#1B365D] hover:text-[#2A4A7A] font-medium transition-colors duration-200"
                >
                  {module.title}
                </Link>
              ))}
            </nav>
            <DropdownMenu>
              <DropdownMenuTrigger>
                <Button variant="outline" className="relative p-2">
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
                          notification.type === "warning" ? "bg-red-500" : "bg-[#1B365D]"
                        }`}
                      />
                      <div>
                        <p className="font-medium text-[#1B365D]">{notification.title}</p>
                        <p className="text-sm text-gray-600">{notification.description}</p>
                      </div>
                    </div>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <Link to="/StaffProfile" className="flex items-center gap-2 hover:bg-gray-50 p-2 rounded-md">
              <div className="w-8 h-8 bg-[#1B365D]/10 rounded-full flex items-center justify-center overflow-hidden">
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
              <span className="text-[#1B365D] font-medium hidden md:block">{userInfo.fullName}</span>
            </Link>
            <Button
              variant="outline"
              className="flex items-center gap-2 text-red-600 border-red-600 hover:bg-red-50"
              onClick={handleLogout}
            >
              <LogOut className="w-4 h-4" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-6">
        {/* Hero Section with Stats */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6 border border-gray-100">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-semibold text-[#1B365D]">Welcome, {userInfo.fullName}</h1>
              <p className="text-sm text-gray-500 mt-1">
                {userInfo.role} Dashboard •{" "}
                {new Date().toLocaleDateString("en-GB", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "Courses", value: stats.courses.value, trend: stats.courses.trend },
                { label: "Lecturers", value: stats.lecturers.value, trend: stats.lecturers.trend },
                { label: "Halls", value: stats.halls.value, trend: stats.halls.trend },
                { label: "Classes", value: stats.classes.value, trend: stats.classes.trend },
              ].map((stat, index) => (
                <div key={index} className="text-center">
                  <p className="text-sm text-gray-500">{stat.label}</p>
                  <p className="text-lg font-semibold text-[#1B365D]">{stat.value}</p>
                  <p
                    className={`text-xs ${
                      stat.trend.startsWith("+") ? "text-green-600" : "text-gray-500"
                    }`}
                  >
                    {stat.trend}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Two-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Modules */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Modules</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {modules.map((module, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-4 p-4 bg-gray-50 rounded-md cursor-pointer hover:bg-gray-100 transition-all duration-200"
                      onClick={() => navigate(module.path)}
                    >
                      <div className="bg-[#1B365D]/10 p-3 rounded-full text-[#1B365D]">
                        {module.icon}
                      </div>
                      <div className="flex-1">
                        <p className="text-base font-medium text-[#1B365D]">{module.title}</p>
                        <p className="text-sm text-gray-600">{module.description}</p>
                        <p className="text-xs text-gray-500 mt-1">{module.stats}</p>
                      </div>
                      <ArrowUpRight className="w-5 h-5 text-gray-400" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Activity and Profile */}
          <div className="space-y-6">
            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent className="max-h-64 overflow-y-auto">
                {activities.map((activity, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 py-3 border-b border-gray-100 last:border-0"
                  >
                    <div className="bg-[#1B365D]/10 p-2 rounded-full text-[#1B365D]">
                      {activity.icon}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-[#1B365D]">{activity.action}</p>
                      <p className="text-xs text-gray-600">{activity.detail}</p>
                    </div>
                    <span className="text-xs text-gray-500">{activity.time}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Profile Summary */}
            <Card>
              <CardContent className="flex items-center gap-4 p-4">
                <div className="w-12 h-12 bg-[#1B365D]/10 rounded-full flex items-center justify-center overflow-hidden">
                  {userInfo.profilePhoto ? (
                    <img
                      src={`http://localhost:5000${userInfo.profilePhoto}`}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-6 h-6 text-[#1B365D]" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-base font-medium text-[#1B365D]">{userInfo.fullName}</p>
                  <p className="text-sm text-gray-600">{userInfo.role}</p>
                </div>
                <Button
                  variant="outline"
                  className="text-sm"
                  onClick={() => navigate("/StaffProfile")}
                >
                  Profile
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}