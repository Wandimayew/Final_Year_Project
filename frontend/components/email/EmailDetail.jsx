"use client";

import React, { useState, useEffect, Suspense, useMemo } from "react";
import {
  useEmailById,
  useMarkEmailAsRead,
  useUpdateEmailStatus,
  useDeleteEmail,
} from "@/lib/api/communicationService/email";
import { useAuthStore } from "@/lib/auth";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  ArrowLeftIcon,
  TrashIcon,
  StarIcon,
  XMarkIcon,
  PaperClipIcon,
  ArrowDownTrayIcon,
} from "@heroicons/react/24/solid";

const EmailDetailContent = ({ emailId }) => {
  const authState = useMemo(
    () =>
      useAuthStore.getState()
        ? {
            user: useAuthStore.getState().user,
            isAuthenticated: useAuthStore.getState().isAuthenticated(),
          }
        : { user: null, isAuthenticated: false },
    []
  );
  const { user, isAuthenticated } = authState;
  const router = useRouter();

  const {
    data: email,
    isLoading,
    isError,
    error,
  } = useEmailById(user?.schoolId, emailId);
  const markAsReadMutation = useMarkEmailAsRead(user?.schoolId);
  const updateStatusMutation = useUpdateEmailStatus(user?.schoolId);
  const deleteEmailMutation = useDeleteEmail(user?.schoolId);

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/login");
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    if (
      email &&
      email.recipientId === user?.userId &&
      !email.isRead &&
      !markAsReadMutation.isLoading &&
      !markAsReadMutation.isSuccess
    ) {
      markAsReadMutation.mutate(emailId);
    }
  }, [email, user, emailId, markAsReadMutation]);

  const handleDownloadAttachment = async (filePath, fileName) => {
    try {
      const response = await fetch(filePath, { method: "GET" });
      if (!response.ok) throw new Error("Failed to fetch attachment");
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Download failed:", err);
      alert("Failed to download attachment. Please try again.");
    }
  };

  const handleMoveToTrash = () => {
    updateStatusMutation.mutate(
      { emailId, status: "TRASH" },
      {
        onError: () => alert("Failed to move email to Trash."),
        onSuccess: () => router.back(),
      }
    );
  };

  const handleMarkAsImportant = () => {
    updateStatusMutation.mutate(
      { emailId, status: "IMPORTANT" },
      {
        onError: () => alert("Failed to mark email as Important."),
      }
    );
  };

  const handleDelete = () => {
    if (
      !confirm(
        "Are you sure you want to delete this email permanently? It may still exist for the other party."
      )
    ) {
      return;
    }
    deleteEmailMutation.mutate(emailId, {
      onError: () => alert("Failed to delete email."),
      onSuccess: () => router.back(),
    });
  };

  if (!isAuthenticated) return null;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 pl-60 flex items-center justify-center">
        <svg className="animate-spin h-8 w-8 text-blue-600" viewBox="0 0 24 24">
          <circle
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
            fill="none"
            opacity="0.25"
          />
          <path fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
        </svg>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-gray-100 pl-60 flex items-center justify-center">
        <p className="text-red-600 text-center">
          {error?.message ||
            "Failed to fetch email details. Please try again later."}
        </p>
      </div>
    );
  }

  if (!email) {
    return (
      <div className="min-h-screen bg-gray-100 pl-60 flex items-center justify-center">
        <p className="text-gray-500 text-center">Email not found.</p>
      </div>
    );
  }

  const userId = user.userId;
  const currentStatus =
    userId === email.senderId ? email.senderStatus : email.recipientStatus;
  const isDeleted =
    userId === email.senderId ? email.senderDeleted : email.recipientDeleted;

  return (
    <div className="min-h-screen bg-gray-100 pl-60 pt-4">
      <div className="p-4 md:p-8 h-full">
        <div className="bg-white rounded-xl shadow-lg p-6 h-full flex flex-col transition-all hover:shadow-xl">
          {/* Header */}
          <div className="flex items-center justify-between mb-6 flex-col md:flex-row gap-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.back()}
                className="p-2 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200 transition-colors"
                aria-label="Go back"
              >
                <ArrowLeftIcon className="h-5 w-5" />
              </button>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
                Email Details
              </h1>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <button
              onClick={handleMoveToTrash}
              disabled={
                currentStatus === "TRASH" ||
                isDeleted ||
                updateStatusMutation.isLoading
              }
              className="flex items-center justify-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-red-400 transition-all shadow-md"
            >
              {updateStatusMutation.isLoading &&
              updateStatusMutation.variables?.status === "TRASH" ? (
                <svg
                  className="animate-spin h-5 w-5 text-white"
                  viewBox="0 0 24 24"
                >
                  <circle
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                    opacity="0.25"
                  />
                  <path
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                  />
                </svg>
              ) : (
                <TrashIcon className="h-5 w-5" />
              )}
              Move to Trash
            </button>
            <button
              onClick={handleMarkAsImportant}
              disabled={
                currentStatus === "IMPORTANT" ||
                isDeleted ||
                updateStatusMutation.isLoading
              }
              className="flex items-center justify-center gap-2 px-6 py-3 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 disabled:bg-yellow-300 transition-all shadow-md"
            >
              {updateStatusMutation.isLoading &&
              updateStatusMutation.variables?.status === "IMPORTANT" ? (
                <svg
                  className="animate-spin h-5 w-5 text-white"
                  viewBox="0 0 24 24"
                >
                  <circle
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                    opacity="0.25"
                  />
                  <path
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                  />
                </svg>
              ) : (
                <StarIcon className="h-5 w-5" />
              )}
              Mark Important
            </button>
            <button
              onClick={handleDelete}
              disabled={isDeleted || deleteEmailMutation.isLoading}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-red-400 transition-all shadow-md"
            >
              {deleteEmailMutation.isLoading ? (
                <svg
                  className="animate-spin h-5 w-5 text-white"
                  viewBox="0 0 24 24"
                >
                  <circle
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                    opacity="0.25"
                  />
                  <path
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                  />
                </svg>
              ) : (
                <XMarkIcon className="h-5 w-5" />
              )}
              Delete
            </button>
          </div>

          {/* Email Content */}
          <h2 className="text-xl font-semibold text-blue-600 mb-4">
            {email.data.subject}
          </h2>
          <div className="bg-gray-50 p-4 rounded-lg mb-4">
            <p className="text-gray-700">
              <strong>From:</strong> {email.data.senderId} | <strong>To:</strong>{" "}
              {email.data.recipientId}
            </p>
            <p className="text-gray-500">
              {email.data.sentAt
                ? new Date(email.data.sentAt).toLocaleString()
                : "Not sent yet"}
            </p>
            <p className="text-gray-700">
              <strong>Status:</strong>{" "}
              <span
                className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                  currentStatus === "TRASH"
                    ? "bg-red-500 text-white"
                    : "bg-teal-500 text-white"
                }`}
              >
                {currentStatus}
              </span>{" "}
              | <strong>Read:</strong> {email.data.isRead ? "Yes" : "No"}
            </p>
          </div>
          <hr className="my-4 border-gray-200" />
          <p className="text-gray-700 whitespace-pre-wrap mb-6 flex-1">
            {email.data.body}
          </p>

          {/* Attachments */}
          {email.data.attachments && email.data.attachments.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-blue-600 mb-2">
                Attachments
              </h3>
              <ul className="bg-gray-50 rounded-lg p-2 space-y-2">
                {email.data.attachments.map((attachment, index) => (
                  <li
                    key={index}
                    className="flex items-center justify-between p-2 rounded-md hover:bg-blue-50 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <PaperClipIcon className="h-5 w-5 text-gray-500" />
                      <button
                        onClick={() =>
                          handleDownloadAttachment(
                            attachment.filePath,
                            attachment.fileName
                          )
                        }
                        className="text-blue-600 hover:underline"
                      >
                        {attachment.fileName}
                      </button>
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                        {(attachment.fileSize / 1024).toFixed(2)} KB
                      </span>
                      {attachment.fileType?.startsWith("image") && (
                        <Image
                          src={attachment.filePath}
                          alt={attachment.fileName}
                          width={100}
                          height={100}
                          className="rounded-md"
                          loading="lazy"
                          onError={(e) => (e.target.style.display = "none")}
                        />
                      )}
                      {attachment.fileType?.startsWith("video") && (
                        <video
                          src={attachment.filePath}
                          controls
                          width={200}
                          height={200}
                          className="rounded-md"
                          loading="lazy"
                          onError={(e) => (e.target.style.display = "none")}
                        />
                      )}
                    </div>
                    <button
                      onClick={() =>
                        handleDownloadAttachment(
                          attachment.filePath,
                          attachment.fileName
                        )
                      }
                      className="text-teal-600 hover:text-teal-800"
                      aria-label={`Download ${attachment.fileName}`}
                    >
                      <ArrowDownTrayIcon className="h-5 w-5" />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const EmailDetail = ({ emailId }) => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <div className="min-h-screen bg-gray-100 pl-60 flex items-center justify-center">
        <svg className="animate-spin h-8 w-8 text-blue-600" viewBox="0 0 24 24">
          <circle
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
            fill="none"
            opacity="0.25"
          />
          <path fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
        </svg>
      </div>
    );
  }

  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-100 pl-60 flex items-center justify-center">
          <svg
            className="animate-spin h-8 w-8 text-blue-600"
            viewBox="0 0 24 24"
          >
            <circle
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
              fill="none"
              opacity="0.25"
            />
            <path fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
          </svg>
        </div>
      }
    >
      <EmailDetailContent emailId={emailId} />
    </Suspense>
  );
};

export default EmailDetail;
