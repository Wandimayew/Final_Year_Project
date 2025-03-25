"use client";

import React, { useState } from "react";
import axios from "axios";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Paper,
  TextField,
  InputAdornment,
  TableSortLabel,
  Box,
  Typography,
  CircularProgress,
  Pagination,
  Chip,
  IconButton,
  Card,
} from "@mui/material";
import {
  Search as SearchIcon,
  Mail as MailIcon,
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

const AttachmentPreview = styled(Box)(({ theme }) => ({
  display: "flex",
  flexWrap: "wrap",
  gap: theme.spacing(1),
  alignItems: "center",
}));

const API_BASE_URL = "http://10.194.61.74:8080/communication/api";

const fetchEmails = async ({
  schoolId,
  token,
  folder,
  page,
  pageSize,
  orderBy,
  order,
}) => {
  const validPage = isNaN(page) || page < 1 ? 1 : page;
  const response = await axios.get(
    `${API_BASE_URL}/${schoolId}/emails/${folder.toUpperCase()}`,
    {
      headers: { Authorization: `Bearer ${token}` },
      params: {
        page: validPage - 1,
        size: pageSize,
        sort: `${orderBy},${order}`,
      },
    }
  );
  return response.data;
};

const updateEmailStatus = async ({ schoolId, token, emailId, status }) => {
  const response = await axios.put(
    `${API_BASE_URL}/${schoolId}/emails/${emailId}/status`,
    { status },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return response.data;
};

const deleteEmail = async ({ schoolId, token, emailId }) => {
  const response = await axios.delete(
    `${API_BASE_URL}/${schoolId}/emails/${emailId}`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  return response.data;
};

const EmailList = ({ folder }) => {
  const { auth, loading: authLoading } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [orderBy, setOrderBy] = useState("sentAt");
  const [order, setOrder] = useState("desc");
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["emails", folder, auth?.user?.schoolId, page, orderBy, order],
    queryFn: () =>
      fetchEmails({
        schoolId: auth.user.schoolId,
        token: auth.token,
        folder,
        page,
        pageSize,
        orderBy,
        order,
      }),
    enabled: !authLoading && !!auth,
    retry: 3,
    retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 30000),
  });

  const emails = data?.data || [];
  const totalPages = data?.totalPages || 1;

  const filteredEmailsServer = emails.filter((email) => {
    const userId = auth?.user?.userId;
    const isSender = userId === email.senderId;
    const isRecipient = userId === email.recipientId;
    return (
      (isSender && !email.senderDeleted) ||
      (isRecipient && !email.recipientDeleted)
    );
  });

  const moveToTrashMutation = useMutation({
    mutationFn: ({ emailId }) =>
      updateEmailStatus({
        schoolId: auth.user.schoolId,
        token: auth.token,
        emailId,
        status: "TRASH",
      }),
    onSuccess: () =>
      queryClient.invalidateQueries(["emails", folder, auth.user.schoolId]),
    onError: (error) => console.error("Error moving to trash:", error),
    retry: 2,
    retryDelay: 1000,
  });

  const markAsImportantMutation = useMutation({
    mutationFn: ({ emailId }) =>
      updateEmailStatus({
        schoolId: auth.user.schoolId,
        token: auth.token,
        emailId,
        status: "IMPORTANT",
      }),
    onSuccess: () =>
      queryClient.invalidateQueries(["emails", folder, auth.user.schoolId]),
    onError: (error) => console.error("Error marking as important:", error),
    retry: 2,
    retryDelay: 1000,
  });

  const deleteEmailMutation = useMutation({
    mutationFn: ({ emailId }) =>
      deleteEmail({ schoolId: auth.user.schoolId, token: auth.token, emailId }),
    onSuccess: () =>
      queryClient.invalidateQueries(["emails", folder, auth.user.schoolId]),
    onError: (error) => console.error("Error deleting email:", error),
    retry: 2,
    retryDelay: 1000,
  });

  const handleSort = (property) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
    setPage(1);
  };

  const handleEmailClick = (emailId) =>
    router.push(`/communication/email/detail/${emailId}`);
  const handlePageChange = (event, newPage) =>
    setPage(isNaN(newPage) || newPage < 1 ? 1 : newPage);
  const handleMoveToTrash = (emailId) =>
    moveToTrashMutation.mutate({ emailId });
  const handleMarkAsImportant = (emailId) =>
    markAsImportantMutation.mutate({ emailId });
  const handleDeleteEmail = (emailId) => {
    if (
      confirm(
        "Are you sure you want to delete this email permanently? It may still exist for the other party."
      )
    ) {
      deleteEmailMutation.mutate({ emailId });
    }
  };

  const filteredEmails = filteredEmailsServer.filter(
    (email) =>
      email.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      email.senderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      email.recipientId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (authLoading) return <div>Loading authentication...</div>;

  return (
    <StyledCard>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <MailIcon sx={{ color: "#1976d2", mr: 1, fontSize: 32 }} />
          <Typography variant="h5" sx={{ color: "#455a64", fontWeight: 700 }}>
            {folder.charAt(0).toUpperCase() + folder.slice(1)}
          </Typography>
        </Box>
        <TextField
          placeholder="Search Emails..."
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
            width: "35%",
            "& .MuiOutlinedInput-root": {
              borderRadius: 12,
              backgroundColor: "#fafafa",
              "&:hover fieldset": { borderColor: "#42a5f5" },
              "&.Mui-focused fieldset": { borderColor: "#1976d2" },
            },
          }}
        />
      </Box>
      {isLoading ? (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
          <CircularProgress sx={{ color: "#26a69a" }} />
        </Box>
      ) : isError ? (
        <Typography sx={{ textAlign: "center", mt: 2, color: "#ef5350" }}>
          {error?.response?.data?.message ||
            `Failed to fetch ${folder} emails.`}
        </Typography>
      ) : filteredEmails.length === 0 ? (
        <Typography sx={{ textAlign: "center", mt: 2, color: "#78909c" }}>
          No emails found.
        </Typography>
      ) : (
        <>
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
                    style={{ width: "200px" }}
                  >
                    Subject
                  </TableSortLabel>
                </TableCell>
                <TableCell sx={{ color: "#455a64", fontWeight: 600 }}>
                  Preview
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
                  Status
                </TableCell>
                <TableCell sx={{ color: "#455a64", fontWeight: 600 }}>
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredEmails.map((email) => {
                const userId = auth.user.userId;
                const currentStatus =
                  userId === email.senderId
                    ? email.senderStatus
                    : email.recipientStatus;
                const isDeleted =
                  userId === email.senderId
                    ? email.senderDeleted
                    : email.recipientDeleted;
                return (
                  <StyledTableRow key={email.emailId}>
                    <TableCell onClick={() => handleEmailClick(email.emailId)}>
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <MailIcon sx={{ mr: 1, color: "#42a5f5" }} />
                        <Typography sx={{ color: "#455a64", fontWeight: 500 }}>
                          {email.senderId}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell
                      onClick={() => handleEmailClick(email.emailId)}
                      style={{ width: "200px" }}
                    >
                      <Typography
                        sx={{
                          color: "#455a64",
                          fontWeight: email.isRead ? 400 : 600,
                        }}
                      >
                        {email.subject}
                      </Typography>
                    </TableCell>
                    <TableCell onClick={() => handleEmailClick(email.emailId)}>
                      <Typography sx={{ color: "#78909c" }}>
                        {email.body.substring(0, 30)}...
                      </Typography>
                    </TableCell>
                    <TableCell onClick={() => handleEmailClick(email.emailId)}>
                      <AttachmentPreview>
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
                              }}
                            />
                          ))
                        ) : (
                          <Typography sx={{ color: "#78909c" }}>
                            None
                          </Typography>
                        )}
                      </AttachmentPreview>
                    </TableCell>
                    <TableCell onClick={() => handleEmailClick(email.emailId)}>
                      <Typography sx={{ color: "#78909c" }}>
                        {email.sentAt
                          ? new Date(email.sentAt).toLocaleString()
                          : "Not sent"}
                      </Typography>
                    </TableCell>
                    <TableCell onClick={() => handleEmailClick(email.emailId)}>
                      <Chip
                        label={currentStatus}
                        size="small"
                        sx={{
                          backgroundColor:
                            currentStatus === "TRASH" ? "#ef5350" : "#26a69a",
                          color: "#fff",
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton
                        onClick={() => handleMoveToTrash(email.emailId)}
                        disabled={
                          currentStatus === "TRASH" ||
                          isDeleted ||
                          moveToTrashMutation.isLoading
                        }
                        sx={{
                          color: "#ef5350",
                          "&:hover": { color: "#d32f2f" },
                        }}
                      >
                        {moveToTrashMutation.isLoading &&
                        moveToTrashMutation.variables?.emailId ===
                          email.emailId ? (
                          <CircularProgress
                            size={24}
                            sx={{ color: "#ef5350" }}
                          />
                        ) : (
                          <TrashIcon />
                        )}
                      </IconButton>
                      <IconButton
                        onClick={() => handleMarkAsImportant(email.emailId)}
                        disabled={
                          currentStatus === "IMPORTANT" ||
                          isDeleted ||
                          markAsImportantMutation.isLoading
                        }
                        sx={{
                          color: "#ff9800",
                          "&:hover": { color: "#f57c00" },
                        }}
                      >
                        {markAsImportantMutation.isLoading &&
                        markAsImportantMutation.variables?.emailId ===
                          email.emailId ? (
                          <CircularProgress
                            size={24}
                            sx={{ color: "#ff9800" }}
                          />
                        ) : (
                          <ImportantIcon />
                        )}
                      </IconButton>
                      <IconButton
                        onClick={() => handleDeleteEmail(email.emailId)}
                        disabled={isDeleted || deleteEmailMutation.isLoading}
                        sx={{
                          color: "#ef5350",
                          "&:hover": { color: "#d32f2f" },
                        }}
                      >
                        {deleteEmailMutation.isLoading &&
                        deleteEmailMutation.variables?.emailId ===
                          email.emailId ? (
                          <CircularProgress
                            size={24}
                            sx={{ color: "#ef5350" }}
                          />
                        ) : (
                          <DeleteIcon />
                        )}
                      </IconButton>
                    </TableCell>
                  </StyledTableRow>
                );
              })}
            </TableBody>
          </Table>
          <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
            <Pagination
              count={totalPages}
              page={page}
              onChange={handlePageChange}
              sx={{
                "& .MuiPaginationItem-root": {
                  color: "#1976d2",
                  "&.Mui-selected": {
                    backgroundColor: "#42a5f5",
                    color: "#fff",
                  },
                  "&:hover": { backgroundColor: "#bbdefb" },
                },
              }}
            />
          </Box>
        </>
      )}
    </StyledCard>
  );
};

export default EmailList;
