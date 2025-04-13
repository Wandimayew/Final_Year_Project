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

    setTimeout(onExportDone, 2000);
  };

  return (
    <div>
      <div
        ref={contentRef}
        className={`
          p-4 border
          bg-[var(--background)] border-[var(--secondary)]
          dark:bg-[var(--background)] dark:border-[var(--secondary)]
          night:bg-[var(--background)] night:border-[var(--secondary)]
        `}
      >
        <h1
          className={`
            text-xl font-bold
            text-[var(--primary)]
            dark:text-[var(--primary)]
            night:text-[var(--primary)]
          `}
        >
          Class List
        </h1>
        <table
          className={`
            w-full border-collapse
            border-[var(--secondary)]
            dark:border-[var(--secondary)]
            night:border-[var(--secondary)]
          `}
        >
          <thead>
            <tr
              className={`
                bg-[var(--primary)] text-white
                dark:bg-[var(--primary)] dark:text-white
                night:bg-[var(--primary)] night:text-white
              `}
            >
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
              <tr
                key={index}
                className={`
                  border
                  border-[var(--secondary)]
                  dark:border-[var(--secondary)]
                  night:border-[var(--secondary)]
                `}
              >
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

      <div className="mt-4 flex gap-2">
        <button
          onClick={exportStyledPDF}
          className={`
            p-2 rounded
            bg-[var(--primary)] text-white
            hover:bg-opacity-80
            dark:bg-[var(--primary)] dark:text-white
            night:bg-[var(--primary)] night:text-white
          `}
        >
          Export as Styled PDF
        </button>
        <button
          onClick={exportStyledExcel}
          className={`
            p-2 rounded
            bg-green-500 text-white
            hover:bg-opacity-80
            dark:bg-green-500 dark:text-white
            night:bg-green-500 night:text-white
          `}
        >
          Export as Styled Excel
        </button>

        <button
          onClick={onExportDone}
          className={`
            p-2 rounded
            bg-[var(--secondary)] text-[var(--text)]
            hover:bg-opacity-80
            dark:bg-[var(--secondary)] dark:text-[var(--text)]
            night:bg-[var(--secondary)] night:text-[var(--text)]
          `}
        >
          Cancel Export
        </button>
      </div>
    </div>
  );
};

export default ExportStyled;
