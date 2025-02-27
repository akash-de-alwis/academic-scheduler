import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Sidebar from "./StudentAndLecturers/component/Sidebar";
import HallSidebar from "./LectureHallAllocation/components/HallSidebar";
import TimeSidebar from "./TimetableManagement/component/TimeSidebar";
import SubSidebar from "./CourseAllocation/components/SubSidebar";

import AcSHomepage from "./Home/AcSHomepage"
import HomePage from "./StudentAndLecturers/pages/HomePage";
import LecturerList from "./StudentAndLecturers/pages/LecturersList";
import BatchList from "./StudentAndLecturers/pages/BatchList";
import Allocations from "./StudentAndLecturers/pages/Allocations";

import HallHome from "./LectureHallAllocation/pages/HallHome";
import RoomList from "./LectureHallAllocation/pages/RoomList";

import TimeHome from "./TimetableManagement/pages/TimeHome";

import SubHome from "./CourseAllocation/pages/SubHome";
import SubjectList from "./CourseAllocation/pages/SubjectList";
import ReportGeneration from "./CourseAllocation/pages/ReportGeneration";




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


/** Layout wrapper for pages with HallSidebar */
const SubjectLayout = ({ children }) => (
  <div className="flex">
    <SubSidebar />
    <div className="flex-1 p-6">{children}</div>
  </div>
);


function App() {
  return (
    <Router>
      <Routes>

      <Route path="/" element={<AcSHomepage />} />

        {/* Routes with Main Sidebar */}
        <Route path="/lecHome" element={<MainLayout><HomePage /></MainLayout>} />
        <Route path="/lecturers" element={<MainLayout><LecturerList /></MainLayout>} />
        <Route path="/batches" element={<MainLayout><BatchList /></MainLayout>} />
        <Route path="/allocations" element={<MainLayout><Allocations /></MainLayout>} />

        {/* Routes with Hall Sidebar */}
        <Route path="/HallHome" element={<HallLayout><HallHome /></HallLayout>} />
        <Route path="/RoomList" element={<HallLayout><RoomList/></HallLayout>}/>

        {/* Routes with Time Sidebar */}
        <Route path="/TimeHome" element={<TimeLayout><TimeHome /></TimeLayout>} />

        {/* Routes with course Sidebar */}
        <Route path="/SubjectHome" element={<SubjectLayout>< SubHome /></SubjectLayout>} />
        <Route path="/SubjectList" element={<SubjectLayout>< SubjectList /></SubjectLayout>} />
        <Route path="/SubjectHome" element={<SubjectLayout><SubHome /></SubjectLayout>} />
        <Route path="/SubjectList" element={<SubjectLayout><SubjectList /></SubjectLayout>} />
        <Route path="/ReportGeneration" element={<SubjectLayout><ReportGeneration /></SubjectLayout>} />
        {/* Routes with course Sidebar */}
        


      </Routes>
    </Router>
  );
}

export default App;
