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
import MeetingRoomBooking from "./LectureHallAllocation/pages/Challs/MeetingRoomBooking";
import BookingManagement from "./LectureHallAllocation/pages/Challs/BookingManagement";
import BookingReview from "./LectureHallAllocation/pages/BookingReview";
import RaisingIssues from "./LectureHallAllocation/pages/Challs/RaisingIssues";
import HallIssues from "./LectureHallAllocation/pages/HallIssues";
import BookingHistory from "./LectureHallAllocation/pages/BookingHistory";

import TimeHome from "./TimetableManagement/pages/TimeHome";
import TimetableList from "./TimetableManagement/pages/TimetableList";
import PublishTimetable from "./ClientsidePages/PublishTimetable";
import Timeview from "./TimetableManagement/pages/TimeView";
import TimetableReports from "./TimetableManagement/pages/TimetableReports";
import LecturerSchedules from "./TimetableManagement/pages/LecturerSchedules";
import TimeConflicts from "./TimetableManagement/pages/TimeConflicts";
import TimeLecture from "./ClientsidePages/TimeLecture";
import TimeAuto from "./TimetableManagement/pages/TimeAuto";
import TimeAvailable from "./TimetableManagement/pages/TimeAvailable";



import SubHome from "./CourseAllocation/pages/SubHome";
import SubjectList from "./CourseAllocation/pages/SubjectList";
import ReportGeneration from "./CourseAllocation/pages/ReportGeneration";
import NotificationList from "./ClientsidePages/NotificationList";
import ModuleOverview from "./CourseAllocation/pages/ModuleOverview";





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
        <Route path="/RaisingIssues" element={<RaisingIssues/>}/>
        <Route path="/HallIssues" element={<HallLayout><HallIssues/></HallLayout>}/>
        <Route path="/BookingHistory" element={<HallLayout><BookingHistory/></HallLayout>}/>


        {/* Routes with Time Sidebar */}
        <Route path="/TimeHome" element={<TimeLayout><TimeHome /></TimeLayout>} />
        <Route path="/TimetableList" element={<TimeLayout><TimetableList /></TimeLayout>} />
        <Route path="/Timeview" element={<TimeLayout><Timeview /></TimeLayout>} />
        <Route path="/TimetableReports" element={<TimeLayout><TimetableReports /></TimeLayout>} />
        <Route path="/LecturerSchedules" element={<TimeLayout><LecturerSchedules /></TimeLayout>} />
        <Route path="/TimeConflicts" element={<TimeLayout><TimeConflicts /></TimeLayout>} />
        <Route path="/TimeAuto" element={<TimeLayout><TimeAuto /></TimeLayout>} />
        <Route path="/TimeAvailable" element={<TimeLayout><TimeAvailable /></TimeLayout>} />
        <Route path="/PublishTimetable" element={<PublishTimetable/>}/>
        <Route path="/TimeLecture" element={<TimeLecture/>}/>
        
        
        
       

        {/* Routes with course Sidebar */}
        <Route path="/SubjectHome" element={<SubjectLayout>< SubHome /></SubjectLayout>} />
        <Route path="/SubjectList" element={<SubjectLayout>< SubjectList /></SubjectLayout>} />
        <Route path="/SubjectHome" element={<SubjectLayout><SubHome /></SubjectLayout>} />
        <Route path="/SubjectList" element={<SubjectLayout><SubjectList /></SubjectLayout>} />
        <Route path="/ReportGeneration" element={<SubjectLayout><ReportGeneration /></SubjectLayout>} />
        <Route path="/ModuleOverview" element={<SubjectLayout><ModuleOverview /></SubjectLayout>} />
        <Route path="/NotificationList" element={<NotificationList />} />


        {/* Routes with course Sidebar */}
        


      </Routes>
    </Router>
  );
}

export default App;