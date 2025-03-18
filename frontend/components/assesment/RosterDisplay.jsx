'use client';

import React, { useState, useEffect } from "react";
import { FunnelIcon, UsersIcon } from "@heroicons/react/24/outline";
import axios from "axios";
import toast from "react-hot-toast";

const RosterDisplay = () => {
  const [filters, setFilters] = useState({
    streamId: "",
    classId: "",
    sectionId: "",
    semester: "1st", 
  });
  const [rosterData, setRosterData] = useState([]);
  const [students, setStudents] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [streams, setStreams] = useState([]);
  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch streams on mount
  useEffect(() => {
    const fetchStreams = async () => {
      setLoading(true);
      try {
        const response = await axios.get("http://localhost:8086/api/streams");
        setStreams(response.data.map((s) => ({ value: s.id, label: `Stream ${s.id}` })));
      } catch (error) {
        toast.error("Failed to load streams");
        console.error("Error fetching streams:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStreams();
  }, []);

  // Fetch classes when streamId changes
  useEffect(() => {
    if (!filters.streamId) {
      setClasses([]);
      setSections([]);
      setFilters((prev) => ({ ...prev, classId: "", sectionId: "" }));
      return;
    }

    const fetchClasses = async () => {
      setLoading(true);
      try {
        const response = await axios.get("http://localhost:8087/api/classes", {
          params: { streamId: filters.streamId },
        });
        setClasses(response.data.map((c) => ({ value: c.id, label: `Class ${c.id}` })));
      } catch (error) {
        toast.error("Failed to load classes");
        console.error("Error fetching classes:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchClasses();
  }, [filters.streamId]);

  // Fetch sections when classId changes
  useEffect(() => {
    if (!filters.classId) {
      setSections([]);
      setFilters((prev) => ({ ...prev, sectionId: "" }));
      return;
    }

    const fetchSections = async () => {
      setLoading(true);
      try {
        const response = await axios.get("http://localhost:8088/api/sections", {
          params: { classId: filters.classId },
        });
        setSections(response.data.map((s) => ({ value: s.id, label: `Section ${s.id}` })));
      } catch (error) {
        toast.error("Failed to load sections");
        console.error("Error fetching sections:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSections();
  }, [filters.classId]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleFilter = async () => {
    if (!filters.streamId || !filters.classId || !filters.sectionId) {
      toast.error("Please select all filter options");
      return;
    }
    setLoading(true);
    try {
      // Fetch students based on filters
      const studentResponse = await axios.get("http://localhost:8084/api/students", {
        params: {
          streamId: filters.streamId,
          classId: filters.classId,
          sectionId: filters.sectionId,
        },
      });
      setStudents(studentResponse.data);

      // Fetch subjects for the selected class
      const subjectResponse = await axios.get("http://localhost:8085/api/subjects", {
        params: { classId: filters.classId },
      });
      setSubjects(subjectResponse.data);

      // Fetch roster analytics
      const rosterResponse = await axios.get("http://localhost:8081/api/assessment-analytics/roster", {
        params: {
          streamId: filters.streamId,
          classId: filters.classId,
          sectionId: filters.sectionId,
          semester: filters.semester, // Use the semester from filters
        },
      });
      setRosterData(rosterResponse.data);
    } catch (error) {
      toast.error("Failed to fetch roster data");
      console.error("Error fetching roster:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <UsersIcon className="h-6 w-6 text-gray-600" />
          Roster for Students
        </h2>
        <div className="border-t border-yellow-500 pt-4">
          <h3 className="text-lg font-medium text-gray-700 mb-4">Select Ground</h3>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
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
                <option value="">Select</option>
                {sections.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Semester <span className="text-red-500">*</span>
              </label>
              <select
                name="semester"
                value={filters.semester}
                onChange={handleFilterChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={loading}
              >
                <option value="1st">1st Semester</option>
                <option value="2nd">2nd Semester</option>
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
      {loading ? (
        <p className="text-center text-gray-500">Loading...</p>
      ) : rosterData.length === 0 ? (
        <p className="text-center text-gray-500">No data available for the selected filters.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-300">
            <thead>
              <tr className="bg-gray-200 text-gray-700">
                <th className="border p-2 text-left">No</th>
                <th className="border p-2 text-left">Students Name</th>
                <th className="border p-2 text-left">Sex</th>
                <th className="border p-2 text-left">Age</th>
                <th className="border p-2 text-left">Semister</th>
                {subjects.map((subject) => (
                  <th key={subject.subjectId} className="border p-2 text-center">
                    <div>{subject.name || `Subject ${subject.subjectId}`}</div>
                    <div className="grid grid-cols-3 gap-1 text-sm">
                      <span>1st</span>
                      <span>2nd</span>
                      <span>Average</span>
                    </div>
                  </th>
                ))}
                <th className="border p-2 text-left">Total</th>
                <th className="border p-2 text-left">Average</th>
                <th className="border p-2 text-left">Rank</th>
                <th className="border p-2 text-left">Conduct</th>
              </tr>
            </thead>
            <tbody>
              {rosterData.map((studentData, index) => {
                const studentInfo = students.find(
                  (s) => s.studentId === studentData.studentId
                );
                return (
                  <tr
                    key={studentData.studentId}
                    className={index % 2 === 0 ? "bg-gray-50" : "bg-white"}
                  >
                    <td className="border p-2">{index + 1}</td>
                    <td className="border p-2">{studentInfo?.name || "Unknown"}</td>
                    <td className="border p-2">{studentInfo?.sex || "N/A"}</td>
                    <td className="border p-2">{studentInfo?.age || "N/A"}</td>
                    <td className="border p-2">{studentData.semester || "N/A"}</td>
                    {subjects.map((subject) => {
                      const assessments = studentData.assessments?.filter(
                        (a) => a.subjectId === subject.subjectId
                      );
                      const firstSemScore = assessments?.find((a) => a.semester === "1st")?.score || 0;
                      const secondSemScore = assessments?.find((a) => a.semester === "2nd")?.score || 0;
                      const averageScore = (firstSemScore + secondSemScore) / 2;
                      return (
                        <td key={subject.subjectId} className="border p-2">
                          <div className="grid grid-cols-3 gap-1 text-center">
                            <span>{firstSemScore}</span>
                            <span>{secondSemScore}</span>
                            <span>{averageScore.toFixed(2)}</span>
                          </div>
                        </td>
                      );
                    })}
                    <td className="border p-2">{studentData.totalMarks}</td>
                    <td className="border p-2">{studentData.averageMarks?.toFixed(2) || "0.00"}</td>
                    <td className="border p-2">{studentData.rank}</td>
                    <td className="border p-2">{studentInfo?.conduct || "A"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default RosterDisplay;