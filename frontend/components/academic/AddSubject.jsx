"use client";

import { useState, useEffect, useMemo } from "react";
import { useAuthStore } from "@/lib/auth";
import { toast } from "react-toastify";
import { useCreateSubject } from "@/lib/api/academicService/subject";

const AddSubject = ({ setSubjectListClicked, setAssign }) => {
  const [formData, setFormData] = useState({
    subjectName: "",
    creditHours: 0,
    subjectCode: "",
  });
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

  const createSubjectMutation = useCreateSubject();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createSubjectMutation.mutateAsync({
        schoolId,
        subjectRequest: formData,
      });
      toast.success("Subject added successfully!");
      setFormData({
        subjectName: "",
        creditHours: 0,
        subjectCode: "",
      });
      setTimeout(() => {
        setSubjectListClicked(true);
        setAssign(false);
      }, 3000);
    } catch (error) {
      console.error("Error adding subject:", error);
      toast.error("Failed to add subject.");
    }
  };

  return (
    <div
      className={`
        max-w-2xl mx-auto p-6 rounded-lg shadow-md relative top-20
        bg-[var(--surface)]
        dark:bg-[var(--surface)]
        night:bg-[var(--surface)]
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
        Add Subject
      </h2>
      {createSubjectMutation.isError && (
        <p
          className={`
            mb-4
            text-red-500
            dark:text-red-400
            night:text-red-300
          `}
        >
          {createSubjectMutation.error.message}
        </p>
      )}
      {createSubjectMutation.isSuccess && (
        <p
          className={`
            mb-4
            text-green-500
            dark:text-green-400
            night:text-green-300
          `}
        >
          Subject added successfully!
        </p>
      )}
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label
            className={`
              block font-medium mb-2
              text-[var(--text)]
              dark:text-[var(--text)]
              night:text-[var(--text)]
            `}
            htmlFor="subjectName"
          >
            Subject Name
          </label>
          <input
            type="text"
            id="subjectName"
            name="subjectName"
            value={formData.subjectName}
            onChange={handleChange}
            className={`
              w-full px-3 py-2 border rounded-md
              border-[var(--secondary)] bg-[var(--background)] text-[var(--text)]
              focus:outline-none focus:ring focus:ring-[var(--primary)]
              dark:border-[var(--secondary)] dark:bg-[var(--background)] dark:text-[var(--text)]
              night:border-[var(--secondary)] night:bg-[var(--background)] night:text-[var(--text)]
            `}
            required
          />
        </div>
        <div className="mb-4">
          <label
            className={`
              block font-medium mb-2
              text-[var(--text)]
              dark:text-[var(--text)]
              night:text-[var(--text)]
            `}
            htmlFor="creditHours"
          >
            Credit Hours
          </label>
          <input
            type="number"
            id="creditHours"
            name="creditHours"
            value={formData.creditHours}
            onChange={handleChange}
            className={`
              w-full px-3 py-2 border rounded-md
              border-[var(--secondary)] bg-[var(--background)] text-[var(--text)]
              focus:outline-none focus:ring focus:ring-[var(--primary)]
              dark:border-[var(--secondary)] dark:bg-[var(--background)] dark:text-[var(--text)]
              night:border-[var(--secondary)] night:bg-[var(--background)] night:text-[var(--text)]
            `}
            required
          />
        </div>
        <div className="mb-4">
          <label
            className={`
              block font-medium mb-2
              text-[var(--text)]
              dark:text-[var(--text)]
              night:text-[var(--text)]
            `}
            htmlFor="subjectCode"
          >
            Subject Code
          </label>
          <input
            type="text"
            id="subjectCode"
            name="subjectCode"
            value={formData.subjectCode}
            onChange={handleChange}
            className={`
              w-full px-3 py-2 border rounded-md
              border-[var(--secondary)] bg-[var(--background)] text-[var(--text)]
              focus:outline-none focus:ring focus:ring-[var(--primary)]
              dark:border-[var(--secondary)] dark:bg-[var(--background)] dark:text-[var(--text)]
              night:border-[var(--secondary)] night:bg-[var(--background)] night:text-[var(--text)]
            `}
            required
          />
        </div>
        <div className="flex w-full justify-between">
          <button
            type="button"
            onClick={() => {
              setSubjectListClicked(true);
              setAssign(false);
            }}
            className={`
              py-2 px-4 rounded-md hover:bg-opacity-80
              bg-[var(--secondary)] text-[var(--text)]
              focus:outline-none focus:ring focus:ring-[var(--secondary)]
              dark:bg-[var(--secondary)] dark:text-[var(--text)]
              night:bg-[var(--secondary)] night:text-[var(--text)]
            `}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={createSubjectMutation.isPending}
            className={`
              py-2 px-4 rounded-md hover:bg-opacity-80
              bg-[var(--primary)] text-white
              focus:outline-none focus:ring focus:ring-[var(--primary)]
              disabled:opacity-50
              dark:bg-[var(--primary)] dark:text-white
              night:bg-[var(--primary)] night:text-white
            `}
          >
            {createSubjectMutation.isPending ? "Adding..." : "Add Subject"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddSubject;
