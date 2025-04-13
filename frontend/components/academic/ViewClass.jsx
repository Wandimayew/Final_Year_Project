"use client";

import { useState, useMemo } from "react";
import { useAuthStore } from "@/lib/auth";
import Link from "next/link";
import { toast } from "react-toastify";
import { useClassDetails } from "@/lib/api/academicService/class";
import AddSection from "./AddSection";
import EditSection from "./EditSection";
import Popup from "../constant/Popup";

const ViewClass = ({ id }) => {
  const [isAddSectionOpen, setAddSectionOpen] = useState(false);
  const [editingSection, setEditingSection] = useState(null);
  const [actionType, setActionType] = useState(null);

  const authState = useMemo(
    () =>
      useAuthStore.getState()
        ? {
            user: useAuthStore.getState().user,
            isAuthenticated: useAuthStore.getState().isAuthenticated(),
          }
        : { user: null, isAuthenticated: false },
    []
  );
  const { user } = authState;

  const schoolId = user.schoolId;
  const {
    data: classDetails,
    isLoading,
    isError,
    error,
  } = useClassDetails(schoolId, id);

  if (isLoading) {
    return (
      <div
        className={`
          relative top-20 p-6 min-h-screen
          bg-[var(--background)] text-[var(--text)]
          dark:bg-[var(--background)] dark:text-[var(--text)]
          night:bg-[var(--background)] night:text-[var(--text)]
        `}
      >
        Loading...
      </div>
    );
  }

  if (isError) {
    return (
      <div
        className={`
          relative top-20 p-6 min-h-screen
          bg-[var(--background)] text-[var(--text)]
          dark:bg-[var(--background)] dark:text-[var(--text)]
          night:bg-[var(--background)] night:text-[var(--text)]
        `}
      >
        Error: {error.message}
      </div>
    );
  }

  return (
    <div
      className={`
        relative top-20 p-6 min-h-screen flex flex-col gap-6
        bg-[var(--background)] text-[var(--text)]
        dark:bg-[var(--background)] dark:text-[var(--text)]
        night:bg-[var(--background)] night:text-[var(--text)]
      `}
    >
      <div>
        <Link
          href="/academic/class"
          className={`
            bg-[var(--secondary)] text-[var(--text)] px-4 py-2 rounded-md hover:bg-opacity-80
            dark:bg-[var(--secondary)] dark:text-[var(--text)]
            night:bg-[var(--secondary)] night:text-[var(--text)]
          `}
        >
          Back to Class List
        </Link>
      </div>

      <div
        className={`
          shadow-lg [var(--surface)] p-6 rounded-lg
          bg-[var(--surface)]
          dark:bg-[var(--surface)]
          night:bg-[var(--surface)]
        `}
      >
        <h1
          className={`
            text-2xl font-bold
            text-[var(--text)]
            dark:text-[var(--text)]
            night:text-[var(--text)]
          `}
        >
          Class Details
        </h1>
        <p
          className={`
            text-[var(--text)]
            dark:text-[var(--text)]
            night:text-[var(--text)]
          `}
        >
          <strong>Class ID:</strong> {id}
        </p>
        <p
          className={`
            text-[var(--text)]
            dark:text-[var(--text)]
            night:text-[var(--text)]
          `}
        >
          <strong>Class Name:</strong> {classDetails?.className}
        </p>
        <p
          className={`
            text-[var(--text)]
            dark:text-[var(--text)]
            night:text-[var(--text)]
          `}
        >
          <strong>Academic Year:</strong> {classDetails?.academicYear}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div
          className={`
            shadow-lg p-6 rounded-lg
            bg-[var(--surface)]
            dark:bg-[var(--surface)]
            night:bg-[var(--surface)]
          `}
        >
          <div className="flex justify-between items-center mb-4">
            <h2
              className={`
                text-xl font-semibold
                text-[var(--text)]
                dark:text-[var(--text)]
                night:text-[var(--text)]
              `}
            >
              Sections
            </h2>
            <button
              className={`
                bg-[var(--primary)] text-white px-3 py-1 rounded-md hover:bg-opacity-80
                dark:bg-[var(--primary)] dark:text-white
                night:bg-[var(--primary)] night:text-white
              `}
              onClick={() => setAddSectionOpen(true)}
            >
              Add Section
            </button>
          </div>

          {classDetails?.sections && classDetails.sections.length > 0 ? (
            <ul className="space-y-4">
              {classDetails.sections.map((section) => (
                <li
                  key={section.sectionId}
                  className={`
                    p-4 border rounded-lg flex justify-between items-center
                    border-[var(--secondary)]
                    dark:border-[var(--secondary)]
                    night:border-[var(--secondary)]
                  `}
                >
                  <span
                    className={`
                      text-[var(--text)]
                      dark:text-[var(--text)]
                      night:text-[var(--text)]
                    `}
                  >
                    {section.sectionName} - {section.capacity} Students
                  </span>
                  <div className="flex gap-2">
                    <button
                      className={`
                        text-orange-500 border px-3 py-1 rounded-md hover:bg-orange-100
                        border-orange-300
                        dark:text-orange-400 dark:border-orange-400 dark:hover:bg-orange-900
                        night:text-orange-300 night:border-orange-300 night:hover:bg-orange-900
                      `}
                      onClick={() => {
                        setEditingSection(section);
                        setActionType("edit");
                      }}
                    >
                      Edit
                    </button>
                    <button
                      className={`
                        text-red-500 border px-3 py-1 rounded-md hover:bg-red-100
                        border-red-300
                        dark:text-red-400 dark:border-red-400 dark:hover:bg-red-900
                        night:text-red-300 night:border-red-300 night:hover:bg-red-900
                      `}
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
            <p
              className={`
                text-[var(--secondary)]
                dark:text-[var(--secondary)]
                night:text-[var(--secondary)]
              `}
            >
              No sections available.
            </p>
          )}
        </div>

        <div
          className={`
            shadow-lg p-6 rounded-lg
            bg-[var(--surface)]
            dark:bg-[var(--surface)]
            night:bg-[var(--surface)]
          `}
        >
          <h2
            className={`
              text-xl font-semibold mb-4
              text-[var(--text)]
              dark:text-[var(--text)]
              night:text-[var(--text)]
            `}
          >
            Subjects
          </h2>
          {classDetails?.subjects && classDetails.subjects.length > 0 ? (
            <ul className="space-y-2">
              {classDetails.subjects.map((subject) => (
                <li
                  key={subject.subjectId}
                  className={`
                    text-[var(--text)]
                    dark:text-[var(--text)]
                    night:text-[var(--text)]
                  `}
                >
                  <strong>{subject.subjectName}</strong> - {subject.teacherName}{" "}
                  (Duration: {subject.duration} min)
                </li>
              ))}
            </ul>
          ) : (
            <p
              className={`
                text-[var(--secondary)]
                dark:text-[var(--secondary)]
                night:text-[var(--secondary)]
              `}
            >
              No subjects available.
            </p>
          )}
        </div>
      </div>

      {editingSection && (
        <EditSection
          section={editingSection}
          classId={id}
          onClose={() => setEditingSection(null)}
          type={actionType}
        />
      )}

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
