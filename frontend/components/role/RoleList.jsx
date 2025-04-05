"use client";

import React, { useState, useEffect } from "react";
import { useRoles } from "@/lib/api/userManagementService/role";
import { useAuthStore } from "@/lib/auth";
import { useRouter } from "next/navigation";
import {
  ArrowLeftIcon,
  ArrowUpIcon,
  ArrowDownIcon,
} from "@heroicons/react/24/outline";

const RoleList = () => {
  const { getSchoolId } = useAuthStore();
  const router = useRouter();

  // State for hydration, sorting
  const [schoolId, setSchoolId] = useState(null);
  const [isHydrated, setIsHydrated] = useState(false);
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState("asc");

  // Fetch roles using useRoles hook
  const { data: rolesList = [], isLoading, error } = useRoles(schoolId);

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

  // Sort roles based on sortBy and sortOrder
  const sortedRoles = [...rolesList].sort((a, b) => {
    const valueA = a[sortBy] || "";
    const valueB = b[sortBy] || "";
    if (sortOrder === "asc") {
      return valueA.localeCompare(valueB);
    }
    return valueB.localeCompare(valueA);
  });

  // Handle row click
  const handleRowClick = (roleId) => {
    console.log("Role clicked:", roleId);
    router.push(`/user/role/details/${roleId}`);
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
    <div className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      {/* Back Button */}
      <div className="max-w-6xl mx-auto mb-6">
        <button
          onClick={() => router.push("/dashboard")}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <ArrowLeftIcon className="w-5 h-5 mr-2" />
          Back to Dashboard
        </button>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto">
        <div className="bg-white shadow-lg rounded-xl p-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">
            Roles for School: <span className="text-blue-600">{schoolId}</span>
          </h1>

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
              Failed to load roles: {error.message}
            </p>
          ) : rolesList.length === 0 ? (
            <p className="text-center text-gray-500 py-8">
              No roles found for this school.
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
                  {sortedRoles.map((role) => (
                    <tr
                      key={role.roleId}
                      className="hover:bg-gray-50 transition-colors cursor-pointer"
                      onClick={() => handleRowClick(role.roleId)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {role.name}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {role.description || "No description"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/user/role/update/${role.roleId}`);
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

export default RoleList;
