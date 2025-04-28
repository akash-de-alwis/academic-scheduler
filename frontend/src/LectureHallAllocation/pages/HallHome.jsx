import React, { useState, useEffect } from "react";
import { Calendar, Users, BookOpen, AlertTriangle, Building } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const DashboardStats = ({ icon: Icon, title, value, subtitle }) => (
  <div className="bg-[#F5F7FA] p-6 rounded-lg shadow-sm relative">
    <Icon className="absolute top-6 right-6 w-6 h-6 text-[#1B365D]" />
    <div>
      <p className="text-2xl font-bold text-[#1B365D]">{value}</p>
      <p className="text-sm font-medium text-[#1B365D]">{title}</p>
      <p className="text-xs text-gray-500">{subtitle}</p>
    </div>
  </div>
);

const ResourceAllocation = ({ rooms }) => {
  const lectureHalls = rooms.filter(room => room.hallType === "Lecturer Hall").length;
  const laboratories = rooms.filter(room => room.hallType === "Laboratory").length;
  const meetingRooms = rooms.filter(room => room.hallType === "Meeting Room").length;
  const total = rooms.length;

  const getPercentage = (count) => total > 0 ? `${Math.round((count / total) * 100)}%` : "0%";

  return (
    <div className="bg-[#F5F7FA] p-6 rounded-lg shadow-sm mt-6">
      <h2 className="text-xl font-bold text-[#1B365D] mb-4">Resource Distribution</h2>
      {[
        { name: "Lecture Halls", count: `${lectureHalls} venues` },
        { name: "Laboratories", count: `${laboratories} labs` },
        { name: "Meeting Rooms", count: `${meetingRooms} rooms` },
      ].map((item) => (
        <div key={item.name} className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-[#1B365D]">{item.name}</span>
            <span className="text-sm text-gray-500">{item.count}</span>
          </div>
          <div className="w-full bg-[#F5F7FA] rounded-full h-2">
            <div
              className="bg-[#1B365D] h-2 rounded-full"
              style={{ width: getPercentage(parseInt(item.count.split(" ")[0])) }}
            />
          </div>
        </div>
      ))}
    </div>
  );
};

const ActionButtons = () => {
  const navigate = useNavigate();
  
  const actions = [
    { title: "Add Venues", icon: Building, path: "/RoomList" },
    { title: "Bookings", icon: Calendar, path: "/BookingReview" },
    { title: "Book Meetings", icon: Users, path: "/MeetingRoomList" },
    { title: "Report Issues", icon: AlertTriangle, path: "/HallIssues" },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
      {actions.map((action) => (
        <button
          key={action.title}
          onClick={() => navigate(action.path)}
          className="flex items-center justify-center space-x-2 bg-[#1B365D] text-white p-4 rounded-lg hover:bg-opacity-90 transition-all"
        >
          <action.icon className="w-5 h-5" />
          <span>{action.title}</span>
        </button>
      ))}
    </div>
  );
};

const HallHome = () => {
  const [stats, setStats] = useState({
    totalVenues: 0,
    activeBookings: 0,
    pendingBookings: 0,
    pendingIssues: 0,
  });
  const [rooms, setRooms] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch rooms
        const roomsResponse = await axios.get("http://localhost:5000/api/rooms");
        const roomsData = roomsResponse.data;
        setRooms(roomsData);

        // Fetch bookings
        const bookingsResponse = await axios.get("http://localhost:5000/api/bookings");
        const bookingsData = bookingsResponse.data;

        // Fetch facility issues
        const issuesResponse = await axios.get("http://localhost:5000/api/facility-issues");
        const issuesData = issuesResponse.data;

        // Calculate stats
        const totalVenues = roomsData.length;
        const activeBookings = bookingsData.filter(booking => booking.status === "Approved").length;
        const pendingBookings = bookingsData.filter(booking => booking.status === "Pending").length;
        const pendingIssues = issuesData.filter(issue => issue.status === "Pending").length;

        setStats({
          totalVenues,
          activeBookings,
          pendingBookings,
          pendingIssues,
        });
      } catch (err) {
        console.error("Failed to fetch dashboard data:", err);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#1B365D]">Resource Management Dashboard</h1>
        <p className="text-gray-500">Overview of lecture halls, labs, and resource allocation</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <DashboardStats
          icon={Building}
          title="Total Venues"
          value={stats.totalVenues}
          subtitle="Halls, Labs & Meeting Rooms"
        />
        <DashboardStats
          icon={Calendar}
          title="Active Bookings"
          value={stats.activeBookings}
          subtitle="Across all venues"
        />
        <DashboardStats
          icon={AlertTriangle}
          title="Pending Issues"
          value={stats.pendingIssues} // Dynamically updated
          subtitle="Maintenance & repairs"
        />
        <DashboardStats
          icon={BookOpen}
          title="Pending Bookings"
          value={stats.pendingBookings}
          subtitle="Awaiting review"
        />
      </div>
      <ResourceAllocation rooms={rooms} />
      <ActionButtons />
    </div>
  );
};

export default HallHome;