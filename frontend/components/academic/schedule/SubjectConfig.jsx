"use client";

import { useState, useEffect } from "react";

export default function SubjectConfigForm({ onAdd }) {
  const [subjectName, setSubjectName] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [subjectDurationInMinutes, setSubjectDurationInMinutes] = useState(0);
  const [subjectFrequencyPerWeek, setSubjectFrequencyPerWeek] = useState(0);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch subjects from the backend
  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const response = await fetch("/api/subjects"); // Adjust this to your actual API route
        if (!response.ok) throw new Error("Failed to fetch subjects");
        const data = await response.json();
        setSubjects(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSubjects();
  }, []);

  const handleAdd = () => {
    const newSubject = { subjectName, subjectId, subjectDurationInMinutes, subjectFrequencyPerWeek };
    onAdd(newSubject);
    setSubjectName("");
    setSubjectId("");
    setSubjectDurationInMinutes(0);
    setSubjectFrequencyPerWeek(0);
  };

  return (
    <div className="p-4 border rounded-lg">
      <h3 className="font-semibold mb-2">Subject Configuration</h3>

      {/* Show error if fetch fails */}
      {error && <p className="text-red-500">{error}</p>}

      {/* Display fetched subjects in a dropdown */}
      <label className="block text-sm font-medium text-gray-700">Select Existing Subject</label>
      <select
        className="w-full p-2 border rounded my-2"
        onChange={(e) => {
          const selectedSubject = subjects.find((s) => s.subjectId === e.target.value);
          if (selectedSubject) {
            setSubjectName(selectedSubject.subjectName);
            setSubjectId(selectedSubject.subjectId);
            setSubjectDurationInMinutes(selectedSubject.subjectDurationInMinutes);
            setSubjectFrequencyPerWeek(selectedSubject.subjectFrequencyPerWeek);
          }
        }}
      >
        <option value="">-- Select a Subject --</option>
        {loading ? <option>Loading...</option> : subjects.map((subject) => (
          <option key={subject.subjectId} value={subject.subjectId}>
            {subject.subjectName}
          </option>
        ))}
      </select>

      {/* Input fields for adding a new subject */}
      <input type="text" placeholder="Subject Name" value={subjectName} onChange={(e) => setSubjectName(e.target.value)} className="w-full p-2 border rounded my-2" />
      <input type="text" placeholder="Subject ID" value={subjectId} onChange={(e) => setSubjectId(e.target.value)} className="w-full p-2 border rounded my-2" />
      <input type="number" placeholder="Duration in Minutes" value={subjectDurationInMinutes} onChange={(e) => setSubjectDurationInMinutes(Number(e.target.value))} className="w-full p-2 border rounded my-2" />
      <input type="number" placeholder="Frequency Per Week" value={subjectFrequencyPerWeek} onChange={(e) => setSubjectFrequencyPerWeek(Number(e.target.value))} className="w-full p-2 border rounded my-2" />

      <button onClick={handleAdd} className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 mt-2">Add Subject</button>
    </div>
  );
}
