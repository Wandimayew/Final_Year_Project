"use client";

import { useState, useMemo } from "react";
import { useAuthStore } from "@/lib/auth";
import { toast } from "react-toastify";
import {
  useUpdateSection,
  useDeleteSection,
} from "@/lib/api/academicService/section";

const EditSection = ({ section, classId, onClose, type }) => {
  const [sectionName, setSectionName] = useState(section?.sectionName || "");
  const [capacity, setCapacity] = useState(section?.capacity || 0);

  const updateSectionMutation = useUpdateSection();
  const deleteSectionMutation = useDeleteSection();

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

  const schoolId = user?.schoolId;

  const handleSave = async (e) => {
    e.preventDefault();
    if (!schoolId) {
      toast.error("School ID is missing");
      return;
    }
    try {
      await updateSectionMutation.mutateAsync({
        schoolId,
        sectionId: section.sectionId,
        sectionRequest: {
          sectionName,
          capacity: parseInt(capacity, 10),
          classId,
        },
      });
      toast.success("Section updated successfully!");
      onClose();
    } catch (error) {
      console.error("Error editing section:", error);
      toast.error("Failed to update section.");
    }
  };

  const handleDelete = async () => {
    if (!schoolId) {
      toast.error("School ID is missing");
      return;
    }
    try {
      await deleteSectionMutation.mutateAsync({
        schoolId,
        sectionId: section.sectionId,
        classId,
      });
      toast.success("Section deleted successfully!");
      onClose();
    } catch (error) {
      console.error("Error deleting section:", error);
      toast.error("Failed to delete section.");
    }
  };

  return (
    <div
      className={`
        fixed inset-0 flex items-center justify-center
        bg-black bg-opacity-50
        dark:bg-opacity-70
        night:bg-opacity-80
      `}
    >
      <div
        className={`
          rounded-lg shadow-lg p-6 max-w-md w-full
          bg-[var(--surface)]
          dark:bg-[var(--surface)]
          night:bg-[var(--surface)]
        `}
      >
        <h2
          className={`
            text-xl font-bold mb-4
            text-[var(--text)]
            dark:text-[var(--text)]
            night:text-[var(--text)]
          `}
        >
          {type === "edit" ? "Edit Section" : "Delete Section"}
        </h2>

        {type === "edit" && (
          <form onSubmit={handleSave}>
            <div className="mb-4">
              <label
                className={`
                  block text-sm font-medium
                  text-[var(--text)]
                  dark:text-[var(--text)]
                  night:text-[var(--text)]
                `}
              >
                Section Name
              </label>
              <input
                type="text"
                className={`
                  mt-1 block w-full p-2 border rounded-md
                  border-[var(--secondary)] bg-[var(--background)] text-[var(--text)]
                  focus:ring-[var(--primary)] focus:border-[var(--primary)]
                  dark:border-[var(--secondary)] dark:bg-[var(--background)] dark:text-[var(--text)]
                  night:border-[var(--secondary)] night:bg-[var(--background)] night:text-[var(--text)]
                `}
                value={sectionName}
                onChange={(e) => setSectionName(e.target.value)}
                required
              />
            </div>
            <div className="mb-4">
              <label
                className={`
                  block text-sm font-medium
                  text-[var(--text)]
                  dark:text-[var(--text)]
                  night:text-[var(--text)]
                `}
              >
                Capacity
              </label>
              <input
                type="number"
                className={`
                  mt-1 block w-full p-2 border rounded-md
                  border-[var(--secondary)] bg-[var(--background)] text-[var(--text)]
                  focus:ring-[var(--primary)] focus:border-[var(--primary)]
                  dark:border-[var(--secondary)] dark:bg-[var(--background)] dark:text-[var(--text)]
                  night:border-[var(--secondary)] night:bg-[var(--background)] night:text-[var(--text)]
                `}
                value={capacity}
                onChange={(e) => setCapacity(e.target.value)}
                required
                min="1"
              />
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className={`
                  px-4 py-2 rounded-md hover:bg-opacity-80
                  bg-[var(--secondary)] text-[var(--text)]
                  dark:bg-[var(--secondary)] dark:text-[var(--text)]
                  night:bg-[var(--secondary)] night:text-[var(--text)]
                `}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={updateSectionMutation.isPending}
                className={`
                  px-4 py-2 rounded-md hover:bg-opacity-80
                  bg-[var(--primary)] text-white
                  disabled:opacity-50
                  dark:bg-[var(--primary)] dark:text-white
                  night:bg-[var(--primary)] night:text-white
                `}
              >
                {updateSectionMutation.isPending ? "Saving..." : "Save"}
              </button>
            </div>
          </form>
        )}

        {type === "delete" && (
          <>
            <p
              className={`
                text-[var(--text)]
                dark:text-[var(--text)]
                night:text-[var(--text)]
              `}
            >
              Are you sure you want to delete the section{" "}
              <strong>{section.sectionName}</strong>?
            </p>

            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={onClose}
                className={`
                  px-4 py-2 rounded-md hover:bg-opacity-80
                  bg-[var(--secondary)] text-[var(--text)]
                  dark:bg-[var(--secondary)] dark:text-[var(--text)]
                  night:bg-[var(--secondary)] night:text-[var(--text)]
                `}
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleteSectionMutation.isPending}
                className={`
                  px-4 py-2 rounded-md hover:bg-opacity-80
                  bg-red-500 text-white
                  disabled:opacity-50
                  dark:bg-red-500 dark:text-white
                  night:bg-red-500 night:text-white
                `}
              >
                {deleteSectionMutation.isPending ? "Deleting..." : "Delete"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default EditSection;
