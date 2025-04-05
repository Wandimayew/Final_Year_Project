"use client";
import React, { useState, useEffect, useMemo } from "react";
import { useUser } from "@/lib/api/userManagementService/user";
import { useRoles } from "@/lib/api/userManagementService/role";
import { useRemovePermissionFromUser } from "@/lib/api/userManagementService/user";
import { useAuthStore } from "@/lib/auth";
import { useRouter, useParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeftIcon,
  PencilIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import { motion } from "framer-motion";
import ChangeRole from "../role/ChangeRole";
import PermissionAssignment from "../permission/PermissionAssignment";

const UserDetails = () => {
  const { token } = useAuthStore(); // Destructure stable values directly
  const getSchoolId = useAuthStore((state) => state.getSchoolId); // Stable selector
  const router = useRouter();
  const { id: userId } = useParams();
  const queryClient = useQueryClient();

  const [schoolId, setSchoolId] = useState(null);
  const [isHydrated, setIsHydrated] = useState(false);
  const [changeRoleOpen, setChangeRoleOpen] = useState(false);
  const [removeRoleOpen, setRemoveRoleOpen] = useState(false);
  const [roleIdToRemove, setRoleIdToRemove] = useState(null);

  useEffect(() => {
    const id = getSchoolId();
    if (!id) {
      router.push("/login");
      return;
    }
    setSchoolId(id);
    setIsHydrated(true);
  }, [getSchoolId, router]); // Stable dependencies

  const {
    data: user,
    isLoading: isUserLoading,
    error: userError,
  } = useUser(schoolId, userId);
  const { data: roles = [], isLoading: rolesLoading } = useRoles(schoolId);
  const { mutate: removePermission, isPending: isRemovingPermission } =
    useRemovePermissionFromUser();

  const userRoleObjects = useMemo(() => {
    if (!user?.roles || rolesLoading) return [];
    return user.roles
      .map(
        (roleName) =>
          roles.find((r) => r.name === roleName) || {
            roleId: null,
            name: roleName,
          }
      )
      .filter((role) => role.roleId);
  }, [user?.roles, roles, rolesLoading]);

  const isOnlyRoleUser =
    userRoleObjects.length === 1 && userRoleObjects[0].name === "ROLE_USER";

  const handleBackClick = () => router.push("/user");
  const handleChangeRole = () => setChangeRoleOpen(true);
  const handleRemoveRole = (roleId) => {
    setRoleIdToRemove(roleId);
    setRemoveRoleOpen(true);
  };
  const handleCloseChangeRole = () => setChangeRoleOpen(false);
  const handleCloseRemoveRole = () => {
    setRemoveRoleOpen(false);
    setRoleIdToRemove(null);
  };
  const handleRemovePermission = (permissionId) => {
    if (!schoolId || !userId) return;
    removePermission(
      { schoolId, userId, permissionId },
      {
        onSuccess: () => {
          console.log(`Permission ${permissionId} removed`);
          queryClient.invalidateQueries({
            queryKey: ["users", schoolId, userId],
          });
          queryClient.invalidateQueries({
            queryKey: ["userPermissions", schoolId, userId],
          });
        },
        onError: (err) =>
          console.error("Permission removal failed:", err.message),
      }
    );
  };

  if (!isHydrated || isUserLoading || !user || rolesLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  if (!schoolId) return null;

  if (userError) {
    return (
      <div className="min-h-screen bg-gray-100 py-8 px-4">
        <p className="text-center text-lg text-red-600">
          Failed to load user: {userError.message}
        </p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6 lg:px-8"
    >
      <div className="mx-auto mb-6 max-w-3xl">
        <button
          onClick={handleBackClick}
          className="flex items-center rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
        >
          <ArrowLeftIcon className="mr-2 h-5 w-5" />
          Back to Users
        </button>
      </div>

      <div className="mx-auto max-w-3xl">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="rounded-xl bg-white p-6 shadow-lg"
        >
          <div className="mb-6 flex items-center">
            <div className="mr-4 flex h-20 w-20 items-center justify-center rounded-full bg-blue-600 text-3xl font-bold text-white">
              {user.username ? user.username[0].toUpperCase() : "?"}
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">
                {user.username || "Unknown User"}
              </h1>
              <p className="text-gray-600">
                {user.email || "No email provided"}
              </p>
            </div>
          </div>

          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {[
              { label: "User ID", value: user.userId || "N/A" },
              { label: "School ID", value: user.schoolId || "N/A" },
              {
                label: "Roles",
                value: (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {userRoleObjects.length > 0 ? (
                      userRoleObjects.map((role) => (
                        <span
                          key={role.roleId}
                          className="inline-flex items-center rounded-full bg-blue-600 px-2 py-1 text-sm text-white"
                        >
                          {role.name}
                          <button
                            onClick={() => handleRemoveRole(role.roleId)}
                            className="ml-2 text-white hover:text-red-200"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </span>
                      ))
                    ) : (
                      <p className="text-gray-600">No roles assigned</p>
                    )}
                    <button
                      onClick={handleChangeRole}
                      className="mt-2 flex items-center rounded-md border border-blue-500 px-3 py-1 text-blue-500 transition-colors hover:bg-blue-500 hover:text-white"
                    >
                      <PencilIcon className="mr-1 h-4 w-4" />
                      {isOnlyRoleUser ? "Assign Role" : "Change Role"}
                    </button>
                  </div>
                ),
              },
              {
                label: "Last Login",
                value: user.lastLogin
                  ? new Date(user.lastLogin).toLocaleString()
                  : "Never",
              },
              {
                label: "Created At",
                value: user.createdAt
                  ? new Date(user.createdAt).toLocaleString()
                  : "N/A",
              },
              {
                label: "Active",
                value:
                  user.active !== undefined
                    ? user.active
                      ? "Yes"
                      : "No"
                    : "N/A",
              },
            ].map((item, index) => (
              <div key={index} className="rounded-lg bg-blue-50 p-4">
                <p className="text-sm text-gray-500">{item.label}</p>
                <p className="font-medium text-gray-800">{item.value}</p>
              </div>
            ))}
          </div>

          {userRoleObjects.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.3 }}
              className="mt-6"
            >
              <PermissionAssignment
                userId={userId}
                schoolId={schoolId}
                roleId={userRoleObjects[0].roleId}
                onRemovePermission={handleRemovePermission}
                isRemovingPermission={isRemovingPermission}
              />
            </motion.div>
          )}
        </motion.div>
      </div>

      <ChangeRole
        open={changeRoleOpen}
        onClose={handleCloseChangeRole}
        userId={userId}
        schoolId={schoolId}
        action="change"
        userRoles={userRoleObjects}
      />
      <ChangeRole
        open={removeRoleOpen}
        onClose={handleCloseRemoveRole}
        userId={userId}
        schoolId={schoolId}
        action="remove"
        userRoles={userRoleObjects}
        roleIdToRemove={roleIdToRemove}
      />
    </motion.div>
  );
};

export default UserDetails;
