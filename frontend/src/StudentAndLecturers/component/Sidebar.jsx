import { Link, useLocation } from "react-router-dom";

export default function Sidebar() {
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <div className="h-screen bg-[#FFFFFF] border-r border-[#E2E8F0] w-64 shadow-md">
      <div className="p-6">
        {/* Title Section */}
        <h2 className="text-2xl font-bold text-[#1B365D] mb-8">
          Academic Scheduler
        </h2>

        {/* Navigation */}
        <nav className="space-y-2">
          <Link
            to="/lecHome"
            className={`flex items-center py-3 px-4 rounded-lg text-[#1B365D] hover:bg-[#F5F7FA] hover:shadow-sm transition-all duration-300 ${
              isActive("/lecHome")
                ? "bg-[#1B365D] text-[#FFFFFF] hover:bg-[#1B365D]/90 font-semibold"
                : "font-medium"
            }`}
          >
            <div className="w-8 h-8 flex items-center justify-center mr-3">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
            Home
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
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            </div>
            Lecturers
          </Link>

          <Link
            to="/batches"
            className={`flex items-center py-3 px-4 rounded-lg text-[#1B365D] hover:bg-[#F5F7FA] hover:shadow-sm transition-all duration-300 ${
              isActive("/batches")
                ? "bg-[#1B365D] text-[#FFFFFF] hover:bg-[#1B365D]/90 font-semibold"
                : "font-medium"
            }`}
          >
            <div className="w-8 h-8 flex items-center justify-center mr-3">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
            </div>
            Batches
          </Link>

          <Link
            to="/allocations"
            className={`flex items-center py-3 px-4 rounded-lg text-[#1B365D] hover:bg-[#F5F7FA] hover:shadow-sm transition-all duration-300 ${
              isActive("/allocations")
                ? "bg-[#1B365D] text-[#FFFFFF] hover:bg-[#1B365D]/90 font-semibold"
                : "font-medium"
            }`}
          >
            <div className="w-8 h-8 flex items-center justify-center mr-3">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
            Allocations
          </Link>

          <Link
            to="/PrintableReports"
            className={`flex items-center py-3 px-4 rounded-lg text-[#1B365D] hover:bg-[#F5F7FA] hover:shadow-sm transition-all duration-300 ${
              isActive("/PrintableReports")
                ? "bg-[#1B365D] text-[#FFFFFF] hover:bg-[#1B365D]/90 font-semibold"
                : "font-medium"
            }`}
          >
            <div className="w-8 h-8 flex items-center justify-center mr-3">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
            </div>
            Reports
          </Link>
        </nav>
      </div>
    </div>
  );
}