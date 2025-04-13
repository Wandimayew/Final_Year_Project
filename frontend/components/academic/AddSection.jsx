"use client";

import { useState, useMemo } from "react";
import { useAuthStore } from "@/lib/auth";
import { toast } from "react-toastify";
import { useCreateSection } from "@/lib/api/academicService/section";

const AddSection = ({ onClose, classOptions }) => {
  const [sectionName, setSectionName] = useState("");
  const [capacity, setCapacity] = useState("");
  const [errors, setErrors] = useState({});

  const createSectionMutation = useCreateSection();

  const validateForm = () => {
    const newErrors = {};
    if (!sectionName.trim())
      newErrors.sectionName = "Section name is required.";
    if (!capacity) newErrors.capacity = "Capacity is required.";
    else if (capacity < 1) newErrors.capacity = "Capacity must be at least 1.";
    return newErrors;
  };

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formErrors = validateForm();

    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    try {
      await createSectionMutation.mutateAsync({
        schoolId,
        sectionRequest: {
          sectionName,
          capacity: parseInt(capacity, 10),
          classId: classOptions,
        },
      });
      toast.success("Section added successfully!");
      setSectionName("");
      setCapacity("");
      onClose();
    } catch (error) {
      console.error("Error adding section:", error);
      toast.error("Failed to add section.");
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label
            htmlFor="sectionName"
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
            id="sectionName"
            className={`
              mt-1 block w-full p-2 border rounded-md shadow-sm
              border-[var(--secondary)] bg-[var(--background)] text-[var(--text)]
              focus:ring-[var(--primary)] focus:border-[var(--primary)]
              dark:border-[var(--secondary)] dark:bg-[var(--background)] dark:text-[var(--text)]
              night:border-[var(--secondary)] night:bg-[var(--background)] night:text-[var(--text)]
            `}
            value={sectionName}
            onChange={(e) => setSectionName(e.target.value)}
          />
          {errors.sectionName && (
            <p
              className={`
                text-red-500 text-sm mt-1
                dark:text-red-400
                night:text-red-300
              `}
            >
              {errors.sectionName}
            </p>
          )}
        </div>

        <div className="mb-4">
          <label
            htmlFor="capacity"
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
            id="capacity"
            className={`
              mt-1 block w-full p-2 border rounded-md shadow-sm
              border-[var(--secondary)] bg-[var(--background)] text-[var(--text)]
              focus:ring-[var(--primary)] focus:border-[var(--primary)]
              dark:border-[var(--secondary)] dark:bg-[var(--background)] dark:text-[var(--text)]
              night:border-[var(--secondary)] night:bg-[var(--background)] night:text-[var(--text)]
            `}
            value={capacity}
            onChange={(e) => setCapacity(e.target.value)}
          />
          {errors.capacity && (
            <p
              className={`
                text-red-500 text-sm mt-1
                dark:text-red-400
                night:text-red-300
              `}
            >
              {errors.capacity}
            </p>
          )}
        </div>

        <div className="flex justify-end">
          <button
            type="button"
            className={`
              px-4 py-2 rounded-md hover:bg-opacity-80
              bg-[var(--secondary)] text-[var(--text)]
              dark:bg-[var(--secondary)] dark:text-[var(--text)]
              night:bg-[var(--secondary)] night:text-[var(--text)]
            `}
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={createSectionMutation.isPending}
            className={`
              px-4 py-2 rounded-md hover:bg-opacity-80 ml-2
              bg-[var(--primary)] text-white
              disabled:opacity-50
              dark:bg-[var(--primary)] dark:text-white
              night:bg-[var(--primary)] night:text-white
            `}
          >
            {createSectionMutation.isPending ? "Adding..." : "Add Section"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddSection;
