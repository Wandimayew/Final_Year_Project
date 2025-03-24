"use client";

import React, { useState, useEffect } from "react";
import { useRole, useUpdateRole } from "@/lib/api/userManagementService/role"; // Assume these hooks exist
import { useAuthStore } from "@/lib/auth";
import {
  Box,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Paper,
  Alert,
} from "@mui/material";
import { useRouter, useParams } from "next/navigation";
import {
  Save as SaveIcon,
  ArrowBack as ArrowBackIcon,
} from "@mui/icons-material";

const EditRole = () => {
  const { getSchoolId } = useAuthStore();
  const router = useRouter();
  const { id: roleId } = useParams(); // Get roleId from URL

  // State for form data and UI
  const [description, setDescription] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [schoolId, setSchoolId] = useState(null);
  const [isHydrated, setIsHydrated] = useState(false);

  // Fetch role details (assuming useRole hook exists)
  const {
    data: role,
    isLoading: isFetching,
    error: fetchError,
  } = useRole(schoolId, roleId);

  // Update role hook (assuming useUpdateRole exists)
  const {
    mutate: updateRole,
    isPending: isUpdating,
    error: updateError,
  } = useUpdateRole();

  // Hydrate schoolId and set initial description
  useEffect(() => {
    const id = getSchoolId();
    setSchoolId(id);
    setIsHydrated(true);
    if (!id) {
      router.push("/login");
      return;
    }
    if (role) {
      setDescription(role.description || "");
    }
  }, [getSchoolId, role, router]);

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMessage("");

    const roleRequest = {
      name: role.name, // Keep existing values
      description, // Only update description
      // Add other fields if required by your API, e.g., permissions
    };

    updateRole(
      { schoolId, roleId, roleRequest },
      {
        onSuccess: () => router.push("/user/role"),
        onError: (error) =>
          setErrorMessage(error.message || "Failed to update role"),
      }
    );
  };

  // Handle back button click
  const handleBackClick = () => {
    router.push("/user/role");
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
          Failed to load role: {fetchError.message}
        </Typography>
      </Box>
    );
  }

  if (!role) {
    return (
      <Box sx={{ minHeight: "100vh", bgcolor: "#f5f7fa", p: 4 }}>
        <Typography variant="body1" color="error" align="center" sx={{ mt: 4 }}>
          Role not found.
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f5f7fa" }}>
      {/* Back Button with Top Padding */}
      <Box sx={{ pt: 4, pl: 4 }}>
        <Button
          variant="contained"
          color="primary"
          startIcon={<ArrowBackIcon />}
          onClick={handleBackClick}
          sx={{
            bgcolor: "#1976d2",
            "&:hover": { bgcolor: "#115293" },
          }}
        >
          Back to Roles
        </Button>
      </Box>

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
            Edit Role: {role.name}
          </Typography>

          {(errorMessage || updateError) && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {errorMessage || updateError?.message || "Failed to update role"}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            {/* Display read-only fields */}
            <TextField
              label="Name"
              value={role.name}
              fullWidth
              disabled
              sx={{ mb: 3 }}
              variant="outlined"
            />
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
              helperText="Edit the description of the role"
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

export default EditRole;
