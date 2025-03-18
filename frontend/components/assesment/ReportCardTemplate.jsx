'use client';

import React from "react";
import { useReactToPrint } from "react-to-print";
import image from "@/public/image.png"; // Replace with actual path

const ReportCardTemplate = React.forwardRef(({ reportCardData, studentInfo }, ref) => {
  const {
    firstSemesterAssessments,
    secondSemesterAssessments,
    totalMarksFirstSemester,
    totalMarksSecondSemester,
    averageGradeFirstSemester,
    averageGradeSecondSemester,
    firstSemesterStatus,
    secondSemesterStatus,
    overallStatus,
    remarks,
  } = reportCardData;

  const allAssessments = [...firstSemesterAssessments, ...secondSemesterAssessments];
  const subjects = allAssessments.reduce((acc, assessment) => {
    if (!acc[assessment.subjectId]) {
      acc[assessment.subjectId] = { name: assessment.assessmentName, scores: [] };
    }
    acc[assessment.subjectId].scores.push(assessment.score || 0);
    return acc;
  }, {});

  const subjectEntries = Object.entries(subjects).map(([subjectId, { name, scores }]) => ({
    subjectId,
    name,
    firstSemScore: scores[0] || 0,
    secondSemScore: scores[1] || 0,
    average: scores.length > 1 ? (scores[0] + scores[1]) / 2 : scores[0] || 0,
  }));

  const currentYear = new Date().getFullYear();
  const handlePrint = useReactToPrint({
    content: () => ref.current,
    documentTitle: `ReportCard_${studentInfo?.name}_${currentYear}`,
  });

  return (
    <div className="report-card-container w-[800px] bg-white shadow-2xl rounded-lg overflow-hidden">
      <style jsx>{`
        @media print {
          .report-card-container {
            width: 100%;
            box-shadow: none;
            margin: 0;
            padding: 0;
          }
          .print-button {
            display: none;
          }
          @page {
            size: A4;
            margin: 1cm;
          }
        }
      `}</style>
      <div ref={ref} className="p-6 flex flex-col items-center">
        <img src={image} alt="School Logo" className="w-32 h-32 mb-4" />
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Report Card</h1>
        <h2 className="text-xl text-gray-600 mb-4">Uruji Manna Special Secondary School</h2>
        <div className="w-full border-t-2 border-gray-300 mb-4"></div>
        <div className="text-center">
          <p className="text-lg"><strong>Student Name:</strong> {studentInfo?.name || "Unknown"}</p>
          <p className="text-lg"><strong>Sex:</strong> {studentInfo?.sex || "N/A"}</p>
          <p className="text-lg"><strong>Age:</strong> {studentInfo?.age || "N/A"}</p>
          <p className="text-lg"><strong>Stream:</strong> {reportCardData.stream || "N/A"}</p>
          <p className="text-lg"><strong>Class:</strong> {reportCardData.classId || "N/A"}</p>
          <p className="text-lg"><strong>Section:</strong> {reportCardData.sectionId || "N/A"}</p>
          <p className="text-lg"><strong>Year:</strong> {currentYear}</p>
        </div>
        <div className="w-full border-t-2 border-gray-300 mt-4"></div>
        <div className="mt-4">
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-200">
                <th className="border p-2">Subject</th>
                <th className="border p-2">1st Sem</th>
                <th className="border p-2">2nd Sem</th>
                <th className="border p-2">Average</th>
              </tr>
            </thead>
            <tbody>
              {subjectEntries.map((subject) => (
                <tr key={subject.subjectId} className="text-center">
                  <td className="border p-2">{subject.name}</td>
                  <td className="border p-2">{subject.firstSemScore.toFixed(2)}</td>
                  <td className="border p-2">{subject.secondSemScore.toFixed(2)}</td>
                  <td className="border p-2">{subject.average.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="mt-4">
            <p><strong>Total Marks (1st Semester):</strong> {totalMarksFirstSemester.toFixed(2)}</p>
            <p><strong>Total Marks (2nd Semester):</strong> {totalMarksSecondSemester.toFixed(2)}</p>
            <p><strong>Average (1st Semester):</strong> {averageGradeFirstSemester.toFixed(2)}</p>
            <p><strong>Average (2nd Semester):</strong> {averageGradeSecondSemester.toFixed(2)}</p>
            <p>
              <strong>Overall Average:</strong>{" "}
              {((averageGradeFirstSemester + averageGradeSecondSemester) / 2).toFixed(2)}
            </p>
            <p className="text-lg"><strong>Rank:</strong> {studentInfo?.rank || "N/A"}</p>
            <p><strong>1st Semester Status:</strong> {firstSemesterStatus}</p>
            <p><strong>2nd Semester Status:</strong> {secondSemesterStatus}</p>
            <p><strong>Overall Status:</strong> {overallStatus}</p>
            <p><strong>Remarks:</strong> {remarks || "N/A"}</p>
          </div>
          <div className="mt-4 text-right">
            <p><strong>Principal Signature:</strong> ____________________</p>
            <p><strong>Date:</strong> {new Date().toLocaleDateString()}</p>
          </div>
        </div>
        <button
          onClick={handlePrint}
          className="mt-4 bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 print-button"
        >
          Print/Download
        </button>
      </div>
    </div>
  );
});

export default ReportCardTemplate;