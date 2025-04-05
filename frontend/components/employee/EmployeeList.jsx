"use client";

import React, { useEffect, useState, useCallback } from "react"; // Added useCallback
import Link from "next/link";
import { toast } from "react-toastify";
import {
  FiArrowUp,
  FiArrowDown,
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
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { staffService } from "../../services/api";
import StaffModal from "./StaffModal";
import ConfirmDialog from "./ConfirmDialog";

export default function EmployeeList() {
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
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "ascending" });
  const [filterStatus, setFilterStatus] = useState("all");
  const [activeTab, setActiveTab] = useState("staff");
  const [selectedTeacherDetails, setSelectedTeacherDetails] = useState(null);

  // Fetch staff data with useCallback
  const fetchStaffData = useCallback(async () => {
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

      const formattedData = response
        .filter((item) => item.isActive) // Filter out inactive staff
        .map((item) => ({
          id: item.staffId,
          photo: item.photo,
          firstName: item.firstName,
          middleName: item.middleName,
          lastName: item.lastName,
          email: item.email,
          status: item.status,
          isActive: item.isActive, // Include isActive for reference
        }));

      setStaff(formattedData);
      setFilteredStaff(formattedData);
    } catch (error) {
      toast.error("Failed to fetch staff data");
      console.error("Error fetching staff:", error);
    } finally {
      setLoading(false);
    }
  }, [activeTab]); // Dependency: activeTab

  useEffect(() => {
    fetchStaffData();
  }, [fetchStaffData,activeTab]); // Dependency: fetchStaffData

  // Rest of the code remains unchanged...
  const handleDelete = async (id) => {
    try {
      // Optimistically update the UI by marking as inactive
      const updatedStaff = staff.map((item) =>
        item.id === id ? { ...item, isActive: false } : item
      );
      setStaff(updatedStaff);
      setFilteredStaff(updatedStaff.filter((item) => item.isActive));

      // Perform the soft delete
      await (activeTab === "teacher" ? staffService.deleteTeacher(id) : staffService.deleteStaff(id));
      toast.success("Staff member deleted successfully");

      // Fetch fresh data to ensure consistency
      await fetchStaffData();
    } catch (error) {
      toast.error("Failed to delete staff member");
      console.error("Error deleting staff:", error);
      await fetchStaffData(); // Revert on failure
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

  const exportToExcel = () => {
    if (filteredStaff.length === 0) return toast.error("No data to export");
  
    const truncateText = (text, maxLength = 30000) => 
      text && text.length > maxLength ? text.substring(0, maxLength) + "..." : text;
  
    const ws = XLSX.utils.json_to_sheet(
      filteredStaff.map(({ id, firstName, middleName, lastName, email, status }) => ({
        ID: id,
        FullName: truncateText(`${firstName} ${middleName || ""} ${lastName}`.trim()),
        Email: truncateText(email),
        Status: truncateText(status),
      }))
    );
  
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Staff Data");
    XLSX.writeFile(wb, `staff_list_${activeTab}.xlsx`);
  };
  
  const exportToPDF = () => {
    if (filteredStaff.length === 0) return toast.error("No data to export");
  
    const doc = new jsPDF();
    
    autoTable(doc, {
      head: [["ID", "Full Name", "Email", "Status"]],
      body: filteredStaff.map(({ id, firstName, middleName, lastName, email, status }) => [
        id,
        `${firstName} ${middleName || ""} ${lastName}`.trim(),
        email,
        status,
      ]),
    });
  
    doc.save(`staff_list_${activeTab}.pdf`);
  };
  
  const exportToCSV = () => {
    if (filteredStaff.length === 0) return toast.error("No data to export");
  
    const ws = XLSX.utils.json_to_sheet(
      filteredStaff.map(({ id, firstName, middleName, lastName, email, status }) => ({
        ID: id,
        FullName: `${firstName} ${middleName || ""} ${lastName}`.trim(),
        Email: email,
        Status: status,
      }))
    );
  
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Staff Data");
    XLSX.writeFile(wb, `staff_list_${activeTab}.csv`);
  };
  
  const printPage = () => {
    if (filteredStaff.length === 0) return toast.error("No data to print");
  
    const table = document.getElementById("staffTable"); // Make sure your table has this ID
    if (!table) return toast.error("Table not found");
  
    const printWindow = window.open("", "_blank");
    printWindow.document.write(`
      <html>
        <head>
          <title>Print Staff List</title>
          <style>
            table { width: 100%; border-collapse: collapse; }
            th, td { border: 1px solid black; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
          </style>
        </head>
        <body>
          ${table.outerHTML}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  };
  
  const copyToClipboard = () => {
    if (filteredStaff.length === 0) return toast.error("No data to copy");
  
    const textToCopy = filteredStaff
      .map(
        (staff) =>
          `${staff.firstName} ${staff.middleName} ${staff.lastName} - ${staff.email} - ${staff.status}`
      )
      .join("\n");
    navigator.clipboard
      .writeText(textToCopy)
      .then(() => toast.success("Data copied to clipboard!"))
      .catch(() => toast.error("Failed to copy data."));
  };

  const handleSort = (key) => {
    let direction = "ascending";
    if (sortConfig.key === key && sortConfig.direction === "ascending")
      direction = "descending";
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

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredStaff.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredStaff.length / itemsPerPage);

  return (
    <div className="container mx-auto px-4 py-8 mt-12">
      <div className="mb-8">
        <div className="flex mb-4 space-x-4">
          <button
            onClick={() => setActiveTab("all")}
            className={`px-4 py-2 rounded-lg font-semibold transition-colors ${activeTab === "all" ? "bg-indigo-600 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"}`}
          >
            All
          </button>
          <button
            onClick={() => setActiveTab("teacher")}
            className={`px-4 py-2 rounded-lg font-semibold transition-colors ${activeTab === "teacher" ? "bg-indigo-600 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"}`}
          >
            Teachers
          </button>
        </div>
        <div className="flex justify-end space-x-2">
          <button
            onClick={exportToExcel}
            className="px-4 py-2 bg-green-500 text-white rounded"
            title="Export to Excel"
          >
            <FiFileText className="mr-1" />
          </button>
          <button onClick={exportToPDF} className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600" title="Export to PDF">
            <Download size={20} />
          </button>
          <button onClick={exportToCSV} className="p-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600" title="Export to CSV">
            <File size={20} />
          </button>
          <button onClick={printPage} className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600" title="Print Page">
            <Printer size={20} />
          </button>
          <button onClick={copyToClipboard} className="p-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600" title="Copy to Clipboard">
            <Copy size={20} />
          </button>
        </div>
      </div>
      <div className="flex flex-wrap justify-end gap-4 mb-4">
        <input
          type="text"
          placeholder="Search staff..."
          className="w-full sm:w-64 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 text-gray-800"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <select
          className="w-full sm:w-40 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 text-gray-800"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="all">All Status</option>
          <option value="ACTIVE">Active</option>
          <option value="INACTIVE">Inactive</option>
        </select>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white text-black">
          <thead>
            <tr>
              <th
                className="px-6 py-3 text-center text-sm font-semibold text-indigo-700 cursor-pointer"
                onClick={() => handleSort("id")}
              >
                ID {sortConfig.key === "id" && (sortConfig.direction === "ascending" ? <ArrowUp size={14} className="inline" /> : <ArrowDown size={14} className="inline" />)}
              </th>
              <th className="px-6 py-3 text-center text-sm font-semibold text-indigo-700">Photo</th>
              <th
                className="px-6 py-3 text-center text-sm font-semibold text-indigo-700 cursor-pointer"
                onClick={() => handleSort("fullName")}
              >
                Full Name {sortConfig.key === "fullName" && (sortConfig.direction === "ascending" ? <ArrowUp size={14} className="inline" /> : <ArrowDown size={14} className="inline" />)}
              </th>
              <th
                className="px-6 py-3 text-center text-sm font-semibold text-indigo-700 cursor-pointer"
                onClick={() => handleSort("email")}
              >
                Email {sortConfig.key === "email" && (sortConfig.direction === "ascending" ? <ArrowUp size={14} className="inline" /> : <ArrowDown size={14} className="inline" />)}
              </th>
              <th className="px-6 py-3 text-center text-sm font-semibold text-indigo-700">Status</th>
              <th className="px-6 py-3 text-center text-sm font-semibold text-indigo-700">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan="6" className="text-center py-8 text-gray-500">
                  <div className="animate-spin inline-block w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full" />
                  <span className="ml-2">Loading...</span>
                </td>
              </tr>
            ) : currentItems.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center py-8 text-gray-500">No active staff found</td>
              </tr>
            ) : (
              currentItems.map((item) => (
                <tr key={item.id}>
                  <td className="px-6 py-4 border-b text-center">{item.id}</td>
                  <td className="px-6 py-4 border-b text-center">{`${
                    item.firstName
                  } ${item.middleName || ""} ${item.lastName}`}</td>
                  <td className="px-6 py-4 border-b text-center">
                    {item.email}
                  </td>
                  <td className="px-6 py-4 border-b text-center">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${item.status === "ACTIVE" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
                    >
                      {item.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex justify-center gap-3">
                      <button onClick={() => fetchCompleteDetails(item.id)} className="text-indigo-500 hover:text-indigo-700" title="View Details">
                        <Eye size={18} />
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
                          setStaffToDelete(item);
                          setShowConfirmDialog(true);
                        }}
                        className="text-red-500 hover:text-red-700"
                        title="Delete Staff"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <div className="mt-4 flex justify-between items-center text-black">
        <span>
          Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredStaff.length)} of {filteredStaff.length} entries
        </span>
        <div className="flex gap-2">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 bg-indigo-500 text-white rounded-lg disabled:bg-gray-300 hover:bg-indigo-600 transition-colors"
          >
            Previous
          </button>
          <button
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 bg-indigo-500 text-white rounded-lg disabled:bg-gray-300 hover:bg-indigo-600 transition-colors"
          >
            Next
          </button>
        </div>
      </div>
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
          message={`Are you sure you want to delete ${staffToDelete.firstName} ${staffToDelete.middleName || ""} ${staffToDelete.lastName}?`}
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
