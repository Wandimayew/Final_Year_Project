// components/common/ActionButton.jsx
import React from "react";

const ActionButton = ({
  label,
  onClick,
  isLoading = false,
  disabled = false,
  color = "blue", // Default color
  className = "",
}) => {
  const baseStyles =
    "px-4 py-2 rounded-lg text-sm font-semibold text-white shadow-md transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2";
  const colorStyles = {
    green: "bg-green-600 hover:bg-green-700 focus:ring-green-500",
    red: "bg-red-600 hover:bg-red-700 focus:ring-red-500",
    blue: "bg-blue-600 hover:bg-blue-700 focus:ring-blue-500",
  };
  const disabledStyles =
    "bg-gray-400 cursor-not-allowed transform-none hover:bg-gray-400";

  return (
    <button
      onClick={onClick}
      disabled={disabled || isLoading}
      className={`${baseStyles} ${colorStyles[color] || colorStyles.blue} ${
        isLoading || disabled ? disabledStyles : ""
      } ${className} relative overflow-hidden`}
    >
      <span className="flex items-center justify-center">
        {isLoading && (
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
        )}
        {isLoading ? "Processing..." : label}
      </span>
      {!isLoading && !disabled && (
        <span className="absolute inset-0 bg-white bg-opacity-0 hover:bg-opacity-10 transition-all duration-300" />
      )}
    </button>
  );
};

export default ActionButton;
