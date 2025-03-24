"use client";

import React, { useState } from "react";
import {
  Box,
  Typography,
  Card,
  TextField,
  Switch,
  FormControlLabel,
  CircularProgress,
  IconButton,
  Tooltip,
  Collapse,
} from "@mui/material";
import { styled } from "@mui/system";
import { motion } from "framer-motion";
import {
  Error as ErrorIcon,
  ExpandMore as ExpandMoreIcon,
} from "@mui/icons-material";
import {
  usePermissions,
  useUserPermissions,
} from "@/lib/api/userManagementService/permission";
import { useAssignPermissionsToUserForRole } from "@/lib/api/userManagementService/role";
import { useQueryClient } from "@tanstack/react-query"; // Assuming React Query is used

// Styled card for permissions
const PermissionCard = styled(Card)(({ theme, assigned }) => ({
  transition: "all 0.3s ease",
  borderRadius: "12px",
  padding: "12px 16px",
  marginBottom: "8px",
  backgroundColor: assigned ? "#e3f2fd" : "#ffffff",
  boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
  "&:hover": {
    boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
    transform: "translateY(-2px)",
  },
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
}));

const ExpandIcon = styled(ExpandMoreIcon)(({ theme, open }) => ({
  transition: "transform 0.3s ease",
  transform: open ? "rotate(180deg)" : "rotate(0deg)",
}));

const PermissionAssignment = ({ userId, schoolId, roleId }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [expanded, setExpanded] = useState(true);

  const queryClient = useQueryClient(); // For invalidating/refetching queries

  // Fetch all permissions and user permissions
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

  // Mutation hook for assigning permissions
  const {
    mutate: assignPermissions,
    isPending: assignPending,
    error: assignError,
  } = useAssignPermissionsToUserForRole();

  // Filter permissions based on search query
  const filteredPermissions = allPermissions.filter((perm) =>
    perm.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Check if a permission is assigned to the user
  const isPermissionAssigned = (permName) => userPermissions.includes(permName);

  // Handle permission toggle
  const handleTogglePermission = (permName) => {
    if (!roleId) {
      console.error("No role ID provided to assign permissions");
      return;
    }

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
          // Invalidate or refetch user permissions to update UI in real-time
          queryClient.invalidateQueries(["userPermissions", schoolId, userId]);
        },
        onError: (err) =>
          console.error(
            `Failed to ${assigned ? "unassign" : "assign"} ${permName}:`,
            err
          ),
      }
    );
  };

  // Loading state
  if (permissionsLoading || userPermissionsLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  // Error state
  if (permissionsError || userPermissionsError) {
    return (
      <Typography variant="body1" color="error" align="center" sx={{ p: 4 }}>
        Failed to load permissions:{" "}
        {permissionsError?.message || userPermissionsError?.message}
      </Typography>
    );
  }

  return (
    <Box sx={{ maxWidth: "600px", mx: "auto", p: 2 }}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 2,
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 600, color: "#333" }}>
          Manage Permissions
        </Typography>
        <IconButton onClick={() => setExpanded(!expanded)}>
          <ExpandIcon open={expanded} />
        </IconButton>
      </Box>

      <Collapse in={expanded}>
        <TextField
          label="Search Permissions"
          variant="outlined"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          fullWidth
          sx={{ mb: 2, bgcolor: "#f5f7fa", borderRadius: "8px" }}
        />

        <Box sx={{ maxHeight: "400px", overflowY: "auto", pr: 1 }}>
          {filteredPermissions.length > 0 ? (
            filteredPermissions.map((perm) => {
              const assigned = isPermissionAssigned(perm.name);
              return (
                <motion.div
                  key={perm.permissionId}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <PermissionCard assigned={assigned}>
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <Typography
                        variant="body1"
                        sx={{
                          fontWeight: 500,
                          color: assigned ? "#1976d2" : "#333",
                        }}
                      >
                        {perm.name}
                      </Typography>
                      {perm.description && (
                        <Tooltip title={perm.description}>
                          <Typography
                            variant="body2"
                            sx={{ ml: 1, color: "#666" }}
                          >
                            (?)
                          </Typography>
                        </Tooltip>
                      )}
                    </Box>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={assigned}
                          onChange={() => handleTogglePermission(perm.name)}
                          disabled={assignPending}
                          color="primary"
                        />
                      }
                      label={assigned ? "Assigned" : "Not Assigned"}
                      sx={{ m: 0 }}
                    />
                  </PermissionCard>
                </motion.div>
              );
            })
          ) : (
            <Typography
              variant="body2"
              color="textSecondary"
              align="center"
              sx={{ py: 2 }}
            >
              No permissions match your search.
            </Typography>
          )}
        </Box>

        {assignError && (
          <Box
            sx={{
              mt: 2,
              display: "flex",
              alignItems: "center",
              color: "#d32f2f",
            }}
          >
            <ErrorIcon sx={{ mr: 1 }} />
            <Typography variant="body2">{assignError.message}</Typography>
          </Box>
        )}
      </Collapse>
    </Box>
  );
};

export default PermissionAssignment;
