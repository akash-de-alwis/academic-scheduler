import { useState, useEffect } from "react";
import axios from "axios";

export default function RoomList() {
  const [rooms, setRooms] = useState([]);
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

  useEffect(() => {
    axios.get("http://localhost:5000/api/rooms").then((res) => setRooms(res.data));
  }, []);

  const handleSaveRoom = async () => {
    try {
      if (editingRoom) {
        const res = await axios.put(`http://localhost:5000/api/rooms/${editingRoom._id}`, newRoom);
        setRooms(rooms.map((room) => (room._id === editingRoom._id ? res.data : room)));
      } else {
        const res = await axios.post("http://localhost:5000/api/rooms", newRoom);
        setRooms([...rooms, res.data]);
      }
      resetForm();
    } catch (err) {
      console.error(err.response ? err.response.data : err);
    }
  };

  const handleDeleteRoom = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/rooms/${id}`);
      setRooms(rooms.filter((room) => room._id !== id));
    } catch (err) {
      console.error(err.response ? err.response.data : err);
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
  };

  return (
    <div className="min-h-screen p-8 bg-[#FFFFFF]">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold text-[#1B365D]">Room & Facility Booking</h2>
        <button
          onClick={() => {
            setShowForm(true);
            setEditingRoom(null);
          }}
          className="bg-[#1B365D] text-[#FFFFFF] px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-[#1B365D]/90"
        >
          + Add New Hall
        </button>
      </div>

      <div className="flex justify-between gap-4 mb-8">
        <input
          type="text"
          placeholder="Search rooms..."
          className="flex-1 px-4 py-2 border border-[#F5F7FA] rounded-lg bg-[#F5F7FA] text-[#1B365D]"
        />
        <button className="px-4 py-2 bg-[#F5F7FA] border border-[#F5F7FA] rounded-lg flex items-center gap-2 text-[#1B365D]">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
          </svg>
          Sort by name
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
              <th className="text-left p-4 font-medium text-[#1B365D]">Capacity</th>
              <th className="text-left p-4 font-medium text-[#1B365D]">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rooms.map((room) => (
              <tr key={room._id} className="border-b border-[#FFFFFF]">
                <td className="p-4"><span className="text-[#1B365D] font-medium">{room.LID}</span></td>
                <td className="p-4 text-[#1B365D]">{room.hallType}</td>
                <td className="p-4 text-[#1B365D]">{room.department}</td>
                <td className="p-4 text-[#1B365D]">{room.floor}</td>
                <td className="p-4 text-[#1B365D]">{room.totalSeats || room.totalComputers}</td>
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
                <label className="block text-sm font-medium mb-2 text-[#1B365D]">Room ID</label>
                <input
                  type="text"
                  value={newRoom.LID}
                  onChange={(e) => setNewRoom({ ...newRoom, LID: e.target.value })}
                  className="w-full p-2 border border-[#F5F7FA] rounded-lg bg-[#F5F7FA] text-[#1B365D]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-[#1B365D]">Hall Type</label>
                <select
                  value={newRoom.hallType}
                  onChange={(e) => setNewRoom({ ...newRoom, hallType: e.target.value })}
                  className="w-full p-2 border border-[#F5F7FA] rounded-lg bg-[#F5F7FA] text-[#1B365D]"
                >
                  <option value="Lecturer Hall">Lecturer Hall</option>
                  <option value="Laboratory">Laboratory</option>
                  <option value="Meeting Room">Meeting Room</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-[#1B365D]">Department</label>
                <select
                  value={newRoom.department}
                  onChange={(e) => setNewRoom({ ...newRoom, department: e.target.value })}
                  className="w-full p-2 border border-[#F5F7FA] rounded-lg bg-[#F5F7FA] text-[#1B365D]"
                >
                  <option>Computer Faculty</option>
                  <option>Engineer Faculty</option>
                  <option>Business Faculty</option>
                </select>
              </div>

              {newRoom.hallType === "Lecturer Hall" && (
                <div>
                  <label className="block text-sm font-medium mb-2 text-[#1B365D]">Hall Category</label>
                  <div className="flex gap-6">
                    <label className="flex items-center gap-2 text-[#1B365D]">
                      <input
                        type="radio"
                        name="hallType"
                        checked={newRoom.massHall}
                        onChange={() => setNewRoom({ ...newRoom, massHall: !newRoom.massHall })}
                        className="w-4 h-4 accent-[#1B365D]"
                      />
                      Mass Hall
                    </label>
                    <label className="flex items-center gap-2 text-[#1B365D]">
                      <input
                        type="radio"
                        name="hallType"
                        checked={newRoom.generalHall}
                        onChange={() => setNewRoom({ ...newRoom, generalHall: !newRoom.generalHall })}
                        className="w-4 h-4 accent-[#1B365D]"
                      />
                      General Hall
                    </label>
                    <label className="flex items-center gap-2 text-[#1B365D]">
                      <input
                        type="radio"
                        name="hallType"
                        checked={newRoom.miniHall}
                        onChange={() => setNewRoom({ ...newRoom, miniHall: !newRoom.miniHall })}
                        className="w-4 h-4 accent-[#1B365D]"
                      />
                      Mini Hall
                    </label>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium mb-2 text-[#1B365D]">Floor</label>
                <input
                  type="text"
                  value={newRoom.floor}
                  onChange={(e) => setNewRoom({ ...newRoom, floor: e.target.value })}
                  className="w-full p-2 border border-[#F5F7FA] rounded-lg bg-[#F5F7FA] text-[#1B365D]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-[#1B365D]">Total Seats</label>
                <input
                  type="number"
                  value={newRoom.totalSeats}
                  onChange={(e) => setNewRoom({ ...newRoom, totalSeats: e.target.value })}
                  className="w-full p-2 border border-[#F5F7FA] rounded-lg bg-[#F5F7FA] text-[#1B365D]"
                />
              </div>

              {newRoom.hallType === "Laboratory" && (
                <div>
                  <label className="block text-sm font-medium mb-2 text-[#1B365D]">Total Computers</label>
                  <input
                    type="number"
                    value={newRoom.totalComputers}
                    onChange={(e) => setNewRoom({ ...newRoom, totalComputers: e.target.value })}
                    className="w-full p-2 border border-[#F5F7FA] rounded-lg bg-[#F5F7FA] text-[#1B365D]"
                  />
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
    </div>
  );
}