"use client";

import React, { useState } from "react";
import axios from "axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import {
  TextField,
  Button,
  Card,
  Typography,
  Box,
  CircularProgress,
  IconButton,
  Input,
  Chip,
} from "@mui/material";
import {
  Send as SendIcon,
  Save as SaveIcon,
  Close as CloseIcon,
  AttachFile as AttachFileIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";
import { styled } from "@mui/material/styles";
import { useRouter } from "next/navigation";

const StyledCard = styled(Card)(({ theme }) => ({
  padding: theme.spacing(4),
  marginLeft: { xs: 0, md: 260 }, // Adjust margin for mobile
  marginTop: theme.spacing(2),
  borderRadius: 16,
  background: "linear-gradient(135deg, #ffffff 0%, #eceff1 100%)",
  boxShadow: "0 8px 24px rgba(0, 0, 0, 0.1)",
  maxWidth: { xs: "100%", sm: 800, md: 1000 }, // Responsive width
  margin: "auto",
  transition: "transform 0.3s ease, box-shadow 0.3s ease",
  "&:hover": {
    transform: "translateY(-4px)",
    boxShadow: "0 12px 32px rgba(0, 0, 0, 0.15)",
  },
  [theme.breakpoints.down("sm")]: {
    padding: theme.spacing(2), // Reduce padding on mobile
    borderRadius: 12,
  },
}));

const sendOrSaveEmail = async ({ schoolId, token, emailData, send }) => {
  const formData = new FormData();
  formData.append(
    "email",
    new Blob([JSON.stringify(emailData)], { type: "application/json" })
  );
  emailData.attachments.forEach((file) => formData.append("attachments", file));

  const response = await axios.post(
    `http://10.194.61.74:8080/communication/api/${schoolId}/compose?send=${send}`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data;
};

const ComposeEmail = () => {
  const { auth, loading: authLoading } = useAuth();
  const [recipientId, setRecipientId] = useState("new2");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [templateId, setTemplateId] = useState("");
  const [attachments, setAttachments] = useState([]);
  const [message, setMessage] = useState("");
  const router = useRouter();
  const queryClient = useQueryClient();

  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB limit
  const MAX_SUBJECT_LENGTH = 200;
  const MAX_BODY_LENGTH = 5000;

  const sendEmailMutation = useMutation({
    mutationFn: ({ emailData }) =>
      sendOrSaveEmail({
        schoolId: auth.user.schoolId,
        token: auth.token,
        emailData,
        send: true,
      }),
    onSuccess: (data) => {
      setMessage(data.message || "Email sent successfully!");
      resetForm();
      queryClient.invalidateQueries(["draftEmails", auth.user.schoolId]);
    },
    onError: (error) => {
      setMessage(error.response?.data?.message || "Failed to send email.");
    },
  });

  const saveDraftMutation = useMutation({
    mutationFn: ({ emailData }) =>
      sendOrSaveEmail({
        schoolId: auth.user.schoolId,
        token: auth.token,
        emailData,
        send: false,
      }),
    onSuccess: (data) => {
      setMessage(data.message || "Email saved as draft successfully!");
      resetForm();
      queryClient.invalidateQueries(["draftEmails", auth.user.schoolId]);
    },
    onError: (error) => {
      setMessage(error.response?.data?.message || "Failed to save draft.");
    },
  });

  const resetForm = () => {
    setTimeout(() => {
      setMessage("");
      setRecipientId("");
      setSubject("");
      setBody("");
      setTemplateId("");
      setAttachments([]);
      router.push("/communication/email");
    }, 3000);
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    const newAttachments = files.filter((file) => {
      if (file.size > MAX_FILE_SIZE) {
        setMessage(`File ${file.name} exceeds 5MB limit.`);
        return false;
      }
      return true;
    });
    setAttachments((prev) => [...prev, ...newAttachments]);
  };

  const handleRemoveAttachment = (index) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e, send = true) => {
    e.preventDefault();
    if (authLoading || !auth) return;

    const emailData = {
      senderId: auth.user.userId,
      recipientId,
      subject,
      body,
      templateId: templateId || null,
      attachments,
    };

    if (send) {
      sendEmailMutation.mutate({ emailData });
    } else {
      saveDraftMutation.mutate({ emailData });
    }
  };

  const handleDraft = (e) => handleSubmit(e, false);

  if (authLoading) return <div>Loading authentication...</div>;

  return (
    <StyledCard>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          mb: 3,
          flexDirection: { xs: "column", sm: "row" }, // Stack on mobile
          textAlign: { xs: "center", sm: "left" },
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <SendIcon
            sx={{ color: "#1976d2", fontSize: 40, mr: { xs: 0, sm: 2 } }}
          />
          <Typography variant="h4" sx={{ color: "#455a64", fontWeight: 700 }}>
            Compose Email
          </Typography>
        </Box>
        <IconButton
          onClick={() => router.push("/communication/email")}
          sx={{
            ml: { xs: 0, sm: "auto" },
            mt: { xs: 1, sm: 0 },
            color: "#ef5350",
          }}
        >
          <CloseIcon />
        </IconButton>
      </Box>
      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 3,
          "& .MuiTextField-root": {
            "& .MuiOutlinedInput-root": {
              borderRadius: 12,
              backgroundColor: "#fafafa",
              "&:hover fieldset": { borderColor: "#42a5f5" },
              "&.Mui-focused fieldset": { borderColor: "#1976d2" },
            },
          },
        }}
      >
        <TextField
          label="To"
          value={recipientId}
          onChange={(e) => setRecipientId(e.target.value)}
          fullWidth
          variant="outlined"
          required
          helperText="Enter the recipient's user ID"
          sx={{ "& .MuiFormHelperText-root": { color: "#78909c" } }}
        />
        <TextField
          label="Subject"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          fullWidth
          variant="outlined"
          required
          inputProps={{ maxLength: MAX_SUBJECT_LENGTH }}
          helperText={`${subject.length}/${MAX_SUBJECT_LENGTH} characters`}
          sx={{ "& .MuiFormHelperText-root": { color: "#78909c" } }}
        />
        <TextField
          label="Message"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          fullWidth
          variant="outlined"
          multiline
          rows={10}
          required
          inputProps={{ maxLength: MAX_BODY_LENGTH }}
          helperText={`${body.length}/${MAX_BODY_LENGTH} characters`}
          sx={{
            "& .MuiOutlinedInput-root": {
              minHeight: { xs: "200px", sm: "250px" },
            },
            "& .MuiFormHelperText-root": { color: "#78909c" },
          }}
        />
        <TextField
          label="Template ID (Optional)"
          value={templateId}
          onChange={(e) => setTemplateId(e.target.value)}
          fullWidth
          variant="outlined"
          type="number"
          helperText="Apply a styling template if available"
          sx={{ "& .MuiFormHelperText-root": { color: "#78909c" } }}
        />
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            alignItems: { xs: "stretch", sm: "center" },
            gap: 2,
          }}
        >
          <Button
            variant="outlined"
            component="label"
            startIcon={<AttachFileIcon />}
            sx={{
              borderColor: "#26a69a",
              color: "#26a69a",
              borderRadius: 8,
              textTransform: "none",
              "&:hover": {
                borderColor: "#00897b",
                color: "#00897b",
                backgroundColor: "#e0f2f1",
              },
            }}
          >
            Attach Files
            <Input
              type="file"
              multiple
              hidden
              onChange={handleFileChange}
              sx={{ display: "none" }}
            />
          </Button>
          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
            {attachments.map((file, index) => (
              <Chip
                key={index}
                label={`${file.name} (${(file.size / 1024).toFixed(2)} KB)`}
                onDelete={() => handleRemoveAttachment(index)}
                deleteIcon={<DeleteIcon sx={{ color: "#ef5350" }} />}
                sx={{
                  backgroundColor: "#bbdefb",
                  color: "#1976d2",
                  borderRadius: 4,
                  "&:hover": { backgroundColor: "#90caf9" },
                }}
              />
            ))}
          </Box>
        </Box>
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            gap: 2,
            alignItems: { xs: "stretch", sm: "center" },
          }}
        >
          <Button
            type="submit"
            variant="contained"
            disabled={
              sendEmailMutation.isLoading || saveDraftMutation.isLoading
            }
            startIcon={<SendIcon />}
            sx={{
              backgroundColor: "#1976d2",
              "&:hover": { backgroundColor: "#1565c0" },
              borderRadius: 8,
              textTransform: "none",
              boxShadow: "0 4px 12px rgba(25, 118, 210, 0.3)",
              minWidth: { xs: "100%", sm: 150 },
            }}
          >
            {sendEmailMutation.isLoading ? (
              <CircularProgress size={24} sx={{ color: "#fff" }} />
            ) : (
              "Send"
            )}
          </Button>
          <Button
            variant="outlined"
            onClick={handleDraft}
            startIcon={<SaveIcon />}
            disabled={
              sendEmailMutation.isLoading || saveDraftMutation.isLoading
            }
            sx={{
              borderColor: "#ff9800",
              color: "#ff9800",
              "&:hover": {
                borderColor: "#f57c00",
                color: "#f57c00",
                backgroundColor: "#fff3e0",
              },
              borderRadius: 8,
              textTransform: "none",
              minWidth: { xs: "100%", sm: 150 },
            }}
          >
            {saveDraftMutation.isLoading ? (
              <CircularProgress size={24} sx={{ color: "#ff9800" }} />
            ) : (
              "Save Draft"
            )}
          </Button>
          {message && (
            <Typography
              variant="body2"
              sx={{
                color: message.includes("Failed") ? "#ef5350" : "#26a69a",
                animation: "fadeIn 0.5s ease",
                mt: { xs: 1, sm: 0 },
                textAlign: { xs: "center", sm: "left" },
              }}
            >
              {message}
            </Typography>
          )}
        </Box>
      </Box>
      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
        `}
      </style>
    </StyledCard>
  );
};

export default ComposeEmail;
