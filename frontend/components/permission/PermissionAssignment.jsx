"use client";

import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  usePermissions,
  useUserPermissions,
} from "@/lib/api/userManagementService/permission";
import { useAssignPermissionsToUserForRole } from "@/lib/api/userManagementService/role";
import { useQueryClient } from "@tanstack/react-query";
import { TrashIcon } from "lucide-react";

const PermissionAssignment = ({
  userId,
  schoolId,
  roleId,
  onRemovePermission,
  isRemovingPermission,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [expanded, setExpanded] = useState(true);
  const queryClient = useQueryClient();

  const {
    data: allPermissions = [],
    isLoading: permissionsLoading,
    error: permissionsError,
  } = usePermissions(schoolId);
  const {
    data: userPermissions = [],
    isLoading: userPermissionsLoading,
    error: userPermissionsError,
  } = useUserPermissions(schoolId, userId);
  const {
    mutate: assignPermissions,
    isPending: assignPending,
    error: assignError,
  } = useAssignPermissionsToUserForRole();

  const filteredPermissions = useMemo(
    () =>
      allPermissions.filter((perm) =>
        perm.name.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    [allPermissions, searchQuery]
  );

  const isPermissionAssigned = (permName) => userPermissions.includes(permName);

  const handleTogglePermission = (permName) => {
    if (!roleId) return;
    const assigned = isPermissionAssigned(permName);
    const permission = allPermissions.find((p) => p.name === permName);
    if (!permission) return;

    const request = {
      userId,
      roleId,
      permissionIds: assigned
        ? userPermissions
            .filter((p) => p !== permName)
            .map(
              (p) => allPermissions.find((ap) => ap.name === p)?.permissionId
            )
        : [...userPermissions, permName].map(
            (p) => allPermissions.find((ap) => ap.name === p)?.permissionId
          ),
    };

    assignPermissions(
      { schoolId, request },
      {
        onSuccess: () => {
          console.log(`${assigned ? "Unassigned" : "Assigned"} ${permName}`);
          queryClient.invalidateQueries({
            queryKey: ["userPermissions", schoolId, userId],
          });
          queryClient.invalidateQueries({
            queryKey: ["users", schoolId, userId],
          });
        },
        onError: (err) =>
          console.error(
            `Failed to ${assigned ? "unassign" : "assign"} ${permName}:`,
            err.message
          ),
      }
    );
  };

  const handleRemove = (permName) => {
    const permission = allPermissions.find((p) => p.name === permName);
    if (permission) onRemovePermission(permission.permissionId);
  };

  if (permissionsLoading || userPermissionsLoading) {
    return (
      <div className="flex justify-center p-4">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  if (permissionsError || userPermissionsError) {
    return (
      <p className="p-4 text-center text-red-600">
        Failed to load permissions:{" "}
        {permissionsError?.message || userPermissionsError?.message}
      </p>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-lg mx-auto p-2"
    >
      <div className="mb-2 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-800">
          Manage Permissions
        </h2>
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-gray-500 hover:text-gray-700"
        >
          <svg
            className={`h-6 w-6 transition-transform ${
              expanded ? "rotate-180" : ""
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>
      </div>

      {expanded && (
        <div className="space-y-4">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search Permissions"
            className="w-full rounded-md border border-gray-300 p-2 focus:border-blue-500 focus:outline-none"
          />

          <div className="max-h-96 overflow-y-auto pr-1">
            {filteredPermissions.length > 0 ? (
              filteredPermissions.map((perm) => {
                const assigned = isPermissionAssigned(perm.name);
                return (
                  <motion.div
                    key={perm.permissionId}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    className={`mb-2 flex items-center justify-between rounded-lg p-3 transition-all ${
                      assigned ? "bg-blue-50" : "bg-white"
                    } shadow-sm hover:shadow-md`}
                  >
                    <div className="flex items-center">
                      <span
                        className={`font-medium ${
                          assigned ? "text-blue-600" : "text-gray-800"
                        }`}
                      >
                        {perm.name}
                      </span>
                      {perm.description && (
                        <span
                          className="ml-2 text-sm text-gray-500"
                          title={perm.description}
                        >
                          (?)
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={assigned}
                          onChange={() => handleTogglePermission(perm.name)}
                          disabled={assignPending || isRemovingPermission}
                          className="h-5 w-5 text-blue-600"
                        />
                        <span className="ml-2 text-sm text-gray-600">
                          {assigned ? "Assigned" : "Not Assigned"}
                        </span>
                      </label>
                      {assigned && (
                        <button
                          onClick={() => handleRemove(perm.name)}
                          disabled={isRemovingPermission}
                          className="text-red-500 hover:text-red-700"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      )}
                    </div>
                  </motion.div>
                );
              })
            ) : (
              <p className="py-2 text-center text-gray-500">
                No permissions match your search.
              </p>
            )}
          </div>

          {assignError && (
            <p className="mt-2 flex items-center text-red-600">
              <svg
                className="mr-1 h-5 w-5"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
                  clipRule="evenodd"
                />
              </svg>
              {assignError.message}
            </p>
          )}
        </div>
      )}
    </motion.div>
  );
};

export default PermissionAssignment;
