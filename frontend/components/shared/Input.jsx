// components/common/Input.jsx
import React from "react";

const Input = ({ value, onChange, placeholder }) => (
  <input
    type="text"
    value={value}
    onChange={(e) => onChange(e.target.value)}
    placeholder={placeholder}
    className="px-4 py-2 border rounded-md text-gray-700 border-gray-300 focus:ring-2 focus:ring-blue-400 focus:outline-none"
  />
);

export default Input;
