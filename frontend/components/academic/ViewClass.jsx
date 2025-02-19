"use client";

import React, { useEffect, useState } from "react";
import AddSection from "./AddSection";
import Popup from "../constant/PopUp";
import EditSection from "./EditSection";
import axios from "axios";
import Link from "next/link";
import { toast } from "react-toastify";

const ViewClass = ({ id }) => {
  const [isAddSectionOpen, setAddSectionOpen] = useState(false);
  const [editingSection, setEditingSection] = useState(null);
  const [actionType, setActionType] = useState(null); // To track whether editing or deleting
  const [classDetails, setClassDetails] = useState([]);

  const handleEditSection = (section) => {
    setEditingSection(section);
    setActionType("edit");
  };

  const handleDeleteSection = (section) => {
    setEditingSection(section);
    setActionType("delete");
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          `http://localhost:8084/academic/api/new/getClassDetails/${id}`
        );
        setClassDetails(response.data);
        console.log("details data in page ",response.data);
        
      } catch (error) {
        console.error("Error fetching subjects:", error);
        toast.error(`Network error: ${error.message}`);
      }
    };
    fetchData();
  }, []);
  return (
    <div className="relative top-20 p-4 flex transition-all duration-300">
      {/* Main Content - Adjust width when EditSection is open */}
      <div
        className={`w-full ${
          editingSection ? "w-2/3" : "w-full"
        } transition-all duration-300`}
      >
        {/* <button
          onClick={() => setSelectedClassId(null)}
          className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600"
        >
          Back to Class List
        </button> */}
        <Link
          href="/academic/class"
          className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600"
        >
          Back to Class List
        </Link>

        <h1 className="text-2xl font-bold mt-4">Class Details</h1>
        <p>
          <strong>Class ID:</strong> {id}
        </p>
        <p>
          <strong>Class Name:</strong> {classDetails.className}
        </p>
        <p>
          <strong>Academic Year:</strong> {classDetails.academicYear}
        </p>

        <h2 className="text-xl font-semibold mt-4">Sections</h2>
        {classDetails.sections && classDetails.sections.length > 0 ? (
          <>
            <ul className="list-disc ml-6">
              {classDetails.sections.map((section) => (
                <li
                  key={section.sectionId}
                  className={` w-2/3 ${
                    editingSection ? "w-3/4" : "w-2/3"
                  } rounded-md border-2 flex justify-between border-gray-700 my-2 px-2 border-solid`}
                >
                  {section.sectionName} - {section.capacity} Students Capacity
                  <div className="flex gap-2">
                    <p
                      className={`border border-solid border-orange-300 rounded-lg px-4 py-1 cursor-pointer`}
                      onClick={() => handleEditSection(section)}
                    >
                      Edit
                    </p>
                    <p
                      className="border border-solid border-orange-300 rounded-lg px-4 cursor-pointer py-1"
                      onClick={() => handleDeleteSection(section)}
                    >
                      Delete
                    </p>
                  </div>
                </li>
              ))}
            </ul>
            <span
              className="border-2 cursor-pointer px-3 py-1 rounded-md bg-cyan-500"
              onClick={() => setAddSectionOpen(true)}
            >
              Add Section
            </span>
          </>
        ) : (
          <>
            <p>No sections available.</p>
            <span
              className="border-2 cursor-pointer px-3 py-1 rounded-md bg-cyan-500"
              onClick={() => setAddSectionOpen(true)}
            >
              Add Section
            </span>
          </>
        )}

        <h2 className="text-xl font-semibold mt-4">Subjects</h2>
        {classDetails.subjects && classDetails.subjects.length > 0 ? (
          <ul className="list-disc ml-6">
            {classDetails.subjects.map((subject) => (
              <li key={subject.subjectId}>
                {subject.subjectName} - {subject.teacherName} (Duration:{" "}
                {subject.duration} min)
              </li>
            ))}
          </ul>
        ) : (
          <p>No subjects available.</p>
        )}
      </div>

      {/* Sidebar for Edit Section */}
      {editingSection && (
        <EditSection
          section={editingSection}
          classId={id}
          onClose={() => setEditingSection(null)}
          type={actionType} // Pass "edit" or "delete" dynamically
          setClassDetails
        />
      )}

      {/* AddSection Popup */}
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
