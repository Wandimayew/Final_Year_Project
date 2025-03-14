"use client";
import React from "react";
import {
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  Box,
  useTheme,
} from "@mui/material";
import {
  Inbox as InboxIcon,
  Send as SendIcon,
  LabelImportant as ImportantIcon,
  Delete as DeleteIcon,
  Create as CreateIcon,
} from "@mui/icons-material";
import { useRouter, usePathname } from "next/navigation";

const MailBoxFolder = () => {
  const router = useRouter();
  const pathname = usePathname();
  const theme = useTheme();

  const folders = [
    {
      path: "/communication/email",
      name: "Inbox",
      icon: <InboxIcon />,
      count: 5,
    },
    {
      path: "/communication/email/sent",
      name: "Sent",
      icon: <SendIcon />,
      count: 3,
    },
    {
      path: "/communication/email/important",
      name: "Important",
      icon: <ImportantIcon />,
      count: 2,
    },
    {
      path: "/communication/email/trash",
      name: "Trash",
      icon: <DeleteIcon />,
      count: 1,
    },
  ];

  return (
    <Box
      sx={{
        width: 240,
        background: "linear-gradient(180deg, #e3f2fd 0%, #f5f5f5 100%)",
        borderRight: "1px solid #b0bec5",
        height: "100vh",
        position: "fixed",
        overflowY: "auto",
        boxShadow: "2px 0 10px rgba(0, 0, 0, 0.05)",
      }}
    >
      <Box
        sx={{
          padding: 2,
          borderBottom: "1px solid #b0bec5",
          background: "linear-gradient(90deg, #1976d2 0%, #42a5f5 100%)",
          display: "flex",
          justifyContent: "flex-end",
          alignItems: "center",
        }}
      >
        <IconButton
          onClick={() => router.push("/communication/email/compose")}
          sx={{
            backgroundColor: "rgba(255, 255, 255, 0.2)",
            color: "#fff",
            "&:hover": {
              backgroundColor: "rgba(255, 255, 255, 0.3)",
              transform: "scale(1.1)",
              transition: "all 0.3s ease",
            },
          }}
        >
          <CreateIcon />
        </IconButton>
      </Box>
      <List>
        {folders.map((folder) => (
          <ListItem
            button
            key={folder.name}
            onClick={() => router.push(folder.path)}
            selected={pathname === folder.path}
            sx={{
              padding: "12px 16px",
              borderRadius: "0 12px 12px 0",
              margin: "4px 0",
              cursor: "pointer", // Added cursor pointer
              "&:hover": {
                backgroundColor: "#e3f2fd",
                transform: "translateX(4px)",
                transition: "all 0.3s ease",
                boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)", // Enhanced hover effect
              },
              "&.Mui-selected": {
                backgroundColor: "#bbdefb",
                color: "#1976d2",
                "&:hover": {
                  backgroundColor: "#90caf9",
                  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)", // Enhanced active hover
                },
              },
              transition: "all 0.3s ease",
            }}
          >
            <ListItemIcon sx={{ color: "#1976d2", minWidth: "40px" }}>
              {folder.icon}
            </ListItemIcon>
            <ListItemText
              primary={folder.name}
              secondary={folder.count > 0 ? `(${folder.count})` : null}
              primaryTypographyProps={{ fontWeight: "600", color: "#455a64" }}
              secondaryTypographyProps={{ color: "#78909c" }}
            />
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

export default MailBoxFolder;
