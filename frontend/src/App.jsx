import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Sidebar from "./StudentAndLecturers/component/Sidebar";
import HomePage from "./StudentAndLecturers/pages/HomePage";
import LecturerList from "./StudentAndLecturers/pages/LecturersList"
import BatchList from "./StudentAndLecturers/pages/BatchList";

function App() {
  return (
    <Router>
      <div className="flex">
        <Sidebar />
        <div className="flex-1 p-6">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/lecturers" element={<LecturerList />} />
            <Route path="/batches" element={<BatchList />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
