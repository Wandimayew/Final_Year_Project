"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/lib/auth";
import axios from "axios";
import {
  Typography,
  Box,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";

// API service to fetch all users' login activity for a specific schoolId
const fetchAllLoginActivity = async (schoolId) => {
  const response = await axios.get(
    `http://localhost:8085/auth/api/${schoolId}/activity`,
    {
      headers: {
        Authorization: `Bearer ${useAuthStore.getState().token}`,
      },
    }
  );
  return response.data; // Expecting { status, message, activities }
};

const UserActivity = ({ schoolId: overrideSchoolId } = {}) => {
  // Get user data from auth store
  const { getRoles, getSchoolId } = useAuthStore();
  const roles = getRoles();
  const defaultSchoolId = getSchoolId(); // School ID from logged-in user

  // Use overrideSchoolId if provided, otherwise fall back to defaultSchoolId
  const schoolId = overrideSchoolId || defaultSchoolId;

  // Check if user has admin or superadmin role
  const hasRequiredRole = roles.some((role) =>
    ["ROLE_ADMIN", "ROLE_SUPERADMIN"].includes(role)
  );

  // Fetch all login activity using React Query
  const {
    data: response,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["allLoginActivity", schoolId],
    queryFn: () => fetchAllLoginActivity(schoolId),
    enabled: hasRequiredRole && !!schoolId, // Only fetch if authorized and schoolId exists
  });

  const activities = response?.activities || []; // Extract activities from response

  if (!hasRequiredRole) {
    return (
      <Typography variant="body1" color="error" align="center">
        Access denied. This page is restricted to Admins and Superadmins only.
      </Typography>
    );
  }

  if (!schoolId) {
    return (
      <Typography variant="body1" color="error" align="center">
        No school ID available. Please ensure you are associated with a school.
      </Typography>
    );
  }

  return (
    <Box sx={{ p: 3, maxWidth: "800px", mx: "auto" }}>
      <Typography variant="h5" gutterBottom>
        User Login Activity for School: {schoolId}
      </Typography>

      {isLoading ? (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
          <CircularProgress size={24} />
        </Box>
      ) : error ? (
        <Typography color="error" align="center">
          Unable to load activity: {error.message}
        </Typography>
      ) : activities.length > 0 ? (
        <List>
          {activities.slice(0, 10).map((activity) => (
            <ListItem key={activity.userId} divider>
              <ListItemText
                primary={`${activity.username} (${activity.schoolId})`}
                secondary={
                  activity.lastLogin
                    ? `Last Login: ${new Date(
                        activity.lastLogin
                      ).toLocaleString()}`
                    : "Never logged in"
                }
              />
            </ListItem>
          ))}
        </List>
      ) : (
        <Typography color="textSecondary" align="center">
          No recent login activity found for this school.
        </Typography>
      )}
    </Box>
  );
};

export default UserActivity;
