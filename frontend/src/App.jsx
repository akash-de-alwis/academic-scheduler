import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Sidebar from "./StudentAndLecturers/component/Sidebar";
import HallSidebar from "./LectureHallAllocation/components/HallSidebar";
import TimeSidebar from "./TimetableManagement/component/TimeSidebar";
import SubSidebar from "./CourseAllocation/components/SubSidebar";

import MainHomePage from "./ClientsidePages/MainHomePage";
import LoginPage from "./ClientsidePages/LoginPage";
import AboutPage from "./ClientsidePages/AboutPage";
import FAQPage from "./ClientsidePages/FAQPage";
import SignupPage from "./ClientsidePages/SignupPage";

import AcSHomepage from "./Home/AcSHomepage"
import HomePage from "./StudentAndLecturers/pages/HomePage";
import LecturerList from "./StudentAndLecturers/pages/LecturersList";
import BatchList from "./StudentAndLecturers/pages/BatchList";
import Allocations from "./StudentAndLecturers/pages/Allocations";
import LecturerWorkload from "./StudentAndLecturers/pages/LecturerWorkload";
import PrintableReports from "./StudentAndLecturers/pages/PrintableReports";
import BatchOverviewReport from "./StudentAndLecturers/pages/BatchOverviewReport";


import HallHome from "./LectureHallAllocation/pages/HallHome";
import RoomList from "./LectureHallAllocation/pages/RoomList";

import TimeHome from "./TimetableManagement/pages/TimeHome";
import TimetableList from "./TimetableManagement/pages/TimetableList";

import SubHome from "./CourseAllocation/pages/SubHome";
import SubjectList from "./CourseAllocation/pages/SubjectList";





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

      <Route path="/" element={<MainHomePage />} />
      
      {/* Routes with Main Sidebar */}
      <Route path="/AcSHomepage" element={<AcSHomepage />} />
      <Route path="/LoginPage" element={<LoginPage />} />
      <Route path="/AboutPage" element={<AboutPage />} />
      <Route path="/FAQPage" element={<FAQPage />} />
      <Route path="/SignupPage" element={<SignupPage />} />

        {/* Routes with Main Sidebar */}
        <Route path="/lecHome" element={<MainLayout><HomePage /></MainLayout>} />
        <Route path="/lecturers" element={<MainLayout><LecturerList /></MainLayout>} />
        <Route path="/batches" element={<MainLayout><BatchList /></MainLayout>} />
        <Route path="/allocations" element={<MainLayout><Allocations /></MainLayout>} />
        <Route path="/LecturerWorkload" element={<MainLayout><LecturerWorkload /></MainLayout>} />
        <Route path="/PrintableReports" element={<MainLayout><PrintableReports /></MainLayout>} />
        <Route path="/BatchOverviewReport" element={<MainLayout><BatchOverviewReport /></MainLayout>} />

        {/* Routes with Hall Sidebar */}
        <Route path="/HallHome" element={<HallLayout><HallHome /></HallLayout>} />
        <Route path="/RoomList" element={<HallLayout><RoomList/></HallLayout>}/>

        {/* Routes with Time Sidebar */}
        <Route path="/TimeHome" element={<TimeLayout><TimeHome /></TimeLayout>} />
        <Route path="/TimetableList" element={<TimeLayout><TimetableList /></TimeLayout>} />


        {/* Routes with course Sidebar */}
        <Route path="/SubjectHome" element={<SubjectLayout>< SubHome /></SubjectLayout>} />
        <Route path="/SubjectList" element={<SubjectLayout>< SubjectList /></SubjectLayout>} />

      </Routes>
    </Router>
  );
}

export default App;
