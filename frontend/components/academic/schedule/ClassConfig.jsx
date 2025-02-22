"use client"

import { useState } from "react";

export default function ClassConfigForm({ onAdd }) {
  const [className, setClassName] = useState("");
  const [sections, setSections] = useState([]);
  const [subjectIds, setSubjectIds] = useState([]);

  const handleAdd = () => {
    onAdd({ className, sections, subjectIds });
    setClassName("");
    setSections([]);
    setSubjectIds([]);
  };

  return (
    <div className="p-4 border rounded-lg">
      <h3 className="font-semibold">Class Configuration</h3>
      <input type="text" placeholder="Class Name" value={className} onChange={(e) => setClassName(e.target.value)} className="w-full p-2 border rounded my-2" />
      <input type="text" placeholder="Section Names (comma-separated)" onChange={(e) => setSections(e.target.value.split(","))} className="w-full p-2 border rounded my-2" />
      <input type="text" placeholder="Subject IDs (comma-separated)" onChange={(e) => setSubjectIds(e.target.value.split(",").map(Number))} className="w-full p-2 border rounded my-2" />
      <button onClick={handleAdd} className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 mt-2">Add Class</button>
    </div>
  );
}
