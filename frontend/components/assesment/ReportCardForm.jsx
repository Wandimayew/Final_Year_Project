'use client';

import React, { useState, useEffect } from "react";
import { FaFileAlt } from 'react-icons/fa'; // Importing the icon

const ReportCardForm = ({ onFilter, studentId }) => {
  const [formData, setFormData] = useState({
    academicYear: "",
    stream: "",
    classId: "",
    sectionId: "",
    reportCardTemplate: "t1",
  });
  const [academicYears, setAcademicYears] = useState([]);
  const [streams, setStreams] = useState([]);
  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);

  useEffect(() => {
    if (studentId) {
      const fetchAcademicYears = async () => {
        try {
          const response = await fetch(`/api/students/${studentId}/academic-years`);
          if (!response.ok) {
            throw new Error("Failed to fetch academic years");
          }
          const data = await response.json();
          setAcademicYears(data);

          if (data.length > 0) {
            setFormData((prev) => ({ ...prev, academicYear: data[0] }));
          }
        } catch (error) {
          console.error("Error fetching academic years:", error);
          setAcademicYears([]);
        }
      };

      fetchAcademicYears();
    }
  }, [studentId]);

  useEffect(() => {
    const fetchStreams = async () => {
      const response = await fetch("/api/streams");
      const data = await response.json();
      setStreams(data);
    };

    const fetchClasses = async () => {
      const response = await fetch("/api/classes");
      const data = await response.json();
      setClasses(data);
    };

    const fetchSections = async () => {
      const response = await fetch("/api/sections");
      const data = await response.json();
      setSections(data);
    };

    fetchStreams();
    fetchClasses();
    fetchSections();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onFilter(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 bg-gray-100 rounded-lg shadow-lg">
      <div className="flex items-center mb-4">
        <FaFileAlt className="mr-2 text-xl text-blue-500" />
        <h2 className="text-2xl font-bold text-gray-700">Generate Report Card</h2>
      </div>
      <hr className="border-t-2 border-yellow-500 mb-4" />

      <div className="grid grid-cols-3 gap-3 text-black">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Academic Year *</label>
          <select
            name="academicYear"
            value={formData.academicYear}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="">Select Academic Year</option>
            {academicYears.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Stream *</label>
          <select
            name="stream"
            value={formData.stream}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="">Select Stream</option>
            {streams.map((stream) => (
              <option key={stream.id} value={stream.id}>
                {stream.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Class *</label>
          <select
            name="classId"
            value={formData.classId}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2"
            required
          >
            <option value="">Select Class</option>
            {classes.map((cls) => (
              <option key={cls.id} value={cls.id}>
                {cls.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Section *</label>
          <select
            name="sectionId"
            value={formData.sectionId}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2"
            required
          >
            <option value="">Select Section</option>
            {sections.map((section) => (
              <option key={section.id} value={section.id}>
                {section.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Report Card Template *</label>
          <select
            name="reportCardTemplate"
            value={formData.reportCardTemplate}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2"
            required
          >
            <option value="t1">Template 1</option>
          </select>
        </div>
      </div>

      <div className="flex justify-end mt-4">
        <button
          type="submit"
          className="bg-blue-500 text-white py-2 px-6 rounded-lg hover:bg-blue-600 transition duration-300 font-mono"
        >
          Filter
        </button>
      </div>
    </form>
  );
};

export default ReportCardForm;
