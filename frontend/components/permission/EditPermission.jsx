"use client";

import React, { useState, useEffect } from "react";
import {
  usePermission,
  useUpdatePermission,
} from "@/lib/api/userManagementService/permission";
import { useAuthStore } from "@/lib/auth";
import {
  Box,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Paper,
  Alert,
  AppBar,
  Toolbar,
} from "@mui/material";
import { useRouter, useParams } from "next/navigation";
import { Save as SaveIcon } from "@mui/icons-material";
import UserPage from "@/app/user/page";

const EditPermission = () => {
  const { getSchoolId } = useAuthStore();
  const schoolId = getSchoolId();
  const router = useRouter();
  const  permissionId  = useParams().id; // Get permissionId from URL

  // State for form data and UI
  const [description, setDescription] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isHydrated, setIsHydrated] = useState(false);

  
  // Fetch permission details
  const {
    data: permission,
    isLoading: isFetching,
    error: fetchError,
  } = usePermission(schoolId, permissionId);

  // Update permission hook
  const {
    mutate: updatePermission,
    isPending: isUpdating,
    error: updateError,
  } = useUpdatePermission();

  // Hydrate schoolId and set initial description
  useEffect(() => {
    const id = getSchoolId();
    if (!id) {
      router.push("/login");
      return;
    }
    setIsHydrated(true);
    if (permission) {
      setDescription(permission.description || "");
    }
  }, [getSchoolId, permission, router]);

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMessage("");

    const permissionRequest = {
      name: permission.name, // Keep existing values
      endpoint: permission.endpoint,
      httpMethod: permission.httpMethod,
      description, // Only update description
    };

    updatePermission(
      { schoolId, permissionId, permissionRequest },
      {
        onSuccess: () => router.push("/user/permission"),
        onError: (error) =>
          setErrorMessage(error.message || "Failed to update permission"),
      }
    );
  };

  if (!isHydrated || isFetching) {
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

  if (!schoolId) {
    return null; // Redirect handled in useEffect
  }

  if (fetchError) {
    return (
      <Box sx={{ minHeight: "100vh", bgcolor: "#f5f7fa", p: 4 }}>
        <Typography variant="body1" color="error" align="center" sx={{ mt: 4 }}>
          Failed to load permission: {fetchError.message}
        </Typography>
      </Box>
    );
  }

  if (!permission) {
    return (
      <Box sx={{ minHeight: "100vh", bgcolor: "#f5f7fa", p: 4 }}>
        <Typography variant="body1" color="error" align="center" sx={{ mt: 4 }}>
          Permission not found.
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f5f7fa" }}>
      {/* Header */}
      <AppBar
        position="static"
        sx={{ bgcolor: "#1976d2", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
      >
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 600 }}>
            Edit Permission
          </Typography>
          <Button
            color="inherit"
            onClick={() => router.push("/user/permission")}
            sx={{
              bgcolor: "rgba(255, 255, 255, 0.15)",
              "&:hover": { bgcolor: "rgba(255, 255, 255, 0.25)" },
            }}
          >
            Back to Permissions
          </Button>
        </Toolbar>
      </AppBar>

      {/* Main Content */}
      <Box sx={{ p: 4, maxWidth: "600px", mx: "auto" }}>
        <Paper
          sx={{
            p: 4,
            borderRadius: 2,
            boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
            bgcolor: "white",
          }}
        >
          <Typography
            variant="h5"
            sx={{ fontWeight: 700, color: "#333", mb: 3 }}
          >
            Edit Permission: {permission.name}
          </Typography>

          {(errorMessage || updateError) && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {errorMessage ||
                updateError?.message ||
                "Failed to update permission"}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            {/* Display read-only fields */}
            <TextField
              label="Name"
              value={permission.name}
              fullWidth
              disabled
              sx={{ mb: 3 }}
              variant="outlined"
            />
            {/* <TextField
              label="Endpoint"
              value={permission.endpoint}
              fullWidth
              disabled
              sx={{ mb: 3 }}
              variant="outlined"
            />
            <TextField
              label="HTTP Method"
              value={permission.httpMethod}
              fullWidth
              disabled
              sx={{ mb: 3 }}
              variant="outlined"
            />
            <TextField
              label="Active"
              value={permission.isActive ? "Yes" : "No"}
              fullWidth
              disabled
              sx={{ mb: 3 }}
              variant="outlined"
            /> */}

            {/* Editable Description Field */}
            <TextField
              label="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              fullWidth
              multiline
              rows={3}
              sx={{ mb: 3 }}
              variant="outlined"
              helperText="Edit the description of the permission"
            />

            <Button
              type="submit"
              variant="contained"
              color="primary"
              startIcon={
                isUpdating ? (
                  <CircularProgress size={20} color="inherit" />
                ) : (
                  <SaveIcon />
                )
              }
              disabled={isUpdating}
              fullWidth
              sx={{ py: 1.5, fontWeight: 600, borderRadius: 1 }}
            >
              {isUpdating ? "Saving..." : "Save Changes"}
            </Button>
          </form>
        </Paper>
      </Box>
    </Box>
  );
};

export default EditPermission;
