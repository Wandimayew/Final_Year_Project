"use client";

import React, { useState, useEffect } from "react";
import { usePermissions } from "@/lib/api/userManagementService/permission";
import { useAuthStore } from "@/lib/auth";
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  CircularProgress,
  TableSortLabel,
  Button,
  AppBar,
  Toolbar,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { styled } from "@mui/system";
import { useRouter } from "next/navigation";
import { Add as AddIcon } from "@mui/icons-material";
import SearchBar from "../constant/SearchBar";

// Styled components for enhanced UI
const StyledTableCell = styled(TableCell)(({ theme }) => ({
  fontWeight: 600,
  color: "#333",
  borderBottom: "2px solid #e0e0e0",
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  "&:hover": {
    backgroundColor: "#f5f5f5",
    cursor: "pointer",
    transition: "background-color 0.2s ease-in-out",
  },
}));

const PermissionList = () => {
  const { getSchoolId } = useAuthStore();
  const router = useRouter();

  // State for hydration, sorting, filtering, and searching
  const [schoolId, setSchoolId] = useState(null);
  const [isHydrated, setIsHydrated] = useState(false);
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState("asc");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterOperation, setFilterOperation] = useState(""); // "" means all, options: "read", "write", "delete"

  // Fetch permissions using usePermissions hook
  const {
    data: permissionsList = [],
    isLoading,
    error,
  } = usePermissions(schoolId);

  // Hydrate schoolId on client-side
  useEffect(() => {
    const id = getSchoolId();
    setSchoolId(id);
    setIsHydrated(true);
    if (!id) {
      router.push("/login"); // Redirect if no schoolId
    }
  }, [getSchoolId, router]);

  // Sorting handler
  const handleSort = (field) => {
    const isAsc = sortBy === field && sortOrder === "asc";
    setSortOrder(isAsc ? "desc" : "asc");
    setSortBy(field);
  };

  // Filter and search logic
  const filteredPermissions = permissionsList
    .filter((permission) => {
      if (filterOperation === "read") return permission.httpMethod === "GET";
      if (filterOperation === "write")
        return ["POST", "PUT"].includes(permission.httpMethod);
      if (filterOperation === "delete")
        return permission.httpMethod === "DELETE";
      return true;
    })
    .filter((permission) =>
      [permission.name, permission.description, permission.endpoint]
        .join(" ")
        .toLowerCase()
        .includes(searchQuery.toLowerCase())
    );

  // Sort filtered permissions
  const sortedPermissions = [...filteredPermissions].sort((a, b) => {
    const valueA =
      sortBy === "isActive" ? a[sortBy] : (a[sortBy] || "").toString();
    const valueB =
      sortBy === "isActive" ? b[sortBy] : (b[sortBy] || "").toString();
    if (sortOrder === "asc") {
      return sortBy === "isActive"
        ? valueA === valueB
          ? 0
          : valueA
          ? -1
          : 1
        : valueA.localeCompare(valueB);
    }
    return sortBy === "isActive"
      ? valueA === valueB
        ? 0
        : valueB
        ? -1
        : 1
      : valueB.localeCompare(valueA);
  });

  // Handle row click
  const handleRowClick = (permissionId) => {
    console.log("Permission clicked:", permissionId);
  };

  // Show nothing during SSR until hydrated
  if (!isHydrated) {
    return null; // Or a loading skeleton
  }

  if (!schoolId) {
    return null; // Redirect handled in useEffect
  }

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f5f7fa" }}>
      {/* Header */}
      <AppBar
        position="static"
        sx={{ bgcolor: "#1976d2", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
      >
        <Toolbar>
          <Box sx={{ flexGrow: 1 }} />
          <Button
            variant="contained"
            color="secondary"
            startIcon={<AddIcon />}
            onClick={() => router.push("/user/permission/create")}
            sx={{
              mr: 2,
              bgcolor: "#fff",
              color: "#1976d2",
              "&:hover": { bgcolor: "#e0e0e0" },
            }}
          >
            Add Permission
          </Button>
          <Button
            color="inherit"
            onClick={() => router.push("/dashboard")}
            sx={{
              bgcolor: "rgba(255, 255, 255, 0.15)",
              "&:hover": { bgcolor: "rgba(255, 255, 255, 0.25)" },
            }}
          >
            Back to Dashboard
          </Button>
        </Toolbar>
      </AppBar>

      {/* Main Content */}
      <Box sx={{ p: 4, maxWidth: "1200px", mx: "auto" }}>
        <Paper
          sx={{
            p: 3,
            borderRadius: 2,
            boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
            bgcolor: "white",
          }}
        >
          {/* Header with Search and Filter */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 3,
            }}
          >
            <Typography variant="h5" sx={{ fontWeight: 700, color: "#333" }}>
              Permissions for School: {schoolId}
            </Typography>
            <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
              <SearchBar
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                placeholder="Search permissions..."
                width="w-[300px]"
                additionalStyles="shadow-md"
              />
              <FormControl sx={{ minWidth: 150 }} size="small">
                <InputLabel>Filter by Operation</InputLabel>
                <Select
                  value={filterOperation}
                  onChange={(e) => setFilterOperation(e.target.value)}
                  label="Filter by Operation"
                >
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="read">Read (GET)</MenuItem>
                  <MenuItem value="write">Write (POST/PUT)</MenuItem>
                  <MenuItem value="delete">Delete (DELETE)</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </Box>

          {isLoading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
              <CircularProgress />
            </Box>
          ) : error ? (
            <Typography color="error" align="center" sx={{ py: 4 }}>
              Failed to load permissions: {error.message}
            </Typography>
          ) : sortedPermissions.length === 0 ? (
            <Typography align="center" sx={{ py: 4, color: "#666" }}>
              No permissions found matching your criteria.
            </Typography>
          ) : (
            <TableContainer>
              <Table sx={{ minWidth: 650 }} aria-label="permission table">
                <TableHead>
                  <TableRow>
                    <StyledTableCell>
                      <TableSortLabel
                        active={sortBy === "name"}
                        direction={sortBy === "name" ? sortOrder : "asc"}
                        onClick={() => handleSort("name")}
                      >
                        Name
                      </TableSortLabel>
                    </StyledTableCell>
                    <StyledTableCell>
                      <TableSortLabel
                        active={sortBy === "description"}
                        direction={sortBy === "description" ? sortOrder : "asc"}
                        onClick={() => handleSort("description")}
                      >
                        Description
                      </TableSortLabel>
                    </StyledTableCell>
                    <StyledTableCell align="right">Actions</StyledTableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {sortedPermissions.map((permission) => (
                    <StyledTableRow
                      key={permission.permissionId}
                      onClick={() => handleRowClick(permission.permissionId)}
                    >
                      <TableCell>{permission.name}</TableCell>
                      <TableCell>
                        {permission.description || "No description"}
                      </TableCell>
                      <TableCell align="right">
                        <Button
                          variant="outlined"
                          size="small"
                          color="primary"
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(
                              `/user/permission/update/${permission.permissionId}`
                            );
                          }}
                        >
                          Edit
                        </Button>
                      </TableCell>
                    </StyledTableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Paper>
      </Box>
    </Box>
  );
};

export default PermissionList;
