import { useState, useEffect } from "react";
import axios from "axios";
import { Search, ChevronDown } from "lucide-react";

export default function TimetableList() {
  const [schedules, setSchedules] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState(null);
  const [selectedBatch, setSelectedBatch] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [newSchedule, setNewSchedule] = useState({
    subject: "",
    date: "",
    time: "",
    duration: "1",
    room: "",
    lecturer: "",
    batch: "",
  });

  useEffect(() => {
    axios.get("http://localhost:5000/api/timetable").then((res) => {
      // Update the data structure to include duration if needed
      const updatedSchedules = res.data.map(schedule => ({
        ...schedule,
        duration: schedule.duration || "1" // Default to 1 hour if not specified
      }));
      setSchedules(updatedSchedules);
    });
  }, []);

  const handleSaveSchedule = async () => {
    try {
      if (editingSchedule) {
        const res = await axios.put(
          `http://localhost:5000/api/timetable/${editingSchedule._id}`,
          newSchedule
        );
        setSchedules((prev) => prev.map((s) => (s._id === editingSchedule._id ? res.data : s)));
      } else {
        const res = await axios.post("http://localhost:5000/api/timetable", newSchedule);
        setSchedules((prev) => [...prev, res.data]);
      }
      setShowForm(false);
      setNewSchedule({ 
        subject: "", 
        date: "", 
        time: "", 
        duration: "1", // Make sure default is set here 
        room: "", 
        lecturer: "", 
        batch: "" 
      });
      setEditingSchedule(null);
    } catch (err) {
      console.log(err.response ? err.response.data : err);
    }
  };

  const handleDeleteSchedule = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/timetable/${id}`);
      setSchedules(schedules.filter((s) => s._id !== id));
    } catch (err) {
      console.log(err.response ? err.response.data : err);
    }
  };

  // Time slots from 8 AM to 5 PM in 1-hour increments
  const timeSlots = Array.from({ length: 10 }, (_, i) => {
    const hour = i + 8;
    return `${hour.toString().padStart(2, '0')}:00`;
  });

  const weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

  // Convert time string (HH:MM) to hour as a number
  const timeToHour = (timeStr) => {
    const [hours] = timeStr.split(':').map(Number);
    return hours;
  };

  // Find schedules that start at the given time slot
  const getSchedulesStartingAt = (day, timeSlot) => {
    const dayIndex = weekDays.indexOf(day) + 1;
    
    return schedules.filter(schedule => {
      const scheduleDay = new Date(schedule.date).getDay();
      const scheduleHour = timeToHour(schedule.time);
      const slotHour = timeToHour(timeSlot);
      
      return scheduleDay === dayIndex && scheduleHour === slotHour;
    });
  };

  // Check if a time slot is occupied by a schedule that started earlier
  const isOccupiedByEarlierSchedule = (day, timeSlot) => {
    const dayIndex = weekDays.indexOf(day) + 1;
    const slotHour = timeToHour(timeSlot);
    
    return schedules.some(schedule => {
      const scheduleDay = new Date(schedule.date).getDay();
      const scheduleHour = timeToHour(schedule.time);
      const scheduleDuration = parseInt(schedule.duration || "1");
      
      return scheduleDay === dayIndex && 
             scheduleHour < slotHour && 
             scheduleHour + scheduleDuration > slotHour;
    });
  };

  // Get the spanning schedule that occupies this slot
  const getSpanningSchedule = (day, timeSlot) => {
    const dayIndex = weekDays.indexOf(day) + 1;
    const slotHour = timeToHour(timeSlot);
    
    return schedules.find(schedule => {
      const scheduleDay = new Date(schedule.date).getDay();
      const scheduleHour = timeToHour(schedule.time);
      const scheduleDuration = parseInt(schedule.duration || "1");
      
      return scheduleDay === dayIndex && 
             scheduleHour < slotHour && 
             scheduleHour + scheduleDuration > slotHour;
    });
  };

  // Calculate grid span based on duration
  const calculateGridSpan = (duration) => {
    const durationInt = parseInt(duration || "1");
    return durationInt > 0 ? durationInt : 1;
  };

  return (
    <div className="min-h-screen p-8 bg-white">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold text-[#1B365D]">Timetable Management</h2>
        <button
          onClick={() => {
            setShowForm(true);
            setEditingSchedule(null);
          }}
          className="bg-[#1B365D] text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-[#1B365D]/90"
        >
          + Add New Schedule
        </button>
      </div>

      {/* Enhanced Search and Filter Section */}
      <div className="flex justify-between gap-4 mb-8">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search schedules..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-[#F5F7FA] rounded-lg bg-[#F5F7FA] text-[#1B365D]"
          />
        </div>
        <div className="relative">
          <select
            value={selectedBatch}
            onChange={(e) => setSelectedBatch(e.target.value)}
            className="appearance-none px-4 py-2 pr-8 bg-[#F5F7FA] border border-[#F5F7FA] rounded-lg text-[#1B365D]"
          >
            <option value="All">All Batches</option>
            <option value="2023">Batch 2023</option>
            <option value="2024">Batch 2024</option>
          </select>
          <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        </div>
      </div>

      {/* Timetable Grid */}
      <div className="overflow-x-auto">
        <div className="min-w-[1000px]">
          <div className="grid grid-cols-[100px_repeat(5,1fr)] bg-[#F5F7FA] rounded-lg border-2 border-gray-300">
            {/* Header */}
            <div className="p-4 font-medium text-[#1B365D] border-b-2 border-r-2 border-gray-300">Time</div>
            {weekDays.map((day, index) => (
              <div 
                key={day} 
                className={`p-4 font-medium text-[#1B365D] text-center border-b-2 ${
                  index < weekDays.length - 1 ? 'border-r-2' : ''
                } border-gray-300`}
              >
                {day}
              </div>
            ))}

            {/* Time slots */}
            {timeSlots.map((time, timeIndex) => (
              <>
                <div 
                  key={`time-${time}`} 
                  className={`p-4 text-[#1B365D] border-r-2 ${
                    timeIndex < timeSlots.length - 1 ? 'border-b-2' : ''
                  } border-gray-300`}
                >
                  {time}
                </div>
                {weekDays.map((day, dayIndex) => {
                  const schedulesAtSlot = getSchedulesStartingAt(day, time);
                  const isOccupied = isOccupiedByEarlierSchedule(day, time);
                  const spanningSchedule = isOccupied ? getSpanningSchedule(day, time) : null;
                  
                  // Skip rendering if this slot is part of a multi-hour schedule that started earlier
                  if (isOccupied) return (
                    <div 
                      key={`${day}-${time}-occupied`}
                      className={`bg-[#F5F7FA] ${
                        dayIndex < weekDays.length - 1 ? 'border-r-2' : ''
                      } ${
                        timeIndex < timeSlots.length - 1 ? 'border-b-2' : ''
                      } border-gray-300`}
                    >
                      {/* This cell is part of a spanning schedule */}
                    </div>
                  );
                  
                  return (
                    <div 
                      key={`${day}-${time}`} 
                      className={`p-2 ${
                        dayIndex < weekDays.length - 1 ? 'border-r-2' : ''
                      } ${
                        timeIndex < timeSlots.length - 1 ? 'border-b-2' : ''
                      } border-gray-300`}
                      style={{
                        gridRow: schedulesAtSlot.length > 0 ? 
                          `span ${calculateGridSpan(schedulesAtSlot[0].duration)}` : 'auto'
                      }}
                    >
                      {schedulesAtSlot.map(schedule => (
                        <div 
                          key={schedule._id} 
                          className="bg-white rounded-lg p-3 h-full shadow-md border-l-4 border-[#1B365D]"
                        >
                          <div className="font-medium text-[#1B365D] mb-1">{schedule.subject}</div>
                          <div className="text-sm text-gray-600 mb-1">
                            <span className="font-medium">Lecturer:</span> {schedule.lecturer}
                          </div>
                          <div className="text-sm text-gray-600 mb-1">
                            <span className="font-medium">Room:</span> {schedule.room}
                          </div>
                          <div className="text-sm text-gray-600 mb-2">
                            <span className="font-medium">Duration:</span> {schedule.duration} hr(s)
                          </div>
                          <div className="flex gap-2 mt-1 justify-end">
                            <button
                             onClick={() => {
                              setNewSchedule({
                                ...schedule,
                                duration: schedule.duration || "1" // Ensure duration has a default
                              });
                              setEditingSchedule(schedule);
                              setShowForm(true);
                            }}
                              className="text-[#1B365D] hover:text-[#1B365D]/70 bg-gray-100 p-1 rounded"
                            >
                              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                                <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleDeleteSchedule(schedule._id)}
                              className="text-red-500 hover:text-red-600 bg-gray-100 p-1 rounded"
                            >
                              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M3 6h18"/>
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                              </svg>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })}
              </>
            ))}
          </div>
        </div>
      </div>

      {/* Modal - Updated to include duration */}
      {showForm && (
        <div className="fixed inset-0 bg-[#1B365D]/30 backdrop-blur-sm flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg w-[480px]">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-[#1B365D]">
                {editingSchedule ? "Edit Schedule" : "Add New Schedule"}
              </h3>
              <button onClick={() => setShowForm(false)} className="text-[#1B365D]/70 hover:text-[#1B365D]">
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-[#1B365D]">Subject</label>
                <input
                  type="text"
                  value={newSchedule.subject}
                  onChange={(e) => setNewSchedule({ ...newSchedule, subject: e.target.value })}
                  className="w-full p-2 border border-[#F5F7FA] rounded-lg bg-[#F5F7FA] text-[#1B365D]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-[#1B365D]">Date</label>
                <input
                  type="date"
                  value={newSchedule.date}
                  onChange={(e) => setNewSchedule({ ...newSchedule, date: e.target.value })}
                  className="w-full p-2 border border-[#F5F7FA] rounded-lg bg-[#F5F7FA] text-[#1B365D]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-[#1B365D]">Time</label>
                <input
                  type="time"
                  value={newSchedule.time}
                  onChange={(e) => setNewSchedule({ ...newSchedule, time: e.target.value })}
                  className="w-full p-2 border border-[#F5F7FA] rounded-lg bg-[#F5F7FA] text-[#1B365D]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-[#1B365D]">Duration (hours)</label>
                <select
                  value={newSchedule.duration}
                  onChange={(e) => setNewSchedule({ ...newSchedule, duration: e.target.value })}
                  className="w-full p-2 border border-[#F5F7FA] rounded-lg bg-[#F5F7FA] text-[#1B365D]"
                >
                  <option value="1">1 hour</option>
                  <option value="2">2 hours</option>
                  <option value="3">3 hours</option>
                  <option value="4">4 hours</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-[#1B365D]">Room</label>
                <input
                  type="text"
                  value={newSchedule.room}
                  onChange={(e) => setNewSchedule({ ...newSchedule, room: e.target.value })}
                  className="w-full p-2 border border-[#F5F7FA] rounded-lg bg-[#F5F7FA] text-[#1B365D]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-[#1B365D]">Lecturer</label>
                <input
                  type="text"
                  value={newSchedule.lecturer}
                  onChange={(e) => setNewSchedule({ ...newSchedule, lecturer: e.target.value })}
                  className="w-full p-2 border border-[#F5F7FA] rounded-lg bg-[#F5F7FA] text-[#1B365D]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-[#1B365D]">Batch</label>
                <input
                  type="text"
                  value={newSchedule.batch}
                  onChange={(e) => setNewSchedule({ ...newSchedule, batch: e.target.value })}
                  className="w-full p-2 border border-[#F5F7FA] rounded-lg bg-[#F5F7FA] text-[#1B365D]"
                />
              </div>
            </div>

            <button
              onClick={handleSaveSchedule}
              className="w-full mt-6 bg-[#1B365D] text-white py-2 rounded-lg hover:bg-[#1B365D]/90"
            >
              {editingSchedule ? "Save Changes" : "Create Schedule"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}