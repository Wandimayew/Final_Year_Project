"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  CircularProgress,
  Box,
} from "@mui/material";
import {
  useRoles,
  useRemoveRoleFromUser,
} from "@/lib/api/userManagementService/role";

const ChangeRole = ({
  open,
  onClose,
  userId,
  schoolId,
  action = "change",
  userRoles = [],
  roleIdToRemove = null,
}) => {
  const [selectedRoleId, setSelectedRoleId] = useState("");

  const {
    data: roles = [],
    isLoading: rolesLoading,
    error: rolesError,
  } = useRoles(schoolId);
  const { mutate, isPending, error: removeError } = useRemoveRoleFromUser();

  // Filter out "ROLE_USER" from the roles list for the dropdown
  const filteredRoles = roles.filter((role) => role.name !== "ROLE_USER");

  const handleSubmit = () => {
    if (action === "change") {
      if (!selectedRoleId) {
        console.error("No role selected for change action");
        return;
      }
      // Placeholder for "change" action; requires a separate endpoint
      console.log("Change role to:", selectedRoleId);
    } else if (action === "remove") {
      if (!roleIdToRemove) {
        console.error("No roleIdToRemove provided for removal");
        return;
      }
      const request = { userId, roleId: roleIdToRemove };
      mutate(
        { schoolId, request },
        {
          onSuccess: () => {
            onClose();
          },
        }
      );
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>
        {action === "change"
          ? userRoles.length === 1 && userRoles[0].name === "ROLE_USER"
            ? "Assign User Role"
            : "Change User Role"
          : "Remove User Role"}
      </DialogTitle>
      <DialogContent>
        {action === "change" ? (
          rolesLoading ? (
            <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
              <CircularProgress size={24} />
            </Box>
          ) : rolesError ? (
            <Typography variant="body2" color="error" sx={{ mt: 2 }}>
              Failed to load roles: {rolesError.message}
            </Typography>
          ) : (
            <FormControl fullWidth sx={{ mt: 2 }}>
              <InputLabel>Select Role</InputLabel>
              <Select
                value={selectedRoleId}
                onChange={(e) => setSelectedRoleId(e.target.value)}
                label="Select Role"
              >
                {filteredRoles.map((role) => (
                  <MenuItem key={role.roleId} value={role.roleId}>
                    {role.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )
        ) : (
          <Typography variant="body1" color="textSecondary" sx={{ mt: 2 }}>
            Are you sure you want to remove{" "}
            <strong>
              {roleIdToRemove
                ? roles.find((r) => r.roleId === roleIdToRemove)?.name ||
                  "this role"
                : "the specified role"}
            </strong>{" "}
            from the user?
          </Typography>
        )}
        {removeError && (
          <Typography variant="body2" color="error" sx={{ mt: 2 }}>
            Failed to remove role: {removeError.message}
          </Typography>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isPending}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          color={action === "change" ? "primary" : "error"}
          disabled={
            isPending ||
            (action === "change" && !selectedRoleId) ||
            (action === "remove" && !roleIdToRemove)
          }
        >
          {isPending ? (
            <CircularProgress size={24} />
          ) : action === "change" ? (
            "Confirm"
          ) : (
            "Confirm"
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ChangeRole;
