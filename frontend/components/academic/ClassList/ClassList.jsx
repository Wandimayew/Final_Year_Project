"use client";

import { useState, useEffect, useMemo } from "react";
import { toast } from "react-toastify";
import Breadcrumb from "../../constant/Breadcrumb";
import { useAuthStore } from "@/lib/auth";
import SearchBar from "../../constant/SearchBar";
import ExportStyled from "./ExportButtons";
import ClassTable from "./ClassTable";
import { useRouter } from "next/navigation";
import { useClassesBySchool } from "@/lib/api/academicService/class";

const ClassList = ({ classListClicked, setClassListClicked }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [exportFormat, setExportFormat] = useState("csv");
  const [showExportOptions, setShowExportOptions] = useState(false);

  const router = useRouter();

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
  const { data: classes = [], isLoading, error } = useClassesBySchool(schoolId);

  const filteredClasses = classes.filter((clas) =>
    clas.className.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleExportDone = () => {
    setShowExportOptions(false);
  };

  if (isLoading) {
    return (
      <div
        className={`
          relative top-20 p-6 flex flex-col min-h-screen
          bg-[var(--background)] text-[var(--text)]
          dark:bg-[var(--background)] dark:text-[var(--text)]
          night:bg-[var(--background)] night:text-[var(--text)]
        `}
      >
        Loading...
      </div>
    );
  }

  if (error) {
    return (
      <div
        className={`
          relative top-20 p-6 flex flex-col min-h-screen
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
        relative top-20 p-6 flex flex-col min-h-screen
        bg-[var(--background)] text-[var(--text)]
        dark:bg-[var(--background)] dark:text-[var(--text)]
        night:bg-[var(--background)] night:text-[var(--text)]
      `}
    >
      <Breadcrumb />

      <div className="flex justify-between items-center mb-4">
        <SearchBar
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          placeholder="Search Class..."
        />

        <div className="flex gap-4">
          <button
            onClick={() => setClassListClicked(false)}
            className={`
              bg-[var(--primary)] text-white p-2 rounded
              hover:bg-opacity-80
              dark:bg-[var(--primary)] dark:text-white
              night:bg-[var(--primary)] night:text-white
            `}
          >
            + Add Class
          </button>

          {!showExportOptions && (
            <button
              onClick={() => setShowExportOptions((prev) => !prev)}
              className={`
                bg-[var(--primary)] text-white p-2 rounded
                hover:bg-opacity-80
                dark:bg-[var(--primary)] dark:text-white
                night:bg-[var(--primary)] night:text-white
              `}
            >
              Export
            </button>
          )}
        </div>
      </div>

      {showExportOptions ? (
        <div className="mb-4">
          <ExportStyled
            classes={filteredClasses}
            onExportDone={handleExportDone}
          />
        </div>
      ) : (
        <div className="mb-4">
          <ClassTable
            classes={filteredClasses}
            router={router}
            schoolId={schoolId}
          />
        </div>
      )}
    </div>
  );
};

export default ClassList;
