"use client";
import { useState } from "react";
import {
  Trash2,
  QrCode,
  Eye,
  Printer,
  Download,
  FileText,
} from "lucide-react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useDeleteStudent, useStudents } from "@/lib/api/studentService/students";
import { FaTimes } from "react-icons/fa";
import Link from "next/link";
import InputField from "@/components/InputField";
export const dynamic = "force-dynamic";

const StudentList = () => {
  const [classId, setClassId] = useState(null);
  const [sectionId, setSectionId] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const { data: studentsData, isLoading, refetch } = useStudents({ classId, sectionId });
  const { mutateAsync: deleteStudent } = useDeleteStudent();

  const studentsArray = Array.isArray(studentsData) ? studentsData : [];

  const handleDelete = async (id) => {
    setStudentToDelete(id);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteStudent(studentToDelete);
      refetch();
      setDeleteModalOpen(false);
      toast.success("Student deleted successfully!");
    } catch (error) {
      console.error("Error deleting student:", error);
      toast.error("An error occurred. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="p-4 max-w-full bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center gap-2 mb-6">
        <h1 className="text-xl font-semibold">Student List</h1>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <h2 className="text-lg font-medium mb-4">Select Ground</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField
              label="Select Class"
              name="classId"
              type="select"
              onChange={(e) => setClassId(e.target.value)}
            >
              <option value="">Select a class</option>
              <option value={1}>One</option>
              <option value={2}>Two</option>
            </InputField>
            <InputField
                label="Select Section"
                name="sectionId"
                type="select"
                onChange={(e) => setSectionId(e.target.value)}
              >
                <option value="">Select a section</option>
                <option value={1}>A</option>
                <option value={2}>B</option>
            </InputField>
        </div>
      </div>

      {/* Actions Bar */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex gap-2">
            <Download className="w-5 h-5" />
            <FileText className="w-5 h-5" />
            <Printer className="w-5 h-5" />
          </div>
          <div className="w-full md:w-auto">
            <input
              type="search"
              placeholder="Search..."
              className="w-full md:w-64 border rounded-md p-2"
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <input type="checkbox" className="rounded" />
              </th>
              <th className="p-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Photo
              </th>
              <th className="p-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="p-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Class
              </th>
              <th className="p-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Section
              </th>
              <th className="p-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Register No
              </th>
              <th className="p-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Guardian ID
              </th>
              <th className="p-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {studentsArray.map((student) => (
              <tr key={student.studentId} className="hover:bg-gray-50">
                <td className="p-4">
                  <input type="checkbox" className="rounded" />
                </td>
                <td className="p-4">
                  <div className="w-10 h-10 rounded-full bg-gray-200"></div>
                </td>
                <td className="p-4">{`${student.firstName} ${student.lastName}`}</td>
                <td className="p-4">{student.classId}</td>
                <td className="p-4">{student.sectionId}</td>
                <td className="p-4">{student.registId}</td>
                <td className="p-4">{student.parentId}</td>
                <td className="p-4">
                  <div className="flex gap-2">
                    <button className="p-1 hover:bg-gray-100 rounded">
                      <QrCode className="w-4 h-4" />
                    </button>
                    <Link href={`/students/${student.studentId}`} className="p-1 hover:bg-gray-100 rounded">
                      <Eye className="w-4 h-4" />
                    </Link>
                    <button
                      onClick={() => handleDelete(student.studentId)}
                      className="p-1 hover:bg-gray-100 rounded"
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Delete Student</h2>
              <button
                onClick={() => setDeleteModalOpen(false)}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                <FaTimes className="h-6 w-6" />
              </button>
            </div>
            <p className="text-gray-700 mb-6">
              Are you sure you want to delete this Student? This action cannot
              be undone.
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setDeleteModalOpen(false)}
                className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={isDeleting}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentList;
