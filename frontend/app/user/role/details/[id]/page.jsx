"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { usePermissionsByRole } from "@/lib/api/userManagementService/role";
import { useAuthStore } from "@/lib/auth";
import {
  Container,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
  Alert,
  Button,
  Box,
} from "@mui/material";
import { ArrowBack as ArrowBackIcon } from "@mui/icons-material";

const RoleDetailsPage = () => {
  const params = useParams();
  const roleId = params.id;
  const { getSchoolId } = useAuthStore();
  const router = useRouter();

  // State for hydration and schoolId
  const [schoolId, setSchoolId] = useState(null);
  const [isHydrated, setIsHydrated] = useState(false);

  // Fetch permissions for the role
  const { data, isLoading, isError, error } = usePermissionsByRole(
    schoolId,
    roleId
  );

  // Hydrate schoolId on client-side
  useEffect(() => {
    const id = getSchoolId();
    setSchoolId(id);
    setIsHydrated(true);
    if (!id) {
      router.push("/login");
    }
  }, [getSchoolId, router]);

  // Handle back button click
  const handleBackClick = () => {
    router.push("/user/role"); // Updated to match your naming convention
  };

  // Prevent rendering during SSR until hydrated
  if (!isHydrated) {
    return null; // Or a loading skeleton
  }

  if (!schoolId) {
    return null; // Redirect handled in useEffect
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
      <Container maxWidth="md" sx={{ py: 8 }}>
        {isLoading ? (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "64",
            }}
          >
            <CircularProgress />
            <Typography variant="body1" sx={{ ml: 2 }}>
              Loading role details...
            </Typography>
          </Box>
        ) : isError ? (
          <Alert severity="error" sx={{ mb: 4 }}>
            Error fetching role details: {error.message}
          </Alert>
        ) : (
          <Box sx={{ spaceY: 6 }}>
            {/* Role Info Section */}
            <Paper elevation={3} sx={{ p: 6, mb: 6 }}>
              <Typography variant="h4" component="h1" gutterBottom>
                {data?.roleName || "Unknown Role"}
              </Typography>
              <Typography variant="body1" color="textSecondary">
                <strong>School ID:</strong> {schoolId}
              </Typography>
              <Typography variant="body1" color="textSecondary">
                <strong>Role ID:</strong> {roleId}
              </Typography>
            </Paper>

            {/* Permissions Section */}
            <Paper elevation={3} sx={{ p: 6 }}>
              <Typography variant="h6" gutterBottom>
                Permissions
              </Typography>
              {data?.permissionName && data.permissionName.length > 0 ? (
                <List sx={{ spaceY: 2 }}>
                  {data.permissionName.map((perm, index) => (
                    <ListItem
                      key={index}
                      sx={{
                        bgcolor: "grey.50",
                        borderRadius: 1,
                        boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                        "&:hover": { bgcolor: "grey.100" },
                        transition: "background-color 0.2s",
                      }}
                    >
                      <ListItemText primary={perm} />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography variant="body2" color="textSecondary">
                  No permissions assigned to this role.
                </Typography>
              )}
            </Paper>
          </Box>
        )}
      </Container>
    </Box>
  );
};

export default RoleDetailsPage;
