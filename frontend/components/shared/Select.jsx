// components/common/Select.jsx
import React from "react";

const Select = ({ value, onChange, options, label }) => (
  <select
    value={value}
    onChange={(e) => onChange(e.target.value)}
    className="px-4 py-2 border rounded-md text-gray-700 border-gray-300 bg-white focus:ring-2 focus:ring-blue-400 focus:outline-none"
  >
    {options.map((opt) => (
      <option key={opt} value={opt}>
        {label ? `${label}: ${opt}` : opt}
      </option>
    ))}
  </select>
);

export default Select;
