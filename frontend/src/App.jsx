import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Sidebar from "./StudentAndLecturers/component/Sidebar";
import HallSidebar from "./LectureHallAllocation/components/HallSidebar";
import TimeSidebar from "./TimetableManagement/component/TimeSidebar";
import HomePage from "./StudentAndLecturers/pages/HomePage";
import LecturerList from "./StudentAndLecturers/pages/LecturersList";
import BatchList from "./StudentAndLecturers/pages/BatchList";
import HallHome from "./LectureHallAllocation/pages/HallHome"
import TimeHome from "./TimetableManagement/pages/TimeHome";


/** Layout wrapper for pages with Sidebar */
const MainLayout = ({ children }) => (
  <div className="flex">
    <Sidebar />
    <div className="flex-1 p-6">{children}</div>
  </div>
);

/** Layout wrapper for pages with HallSidebar */
const HallLayout = ({ children }) => (
  <div className="flex">
    <HallSidebar />
    <div className="flex-1 p-6">{children}</div>
  </div>
);

/** Layout wrapper for pages with HallSidebar */
const TimeLayout = ({ children }) => (
  <div className="flex">
    <TimeSidebar />
    <div className="flex-1 p-6">{children}</div>
  </div>
);

function App() {
  return (
    <Router>
      <Routes>
        {/* Routes with Main Sidebar */}
        <Route path="/" element={<MainLayout><HomePage /></MainLayout>} />
        <Route path="/lecturers" element={<MainLayout><LecturerList /></MainLayout>} />
        <Route path="/batches" element={<MainLayout><BatchList /></MainLayout>} />

        {/* Routes with Hall Sidebar */}
        <Route path="/HallHome" element={<HallLayout><HallHome /></HallLayout>} />

        {/* Routes with Time Sidebar */}
        <Route path="/TimeHome" element={<TimeLayout><TimeHome /></TimeLayout>} />
      </Routes>
    </Router>
  );
}

export default App;
