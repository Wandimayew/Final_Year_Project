"use client";

import { useState, useMemo } from "react";
import { useAuthStore } from "@/lib/auth";
import { toast } from "react-toastify";
import { useStreams } from "@/lib/api/academicService/stream";
import {
  useClassesByStream,
  useAssignSubjectsToClass,
} from "@/lib/api/academicService/class";
import { useSubjectsBySchool } from "@/lib/api/academicService/subject";

const AssignSubjects = ({ setSubjectListClicked, setAssign }) => {
  const [selectedStream, setSelectedStream] = useState("");
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSubjects, setSelectedSubjects] = useState([]);

  const authState = useMemo(
    () =>
      useAuthStore.getState()
        ? {
            user: useAuthStore.getState().user,
            isAuthenticated: useAuthStore.getState().isAuthenticated(),
          }
        : { user: null, isAuthenticated: false },
    []
  );
  const { user } = authState;

  const schoolId = user.schoolId;

  const { data: streams = [], isLoading: streamsLoading } =
    useStreams(schoolId);
  const { data: classes = [], isLoading: classesLoading } = useClassesByStream(
    schoolId,
    selectedStream
  );
  const { data: subjects = [], isLoading: subjectsLoading } =
    useSubjectsBySchool(schoolId);
  const assignSubjectsMutation = useAssignSubjectsToClass();

  const handleSubjectSelection = (subjectId) => {
    setSelectedSubjects((prevSelected) =>
      prevSelected.includes(subjectId)
        ? prevSelected.filter((id) => id !== subjectId)
        : [...prevSelected, subjectId]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await assignSubjectsMutation.mutateAsync({
        schoolId,
        classId: selectedClass,
        subjectIds: selectedSubjects,
      });
      toast.success("Subjects assigned successfully!");
      setSelectedSubjects([]);
      setSelectedClass("");
      setSelectedStream("");
    } catch (error) {
      console.error("Error assigning subjects:", error);
      toast.error("Failed to assign subjects.");
    }
  };

  return (
    <div
      className={`
        max-w-2xl mx-auto p-6 rounded-lg shadow-md mt-10
        bg-[var(--surface)]
        dark:bg-[var(--surface)] night:bg-[var(--surface)]
      `}
    >
      <h2
        className={`
          text-2xl font-bold mb-4
          text-[var(--text)]
          dark:text-[var(--text)]
          night:text-[var(--text)]
        `}
      >
        Assign Subjects to Class
      </h2>
      {assignSubjectsMutation.isError && (
        <p
          className={`
            mb-4
            text-red-500
            dark:text-red-400
            night:text-red-300
          `}
        >
          {assignSubjectsMutation.error.message}
        </p>
      )}
      {assignSubjectsMutation.isSuccess && (
        <p
          className={`
            mb-4
            text-green-500
            dark:text-green-400
            night:text-green-300
          `}
        >
          Subjects assigned successfully!
        </p>
      )}
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label
            htmlFor="stream"
            className={`
              block font-medium mb-2
              text-[var(--text)]
              dark:text-[var(--text)]
              night:text-[var(--text)]
            `}
          >
            Select Stream
          </label>
          <select
            id="stream"
            value={selectedStream}
            onChange={(e) => setSelectedStream(e.target.value)}
            className={`
              w-full px-3 py-2 border rounded-md focus:outline-none
              border-[var(--secondary)] bg-[var(--background)] text-[var(--text)]
              focus:ring focus:ring-[var(--primary)]
              dark:border-[var(--secondary)] dark:bg-[var(--background)] dark:text-[var(--text)]
              night:border-[var(--secondary)] night:bg-[var(--background)] night:text-[var(--text)]
            `}
            required
            disabled={streamsLoading}
          >
            <option value="">-- Select a Stream --</option>
            {streams.length > 0 ? (
              streams.map((stream) => (
                <option key={stream.streamId} value={stream.streamId}>
                  {stream.streamName}
                </option>
              ))
            ) : (
              <option disabled>No streams available</option>
            )}
          </select>
        </div>

        {classes.length > 0 && (
          <div className="mb-4">
            <label
              htmlFor="class"
              className={`
                block font-medium mb-2
                text-[var(--text)]
                dark:text-[var(--text)]
                night:text-[var(--text)]
              `}
            >
              Select Class
            </label>
            <select
              id="class"
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className={`
                w-full px-3 py-2 border rounded-md focus:outline-none
                border-[var(--secondary)] bg-[var(--background)] text-[var(--text)]
                focus:ring focus:ring-[var(--primary)]
                dark:border-[var(--secondary)] dark:bg-[var(--background)] dark:text-[var(--text)]
                night:border-[var(--secondary)] night:bg-[var(--background)] night:text-[var(--text)]
              `}
              required
              disabled={classesLoading}
            >
              <option value="">-- Select a Class --</option>
              {classes.map((classItem) => (
                <option key={classItem.classId} value={classItem.classId}>
                  {classItem.className}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="mb-4">
          <h3
            className={`
              font-medium mb-2
              text-[var(--text)]
              dark:text-[var(--text)]
              night:text-[var(--text)]
            `}
          >
            Available Subjects
          </h3>
          {subjectsLoading ? (
            <p
              className={`
                text-[var(--text)]
                dark:text-[var(--text)]
                night:text-[var(--text)]
              `}
            >
              Loading subjects...
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {subjects.map((subject) => (
                <div key={subject.subjectId} className="flex items-center">
                  <input
                    type="checkbox"
                    id={`subject-${subject.subjectId}`}
                    value={subject.subjectId}
                    checked={selectedSubjects.includes(subject.subjectId)}
                    onChange={() => handleSubjectSelection(subject.subjectId)}
                    className="mr-2"
                  />
                  <label
                    htmlFor={`subject-${subject.subjectId}`}
                    className={`
                      text-[var(--text)]
                      dark:text-[var(--text)]
                      night:text-[var(--text)]
                    `}
                  >
                    {subject.subjectName}
                  </label>
                </div>
              ))}
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={assignSubjectsMutation.isPending}
          className={`
            py-2 px-4 rounded-md hover:bg-opacity-80
            bg-[var(--primary)] text-white
            disabled:opacity-50
            dark:bg-[var(--primary)] dark:text-white
            night:bg-[var(--primary)] night:text-white
          `}
        >
          {assignSubjectsMutation.isPending
            ? "Assigning..."
            : "Assign Subjects"}
        </button>
      </form>
    </div>
  );
};

export default AssignSubjects;
