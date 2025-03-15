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
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      )
    },
    {
      path: "/RoomList",
      name: "Venues",
      icon: <Building className="h-5 w-5" />
    },
    {
      path: "/BookingReview",
      name: "Bookings",
      icon: <Calendar className="h-5 w-5" />
    },
    {
      path: "/MeetingRoomList",
      name: "Meetings",
      icon: <Users className="h-5 w-5" />
    },
    {
      path: "/HallIssues",
      name: "Report",
      icon: <AlertTriangle className="h-5 w-5" />
    }
  ];

  return (
    <div className="fixed top-0 left-0 h-screen bg-[#FFFFFF] border-r border-[#E2E8F0] w-64 shadow-md overflow-y-auto z-10">
      <div className="p-6">
        <h2 className="text-2xl font-bold text-[#1B365D] mb-8">Academic Scheduler</h2>
        
        <nav className="space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center py-3 px-4 rounded-lg text-[#1B365D] hover:bg-[#F5F7FA] hover:shadow-sm transition-all duration-300 ${
                isActive(item.path)
                  ? "bg-[#1B365D] text-[#FFFFFF] hover:bg-[#1B365D]/90 font-semibold"
                  : "font-medium"
              }`}
            >
              <div className="w-8 h-8 flex items-center justify-center mr-3">
                {item.icon}
              </div>
              {item.name}
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
}