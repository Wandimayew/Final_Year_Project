"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "react-toastify";
import { FiArrowUp, FiArrowDown } from "react-icons/fi";
import {
  FiEdit,
  FiTrash2,
  FiEye,
  FiDownload,
  FiCopy,
  FiPrinter,
  FiFile,
  FiFileText,
} from "react-icons/fi";
import * as XLSX from "xlsx";
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import { staffService } from "@/services/api";
import StaffModal from "./StaffModal";
import ConfirmDialog from "./ConfirmDialog";

export default function EmployeeList() {
  // State declarations
  const [searchQuery, setSearchQuery] = useState("");
  const [staff, setStaff] = useState([]);
  const [filteredStaff, setFilteredStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [staffToDelete, setStaffToDelete] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: "ascending",
  });
  const [filterStatus, setFilterStatus] = useState("all");
  const [activeTab, setActiveTab] = useState("staff");
  const [selectedTeacherDetails, setSelectedTeacherDetails] = useState(null);

  // Fetch staff data
  const fetchStaffData = async () => {
    try {
      setLoading(true);
      let response = [];

      if (activeTab === "teacher") {
        response = await staffService.getAllTeachersAll();
      } else {
        const [staffResponse, teacherResponse] = await Promise.all([
          staffService.getAllStaff(),
          staffService.getAllTeachersAll(),
        ]);
        response = [...staffResponse.data, ...teacherResponse.data];
      }

      console.log("Fetched Data:", response); // Debugging

      const formattedData = response.map((item) => ({
        id: item.staffId,
        firstName: item.firstName,
        middleName: item.middleName,
        lastName: item.lastName,
        email: item.email,
        status: item.status,
      }));

      setStaff(formattedData);
      setFilteredStaff(formattedData);
    } catch (error) {
      toast.error("Failed to fetch teachers");
      console.error("Error fetching teachers:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaffData();
  }, [activeTab]);

  // Handle staff deletion
  const handleDelete = async (id) => {
    try {
      await (activeTab === "teacher"
        ? staffService.deleteTeacher(id)
        : staffService.deleteStaff(id));
      toast.success("Staff member deleted successfully");
      fetchStaffData();
    } catch (error) {
      toast.error("Failed to delete staff member");
      console.error("Error deleting staff:", error);
    }
  };

  const fetchCompleteDetails = async (id) => {
    try {
      let completeData;
      if (activeTab === "teacher") {
        const response = await staffService.getTeacherById(id);
        completeData = response.data;
      } else {
        const response = await staffService.getStaffById(id);
        completeData = response.data;
      }
      setSelectedTeacherDetails(completeData);
      setSelectedStaff(completeData);
      setShowModal(true);
    } catch (error) {
      toast.error("Failed to fetch complete details");
      console.error("Error fetching complete details:", error);
    }
  };

  // Export functions
  const exportToExcel = () => {
    if (filteredStaff.length === 0) {
      alert("No data available export to Excel.");
      return;
    }
    const ws = XLSX.utils.json_to_sheet(filteredStaff);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Teacher Data");
    XLSX.writeFile(wb, `teacher_list_${activeTab}.xlsx`);
  };

  const exportToPDF = () => {
    if (filteredStaff.length === 0) {
      alert("No data available export to PDF.");
      return;
    }
    const doc = new jsPDF();
    doc.autoTable({
      head: [["ID", "FullName", "Email", "Status"]],
      body: filteredStaff.map((staff) => [
        staff.id,
        `${staff.firstName} ${staff.middleName} ${staff.lastName}`,
        staff.email,
        staff.status,
      ]),
    });
    doc.save(`teacher_list_${activeTab}.pdf`);
  };

  const exportToCSV = () => {
    if (filteredStaff.length === 0) {
      alert("No data available export to CSV.");
      return;
    }
    const ws = XLSX.utils.json_to_sheet(filteredStaff);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Staff Data");
    XLSX.writeFile(wb, `staff_list_${activeTab}.csv`);
  };

  const printPage = () => {
    if (filteredStaff.length === 0) {
      alert("No data available for print.");
      return;
    }
    window.print();
  };

  const copyToClipboard = () => {
    if (filteredStaff.length === 0) {
      alert("No data available copied to clipboard.");
      return;
    }
    const textToCopy = filteredStaff
      .map((staff) => {
        return `${staff.firstName} ${staff.middleName} ${staff.lastName} - ${staff.email} - ${staff.status}`;
      })
      .join("\n");

    navigator.clipboard
      .writeText(textToCopy)
      .then(() => {
        toast.success("Data copied to clipboard!");
      })
      .catch((err) => {
        toast.error("Failed to copy data.");
      });
  };
  // Sorting function
  const handleSort = (key) => {
    let direction = "ascending";
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key, direction });

    const sorted = [...filteredStaff].sort((a, b) => {
      let aValue, bValue;

      if (key === "fullName") {
        aValue = `${a.firstName} ${a.middleName || ""} ${a.lastName}`.trim();
        bValue = `${b.firstName} ${b.middleName || ""} ${b.lastName}`.trim();
      } else {
        aValue = a[key];
        bValue = b[key];
      }

      if (aValue < bValue) return direction === "ascending" ? -1 : 1;
      if (aValue > bValue) return direction === "ascending" ? 1 : -1;
      return 0;
    });

    setFilteredStaff(sorted);
  };

  // Search and filter effect
  useEffect(() => {
    const filtered = staff.filter((member) => {
      const searchString = searchQuery.toLowerCase();
      const matchesSearch =
        member.firstName?.toLowerCase().includes(searchString) ||
        member.middleName?.toLowerCase().includes(searchString) ||
        member.lastName?.toLowerCase().includes(searchString) ||
        member.email?.toLowerCase().includes(searchString);

      const matchesStatus =
        filterStatus === "all" ? true : member.status === filterStatus;

      return matchesSearch && matchesStatus;
    });
    setFilteredStaff(filtered);
    setCurrentPage(1);
  }, [searchQuery, staff, filterStatus]);

  // Pagination calculations
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredStaff.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredStaff.length / itemsPerPage);

  return (
    <div className="container mx-auto px-4 py-8 mt-12">
      {/* Header and Controls */}
      <div className="mb-8">
        {/* Tabs */}
        <div className="flex mb-4 space-x-4">
          <button
            onClick={() => setActiveTab("all")}
            className={`px-4 py-2 rounded ${
              activeTab === "all"
                ? "bg-blue-500 text-white"
                : "bg-gray-200 text-black"
            }`}
          >
            All
          </button>
          <button
            onClick={() => setActiveTab("teacher")}
            className={`px-4 py-2 rounded ${
              activeTab === "teacher"
                ? "bg-blue-500 text-white"
                : "bg-gray-200 text-black"
            }`}
          >
            Teachers
          </button>
        </div>

        {/* Export buttons */}
        <div className="flex justify-end space-x-2">
          <button
            onClick={exportToExcel}
            className="px-4 py-2 bg-green-500 text-white rounded"
            title="Export to Excel"
          >
            <FiFileText className="mr-1" />
          </button>
          <button
            onClick={exportToPDF}
            className="px-4 py-2 bg-red-500 text-white rounded"
            title="Export to PDF"
          >
            <FiDownload className="mr-1" />
          </button>
          <button
            onClick={exportToCSV}
            className="flex items-center px-4 py-2 bg-gray-500 text-white rounded"
            title="Export to CSV"
          >
            <FiFile className="mr-2" />
          </button>
          <button
            onClick={printPage}
            className="flex items-center px-4 py-2 bg-blue-500 text-white rounded"
            title="Print Page"
          >
            <FiPrinter className="mr-2" />
          </button>
          <button
            onClick={copyToClipboard}
            className="flex items-center px-4 py-2 bg-yellow-500 text-white rounded"
            title="Copy to Clipboard"
          >
            <FiCopy className="mr-2" />
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-wrap justify-end gap-4 mb-4">
        <input
          type="text"
          placeholder="Search..."
          className="px-4 py-2 border rounded text-black"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <select
          className="px-4 py-2 border rounded text-black"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="all">All Status</option>
          <option value="ACTIVE">Active</option>
          <option value="INACTIVE">Inactive</option>
        </select>
      </div>

      {/* Staff Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white text-black">
          <thead>
            <tr>
              <th
                className="px-6 py-3 border-b cursor-pointer text-center"
                onClick={() => handleSort("id")}
              >
                ID{" "}
                {sortConfig.key === "id" &&
                sortConfig.direction === "ascending" ? (
                  <FiArrowUp className="ml-1 inline" />
                ) : (
                  <FiArrowDown className="ml-1 inline" />
                )}
              </th>
              <th
                className="px-6 py-3 border-b cursor-pointer"
                onClick={() => handleSort("fullName")}
              >
                Full Name{" "}
                {sortConfig.key === "fullName" &&
                sortConfig.direction === "ascending" ? (
                  <FiArrowUp className="ml-1 inline" />
                ) : (
                  <FiArrowDown className="ml-1 inline" />
                )}
              </th>
              <th
                className="px-6 py-3 border-b cursor-pointer"
                onClick={() => handleSort("email")}
              >
                Email{" "}
                {sortConfig.key === "email" &&
                sortConfig.direction === "ascending" ? (
                  <FiArrowUp className="ml-1 inline" />
                ) : (
                  <FiArrowDown className="ml-1 inline" />
                )}
              </th>
              <th className="px-6 py-3 border-b cursor-pointer">Status</th>
              <th className="px-6 py-3 border-b">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="5" className="text-center py-4">
                  <div className="spinner-border" role="status">
                    <span className="sr-only">Loading...</span>
                  </div>
                </td>
              </tr>
            ) : (
              currentItems.map((item) => (
                <tr key={item.id}>
                  <td className="px-6 py-4 border-b text-center">{item.id}</td>
                  <td className="px-6 py-4 border-b text-center">
                    {`${item.firstName} ${item.middleName || ""} ${
                      item.lastName
                    }`}
                  </td>
                  <td className="px-6 py-4 border-b text-center">
                    {item.email}
                  </td>
                  <td className="px-6 py-4 border-b text-center">
                    <span
                      className={`px-2 py-1 rounded-full text-sm ${
                        item.status === "ACTIVE"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {item.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 border-b items-center">
                    <div className="flex justify-center space-x-2">
                      <button
                        onClick={() => fetchCompleteDetails(item.id)}
                        className="text-blue-500"
                        title="View Details"
                      >
                        <FiEye />
                      </button>

                      <Link
                        href={`/staff/edit/${item.id}`}
                        className="text-yellow-500"
                        title="Edit Staff"
                      >
                        <FiEdit />
                      </Link>
                      <button
                        onClick={() => {
                          setStaffToDelete(item.id);
                          setShowConfirmDialog(true);
                        }}
                        className="text-red-500"
                        title="Delete Staff"
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="mt-4 flex justify-between items-center text-black">
        <span>
          Showing {indexOfFirstItem + 1} to{" "}
          {Math.min(indexOfLastItem, filteredStaff.length)} of{" "}
          {filteredStaff.length} entries
        </span>
        <div className="flex space-x-2">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 border rounded disabled:opacity-50 bg-lime-300"
          >
            Previous
          </button>
          <button
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
            disabled={currentPage === totalPages}
            className="px-4 py-2 border rounded disabled:opacity-50 bg-green-500"
          >
            Next
          </button>
        </div>
      </div>

      {/* Modals */}
      {showModal && (
        <StaffModal
          staff={selectedStaff}
          teacher={selectedTeacherDetails}
          onClose={() => {
            setShowModal(false);
            setSelectedTeacherDetails(null);
            setSelectedStaff(null);
          }}
          isTeacher={activeTab === "teacher"}
        />
      )}

      {showConfirmDialog && (
        <ConfirmDialog
          title="Confirm Delete"
          message={`Are you sure you want to delete ${staffToDelete.firstName} ${staffToDelete.middleName}?`}
          onConfirm={() => {
            handleDelete(staffToDelete.id);
            setShowConfirmDialog(false);
          }}
          onCancel={() => setShowConfirmDialog(false)}
        />
      )}
    </div>
  );
}
