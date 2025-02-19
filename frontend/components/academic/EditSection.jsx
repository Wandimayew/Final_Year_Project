"use client";

import React, { useState } from "react";
import axios from "axios";

const EditSection = ({ section, classId, onClose, type, setClassDetails}) => {
  const [sectionName, setSectionName] = useState(section?.sectionName || "");
  const [capacity, setCapacity] = useState(section?.capacity || 0);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      console.log("Editing section with data:", sectionName, capacity);

      await axios.put(
        `http://localhost:8084/academic/api/new/editSectionById/${section.sectionId}`,
        {
          sectionName,
          capacity: parseInt(capacity, 10),
          classId,
        }
      );
      console.log("Section edited successfully!");
    } catch (error) {
      console.error("Error editing section:", error);
    }
    onClose();
  };

  const handleDelete = async () => {
    try {
      console.log("Deleting section with ID:", section.sectionId);
      await axios.delete(
        `http://localhost:8084/academic/api/new/deleteSectionById/${section.sectionId}`
      );
      console.log("Section deleted successfully!");
      const updatedSections = classDetails.sections.filter(
        (sec) => sec.sectionId !== section.sectionId
      );
      setClassDetails((prev) => ({ ...prev, sections: updatedSections }));
  
      setEditingSection(null);
    } catch (error) {
      console.error("Error deleting section:", error);
    }
    onClose();
  };

  return (
    <div className="fixed right-0 top-20 w-1/4 h-full bg-gray-100 p-4 shadow-lg">
      {type === "edit" && (
        <>
          <h2 className="text-xl font-bold mb-4">Edit Section</h2>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">
              Section Name
            </label>
            <input
              type="text"
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
              value={sectionName}
              onChange={(e) => setSectionName(e.target.value)}
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">
              Capacity
            </label>
            <input
              type="number"
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
              value={capacity}
              onChange={(e) => setCapacity(e.target.value)}
            />
          </div>
          <div className="flex justify-end gap-2">
            <button
              onClick={onClose}
              className="bg-gray-500 text-white px-4 py-2 rounded-md"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="bg-blue-500 text-white px-4 py-2 rounded-md"
            >
              Save
            </button>
          </div>
        </>
      )}

      {type === "delete" && (
        <>
          <h2 className="text-xl font-bold mb-4">Delete Section</h2>
          <p>
            Are you sure you want to delete the section{" "}
            <strong>{section.sectionName}</strong>?
          </p>
          <div className="flex justify-end gap-2 mt-4">
            <button
              onClick={onClose}
              className="bg-gray-500 text-white px-4 py-2 rounded-md"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              className="bg-red-500 text-white px-4 py-2 rounded-md"
            >
              Delete
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default EditSection;