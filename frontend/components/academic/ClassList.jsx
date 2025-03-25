"use client";

"use client";

import axios from "axios";
import { useState, useEffect } from "react";
import Link from "next/link";
import ViewClass from "./ViewClass";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import "jspdf-autotable";

const ClassList = ({ classListClicked, setClassListClicked }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [classes, setClasses] = useState([]);
  const [school, setSchool] = useState("");
  const [selectedClassId, setSelectedClassId] = useState(null);
  const [classDetails, setSelectedClassDetails] = useState([]);
  const [id, setId] = useState(null);
  const [exportFormat, setExportFormat] = useState("csv"); // Default format
  const router = useRouter();

  const getClassList = async () => {
    try {
      const response = await axios.get(
        `http://10.194.61.74:8080/academic/api/new/getAllClassBySchool`
      );
      setClasses(response.data);
    } catch (error) {
      console.error("Error during submission:", error);
      toast.error(`Network error: ${error.message}`);
    }
  };

  useEffect(() => {
    getClassList();
  }, [school]);

  useEffect(() => {
    const userData = localStorage.getItem("auth-store");
    if (userData) {
      try {
        const parsedData = JSON.parse(userData);
        setSchool(parsedData.user.schoolId);
      } catch (error) {
        console.error("Error parsing user data:", error);
      }
    }
  }, []);

  const handleExport = () => {
    if (exportFormat === "csv") {
      exportAsCSV();
    } else if (exportFormat === "pdf") {
      exportAsPDF();
    } else if (exportFormat === "excel") {
      exportAsExcel();
    }
  };

  // Function to export data as CSV with extra fields
  const exportAsCSV = () => {
    const csvHeader = "ID,Name,Academic Year,Streams,Sections,Subjects\n";
    const csvContent =
      csvHeader +
      classes
        .map((clas) => {
          const streamNames = clas.stream.map((s) => s.streamName).join("|");
          const sectionNames = clas.sections
            .map((s) => s.sectionName)
            .join("|");
          const subjectNames = clas.subjects
            .map((s) => s.subjectName)
            .join("|");

          return `${clas.classId},${clas.className},${clas.academicYear},${streamNames},${sectionNames},${subjectNames}`;
        })
        .join("\n");

    const encodedUri = "data:text/csv;charset=utf-8," + encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "class_list.csv");
    document.body.appendChild(link);
    link.click();
  };

  // Function to export data as PDF with extra fields
  const exportAsPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("Class List Report", 14, 15);
    doc.setFontSize(12);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 25);

    const headers = [
      ["ID", "Name", "Academic Year", "Streams", "Sections", "Subjects"],
    ];

    const data = classes.map((clas) => [
      clas.classId,
      clas.className,
      clas.academicYear,
      clas.stream.map((s) => s.streamName).join(", "),
      clas.sections.map((s) => s.sectionName).join(", "),
      clas.subjects.map((s) => s.subjectName).join(", "),
    ]);

    doc.autoTable({
      startY: 30,
      head: headers,
      body: data,
    });

    doc.save("class_list.pdf");
  };

  // Function to export data as Excel with extra fields
  const exportAsExcel = () => {
    const worksheet = XLSX.utils.aoa_to_sheet([
      ["Class List Report"],
      [`Generated on: ${new Date().toLocaleDateString()}`],
      [],
      ["ID", "Name", "Academic Year", "Streams", "Sections", "Subjects"],
      ...classes.map((clas) => [
        clas.classId,
        clas.className,
        clas.academicYear,
        clas.stream.map((s) => s.streamName).join(", "),
        clas.sections.map((s) => s.sectionName).join(", "),
        clas.subjects.map((s) => s.subjectName).join(", "),
      ]),
    ]);

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Classes");
    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    const file = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8",
    });
    saveAs(file, "class_list.xlsx");
  };

  return (
    <div className="relative top-20">
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2 text-gray-600">
            <Link href="/">Home</Link>
            <span>-</span>
            <Link href="/class">Class</Link>
            <span>-</span>
            <span>Class List</span>
          </div>
          <Link
            href={`/academic/class/add-class`}
            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
          >
            + Add Class
          </Link>
        </div>

        <div className="flex justify-between items-center">
          <div className="relative">
            <input
              type="text"
              placeholder="Search Class"
              className="pl-10 pr-4 py-2 border rounded-md w-[300px]"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <svg
              className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>

          {/* Export Functionality */}
          <div className="flex items-center gap-2">
            <select
              value={exportFormat}
              onChange={(e) => setExportFormat(e.target.value)}
              className="border px-2 py-1 rounded-md"
            >
              <option value="csv">CSV</option>
              <option value="pdf">PDF</option>
              <option value="excel">Excel</option>
            </select>

            <button
              onClick={handleExport}
              className="flex items-center gap-2 text-blue-500 hover:text-blue-600"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                />
              </svg>
              Export
            </button>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white">
          <thead>
            <tr className="border-b">
              <th className="text-left py-3 px-4">#</th>
              <th className="text-left py-3 px-4">Name</th>
              <th className="text-left py-3 px-4">Academic Year</th>
              <th className="text-left py-3 px-4">Stream</th>
              <th className="text-left py-3 px-4">Status</th>
              <th className="text-left py-3 px-4">Action</th>
            </tr>
          </thead>
          <tbody>
            {classes.map((clas) => (
              <tr
                key={clas.classId}
                className="border-b hover:bg-gray-50"
                onClick={() =>
                  router.push(`/academic/class/class-details/${clas.classId}`)
                }
              >
                <td className="py-3 px-4">{clas.classId}</td>
                <td className="py-3 px-4">{clas.className}</td>
                <td className="py-3 px-4">{clas.academicYear}</td>
                <td className="py-3 px-4">
                  {clas.stream.map((streams) => (
                    <ul key={streams.streamId}>{streams.streamName}</ul>
                  ))}
                </td>
                <td className="py-3 px-4">
                  <span className="px-2 py-1 rounded-full text-sm bg-green-100 text-green-600">
                    Active
                  </span>
                </td>
                <td className="py-3 px-4">Actions ▼</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ClassList;
