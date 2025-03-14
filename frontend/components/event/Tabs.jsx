// components/event/Tabs.jsx
import React from "react";

const statuses = ["DRAFT", "PENDING", "CANCELLED"];

const Tabs = ({ activeTab, setActiveTab }) => (
  <div className="flex gap-4 mb-6">
    {statuses.map((status) => (
      <button
        key={status}
        onClick={() => setActiveTab(status)}
        className={`px-5 py-2 font-medium rounded-full transition-colors ${
          activeTab === status
            ? "bg-blue-600 text-white"
            : "bg-gray-200 text-gray-800 hover:bg-blue-100"
        }`}
      >
        {status.charAt(0) + status.slice(1).toLowerCase()}
      </button>
    ))}
  </div>
);

export default Tabs;