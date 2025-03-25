"use client";

import { useState } from "react";
import { Menu, Transition } from "@headlessui/react";
import axios from "axios";
import { toast } from "react-toastify";
import { FiMoreVertical } from "react-icons/fi";

const ClassTable = ({ classes, router, setClasses }) => {
  const [loading, setLoading] = useState(null);
  const [selectedStream, setSelectedStream] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");

  // Extract unique filter options
  const uniqueStreams = [
    ...new Set(classes.flatMap((c) => c.stream.map((s) => s.streamName))),
  ];
  const uniqueYears = [...new Set(classes.map((c) => c.academicYear))];

  // Filter logic
  const filteredClasses = classes.filter((clas) => {
    const matchesStream =
      !selectedStream ||
      clas.stream.some((s) => s.streamName === selectedStream);
    const matchesYear = !selectedYear || clas.academicYear === selectedYear;
    const matchesStatus =
      !selectedStatus || clas.status === (selectedStatus === "Active");

    return matchesStream && matchesYear && matchesStatus;
  });

  // Toggle class status
  const toggleStatus = async (classId, status) => {
    setLoading(classId);
    try {
      await axios.put(
        `http://10.194.61.74:8080/academic/api/new/editStatus/${classId}`
      );
      toast.success(`Class ${status ? "disabled" : "enabled"} successfully!`);
      setClasses((prev) =>
        prev.map((c) => (c.classId === classId ? { ...c, status: !status } : c))
      );
    } catch (error) {
      console.error("Error updating class status:", error);
      toast.error("Failed to update status.");
    }
    setLoading(null);
  };

  // Delete class
  const deleteClass = async (classId) => {
    if (!window.confirm("Are you sure you want to delete this class?")) return;

    setLoading(classId);
    try {
      await axios.delete(
        `http://10.194.61.74:8080/academic/api/new/deleteClassById/${classId}`
      );
      toast.success("Class deleted successfully!");
      setClasses((prev) => prev.filter((c) => c.classId !== classId));
    } catch (error) {
      console.error("Error deleting class:", error);
      toast.error("Failed to delete class.");
    }
    setLoading(null);
  };

  return (
    <div className="bg-white p-6 shadow-lg rounded-lg">
      {/* Filter Section */}
      <div className="flex flex-wrap gap-4 mb-6">
        <select
          value={selectedStream}
          onChange={(e) => setSelectedStream(e.target.value)}
          className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring focus:ring-blue-300"
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
          className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring focus:ring-blue-300"
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
          className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring focus:ring-blue-300"
        >
          <option value="">All Status</option>
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
        </select>
      </div>

      {/* Table Section */}
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse">
          <thead>
            <tr className="bg-blue-500 text-white text-left">
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
                className="border-b hover:bg-gray-50 transition duration-200"
              >
                <td className="py-3 px-4 cursor-pointer">{index + 1}</td>
                <td
                  className="py-3 px-4 cursor-pointer hover:text-blue-600"
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
                      className="bg-gray-200 text-gray-700 px-2 py-1 rounded text-xs mr-1"
                    >
                      {stream.streamName}
                    </span>
                  ))}
                </td>
                <td className="py-3 px-4">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      clas.status
                        ? "bg-green-100 text-green-600"
                        : "bg-red-100 text-red-600"
                    }`}
                  >
                    {clas.status ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <Menu as="div" className="relative inline-block text-left">
                    <Menu.Button className="flex items-center px-3 py-2 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none">
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
                      <Menu.Items className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded-md shadow-lg z-10">
                        <Menu.Item>
                          {({ active }) => (
                            <button
                              onClick={() =>
                                toggleStatus(clas.classId, clas.status)
                              }
                              className={`block w-full text-left px-4 py-2 text-sm ${
                                active ? "bg-gray-100" : "bg-white"
                              }`}
                            >
                              {clas.status ? "Disable" : "Enable"}
                            </button>
                          )}
                        </Menu.Item>

                        <Menu.Item>
                          {({ active }) => (
                            <button
                              onClick={() => deleteClass(clas.classId)}
                              className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-100"
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
