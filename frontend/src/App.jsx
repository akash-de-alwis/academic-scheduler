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
import StudentDashboard from "./ClientsidePages/StudentDashboard";
import StudentProfile from "./ClientsidePages/StudentProfile";
import StudentPortal from "./StudentAndLecturers/pages/StudentPortal";

import StaffDashboard from "./Home/StaffDashboard";
import StaffProfile from "./Home/StaffProfile";
import HomePage from "./StudentAndLecturers/pages/HomePage";
import LecturerList from "./StudentAndLecturers/pages/LecturersList";
import BatchList from "./StudentAndLecturers/pages/BatchList";
import Allocations from "./StudentAndLecturers/pages/Allocations";
import LecturerWorkload from "./StudentAndLecturers/pages/LecturerWorkload";
import PrintableReports from "./StudentAndLecturers/pages/PrintableReports";
import BatchOverviewReport from "./StudentAndLecturers/pages/BatchOverviewReport";
import LecturerAllocations from "./StudentAndLecturers/pages/LecturerAllocations";
import AllocationReport from "./StudentAndLecturers/pages/AllocationReport";

import HallHome from "./LectureHallAllocation/pages/HallHome";
import RoomList from "./LectureHallAllocation/pages/RoomList";
import MeetingRoomList from "./LectureHallAllocation/pages/MeetingRoomList";
import MeetingRoomBooking from "./LectureHallAllocation/pages/MeetingRoomBooking";
import BookingManagement from "./LectureHallAllocation/pages/BookingManagement";
import BookingReview from "./LectureHallAllocation/pages/BookingReview";

import TimeHome from "./TimetableManagement/pages/TimeHome";
import TimetableList from "./TimetableManagement/pages/TimetableList";
import TimetableView from "./ClientsidePages/TimetableView";



import SubHome from "./CourseAllocation/pages/SubHome";
import SubjectList from "./CourseAllocation/pages/SubjectList";
import ReportGeneration from "./CourseAllocation/pages/ReportGeneration";





/** Layout wrapper for pages with Sidebar */
const MainLayout = ({ children }) => (
  <div className="flex min-h-screen">
    <Sidebar />
    <div className="flex-1 ml-64 p-6">{children}</div>
  </div>
);

/** Layout wrapper for pages with HallSidebar */
const HallLayout = ({ children }) => (
  <div className="flex min-h-screen">
    <HallSidebar />
    <div className="flex-1 ml-64 p-6">{children}</div>
  </div>
);

/** Layout wrapper for pages with TimeSidebar */
const TimeLayout = ({ children }) => (
  <div className="flex min-h-screen">
    <TimeSidebar />
    <div className="flex-1 ml-64 p-6">{children}</div>
  </div>
);

/** Layout wrapper for pages with SubSidebar */
const SubjectLayout = ({ children }) => (
  <div className="flex min-h-screen">
    <SubSidebar />
    <div className="flex-1 ml-64 p-6">{children}</div>
  </div>
);

function App() {
  return (
    <Router>
      <Routes>

      <Route path="/" element={<MainHomePage />} />
      
      {/* Routes with Main Sidebar */}
      <Route path="/StaffDashboard" element={<StaffDashboard />} />
      <Route path="/StaffProfile" element={<StaffProfile />} />
      <Route path="/LoginPage" element={<LoginPage />} />
      <Route path="/AboutPage" element={<AboutPage />} />
      <Route path="/FAQPage" element={<FAQPage />} />
      <Route path="/SignupPage" element={<SignupPage />} />
      <Route path="/StudentDashboard" element={<StudentDashboard />} />
      <Route path="/StudentProfile" element={<StudentProfile />} />
      <Route path="/StudentPortal" element={<StudentPortal />} />

        {/* Routes with Main Sidebar */}
        <Route path="/lecHome" element={<MainLayout><HomePage /></MainLayout>} />
        <Route path="/lecturers" element={<MainLayout><LecturerList /></MainLayout>} />
        <Route path="/batches" element={<MainLayout><BatchList /></MainLayout>} />
        <Route path="/allocations" element={<MainLayout><Allocations /></MainLayout>} />
        <Route path="/LecturerWorkload" element={<MainLayout><LecturerWorkload /></MainLayout>} />
        <Route path="/PrintableReports" element={<MainLayout><PrintableReports /></MainLayout>} />
        <Route path="/BatchOverviewReport" element={<MainLayout><BatchOverviewReport /></MainLayout>} />
        <Route path="/LecturerAllocations" element={<MainLayout><LecturerAllocations /></MainLayout>} />
        <Route path="/AllocationReport" element={<MainLayout><AllocationReport /></MainLayout>} />

        {/* Routes with Hall Sidebar */}
        <Route path="/HallHome" element={<HallLayout><HallHome /></HallLayout>} />
        <Route path="/RoomList" element={<HallLayout><RoomList/></HallLayout>}/>
        <Route path="/MeetingRoomList" element={<HallLayout><MeetingRoomList/></HallLayout>}/>
        <Route path="/MeetingRoomBooking" element={<MeetingRoomBooking/>}/>
        <Route path="/BookingReview" element={<HallLayout><BookingReview/></HallLayout>}/>
        <Route path="/BookingManagement" element={<BookingManagement/>}/>
        

        {/* Routes with Time Sidebar */}
        <Route path="/TimeHome" element={<TimeLayout><TimeHome /></TimeLayout>} />
        <Route path="/TimetableList" element={<TimeLayout><TimetableList /></TimeLayout>} />
        <Route path="/TimetableView" element={<TimetableView/>}/>
       

 
      
      


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