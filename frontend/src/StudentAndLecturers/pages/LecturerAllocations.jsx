import { useState, useEffect } from "react";
import axios from "axios";

export default function LecturerAllocations({ lecturerId }) {
  const [allocations, setAllocations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAllocations = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/allocations?lecturerId=${lecturerId}`);
        setAllocations(res.data);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    };
    fetchAllocations();
  }, [lecturerId]);

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold text-[#1B365D] mb-4">My Allocations</h2>
      {loading ? (
        <p>Loading...</p>
      ) : allocations.length === 0 ? (
        <p>No allocations assigned.</p>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {allocations.map((alloc) => (
            <div key={alloc._id} className="p-4 bg-white rounded-lg shadow-md">
              <p><strong>Subject:</strong> {alloc.subjectName} ({alloc.subjectId})</p>
              <p><strong>Batch:</strong> {alloc.batchName} ({alloc.batchId})</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}