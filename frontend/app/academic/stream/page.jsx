"use client";

import React, { useState, useMemo } from "react";
import { useAuthStore } from "@/lib/auth";
import { FaPlus } from "react-icons/fa";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import StreamList from "@/components/academic/StreamList";
import { useStreams, useCreateStream } from "@/lib/api/academicService/stream";

const StreamPage = () => {
  const [formData, setFormData] = useState({
    streamName: "",
    streamCode: "",
  });
  const [errors, setErrors] = useState({});
  const [showForm, setShowForm] = useState(false);

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

  const {
    data: streams = [],
    isLoading,
    error: fetchError,
  } = useStreams(schoolId);

  const createStream = useCreateStream();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.streamName.trim()) {
      newErrors.streamName = "Stream Name is required";
    }
    if (!formData.streamCode.trim()) {
      newErrors.streamCode = "Stream Code is required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const payload = {
      streamName: formData.streamName.trim(),
      streamCode: formData.streamCode.trim(),
    };

    createStream.mutate(
      { schoolId, streamRequest: payload },
      {
        onSuccess: () => {
          setFormData({ streamName: "", streamCode: "" });
          toast.success("Stream added successfully!", {
            position: "top-right",
            autoClose: 3000,
          });
          setShowForm(false);
        },
        onError: (error) => {
          toast.error("Failed to add stream. Please try again.", {
            position: "top-right",
            autoClose: 3000,
          });
        },
      }
    );
  };

  React.useEffect(() => {
    if (fetchError) {
      toast.error(`Failed to load streams: ${fetchError.message}`, {
        position: "top-right",
        autoClose: 5000,
      });
    }
  }, [fetchError]);

  return (
    <div
      className={`
        min-h-screen p-6
        bg-[var(--background)] text-[var(--text)]
        dark:bg-[var(--background)] dark:text-[var(--text)]
        night:bg-[var(--background)] night:text-[var(--text)]
      `}
    >
      <header className="mb-8">
        <h1
          className={`
            text-3xl font-bold
            text-[var(--text)]
            dark:text-[var(--text)]
            night:text-[var(--text)]
          `}
        >
          Manage Streams
        </h1>
        <p
          className={`
            mt-2
            text-[var(--secondary)]
            dark:text-[var(--secondary)]
            night:text-[var(--secondary)]
          `}
        >
          Add and organize streams for your academic setup with ease.
        </p>
      </header>

      <div className="max-w-4xl mx-auto">
        <div className="mb-6 flex justify-end">
          <Button
            onClick={() => setShowForm(!showForm)}
            className={`
              flex items-center py-2 px-4 rounded-md hover:bg-opacity-80 transition-all duration-200
              bg-[var(--primary)] text-white
              disabled:opacity-50
              dark:bg-[var(--primary)] dark:text-white
              night:bg-[var(--primary)] night:text-white
            `}
            disabled={isLoading}
          >
            <FaPlus className="mr-2" />
            {showForm ? "Cancel" : "Add Stream"}
          </Button>
        </div>

        {showForm && (
          <div
            className={`
              shadow-lg rounded-lg p-6 mb-8 transition-all duration-300 hover:shadow-xl
              bg-[var(--surface)]
              dark:bg-[var(--surface)]
              night:bg-[var(--surface)]
            `}
          >
            <h2
              className={`
                text-xl font-semibold mb-4
                text-[var(--text)]
                dark:text-[var(--text)]
                night:text-[var(--text)]
              `}
            >
              Add New Stream
            </h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label
                  htmlFor="streamName"
                  className={`
                    block text-sm font-medium mb-1
                    text-[var(--text)]
                    dark:text-[var(--text)]
                    night:text-[var(--text)]
                  `}
                >
                  Stream Name
                </label>
                <input
                  type="text"
                  id="streamName"
                  name="streamName"
                  value={formData.streamName}
                  onChange={handleChange}
                  placeholder="e.g., Science"
                  className={`
                    w-full p-3 border rounded-md
                    border-[var(--secondary)] bg-[var(--background)] text-[var(--text)]
                    focus:ring-2 focus:ring-[var(--primary)] focus:outline-none
                    transition-all duration-200
                    ${errors.streamName ? "border-red-500" : ""}
                    dark:border-[var(--secondary)] dark:bg-[var(--background)] dark:text-[var(--text)]
                    night:border-[var(--secondary)] night:bg-[var(--background)] night:text-[var(--text)]
                  `}
                  disabled={createStream.isPending}
                />
                {errors.streamName && (
                  <p
                    className={`
                      text-red-500 text-sm mt-1
                      dark:text-red-400
                      night:text-red-300
                    `}
                  >
                    {errors.streamName}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="streamCode"
                  className={`
                    block text-sm font-medium mb-1
                    text-[var(--text)]
                    dark:text-[var(--text)]
                    night:text-[var(--text)]
                  `}
                >
                  Stream Code
                </label>
                <input
                  type="text"
                  id="streamCode"
                  name="streamCode"
                  value={formData.streamCode}
                  onChange={handleChange}
                  placeholder="e.g., SCI"
                  className={`
                    w-full p-3 border rounded-md
                    border-[var(--secondary)] bg-[var(--background)] text-[var(--text)]
                    focus:ring-2 focus:ring-[var(--primary)] focus:outline-none
                    transition-all duration-200
                    ${errors.streamCode ? "border-red-500" : ""}
                    dark:border-[var(--secondary)] dark:bg-[var(--background)] dark:text-[var(--text)]
                    night:border-[var(--secondary)] night:bg-[var(--background)] night:text-[var(--text)]
                  `}
                  disabled={createStream.isPending}
                />
                {errors.streamCode && (
                  <p
                    className={`
                      text-red-500 text-sm mt-1
                      dark:text-red-400
                      night:text-red-300
                    `}
                  >
                    {errors.streamCode}
                  </p>
                )}
              </div>

              <div className="flex justify-end space-x-4">
                <Button
                  type="submit"
                  disabled={createStream.isPending}
                  className={`
                    flex items-center py-2 px-4 rounded-md hover:bg-opacity-80
                    transition-all duration-200
                    bg-[var(--primary)] text-white
                    ${
                      createStream.isPending
                        ? "opacity-50 cursor-not-allowed"
                        : ""
                    }
                    dark:bg-[var(--primary)] dark:text-white
                    night:bg-[var(--primary)] night:text-white
                  `}
                >
                  <FaPlus className="mr-2" />
                  {createStream.isPending ? "Adding..." : "Add Stream"}
                </Button>
              </div>
            </form>
          </div>
        )}

        {isLoading ? (
          <div
            className={`
              text-center py-4
              text-[var(--secondary)]
              dark:text-[var(--secondary)]
              night:text-[var(--secondary)]
            `}
          >
            Loading streams...
          </div>
        ) : (
          <StreamList streams={streams} />
        )}

        <ToastContainer />
      </div>
    </div>
  );
};

const Button = ({ children, className, ...props }) => (
  <button className={`font-medium ${className}`} {...props}>
    {children}
  </button>
);

export default StreamPage;
