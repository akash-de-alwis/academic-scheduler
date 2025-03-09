import { useState, useEffect } from "react";
import axios from "axios";
import { Bell, ArrowLeft } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

export default function NotificationList() {
  const [notifications, setNotifications] = useState([]);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchNotifications = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Please log in to view notifications");
        return;
      }

      try {
        const response = await axios.get("http://localhost:5000/api/activities", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setNotifications(response.data); // Fetch all notifications, no limit
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load notifications");
      }
    };

    fetchNotifications();
  }, []);

  const formatNotificationTime = (timestamp) => {
    return new Date(timestamp).toLocaleString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getNotificationIcon = (type) => {
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

  return (
    <div className="min-h-screen p-8 bg-[#FFFFFF]">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <Link
              to="/StudentDashboard"
              className="p-2 bg-[#F5F7FA] rounded-full text-[#1B365D] hover:bg-[#1B365D]/10"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-3xl font-bold text-[#1B365D]">All Notifications</h1>
          </div>
        </div>

        {/* Notifications List */}
        <div className="bg-white rounded-xl shadow-md p-6 border border-[#E2E8F0]">
          {notifications.length > 0 ? (
            <div className="space-y-4">
              {notifications.map((notification) => (
                <div
                  key={notification._id}
                  className="p-4 bg-[#F5F7FA] rounded-lg flex items-start gap-4 hover:bg-[#1B365D]/5 transition-all duration-200"
                >
                  <div className="flex-shrink-0 mt-1">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1">
                    <p className="text-[#1B365D] font-medium text-base animate-pulse-once">
                      {notification.type === "added" && (
                        <>
                          <span className="font-bold text-green-600">New!</span> Subject{" "}
                          <span className="italic">"{notification.subjectName}"</span> was added
                        </>
                      )}
                      {notification.type === "edited" && (
                        <>
                          <span className="font-bold text-blue-600">Updated!</span> Subject{" "}
                          <span className="italic">"{notification.subjectName}"</span> was modified
                        </>
                      )}
                      {notification.type === "deleted" && (
                        <>
                          <span className="font-bold text-red-600">Gone!</span> Subject{" "}
                          <span className="italic">"{notification.subjectName}"</span> was removed
                        </>
                      )}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      {notification.subjectID} • {formatNotificationTime(notification.timestamp)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center">No notifications available.</p>
          )}
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

