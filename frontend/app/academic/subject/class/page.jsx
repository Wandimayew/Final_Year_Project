"use client";

import { useState, useEffect } from "react";
import SubjectByClass from "@/components/academic/subject/SubjectByClass";
import axios from "axios";

// Force dynamic rendering to avoid prerendering at build time
export const dynamic = "force-dynamic";

const ClassSubjectPage = () => {
  const [subjectData, setSubjectData] = useState([]);
  const [classId, setClassId] = useState(null); // Use null initially
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchClass = async () => {
      try {
        const response = await axios.get(
          `http://10.94.61.74:8080/student/api/students?id=nsr/2506/13`
        );
        const fetchedClassId = response.data[0]?.classId;
        console.log("Response in ClassSubjectPage:", fetchedClassId);
        setClassId(fetchedClassId || null);
      } catch (err) {
        console.error("Error fetching class:", err);
        setError("Failed to load class data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchClass();
  }, []);

  useEffect(() => {
    if (classId) {
      const fetchSubject = async () => {
        try {
          const response = await axios.get(
            `http://10.194.61.74:8080/academic/api/new/getAllSubjectByClass/${classId}`
          );
          setSubjectData(response.data || []);
        } catch (err) {
          console.error("Error fetching subjects:", err);
          setError("Failed to load subjects");
        }
      };
      fetchSubject();
    }
  }, [classId]);

  if (isLoading)
    return (
      <div className="flex justify-center p-8">
        <div className="animate-spin h-10 w-10 border-4 border-blue-500 rounded-full border-t-transparent"></div>
      </div>
    );
  if (error)
    return (
      <div className="p-4 bg-red-100 text-red-700 rounded-md">{error}</div>
    );

  return (
    <div>
      {classId ? (
        <SubjectByClass subjectData={subjectData} />
      ) : (
        <div className="p-4 bg-yellow-100 text-yellow-700 rounded-md">
          No class data available
        </div>
      )}
    </div>
  );
};

export default ClassSubjectPage;
