"use client";
import { useState } from "react";
import {
  Search,
  Filter,
  Trash2,
  QrCode,
  Eye,
  Printer,
  Download,
  FileText,
} from "lucide-react";
import { useStudents } from "@/lib/api/students";

const StudentList = () => {
  const [selectedClass, setSelectedClass] = useState("Six");
  const [selectedSection, setSelectedSection] = useState("All Sections");

  const { data, isLoading } = useStudents();

  const students = [
    {
      id: "RSM-00001",
      name: "Danielle Solomon",
      class: "Six",
      section: "A",
      register: "RSM-00001",
      roll: 1,
      age: 16,
      guardian: "Binoya Naik",
    },
    {
      id: "RSM-00002",
      name: "Angelina Jolie",
      class: "Six",
      section: "A",
      register: "RSM-00002",
      roll: 2,
      age: 28,
      guardian: "Summer Dixon",
    },
    // Add more student data as needed
  ];

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
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Class <span className="text-red-500">*</span>
            </label>
            <select
              className="w-full border rounded-md p-2"
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
            >
              <option>Six</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Section <span className="text-red-500">*</span>
            </label>
            <select
              className="w-full border rounded-md p-2"
              value={selectedSection}
              onChange={(e) => setSelectedSection(e.target.value)}
            >
              <option>All Sections</option>
            </select>
          </div>
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
                Roll
              </th>
              <th className="p-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Age
              </th>
              <th className="p-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Guardian Name
              </th>
              <th className="p-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {students.map((student) => (
              <tr key={student.id} className="hover:bg-gray-50">
                <td className="p-4">
                  <input type="checkbox" className="rounded" />
                </td>
                <td className="p-4">
                  <div className="w-10 h-10 rounded-full bg-gray-200"></div>
                </td>
                <td className="p-4">{student.name}</td>
                <td className="p-4">{student.class}</td>
                <td className="p-4">{student.section}</td>
                <td className="p-4">{student.register}</td>
                <td className="p-4">{student.roll}</td>
                <td className="p-4">{student.age}</td>
                <td className="p-4">{student.guardian}</td>
                <td className="p-4">
                  <div className="flex gap-2">
                    <button className="p-1 hover:bg-gray-100 rounded">
                      <QrCode className="w-4 h-4" />
                    </button>
                    <button className="p-1 hover:bg-gray-100 rounded">
                      <Eye className="w-4 h-4" />
                    </button>
                    <button className="p-1 hover:bg-gray-100 rounded">
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StudentList;
