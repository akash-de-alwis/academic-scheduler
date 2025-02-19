import { useNavigate } from "react-router-dom";

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <h1 className="text-3xl font-bold mb-6">Academic Scheduler</h1>
      <div className="space-y-4">
        <button
          onClick={() => navigate("/lecturers")}
          className="px-6 py-3 bg-blue-500 text-white rounded-lg shadow hover:bg-blue-600 transition"
        >
          Lecturer List
        </button>
        <button
          onClick={() => navigate("/batches")}
          className="px-6 py-3 bg-green-500 text-white rounded-lg shadow hover:bg-green-600 transition"
        >
          Batch List
        </button>
        <button
          onClick={() => navigate("/allocation")}
          className="px-6 py-3 bg-purple-500 text-white rounded-lg shadow hover:bg-purple-600 transition"
        >
          Allocate Students
        </button>
      </div>
    </div>
  );
};

export default Home;
