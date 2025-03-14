import { useState, useEffect } from "react";
import axios from "axios";

// Constants for layout configuration
const CANVAS_WIDTH = 1080;
const CANVAS_HEIGHT = 600;
const ROOM_WIDTH = 120;
const ROOM_HEIGHT = 120;
const SPACING = 20;
const CORRIDOR_TOP = 200;
const CORRIDOR_BOTTOM = 300;
const COLUMNS_PER_ROW = Math.floor(CANVAS_WIDTH / (ROOM_WIDTH + SPACING)); // ~8

// Static zones configuration
const STATIC_ZONES = [
  { id: "Library", x: 20, y: 340, width: 240, height: 120, colStart: 0, colEnd: 1 },
  { id: "Cafeteria", x: 300, y: 40, width: 240, height: 120, colStart: 2, colEnd: 3 },
  { id: "UnderConstruction", x: 860, y: 340, width: 180, height: 120, colStart: 6, colEnd: 7 },
];

// Function to calculate room position using a grid system
const calculateRoomPosition = (index, rooms) => {
  const totalRooms = rooms.length;
  if (index >= 16) {
    console.warn("Maximum room capacity exceeded. Consider expanding the grid.");
    return { x: 20, y: 40 }; // Fallback position
  }

  const topZoneSlots = Array(COLUMNS_PER_ROW).fill(true);
  const bottomZoneSlots = Array(COLUMNS_PER_ROW).fill(true);

  STATIC_ZONES.forEach((zone) => {
    if (zone.y === 40) {
      for (let col = zone.colStart; col <= zone.colEnd; col++) {
        topZoneSlots[col] = false;
      }
    } else if (zone.y === 340) {
      for (let col = zone.colStart; col <= zone.colEnd; col++) {
        bottomZoneSlots[col] = false;
      }
    }
  });

  const topAvailable = topZoneSlots.filter(Boolean).length;
  const isTopZone = index < topAvailable;

  const zoneSlots = isTopZone ? topZoneSlots : bottomZoneSlots;
  const zoneY = isTopZone ? 40 : 340;
  let slotIndex = isTopZone ? index : index - topAvailable;

  let col = -1;
  for (let i = 0; i < COLUMNS_PER_ROW && slotIndex >= 0; i++) {
    if (zoneSlots[i]) {
      if (slotIndex === 0) {
        col = i;
        break;
      }
      slotIndex--;
    }
  }

  const x = 20 + col * (ROOM_WIDTH + SPACING);
  const y = zoneY;

  return { x, y };
};

