"use client";

import React, { useState } from "react";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Card,
  TextField,
  InputAdornment,
  TableSortLabel,
  Box,
  CircularProgress,
  Typography,
  Chip,
} from "@mui/material";
import {
  Search as SearchIcon,
  Drafts as DraftsIcon,
} from "@mui/icons-material";
import { styled } from "@mui/material/styles";
import { useRouter } from "next/navigation";

const StyledCard = styled(Card)(({ theme }) => ({
  padding: theme.spacing(3),
  marginLeft: 260,
  marginTop: theme.spacing(2),
  borderRadius: 16,
  background: "linear-gradient(135deg, #ffffff 0%, #eceff1 100%)",
  boxShadow: "0 8px 24px rgba(0, 0, 0, 0.1)",
  transition: "transform 0.3s ease, box-shadow 0.3s ease",
  "&:hover": {
    transform: "translateY(-4px)",
    boxShadow: "0 12px 32px rgba(0, 0, 0, 0.15)",
  },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  "&:hover": {
    backgroundColor: "#e3f2fd",
    transform: "scale(1.01)",
    transition: "all 0.3s ease",
  },
  borderBottom: "1px solid #cfd8dc",
  backgroundColor: "#fff",
}));

const fetchDraftEmails = async ({ schoolId, token }) => {
  const response = await axios.get(
    `http://localhost:8084/communication/api/${schoolId}/emails/DRAFT`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  return response.data.data || [];
};

const DraftEmails = () => {
  const { auth, loading: authLoading } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [orderBy, setOrderBy] = useState("updatedAt");
  const [order, setOrder] = useState("desc");
  const router = useRouter();

  const {
    data: emails = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["draftEmails", auth?.user?.schoolId],
    queryFn: () =>
      fetchDraftEmails({ schoolId: auth.user.schoolId, token: auth.token }),
    enabled: !authLoading && !!auth,
  });

  const handleSort = (property) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const sortedEmails = [...emails].sort((a, b) => {
    if (orderBy === "updatedAt")
      return order === "asc"
        ? new Date(a.updatedAt) - new Date(b.updatedAt)
        : new Date(b.updatedAt) - new Date(a.updatedAt);
    return 0;
  });

  const filteredEmails = sortedEmails.filter(
    (email) =>
      email.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      email.senderId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (authLoading) return <div>Loading authentication...</div>;

  return (
    <StyledCard>
      <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
        <DraftsIcon sx={{ color: "#1976d2", mr: 1, fontSize: 32 }} />
        <Typography variant="h5" sx={{ color: "#455a64", fontWeight: 700 }}>
          Draft Emails
        </Typography>
      </Box>
      <TextField
        placeholder="Search Draft Emails..."
        variant="outlined"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon sx={{ color: "#78909c" }} />
            </InputAdornment>
          ),
        }}
        sx={{
          mb: 2,
          width: "100%",
          "& .MuiOutlinedInput-root": {
            borderRadius: 12,
            backgroundColor: "#fafafa",
            "&:hover fieldset": { borderColor: "#42a5f5" },
            "&.Mui-focused fieldset": { borderColor: "#1976d2" },
          },
        }}
      />
      {isLoading ? (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
          <CircularProgress sx={{ color: "#26a69a" }} />
        </Box>
      ) : isError ? (
        <Typography sx={{ textAlign: "center", mt: 2, color: "#ef5350" }}>
          {error?.response?.data?.message || "Failed to fetch draft emails."}
        </Typography>
      ) : filteredEmails.length === 0 ? (
        <Typography sx={{ textAlign: "center", mt: 2, color: "#78909c" }}>
          No draft emails found.
        </Typography>
      ) : (
        <Table sx={{ minWidth: 650, backgroundColor: "transparent" }}>
          <TableHead>
            <TableRow sx={{ backgroundColor: "#e0e0e0" }}>
              <TableCell>
                <TableSortLabel
                  active={orderBy === "senderId"}
                  direction={orderBy === "senderId" ? order : "asc"}
                  onClick={() => handleSort("senderId")}
                  sx={{ fontWeight: 600, color: "#455a64" }}
                >
                  Sender
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={orderBy === "subject"}
                  direction={orderBy === "subject" ? order : "asc"}
                  onClick={() => handleSort("subject")}
                  sx={{ fontWeight: 600, color: "#455a64" }}
                >
                  Subject
                </TableSortLabel>
              </TableCell>
              <TableCell sx={{ color: "#455a64", fontWeight: 600 }}>
                Message
              </TableCell>
              <TableCell sx={{ color: "#455a64", fontWeight: 600 }}>
                Attachments
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={orderBy === "updatedAt"}
                  direction={orderBy === "updatedAt" ? order : "asc"}
                  onClick={() => handleSort("updatedAt")}
                  sx={{ fontWeight: 600, color: "#455a64" }}
                >
                  Last Updated
                </TableSortLabel>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredEmails.map((email) => (
              <StyledTableRow
                key={email.emailId}
                onClick={() =>
                  router.push(
                    `/communication/email/compose?draftId=${email.emailId}`
                  )
                }
              >
                <TableCell>
                  <Typography sx={{ color: "#455a64", fontWeight: 500 }}>
                    {email.senderId}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography sx={{ color: "#455a64", fontWeight: 600 }}>
                    {email.subject}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography sx={{ color: "#78909c" }}>
                    {email.body.substring(0, 30)}...
                  </Typography>
                </TableCell>
                <TableCell>
                  {email.attachments && email.attachments.length > 0 ? (
                    email.attachments.map((att, idx) => (
                      <Chip
                        key={idx}
                        label={att.fileName}
                        size="small"
                        sx={{
                          backgroundColor: "#bbdefb",
                          color: "#1976d2",
                          "&:hover": { backgroundColor: "#90caf9" },
                          mr: 0.5,
                          mb: 0.5,
                        }}
                      />
                    ))
                  ) : (
                    <Typography sx={{ color: "#78909c" }}>None</Typography>
                  )}
                </TableCell>
                <TableCell>
                  <Typography sx={{ color: "#78909c" }}>
                    {new Date(email.updatedAt).toLocaleString()}
                  </Typography>
                </TableCell>
              </StyledTableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </StyledCard>
  );
};

export default DraftEmails;
