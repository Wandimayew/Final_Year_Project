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
  Warning as WarningIcon,
  MoveToInbox as TrashIcon,
  StarBorder as RemoveImportantIcon,
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

const API_BASE_URL = "http://localhost:8086/communication/api";

const fetchImportantEmails = async ({ schoolId, token }) => {
  const response = await axios.get(
    `${API_BASE_URL}/${schoolId}/emails/IMPORTANT`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  return response.data.data || [];
};

const updateEmailStatus = async ({ schoolId, token, emailId, status }) => {
  const response = await axios.put(
    `${API_BASE_URL}/${schoolId}/emails/${emailId}/status`,
    { status },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return response.data;
};

const ImportantEmails = () => {
  const { auth, loading: authLoading } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [orderBy, setOrderBy] = useState("sentAt");
  const [order, setOrder] = useState("desc");
  const router = useRouter();
  const queryClient = useQueryClient();

  const {
    data: emails = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["importantEmails", auth?.user?.schoolId],
    queryFn: () =>
      fetchImportantEmails({ schoolId: auth.user.schoolId, token: auth.token }),
    enabled: !authLoading && !!auth,
    select: (data) => {
      const userId = auth.user.userId;
      return data.filter((email) => {
        const isSender = userId === email.senderId;
        const isRecipient = userId === email.recipientId;
        return (
          (isSender &&
            email.senderStatus === "IMPORTANT" &&
            !email.senderDeleted) ||
          (isRecipient &&
            email.recipientStatus === "IMPORTANT" &&
            !email.recipientDeleted)
        );
      });
    },
  });

  const moveToTrashMutation = useMutation({
    mutationFn: ({ emailId }) =>
      updateEmailStatus({
        schoolId: auth.user.schoolId,
        token: auth.token,
        emailId,
        status: "TRASH",
      }),
    onMutate: async ({ emailId }) => {
      await queryClient.cancelQueries(["importantEmails", auth.user.schoolId]);
      const previousEmails = queryClient.getQueryData([
        "importantEmails",
        auth.user.schoolId,
      ]);
      const userId = auth.user.userId;
      queryClient.setQueryData(["importantEmails", auth.user.schoolId], (old) =>
        old.map((email) =>
          email.emailId === emailId
            ? {
                ...email,
                [userId === email.senderId
                  ? "senderStatus"
                  : "recipientStatus"]: "TRASH",
              }
            : email
        )
      );
      return { previousEmails };
    },
    onError: (err, { emailId }, context) => {
      queryClient.setQueryData(
        ["importantEmails", auth.user.schoolId],
        context.previousEmails
      );
    },
    onSettled: () => {
      queryClient.invalidateQueries(["importantEmails", auth.user.schoolId]);
      queryClient.invalidateQueries(["emails"]);
    },
  });

  const removeFromImportantMutation = useMutation({
    mutationFn: ({ emailId, newStatus }) =>
      updateEmailStatus({
        schoolId: auth.user.schoolId,
        token: auth.token,
        emailId,
        status: newStatus,
      }),
    onMutate: async ({ emailId }) => {
      await queryClient.cancelQueries(["importantEmails", auth.user.schoolId]);
      const previousEmails = queryClient.getQueryData([
        "importantEmails",
        auth.user.schoolId,
      ]);
      queryClient.setQueryData(["importantEmails", auth.user.schoolId], (old) =>
        old.filter((email) => email.emailId !== emailId)
      );
      return { previousEmails };
    },
    onError: (err, { emailId }, context) => {
      queryClient.setQueryData(
        ["importantEmails", auth.user.schoolId],
        context.previousEmails
      );
    },
    onSettled: () => {
      queryClient.invalidateQueries(["importantEmails", auth.user.schoolId]);
      queryClient.invalidateQueries(["emails"]);
    },
  });

  const handleSort = (property) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const handleMoveToTrash = (emailId) =>
    moveToTrashMutation.mutate({ emailId });

  const handleRemoveFromImportant = (emailId) => {
    const email = emails.find((e) => e.emailId === emailId);
    if (!email) return;
    const userId = auth.user.userId;
    const newStatus = userId === email.senderId ? "SENT" : "INBOX";
    removeFromImportantMutation.mutate({ emailId, newStatus });
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
      email.senderId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (authLoading) return <div>Loading authentication...</div>;

  return (
    <StyledCard>
      <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
        <WarningIcon sx={{ color: "#ff9800", mr: 1, fontSize: 32 }} />
        <Typography variant="h5" sx={{ color: "#455a64", fontWeight: 700 }}>
          Important Emails
        </Typography>
      </Box>
      <TextField
        placeholder="Search Important Emails..."
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
          {error?.response?.data?.message ||
            "Failed to fetch important emails."}
        </Typography>
      ) : filteredEmails.length === 0 ? (
        <Typography sx={{ textAlign: "center", mt: 2, color: "#78909c" }}>
          No important emails found.
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
                <StyledTableRow
                  key={email.emailId}
                  onClick={() =>
                    router.push(`/communication/email/detail/${email.emailId}`)
                  }
                >
                  <TableCell>
                    <Typography sx={{ color: "#455a64", fontWeight: 500 }}>
                      {email.senderId}
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
                      disabled={
                        currentStatus === "TRASH" ||
                        isDeleted ||
                        moveToTrashMutation.isLoading
                      }
                      sx={{ color: "#ef5350", "&:hover": { color: "#d32f2f" } }}
                    >
                      {moveToTrashMutation.isLoading &&
                      moveToTrashMutation.variables?.emailId ===
                        email.emailId ? (
                        <CircularProgress size={24} sx={{ color: "#ef5350" }} />
                      ) : (
                        <TrashIcon />
                      )}
                    </IconButton>
                    <IconButton
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveFromImportant(email.emailId);
                      }}
                      disabled={
                        isDeleted || removeFromImportantMutation.isLoading
                      }
                      sx={{ color: "#1976d2", "&:hover": { color: "#1565c0" } }}
                    >
                      {removeFromImportantMutation.isLoading &&
                      removeFromImportantMutation.variables?.emailId ===
                        email.emailId ? (
                        <CircularProgress size={24} sx={{ color: "#1976d2" }} />
                      ) : (
                        <RemoveImportantIcon />
                      )}
                    </IconButton>
                  </TableCell>
                </StyledTableRow>
              );
            })}
          </TableBody>
        </Table>
      )}
    </StyledCard>
  );
};

export default ImportantEmails;
