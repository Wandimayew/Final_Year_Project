"use client";

import { useRef } from "react";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

const ExportStyled = ({ classes, onExportDone }) => {
  const contentRef = useRef();

  const exportStyledPDF = async () => {
    const content = contentRef.current;

    html2canvas(content, { scale: 2 }).then((canvas) => {
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      pdf.addImage(imgData, "PNG", 10, 10, 190, 0);
      pdf.save("styled-class-list.pdf");
    });

    // Pass the function as a reference, not calling it immediately
    setTimeout(onExportDone, 2000);
  };

  const exportStyledExcel = () => {
    const worksheet = XLSX.utils.aoa_to_sheet([
      [
        {
          v: "Styled Class List",
          s: { font: { bold: true, color: { rgb: "FF0000" } } },
        },
      ],
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
    XLSX.utils.book_append_sheet(workbook, worksheet, "Styled Classes");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
    const file = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8",
    });

    saveAs(file, "styled-class-list.xlsx");

    // Pass the function as a reference, not calling it immediately
    setTimeout(onExportDone, 2000);
  };

  return (
    <div>
      {/* Hidden content to capture styling for export */}
      <div ref={contentRef} className="p-4 bg-gray-100 border border-gray-300">
        <h1 className="text-xl font-bold text-blue-600">Class List</h1>
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-blue-500 text-white">
              <th className="p-2 border">ID</th>
              <th className="p-2 border">Name</th>
              <th className="p-2 border">Academic Year</th>
              <th className="p-2 border">Streams</th>
              <th className="p-2 border">Sections</th>
              <th className="p-2 border">Subjects</th>
            </tr>
          </thead>
          <tbody>
            {classes.map((clas, index) => (
              <tr key={index} className="border border-gray-300">
                <td className="p-2 border">{clas.classId}</td>
                <td className="p-2 border">{clas.className}</td>
                <td className="p-2 border">{clas.academicYear}</td>
                <td className="p-2 border">
                  {clas.stream.map((s) => s.streamName).join(", ")}
                </td>
                <td className="p-2 border">
                  {clas.sections.map((s) => s.sectionName).join(", ")}
                </td>
                <td className="p-2 border">
                  {clas.subjects.map((s) => s.subjectName).join(", ")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Export Buttons */}
      <div className="mt-4 flex gap-2">
        <button
          onClick={exportStyledPDF}
          className="p-2 bg-blue-500 text-white rounded"
        >
          Export as Styled PDF
        </button>
        <button
          onClick={exportStyledExcel}
          className="p-2 bg-green-500 text-white rounded"
        >
          Export as Styled Excel
        </button>

        <button
          onClick={onExportDone} // Call the function directly, not immediately
          className="p-2 bg-gray-400 text-white rounded"
        >
          Cancel Export
        </button>
      </div>
    </div>
  );
};

export default ExportStyled;
