"use client";

import { useState } from "react";
import { PencilIcon, TrashIcon } from "@heroicons/react/24/outline";
import axios from "axios";
import toast from "react-hot-toast";

export default function AnalyticsTable({ analyticsData, students, onEdit, onDelete }) {
  const [remarks, setRemarks] = useState(
    analyticsData.map((data) => ({
      assessmentAnalyticsId: data.assessmentAnalyticsId,
      remarks: data.remarks || "",
    }))
  );

  const handleRemarkChange = (analyticsId, value) => {
    setRemarks((prev) =>
      prev.map((item) =>
        item.assessmentAnalyticsId === analyticsId ? { ...item, remarks: value } : item
      )
    );
  };

  const handleSave = async (analyticsId) => {
    const remarkEntry = remarks.find((r) => r.assessmentAnalyticsId === analyticsId);
    try {
      await axios.put(`http://localhost:8080/api/analytics/${analyticsId}`, {
        schoolId: analyticsData.find((a) => a.assessmentAnalyticsId === analyticsId).schoolId,
        studentId: analyticsData.find((a) => a.assessmentAnalyticsId === analyticsId).studentId,
        remarks: remarkEntry.remarks,
      });
      toast.success("Remarks updated successfully");
    } catch (error) {
      toast.error("Failed to update remarks");
      console.error("Error updating remarks:", error);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 md:p-8 mb-8">
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200">
          <thead>
            <tr className="bg-gray-100">
              <th className="py-2 px-4 border-b text-left">Sl</th>
              <th className="py-2 px-4 border-b text-left">Student Name</th>
              <th className="py-2 px-4 border-b text-left">Register No</th>
              <th className="py-2 px-4 border-b text-left">Average Marks</th>
              <th className="py-2 px-4 border-b text-left">Highest Marks</th>
              <th className="py-2 px-4 border-b text-left">Lowest Marks</th>
              <th className="py-2 px-4 border-b text-left">Total Marks</th>
              <th className="py-2 px-4 border-b text-left">Pass Percentage</th>
              <th className="py-2 px-4 border-b text-left">Fail Percentage</th>
              <th className="py-2 px-4 border-b text-left">Status</th>
              <th className="py-2 px-4 border-b text-left">Remarks</th>
              <th className="py-2 px-4 border-b text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {analyticsData.map((analytics, index) => {
              const student = students.find((s) => s.value === analytics.studentId);
              const remarkEntry = remarks.find(
                (r) => r.assessmentAnalyticsId === analytics.assessmentAnalyticsId
              );
              return (
                <tr key={analytics.assessmentAnalyticsId} className="hover:bg-gray-50">
                  <td className="py-2 px-4 border-b">{index + 1}</td>
                  <td className="py-2 px-4 border-b">
                    {student ? student.label.split(" (#")[0] : "Unknown"}
                  </td>
                  <td className="py-2 px-4 border-b">{`RSM-${analytics.studentId}`}</td>
                  <td className="py-2 px-4 border-b">{analytics.averageMarks?.toFixed(2)}</td>
                  <td className="py-2 px-4 border-b">{analytics.highestMarks?.toFixed(2)}</td>
                  <td className="py-2 px-4 border-b">{analytics.lowestMarks?.toFixed(2)}</td>
                  <td className="py-2 px-4 border-b">{analytics.totalMarks?.toFixed(2)}</td>
                  <td className="py-2 px-4 border-b">{analytics.passPercentage?.toFixed(2)}%</td>
                  <td className="py-2 px-4 border-b">{analytics.failPercentage?.toFixed(2)}%</td>
                  <td className="py-2 px-4 border-b">{analytics.status || "N/A"}</td>
                  <td className="py-2 px-4 border-b">
                    <input
                      type="text"
                      value={remarkEntry.remarks}
                      onChange={(e) => handleRemarkChange(analytics.assessmentAnalyticsId, e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter remarks"
                    />
                  </td>
                  <td className="py-2 px-4 border-b">
                    <button
                      onClick={() => handleSave(analytics.assessmentAnalyticsId)}
                      className="text-green-600 hover:text-green-800 mr-2"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => onEdit(analytics)}
                      className="text-blue-600 hover:text-blue-800 mr-2"
                    >
                      <PencilIcon className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => onDelete(analytics.assessmentAnalyticsId)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}