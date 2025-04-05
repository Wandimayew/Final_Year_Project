"use client";

import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

// Force dynamic rendering
export const dynamic = 'force-dynamic';

const EditSection = ({ section, classId, onClose, type, setClassDetails }) => {
  const [sectionName, setSectionName] = useState(section?.sectionName || "");
  const [capacity, setCapacity] = useState(section?.capacity || 0);
  const [loading, setLoading] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.put(
        `http://localhost:8086/academic/api/new/editSectionById/${section.sectionId}`,
        {
          sectionName,
          capacity: parseInt(capacity, 10),
          classId,
        }
      );
      toast.success("Section updated successfully!");

      // Update the class details in parent component
      setClassDetails((prev) => ({
        ...prev,
        sections: prev.sections.map((sec) =>
          sec.sectionId === section.sectionId
            ? { ...sec, sectionName, capacity }
            : sec
        ),
      }));
    } catch (error) {
      console.error("Error editing section:", error);
      toast.error("Failed to update section.");
    }
    setLoading(false);
    onClose();
  };

  const handleDelete = async () => {
    setLoading(true);
    try {
      await axios.delete(
        `http://localhost:8086/academic/api/new/deleteSectionById/${section.sectionId}`
      );
      toast.success("Section deleted successfully!");

      // Update the class details in parent component
      setClassDetails((prev) => ({
        ...prev,
        sections: prev.sections.filter(
          (sec) => sec.sectionId !== section.sectionId
        ),
      }));
    } catch (error) {
      console.error("Error deleting section:", error);
      toast.error("Failed to delete section.");
    }
    setLoading(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full">
        {/* Header */}
        <h2 className="text-xl font-bold mb-4 text-gray-800">
          {type === "edit" ? "Edit Section" : "Delete Section"}
        </h2>

        {/* Edit Form */}
        {type === "edit" && (
          <form onSubmit={handleSave}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">
                Section Name
              </label>
              <input
                type="text"
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                value={sectionName}
                onChange={(e) => setSectionName(e.target.value)}
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">
                Capacity
              </label>
              <input
                type="number"
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                value={capacity}
                onChange={(e) => setCapacity(e.target.value)}
                required
                min="1"
              />
            </div>

            {/* Buttons */}
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 disabled:opacity-50"
              >
                {loading ? "Saving..." : "Save"}
              </button>
            </div>
          </form>
        )}

        {/* Delete Confirmation */}
        {type === "delete" && (
          <>
            <p className="text-gray-600">
              Are you sure you want to delete the section{" "}
              <strong>{section.sectionName}</strong>?
            </p>

            {/* Buttons */}
            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={onClose}
                className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={loading}
                className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 disabled:opacity-50"
              >
                {loading ? "Deleting..." : "Delete"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default EditSection;
