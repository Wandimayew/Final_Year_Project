"use client"


import { useState } from "react";

export default function StreamConfigForm({ onAdd }) {
  const [streamName, setStreamName] = useState("");
  const [classNames, setClassNames] = useState([]);

  const handleAdd = () => {
    onAdd({ streamName, classNames });
    setStreamName("");
    setClassNames([]);
  };

  return (
    <div className="p-4 border rounded-lg">
      <h3 className="font-semibold">Stream Configuration</h3>
      <input type="text" placeholder="Stream Name" value={streamName} onChange={(e) => setStreamName(e.target.value)} className="w-full p-2 border rounded my-2" />
      <input type="text" placeholder="Class Names (comma-separated)" onChange={(e) => setClassNames(e.target.value.split(","))} className="w-full p-2 border rounded my-2" />
      <button onClick={handleAdd} className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 mt-2">Add Stream</button>
    </div>
  );
}