// FloorMap component with warning sign and modal trigger
const FloorMap = ({ filteredRooms, issues, showMaintenanceModal }) => (
  <div className="mt-8 bg-white rounded-xl shadow-lg p-6 border border-[#E2E8F0]">
    <h3 className="text-xl font-semibold text-[#1B365D] mb-4">Floor Map</h3>
    {filteredRooms.length > 0 ? (
      <svg width="100%" height={CANVAS_HEIGHT} className="border border-[#E2E8F0] rounded-lg bg-[#F8FAFC]">
        {/* Corridor */}
        <rect x="0" y={CORRIDOR_TOP} width="100%" height="100" fill="#E2E8F0" />
        <text x="10" y={CORRIDOR_TOP + 50} fill="#1B365D" fontSize="16" fontWeight="medium">
          Corridor
        </text>

        {/* Static Features */}
        {STATIC_ZONES.map((zone) => (
          <g key={zone.id}>
            <rect
              x={zone.x}
              y={zone.y}
              width={zone.width}
              height={zone.height}
              fill={zone.id === "Library" ? "#FFF7ED" : zone.id === "Cafeteria" ? "#ECFDF5" : "#FEE2E2"}
              stroke={zone.id === "Library" ? "#F97316" : zone.id === "Cafeteria" ? "#10B981" : "#EF4444"}
              strokeWidth="2"
              rx="5"
            />
            <text
              x={zone.x + zone.width / 2}
              y={zone.y + 40}
              textAnchor="middle"
              fill={zone.id === "Library" ? "#F97316" : zone.id === "Cafeteria" ? "#10B981" : "#EF4444"}
              fontSize="14"
              fontWeight="medium"
            >
              {zone.id}
            </text>
            <text
              x={zone.x + zone.width / 2}
              y={zone.y + 70}
              textAnchor="middle"
              fill="#6B7280"
              fontSize="10"
            >
              {zone.id === "Library" ? "Open Space" : zone.id === "Cafeteria" ? "Dining Area" : "Future Room"}
            </text>
          </g>
        ))}

        {/* Dynamic Rooms */}
        {filteredRooms.map((room, index) => {
          const { x, y } = calculateRoomPosition(index, filteredRooms);
          const isMeetingRoom = room.hallType === "Meeting Room";
          const hasIssue = issues.some((issue) => issue.roomId === room.LID && issue.status === "Pending");
          const isUnderMaintenance = room.status === "Under Maintenance";

          return (
            <g key={room._id}>
              <rect
                x={x}
                y={y}
                width={ROOM_WIDTH}
                height={ROOM_HEIGHT}
                fill={isUnderMaintenance ? "#FEE2E2" : isMeetingRoom ? "#E6F0FA" : "#FFFFFF"}
                stroke={isUnderMaintenance ? "#EF4444" : isMeetingRoom ? "#1B365D" : "#6B7280"}
                strokeWidth={isMeetingRoom ? "3" : "2"}
                rx="5"
                className="hover:fill-[#1B365D]/20 transition-all duration-200"
              />
              <text
                x={x + ROOM_WIDTH / 2}
                y={y + 30}
                textAnchor="middle"
                fill="#1B365D"
                fontSize="12"
                fontWeight="medium"
              >
                {room.LID}
              </text>
              <text
                x={x + ROOM_WIDTH / 2}
                y={y + 50}
                textAnchor="middle"
                fill="#6B7280"
                fontSize="10"
              >
                {isUnderMaintenance ? "Under Maintenance" : room.hallType}
              </text>
              <text
                x={x + ROOM_WIDTH / 2}
                y={y + 70}
                textAnchor="middle"
                fill="#6B7280"
                fontSize="10"
              >
                Seats: {room.totalSeats || "-"}
              </text>
              {hasIssue && !isUnderMaintenance && (
                <g
                  onClick={() => showMaintenanceModal(room._id, room.LID)}
                  className="cursor-pointer"
                >
                  <circle
                    cx={x + ROOM_WIDTH - 15}
                    cy={y + 15}
                    r="12"
                    fill="#F59E0B"
                    stroke="#D97706"
                    strokeWidth="2"
                    className="hover:fill-[#FBBF24] transition-all duration-200"
                  />
                  <text
                    x={x + ROOM_WIDTH - 15}
                    y={y + 20}
                    textAnchor="middle"
                    fill="#FFFFFF"
                    fontSize="14"
                    fontWeight="bold"
                  >
                    !
                  </text>
                </g>
              )}
            </g>
          );
        })}
      </svg>
    ) : (
      <p className="text-gray-500 text-center">No rooms match the selected filters</p>
    )}
  </div>
);

