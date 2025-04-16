"use client";
import { useState, useEffect, useRef } from "react";
import {
  Trash2,
  QrCode,
  Eye,
  Printer,
  Download,
  FileText,
} from "lucide-react";
import { toast } from 'react-hot-toast';
import { useDeleteStudent, useStudents } from "@/lib/api/studentService/students";
import { FaTimes } from "react-icons/fa";
import Link from "next/link";
import InputField from "@/components/InputField";
import * as XLSX from "xlsx";

const StudentList = () => {
  const [classId, setClassId] = useState("");
  const [sectionId, setSectionId] = useState("");
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const tableRef = useRef(null);

  const classes = [
    { id: 1, name: "One" },
    { id: 2, name: "Two" },
  ];
  const sections = [
    { id: 1, name: "A" },
    { id: 2, name: "B" },
  ];

  const { data: studentsData, isLoading, error, refetch } = useStudents({ 
    classId: classId || undefined, 
    sectionId: sectionId || undefined 
  });
  const { mutateAsync: deleteStudent } = useDeleteStudent();

  const studentsArray = Array.isArray(studentsData) ? studentsData : [];
  const filteredStudents = studentsArray.filter(student => 
    `${student.firstName} ${student.lastName}`
      .toLowerCase()
      .includes(searchQuery.toLowerCase()) ||
    student.registId.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const exportToExcel = () => {
    const exportData = filteredStudents.map(student => ({
      "Name": `${student.firstName} ${student.lastName}`,
      "Class": classes.find(cls => cls.id === student.classId)?.name || student.classId,
      "Section": sections.find(sec => sec.id === student.sectionId)?.name || student.sectionId,
      "Register No": student.registId,
      "Guardian ID": student.parentId || "Not Assigned",
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Students");
    XLSX.writeFile(workbook, "Student_List.xlsx");
    toast.success("Exported to Excel successfully!");
  };

  const exportToCSV = () => {
    const headers = ["Name", "Class", "Section", "Register No", "Guardian ID"];
    const rows = filteredStudents.map(student => [
      `${student.firstName} ${student.lastName}`,
      classes.find(cls => cls.id === student.classId)?.name || student.classId,
      sections.find(sec => sec.id === student.sectionId)?.name || student.sectionId,
      student.registId,
      student.parentId || "Not Assigned",
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "Student_List.csv";
    link.click();
    toast.success("Exported to CSV successfully!");
  };

  const printTable = () => {
    const printWindow = window.open("", "_blank", "width=800,height=600");
    
    // Clone the table and remove the Action column
    const tableClone = tableRef.current.cloneNode(true);
    const actionHeader = tableClone.querySelector("th:last-child"); // Action column header
    const actionCells = tableClone.querySelectorAll("td:last-child"); // Action column cells
    
    if (actionHeader) actionHeader.remove();
    actionCells.forEach(cell => cell.remove());

    // Generate the print content
    printWindow.document.write(`
      <html>
        <head>
          <title>Student List</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              margin: 20px; 
            }
            table { 
              width: 100%; 
              border-collapse: collapse; 
              margin-top: 20px;
            }
            th, td { 
              border: 1px solid #ddd; 
              padding: 8px; 
              text-align: left; 
            }
            th { 
              background-color: #f2f2f2; 
              font-weight: bold;
            }
            img { 
              max-width: 40px; 
              max-height: 40px; 
              border-radius: 50%; 
            }
            @media print {
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <h1>Student List</h1>
          ${tableClone.outerHTML}
        </body>
      </html>
    `);

    printWindow.document.close();
    
    // Ensure content is loaded before printing
    printWindow.onload = () => {
      printWindow.focus();
      printWindow.print();
      printWindow.close();
    };
  };

  const handleDelete = (id) => {
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
      toast.error("An error occurred while deleting the student.");
    } finally {
      setIsDeleting(false);
      setStudentToDelete(null);
    }
  };

  useEffect(() => {
    if (!classId) {
      setSectionId("");
    }
  }, [classId]);

  return (
    <div className="p-4 max-w-full bg-gray-50 min-h-screen">
      <div className="flex items-center gap-2 mb-6">
        <h1 className="text-xl font-semibold">Student List</h1>
      </div>

      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <h2 className="text-lg font-medium mb-4">Select Criteria</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InputField
            label="Select Class"
            name="classId"
            type="select"
            value={classId}
            onChange={(e) => setClassId(e.target.value)}
          >
            <option value="">All Classes</option>
            {classes.map(cls => (
              <option key={cls.id} value={cls.id}>{cls.name}</option>
            ))}
          </InputField>
          <InputField
            label="Select Section"
            name="sectionId"
            type="select"
            value={sectionId}
            onChange={(e) => setSectionId(e.target.value)}
            disabled={!classId}
          >
            <option value="">All Sections</option>
            {sections.map(sec => (
              <option key={sec.id} value={sec.id}>{sec.name}</option>
            ))}
          </InputField>
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex gap-2">
            <button 
              onClick={exportToExcel} 
              className="p-2 hover:bg-gray-100 rounded" 
              title="Export to Excel"
              disabled={filteredStudents.length === 0}
            >
              <Download className="w-5 h-5" />
            </button>
            <button 
              onClick={exportToCSV} 
              className="p-2 hover:bg-gray-100 rounded" 
              title="Export to CSV"
              disabled={filteredStudents.length === 0}
            >
              <FileText className="w-5 h-5" />
            </button>
            <button 
              onClick={printTable} 
              className="p-2 hover:bg-gray-100 rounded" 
              title="Print"
              disabled={filteredStudents.length === 0}
            >
              <Printer className="w-5 h-5" />
            </button>
          </div>
          <div className="w-full md:w-64">
            <input
              type="search"
              placeholder="Search by name or register no..."
              className="w-full border rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table ref={tableRef} className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-4 text-left text-xs FONT-MEDIUM text-gray-500 uppercase tracking-wider">
                <input 
                  type="checkbox" 
                  className="rounded" 
                  disabled={filteredStudents.length === 0} 
                />
              </th>
              <th className="p-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Photo</th>
              <th className="p-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="p-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Class</th>
              <th className="p-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Section</th>
              <th className="p-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Register No</th>
              <th className="p-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Guardian ID</th>
              <th className="p-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider no-print">Action</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {isLoading ? (
              <tr>
                <td colSpan="8" className="p-4 text-center text-gray-500">
                  Loading students...
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan="8" className="p-4 text-center text-red-500">
                  Error loading students: {error.message}
                </td>
              </tr>
            ) : filteredStudents.length > 0 ? (
              filteredStudents.map((student) => (
                <tr key={student.studentId} className="hover:bg-gray-50">
                  <td className="p-4">
                    <input type="checkbox" className="rounded" />
                  </td>
                  <td className="p-4">
                    <div className="w-10 h-10 rounded-full bg-gray-200">
                      {student.profilePicture && (
                        <img 
                          src={student.profilePicture} 
                          alt={`${student.firstName}'s photo`}
                          className="w-full h-full rounded-full object-cover"
                        />
                      )}
                    </div>
                  </td>
                  <td className="p-4 text-sm text-gray-900">
                    {`${student.firstName} ${student.lastName}`}
                  </td>
                  <td className="p-4 text-sm text-gray-500">
                    {classes.find(cls => cls.id === student.classId)?.name || student.classId}
                  </td>
                  <td className="p-4 text-sm text-gray-500">
                    {sections.find(sec => sec.id === student.sectionId)?.name || student.sectionId}
                  </td>
                  <td className="p-4 text-sm text-gray-500">{student.registId}</td>
                  <td className="p-4 text-sm text-gray-500">
                    {student.parentId || "Not Assigned"}
                  </td>
                  <td className="p-4 no-print">
                    <div className="flex gap-2">
                      <button className="p-1 hover:bg-gray-100 rounded" title="View QR Code">
                        <QrCode className="w-4 h-4" />
                      </button>
                      <Link href={`/students/${student.studentId}`} className="p-1 hover:bg-gray-100 rounded" title="View Details">
                        <Eye className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => handleDelete(student.studentId)}
                        className="p-1 hover:bg-gray-100 rounded"
                        title="Delete Student"
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" className="p-4 text-center text-gray-500">
                  {classId || sectionId 
                    ? "No students found for the selected criteria"
                    : "Please select a class or section to view students"}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {deleteModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">Delete Student</h2>
              <button
                onClick={() => setDeleteModalOpen(false)}
                className="text-gray-500 hover:text-gray-700 transition-colors"
                disabled={isDeleting}
              >
                <FaTimes className="h-6 w-6" />
              </button>
            </div>
            <p className="text-gray-700 mb-6">
              Are you sure you want to delete this student? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setDeleteModalOpen(false)}
                className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={isDeleting}
                className={`px-4 py-2 rounded-lg text-white transition-colors ${
                  isDeleting ? "bg-red-400 cursor-not-allowed" : "bg-red-600 hover:bg-red-700"
                }`}
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