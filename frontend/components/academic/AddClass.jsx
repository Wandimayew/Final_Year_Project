"use client";

import { useState, useEffect, useMemo } from "react";
import { useAuthStore } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useStreams } from "@/lib/api/academicService/stream";
import { useCreateClass } from "@/lib/api/academicService/class";

export const dynamic = "force-dynamic";

const AddClass = ({ setClassList, classListClicked }) => {
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
  const router = useRouter();
  const [formData, setFormData] = useState({
    className: "",
    academicYear: "",
    streamId: "",
  });
  const [errors, setErrors] = useState({});

  const schoolId = user.schoolId;

  const {
    data: streams = [],
    isLoading: streamsLoading,
    isError: streamsError,
    error: streamErrorDetails,
  } = useStreams(user.schoolId);

  console.log("user.schoolId:", user.schoolId);
  console.log("streams:", streams);
  console.log("streamsLoading:", streamsLoading);
  console.log("streamsError:", streamsError);
  console.log("streamErrorDetails:", streamErrorDetails);

  const createClass = useCreateClass();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.className.trim()) {
      newErrors.className = "Class Name is required";
    }
    if (!formData.academicYear.trim()) {
      newErrors.academicYear = "Academic Year is required";
    }
    if (!formData.streamId) {
      newErrors.streamId = "Stream is required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!user.schoolId) {
      toast.error("Cannot add class: School ID is missing");
      return;
    }
    if (!validateForm()) return;

    const payload = {
      className: formData.className.trim(),
      academicYear: formData.academicYear.trim(),
      streamId: Number(formData.streamId),
    };

    createClass.mutate(
      { schoolId, classRequest: payload },
      {
        onSuccess: () => {
          setFormData({ className: "", academicYear: "", streamId: "" });
          toast.success("Class added successfully!", {
            position: "top-right",
            autoClose: 3000,
          });
          setTimeout(() => setClassList(true), 2000);
        },
        onError: (error) => {
          toast.error(`Failed to add class: ${error.message}`, {
            position: "top-right",
            autoClose: 3000,
          });
        },
      }
    );
  };

  useEffect(() => {
    if (streamsError) {
      toast.error(`Failed to load streams: ${streamErrorDetails.message}`, {
        position: "top-right",
        autoClose: 5000,
      });
    }
  }, [streamsError, streamErrorDetails]);

  if (!user.schoolId || streamsLoading) {
    return (
      <div
        className={`
          max-w-2xl mx-auto p-6 rounded-lg shadow-md relative top-20
          bg-[var(--surface)]
          dark:bg-[var(--surface)] night:bg-[var(--surface)]
        `}
      >
        <div className="flex justify-center">
          <div
            className={`
              animate-spin h-10 w-10 border-4 rounded-full border-t-transparent
              border-[var(--primary)]
              dark:border-[var(--primary)]
              night:border-[var(--primary)]
            `}
          ></div>
        </div>
      </div>
    );
  }

  if (streamsError) {
    return (
      <div
        className={`
          max-w-2xl mx-auto p-6 rounded-lg shadow-md relative top-20
          bg-[var(--surface)]
          dark:bg-[var(--surface)] night:bg-[var(--surface)]
        `}
      >
        <p
          className={`
            text-red-500
            dark:text-red-400
            night:text-red-300
          `}
        >
          Failed to load streams. Please try again later.
        </p>
      </div>
    );
  }

  return (
    <div
      className={`
        max-w-2xl mx-auto p-6 rounded-lg shadow-md relative top-20
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
        Add Class
      </h2>

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label
            className={`
              block font-medium mb-2
              text-[var(--text)]
              dark:text-[var(--text)]
              night:text-[var(--text)]
            `}
            htmlFor="className"
          >
            Class Name
          </label>
          <input
            type="text"
            id="className"
            name="className"
            value={formData.className}
            onChange={handleChange}
            className={`
              w-full px-3 py-2 border rounded-md focus:outline-none
              border-[var(--secondary)] bg-[var(--background)] text-[var(--text)]
              focus:ring focus:ring-[var(--primary)]
              ${errors.className ? "border-red-500" : ""}
              dark:border-[var(--secondary)] dark:bg-[var(--background)] dark:text-[var(--text)]
              night:border-[var(--secondary)] night:bg-[var(--background)] night:text-[var(--text)]
            `}
            placeholder="e.g., Grade 10"
            disabled={createClass.isPending}
          />
          {errors.className && (
            <p
              className={`
                text-red-500 text-sm mt-1
                dark:text-red-400
                night:text-red-300
              `}
            >
              {errors.className}
            </p>
          )}
        </div>

        <div className="mb-4">
          <label
            className={`
              block font-medium mb-2
              text-[var(--text)]
              dark:text-[var(--text)]
              night:text-[var(--text)]
            `}
            htmlFor="academicYear"
          >
            Academic Year
          </label>
          <input
            type="text"
            id="academicYear"
            name="academicYear"
            value={formData.academicYear}
            onChange={handleChange}
            className={`
              w-full px-3 py-2 border rounded-md focus:outline-none
              border-[var(--secondary)] bg-[var(--background)] text-[var(--text)]
              focus:ring focus:ring-[var(--primary)]
              ${errors.academicYear ? "border-red-500" : ""}
              dark:border-[var(--secondary)] dark:bg-[var(--background)] dark:text-[var(--text)]
              night:border-[var(--secondary)] night:bg-[var(--background)] night:text-[var(--text)]
            `}
            placeholder="e.g., 2024-2025"
            disabled={createClass.isPending}
          />
          {errors.academicYear && (
            <p
              className={`
                text-red-500 text-sm mt-1
                dark:text-red-400
                night:text-red-300
              `}
            >
              {errors.academicYear}
            </p>
          )}
        </div>

        <div className="mb-4">
          <label
            className={`
              block font-medium mb-2
              text-[var(--text)]
              dark:text-[var(--text)]
              night:text-[var(--text)]
            `}
            htmlFor="streamId"
          >
            Stream
          </label>
          <select
            id="streamId"
            name="streamId"
            value={formData.streamId}
            onChange={handleChange}
            className={`
              w-full px-3 py-2 border rounded-md focus:outline-none
              border-[var(--secondary)] bg-[var(--background)] text-[var(--text)]
              focus:ring focus:ring-[var(--primary)]
              ${errors.streamId ? "border-red-500" : ""}
              dark:border-[var(--secondary)] dark:bg-[var(--background)] dark:text-[var(--text)]
              night:border-[var(--secondary)] night:bg-[var(--background)] night:text-[var(--text)]
            `}
            disabled={createClass.isPending || streams.length === 0}
          >
            <option value="">Select a Stream</option>
            {streams.map((stream) => (
              <option key={stream.streamId} value={stream.streamId}>
                {stream.streamName}
              </option>
            ))}
          </select>
          {errors.streamId && (
            <p
              className={`
                text-red-500 text-sm mt-1
                dark:text-red-400
                night:text-red-300
              `}
            >
              {errors.streamId}
            </p>
          )}
          {streams.length === 0 && !streamsLoading && (
            <p
              className={`
                text-yellow-500 text-sm mt-1
                dark:text-yellow-400
                night:text-yellow-300
              `}
            >
              No streams available
            </p>
          )}
        </div>

        <div className="flex w-full justify-between">
          <button
            onClick={() => setClassList(true)}
            type="button"
            className={`
              py-2 px-4 rounded-md hover:bg-opacity-80
              bg-[var(--secondary)] text-[var(--text)]
              focus:outline-none focus:ring focus:ring-[var(--secondary)]
              dark:bg-[var(--secondary)] dark:text-[var(--text)]
              night:bg-[var(--secondary)] night:text-[var(--text)]
            `}
            disabled={createClass.isPending}
          >
            Cancel
          </button>
          <button
            type="submit"
            className={`
              py-2 px-4 rounded-md hover:bg-opacity-80
              bg-[var(--primary)] text-white
              focus:outline-none focus:ring focus:ring-[var(--primary)]
              ${createClass.isPending ? "opacity-50 cursor-not-allowed" : ""}
              dark:bg-[var(--primary)] dark:text-white
              night:bg-[var(--primary)] night:text-white
            `}
            disabled={createClass.isPending}
          >
            {createClass.isPending ? "Adding..." : "Add Class"}
          </button>
        </div>
      </form>

      <ToastContainer />
    </div>
  );
};

export default AddClass;
