import { Link } from "react-router-dom";
 
export default function TimeHome() {
  return (
<div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-6">
<div className="max-w-4xl w-full bg-white shadow-lg rounded-2xl p-8 text-center">
<h1 className="text-4xl font-bold text-gray-800 mb-4">amanda</h1>
<p className="text-gray-600 text-lg mb-6">
          puka sududa?
</p>
 
        <div className="flex flex-col md:flex-row gap-4 justify-center">
<Link to="/book-room" className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium shadow-md hover:bg-blue-700 transition">
            Book a Room
</Link>
<Link to="/view-bookings" className="bg-gray-200 text-gray-800 px-6 py-3 rounded-lg font-medium shadow-md hover:bg-gray-300 transition">
            View Bookings
</Link>
</div>
</div>
</div>
  );
}