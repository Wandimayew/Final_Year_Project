"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
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
  IconButton,
} from "@mui/material";
import {
  Search as SearchIcon,
  Send as SendIcon,
  Delete as DeleteIcon,
  MoveToInbox as TrashIcon,
  Star as ImportantIcon,
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

const SentEmails = () => {
  const { auth, loading: authLoading } = useAuth();
  const [emails, setEmails] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [orderBy, setOrderBy] = useState("sentAt");
  const [order, setOrder] = useState("desc");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();

  const API_BASE_URL = "http://10.194.61.74:8080/communication/api";

  useEffect(() => {
    if (authLoading || !auth) return;
    const { userId, schoolId } = auth.user;
    const token = auth.token;

    const fetchEmails = async () => {
      setLoading(true);
      try {
        const response = await axios.get(
          `${API_BASE_URL}/${schoolId}/emails/SENT`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const fetchedEmails = response.data.data || [];
        const filteredEmails = fetchedEmails.filter(
          (email) =>
            userId === email.senderId &&
            !email.senderDeleted &&
            email.senderStatus === "SENT"
        );
        setEmails(filteredEmails);
      } catch (error) {
        setError(
          error.response?.data?.message || "Failed to fetch sent emails."
        );
      } finally {
        setLoading(false);
      }
    };
    fetchEmails();
  }, [auth, authLoading]);

  const handleSort = (property) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const handleMoveToTrash = async (emailId) => {
    const { schoolId } = auth.user;
    const token = auth.token;
    try {
      await axios.put(
        `${API_BASE_URL}/${schoolId}/emails/${emailId}/status`,
        { status: "TRASH" },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setEmails((prev) => prev.filter((email) => email.emailId !== emailId));
    } catch (error) {
      setError("Failed to move email to Trash.");
    }
  };

  const handleMarkAsImportant = async (emailId) => {
    const { schoolId } = auth.user;
    const token = auth.token;
    try {
      await axios.put(
        `${API_BASE_URL}/${schoolId}/emails/${emailId}/status`,
        { status: "IMPORTANT" },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setEmails((prev) => prev.filter((email) => email.emailId !== emailId));
    } catch (error) {
      setError("Failed to mark email as Important.");
    }
  };

  const handleDeleteEmail = async (emailId) => {
    if (
      !confirm(
        "Are you sure you want to delete this email permanently? It may still exist for the recipient."
      )
    )
      return;
    const { schoolId } = auth.user;
    const token = auth.token;
    try {
      await axios.delete(`${API_BASE_URL}/${schoolId}/emails/${emailId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEmails((prev) => prev.filter((email) => email.emailId !== emailId));
    } catch (error) {
      setError("Failed to delete email.");
    }
  };

  const sortedEmails = [...emails].sort((a, b) => {
    if (orderBy === "sentAt")
      return order === "asc"
        ? new Date(a.sentAt) - new Date(b.sentAt)
        : new Date(b.sentAt) - new Date(a.sentAt);
    return 0;
  });

  const filteredEmails = sortedEmails.filter(
    (email) =>
      email.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      email.recipientId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (authLoading) return <div>Loading authentication...</div>;

  return (
    <StyledCard>
      <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
        <SendIcon sx={{ color: "#26a69a", mr: 1, fontSize: 32 }} />
        <Typography variant="h5" sx={{ color: "#455a64", fontWeight: 700 }}>
          Sent Emails
        </Typography>
      </Box>
      <TextField
        placeholder="Search Sent Emails..."
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
      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
          <CircularProgress sx={{ color: "#26a69a" }} />
        </Box>
      ) : error ? (
        <Typography sx={{ textAlign: "center", mt: 2, color: "#ef5350" }}>
          {error}
        </Typography>
      ) : filteredEmails.length === 0 ? (
        <Typography sx={{ textAlign: "center", mt: 2, color: "#78909c" }}>
          No sent emails found.
        </Typography>
      ) : (
        <Table sx={{ minWidth: 650, backgroundColor: "transparent" }}>
          <TableHead>
            <TableRow sx={{ backgroundColor: "#e0e0e0" }}>
              <TableCell>
                <TableSortLabel
                  active={orderBy === "recipientId"}
                  direction={orderBy === "recipientId" ? order : "asc"}
                  onClick={() => handleSort("recipientId")}
                  sx={{ fontWeight: 600, color: "#455a64" }}
                >
                  Recipient
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
                  active={orderBy === "sentAt"}
                  direction={orderBy === "sentAt" ? order : "asc"}
                  onClick={() => handleSort("sentAt")}
                  sx={{ fontWeight: 600, color: "#455a64" }}
                >
                  Time
                </TableSortLabel>
              </TableCell>
              <TableCell sx={{ color: "#455a64", fontWeight: 600 }}>
                Actions
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredEmails.map((email) => (
              <StyledTableRow
                key={email.emailId}
                onClick={() =>
                  router.push(`/communication/email/detail/${email.emailId}`)
                }
              >
                <TableCell>
                  <Typography sx={{ color: "#455a64", fontWeight: 500 }}>
                    {email.recipientId}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography
                    sx={{
                      color: "#455a64",
                      fontWeight: email.isRead ? 400 : 600,
                    }}
                  >
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
                    {new Date(email.sentAt).toLocaleString()}
                  </Typography>
                </TableCell>
                <TableCell>
                  <IconButton
                    onClick={(e) => {
                      e.stopPropagation();
                      handleMoveToTrash(email.emailId);
                    }}
                    disabled={email.senderStatus === "TRASH"}
                    sx={{ color: "#ef5350", "&:hover": { color: "#d32f2f" } }}
                  >
                    <TrashIcon />
                  </IconButton>
                  <IconButton
                    onClick={(e) => {
                      e.stopPropagation();
                      handleMarkAsImportant(email.emailId);
                    }}
                    disabled={email.senderStatus === "IMPORTANT"}
                    sx={{ color: "#ff9800", "&:hover": { color: "#f57c00" } }}
                  >
                    <ImportantIcon />
                  </IconButton>
                  <IconButton
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteEmail(email.emailId);
                    }}
                    sx={{ color: "#ef5350", "&:hover": { color: "#d32f2f" } }}
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </StyledTableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </StyledCard>
  );
};

export default SentEmails;
