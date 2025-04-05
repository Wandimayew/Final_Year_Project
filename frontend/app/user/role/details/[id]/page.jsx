"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { usePermissionsByRole } from "@/lib/api/userManagementService/role";
import { useAuthStore } from "@/lib/auth";

export const dynamic = "force-dynamic";

const RoleDetailsPage = () => {
  const params = useParams();
  const roleId = params.id;
  const { getSchoolId } = useAuthStore();
  const router = useRouter();

  // State management with minimal memory footprint
  const [schoolId, setSchoolId] = useState(null);
  const [isHydrated, setIsHydrated] = useState(false);
  const [filter, setFilter] = useState({ type: "", name: "" });

  // Fetch permissions with error handling
  const { data, isLoading, isError, error } = usePermissionsByRole(
    schoolId,
    roleId
  );

  // Hydration effect with cleanup
  useEffect(() => {
    const id = getSchoolId();
    if (!id) {
      router.push("/login");
      return;
    }
    setSchoolId(id);
    setIsHydrated(true);

    return () => {
      // Cleanup if needed
    };
  }, [getSchoolId, router]);

  // Memoized filtered permissions for performance
  const filteredPermissions = useMemo(() => {
    if (!data?.permissionName) return [];
    return data.permissionName.filter((perm) => {
      const matchesType = filter.type
        ? perm.toLowerCase().includes(filter.type.toLowerCase())
        : true;
      const matchesName = filter.name
        ? perm.toLowerCase().includes(filter.name.toLowerCase())
        : true;
      return matchesType && matchesName;
    });
  }, [data?.permissionName, filter]);

  // Event handlers
  const handleBackClick = () => router.push("/user/role");
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilter((prev) => ({ ...prev, [name]: value }));
  };

  // Prevent SSR flicker
  if (!isHydrated || !schoolId) return null;

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8">
      {/* Back Button */}
      <button
        onClick={handleBackClick}
        className="mb-6 flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
      >
        <svg
          className="h-5 w-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M15 19l-7-712l7-7"
          />
        </svg>
        Back to Roles
      </button>

      {/* Main Content */}
      <div className="mx-auto max-w-3xl space-y-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
            <span className="ml-3 text-gray-600">Loading role details...</span>
          </div>
        ) : isError ? (
          <div className="rounded-md bg-red-50 p-4 text-red-700">
            Error fetching role details: {error?.message || "Unknown error"}
          </div>
        ) : (
          <>
            {/* Role Info */}
            <div className="rounded-lg bg-white p-6 shadow-sm">
              <h1 className="mb-2 text-2xl font-bold text-gray-800">
                {data?.roleName || "Unknown Role"}
              </h1>
              <p className="text-gray-600">
                <strong>School ID:</strong> {schoolId}
              </p>
              <p className="text-gray-600">
                <strong>Role ID:</strong> {roleId}
              </p>
            </div>

            {/* Permissions Section */}
            <div className="rounded-lg bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-lg font-semibold text-gray-800">
                Permissions
              </h2>

              {/* Filter Controls */}
              <div className="mb-4 flex flex-col gap-4 sm:flex-row">
                <select
                  name="type"
                  value={filter.type}
                  onChange={handleFilterChange}
                  className="rounded-md border border-gray-300 p-2 focus:border-blue-500 focus:outline-none"
                >
                  <option value="">All Types</option>
                  <option value="write">Write</option>
                  <option value="view">View</option>
                  <option value="delete">Delete</option>
                </select>
                <input
                  type="text"
                  name="name"
                  value={filter.name}
                  onChange={handleFilterChange}
                  placeholder="Filter by name..."
                  className="rounded-md border border-gray-300 p-2 focus:border-blue-500 focus:outline-none"
                />
              </div>

              {/* Permissions List */}
              {filteredPermissions.length > 0 ? (
                <ul className="space-y-2">
                  {filteredPermissions.map((perm, index) => (
                    <li
                      key={index}
                      className="rounded-md bg-gray-50 p-3 transition-colors hover:bg-gray-100"
                    >
                      {perm}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500">
                  {filter.type || filter.name
                    ? "No permissions match the filter."
                    : "No permissions assigned to this role."}
                </p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default RoleDetailsPage;
