"use client";

import { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { PencilIcon, TrashIcon, EyeIcon } from "@heroicons/react/24/outline";

export default function MarkEntryTable({ assessments, students, onSave }) {
  const [marks, setMarks] = useState(
    assessments.map((assessment) => ({
      assessmentId: assessment.assessmentId,
      studentId: assessment.studentId,
      finalExam: assessment.type === "FINAL_EXAM" ? assessment.score || "" : "",
      midExam: assessment.type === "MID_EXAM" ? assessment.score || "" : "",
      otherAssessments:
        ["QUIZ", "ASSIGNMENT", "HOMEWORK"].includes(assessment.type)
          ? assessment.score || ""
          : "",
      isEditing: false, // New state for edit mode
    }))
  );

  const handleMarkChange = (studentId, field, value) => {
    setMarks((prev) =>
      prev.map((mark) =>
        mark.studentId === studentId ? { ...mark, [field]: value } : mark
      )
    );
  };

  const handleSave = async () => {
    try {
      const updates = marks
        .filter(
          (mark) =>
            mark.finalExam !== "" ||
            mark.midExam !== "" ||
            mark.otherAssessments !== ""
        )
        .map((mark) => {
          const assessment = assessments.find(
            (a) => a.assessmentId === mark.assessmentId
          );
          const update = {
            assessmentId: mark.assessmentId,
            studentId: mark.studentId,
            schoolId: assessment.schoolId,
            streamId: assessment.streamId,
            classId: assessment.classId,
            sectionId: assessment.sectionId,
            subjectId: assessment.subjectId,
            assessmentName: assessment.assessmentName,
            assessmentDate: assessment.assessmentDate,
            type: assessment.type,
            score: 0, // Will be set based on the field
            status: "COMPLETED",
          };

          if (mark.finalExam !== "") {
            update.type = "FINAL_EXAM";
            update.score = parseFloat(mark.finalExam);
          } else if (mark.midExam !== "") {
            update.type = "MID_EXAM";
            update.score = parseFloat(mark.midExam);
          } else if (mark.otherAssessments !== "") {
            update.type = assessment.type; // Use the actual type (QUIZ, ASSIGNMENT, HOMEWORK)
            update.score = parseFloat(mark.otherAssessments);
          }

          return update;
        });

      await Promise.all(
        updates.map((update) =>
          axios.put(
            `http://localhost:8080/api/assessments/${update.assessmentId}`,
            update
          )
        )
      );
      toast.success("Marks saved successfully");
      onSave(); // Notify parent to refresh data
    } catch (error) {
      toast.error("Failed to save marks");
      console.error("Error saving marks:", error);
    }
  };

  const handleEdit = (studentId) => {
    setMarks((prev) =>
      prev.map((mark) =>
        mark.studentId === studentId ? { ...mark, isEditing: true } : mark
      )
    );
  };

  const handleDelete = async (assessmentId) => {
    try {
      await axios.delete(`http://localhost:8080/api/assessments/${assessmentId}`);
      setMarks((prev) =>
        prev.filter((mark) => mark.assessmentId !== assessmentId)
      );
      toast.success("Assessment deleted successfully");
      onSave(); // Refresh data
    } catch (error) {
      toast.error("Failed to delete assessment");
      console.error("Error deleting assessment:", error);
    }
  };

  const handleView = (assessmentId) => {
    // Logic to view assessment details (e.g., open a modal or navigate to a view page)
    toast.info(`Viewing assessment ${assessmentId}`);
    // Implement navigation or modal logic here
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 md:p-8 mb-8">
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200">
          <thead>
            <tr className="bg-gray-100">
              <th className="py-2 px-4 border-b text-left">Sl</th>
              <th className="py-2 px-4 border-b text-left">Student Name</th>
              <th className="py-2 px-4 border-b text-left">Register No</th>
              <th className="py-2 px-4 border-b text-left">Final Exam (50)</th>
              <th className="py-2 px-4 border-b text-left">Mid Exam (30)</th>
              <th className="py-2 px-4 border-b text-left">Other Assessments (20)</th>
              <th className="py-2 px-4 border-b text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {marks.map((mark, index) => {
              const student = students.find((s) => s.value === mark.studentId);
              const assessment = assessments.find(
                (a) => a.assessmentId === mark.assessmentId
              );
              return (
                <tr key={mark.assessmentId} className="hover:bg-gray-50">
                  <td className="py-2 px-4 border-b">{index + 1}</td>
                  <td className="py-2 px-4 border-b">
                    {student ? student.label.split(" (#")[0] : "Unknown"}
                  </td>
                  <td className="py-2 px-4 border-b">{`RSM-${mark.studentId}`}</td>
                  <td className="py-2 px-4 border-b">
                    <input
                      type="number"
                      value={mark.finalExam}
                      onChange={(e) =>
                        handleMarkChange(mark.studentId, "finalExam", e.target.value)
                      }
                      min="0"
                      max="50"
                      className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter marks"
                      disabled={!mark.isEditing}
                    />
                  </td>
                  <td className="py-2 px-4 border-b">
                    <input
                      type="number"
                      value={mark.midExam}
                      onChange={(e) =>
                        handleMarkChange(mark.studentId, "midExam", e.target.value)
                      }
                      min="0"
                      max="30"
                      className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter marks"
                      disabled={!mark.isEditing}
                    />
                  </td>
                  <td className="py-2 px-4 border-b">
                    <input
                      type="number"
                      value={mark.otherAssessments}
                      onChange={(e) =>
                        handleMarkChange(
                          mark.studentId,
                          "otherAssessments",
                          e.target.value
                        )
                      }
                      min="0"
                      max="20"
                      className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter marks"
                      disabled={!mark.isEditing}
                    />
                  </td>
                  <td className="py-2 px-4 border-b">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(mark.studentId)}
                        className="text-blue-500 hover:text-blue-700"
                        disabled={mark.isEditing}
                      >
                        <PencilIcon className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(mark.assessmentId)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleView(mark.assessmentId)}
                        className="text-green-500 hover:text-green-700"
                      >
                        <EyeIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="mt-4 flex justify-end">
        <button
          onClick={handleSave}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={marks.every((mark) => !mark.isEditing)}
        >
          <span>Save</span>
        </button>
      </div>
    </div>
  );
}