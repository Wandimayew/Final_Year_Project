'use client';

import React, { useState, useRef } from "react";
import { FaUserGraduate } from 'react-icons/fa'; // Importing the icon
import ReportCardTemplate from "./ReportCardTemplate";

const StudentList = ({ students, onViewReport }) => {
  const [showReportCard, setShowReportCard] = useState(null);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const reportCardRef = useRef();

  // Toggle checkbox selection for a student
  const handleCheckboxChange = (registerNo) => {
    setSelectedStudents((prevSelected) =>
      prevSelected.includes(registerNo)
        ? prevSelected.filter((id) => id !== registerNo)
        : [...prevSelected, registerNo]
    );
  };

  // Handle printing for selected students
  const handlePrintSelected = () => {
    if (students.length === 0) {
      alert("No Row Are Selected"); 
    } else if (selectedStudents.length === 0) {
      alert("No Row Are Selected"); 
    } else {
      // For now, show the first selected student's report card
      const firstSelectedStudent = students.find((s) => s.registerNo === selectedStudents[0]);
      if (firstSelectedStudent) {
        setShowReportCard(firstSelectedStudent);
        onViewReport(firstSelectedStudent);
      }
    }
  };

  // Handle downloading PDF for selected students
  const handleDownloadPDF = () => {
    if (students.length === 0) {
      alert("No Row Are Selected"); // Show alert if no students in table
    } else if (selectedStudents.length === 0) {
      alert("No Row Are Selected"); // Show alert if no students selected
    } else {
      // For now, trigger print for the first selected student
      const firstSelectedStudent = students.find((s) => s.registerNo === selectedStudents[0]);
      if (firstSelectedStudent) {
        setShowReportCard(firstSelectedStudent);
        onViewReport(firstSelectedStudent);
      }
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4 font-mono text-black flex items-center">
        <FaUserGraduate className="mr-2 text-2xl text-blue-500" /> {/* Icon added here */}
        Student List
      </h2>
      <div className="flex justify-end mb-2">
        <button
          onClick={handleDownloadPDF}
          className="bg-green-500 text-white py-2 px-4 rounded mr-2 hover:bg-green-600 font-mono"
          disabled={students.length === 0 || selectedStudents.length === 0}
        >
          Download PDF
        </button>
        <button
          onClick={handlePrintSelected}
          className="bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600 font-mono"
          disabled={students.length === 0 || selectedStudents.length === 0}
        >
          Print
        </button>
      </div>
      <table className="w-full border-collapse border border-gray-300 text-black font-mono">
        <thead>
          <tr className="bg-gray-200">
            <th className="border p-2">SL</th>
            <th className="border p-2">Student Name</th>
            <th className="border p-2">Register No</th>
            <th className="border p-2">Total Marks</th>
            <th className="border p-2">Average</th>
            <th className="border p-2">Status</th>
            <th className="border p-2">Rank</th>
            <th className="border p-2">Action</th>
            <th className="border p-2">Select</th>
          </tr>
        </thead>
        <tbody>
          {students.length > 0 ? (
            students.map((student, index) => (
              <tr key={student.registerNo} className="text-center">
                <td className="border p-2">{index + 1}</td>
                <td className="border p-2">{student.rank}</td>
                <td className="border p-2">{student.name}</td>
                <td className="border p-2">{student.registerNo}</td>
                <td className="border p-2">{student.totalMarks.toFixed(2)}</td>
                <td className="border p-2">{student.averageGrade.toFixed(2)}</td>
                <td className="border p-2">{student.overallStatus}</td>
                <td className="border p-2">
                  <button
                    onClick={() => onViewReport(student)}
                    className="bg-blue-500 text-white py-1 px-2 rounded hover:bg-blue-600"
                  >
                    View
                  </button>
                </td>
                <td className="border p-2">
                  <input
                    type="checkbox"
                    checked={selectedStudents.includes(student.registerNo)}
                    onChange={() => handleCheckboxChange(student.registerNo)}
                    className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="9" className="border p-2 text-center text-red-500">
                No Information Available
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {showReportCard && (
        <div className="mt-4">
          <ReportCardTemplate
            ref={reportCardRef}
            reportCardData={showReportCard.reportCardData}
            studentInfo={{
              name: showReportCard.name,
              registerNo: showReportCard.registerNo,
              sex: showReportCard.sex || "Male",
              age: showReportCard.age || 16,
              rank: showReportCard.rank,
            }}
          />
        </div>
      )}
    </div>
  );
};

export default StudentList;
