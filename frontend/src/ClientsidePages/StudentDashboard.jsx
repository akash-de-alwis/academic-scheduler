import { useState, useEffect } from "react";
import axios from "axios";
import { Calendar, BookOpen, Clock, User, Bell, Users, LogOut, AlertTriangle, DoorOpen } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

export default function StudentDashboard() {
  const [timetable, setTimetable] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [bookings, setBookings] = useState([]); // Added for bookings
  const [userInfo, setUserInfo] = useState(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [error, setError] = useState("");
  const [activities, setActivities] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Please log in to view your dashboard");
        return;
      }

      try {
        // Fetch user info
        const userResponse = await axios.get("http://localhost:5000/api/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUserInfo(userResponse.data);

        // Fetch timetable
        const timetableResponse = await axios.get("http://localhost:5000/api/timetable", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const updatedSchedules = timetableResponse.data.map((schedule) => ({
          ...schedule,
          duration: schedule.duration || "1",
        }));
        setTimetable(updatedSchedules.filter((s) => s.batch === userResponse.data.batch));

        // Fetch enrolled subjects
        const subjectsResponse = await axios.get("http://localhost:5000/api/subjects", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSubjects(subjectsResponse.data.filter((s) => s.year === userResponse.data.currentYear));

        // Fetch bookings (assuming an endpoint exists)
        const bookingsResponse = await axios.get("http://localhost:5000/api/bookings", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setBookings(bookingsResponse.data.filter(b => b.studentId === userResponse.data._id));
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load dashboard data");
      }
    };

    fetchData();
  }, []);

  const getTodaySchedule = () => {
    const today = currentDate.toISOString().split("T")[0];
    return timetable.filter((schedule) => schedule.date === today);
  };

  const getUpcomingEvents = () => {
    const today = new Date();
    return timetable
      .filter((schedule) => new Date(schedule.date) >= today)
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .slice(0, 3);
  };

  const formatTime = (time) => {
    const [hours, minutes] = time.split(":");
    const hourNum = parseInt(hours);
    const period = hourNum >= 12 ? "PM" : "AM";
    const adjustedHour = hourNum % 12 || 12;
    return `${adjustedHour}:${minutes} ${period}`;
  };

  const formatActivityTime = (timestamp) => {
    return new Date(timestamp).toLocaleString("en-GB", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setUserInfo(null);
    navigate("/LoginPage");
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case "added":
        return <span className="text-green-500">➕</span>;
      case "edited":
        return <span className="text-blue-500">✏️</span>;
      case "deleted":
        return <span className="text-red-500">🗑️</span>;
      default:
        return <span className="text-gray-500">🔔</span>;
    }
  };

  if (error) {
    return (
      <div className="min-h-screen p-8 bg-[#FFFFFF] flex items-center justify-center">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  if (!userInfo) {
    return (
      <div className="min-h-screen p-8 bg-[#FFFFFF] flex items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8 bg-[#FFFFFF]">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-[#1B365D]">
              Welcome, {userInfo.fullName}!
            </h1>
            <p className="text-sm text-gray-500">
              {userInfo.batch} | {currentDate.toLocaleDateString("en-GB", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 bg-[#F5F7FA] rounded-full text-[#1B365D] hover:bg-[#1B365D]/10 relative"
              >
                <Bell className="w-5 h-5" />
                {activities.length > 0 && (
                  <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
                )}
              </button>
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-[#E2E8F0] z-10 max-h-96 overflow-y-auto">
                  <div className="p-4 border-b border-[#E2E8F0]">
                    <h3 className="text-lg font-semibold text-[#1B365D]">Notifications</h3>
                  </div>
                  {activities.length > 0 ? (
                    <div className="p-2">
                      {activities.map((activity) => (
                        <div
                          key={activity._id}
                          className="p-3 mb-2 bg-[#F5F7FA] rounded-lg flex items-start gap-3 hover:bg-[#1B365D]/5 transition-all duration-200"
                        >
                          <div className="flex-shrink-0 mt-1">
                            {getActivityIcon(activity.type)}
                          </div>
                          <div className="flex-1">
                            <p className="text-[#1B365D] font-medium text-sm animate-pulse-once">
                              {activity.type === "added" && (
                                <>
                                  <span className="font-bold text-green-600">New!</span> Subject{" "}
                                  <span className="italic">"{activity.subjectName}"</span> was added
                                </>
                              )}
                              {activity.type === "edited" && (
                                <>
                                  <span className="font-bold text-blue-600">Updated!</span> Subject{" "}
                                  <span className="italic">"{activity.subjectName}"</span> was modified
                                </>
                              )}
                              {activity.type === "deleted" && (
                                <>
                                  <span className="font-bold text-red-600">Gone!</span> Subject{" "}
                                  <span className="italic">"{activity.subjectName}"</span> was removed
                                </>
                              )}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              {activity.subjectID} • {formatActivityTime(activity.timestamp)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 text-center text-gray-500">
                      No new notifications
                    </div>
                  )}
                  <div className="p-2 border-t border-[#E2E8F0]">
                    <Link
                      to="/NotificationList"
                      className="block text-center text-[#1B365D] hover:text-[#1B365D]/70 text-sm"
                      onClick={() => setShowNotifications(false)}
                    >
                      View All Activities
                    </Link>
                  </div>
                </div>
              )}
            </div>
            <button
              onClick={handleLogout}
              className="p-2 bg-red-100 rounded-full text-red-600 hover:bg-red-200 transition-all duration-200"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
            <Link to="/StudentProfile" className="flex items-center gap-2">
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
              <span className="text-[#1B365D] font-medium">{userInfo.fullName}</span>
            </Link>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Today’s Schedule */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-md p-6 border border-[#E2E8F0]">
            <h2 className="text-xl font-semibold text-[#1B365D] mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5" /> Today’s Schedule
            </h2>
            {getTodaySchedule().length > 0 ? (
              <div className="space-y-4">
                {getTodaySchedule().map((schedule) => (
                  <div
                    key={schedule._id}
                    className="bg-[#F5F7FA] p-4 rounded-lg flex items-center gap-4"
                  >
                    <div className="bg-[#1B365D]/10 p-2 rounded-full">
                      <Clock className="w-5 h-5 text-[#1B365D]" />
                    </div>
                    <div className="flex-1">
                      <p className="text-[#1B365D] font-semibold">{schedule.subject}</p>
                      <p className="text-sm text-gray-600">
                        {formatTime(schedule.time)} | {schedule.duration} hr(s) | {schedule.room}
                      </p>
                      <p className="text-sm text-gray-600">Lecturer: {schedule.lecturer}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No classes scheduled for today.</p>
            )}
          </div>

          {/* Quick Links */}
          <div className="bg-white rounded-xl shadow-md p-6 border border-[#E2E8F0]">
            <h2 className="text-xl font-semibold text-[#1B365D] mb-4">Quick Links</h2>
            <div className="space-y-3">
              <Link
                to="/timetable"
                className="w-full text-left p-3 bg-[#F5F7FA] rounded-lg text-[#1B365D] hover:bg-[#1B365D]/10 flex items-center gap-2"
              >
                <Calendar className="w-5 h-5" /> View Full Timetable
              </Link>
              <Link
                to="/subjects"
                className="w-full text-left p-3 bg-[#F5F7FA] rounded-lg text-[#1B365D] hover:bg-[#1B365D]/10 flex items-center gap-2"
              >
                <BookOpen className="w-5 h-5" /> Enrolled Subjects
              </Link>
              <Link
                to="/StudentProfile"
                className="w-full text-left p-3 bg-[#F5F7FA] rounded-lg text-[#1B365D] hover:bg-[#1B365D]/10 flex items-center gap-2"
              >
                <User className="w-5 h-5" /> Profile
              </Link>
              <Link
                to="/StudentPortal"
                className="w-full text-left p-3 bg-[#F5F7FA] rounded-lg text-[#1B365D] hover:bg-[#1B365D]/10 flex items-center gap-2"
              >
                <Users className="w-5 h-5" /> Batch Details
              </Link>
              <Link
                to="/RaisingIssues"
                className="w-full text-left p-3 bg-[#F5F7FA] rounded-lg text-[#1B365D] hover:bg-[#1B365D]/10 flex items-center gap-2"
              >
                <AlertTriangle className="w-5 h-5" /> Facility Issues
              </Link>
              <Link
                to="/MeetingRoomBooking"
                className="w-full text-left p-3 bg-[#F5F7FA] rounded-lg text-[#1B365D] hover:bg-[#1B365D]/10 flex items-center gap-2"
              >
                <DoorOpen className="w-5 h-5" /> Meeting Room Booking
              </Link>
            </div>
          </div>

          {/* Enrolled Subjects */}
          <div className="bg-white rounded-xl shadow-md p-6 border border-[#E2E8F0]">
            <h2 className="text-xl font-semibold text-[#1B365D] mb-4 flex items-center gap-2">
              <BookOpen className="w-5 h-5" /> Enrolled Subjects
            </h2>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {subjects.slice(0, 5).map((subject) => (
                <div
                  key={subject._id}
                  className="flex items-center gap-3 p-2 bg-[#F5F7FA] rounded-lg"
                >
                  <div className="bg-[#1B365D]/10 p-2 rounded-full">
                    <BookOpen className="w-4 h-4 text-[#1B365D]" />
                  </div>
                  <div>
                    <p className="text-[#1B365D] font-medium">{subject.subjectName}</p>
                    <p className="text-xs text-gray-500">{subject.subjectID} | {subject.credit} credits</p>
                  </div>
                </div>
              ))}
            </div>
            {subjects.length > 5 && (
              <Link to="/subjects" className="mt-4 text-[#1B365D] hover:text-[#1B365D]/70 text-sm">
                View All Subjects
              </Link>
            )}
          </div>

          {/* View Bookings */}
          <div className="bg-white rounded-xl shadow-md p-6 border border-[#E2E8F0]">
            <h2 className="text-xl font-semibold text-[#1B365D] mb-4 flex items-center gap-2">
              <DoorOpen className="w-5 h-5" />
              <Link to="/BookingManagement" >
                View Bookings
              </Link> 
            </h2>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {bookings.slice(0, 5).map((booking) => (
                <div
                  key={booking._id}
                  className="flex items-center gap-3 p-2 bg-[#F5F7FA] rounded-lg"
                >
                  <div className="bg-[#1B365D]/10 p-2 rounded-full">
                    <DoorOpen className="w-4 h-4 text-[#1B365D]" />
                  </div>
                  <div>
                    <p className="text-[#1B365D] font-medium">{booking.roomId}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(booking.date).toLocaleDateString("en-GB")} | {formatTime(booking.startTime)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            {bookings.length > 5 && (
              <Link to="" className="mt-4 text-[#1B365D] hover:text-[#1B365D]/70 text-sm">
                View All Bookings
              </Link>
            )}
            {/*bookings.length === 0 && (
              <p className="text-gray-500 text-sm">No bookings found.</p>
            )*/}
          </div>

          {/* Upcoming Events */}
          <div className="bg-white rounded-xl shadow-md p-6 border border-[#E2E8F0]">
            <h2 className="text-xl font-semibold text-[#1B365D] mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5" /> Upcoming Events
            </h2>
            <div className="space-y-4">
              {getUpcomingEvents().length > 0 ? (
                getUpcomingEvents().map((event) => (
                  <div
                    key={event._id}
                    className="bg-[#F5F7FA] p-3 rounded-lg flex items-center gap-3"
                  >
                    <div className="bg-[#1B365D]/10 p-2 rounded-full">
                      <Calendar className="w-4 h-4 text-[#1B365D]" />
                    </div>
                    <div>
                      <p className="text-[#1B365D] font-medium">{event.subject}</p>
                      <p className="text-xs text-gray-600">
                        {new Date(event.date).toLocaleDateString("en-GB")} | {formatTime(event.time)}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500">No upcoming events.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* CSS for animation */}
      <style jsx>{`
        @keyframes pulseOnce {
          0% { transform: scale(1); }
          50% { transform: scale(1.05); }
          100% { transform: scale(1); }
        }
        .animate-pulse-once {
          animation: pulseOnce 0.5s ease-in-out;
        }
      `}</style>
    </div>
  );
}