"use client";

import { useState } from "react";
import { Menu, Transition } from "@headlessui/react";
import { toast } from "react-toastify";
import { FiMoreVertical } from "react-icons/fi";
import { useUpdateClassStatus, useDeleteClass } from "@/lib/api/academicService/class";

const ClassTable = ({ classes, router, schoolId }) => {
  const [selectedStream, setSelectedStream] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");

  const updateStatusMutation = useUpdateClassStatus();
  const deleteClassMutation = useDeleteClass();

  const uniqueStreams = [
    ...new Set(classes.flatMap((c) => c.stream.map((s) => s.streamName))),
  ];
  const uniqueYears = [...new Set(classes.map((c) => c.academicYear))];

  const filteredClasses = classes.filter((clas) => {
    const matchesStream =
      !selectedStream ||
      clas.stream.some((s) => s.streamName === selectedStream);
    const matchesYear = !selectedYear || clas.academicYear === selectedYear;
    const matchesStatus =
      !selectedStatus || clas.status === (selectedStatus === "Active");

    return matchesStream && matchesYear && matchesStatus;
  });

  const toggleStatus = async (classId, status) => {
    try {
      await updateStatusMutation.mutateAsync({ schoolId, classId });
      toast.success(`Class ${status ? "disabled" : "enabled"} successfully!`);
    } catch (error) {
      console.error("Error updating class status:", error);
      toast.error("Failed to update status.");
    }
  };

  const deleteClass = async (classId) => {
    if (!window.confirm("Are you sure you want to delete this class?")) return;

    try {
      await deleteClassMutation.mutateAsync({ schoolId, classId });
      toast.success("Class deleted successfully!");
    } catch (error) {
      console.error("Error deleting class:", error);
      toast.error("Failed to delete class.");
    }
  };

  return (
    <div
      className={`
        p-6 shadow-lg rounded-lg
        bg-[var(--surface)]
        dark:bg-[var(--surface)] night:bg-[var(--surface)]
      `}
    >
      <div className="flex flex-wrap gap-4 mb-6">
        <select
          value={selectedStream}
          onChange={(e) => setSelectedStream(e.target.value)}
          className={`
            border rounded-md px-3 py-2 text-sm
            border-[var(--secondary)] bg-[var(--background)] text-[var(--text)]
            focus:ring focus:ring-[var(--primary)]
            dark:border-[var(--secondary)] dark:bg-[var(--background)] dark:text-[var(--text)]
            night:border-[var(--secondary)] night:bg-[var(--background)] night:text-[var(--text)]
          `}
        >
          <option value="">All Streams</option>
          {uniqueStreams.map((stream) => (
            <option key={stream} value={stream}>
              {stream}
            </option>
          ))}
        </select>

        <select
          value={selectedYear}
          onChange={(e) => setSelectedYear(e.target.value)}
          className={`
            border rounded-md px-3 py-2 text-sm
            border-[var(--secondary)] bg-[var(--background)] text-[var(--text)]
            focus:ring focus:ring-[var(--primary)]
            dark:border-[var(--secondary)] dark:bg-[var(--background)] dark:text-[var(--text)]
            night:border-[var(--secondary)] night:bg-[var(--background)] night:text-[var(--text)]
          `}
        >
          <option value="">All Years</option>
          {uniqueYears.map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>

        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className={`
            border rounded-md px-3 py-2 text-sm
            border-[var(--secondary)] bg-[var(--background)] text-[var(--text)]
            focus:ring focus:ring-[var(--primary)]
            dark:border-[var(--secondary)] dark:bg-[var(--background)] dark:text-[var(--text)]
            night:border-[var(--secondary)] night:bg-[var(--background)] night:text-[var(--text)]
          `}
        >
          <option value="">All Status</option>
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
        </select>
      </div>

      <div className="overflow-x-auto">
        <table
          className={`
            min-w-full border-collapse
            border-[var(--secondary)]
            dark:border-[var(--secondary)] night:border-[var(--secondary)]
          `}
        >
          <thead>
            <tr
              className={`
                bg-[var(--primary)] text-white text-left
                dark:bg-[var(--primary)] dark:text-white
                night:bg-[var(--primary)] night:text-white
              `}
            >
              <th className="py-3 px-4">#</th>
              <th className="py-3 px-4">Name</th>
              <th className="py-3 px-4">Academic Year</th>
              <th className="py-3 px-4">Stream</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredClasses.map((clas, index) => (
              <tr
                key={clas.classId}
                className={`
                  border-b hover:bg-[var(--background)]
                  dark:border-[var(--secondary)] dark:hover:bg-[var(--background)]
                  night:border-[var(--secondary)] night:hover:bg-[var(--background)]
                `}
              >
                <td className="py-3 px-4 cursor-pointer">{index + 1}</td>
                <td
                  className={`
                    py-3 px-4 cursor-pointer hover:text-[var(--primary)]
                    dark:hover:text-[var(--primary)]
                    night:hover:text-[var(--primary)]
                  `}
                  onClick={() =>
                    router.push(`/academic/class/class-details/${clas.classId}`)
                  }
                >
                  {clas.className}
                </td>
                <td className="py-3 px-4">{clas.academicYear}</td>
                <td className="py-3 px-4">
                  {clas.stream.map((stream) => (
                    <span
                      key={stream.streamId}
                      className={`
                        bg-[var(--surface)] text-[var(--text)] px-2 py-1 rounded text-xs mr-1
                        dark:bg-[var(--surface)] dark:text-[var(--text)]
                        night:bg-[var(--surface)] night:text-[var(--text)]
                      `}
                    >
                      {stream.streamName}
                    </span>
                  ))}
                </td>
                <td className="py-3 px-4">
                  <span
                    className={`
                      px-3 py-1 rounded-full text-sm font-semibold
                      ${clas.status
                        ? "bg-green-100 text-green-600"
                        : "bg-red-100 text-red-600"}
                      dark:bg-opacity-20 dark:text-green-400
                      night:bg-opacity-20 night:text-green-300
                    `}
                  >
                    {clas.status ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <Menu as="div" className="relative inline-block text-left">
                    <Menu.Button
                      className={`
                        flex items-center px-3 py-2 rounded-md
                        bg-[var(--surface)] hover:bg-[var(--background)]
                        dark:bg-[var(--surface)] dark:hover:bg-[var(--background)]
                        night:bg-[var(--surface)] night:hover:bg-[var(--background)]
                      `}
                    >
                      <FiMoreVertical size={18} />
                    </Menu.Button>

                    <Transition
                      enter="transition duration-200 ease-out"
                      enterFrom="transform scale-95 opacity-0"
                      enterTo="transform scale-100 opacity-100"
                      leave="transition duration-150 ease-in"
                      leaveFrom="transform scale-100 opacity-100"
                      leaveTo="transform scale-95 opacity-0"
                    >
                      <Menu.Items
                        className={`
                          absolute right-0 mt-2 w-40 rounded-md shadow-lg z-10
                          bg-[var(--surface)] border-[var(--secondary)]
                          dark:bg-[var(--surface)] dark:border-[var(--secondary)]
                          night:bg-[var(--surface)] night:border-[var(--secondary)]
                        `}
                      >
                        <Menu.Item>
                          {({ active }) => (
                            <button
                              onClick={() =>
                                toggleStatus(clas.classId, clas.status)
                              }
                              disabled={updateStatusMutation.isPending}
                              className={`
                                block w-full text-left px-4 py-2 text-sm
                                text-[var(--text)]
                                ${active ? "bg-[var(--background)]" : ""}
                                ${updateStatusMutation.isPending ? "opacity-50" : ""}
                                dark:text-[var(--text)] dark:bg-[var(--background)]
                                night:text-[var(--text)] night:bg-[var(--background)]
                              `}
                            >
                              {clas.status ? "Disable" : "Enable"}
                            </button>
                          )}
                        </Menu.Item>

                        <Menu.Item>
                          {({ active }) => (
                            <button
                              onClick={() => deleteClass(clas.classId)}
                              disabled={deleteClassMutation.isPending}
                              className={`
                                block w-full text-left px-4 py-2 text-sm
                                text-red-600
                                ${active ? "bg-red-100" : ""}
                                ${deleteClassMutation.isPending ? "opacity-50" : ""}
                                dark:text-red-400 dark:bg-red-900
                                night:text-red-300 night:bg-red-900
                              `}
                            >
                              Delete
                            </button>
                          )}
                        </Menu.Item>
                      </Menu.Items>
                    </Transition>
                  </Menu>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ClassTable;