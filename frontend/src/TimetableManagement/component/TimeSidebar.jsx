import { Link, useLocation } from "react-router-dom";
import { Calendar, FileText, ClipboardList } from 'lucide-react';

export default function TimeSidebar() {
  const location = useLocation();
 
  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <div className="h-screen bg-white border-r border-gray-100 w-64">
      <div className="p-6">
        <h2 className="text-xl font-bold text-[#1B365D] mb-8">Academic Scheduler</h2>
       
        <nav className="space-y-3">
          <Link
            to="/TimeHome"
            className={`flex items-center py-2 text-gray-700 hover:text-[#1B365D] transition-colors ${
              isActive("/") ? "font-medium text-[#1B365D]" : ""
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Home
          </Link>
         
          <Link
            to="/TimetableList"
            className={`flex items-center py-2 text-gray-700 hover:text-[#1B365D] transition-colors ${
              isActive("/schedules") ? "font-medium text-[#1B365D]" : ""
            }`}
          >
            <Calendar className="h-5 w-5 mr-3" />
            Schedules
          </Link>
         
          <Link
            to="/schedules"
            className={`flex items-center py-2 text-gray-700 hover:text-[#1B365D] transition-colors ${
              isActive("/timetable") ? "font-medium text-[#1B365D]" : ""
            }`}
          >
            <ClipboardList className="h-5 w-5 mr-3" />
            Timetable
          </Link>
         
          <Link
            to="/reports"
            className={`flex items-center py-2 text-gray-700 hover:text-[#1B365D] transition-colors ${
              isActive("/reports") ? "font-medium text-[#1B365D]" : ""
            }`}
          >
            <FileText className="h-5 w-5 mr-3" />
            Reports
          </Link>
        </nav>
      </div>
    </div>
  );
}