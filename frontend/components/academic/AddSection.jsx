"use client"


import React, { useState, useEffect } from "react";
import axios, { formToJSON } from "axios";

// Force dynamic rendering
export const dynamic = 'force-dynamic';

const AddSection = ({onClose, classOptions }) => {
  // State for the form inputs
  const [sectionName, setSectionName] = useState("");
  const [capacity, setCapacity] = useState("");
  const [classId, setClassId] = useState([]);

  // State for errors
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    if (!sectionName.trim()) newErrors.sectionName = "Section name is required.";
    if (!capacity) newErrors.capacity = "Capacity is required.";
    else if (capacity < 1) newErrors.capacity = "Capacity must be at least 1.";
    return newErrors;
  };

  const handleSubmit = async (e) => {
    console.log("submitting");
    
    e.preventDefault();
    const formErrors = validateForm();
    console.log("error form ",formErrors);
    
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    try {
      // Example API call to submit data
      console.log("datas for section ", sectionName,capacity,classOptions);
      
      await axios.post(`http://localhost:8086/academic/api/new/addNewSection`, {
        sectionName,
        capacity: parseInt(capacity, 10),
        classId: classOptions,
      });
      console.log("Section added successfully!");
    //   alert("Section added successfully!");
    } catch (error) {
      console.error("Error adding section:", error);
    //   alert("Failed to add section.");
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        {/* Section Name */}
        <div className="mb-4">
          <label htmlFor="sectionName" className="block text-sm font-medium text-gray-700">
            Section Name
          </label>
          <input
            type="text"
            id="sectionName"
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
            value={sectionName}
            onChange={(e) => setSectionName(e.target.value)}
          />
          {errors.sectionName && (
            <p className="text-red-500 text-sm mt-1">{errors.sectionName}</p>
          )}
        </div>

        {/* Capacity */}
        <div className="mb-4">
          <label htmlFor="capacity" className="block text-sm font-medium text-gray-700">
            Capacity
          </label>
          <input
            type="number"
            id="capacity"
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
            value={capacity}
            onChange={(e) => setCapacity(e.target.value)}
          />
          {errors.capacity && (
            <p className="text-red-500 text-sm mt-1">{errors.capacity}</p>
          )}
        </div>

        {/* Class ID
        <div className="mb-4">
          <label htmlFor="classId" className="block text-sm font-medium text-gray-700">
            Class
          </label>
          <select
            id="classId"
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
            value={classId}
            onChange={(e) => setClassId(e.target.value)}
          >
            <option value="">Select a class</option>
            {classOptions.map((classOption) => (
              <option key={classOption.id} value={classOption.id}>
                {classOption.name}
              </option>
            ))}
          </select>
          {errors.classId && (
            <p className="text-red-500 text-sm mt-1">{errors.classId}</p>
          )}
        </div> */}

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="button"
            className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 mr-2"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
          >
            Add Section
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddSection;