export default function MeetingRoomList() {
  const [allRooms, setAllRooms] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortDirection, setSortDirection] = useState("asc");
  const [showForm, setShowForm] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);
  const [newRoom, setNewRoom] = useState({
    LID: "",
    hallType: "Meeting Room",
    department: "Computer Faculty",
    floor: "",
    totalSeats: "",
    status: "Available",
  });
  const [errors, setErrors] = useState({});
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [selectedFloor, setSelectedFloor] = useState("");
  const [filteredRooms, setFilteredRooms] = useState([]);
  const [issues, setIssues] = useState([]);
  const [showMaintenanceModal, setShowMaintenanceModal] = useState(false);
  const [selectedRoomLID, setSelectedRoomLID] = useState("");

  // Fetch rooms and issues on mount
  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/rooms");
        setAllRooms(res.data);
        setFilteredRooms(res.data.filter((room) => room.hallType === "Meeting Room"));
      } catch (err) {
        console.error(err);
      }
    };

    const fetchIssues = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/facility-issues");
        setIssues(res.data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchRooms();
    fetchIssues();
  }, []);

  const departments = [...new Set(allRooms.map((room) => room.department))];
  const floors = [...new Set(allRooms.map((room) => room.floor))];

  const handleFilter = () => {
    let filtered = allRooms;
    if (selectedDepartment) {
      filtered = filtered.filter((room) => room.department === selectedDepartment);
    }
    if (selectedFloor) {
      filtered = filtered.filter((room) => room.floor === selectedFloor);
    }
    setFilteredRooms(filtered);
  };

  useEffect(() => {
    handleFilter();
  }, [selectedDepartment, selectedFloor]);

  const handleSearch = (term) => {
    const filtered = allRooms.filter(
      (room) =>
        room.LID.toLowerCase().includes(term.toLowerCase()) ||
        room.department.toLowerCase().includes(term.toLowerCase())
    );
    setAllRooms(filtered);
    setSearchTerm(term);
    setFilteredRooms(filtered.filter((room) => room.hallType === "Meeting Room"));
  };

  const handleSort = () => {
    const sorted = [...filteredRooms].sort((a, b) => {
      const comparison = a.LID.localeCompare(b.LID);
      return sortDirection === "asc" ? comparison : -comparison;
    });
    setFilteredRooms(sorted);
    setSortDirection(sortDirection === "asc" ? "desc" : "asc");
  };

  const validateForm = () => {
    const newErrors = {};
    if (!newRoom.LID.trim()) newErrors.LID = "Room ID is required";
    else if (!/^[A-Za-z0-9-]+$/.test(newRoom.LID))
      newErrors.LID = "Room ID can only contain letters, numbers, and hyphens";
    if (!newRoom.floor.trim()) newErrors.floor = "Floor is required";
    else if (!/^[0-9]+$/.test(newRoom.floor)) newErrors.floor = "Floor must be a number";
    if (!newRoom.totalSeats) newErrors.totalSeats = "Total Seats is required";
    else if (isNaN(newRoom.totalSeats) || newRoom.totalSeats <= 0)
      newErrors.totalSeats = "Total Seats must be a positive number";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveRoom = async () => {
    if (!validateForm()) return;
    try {
      if (editingRoom) {
        const res = await axios.put(`http://localhost:5000/api/rooms/${editingRoom._id}`, newRoom);
        const updatedRooms = allRooms.map((room) =>
          room._id === editingRoom._id ? res.data : room
        );
        setAllRooms(updatedRooms);
        setFilteredRooms(updatedRooms.filter((room) =>
          (!selectedDepartment || room.department === selectedDepartment) &&
          (!selectedFloor || room.floor === selectedFloor)
        ));
      } else {
        const res = await axios.post("http://localhost:5000/api/rooms", newRoom);
        const updatedRooms = [...allRooms, res.data];
        setAllRooms(updatedRooms);
        setFilteredRooms(updatedRooms.filter((room) =>
          (!selectedDepartment || room.department === selectedDepartment) &&
          (!selectedFloor || room.floor === selectedFloor)
        ));
      }
      resetForm();
    } catch (err) {
      console.error(err.response ? err.response.data : err);
    }
  };

  const handleDeleteRoom = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/rooms/${id}`);
      const updatedRooms = allRooms.filter((room) => room._id !== id);
      setAllRooms(updatedRooms);
      setFilteredRooms(updatedRooms.filter((room) =>
        (!selectedDepartment || room.department === selectedDepartment) &&
        (!selectedFloor || room.floor === selectedFloor)
      ));
    } catch (err) {
      console.error(err.response ? err.response.data : err);
    }
  };

  const resetForm = () => {
    setShowForm(false);
    setNewRoom({
      LID: "",
      hallType: "Meeting Room",
      department: "Computer Faculty",
      floor: "",
      totalSeats: "",
      status: "Available",
    });
    setEditingRoom(null);
    setErrors({});
  };

  const handleShowMaintenanceModal = (roomId, roomLID) => {
    setSelectedRoomLID(roomLID);
    setShowMaintenanceModal(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#E6F0FA] to-[#FFFFFF] p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-[#1B365D] tracking-tight">Meeting Room List</h2>
          <button
            onClick={() => setShowForm(true)}
            className="bg-[#1B365D] text-white px-4 py-2 rounded-lg hover:bg-[#1B365D]/90"
          >
            Add New Room
          </button>
        </div>

        <div className="flex gap-4 mb-8">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search meeting rooms..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full px-4 py-2 border border-[#E2E8F0] rounded-lg bg-[#F8FAFC] text-[#1B365D] focus:ring-2 focus:ring-[#1B365D] shadow-sm"
            />
          </div>
          <select
            value={selectedDepartment}
            onChange={(e) => setSelectedDepartment(e.target.value)}
            className="px-4 py-2 border border-[#E2E8F0] rounded-lg bg-[#F8FAFC] text-[#1B365D] focus:ring-2 focus:ring-[#1B365D] shadow-sm"
          >
            <option value="">All Departments</option>
            {departments.map((dept) => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
          </select>
          <select
            value={selectedFloor}
            onChange={(e) => setSelectedFloor(e.target.value)}
            className="px-4 py-2 border border-[#E2E8F0] rounded-lg bg-[#F8FAFC] text-[#1B365D] focus:ring-2 focus:ring-[#1B365D] shadow-sm"
          >
            <option value="">All Floors</option>
            {floors.map((floor) => (
              <option key={floor} value={floor}>
                {floor}
              </option>
            ))}
          </select>
          <button
            onClick={handleSort}
            className="px-4 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg flex items-center gap-2 text-[#1B365D] hover:bg-[#1B365D]/10 shadow-sm"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
            </svg>
            Sort by name {sortDirection === "asc" ? "↑" : "↓"}
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-[#E2E8F0]">
          <table className="w-full text-left">
            <thead className="bg-[#F8FAFC] text-[#1B365D]">
              <tr className="border-b border-[#E2E8F0]">
                <th className="p-5 font-semibold text-sm uppercase tracking-wide">Room ID</th>
                <th className="p-5 font-semibold text-sm uppercase tracking-wide">Department</th>
                <th className="p-5 font-semibold text-sm uppercase tracking-wide">Floor</th>
                <th className="p-5 font-semibold text-sm uppercase tracking-wide">Capacity</th>
                <th className="p-5 font-semibold text-sm uppercase tracking-wide">Status</th>
                <th className="p-5 font-semibold text-sm uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRooms.filter((room) => room.hallType === "Meeting Room").map((room) => (
                <tr
                  key={room._id}
                  className="border-b border-[#E2E8F0] hover:bg-[#F8FAFC] transition-all duration-200"
                >
                  <td className="p-5">
                    <span className="text-[#1B365D] font-medium">{room.LID}</span>
                  </td>
                  <td className="p-5 text-[#1B365D]">{room.department}</td>
                  <td className="p-5 text-[#1B365D]">{room.floor}</td>
                  <td className="p-5 text-[#1B365D]">{room.totalSeats}</td>
                  <td className="p-5 text-[#1B365D]">
                    {room.status || "Available"}
                    {issues.some((issue) => issue.roomId === room.LID && issue.status === "Pending") && (
                      <span className="ml-2 text-yellow-600">⚠️</span>
                    )}
                  </td>
                  <td className="p-5">
                    <div className="flex gap-4">
                      <button
                        onClick={() => {
                          setNewRoom(room);
                          setEditingRoom(room);
                          setShowForm(true);
                        }}
                        className="text-[#1B365D] hover:text-[#1B365D]/70"
                      >
                        <svg
                          className="w-5 h-5"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                          <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDeleteRoom(room._id)}
                        className="text-red-500 hover:text-red-600"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M3 6h18" />
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 0 0 1 2 2v2" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {(selectedDepartment || selectedFloor) && (
          <FloorMap
            filteredRooms={filteredRooms}
            issues={issues}
            showMaintenanceModal={handleShowMaintenanceModal}
          />
        )}
      </div>

      {/* Room Creation/Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-[#1B365D]/30 backdrop-blur-sm flex justify-center items-center">
          <div className="bg-[#FFFFFF] p-6 rounded-lg w-[480px]">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-[#1B365D]">
                {editingRoom ? "Edit Meeting Room" : "Add New Meeting Room"}
              </h3>
              <button onClick={resetForm} className="text-[#1B365D]/70 hover:text-[#1B365D]">
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-[#1B365D]">Room ID *</label>
                <input
                  type="text"
                  value={newRoom.LID}
                  onChange={(e) => setNewRoom({ ...newRoom, LID: e.target.value })}
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#1B365D] ${
                    errors.LID ? "border-red-500" : "border-[#E2E8F0]"
                  } bg-[#F8FAFC] text-[#1B365D] shadow-sm`}
                />
                {errors.LID && <p className="text-red-500 text-xs mt-1">{errors.LID}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-[#1B365D]">Department *</label>
                <select
                  value={newRoom.department}
                  onChange={(e) => setNewRoom({ ...newRoom, department: e.target.value })}
                  className="w-full p-3 border border-[#E2E8F0] rounded-lg bg-[#F8FAFC] text-[#1B365D] focus:ring-2 focus:ring-[#1B365D] shadow-sm"
                >
                  <option>Computer Faculty</option>
                  <option>Engineer Faculty</option>
                  <option>Business Faculty</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-[#1B365D]">Floor *</label>
                <input
                  type="text"
                  value={newRoom.floor}
                  onChange={(e) => setNewRoom({ ...newRoom, floor: e.target.value })}
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#1B365D] ${
                    errors.floor ? "border-red-500" : "border-[#E2E8F0]"
                  } bg-[#F8FAFC] text-[#1B365D] shadow-sm`}
                />
                {errors.floor && <p className="text-red-500 text-xs mt-1">{errors.floor}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-[#1B365D]">Total Seats *</label>
                <input
                  type="number"
                  value={newRoom.totalSeats}
                  onChange={(e) => setNewRoom({ ...newRoom, totalSeats: e.target.value })}
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#1B365D] ${
                    errors.totalSeats ? "border-red-500" : "border-[#E2E8F0]"
                  } bg-[#F8FAFC] text-[#1B365D] shadow-sm`}
                />
                {errors.totalSeats && <p className="text-red-500 text-xs mt-1">{errors.totalSeats}</p>}
              </div>
            </div>

            <button
              onClick={handleSaveRoom}
              className="w-full mt-6 bg-[#1B365D] text-[#FFFFFF] py-3 rounded-lg hover:bg-[#1B365D]/90 transition-all duration-200 font-medium shadow-md"
            >
              {editingRoom ? "Save Changes" : "Create Room"}
            </button>
          </div>
        </div>
      )}

      {/* Maintenance Modal */}
      {showMaintenanceModal && (
        <div className="fixed inset-0 bg-[#1B365D]/30 backdrop-blur-sm flex justify-center items-center">
          <div className="bg-[#FFFFFF] p-6 rounded-lg w-[400px] shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-[#1B365D]">Maintenance Notice</h3>
              <button
                onClick={() => setShowMaintenanceModal(false)}
                className="text-[#1B365D]/70 hover:text-[#1B365D]"
              >
                ✕
              </button>
            </div>
            <div className="text-center">
              <svg
                className="w-12 h-12 mx-auto mb-4 text-[#F59E0B]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 9v2m0 4h.01M12 4a8 8 0 110 16 8 8 0 010-16z"
                />
              </svg>
              <p className="text-[#1B365D] text-lg font-medium">
                Room {selectedRoomLID} has Reported Issues
              </p>
              <p className="text-[#6B7280] mt-2">
                This room is scheduled for maintenance due to reported facility issues.
              </p>
            </div>
            <button
              onClick={() => setShowMaintenanceModal(false)}
              className="w-full mt-6 bg-[#1B365D] text-white py-2 rounded-lg hover:bg-[#1B365D]/90 transition-all duration-200 font-medium shadow-md"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}