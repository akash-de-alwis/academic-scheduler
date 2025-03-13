import { Link, useLocation, useNavigate } from "react-router-dom";

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path) => {
    return location.pathname === path;
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/LoginPage');
  };

  return (
    <div className="fixed top-0 left-0 h-screen bg-[#FFFFFF] border-r border-[#E2E8F0] w-72 shadow-2xl overflow-y-auto z-10 transition-all duration-300">
      <div className="p-6">
        {/* Title Section */}
        <h2 className="text-3xl font-black text-[#1B365D] mb-10 tracking-tight">
          Academic Scheduler
        </h2>

        {/* Navigation */}
        <nav className="space-y-4">
          <Link
            to="/lecHome"
            className={`flex items-center py-3 px-5 rounded-xl text-[#1B365D] hover:bg-[#F5F7FA] hover:shadow-xl transition-all duration-200 ${
              isActive("/lecHome")
                ? "bg-[#1B365D] text-[#FFFFFF] shadow-2xl font-bold"
                : "font-semibold"
            }`}
          >
            <div className="w-10 h-10 flex items-center justify-center mr-4 bg-[#F5F7FA] rounded-full shadow-md">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-[#1B365D]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={3}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
            Home
          </Link>

          <Link
            to="/lecturers"
            className={`flex items-center py-3 px-5 rounded-xl text-[#1B365D] hover:bg-[#F5F7FA] hover:shadow-xl transition-all duration-200 ${
              isActive("/lecturers")
                ? "bg-[#1B365D] text-[#FFFFFF] shadow-2xl font-bold"
                : "font-semibold"
            }`}
          >
            <div className="w-10 h-10 flex items-center justify-center mr-4 bg-[#F5F7FA] rounded-full shadow-md">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-[#1B365D]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={3}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            </div>
            Lecturers
          </Link>

          <Link
            to="/batches"
            className={`flex items-center py-3 px-5 rounded-xl text-[#1B365D] hover:bg-[#F5F7FA] hover:shadow-xl transition-all duration-200 ${
              isActive("/batches")
                ? "bg-[#1B365D] text-[#FFFFFF] shadow-2xl font-bold"
                : "font-semibold"
            }`}
          >
            <div className="w-10 h-10 flex items-center justify-center mr-4 bg-[#F5F7FA] rounded-full shadow-md">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-[#1B365D]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={3}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
            </div>
            Batches
          </Link>

          <Link
            to="/allocations"
            className={`flex items-center py-3 px-5 rounded-xl text-[#1B365D] hover:bg-[#F5F7FA] hover:shadow-xl transition-all duration-200 ${
              isActive("/allocations")
                ? "bg-[#1B365D] text-[#FFFFFF] shadow-2xl font-bold"
                : "font-semibold"
            }`}
          >
            <div className="w-10 h-10 flex items-center justify-center mr-4 bg-[#F5F7FA] rounded-full shadow-md">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-[#1B365D]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={3}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
            Allocations
          </Link>

          <Link
            to="/LecturerWorkload"
            className={`flex items-center py-3 px-5 rounded-xl text-[#1B365D] hover:bg-[#F5F7FA] hover:shadow-xl transition-all duration-200 ${
              isActive("/LecturerWorkload")
                ? "bg-[#1B365D] text-[#FFFFFF] shadow-2xl font-bold"
                : "font-semibold"
            }`}
          >
            <div className="w-10 h-10 flex items-center justify-center mr-4 bg-[#F5F7FA] rounded-full shadow-md">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-[#1B365D]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={3}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>
            Workload
          </Link>

          <Link
            to="/PrintableReports"
            className={`flex items-center py-3 px-5 rounded-xl text-[#1B365D] hover:bg-[#F5F7FA] hover:shadow-xl transition-all duration-200 ${
              isActive("/PrintableReports")
                ? "bg-[#1B365D] text-[#FFFFFF] shadow-2xl font-bold"
                : "font-semibold"
            }`}
          >
            <div className="w-10 h-10 flex items-center justify-center mr-4 bg-[#F5F7FA] rounded-full shadow-md">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-[#1B365D]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={3}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
            </div>
            Reports
          </Link>

          <button
            onClick={handleLogout}
            className={`flex items-center py-3 px-5 rounded-xl text-[#1B365D] hover:bg-[#F5F7FA] hover:shadow-xl transition-all duration-200 w-full text-left ${
              isActive("/LoginPage")
                ? "bg-[#1B365D] text-[#FFFFFF] shadow-2xl font-bold"
                : "font-semibold"
            }`}
          >
            <div className="w-10 h-10 flex items-center justify-center mr-4 bg-[#F5F7FA] rounded-full shadow-md">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-[#1B365D]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={3}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
            </div>
            Logout
          </button>
        </nav>
      </div>
    </div>
  );
}