"use client";

import { useState, useEffect, useMemo } from "react";
import { useAuthStore } from "@/lib/auth";
import Link from "next/link";
import { toast } from "react-toastify";
import { useSubjectsBySchool } from "@/lib/api/academicService/subject";
import SubjectTable from "../constant/SubjectTable";
import Breadcrumb from "../constant/Breadcrumb";

const SubjectList = ({ setSubjectListClicked, setAssign }) => {
  const [searchQuery, setSearchQuery] = useState("");

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
    data: subjects = [],
    isLoading,
    isError,
    error,
  } = useSubjectsBySchool(schoolId);

  const addSubject = () => {
    setSubjectListClicked(false);
    setAssign(false);
  };

  const assignSubject = () => {
    setSubjectListClicked(false);
    setAssign(true);
  };

  if (isLoading) {
    return (
      <div
        className={`
          relative top-20 p-6
          bg-[var(--background)] text-[var(--text)]
          dark:bg-[var(--background)] dark:text-[var(--text)]
          night:bg-[var(--background)] night:text-[var(--text)]
        `}
      >
        <p
          className={`
            text-[var(--secondary)]
            dark:text-[var(--secondary)]
            night:text-[var(--secondary)]
          `}
        >
          Loading...
        </p>
      </div>
    );
  }

  if (isError) {
    return (
      <div
        className={`
          relative top-20 p-6
          bg-[var(--background)] text-[var(--text)]
          dark:bg-[var(--background)] dark:text-[var(--text)]
          night:bg-[var(--background)] night:text-[var(--text)]
        `}
      >
        <p
          className={`
            text-red-500
            dark:text-red-400
            night:text-red-300
          `}
        >
          Error: {error.message}
        </p>
      </div>
    );
  }

  const filteredSubjects = subjects.filter((subject) =>
    subject.subjectName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div
      className={`
        relative top-20 p-6
        bg-[var(--background)] text-[var(--text)]
        dark:bg-[var(--background)] dark:text-[var(--text)]
        night:bg-[var(--background)] night:text-[var(--text)]
      `}
    >
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <Breadcrumb />
          <div className="flex justify-between gap-5">
            <button
              className={`
                px-4 py-2 rounded-md hover:bg-opacity-80
                bg-[var(--primary)] text-white
                focus:outline-none focus:ring focus:ring-[var(--primary)]
                dark:bg-[var(--primary)] dark:text-white
                night:bg-[var(--primary)] night:text-white
              `}
              onClick={assignSubject}
            >
              + Assign Subject
            </button>
            <button
              className={`
                px-4 py-2 rounded-md hover:bg-opacity-80
                bg-[var(--primary)] text-white
                focus:outline-none focus:ring focus:ring-[var(--primary)]
                dark:bg-[var(--primary)] dark:text-white
                night:bg-[var(--primary)] night:text-white
              `}
              onClick={addSubject}
            >
              + Add Subject
            </button>
          </div>
        </div>
        <div className="relative mb-4">
          <input
            type="text"
            placeholder="Search Subjects"
            className={`
              pl-10 pr-4 py-2 border rounded-md w-full
              border-[var(--secondary)] bg-[var(--background)] text-[var(--text)]
              focus:outline-none focus:ring focus:ring-[var(--primary)]
              dark:border-[var(--secondary)] dark:bg-[var(--background)] dark:text-[var(--text)]
              night:border-[var(--secondary)] night:bg-[var(--background)] night:text-[var(--text)]
            `}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <svg
            className={`
              absolute left-3 top-2.5 h-5 w-5
              text-[var(--secondary)]
              dark:text-[var(--secondary)]
              night:text-[var(--secondary)]
            `}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
        <SubjectTable subjects={filteredSubjects} />
      </div>
    </div>
  );
};

export default SubjectList;