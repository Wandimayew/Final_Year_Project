"use client";

import React, { useState, useEffect, useMemo } from "react";
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
  ArrowPathIcon,
} from "@heroicons/react/24/solid";
import { useQueryClient } from "@tanstack/react-query";

const EmailList = () => {
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
  const queryClient = useQueryClient();

  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const { data, isLoading, isError, error } = useEmailsByFolder(
    user?.schoolId,
    "INBOX",
    {
      page: page - 1,
      size: pageSize, // Fixed typo from pageSize to size
      sort: "sentAt,desc",
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

  const filteredEmails = emails
    .filter((email) => {
      const userId = user?.userId;
      const isRecipient = userId === email.recipientId;
      return (
        isRecipient &&
        !email.recipientDeleted &&
        (email.recipientStatus === "INBOX" ||
          email.recipientStatus === "IMPORTANT")
      );
    })
    .filter(
      (email) =>
        email.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
        email.senderId.toLowerCase().includes(searchTerm.toLowerCase())
    );

  const handleEmailClick = (emailId) =>
    router.push(`/communication/email/detail/${emailId}`);

  const handleMarkAsImportant = (emailId) => {
    updateStatusMutation.mutate(
      { emailId, status: "IMPORTANT" },
      { onError: () => alert("Failed to mark email as important.") }
    );
  };

  const handleMoveToTrash = (emailId) => {
    updateStatusMutation.mutate(
      { emailId, status: "TRASH" },
      { onError: () => alert("Failed to move email to trash.") }
    );
  };

  const handleDeleteEmail = (emailId) => {
    if (!confirm("Are you sure you want to permanently delete this email?")) {
      return;
    }
    deleteEmailMutation.mutate(emailId, {
      onError: () => alert("Failed to delete email."),
    });
  };

  const handleRefresh = () => {
    queryClient.invalidateQueries(["emails", user?.schoolId, "INBOX"]);
  };

  if (!isAuthenticated) return null;

  return (
    <div className="h-screen bg-gray-100 pl-60">
      <div className="max-w-7xl mx-auto p-4 md:p-8">
        <div className="bg-white rounded-xl shadow-lg p-6">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
            <div className="flex items-center gap-3">
              <EnvelopeIcon className="h-8 w-8 text-blue-600" />
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
                Inbox
              </h1>
            </div>
            <div className="flex items-center gap-4 w-full md:w-auto">
              <div className="relative flex-grow md:w-80">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search Inbox..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
              <button
                onClick={handleRefresh}
                className="p-2 bg-blue-100 text-blue-600 rounded-full hover:bg-blue-200 transition-colors"
                aria-label="Refresh Inbox"
              >
                <ArrowPathIcon className="h-6 w-6" />
              </button>
            </div>
          </div>

          {/* Email List */}
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
              {error?.message || "Failed to fetch inbox emails."}
            </p>
          ) : filteredEmails.length === 0 ? (
            <p className="text-center text-gray-500 mt-2">
              No emails in inbox.
            </p>
          ) : (
            <>
              <table className="w-full text-left">
                <thead className="bg-gray-200">
                  <tr>
                    <th className="p-3 font-semibold text-gray-700 w-1/5">
                      Sender
                    </th>
                    <th className="p-3 font-semibold text-gray-700 w-1/4">
                      Subject
                    </th>
                    <th className="p-3 font-semibold text-gray-700 w-1/3">
                      Preview
                    </th>
                    <th className="p-3 font-semibold text-gray-700 w-1/6">
                      Time
                    </th>
                    <th className="p-3 font-semibold text-gray-700 w-1/6">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEmails.map((email) => (
                    <tr
                      key={email.emailId}
                      className="border-b border-gray-200 hover:bg-blue-50 cursor-pointer"
                      onClick={() => handleEmailClick(email.emailId)}
                    >
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <EnvelopeIcon className="h-5 w-5 text-blue-500" />
                          <span className="text-gray-700 font-medium truncate">
                            {email.senderId}
                          </span>
                        </div>
                      </td>
                      <td className="p-3">
                        <span
                          className={`text-gray-700 ${
                            email.isRead ? "font-normal" : "font-semibold"
                          } truncate`}
                        >
                          {email.subject}
                        </span>
                      </td>
                      <td className="p-3 text-gray-500 truncate">
                        {email.body.substring(0, 30)}...
                      </td>
                      <td className="p-3 text-gray-500">
                        {new Date(email.sentAt).toLocaleString()}
                      </td>
                      <td className="p-3 flex gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMarkAsImportant(email.emailId);
                          }}
                          disabled={
                            email.recipientStatus === "IMPORTANT" ||
                            updateStatusMutation.isLoading
                          }
                          className="text-yellow-500 hover:text-yellow-600 disabled:text-yellow-300"
                        >
                          <StarIcon className="h-5 w-5" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMoveToTrash(email.emailId);
                          }}
                          disabled={updateStatusMutation.isLoading}
                          className="text-red-600 hover:text-red-800 disabled:text-red-300"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteEmail(email.emailId);
                          }}
                          disabled={deleteEmailMutation.isLoading}
                          className="text-red-600 hover:text-red-800 disabled:text-red-300"
                        >
                          <XMarkIcon className="h-5 w-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="flex justify-center mt-6">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPage(page - 1)}
                    disabled={page === 1}
                    className="px-3 py-1 bg-blue-100 text-blue-600 rounded hover:bg-blue-200 disabled:bg-gray-200 disabled:text-gray-400"
                  >
                    Previous
                  </button>
                  <span className="text-gray-700">
                    Page {page} of {totalPages}
                  </span>
                  <button
                    onClick={() => setPage(page + 1)}
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

export default EmailList;
