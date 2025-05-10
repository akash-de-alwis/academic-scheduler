import { useState, useEffect } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify"; // Import react-toastify
import "react-toastify/dist/ReactToastify.css"; // Import the CSS

export default function RoomList() {
  const [rooms, setRooms] = useState([]);
  const [filteredRooms, setFilteredRooms] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortDirection, setSortDirection] = useState("asc");
  const [hallTypeFilter, setHallTypeFilter] = useState("All");
  const [showForm, setShowForm] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);
  const [newRoom, setNewRoom] = useState({
    LID: "",
    hallType: "Lecturer Hall",
    department: "Computer Faculty",
    floor: "",
    totalSeats: "",
    totalComputers: "",
    massHall: false,
    generalHall: false,
    miniHall: false,
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    axios.get("http://localhost:5000/api/rooms").then((res) => {
      const nonMeetingRooms = res.data.filter(room => room.hallType !== "Meeting Room");
      setRooms(nonMeetingRooms);
      setFilteredRooms(nonMeetingRooms);
    });
  }, []);

  const generateRoomId = () => {
    const existingIds = rooms.map(room => {
      const num = parseInt(room.LID.slice(1));
      return isNaN(num) ? 0 : num;
    });
    const maxId = Math.max(...existingIds, 0);
    const newIdNum = maxId + 1;
    return `L${newIdNum.toString().padStart(3, '0')}`;
  };

  const applyFilters = (roomsList, search, hallType) => {
    let filtered = [...roomsList];
    
    if (hallType !== "All") {
      filtered = filtered.filter(room => room.hallType === hallType);
    }

    if (search) {
      filtered = filtered.filter((room) =>
        room.LID.toLowerCase().includes(search.toLowerCase()) ||
        room.hallType.toLowerCase().includes(search.toLowerCase()) ||
        room.department.toLowerCase().includes(search.toLowerCase())
      );
    }

    return filtered;
  };

  const handleSearch = (term) => {
    const filtered = applyFilters(rooms, term, hallTypeFilter);
    setFilteredRooms(filtered);
    setSearchTerm(term);
  };

  const handleFilterChange = (type) => {
    setHallTypeFilter(type);
    const filtered = applyFilters(rooms, searchTerm, type);
    setFilteredRooms(filtered);
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

    if (!newRoom.LID.trim()) {
      newErrors.LID = "Room ID is required";
    } else if (!/^L\d{3}$/.test(newRoom.LID)) {
      newErrors.LID = "Room ID must be in format 'L' followed by 3 digits";
    } else if (!editingRoom && rooms.some(room => room.LID === newRoom.LID)) {
      newErrors.LID = "Room ID already exists";
    }

    if (!["Lecturer Hall", "Laboratory", "Meeting Room"].includes(newRoom.hallType)) {
      newErrors.hallType = "Please select a valid hall type";
    }

    if (!["Computer Faculty", "Engineer Faculty", "Business Faculty"].includes(newRoom.department)) {
      newErrors.department = "Please select a valid department";
    }

    if (!newRoom.floor.trim()) {
      newErrors.floor = "Floor is required";
    } else if (!/^-?[0-9]+$/.test(newRoom.floor)) {
      newErrors.floor = "Floor must be a number";
    } else {
      const floorNum = parseInt(newRoom.floor);
      if (floorNum < -5 || floorNum > 50) {
        newErrors.floor = "Floor must be between -5 and 50";
      }
    }

    if (!newRoom.totalSeats) {
      newErrors.totalSeats = "Total Seats is required";
    } else if (isNaN(newRoom.totalSeats) || newRoom.totalSeats <= 0) {
      newErrors.totalSeats = "Total Seats must be a positive number";
    } else if (newRoom.totalSeats > 500) {
      newErrors.totalSeats = "Total Seats cannot exceed 500";
    } else if (!Number.isInteger(Number(newRoom.totalSeats))) {
      newErrors.totalSeats = "Total Seats must be a whole number";
    }

    if (newRoom.hallType === "Lecturer Hall") {
      const seats = Number(newRoom.totalSeats);
      if (newRoom.massHall && (seats <= 50 || seats > 150)) {
        newErrors.totalSeats = "Mass Hall must have between 51 and 150 seats";
      }
      if (newRoom.generalHall && (seats <= 20 || seats > 50)) {
        newErrors.totalSeats = "General Hall must have between 21 and 50 seats";
      }
      if (newRoom.miniHall && (seats <= 10 || seats > 20)) {
        newErrors.totalSeats = "Mini Hall must have between 10 and 20 seats";
      }

      const hallCategories = newRoom.massHall + newRoom.generalHall + newRoom.miniHall;
      if (hallCategories === 0) {
        newErrors.hallCategory = "Please select a hall category";
      } else if (hallCategories > 1) {
        newErrors.hallCategory = "Please select only one hall category";
      }
    }

    if (newRoom.hallType === "Laboratory") {
      if (!newRoom.totalComputers) {
        newErrors.totalComputers = "Total Computers is required for Laboratories";
      } else if (isNaN(newRoom.totalComputers) || newRoom.totalComputers <= 0) {
        newErrors.totalComputers = "Total Computers must be a positive number";
      } else if (newRoom.totalComputers > newRoom.totalSeats) {
        newErrors.totalComputers = "Computers cannot exceed total seats";
      } else if (newRoom.totalComputers > 200) {
        newErrors.totalComputers = "Total Computers cannot exceed 200";
      } else if (!Number.isInteger(Number(newRoom.totalComputers))) {
        newErrors.totalComputers = "Total Computers must be a whole number";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveRoom = async () => {
    if (!validateForm()) {
      toast.error("Please fix the errors in the form before saving", {
        position: "top-right",
        autoClose: 3000,
      });
      return;
    }

    try {
      if (editingRoom) {
        const res = await axios.put(`http://localhost:5000/api/rooms/${editingRoom._id}`, newRoom);
        const updatedRooms = rooms.map((room) => (room._id === editingRoom._id ? res.data : room));
        setRooms(updatedRooms);
        setFilteredRooms(applyFilters(updatedRooms, searchTerm, hallTypeFilter));
        toast.success("Room updated successfully!", {
          position: "top-right",
          autoClose: 3000,
        });
      } else {
        const res = await axios.post("http://localhost:5000/api/rooms", newRoom);
        const updatedRooms = [...rooms, res.data];
        setRooms(updatedRooms);
        setFilteredRooms(applyFilters(updatedRooms, searchTerm, hallTypeFilter));
        toast.success("Room created successfully!", {
          position: "top-right",
          autoClose: 3000,
        });
      }
      resetForm();
    } catch (err) {
      console.error(err.response ? err.response.data : err);
      toast.error("Failed to save room: " + (err.response?.data?.message || "Unknown error"), {
        position: "top-right",
        autoClose: 5000,
      });
    }
  };

  const handleDeleteRoom = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/rooms/${id}`);
      const updatedRooms = rooms.filter((room) => room._id !== id);
      setRooms(updatedRooms);
      setFilteredRooms(applyFilters(updatedRooms, searchTerm, hallTypeFilter));
      toast.success("Room deleted successfully!", {
        position: "top-right",
        autoClose: 3000,
      });
    } catch (err) {
      console.error(err.response ? err.response.data : err);
      toast.error("Failed to delete room: " + (err.response?.data?.message || "Unknown error"), {
        position: "top-right",
        autoClose: 5000,
      });
    }
  };

  const resetForm = () => {
    setShowForm(false);
    setNewRoom({
      LID: "",
      hallType: "Lecturer Hall",
      department: "Computer Faculty",
      floor: "",
      totalSeats: "",
      totalComputers: "",
      massHall: false,
      generalHall: false,
      miniHall: false,
    });
    setEditingRoom(null);
    setErrors({});
  };

  const getHallCategory = (room) => {
    if (room.massHall) return "Mass";
    if (room.generalHall) return "General";
    if (room.miniHall) return "Mini";
    return "-";
  };

  return (
    <div className="min-h-screen p-8 bg-[#FFFFFF]">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold text-[#1B365D]">Room & Facility Booking</h2>
        <div className="flex gap-4">
          <select
            value={hallTypeFilter}
            onChange={(e) => handleFilterChange(e.target.value)}
            className="p-2 border border-[#F5F7FA] rounded-lg bg-[#F5F7FA] text-[#1B365D]"
          >
            <option value="All">All</option>
            <option value="Lecturer Hall">Lecturer Halls</option>
            <option value="Laboratory">Laboratory</option>
          </select>
          <button
            onClick={() => {
              setNewRoom({
                ...newRoom,
                LID: generateRoomId(),
              });
              setShowForm(true);
              setEditingRoom(null);
            }}
            className="bg-[#1B365D] text-[#FFFFFF] px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-[#1B365D]/90"
          >
            + Add New Hall
          </button>
        </div>
      </div>

      <div className="flex justify-between gap-4 mb-8">
        <input
          type="text"
          placeholder="Search rooms..."
          value={searchTerm}
          onChange={(e) => handleSearch(e.target.value)}
          className="flex-1 px-4 py-2 border border-[#F5F7FA] rounded-lg bg-[#F5F7FA] text-[#1B365D]"
        />
        <button
          onClick={handleSort}
          className="px-4 py-2 bg-[#F5F7FA] border border-[#F5F7FA] rounded-lg flex items-center gap-2 text-[#1B365D]"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
          </svg>
          Sort by name {sortDirection === "asc" ? "↑" : "↓"}
        </button>
      </div>

      <div className="bg-[#F5F7FA] rounded-lg">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#FFFFFF]">
              <th className="text-left p-4 font-medium text-[#1B365D]">Room ID</th>
              <th className="text-left p-4 font-medium text-[#1B365D]">Hall Type</th>
              <th className="text-left p-4 font-medium text-[#1B365D]">Department</th>
              <th className="text-left p-4 font-medium text-[#1B365D]">Floor</th>
              {hallTypeFilter === "Lecturer Hall" && (
                <th className="text-left p-4 font-medium text-[#1B365D]">Hall Category</th>
              )}
              <th className="text-left p-4 font-medium text-[#1B365D]">Capacity</th>
              {hallTypeFilter === "Laboratory" && (
                <th className="text-left p-4 font-medium text-[#1B365D]">Computers</th>
              )}
              <th className="text-left p-4 font-medium text-[#1B365D]">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredRooms.map((room) => (
              <tr key={room._id} className="border-b border-[#FFFFFF]">
                <td className="p-4"><span className="text-[#1B365D] font-medium">{room.LID}</span></td>
                <td className="p-4 text-[#1B365D]">{room.hallType}</td>
                <td className="p-4 text-[#1B365D]">{room.department}</td>
                <td className="p-4 text-[#1B365D]">{room.floor}</td>
                {hallTypeFilter === "Lecturer Hall" && (
                  <td className="p-4 text-[#1B365D]">{getHallCategory(room)}</td>
                )}
                <td className="p-4 text-[#1B365D]">{room.totalSeats || room.totalComputers}</td>
                {hallTypeFilter === "Laboratory" && (
                  <td className="p-4 text-[#1B365D]">{room.totalComputers || "-"}</td>
                )}
                <td className="p-4">
                  <div className="flex gap-4">
                    <button
                      onClick={() => {
                        setNewRoom(room);
                        setEditingRoom(room);
                        setShowForm(true);
                      }}
                      className="text-[#1B365D] hover:text-[#1B365D]/70"
                    >
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                        <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDeleteRoom(room._id)}
                      className="text-red-500 hover:text-red-600"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 6h18"/>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-[#1B365D]/30 backdrop-blur-sm flex justify-center items-center">
          <div className="bg-[#FFFFFF] p-6 rounded-lg w-[480px]">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-[#1B365D]">
                {editingRoom ? "Edit Room" : "Add New Room"}
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
                  className={`w-full p-2 border rounded-lg ${
                    errors.LID ? 'border-red-500' : 'border-[#1B365D]'
                  } bg-[#F5F7FA] text-[#1B365D] font-medium cursor-not-allowed ring-2 ring-[#1B365D]/20`}
                  disabled={true}
                />
                {errors.LID && <p className="text-red-500 text-xs mt-1">{errors.LID}</p>}
                {!editingRoom && <p className="text-gray-500 text-xs mt-1">Room ID is auto-generated</p>}
                {editingRoom && <p className="text-gray-500 text-xs mt-1">Room ID cannot be modified</p>}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-[#1B365D]">Hall Type *</label>
                <select
                  value={newRoom.hallType}
                  onChange={(e) => setNewRoom({ ...newRoom, hallType: e.target.value })}
                  className={`w-full p-2 border rounded-lg ${errors.hallType ? 'border-red-500' : 'border-[#F5F7FA]'} bg-[#F5F7FA] text-[#1B365D]`}
                >
                  <option value="Lecturer Hall">Lecturer Hall</option>
                  <option value="Laboratory">Laboratory</option>
                  <option value="Meeting Room">Meeting Room</option>
                </select>
                {errors.hallType && <p className="text-red-500 text-xs mt-1">{errors.hallType}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-[#1B365D]">Department *</label>
                <select
                  value={newRoom.department}
                  onChange={(e) => setNewRoom({ ...newRoom, department: e.target.value })}
                  className={`w-full p-2 border rounded-lg ${errors.department ? 'border-red-500' : 'border-[#F5F7FA]'} bg-[#F5F7FA] text-[#1B365D]`}
                >
                  <option value="Computer Faculty">Computer Faculty</option>
                  <option value="Engineer Faculty">Engineer Faculty</option>
                  <option value="Business Faculty">Business Faculty</option>
                </select>
                {errors.department && <p className="text-red-500 text-xs mt-1">{errors.department}</p>}
              </div>

              {newRoom.hallType === "Lecturer Hall" && (
                <div>
                  <label className="block text-sm font-medium mb-2 text-[#1B365D]">Hall Category *</label>
                  <div className="flex gap-6">
                    <label className="flex items-center gap-2 text-[#1B365D]">
                      <input
                        type="radio"
                        name="hallType"
                        checked={newRoom.massHall}
                        onChange={() => setNewRoom({ ...newRoom, massHall: !newRoom.massHall, generalHall: false, miniHall: false })}
                        className="w-4 h-4 accent-[#1B365D]"
                      />
                      Mass Hall
                    </label>
                    <label className="flex items-center gap-2 text-[#1B365D]">
                      <input
                        type="radio"
                        name="hallType"
                        checked={newRoom.generalHall}
                        onChange={() => setNewRoom({ ...newRoom, generalHall: !newRoom.generalHall, massHall: false, miniHall: false })}
                        className="w-4 h-4 accent-[#1B365D]"
                      />
                      General Hall
                    </label>
                    <label className="flex items-center gap-2 text-[#1B365D]">
                      <input
                        type="radio"
                        name="hallType"
                        checked={newRoom.miniHall}
                        onChange={() => setNewRoom({ ...newRoom, miniHall: !newRoom.miniHall, massHall: false, generalHall: false })}
                        className="w-4 h-4 accent-[#1B365D]"
                      />
                      Mini Hall
                    </label>
                  </div>
                  {errors.hallCategory && <p className="text-red-500 text-xs mt-1">{errors.hallCategory}</p>}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium mb-2 text-[#1B365D]">Floor *</label>
                <input
                  type="text"
                  value={newRoom.floor}
                  onChange={(e) => setNewRoom({ ...newRoom, floor: e.target.value })}
                  className={`w-full p-2 border rounded-lg ${errors.floor ? 'border-red-500' : 'border-[#F5F7FA]'} bg-[#F5F7FA] text-[#1B365D]`}
                />
                {errors.floor && <p className="text-red-500 text-xs mt-1">{errors.floor}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-[#1B365D]">Total Seats *</label>
                <input
                  type="number"
                  value={newRoom.totalSeats}
                  onChange={(e) => setNewRoom({ ...newRoom, totalSeats: e.target.value })}
                  className={`w-full p-2 border rounded-lg ${errors.totalSeats ? 'border-red-500' : 'border-[#F5F7FA]'} bg-[#F5F7FA] text-[#1B365D]`}
                />
                {errors.totalSeats && <p className="text-red-500 text-xs mt-1">{errors.totalSeats}</p>}
              </div>

              {newRoom.hallType === "Laboratory" && (
                <div>
                  <label className="block text-sm font-medium mb-2 text-[#1B365D]">Total Computers *</label>
                  <input
                    type="number"
                    value={newRoom.totalComputers}
                    onChange={(e) => setNewRoom({ ...newRoom, totalComputers: e.target.value })}
                    className={`w-full p-2 border rounded-lg ${errors.totalComputers ? 'border-red-500' : 'border-[#F5F7FA]'} bg-[#F5F7FA] text-[#1B365D]`}
                  />
                  {errors.totalComputers && <p className="text-red-500 text-xs mt-1">{errors.totalComputers}</p>}
                </div>
              )}
            </div>

            <button
              onClick={handleSaveRoom}
              className="w-full mt-6 bg-[#1B365D] text-[#FFFFFF] py-2 rounded-lg hover:bg-[#1B365D]/90"
            >
              {editingRoom ? "Save Changes" : "Create Room"}
            </button>
          </div>
        </div>
      )}

      {/* Toast Container */}
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </div>
  );
}