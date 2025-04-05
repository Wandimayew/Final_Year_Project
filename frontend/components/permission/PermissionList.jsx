"use client";

import React, { useState, useEffect } from "react";
import { usePermissions } from "@/lib/api/userManagementService/permission";
import { useAuthStore } from "@/lib/auth";
import { useRouter } from "next/navigation";
import {
  ArrowUpIcon,
  ArrowDownIcon,
  PlusIcon,
  ArrowLeftIcon,
} from "@heroicons/react/24/outline";
import SearchBar from "../constant/SearchBar";

const PermissionList = () => {
  const { getSchoolId } = useAuthStore();
  const router = useRouter();

  // State for hydration, sorting, filtering, and searching
  const [schoolId, setSchoolId] = useState(null);
  const [isHydrated, setIsHydrated] = useState(false);
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState("asc");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterOperation, setFilterOperation] = useState("");

  // Fetch permissions using usePermissions hook
  const {
    data: permissionsList = [],
    isLoading,
    error,
  } = usePermissions(schoolId);

  // Hydrate schoolId on client-side
  useEffect(() => {
    const id = getSchoolId();
    setSchoolId(id);
    setIsHydrated(true);
    if (!id) {
      router.push("/login");
    }
  }, [getSchoolId, router]);

  // Sorting handler
  const handleSort = (field) => {
    const isAsc = sortBy === field && sortOrder === "asc";
    setSortOrder(isAsc ? "desc" : "asc");
    setSortBy(field);
  };

  // Filter and search logic
  const filteredPermissions = permissionsList
    .filter((permission) => {
      if (filterOperation === "read") return permission.httpMethod === "GET";
      if (filterOperation === "write")
        return ["POST", "PUT"].includes(permission.httpMethod);
      if (filterOperation === "delete")
        return permission.httpMethod === "DELETE";
      return true;
    })
    .filter((permission) =>
      [permission.name, permission.description, permission.endpoint]
        .join(" ")
        .toLowerCase()
        .includes(searchQuery.toLowerCase())
    );

  // Sort filtered permissions
  const sortedPermissions = [...filteredPermissions].sort((a, b) => {
    const valueA =
      sortBy === "isActive" ? a[sortBy] : (a[sortBy] || "").toString();
    const valueB =
      sortBy === "isActive" ? b[sortBy] : (b[sortBy] || "").toString();
    if (sortOrder === "asc") {
      return sortBy === "isActive"
        ? valueA === valueB
          ? 0
          : valueA
          ? -1
          : 1
        : valueA.localeCompare(valueB);
    }
    return sortBy === "isActive"
      ? valueA === valueB
        ? 0
        : valueB
        ? -1
        : 1
      : valueB.localeCompare(valueA);
  });

  // Handle row click
  const handleRowClick = (permissionId) => {
    console.log("Permission clicked:", permissionId);
  };

  if (!isHydrated) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <svg
          className="animate-spin h-8 w-8 text-blue-500"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v8h8a8 8 0 01-8 8 8 8 0 01-8-8z"
          ></path>
        </svg>
      </div>
    );
  }

  if (!schoolId) {
    return null; // Redirect handled in useEffect
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-blue-600 shadow-lg">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex-1" />
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push("/user/permission/create")}
              className="flex items-center px-4 py-2 bg-white text-blue-600 rounded-lg hover:bg-gray-100 transition-colors shadow-md"
            >
              <PlusIcon className="w-5 h-5 mr-2" />
              Add Permission
            </button>
            <button
              onClick={() => router.push("/dashboard")}
              className="flex items-center px-4 py-2 bg-blue-700 text-white rounded-lg hover:bg-blue-800 transition-colors"
            >
              <ArrowLeftIcon className="w-5 h-5 mr-2" />
              Back to Dashboard
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow-lg rounded-xl p-6">
          {/* Header with Search and Filter */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <h1 className="text-2xl font-bold text-gray-800">
              Permissions for School:{" "}
              <span className="text-blue-600">{schoolId}</span>
            </h1>
            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
              <SearchBar
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                placeholder="Search permissions..."
                width="w-full sm:w-72"
                additionalStyles="shadow-md"
              />
              <select
                value={filterOperation}
                onChange={(e) => setFilterOperation(e.target.value)}
                className="w-full sm:w-48 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Operations</option>
                <option value="read">Read (GET)</option>
                <option value="write">Write (POST/PUT)</option>
                <option value="delete">Delete (DELETE)</option>
              </select>
            </div>
          </div>

          {/* Permissions Table */}
          {isLoading ? (
            <div className="flex justify-center py-12">
              <svg
                className="animate-spin h-10 w-10 text-blue-500"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v8h8a8 8 0 01-8 8 8 8 0 01-8-8z"
                ></path>
              </svg>
            </div>
          ) : error ? (
            <p className="text-center text-red-600 py-6">
              Failed to load permissions: {error.message}
            </p>
          ) : sortedPermissions.length === 0 ? (
            <p className="text-center text-gray-500 py-8">
              No permissions found matching your criteria.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"
                      onClick={() => handleSort("name")}
                    >
                      <div className="flex items-center cursor-pointer">
                        Name
                        {sortBy === "name" &&
                          (sortOrder === "asc" ? (
                            <ArrowUpIcon className="w-4 h-4 ml-1 text-blue-500" />
                          ) : (
                            <ArrowDownIcon className="w-4 h-4 ml-1 text-blue-500" />
                          ))}
                      </div>
                    </th>
                    <th
                      className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"
                      onClick={() => handleSort("description")}
                    >
                      <div className="flex items-center cursor-pointer">
                        Description
                        {sortBy === "description" &&
                          (sortOrder === "asc" ? (
                            <ArrowUpIcon className="w-4 h-4 ml-1 text-blue-500" />
                          ) : (
                            <ArrowDownIcon className="w-4 h-4 ml-1 text-blue-500" />
                          ))}
                      </div>
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {sortedPermissions.map((permission) => (
                    <tr
                      key={permission.permissionId}
                      className="hover:bg-gray-50 transition-colors cursor-pointer"
                      onClick={() => handleRowClick(permission.permissionId)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {permission.name}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {permission.description || "No description"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(
                              `/user/permission/update/${permission.permissionId}`
                            );
                          }}
                          className="px-3 py-1 border border-blue-500 text-blue-500 rounded-md hover:bg-blue-500 hover:text-white transition-colors"
                        >
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PermissionList;
