import { Link, useLocation } from "react-router-dom";

export default function SubSidebar() {
  const location = useLocation();
  
  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <div className="fixed top-0 left-0 h-screen bg-[#FFFFFF] border-r border-[#E2E8F0] w-64 shadow-md overflow-y-auto z-10">
      <div className="p-6">
        <h2 className="text-2xl font-bold text-[#1B365D] mb-8">Academic Scheduler</h2>
        
        <nav className="space-y-2">
          <Link
            to="/SubjectHome"
            className={`flex items-center py-3 px-4 rounded-lg text-[#1B365D] hover:bg-[#F5F7FA] hover:shadow-sm transition-all duration-300 ${
              isActive("/SubjectHome")
                ? "bg-[#1B365D] text-[#FFFFFF] hover:bg-[#1B365D]/90 font-semibold"
                : "font-medium"
            }`}
          >
            <div className="w-8 h-8 flex items-center justify-center mr-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            Home
          </Link>
          
          <Link
            to="/SubjectList"
            className={`flex items-center py-3 px-4 rounded-lg text-[#1B365D] hover:bg-[#F5F7FA] hover:shadow-sm transition-all duration-300 ${
              isActive("/SubjectList")
                ? "bg-[#1B365D] text-[#FFFFFF] hover:bg-[#1B365D]/90 font-semibold"
                : "font-medium"
            }`}
          >
            <div className="w-8 h-8 flex items-center justify-center mr-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            Subjects
          </Link>
          
          <Link
            to="/lecturers"
            className={`flex items-center py-3 px-4 rounded-lg text-[#1B365D] hover:bg-[#F5F7FA] hover:shadow-sm transition-all duration-300 ${
              isActive("/lecturers")
                ? "bg-[#1B365D] text-[#FFFFFF] hover:bg-[#1B365D]/90 font-semibold"
                : "font-medium"
            }`}
          >
            <div className="w-8 h-8 flex items-center justify-center mr-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            Lecturers
          </Link>
          
          <Link
            to="/reports"
            className={`flex items-center py-3 px-4 rounded-lg text-[#1B365D] hover:bg-[#F5F7FA] hover:shadow-sm transition-all duration-300 ${
              isActive("/reports")
                ? "bg-[#1B365D] text-[#FFFFFF] hover:bg-[#1B365D]/90 font-semibold"
                : "font-medium"
            }`}
          >
            <div className="w-8 h-8 flex items-center justify-center mr-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            Reports
          </Link>
        </nav>
      </div>
    </div>
  );
}