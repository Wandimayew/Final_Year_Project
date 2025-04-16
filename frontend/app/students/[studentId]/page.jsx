"use client";

import { useStudent } from "@/lib/api/studentService/students";
import { use } from "react";
import StudentProfile from '@/components/students/StudentDetails';

const StudentDetailPage = ({params}) => {
  const { studentId } = use(params);
  const {data: studentData, isLoading, error} = useStudent(studentId);
  return (
      <StudentProfile studentData={studentData} studentId={studentId} />
  )
}

export default StudentDetailPage;