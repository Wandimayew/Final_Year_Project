"use client";

import React, { useState, useEffect } from "react";
import { useUser } from "@/lib/api/userManagementService/user";
import { useRoles } from "@/lib/api/userManagementService/role";
import { useAuthStore } from "@/lib/auth";
import {
  Box,
  Typography,
  Paper,
  Button,
  CircularProgress,
  Chip,
  Avatar,
  Grid,
  Card,
  CardContent,
} from "@mui/material";
import { useRouter, useParams } from "next/navigation";
import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";
import ChangeRole from "../role/ChangeRole";
import PermissionAssignment from "../permission/PermissionAssignment";

const UserDetails = () => {
  const { getSchoolId, token } = useAuthStore();
  const router = useRouter();
  const { id: userId } = useParams();

  const [schoolId, setSchoolId] = useState(null);
  const [isHydrated, setIsHydrated] = useState(false);
  const [changeRoleOpen, setChangeRoleOpen] = useState(false);
  const [removeRoleOpen, setRemoveRoleOpen] = useState(false);
  const [roleIdToRemove, setRoleIdToRemove] = useState(null);

  const {
    data: user,
    isLoading: isUserLoading,
    error: userError,
  } = useUser(schoolId, userId);
  const { data: roles = [], isLoading: rolesLoading } = useRoles(schoolId);

  useEffect(() => {
    const id = getSchoolId();
    setSchoolId(id);
    setIsHydrated(true);
    if (!id) router.push("/login");
  }, [getSchoolId, router]);

  // Debug: Log raw data to verify
  useEffect(() => {
    console.log("User data:", user);
    console.log("Roles data:", roles);
  }, [user, roles]);

  const userRoleObjects =
    user?.roles && !rolesLoading
      ? user.roles
          .map((roleName) => {
            const role = roles.find((r) => r.name === roleName);
            return role || { roleId: null, name: roleName }; // Use roleId to match backend
          })
          .filter((role) => role.roleId) // Only keep roles with valid roleIds
      : [];

  console.log("userRoleObjects:", userRoleObjects);

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

  if (!isHydrated || isUserLoading || !user || rolesLoading) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          bgcolor: "#f5f7fa",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!schoolId) return null;

  if (userError) {
    return (
      <Box sx={{ minHeight: "100vh", bgcolor: "#f5f7fa", p: 4 }}>
        <Typography variant="body1" color="error" align="center" sx={{ mt: 4 }}>
          Failed to load user: {userError.message}
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f5f7fa" }}>
      <Box sx={{ pt: 4, pl: 4 }}>
        <Button
          variant="contained"
          color="primary"
          startIcon={<ArrowBackIcon />}
          onClick={handleBackClick}
          sx={{ bgcolor: "#1976d2", "&:hover": { bgcolor: "#115293" } }}
        >
          Back to Users
        </Button>
      </Box>
      <Box sx={{ p: 4, maxWidth: "900px", mx: "auto" }}>
        <Paper
          sx={{
            p: 4,
            borderRadius: 3,
            boxShadow: "0 6px 24px rgba(0,0,0,0.1)",
            bgcolor: "white",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", mb: 4 }}>
            <Avatar
              sx={{
                width: 80,
                height: 80,
                bgcolor: "#1976d2",
                mr: 3,
                fontSize: 36,
              }}
            >
              {user.username ? user.username[0].toUpperCase() : "?"}
            </Avatar>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 700, color: "#333" }}>
                {user.username || "Unknown User"}
              </Typography>
              <Typography variant="subtitle1" sx={{ color: "#666" }}>
                {user.email || "No email provided"}
              </Typography>
            </Box>
          </Box>

          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6}>
              <Card sx={{ bgcolor: "#e3f2fd", borderRadius: 2 }}>
                <CardContent>
                  <Typography variant="subtitle2" color="textSecondary">
                    User ID
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {user.userId || "N/A"}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Card sx={{ bgcolor: "#e3f2fd", borderRadius: 2 }}>
                <CardContent>
                  <Typography variant="subtitle2" color="textSecondary">
                    School ID
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {user.schoolId || "N/A"}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Card sx={{ bgcolor: "#e3f2fd", borderRadius: 2 }}>
                <CardContent>
                  <Typography variant="subtitle2" color="textSecondary">
                    Roles
                  </Typography>
                  <Box
                    sx={{
                      mt: 1,
                      display: "flex",
                      flexWrap: "wrap",
                      gap: 1,
                      alignItems: "center",
                    }}
                  >
                    {userRoleObjects.length > 0 ? (
                      userRoleObjects.map((role) => (
                        <Chip
                          key={role.roleId}
                          label={role.name}
                          color="primary"
                          sx={{ mr: 1, mb: 1 }}
                          onDelete={() => handleRemoveRole(role.roleId)}
                        />
                      ))
                    ) : (
                      <Typography variant="body2" color="textSecondary">
                        No roles assigned
                      </Typography>
                    )}
                    <Button
                      variant="outlined"
                      color="primary"
                      startIcon={<EditIcon />}
                      onClick={handleChangeRole}
                      sx={{ mb: 1 }}
                    >
                      {isOnlyRoleUser ? "Assign Role" : "Change Role"}
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Card sx={{ bgcolor: "#e3f2fd", borderRadius: 2 }}>
                <CardContent>
                  <Typography variant="subtitle2" color="textSecondary">
                    Last Login
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {user.lastLogin
                      ? new Date(user.lastLogin).toLocaleString()
                      : "Never"}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Card sx={{ bgcolor: "#e3f2fd", borderRadius: 2 }}>
                <CardContent>
                  <Typography variant="subtitle2" color="textSecondary">
                    Created At
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {user.createdAt
                      ? new Date(user.createdAt).toLocaleString()
                      : "N/A"}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Card sx={{ bgcolor: "#e3f2fd", borderRadius: 2 }}>
                <CardContent>
                  <Typography variant="subtitle2" color="textSecondary">
                    Active
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {user.active !== undefined
                      ? user.active
                        ? "Yes"
                        : "No"
                      : "N/A"}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Permission Assignment Component */}
          {userRoleObjects.length > 0 && (
            <PermissionAssignment
              userId={userId}
              schoolId={schoolId}
              roleId={userRoleObjects[0].roleId}
            />
          )}
        </Paper>
      </Box>
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
    </Box>
  );
};

export default UserDetails;
