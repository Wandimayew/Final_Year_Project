"use client";

import React, { useState, useEffect } from "react";
import { useCreateUser } from "@/lib/api/userManagementService/user";
import { useRoles } from "@/lib/api/userManagementService/role";
import {
  Typography,
  Box,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  CircularProgress,
  Paper,
  Alert,
  AppBar,
  Toolbar,
} from "@mui/material";
import { useRouter } from "next/navigation";
import { Add as AddIcon } from "@mui/icons-material";
import { useAuthStore } from "@/lib/auth";

const CreateUser = () => {
  const { getSchoolId } = useAuthStore();
  const router = useRouter();

  // State for hydration and schoolId
  const [schoolId, setSchoolId] = useState(null);
  const [isHydrated, setIsHydrated] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    roles: [],
  });
  const [errorMessage, setErrorMessage] = useState("");

  // Fetch roles and create user with schoolId
  const { data: rolesList = [], isLoading: rolesLoading } = useRoles(schoolId);
  const {
    mutate: registerUser,
    isPending: isRegistering,
    error: registerError,
  } = useCreateUser(schoolId);

  // Hydrate schoolId on client-side
  useEffect(() => {
    const id = getSchoolId();
    console.log("schoolId from auth store:", id); // Debug log
    setSchoolId(id);
    setIsHydrated(true);
  }, [getSchoolId]);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle role selection
  const handleRoleChange = (e) => {
    setFormData((prev) => ({ ...prev, roles: e.target.value }));
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMessage("");
    const payload = {
      ...formData,
      roles: formData.roles.map((role) => role.name),
    };
    console.log("Submitting payload:", payload, "with schoolId:", schoolId); // Debug log
    registerUser(payload, {
      onSuccess: () => router.push("/user"),
      onError: (error) =>
        setErrorMessage(error.message || "Failed to add user"),
    });
  };

  if (!isHydrated) {
    return null; // Avoid rendering during SSR
  }

  if (!schoolId) {
    return (
      <Box sx={{ minHeight: "100vh", bgcolor: "#f5f7fa", p: 4 }}>
        <Typography variant="body1" color="error" align="center" sx={{ mt: 4 }}>
          No school ID available. Please ensure you are associated with a
          school.
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
            Add New User
          </Typography>
          <Button
            color="inherit"
            onClick={() => router.push("/user")}
            sx={{
              bgcolor: "rgba(255, 255, 255, 0.15)",
              "&:hover": { bgcolor: "rgba(255, 255, 255, 0.25)" },
            }}
          >
            Back
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
            Create User for School: {schoolId}
          </Typography>

          {(errorMessage || registerError) && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {errorMessage || registerError?.message || "Failed to add user"}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <TextField
              label="Username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              fullWidth
              required
              sx={{ mb: 3 }}
              variant="outlined"
            />
            <TextField
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              fullWidth
              required
              sx={{ mb: 3 }}
              variant="outlined"
            />
            <TextField
              label="Password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              fullWidth
              required
              sx={{ mb: 3 }}
              variant="outlined"
            />
            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel>Roles</InputLabel>
              <Select
                multiple
                value={formData.roles}
                onChange={handleRoleChange}
                label="Roles"
                renderValue={(selected) =>
                  selected.map((role) => role.name).join(", ")
                }
                sx={{ bgcolor: "white", borderRadius: 1 }}
                disabled={rolesLoading}
              >
                {rolesLoading ? (
                  <MenuItem disabled>Loading roles...</MenuItem>
                ) : (
                  rolesList.map((role) => (
                    <MenuItem key={role.id} value={role}>
                      {role.name}
                    </MenuItem>
                  ))
                )}
              </Select>
            </FormControl>

            <Button
              type="submit"
              variant="contained"
              color="primary"
              startIcon={
                isRegistering ? (
                  <CircularProgress size={20} color="inherit" />
                ) : (
                  <AddIcon />
                )
              }
              disabled={isRegistering || rolesLoading}
              fullWidth
              sx={{ py: 1.5, fontWeight: 600, borderRadius: 1 }}
            >
              {isRegistering ? "Adding User..." : "Add User"}
            </Button>
          </form>
        </Paper>
      </Box>
    </Box>
  );
};

export default CreateUser;
