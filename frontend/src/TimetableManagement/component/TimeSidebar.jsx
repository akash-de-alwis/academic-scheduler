import { Link, useLocation } from "react-router-dom";
import { Calendar, FileText, Clock, Home } from "lucide-react";
import { useState } from "react";

export default function TimeSidebar() {
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const isActive = (path) => {
    return location.pathname === path;
  };

  const navItems = [
    { path: "/TimeHome", name: "Home", icon: <Home className="h-5 w-5" /> },
    { path: "/TimetableList", name: "Schedules", icon: <Calendar className="h-5 w-5" /> },
    { path: "/TimetableReports", name: "Reports", icon: <FileText className="h-5 w-5" /> },
    { path: "/TimeAvailable", name: "Available Slots", icon: <Clock className="h-5 w-5" /> },
  ];

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <div
      className={`fixed top-0 left-0 h-screen bg-[#FFFFFF] border-r border-[#EDEFF2] shadow-lg transition-all duration-300 z-10 ${
        isCollapsed ? "w-16" : "w-72"
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-gradient-to-r from-[#1B365D] to-[#2A4A7A] text-white shadow-md">
        {!isCollapsed && (
          <h2 className="text-xl font-semibold tracking-tight">Academic Scheduler</h2>
        )}
        <button
          onClick={toggleSidebar}
          className="p-1 rounded-full hover:bg-[#FFFFFF]/10 focus:outline-none"
        >
          <svg
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d={isCollapsed ? "M9 5h10M9 12h10M9 19h10" : "M4 6h16M4 12h16M4 18h16"}
            />
          </svg>
        </button>
      </div>

      {/* Navigation */}
      <nav className="mt-6 space-y-1 px-2">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center py-3 px-4 rounded-lg text-[#1B365D] transition-all duration-200 ${
              isActive(item.path)
                ? "bg-[#1B365D] text-white shadow-md"
                : "hover:bg-[#F5F7FA] hover:text-[#1B365D]/90"
            }`}
            title={isCollapsed ? item.name : ""}
          >
            <div className="flex items-center justify-center w-8 h-8">
              {item.icon}
            </div>
            {!isCollapsed && (
              <span className={`ml-3 text-sm ${isActive(item.path) ? "font-semibold" : "font-medium"}`}>
                {item.name}
              </span>
            )}
          </Link>
        ))}
      </nav>
    </div>
  );
}