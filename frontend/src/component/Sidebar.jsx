import { Link, useLocation } from "react-router-dom";

export default function Sidebar() {
  const location = useLocation();
  
  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <div className="h-screen bg-white border-r border-gray-100 w-64">
      <div className="p-6">
        <h2 className="text-xl font-bold mb-8">Academic Scheduler</h2>
        
        <nav className="space-y-3">
          <Link
            to="/"
            className={`flex items-center py-2 text-gray-700 hover:text-black ${
              isActive("/") ? "font-medium" : ""
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Home
          </Link>
          
          <Link
            to="/lecturers"
            className={`flex items-center py-2 text-gray-700 hover:text-black ${
              isActive("/lecturers") ? "font-medium" : ""
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            Lecturers
          </Link>
          
          <Link
            to="/batches"
            className={`flex items-center py-2 text-gray-700 hover:text-black ${
              isActive("/batches") ? "font-medium" : ""
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            Batches
          </Link>
          
          <Link
            to="/allocations"
            className={`flex items-center py-2 text-gray-700 hover:text-black ${
              isActive("/allocations") ? "font-medium" : ""
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Allocations
          </Link>
        </nav>
      </div>
    </div>
  );
}