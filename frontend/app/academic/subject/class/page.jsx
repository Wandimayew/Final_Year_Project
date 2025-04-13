"use client";

import { useState, useEffect, useMemo } from "react";
import { useAuthStore } from "@/lib/auth";
import axios from "axios"; // Kept for student API fetch (see notes)
import { toast } from "react-toastify";
import SubjectByClass from "@/components/academic/subject/SubjectByClass";
import { useSubjectsByClass } from "@/lib/api/academicService/subject";

// Force dynamic rendering to avoid prerendering at build time
export const dynamic = "force-dynamic";

const ClassSubjectPage = () => {
  const [classId, setClassId] = useState(null);
  // const [schoolId, setSchoolId] = useState("");
  const [isClassIdLoading, setIsClassIdLoading] = useState(true);
  const [classIdError, setClassIdError] = useState(null);

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

  // Fetch classId based on student ID
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
        setClassIdError("Failed to load class data");
      } finally {
        setIsClassIdLoading(false);
      }
    };

    fetchClass();
  }, []);

  // Fetch subjects using React Query
  const {
    data: subjectData = [],
    isLoading: subjectsLoading,
    isError,
    error,
  } = useSubjectsByClass(
    schoolId,
    classId,
    { enabled: !!schoolId && !!classId } // Only fetch when schoolId and classId are available
  );

  if (isClassIdLoading || subjectsLoading) {
    return (
      <div className="flex justify-center p-8">
        <div className="animate-spin h-10 w-10 border-4 border-blue-500 rounded-full border-t-transparent"></div>
      </div>
    );
  }

  if (classIdError) {
    return (
      <div className="p-4 bg-red-100 text-red-700 rounded-md">
        {classIdError}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-4 bg-red-100 text-red-700 rounded-md">
        {error.message}
      </div>
    );
  }

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
