"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useClassesBySchool } from "@/lib/api/academicService/class";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import "jspdf-autotable";

export const dynamic = "force-dynamic";

const ClassList = ({ classListClicked, setClassListClicked }) => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [schoolId, setSchoolId] = useState("");
  const [exportFormat, setExportFormat] = useState("csv");

  useEffect(() => {
    const userData = localStorage.getItem("auth-store");
    if (userData) {
      try {
        const parsedData = JSON.parse(userData);
        setSchoolId(parsedData.user?.schoolId || "");
      } catch (error) {
        console.error("Error parsing user data:", error);
      }
    }
  }, []);

  const {
    data: classes = [],
    isLoading,
    error: fetchError,
  } = useClassesBySchool(schoolId);

  useEffect(() => {
    if (fetchError) {
      toast.error(`Failed to load classes: ${fetchError.message}`, {
        position: "top-right",
        autoClose: 5000,
      });
    }
  }, [fetchError]);

  const handleExport = () => {
    if (exportFormat === "csv") {
      exportAsCSV();
    } else if (exportFormat === "pdf") {
      exportAsPDF();
    } else if (exportFormat === "excel") {
      exportAsExcel();
    }
  };

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
    document.body.removeChild(link);
  };

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

  const filteredClasses = classes.filter((clas) =>
    clas.className.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div
      className={`
        relative top-20
        bg-[var(--background)] text-[var(--text)]
        dark:bg-[var(--background)] dark:text-[var(--text)]
        night:bg-[var(--background)] night:text-[var(--text)]
      `}
    >
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <div
            className={`
              flex items-center gap-2
              text-[var(--secondary)]
              dark:text-[var(--secondary)]
              night:text-[var(--secondary)]
            `}
          >
            <Link href="/">Home</Link>
            <span>-</span>
            <Link href="/class">Class</Link>
            <span>-</span>
            <span>Class List</span>
          </div>
          <Link
            href={`/academic/class/add-class`}
            className={`
              bg-[var(--primary)] text-white px-4 py-2 rounded-md hover:bg-opacity-80
              dark:bg-[var(--primary)] dark:text-white
              night:bg-[var(--primary)] night:text-white
            `}
          >
            + Add Class
          </Link>
        </div>

        <div className="flex justify-between items-center">
          <div className="relative">
            <input
              type="text"
              placeholder="Search Class"
              className={`
                pl-10 pr-4 py-2 border rounded-md w-[300px]
                border-[var(--secondary)] bg-[var(--background)] text-[var(--text)]
                dark:border-[var(--secondary)] dark:bg-[var(--background)] dark:text-[var(--text)]
                night:border-[var(--secondary)] night:bg-[var(--background)] night:text-[var(--text)]
              `}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <svg
              className={`
                absolute left-3 top-2.5 h-5 w-5
                text-[var(--secondary)]
                dark:text-[var(--secondary)]
                night:text-[var(--secondary)]
              `}
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

          <div className="flex items-center gap-2">
            <select
              value={exportFormat}
              onChange={(e) => setExportFormat(e.target.value)}
              className={`
                border px-2 py-1 rounded-md
                border-[var(--secondary)] bg-[var(--background)] text-[var(--text)]
                dark:border-[var(--secondary)] dark:bg-[var(--background)] dark:text-[var(--text)]
                night:border-[var(--secondary)] night:bg-[var(--background)] night:text-[var(--text)]
              `}
            >
              <option value="csv">CSV</option>
              <option value="pdf">PDF</option>
              <option value="excel">Excel</option>
            </select>

            <button
              onClick={handleExport}
              className={`
                flex items-center gap-2
                text-[var(--primary)] hover:text-opacity-80
                disabled:opacity-50
                dark:text-[var(--primary)]
                night:text-[var(--primary)]
              `}
              disabled={isLoading || classes.length === 0}
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
        {isLoading ? (
          <div
            className={`
              text-center py-4
              text-[var(--secondary)]
              dark:text-[var(--secondary)]
              night:text-[var(--secondary)]
            `}
          >
            Loading classes...
          </div>
        ) : filteredClasses.length === 0 ? (
          <div
            className={`
              text-center py-4
              text-[var(--secondary)]
              dark:text-[var(--secondary)]
              night:text-[var(--secondary)]
            `}
          >
            No classes found.
          </div>
        ) : (
          <table
            className={`
              min-w-full
              bg-[var(--surface)]
              dark:bg-[var(--surface)]
              night:bg-[var(--surface)]
            `}
          >
            <thead>
              <tr
                className={`
                  border-b
                  border-[var(--secondary)]
                  dark:border-[var(--secondary)]
                  night:border-[var(--secondary)]
                `}
              >
                <th className="text-left py-3 px-4">#</th>
                <th className="text-left py-3 px-4">Name</th>
                <th className="text-left py-3 px-4">Academic Year</th>
                <th className="text-left py-3 px-4">Stream</th>
                <th className="text-left py-3 px-4">Status</th>
                <th className="text-left py-3 px-4">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredClasses.map((clas) => (
                <tr
                  key={clas.classId}
                  className={`
                    border-b hover:bg-[var(--background)] cursor-pointer
                    border-[var(--secondary)]
                    dark:border-[var(--secondary)] dark:hover:bg-[var(--background)]
                    night:border-[var(--secondary)] night:hover:bg-[var(--background)]
                  `}
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
                    <span
                      className={`
                        px-2 py-1 rounded-full text-sm
                        bg-green-100 text-green-600
                        dark:bg-opacity-20 dark:text-green-400
                        night:bg-opacity-20 night:text-green-300
                      `}
                    >
                      Active
                    </span>
                  </td>
                  <td className="py-3 px-4">Actions ▼</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <ToastContainer />
    </div>
  );
};

export default ClassList;
