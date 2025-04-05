"use client";

import React, { useState } from "react";
import ReportCardForm from "@/components/assesment/ReportCardForm";
import StudentList from "@/components/assesment/StudentList";

export const dynamic = 'force-dynamic';

const AssessmentPage = () => {
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [selectedTemplate, setSelectedTemplate] = useState("t1"); 
  const handleFilter = async (formData) => {
    try {
      // Replace with actual API call to fetch report cards
      const response = await fetch("/api/assessment/report-card", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await response.json();

      // Map the API response to the student list format
      let studentList = data.map((report) => ({
        name: report.studentName || "Unknown",
        registerNo: report.studentId || "N/A",
        totalMarks: report.totalMarksFirstSemester + report.totalMarksSecondSemester,
        averageGrade: (report.averageGradeFirstSemester + report.averageGradeSecondSemester) / 2,
        overallStatus: report.overallStatus,
        reportCardData: {
          firstSemesterAssessments: report.firstSemesterAssessments || [],
          secondSemesterAssessments: report.secondSemesterAssessments || [],
          totalMarksFirstSemester: report.totalMarksFirstSemester || 0,
          totalMarksSecondSemester: report.totalMarksSecondSemester || 0,
          averageGradeFirstSemester: report.averageGradeFirstSemester || 0,
          averageGradeSecondSemester: report.averageGradeSecondSemester || 0,
          firstSemesterStatus: report.firstSemesterStatus || "N/A",
          secondSemesterStatus: report.secondSemesterStatus || "N/A",
          overallStatus: report.overallStatus || "N/A",
          remarks: report.remarks || "N/A",
          stream: formData.stream || "Natural Science", 
          classId: formData.classId || "Six",
          sectionId: formData.sectionId || "A",
        },
      }));

      // Sort students by totalMarks in descending order and assign ranks
      studentList = studentList
        .sort((a, b) => b.totalMarks - a.totalMarks)
        .map((student, index) => ({
          ...student,
          rank: index + 1,
        }));

      setStudents(studentList);
      setSelectedTemplate(formData.reportCardTemplate); // Store the selected template
    } catch (error) {
      console.error("Error fetching report cards:", error);
      setStudents([]);
    }
  };

  const handleViewReport = async (student) => {
    setSelectedStudent(student);
  };

  return (
    <div className="container mx-auto p-4">
      <ReportCardForm onFilter={handleFilter} />
      <StudentList
        students={students}
        onViewReport={handleViewReport}
        selectedTemplate={selectedTemplate} 
      />
    </div>
  );
};

export default AssessmentPage;