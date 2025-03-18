"use client";

import { useState, useEffect } from "react";
import { FunnelIcon, ArrowPathIcon } from "@heroicons/react/24/outline";
import axios from "axios";
import toast from "react-hot-toast";

export default function ProgressTrackerFilterForm({ onFilter }) {
  const [filters, setFilters] = useState({
    schoolId: "",
    streamId: "",
    classId: "",
    sectionId: "",
    subjectId: "",
    studentId: "",
  });
  const [schools, setSchools] = useState([]);
  const [streams, setStreams] = useState([]);
  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchOptions = async () => {
      setLoading(true);
      try {
        const [schoolResponse, streamResponse, classResponse, studentResponse] =
          await Promise.all([
            axios.get("http://localhost:8080/api/schools"),
            axios.get("http://localhost:8081/api/streams"),
            axios.get("http://localhost:8082/api/classes"),
            axios.get("http://localhost:8084/api/students"),
          ]);
        setSchools(
          schoolResponse.data.map((s) => ({ value: s.id, label: s.name }))
        );
        setStreams(
          streamResponse.data.map((s) => ({ value: s.id, label: s.name }))
        );
        setClasses(
          classResponse.data.map((c) => ({ value: c.id, label: c.name }))
        );
        setStudents(
          studentResponse.data.map((s) => ({
            value: s.id,
            label: `${s.name} (#${s.id})`,
          }))
        );
      } catch (error) {
        toast.error("Failed to load filter options");
        console.error("Error fetching options:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOptions();
  }, []);

  useEffect(() => {
    const fetchSectionsAndSubjects = async () => {
      if (!filters.classId) {
        setSections([]);
        setSubjects([]);
        setFilters((prev) => ({ ...prev, sectionId: "", subjectId: "" }));
        return;
      }

      setLoading(true);
      try {
        const [sectionResponse, subjectResponse] = await Promise.all([
          axios.get(
            `http://localhost:8082/api/sections?classId=${filters.classId}`
          ),
          axios.get(
            `http://localhost:8083/api/subjects?classId=${filters.classId}`
          ),
        ]);
        setSections(
          sectionResponse.data.map((s) => ({ value: s.id, label: s.name }))
        );
        setSubjects(
          subjectResponse.data.map((s) => ({ value: s.id, label: s.name }))
        );
      } catch (error) {
        toast.error("Failed to load sections or subjects");
        console.error("Error fetching sections/subjects:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSectionsAndSubjects();
  }, [filters.classId]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleFilter = () => {
    if (
      !filters.schoolId ||
      !filters.streamId ||
      !filters.classId ||
      !filters.sectionId ||
      !filters.subjectId ||
      !filters.studentId
    ) {
      toast.error("Please select all filter options");
      return;
    }
    onFilter(filters);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
      <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
        <ArrowPathIcon className="h-6 w-6 text-gray-600" /> {/* Added icon */}
        Progress Trackers
      </h2>
      <div className="border-t border-yellow-500 pt-4">
        <h3 className="text-lg font-medium text-gray-700 mb-4">
          Select Ground
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Stream <span className="text-red-500">*</span>
            </label>
            <select
              name="streamId"
              value={filters.streamId}
              onChange={handleFilterChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={loading}
            >
              <option value="">Select</option>
              {streams.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Class <span className="text-red-500">*</span>
            </label>
            <select
              name="classId"
              value={filters.classId}
              onChange={handleFilterChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={loading || !filters.streamId}
            >
              <option value="">Select</option>
              {classes.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Section <span className="text-red-500">*</span>
            </label>
            <select
              name="sectionId"
              value={filters.sectionId}
              onChange={handleFilterChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={loading || !filters.classId}
            >
              <option value="">
                {filters.classId ? "Select" : "Select Class First"}
              </option>
              {sections.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Subject <span className="text-red-500">*</span>
            </label>
            <select
              name="subjectId"
              value={filters.subjectId}
              onChange={handleFilterChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={loading || !filters.classId}
            >
              <option value="">
                {filters.classId ? "Select" : "Select Class First"}
              </option>
              {subjects.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Student <span className="text-red-500">*</span>
            </label>
            <select
              name="studentId"
              value={filters.studentId}
              onChange={handleFilterChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={loading}
            >
              <option value="">Select</option>
              {students.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="mt-4 flex justify-end">
          <button
            onClick={handleFilter}
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded-lg flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-gray-500"
            disabled={loading}
          >
            <FunnelIcon className="h-4 w-4" />
            Filter
          </button>
        </div>
      </div>
    </div>
  );
}
