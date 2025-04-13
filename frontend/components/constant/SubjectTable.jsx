"use client";

import { useState } from "react";
import { LuView } from "react-icons/lu";
import { MdDeleteForever } from "react-icons/md";

const SubjectTable = ({ subjects }) => {
  console.log("Subjects on subject table", subjects);
  const [isDetails, setIsDetail] = useState(false);
  const [id, setId] = useState(null);

  const deleteSubject = async (Id) => {
    console.log("subject id to be deleted ", Id);
  };

  const detailSubject = (Id) => {
    console.log("id for detail is", Id);
    setId(Id);
    setIsDetail(true);
  };

  if (isDetails) {
    return (
      <div
        className={`
          p-6
          bg-[var(--surface)] text-[var(--text)]
          dark:bg-[var(--surface)] dark:text-[var(--text)]
          night:bg-[var(--surface)] night:text-[var(--text)]
        `}
      >
        Yes, this is the page for detailed subject with{" "}
        <span
          className={`
            hover:cursor-pointer hover:text-[var(--primary)]
            dark:hover:text-[var(--primary)]
            night:hover:text-[var(--primary)]
          `}
          onClick={() => setIsDetail(false)}
        >
          id {id}
        </span>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table
        className={`
          min-w-full
          bg-[var(--surface)] text-[var(--text)]
          dark:bg-[var(--surface)] dark:text-[var(--text)]
          night:bg-[var(--surface)] night:text-[var(--text)]
        `}
      >
        <thead>
          <tr
            className={`
              border-b border-[var(--secondary)]
              dark:border-[var(--secondary)]
              night:border-[var(--secondary)]
            `}
          >
            <th
              className={`
                text-left py-3 px-4
                text-[var(--text)]
                dark:text-[var(--text)]
                night:text-[var(--text)]
              `}
            >
              #
            </th>
            <th
              className={`
                text-left py-3 px-4
                text-[var(--text)]
                dark:text-[var(--text)]
                night:text-[var(--text)]
              `}
            >
              Subject Name
            </th>
            <th
              className={`
                text-left py-3 px-4
                text-[var(--text)]
                dark:text-[var(--text)]
                night:text-[var(--text)]
              `}
            >
              Subject Code
            </th>
            <th
              className={`
                text-left py-3 px-4
                text-[var(--text)]
                dark:text-[var(--text)]
                night:text-[var(--text)]
              `}
            >
              Credit Hour
            </th>
            <th
              className={`
                text-left py-3 px-4
                text-[var(--text)]
                dark:text-[var(--text)]
                night:text-[var(--text)]
              `}
            >
              Status
            </th>
            <th
              className={`
                text-left py-3 px-4
                text-[var(--text)]
                dark:text-[var(--text)]
                night:text-[var(--text)]
              `}
            >
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {subjects.map((subject, index) => (
            <tr
              key={subject.subjectId}
              className={`
                border-b border-[var(--secondary)]
                hover:bg-[var(--background)] hover:bg-opacity-50
                hover:cursor-pointer
                dark:border-[var(--secondary)] dark:hover:bg-[var(--background)] dark:hover:bg-opacity-50
                night:border-[var(--secondary)] night:hover:bg-[var(--background)] night:hover:bg-opacity-50
              `}
            >
              <td
                className={`
                  py-3 px-4
                  text-[var(--text)]
                  dark:text-[var(--text)]
                  night:text-[var(--text)]
                `}
              >
                {index + 1}
              </td>
              <td
                className={`
                  py-3 px-4
                  text-[var(--text)]
                  dark:text-[var(--text)]
                  night:text-[var(--text)]
                `}
              >
                {subject.subjectName}
              </td>
              <td
                className={`
                  py-3 px-4
                  text-[var(--text)]
                  dark:text-[var(--text)]
                  night:text-[var(--text)]
                `}
              >
                {subject.subjectCode}
              </td>
              <td
                className={`
                  py-3 px-4
                  text-[var(--text)]
                  dark:text-[var(--text)]
                  night:text-[var(--text)]
                `}
              >
                {subject.creditHours}
              </td>
              <td className="py-3 px-4">
                <span
                  className={`
                    px-2 py-1 rounded-full text-sm
                    bg-green-100 text-green-600
                    dark:bg-green-900 dark:text-green-300
                    night:bg-green-950 night:text-green-200
                  `}
                >
                  Active
                </span>
              </td>
              <td className="py-3 px-4 flex gap-5">
                <LuView
                  size={20}
                  className={`
                    hover:text-green-600
                    text-[var(--text)]
                    dark:text-[var(--text)] dark:hover:text-green-400
                    night:text-[var(--text)] night:hover:text-green-300
                  `}
                  onClick={() => detailSubject(subject.subjectId)}
                />
                <MdDeleteForever
                  size={20}
                  className={`
                    hover:text-red-600
                    text-[var(--text)]
                    dark:text-[var(--text)] dark:hover:text-red-400
                    night:text-[var(--text)] night:hover:text-red-300
                  `}
                  onClick={() => deleteSubject(subject.subjectId)}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default SubjectTable;
