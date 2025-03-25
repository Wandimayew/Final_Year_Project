"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";
import { toast } from "react-toastify";
import AddSection from "./AddSection";
import EditSection from "./EditSection";
import Popup from "../constant/PopUp";

const ViewClass = ({ id }) => {
  const [isAddSectionOpen, setAddSectionOpen] = useState(false);
  const [editingSection, setEditingSection] = useState(null);
  const [actionType, setActionType] = useState(null);
  const [classDetails, setClassDetails] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          `http://10.194.61.74:8080/academic/api/new/getClassDetails/${id}`
        );
        setClassDetails(response.data);
      } catch (error) {
        console.error("Error fetching class details:", error);
        toast.error(`Network error: ${error.message}`);
      }
    };
    fetchData();
  }, [id]);

  return (
    <div className="relative top-20 p-6 bg-gray-100 min-h-screen flex flex-col gap-6">
      {/* Back Button */}
      <div>
        <Link
          href="/academic/class"
          className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600"
        >
          Back to Class List
        </Link>
      </div>

      {/* Class Info */}
      <div className="bg-white shadow-lg p-6 rounded-lg">
        <h1 className="text-2xl font-bold text-gray-800">Class Details</h1>
        <p className="text-gray-600">
          <strong>Class ID:</strong> {id}
        </p>
        <p className="text-gray-600">
          <strong>Class Name:</strong> {classDetails.className}
        </p>
        <p className="text-gray-600">
          <strong>Academic Year:</strong> {classDetails.academicYear}
        </p>
      </div>

      {/* Sections & Subjects */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Sections */}
        <div className="bg-white shadow-lg p-6 rounded-lg">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800">Sections</h2>
            <button
              className="bg-cyan-500 text-white px-3 py-1 rounded-md hover:bg-cyan-600"
              onClick={() => setAddSectionOpen(true)}
            >
              Add Section
            </button>
          </div>

          {classDetails.sections && classDetails.sections.length > 0 ? (
            <ul className="space-y-4">
              {classDetails.sections.map((section) => (
                <li
                  key={section.sectionId}
                  className="p-4 border border-gray-300 rounded-lg flex justify-between items-center"
                >
                  <span className="text-gray-700">
                    {section.sectionName} - {section.capacity} Students
                  </span>
                  <div className="flex gap-2">
                    <button
                      className="text-orange-500 border border-orange-300 px-3 py-1 rounded-md hover:bg-orange-100"
                      onClick={() => {
                        setEditingSection(section);
                        setActionType("edit");
                      }}
                    >
                      Edit
                    </button>
                    <button
                      className="text-red-500 border border-red-300 px-3 py-1 rounded-md hover:bg-red-100"
                      onClick={() => {
                        setEditingSection(section);
                        setActionType("delete");
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">No sections available.</p>
          )}
        </div>

        {/* Subjects */}
        <div className="bg-white shadow-lg p-6 rounded-lg">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Subjects</h2>
          {classDetails.subjects && classDetails.subjects.length > 0 ? (
            <ul className="space-y-2">
              {classDetails.subjects.map((subject) => (
                <li key={subject.subjectId} className="text-gray-700">
                  <strong>{subject.subjectName}</strong> - {subject.teacherName}{" "}
                  (Duration: {subject.duration} min)
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">No subjects available.</p>
          )}
        </div>
      </div>

      {/* Edit Section Sidebar */}
      {editingSection && (
        <EditSection
          section={editingSection}
          classId={id}
          onClose={() => setEditingSection(null)}
          type={actionType}
          setClassDetails={setClassDetails}
        />
      )}

      {/* Add Section Popup */}
      <Popup
        title="Add Section"
        isOpen={isAddSectionOpen}
        onClose={() => setAddSectionOpen(false)}
      >
        <AddSection
          onClose={() => setAddSectionOpen(false)}
          classOptions={id}
        />
      </Popup>
    </div>
  );
};

export default ViewClass;
