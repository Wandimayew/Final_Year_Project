"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import Breadcrumb from "../../constant/Breadcrumb";
import SearchBar from "../../constant/SearchBar";
import ExportStyled from "./ExportButtons";
import ClassTable from "./ClassTable";
import { useRouter } from "next/navigation";

const ClassList = ({ classListClicked, setClassListClicked }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [classes, setClasses] = useState([]);
  const [school, setSchool] = useState("");
  const [exportFormat, setExportFormat] = useState("csv");
  const [showExportOptions, setShowExportOptions] = useState(false); // state to control visibility of ExportStyled

  const router = useRouter();

  useEffect(() => {
    if (school) {
      const getClassList = async () => {
        try {
          const response = await axios.get(
            `http://localhost:8084/academic/api/new/getAllClassBySchool`
          );
          setClasses(response.data);
        } catch (error) {
          console.error("Error during fetching classes:", error);
          toast.error(`Network error: ${error.message}`);
        }
      };
      getClassList();
    }
  }, [school]); // Only run when `school` is set

  useEffect(() => {
    const userData = localStorage.getItem("auth-store");
    if (userData) {
      try {
        const parsedData = JSON.parse(userData);
        setSchool(parsedData.user.schoolId);
      } catch (error) {
        console.error("Error parsing user data:", error);
      }
    }
  }, []);

  // Filtering classes based on searchQuery
  const filteredClasses = classes.filter((clas) =>
    clas.className.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Callback to hide export options after export is done
  const handleExportDone = () => {
    setShowExportOptions(false); // Hide ExportStyled
  };

  return (
    <div className="relative top-20 p-6 bg-gray-100 flex flex-col min-h-screen">
      {/* Breadcrumb Navigation */}
      <Breadcrumb />

      {/* Header Section: Search Bar, Add Class, and Export Options */}
      <div className="flex justify-between items-center mb-4">
        <SearchBar
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          placeholder="Search Class..."
        />

        <div className="flex gap-4">
          {/* Button to toggle add class form */}
          <button
            onClick={() => setClassListClicked(false)}
            className="bg-green-500 text-white p-2 rounded"
          >
            + Add Class
          </button>

          {/* Export Button to Toggle Export Options */}
          {!showExportOptions && (
            <button
              onClick={() => setShowExportOptions((prev) => !prev)}
              className="bg-blue-500 text-white p-2 rounded"
            >
              Export
            </button>
          )}
        </div>
      </div>

      {/* Conditionally render ExportStyled based on showExportOptions */}
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
            setClasses={setClasses}
          />
        </div>
      )}
    </div>
  );
};

export default ClassList;
