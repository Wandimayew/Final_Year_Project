"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "react-toastify";
import axios from "axios";
import SubjectTable from "../constant/SubjectTable";
import Breadcrumb from "../constant/Breadcrumb";

// Force dynamic rendering
export const dynamic = 'force-dynamic';

const SubjectList = ({ setSubjectListClicked, setAssign }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [subjects, setSubjects] = useState([]);
  const [school, setSchool] = useState([]);

  const getClassList = async () => {
    try {
      const response = await axios.get(
        `http://localhost:8086/academic/api/new/getAllSubjectBySchool`
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
          <Breadcrumb />
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
       <SubjectTable subjects={subjects} />
      </div>
    </div>
  );
};

export default SubjectList;