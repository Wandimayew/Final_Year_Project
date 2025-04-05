"use client";

import React, { useState, useEffect, memo } from "react";
import { useSchools } from "@/lib/api/tenantService/school";
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
  InputBase,
} from "@mui/material";
import { styled } from "@mui/system";
import { useRouter } from "next/navigation";
import { ArrowBack as ArrowBackIcon } from "@mui/icons-material";
import Link from "next/link";

// Styled components
const StyledTableCell = styled(TableCell)({
  fontWeight: 600,
  color: "#333",
  borderBottom: "2px solid #e0e0e0",
});

const StyledTableRow = styled(TableRow)({
  "&:hover": {
    backgroundColor: "#f5f5f5",
    cursor: "pointer",
    transition: "background-color 0.2s ease-in-out",
  },
});

const SearchInput = styled(InputBase)({
  width: "300px",
  padding: "8px 12px 8px 36px",
  borderRadius: "4px",
  border: "1px solid #e0e0e0",
  background: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' stroke='%23666' viewBox='0 0 24 24'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z'/%3E%3C/svg%3E") no-repeat 10px center`,
  backgroundSize: "20px",
});

const SchoolList = () => {
  const router = useRouter();
  const [isHydrated, setIsHydrated] = useState(false);
  const [sortBy, setSortBy] = useState("school_name");
  const [sortOrder, setSortOrder] = useState("asc");
  const [searchQuery, setSearchQuery] = useState("");

  const rawToken = useAuthStore((state) => state.token);
  const token = isHydrated ? rawToken : null;
  const { data: schoolsList = [], isLoading, error } = useSchools();

  // Hydration effect
  useEffect(() => {
    setIsHydrated(true);
    if (!token && isHydrated) router.push("/login");
  }, [token, router, isHydrated]);

  // Memoized sorting and filtering
  const sortedAndFilteredSchools = React.useMemo(() => {
    return [...schoolsList]
      .filter((school) =>
        school.school_name.toLowerCase().includes(searchQuery.toLowerCase())
      )
      .sort((a, b) => {
        const valueA = a[sortBy] || "";
        const valueB = b[sortBy] || "";
        return sortOrder === "asc"
          ? valueA.localeCompare(valueB)
          : valueB.localeCompare(valueA);
      });
  }, [schoolsList, searchQuery, sortBy, sortOrder]);

  const handleSort = (field) => {
    setSortOrder(sortBy === field && sortOrder === "asc" ? "desc" : "asc");
    setSortBy(field);
  };

  const handleRowClick = (schoolId) =>
    router.push(`/school/details/${schoolId}`);

  if (!isHydrated || !token) return null;

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f5f7fa", p: 4 }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 4 }}>
        <Button
          variant="contained"
          color="primary"
          startIcon={<ArrowBackIcon />}
          onClick={() => router.push("/dashboard")}
          sx={{ bgcolor: "#1976d2", "&:hover": { bgcolor: "#115293" } }}
        >
          Back to Dashboard
        </Button>
        <Box sx={{ display: "flex", gap: 1, color: "#666" }}>
          <Link href="/" passHref>
            <Typography sx={{ textDecoration: "none", color: "inherit" }}>
              Home
            </Typography>
          </Link>
          <Typography>-</Typography>
          <Link href="/school" passHref>
            <Typography sx={{ textDecoration: "none", color: "inherit" }}>
              Schools
            </Typography>
          </Link>
          <Typography>-</Typography>
          <Typography>School List</Typography>
        </Box>
      </Box>

      <Paper
        sx={{
          p: 3,
          borderRadius: 2,
          boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
          maxWidth: "1200px",
          mx: "auto",
        }}
      >
        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
          <Typography variant="h5" sx={{ fontWeight: 700, color: "#333" }}>
            School List
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={() => router.push("/school/createschool")}
            sx={{ bgcolor: "#1976d2", "&:hover": { bgcolor: "#115293" } }}
          >
            + Add School
          </Button>
        </Box>

        <SearchInput
          placeholder="Search School"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />

        {isLoading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Typography color="error" align="center" sx={{ py: 4 }}>
            Failed to load schools: {error.message}
          </Typography>
        ) : sortedAndFilteredSchools.length === 0 ? (
          <Typography align="center" sx={{ py: 4, color: "#666" }}>
            No schools found.
          </Typography>
        ) : (
          <TableContainer sx={{ mt: 3 }}>
            <Table sx={{ minWidth: 650 }} aria-label="school table">
              <TableHead>
                <TableRow>
                  <StyledTableCell>
                    <TableSortLabel
                      active={sortBy === "school_id"}
                      direction={sortBy === "school_id" ? sortOrder : "asc"}
                      onClick={() => handleSort("school_id")}
                    >
                      #
                    </TableSortLabel>
                  </StyledTableCell>
                  <StyledTableCell>
                    <TableSortLabel
                      active={sortBy === "school_name"}
                      direction={sortBy === "school_name" ? sortOrder : "asc"}
                      onClick={() => handleSort("school_name")}
                    >
                      Name
                    </TableSortLabel>
                  </StyledTableCell>
                  <StyledTableCell>Address</StyledTableCell>
                  <StyledTableCell>
                    <TableSortLabel
                      active={sortBy === "contact_number"}
                      direction={
                        sortBy === "contact_number" ? sortOrder : "asc"
                      }
                      onClick={() => handleSort("contact_number")}
                    >
                      Phone
                    </TableSortLabel>
                  </StyledTableCell>
                  <StyledTableCell>
                    <TableSortLabel
                      active={sortBy === "school_information"}
                      direction={
                        sortBy === "school_information" ? sortOrder : "asc"
                      }
                      onClick={() => handleSort("school_information")}
                    >
                      Info
                    </TableSortLabel>
                  </StyledTableCell>
                  <StyledTableCell>Status</StyledTableCell>
                  <StyledTableCell align="right">Actions</StyledTableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {sortedAndFilteredSchools.map((school) => (
                  <StyledTableRow
                    key={school.school_id}
                    onClick={() => handleRowClick(school.school_id)}
                  >
                    <TableCell>{school.school_id}</TableCell>
                    <TableCell>{school.school_name}</TableCell>
                    <TableCell>
                      {school.addresses?.length > 0
                        ? school.addresses.map((address, index) => (
                            <div key={index}>
                              {address.address_line}, {address.city},{" "}
                              {address.zone}, {address.region},{" "}
                              {address.country}
                            </div>
                          ))
                        : "No address available"}
                    </TableCell>
                    <TableCell>{school.contact_number}</TableCell>
                    <TableCell>
                      {school.school_information || "No info"}
                    </TableCell>
                    <TableCell>
                      <Typography
                        component="span"
                        sx={{
                          px: 1,
                          py: 0.5,
                          borderRadius: "12px",
                          bgcolor: "#e8f5e9",
                          color: "#2e7d32",
                          fontSize: "0.875rem",
                        }}
                      >
                        {school.status || "Active"}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Button
                        variant="outlined"
                        size="small"
                        color="primary"
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/schools/update/${school.school_id}`);
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
  );
};

export default memo(SchoolList);
