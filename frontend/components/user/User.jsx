"use client";

import React, { useState, useEffect } from "react";
import { useUsers } from "@/lib/api/userManagementService/user";
import { useAuthStore } from "@/lib/auth";
import {
  Typography,
  Box,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  AppBar,
  Toolbar,
  IconButton,
  Tooltip,
  Button,
} from "@mui/material";
import { useRouter } from "next/navigation";
import Link from "next/link";
import SearchBar from "../constant/SearchBar";
import {
  Refresh as RefreshIcon,
  Add as AddIcon,
  Visibility as VisibilityIcon,
} from "@mui/icons-material";

const User = ({ schoolId: overrideSchoolId } = {}) => {
  const { getRoles, getSchoolId } = useAuthStore();
  const router = useRouter();
  const roles = getRoles();
  const defaultSchoolId = getSchoolId();
  const schoolId = overrideSchoolId || defaultSchoolId;

  const hasRequiredRole = roles.some((role) =>
    ["ROLE_ADMIN", "ROLE_SUPERADMIN"].includes(role)
  );

  const { data: users = [], isLoading, error, refetch } = useUsers(schoolId);

  const [roleFilter, setRoleFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const [isHydrated, setIsHydrated] = useState(false);
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  const filteredUsers = users.filter((user) => {
    const matchesRole = roleFilter === "all" || user.roles.includes(roleFilter);
    const matchesSearch = user.username
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    return matchesRole && matchesSearch;
  });

  const handleViewClick = (userId) => {
    console.log("Navigating to userId:", userId);
    router.push(`/user/detail/${userId}`);
  };

  // Consistent SSR fallback
  if (!schoolId || !hasRequiredRole || !isHydrated) {
    return (
      <Box sx={{ minHeight: "100vh", bgcolor: "#f5f7fa" }}>
        <AppBar
          position="static"
          sx={{ bgcolor: "#1976d2", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
        >
          <Toolbar>
            <Box sx={{ flexGrow: 1 }} />
          </Toolbar>
        </AppBar>
        <Box sx={{ p: 4, maxWidth: "1200px", mx: "auto" }}>
          {!schoolId ? (
            <Typography
              variant="body1"
              color="error"
              align="center"
              sx={{ mt: 4 }}
            >
              No school ID available. Please ensure you are associated with a
              school.
            </Typography>
          ) : !hasRequiredRole ? (
            <Typography
              variant="body1"
              color="error"
              align="center"
              sx={{ mt: 4 }}
            >
              Access denied. This page is restricted to Admins and Superadmins
              only.
            </Typography>
          ) : null}
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f5f7fa" }}>
      <AppBar
        position="static"
        sx={{ bgcolor: "#1976d2", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
      >
        <Toolbar>
          <Box sx={{ flexGrow: 1 }} />
          <Tooltip title="Add New User">
            <Button
              component={Link}
              href="/user/create"
              color="inherit"
              startIcon={<AddIcon />}
              sx={{
                mr: 1,
                bgcolor: "rgba(255, 255, 255, 0.15)",
                "&:hover": { bgcolor: "rgba(255, 255, 255, 0.25)" },
              }}
            >
              Add User
            </Button>
          </Tooltip>
          <Tooltip title="Refresh Data">
            <IconButton color="inherit" onClick={() => refetch()}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Toolbar>
      </AppBar>
      <Box sx={{ p: 4, maxWidth: "1200px", mx: "auto" }}>
        {isLoading ? (
          <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
            <CircularProgress size={40} />
          </Box>
        ) : error ? (
          <Typography color="error" align="center" sx={{ mt: 4 }}>
            Unable to load users: {error.message}
          </Typography>
        ) : (
          <>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 3,
              }}
            >
              <Typography variant="h5" sx={{ fontWeight: 700, color: "#333" }}>
                Users in School: {schoolId}
              </Typography>
              <Box sx={{ display: "flex", gap: 2 }}>
                <FormControl sx={{ minWidth: 150 }}>
                  <InputLabel>Filter by Role</InputLabel>
                  <Select
                    value={roleFilter}
                    label="Filter by Role"
                    onChange={(e) => setRoleFilter(e.target.value)}
                    sx={{ bgcolor: "white", borderRadius: 1 }}
                  >
                    <MenuItem value="all">All Roles</MenuItem>
                    <MenuItem value="ROLE_USER">User</MenuItem>
                    <MenuItem value="ROLE_ADMIN">Admin</MenuItem>
                    <MenuItem value="ROLE_SUPERADMIN">Superadmin</MenuItem>
                  </Select>
                </FormControl>
                <SearchBar
                  searchQuery={searchQuery}
                  setSearchQuery={setSearchQuery}
                  placeholder="Search by username..."
                  width="w-[250px]"
                  additionalStyles="shadow-md"
                />
              </Box>
            </Box>

            {filteredUsers.length > 0 ? (
              <TableContainer
                component={Paper}
                sx={{
                  borderRadius: 2,
                  boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
                  overflow: "hidden",
                }}
              >
                <Table>
                  <TableHead>
                    <TableRow sx={{ bgcolor: "#e3f2fd" }}>
                      <TableCell>
                        <Typography variant="subtitle2" fontWeight={600}>
                          Username
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="subtitle2" fontWeight={600}>
                          Email
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="subtitle2" fontWeight={600}>
                          School ID
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="subtitle2" fontWeight={600}>
                          Roles
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="subtitle2" fontWeight={600}>
                          Last Login
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="subtitle2" fontWeight={600}>
                          Created At
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="subtitle2" fontWeight={600}>
                          Active
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="subtitle2" fontWeight={600}>
                          Actions
                        </Typography>
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredUsers.map((user) => (
                      <TableRow
                        key={user.userId}
                        hover
                        sx={{
                          "&:hover": { bgcolor: "#f9fafb" },
                          transition: "background-color 0.2s",
                        }}
                      >
                        <TableCell>{user.username}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>{user.schoolId}</TableCell>
                        <TableCell>{user.roles.join(", ")}</TableCell>
                        <TableCell>
                          {user.lastLogin
                            ? new Date(user.lastLogin).toLocaleString()
                            : "Never"}
                        </TableCell>
                        <TableCell>
                          {new Date(user.createdAt).toLocaleString()}
                        </TableCell>
                        <TableCell>{user.active ? "Yes" : "No"}</TableCell>
                        <TableCell>
                          <Tooltip title="View Details">
                            <IconButton
                              color="primary"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleViewClick(user.userId);
                              }}
                            >
                              <VisibilityIcon />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Typography
                color="textSecondary"
                align="center"
                sx={{ mt: 4, fontStyle: "italic" }}
              >
                No users found matching your criteria.
              </Typography>
            )}
          </>
        )}
      </Box>
    </Box>
  );
};

export default User;
