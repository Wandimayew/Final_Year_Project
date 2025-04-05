"use client";

import React, { useState, useEffect, Suspense, useMemo } from "react";
import {
  useEmailsByFolder,
  useUpdateEmailStatus,
  useDeleteEmail,
} from "@/lib/api/communicationService/email";
import { useAuthStore } from "@/lib/auth";
import { useRouter } from "next/navigation";
import {
  MagnifyingGlassIcon,
  EnvelopeIcon,
  TrashIcon,
  StarIcon,
  XMarkIcon,
  PaperClipIcon,
} from "@heroicons/react/24/solid";

// Main component
const EmailListContent = ({ folder }) => {
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

  const [searchTerm, setSearchTerm] = useState("");
  const [orderBy, setOrderBy] = useState("sentAt");
  const [order, setOrder] = useState("desc");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const { data, isLoading, isError, error } = useEmailsByFolder(
    user?.schoolId,
    folder,
    {
      page: page - 1,
      pageSize,
      sort: `${orderBy},${order}`,
    }
  );
  const updateStatusMutation = useUpdateEmailStatus(user?.schoolId);
  const deleteEmailMutation = useDeleteEmail(user?.schoolId);

  const emails = data?.data || [];
  const totalPages = data?.totalPages || 1;

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/login");
    }
  }, [isAuthenticated, router]);

  const filteredEmailsServer = emails.filter((email) => {
    const userId = user?.userId;
    const isSender = userId === email.senderId;
    const isRecipient = userId === email.recipientId;
    return (
      (isSender && !email.senderDeleted) ||
      (isRecipient && !email.recipientDeleted)
    );
  });

  const filteredEmails = filteredEmailsServer.filter(
    (email) =>
      email.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      email.senderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      email.recipientId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSort = (property) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
    setPage(1);
  };

  const handleEmailClick = (emailId) =>
    router.push(`/communication/email/detail/${emailId}`);
  const handlePageChange = (newPage) => setPage(Math.max(1, newPage));
  const handleMoveToTrash = (emailId) => {
    updateStatusMutation.mutate(
      { emailId, status: "TRASH" },
      { onError: () => alert("Failed to move email to Trash.") }
    );
  };
  const handleMarkAsImportant = (emailId) => {
    updateStatusMutation.mutate(
      { emailId, status: "IMPORTANT" },
      { onError: () => alert("Failed to mark email as Important.") }
    );
  };
  const handleDeleteEmail = (emailId) => {
    if (
      !confirm(
        "Are you sure you want to delete this email permanently? It may still exist for the other party."
      )
    ) {
      return;
    }
    deleteEmailMutation.mutate(emailId, {
      onError: () => alert("Failed to delete email."),
    });
  };

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-gray-100 pl-60">
      {" "}
      {/* Added pl-60 to offset sidebar */}
      <div className="max-w-6xl mx-auto p-4 md:p-8">
        <div className="bg-white rounded-xl shadow-lg p-6 transform transition-all hover:shadow-xl">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
            <div className="flex items-center gap-3">
              <EnvelopeIcon className="h-8 w-8 text-blue-600" />
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800 capitalize">
                {folder}
              </h1>
            </div>
            <div className="relative w-full md:w-1/3">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search Emails..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-gray-50"
              />
            </div>
          </div>

          {/* Email Table */}
          {isLoading ? (
            <div className="flex justify-center mt-4">
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
                <path
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                />
              </svg>
            </div>
          ) : isError ? (
            <p className="text-center text-red-600 mt-2">
              {error?.message || `Failed to fetch ${folder} emails.`}
            </p>
          ) : filteredEmails.length === 0 ? (
            <p className="text-center text-gray-500 mt-2">No emails found.</p>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-gray-200">
                    <tr>
                      <th className="p-3 font-semibold text-gray-700">
                        <button
                          onClick={() => handleSort("senderId")}
                          className="flex items-center gap-1"
                        >
                          Sender
                          {orderBy === "senderId" &&
                            (order === "asc" ? "↑" : "↓")}
                        </button>
                      </th>
                      <th className="p-3 font-semibold text-gray-700 w-1/4">
                        <button
                          onClick={() => handleSort("subject")}
                          className="flex items-center gap-1"
                        >
                          Subject
                          {orderBy === "subject" &&
                            (order === "asc" ? "↑" : "↓")}
                        </button>
                      </th>
                      <th className="p-3 font-semibold text-gray-700">
                        Preview
                      </th>
                      <th className="p-3 font-semibold text-gray-700">
                        Attachments
                      </th>
                      <th className="p-3 font-semibold text-gray-700">
                        <button
                          onClick={() => handleSort("sentAt")}
                          className="flex items-center gap-1"
                        >
                          Time
                          {orderBy === "sentAt" &&
                            (order === "asc" ? "↑" : "↓")}
                        </button>
                      </th>
                      <th className="p-3 font-semibold text-gray-700">
                        Status
                      </th>
                      <th className="p-3 font-semibold text-gray-700">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredEmails.map((email) => {
                      const userId = user.userId;
                      const currentStatus =
                        userId === email.senderId
                          ? email.senderStatus
                          : email.recipientStatus;
                      const isDeleted =
                        userId === email.senderId
                          ? email.senderDeleted
                          : email.recipientDeleted;
                      return (
                        <tr
                          key={email.emailId}
                          className="border-b border-gray-200 hover:bg-blue-50 hover:scale-[1.01] transition-all cursor-pointer"
                          onClick={() => handleEmailClick(email.emailId)}
                        >
                          <td className="p-3">
                            <div className="flex items-center gap-2">
                              <EnvelopeIcon className="h-5 w-5 text-blue-500" />
                              <span className="text-gray-700 font-medium">
                                {email.senderId}
                              </span>
                            </div>
                          </td>
                          <td className="p-3">
                            <span
                              className={`text-gray-700 ${
                                email.isRead ? "font-normal" : "font-semibold"
                              }`}
                            >
                              {email.subject}
                            </span>
                          </td>
                          <td className="p-3 text-gray-500">
                            {email.body.substring(0, 30)}...
                          </td>
                          <td className="p-3">
                            {email.attachments &&
                            email.attachments.length > 0 ? (
                              <div className="flex flex-wrap gap-1">
                                {email.attachments.map((att, idx) => (
                                  <span
                                    key={idx}
                                    className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full"
                                  >
                                    {att.fileName}
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <span className="text-gray-500">None</span>
                            )}
                          </td>
                          <td className="p-3 text-gray-500">
                            {email.sentAt
                              ? new Date(email.sentAt).toLocaleString()
                              : "Not sent"}
                          </td>
                          <td className="p-3">
                            <span
                              className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                                currentStatus === "TRASH"
                                  ? "bg-red-500 text-white"
                                  : "bg-teal-500 text-white"
                              }`}
                            >
                              {currentStatus}
                            </span>
                          </td>
                          <td className="p-3 flex gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleMoveToTrash(email.emailId);
                              }}
                              disabled={
                                currentStatus === "TRASH" ||
                                isDeleted ||
                                updateStatusMutation.isLoading
                              }
                              className="text-red-600 hover:text-red-800 disabled:text-red-300"
                              aria-label="Move to Trash"
                            >
                              {updateStatusMutation.isLoading &&
                              updateStatusMutation.variables?.emailId ===
                                email.emailId &&
                              updateStatusMutation.variables?.status ===
                                "TRASH" ? (
                                <svg
                                  className="animate-spin h-5 w-5"
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
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleMarkAsImportant(email.emailId);
                              }}
                              disabled={
                                currentStatus === "IMPORTANT" ||
                                isDeleted ||
                                updateStatusMutation.isLoading
                              }
                              className="text-yellow-500 hover:text-yellow-600 disabled:text-yellow-300"
                              aria-label="Mark Important"
                            >
                              {updateStatusMutation.isLoading &&
                              updateStatusMutation.variables?.emailId ===
                                email.emailId &&
                              updateStatusMutation.variables?.status ===
                                "IMPORTANT" ? (
                                <svg
                                  className="animate-spin h-5 w-5"
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
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteEmail(email.emailId);
                              }}
                              disabled={
                                isDeleted || deleteEmailMutation.isLoading
                              }
                              className="text-red-600 hover:text-red-800 disabled:text-red-300"
                              aria-label="Delete"
                            >
                              {deleteEmailMutation.isLoading &&
                              deleteEmailMutation.variables ===
                                email.emailId ? (
                                <svg
                                  className="animate-spin h-5 w-5"
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
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <div className="flex justify-center mt-6">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handlePageChange(page - 1)}
                    disabled={page === 1}
                    className="px-3 py-1 bg-blue-100 text-blue-600 rounded hover:bg-blue-200 disabled:bg-gray-200 disabled:text-gray-400"
                  >
                    Previous
                  </button>
                  <span className="text-gray-700">
                    Page {page} of {totalPages}
                  </span>
                  <button
                    onClick={() => handlePageChange(page + 1)}
                    disabled={page === totalPages}
                    className="px-3 py-1 bg-blue-100 text-blue-600 rounded hover:bg-blue-200 disabled:bg-gray-200 disabled:text-gray-400"
                  >
                    Next
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// Wrapper component for hydration and suspense
const EmailList = ({ folder }) => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
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
        <div className="min-h-screen bg-gray-100 flex items-center justify-center">
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
      <EmailListContent folder={folder} />
    </Suspense>
  );
};

export default EmailList;
