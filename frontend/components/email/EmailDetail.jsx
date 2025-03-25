"use client";

import React, { useEffect } from "react";
import axios from "axios";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import Image from "next/image";
import {
  Box,
  Typography,
  Card,
  IconButton,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  Link,
  Divider,
  Chip,
  Button,
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  Download as DownloadIcon,
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
  maxWidth: 900,
  margin: "auto",
  transition: "transform 0.3s ease, box-shadow 0.3s ease",
  "&:hover": {
    transform: "translateY(-4px)",
    boxShadow: "0 12px 32px rgba(0, 0, 0, 0.15)",
  },
}));

const API_BASE_URL = "http://10.194.61.74:8080/communication/api";

const fetchEmail = async ({ schoolId, token, emailId }) => {
  const response = await axios.get(
    `${API_BASE_URL}/${schoolId}/emails/detail/${emailId}`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  return response.data.data;
};

const markEmailAsRead = async ({ schoolId, token, emailId }) => {
  await axios.put(`${API_BASE_URL}/${schoolId}/emails/${emailId}/read`, null, {
    headers: { Authorization: `Bearer ${token}` },
  });
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

const EmailDetail = ({ emailId }) => {
  const { auth, loading: authLoading } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();

  const getCachedEmail = () => {
    const folderKeys = ["inbox", "sent", "trash", "important"].map((folder) =>
      queryClient.getQueryData(["emails", folder, auth?.user?.schoolId])
    );
    for (const folderData of folderKeys) {
      if (folderData?.data) {
        const cachedEmail = folderData.data.find((e) => e.emailId === emailId);
        if (cachedEmail) return cachedEmail;
      }
    }
    return undefined;
  };

  const {
    data: email,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["email", emailId, auth?.user?.schoolId],
    queryFn: () =>
      fetchEmail({ schoolId: auth.user.schoolId, token: auth.token, emailId }),
    enabled: !authLoading && !!auth && !!emailId,
    initialData: getCachedEmail,
    staleTime: 5 * 60 * 1000,
    retry: 3,
    retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 30000),
  });

  const markAsReadMutation = useMutation({
    mutationFn: () =>
      markEmailAsRead({
        schoolId: auth.user.schoolId,
        token: auth.token,
        emailId,
      }),
    onSuccess: () => {
      queryClient.setQueryData(
        ["email", emailId, auth.user.schoolId],
        (old) => ({ ...old, isRead: true })
      );
      queryClient.invalidateQueries(["emails"]);
    },
    onError: (err) => console.error("Error marking as read:", err),
    retry: 2,
    retryDelay: 1000,
  });

  const moveToTrashMutation = useMutation({
    mutationFn: () =>
      updateEmailStatus({
        schoolId: auth.user.schoolId,
        token: auth.token,
        emailId,
        status: "TRASH",
      }),
    onMutate: async () => {
      await queryClient.cancelQueries(["email", emailId, auth.user.schoolId]);
      const previousEmail = queryClient.getQueryData([
        "email",
        emailId,
        auth.user.schoolId,
      ]);
      const userId = auth.user.userId;
      queryClient.setQueryData(
        ["email", emailId, auth.user.schoolId],
        (old) => ({
          ...old,
          [userId === old.senderId ? "senderStatus" : "recipientStatus"]:
            "TRASH",
        })
      );
      return { previousEmail };
    },
    onError: (err, variables, context) => {
      queryClient.setQueryData(
        ["email", emailId, auth.user.schoolId],
        context.previousEmail
      );
      alert("Failed to move email to Trash.");
    },
    onSettled: () => {
      queryClient.invalidateQueries(["email", emailId, auth.user.schoolId]);
      queryClient.invalidateQueries(["emails"]);
    },
    retry: 2,
    retryDelay: 1000,
  });

  const markAsImportantMutation = useMutation({
    mutationFn: () =>
      updateEmailStatus({
        schoolId: auth.user.schoolId,
        token: auth.token,
        emailId,
        status: "IMPORTANT",
      }),
    onMutate: async () => {
      await queryClient.cancelQueries(["email", emailId, auth.user.schoolId]);
      const previousEmail = queryClient.getQueryData([
        "email",
        emailId,
        auth.user.schoolId,
      ]);
      const userId = auth.user.userId;
      queryClient.setQueryData(
        ["email", emailId, auth.user.schoolId],
        (old) => ({
          ...old,
          [userId === old.senderId ? "senderStatus" : "recipientStatus"]:
            "IMPORTANT",
        })
      );
      return { previousEmail };
    },
    onError: (err, variables, context) => {
      queryClient.setQueryData(
        ["email", emailId, auth.user.schoolId],
        context.previousEmail
      );
      alert("Failed to mark email as Important.");
    },
    onSettled: () => {
      queryClient.invalidateQueries(["email", emailId, auth.user.schoolId]);
      queryClient.invalidateQueries(["emails"]);
    },
    retry: 2,
    retryDelay: 1000,
  });

  const deleteEmailMutation = useMutation({
    mutationFn: () =>
      deleteEmail({ schoolId: auth.user.schoolId, token: auth.token, emailId }),
    onMutate: async () => {
      await queryClient.cancelQueries(["email", emailId, auth.user.schoolId]);
      const previousEmail = queryClient.getQueryData([
        "email",
        emailId,
        auth.user.schoolId,
      ]);
      const userId = auth.user.userId;
      queryClient.setQueryData(
        ["email", emailId, auth.user.schoolId],
        (old) => ({
          ...old,
          [userId === old.senderId
            ? "senderDeleted"
            : "recipientDeleted"]: true,
        })
      );
      return { previousEmail };
    },
    onError: (err, variables, context) => {
      queryClient.setQueryData(
        ["email", emailId, auth.user.schoolId],
        context.previousEmail
      );
      alert("Failed to delete email.");
    },
    onSettled: () => {
      queryClient.invalidateQueries(["email", emailId, auth.user.schoolId]);
      queryClient.invalidateQueries(["emails"]);
      router.back();
    },
    retry: 2,
    retryDelay: 1000,
  });

  useEffect(() => {
    if (
      email &&
      email.recipientId === auth?.user?.userId &&
      !email.isRead &&
      !markAsReadMutation.isLoading &&
      !markAsReadMutation.isSuccess
    ) {
      markAsReadMutation.mutate();
    }
  }, [email, auth, markAsReadMutation.isLoading, markAsReadMutation.isSuccess,markAsReadMutation]);

  const handleDownloadAttachment = async (filePath, fileName) => {
    try {
      const response = await fetch(filePath, { method: "GET" });
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download failed:", error);
      alert("Failed to download attachment.");
    }
  };

  if (authLoading) return <div>Loading authentication...</div>;
  if (isLoading)
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
        <CircularProgress sx={{ color: "#26a69a" }} />
      </Box>
    );
  if (isError)
    return (
      <Typography sx={{ textAlign: "center", mt: 4, color: "#ef5350" }}>
        {error?.response?.data?.message || "Failed to fetch email details."}
      </Typography>
    );
  if (!email)
    return (
      <Typography sx={{ textAlign: "center", mt: 4, color: "#78909c" }}>
        Email not found.
      </Typography>
    );

  const userId = auth.user.userId;
  const currentStatus =
    userId === email.senderId ? email.senderStatus : email.recipientStatus;
  const isDeleted =
    userId === email.senderId ? email.senderDeleted : email.recipientDeleted;

  return (
    <StyledCard>
      <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
        <IconButton
          onClick={() => router.back()}
          sx={{ color: "#1976d2", "&:hover": { color: "#42a5f5" } }}
        >
          <ArrowBackIcon />
        </IconButton>
        <Typography
          variant="h5"
          sx={{ ml: 1, color: "#455a64", fontWeight: 700 }}
        >
          Email Details
        </Typography>
      </Box>

      <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
        <Button
          variant="contained"
          startIcon={<TrashIcon />}
          onClick={() => moveToTrashMutation.mutate()}
          disabled={
            currentStatus === "TRASH" ||
            isDeleted ||
            moveToTrashMutation.isLoading
          }
          sx={{
            backgroundColor: "#ef5350",
            "&:hover": { backgroundColor: "#d32f2f" },
            borderRadius: 8,
            textTransform: "none",
            boxShadow: "0 4px 12px rgba(239, 83, 80, 0.3)",
          }}
        >
          {moveToTrashMutation.isLoading ? (
            <CircularProgress size={24} sx={{ color: "#fff" }} />
          ) : (
            "Move to Trash"
          )}
        </Button>
        <Button
          variant="contained"
          startIcon={<ImportantIcon />}
          onClick={() => markAsImportantMutation.mutate()}
          disabled={
            currentStatus === "IMPORTANT" ||
            isDeleted ||
            markAsImportantMutation.isLoading
          }
          sx={{
            backgroundColor: "#ff9800",
            "&:hover": { backgroundColor: "#f57c00" },
            borderRadius: 8,
            textTransform: "none",
            boxShadow: "0 4px 12px rgba(255, 152, 0, 0.3)",
          }}
        >
          {markAsImportantMutation.isLoading ? (
            <CircularProgress size={24} sx={{ color: "#fff" }} />
          ) : (
            "Mark Important"
          )}
        </Button>
        <Button
          variant="contained"
          startIcon={<DeleteIcon />}
          onClick={() => {
            if (
              confirm(
                "Are you sure you want to delete this email permanently? It may still exist for the other party."
              )
            ) {
              deleteEmailMutation.mutate();
            }
          }}
          disabled={isDeleted || deleteEmailMutation.isLoading}
          sx={{
            backgroundColor: "#ef5350",
            "&:hover": { backgroundColor: "#d32f2f" },
            borderRadius: 8,
            textTransform: "none",
            boxShadow: "0 4px 12px rgba(239, 83, 80, 0.3)",
          }}
        >
          {deleteEmailMutation.isLoading ? (
            <CircularProgress size={24} sx={{ color: "#fff" }} />
          ) : (
            "Delete"
          )}
        </Button>
      </Box>

      <Typography
        variant="h6"
        sx={{ color: "#1976d2", fontWeight: 600, mb: 2 }}
      >
        {email.subject}
      </Typography>
      <Box
        sx={{ mb: 2, backgroundColor: "#fafafa", padding: 2, borderRadius: 8 }}
      >
        <Typography sx={{ color: "#455a64" }}>
          <strong>From:</strong> {email.senderId} | <strong>To:</strong>{" "}
          {email.recipientId}
        </Typography>
        <Typography sx={{ color: "#78909c" }}>
          {email.sentAt
            ? new Date(email.sentAt).toLocaleString()
            : "Not sent yet"}
        </Typography>
        <Typography sx={{ color: "#455a64" }}>
          <strong>Status:</strong>{" "}
          <Chip
            label={currentStatus}
            size="small"
            sx={{
              backgroundColor:
                currentStatus === "TRASH" ? "#ef5350" : "#26a69a",
              color: "#fff",
            }}
          />{" "}
          | <strong>Read:</strong> {email.isRead ? "Yes" : "No"}
        </Typography>
      </Box>
      <Divider sx={{ my: 2, borderColor: "#b0bec5" }} />
      <Typography
        variant="body1"
        sx={{ color: "#455a64", whiteSpace: "pre-wrap", mb: 3 }}
      >
        {email.body}
      </Typography>
      {email.attachments && email.attachments.length > 0 && (
        <Box sx={{ mt: 3 }}>
          <Typography
            variant="subtitle1"
            sx={{ color: "#1976d2", fontWeight: 600, mb: 2 }}
          >
            Attachments
          </Typography>
          <List
            sx={{ backgroundColor: "#fafafa", borderRadius: 12, padding: 1 }}
          >
            {email.attachments.map((attachment, index) => (
              <ListItem
                key={index}
                sx={{
                  py: 1,
                  borderRadius: 8,
                  "&:hover": {
                    backgroundColor: "#e3f2fd",
                    transition: "all 0.3s ease",
                  },
                }}
              >
                <ListItemText
                  primary={
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Link
                        component="button"
                        onClick={() =>
                          handleDownloadAttachment(
                            attachment.filePath,
                            attachment.fileName
                          )
                        }
                        underline="hover"
                        sx={{ color: "#1976d2", fontWeight: 500 }}
                      >
                        {attachment.fileName}
                      </Link>
                      <Chip
                        label={`${(attachment.fileSize / 1024).toFixed(2)} KB`}
                        size="small"
                        sx={{ backgroundColor: "#bbdefb", color: "#1976d2" }}
                      />
                      {attachment.fileType?.startsWith("image") && (
                        <Image
                          src={attachment.filePath}
                          alt={attachment.fileName}
                          style={{
                            maxWidth: "100px",
                            maxHeight: "100px",
                            borderRadius: 4,
                          }}
                          loading="lazy"
                          onError={(e) => (e.target.style.display = "none")}
                        />
                      )}
                      {attachment.fileType?.startsWith("video") && (
                        <video
                          src={attachment.filePath}
                          controls
                          style={{
                            maxWidth: "200px",
                            maxHeight: "200px",
                            borderRadius: 4,
                          }}
                          loading="lazy"
                          onError={(e) => (e.target.style.display = "none")}
                        />
                      )}
                    </Box>
                  }
                  secondary={
                    <Typography sx={{ color: "#78909c" }}>
                      Type: {attachment.fileType}
                    </Typography>
                  }
                />
                <IconButton
                  edge="end"
                  onClick={() =>
                    handleDownloadAttachment(
                      attachment.filePath,
                      attachment.fileName
                    )
                  }
                  sx={{ color: "#26a69a", "&:hover": { color: "#00897b" } }}
                >
                  <DownloadIcon />
                </IconButton>
              </ListItem>
            ))}
          </List>
        </Box>
      )}
    </StyledCard>
  );
};

export default EmailDetail;
