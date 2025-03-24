// components/common/Button.jsx
import React from "react";

const Button = ({ text, onClick, active = false }) => {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-md font-medium transition-colors ${
        active
          ? "bg-blue-600 text-white shadow-md"
          : "bg-gray-200 text-gray-700 hover:bg-blue-100"
      }`}
    >
      {text}
    </button>
  );
};

export default Button;
