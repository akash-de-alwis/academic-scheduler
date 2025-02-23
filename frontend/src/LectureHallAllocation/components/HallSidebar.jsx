import { Link, useLocation } from "react-router-dom";
import { Home, Building, Calendar, Users, AlertTriangle } from "lucide-react";

export default function HallSidebar() {
  const location = useLocation();
  
  const isActive = (path) => {
    return location.pathname === path;
  };

  const navItems = [
    {
      path: "/HallHome",
      name: "Home",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      )
    },
    {
      path: "/RoomList",
      name: "Venues",
      icon: <Building className="h-5 w-5 mr-3" />
    },
    {
      path: "/schedule",
      name: "Bookings",
      icon: <Calendar className="h-5 w-5 mr-3" />
    },
    {
      path: "/meetings",
      name: "Meetings",
      icon: <Users className="h-5 w-5 mr-3" />
    },
    {
      path: "/report",
      name: "Report",
      icon: <AlertTriangle className="h-5 w-5 mr-3" />
    }
  ];

  return (
    <div className="h-screen bg-white border-r border-gray-100 w-64">
      <div className="p-6">
        <h2 className="text-xl font-bold mb-8">Academic Scheduler</h2>
        
        <nav className="space-y-3">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center py-2 text-gray-700 hover:text-black ${
                isActive(item.path) ? "font-medium" : ""
              }`}
            >
              {item.icon}
              {item.name}
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
}