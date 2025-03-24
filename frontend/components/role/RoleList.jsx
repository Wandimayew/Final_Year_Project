"use client";

import React, { useState, useEffect } from "react";
import { useRoles } from "@/lib/api/userManagementService/role";
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
} from "@mui/material";
import { styled } from "@mui/system";
import { useRouter } from "next/navigation";
import { ArrowBack as ArrowBackIcon } from "@mui/icons-material";

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

const RoleList = () => {
  const { getSchoolId } = useAuthStore();
  const router = useRouter();

  // State for hydration, sorting
  const [schoolId, setSchoolId] = useState(null);
  const [isHydrated, setIsHydrated] = useState(false);
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState("asc");

  // Fetch roles using useRoles hook
  const { data: rolesList = [], isLoading, error } = useRoles(schoolId);

  // Hydrate schoolId on client-side
  useEffect(() => {
    const id = getSchoolId();
    setSchoolId(id);
    setIsHydrated(true);
    if (!id) {
      router.push("/login");
    }
  }, [getSchoolId, router]);

  // Sorting handler
  const handleSort = (field) => {
    const isAsc = sortBy === field && sortOrder === "asc";
    setSortOrder(isAsc ? "desc" : "asc");
    setSortBy(field);
  };

  // Sort roles based on sortBy and sortOrder
  const sortedRoles = [...rolesList].sort((a, b) => {
    const valueA = a[sortBy] || "";
    const valueB = b[sortBy] || "";
    if (sortOrder === "asc") {
      return valueA.localeCompare(valueB);
    }
    return valueB.localeCompare(valueA);
  });

  // Handle row click
  const handleRowClick = (roleId) => {
    console.log("Role clicked:", roleId);
    router.push(`/user/role/details/${roleId}`); // Navigate to RoleDetailsPage
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
          onClick={() => router.push("/dashboard")}
          sx={{
            bgcolor: "#1976d2",
            "&:hover": { bgcolor: "#115293" },
          }}
        >
          Back to Dashboard
        </Button>
      </Box>

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
          <Typography
            variant="h5"
            sx={{ fontWeight: 700, color: "#333", mb: 3 }}
          >
            Roles for School: {schoolId}
          </Typography>

          {isLoading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
              <CircularProgress />
            </Box>
          ) : error ? (
            <Typography color="error" align="center" sx={{ py: 4 }}>
              Failed to load roles: {error.message}
            </Typography>
          ) : rolesList.length === 0 ? (
            <Typography align="center" sx={{ py: 4, color: "#666" }}>
              No roles found for this school.
            </Typography>
          ) : (
            <TableContainer>
              <Table sx={{ minWidth: 650 }} aria-label="role table">
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
                  {sortedRoles.map((role) => (
                    <StyledTableRow
                      key={role.roleId}
                      onClick={() => handleRowClick(role.roleId)}
                    >
                      <TableCell>{role.name}</TableCell>
                      <TableCell>
                        {role.description || "No description"}
                      </TableCell>
                      <TableCell align="right">
                        <Button
                          variant="outlined"
                          size="small"
                          color="primary"
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/user/role/update/${role.roleId}`); // Updated path
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

export default RoleList;
