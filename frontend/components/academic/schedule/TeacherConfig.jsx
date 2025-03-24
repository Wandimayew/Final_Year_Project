"use client"

import { useState } from "react";

export default function TeacherConfigForm({ onAdd }) {
  const [teacherName, setTeacherName] = useState("");
  const [teacherId, setTeacherId] = useState("");
  const [subjectIds, setSubjectIds] = useState([]);
  const [classNames, setClassNames] = useState([]);
  const [maxClassesPerWeek, setMaxClassesPerWeek] = useState(0);
  const [maxClassesPerDay, setMaxClassesPerDay] = useState(0);

  const handleAdd = () => {
    onAdd({ teacherName, teacherId, subjectIds, classNames, maxClassesPerWeek, maxClassesPerDay });
    setTeacherName("");
    setTeacherId("");
    setSubjectIds([]);
    setClassNames([]);
    setMaxClassesPerWeek(0);
    setMaxClassesPerDay(0);
  };

  return (
    <div className="p-4 border rounded-lg">
      <h3 className="font-semibold">Teacher Configuration</h3>
      <input type="text" placeholder="Teacher Name" value={teacherName} onChange={(e) => setTeacherName(e.target.value)} className="w-full p-2 border rounded my-2" />
      <input type="text" placeholder="Teacher ID" value={teacherId} onChange={(e) => setTeacherId(e.target.value)} className="w-full p-2 border rounded my-2" />
      <input type="text" placeholder="Subject IDs (comma-separated)" onChange={(e) => setSubjectIds(e.target.value.split(",").map(Number))} className="w-full p-2 border rounded my-2" />
      <input type="text" placeholder="Class Names (comma-separated)" onChange={(e) => setClassNames(e.target.value.split(","))} className="w-full p-2 border rounded my-2" />
      <input type="number" placeholder="Max Classes Per Week" value={maxClassesPerWeek} onChange={(e) => setMaxClassesPerWeek(Number(e.target.value))} className="w-full p-2 border rounded my-2" />
      <input type="number" placeholder="Max Classes Per Day" value={maxClassesPerDay} onChange={(e) => setMaxClassesPerDay(Number(e.target.value))} className="w-full p-2 border rounded my-2" />
      <button onClick={handleAdd} className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 mt-2">Add Teacher</button>
    </div>
  );
}
