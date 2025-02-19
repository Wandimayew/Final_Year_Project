"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "react-toastify";
import axios from "axios";

const SubjectList = ({ setSubjectListClicked, setAssign }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [subjects, setSubjects] = useState([]);
  const [school, setSchool] = useState("");

  const getClassList = async () => {
    try {
      const response = await axios.get(
        `http://localhost:8084/academic/api/new/getAllSubjectBySchool`
      );
      setSubjects(response.data);
    } catch (error) {
      console.error("Error fetching subjects:", error);
      toast.error(`Network error: ${error.message}`);
    }
  };

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

  useEffect(() => {
    if (school) {
      getClassList();
    }
  }, [school]);

  const addSubject = () => {
    setSubjectListClicked(false);
    setAssign(false);
  };

  const assignSubject = () => {
    setSubjectListClicked(false);
    setAssign(true);
  };

  return (
    <div className="relative top-20">
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2 text-gray-600">
            <Link href="/">Home</Link>
            <span>-</span>
            <Link href="/subject">Subject</Link>
            <span>-</span>
            <span>Subject List</span>
          </div>
          <div className="flex justify-between gap-5">
            <button
              className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
              onClick={assignSubject}
            >
              + Assign Subject
            </button>
            <button
              className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
              onClick={addSubject}
            >
              + Add Subject
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4">#</th>
                <th className="text-left py-3 px-4">Subject Name</th>
                <th className="text-left py-3 px-4">Subject Code</th>
                <th className="text-left py-3 px-4">Credit Hour</th>
                <th className="text-left py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {subjects.map((subject, index) => (
                <tr key={subject.subjectId} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4">{index + 1}</td>
                  <td className="py-3 px-4">{subject.subjectName}</td>
                  <td className="py-3 px-4">{subject.subjectCode}</td>
                  <td className="py-3 px-4">{subject.creditHours}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-1 rounded-full text-sm bg-green-100 text-green-600">
                      Active
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SubjectList;