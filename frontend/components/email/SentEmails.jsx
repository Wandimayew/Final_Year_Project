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
  PaperAirplaneIcon,
  TrashIcon,
  StarIcon,
  XMarkIcon,
} from "@heroicons/react/24/solid";

const SentEmails = () => {
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
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const { data, isLoading, isError, error } = useEmailsByFolder(
    user?.schoolId,
    "SENT",
    {
      page: page - 1,
      size: pageSize,
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
      const isSender = userId === email.senderId;
      return (
        isSender &&
        !email.senderDeleted &&
        (email.senderStatus === "SENT" || email.senderStatus === "IMPORTANT")
      );
    })
    .filter(
      (email) =>
        email.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
        email.recipientId.toLowerCase().includes(searchTerm.toLowerCase())
    );

  const handleEmailClick = (emailId) =>
    router.push(`/communication/email/detail/${emailId}`);

  const handleMarkAsImportant = (emailId) => {
    updateStatusMutation.mutate(
      { emailId, status: "IMPORTANT" },
      {
        onSuccess: () => {
          // No need to manually refetch; React Query should handle this via invalidation
        },
        onError: () => alert("Failed to mark email as important."),
      }
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

  if (!isAuthenticated) return null;

  return (
    <div className="h-screen bg-gray-100 pl-60">
      <div className="max-w-6xl mx-auto p-4 md:p-8">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
            <div className="flex items-center gap-3">
              <PaperAirplaneIcon className="h-8 w-8 text-teal-600" />
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
                Sent Emails
              </h1>
            </div>
            <div className="relative w-full md:w-1/3">
              <input
                type="text"
                placeholder="Search sent emails..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
              />
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center mt-4">
              <svg
                className="animate-spin h-8 w-8 text-teal-600"
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
              {error?.message || "Failed to fetch sent emails."}
            </p>
          ) : filteredEmails.length === 0 ? (
            <p className="text-center text-gray-500 mt-2">
              No sent emails found.
            </p>
          ) : (
            <>
              <table className="w-full text-left">
                <thead className="bg-gray-200">
                  <tr>
                    <th className="p-3 font-semibold text-gray-700">
                      Recipient
                    </th>
                    <th className="p-3 font-semibold text-gray-700">Subject</th>
                    <th className="p-3 font-semibold text-gray-700">Preview</th>
                    <th className="p-3 font-semibold text-gray-700">Time</th>
                    <th className="p-3 font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEmails.map((email) => (
                    <tr
                      key={email.emailId}
                      className="border-b border-gray-200 hover:bg-teal-50 cursor-pointer"
                      onClick={() => handleEmailClick(email.emailId)}
                    >
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <PaperAirplaneIcon className="h-5 w-5 text-teal-500" />
                          <span className="text-gray-700 font-medium">
                            {email.recipientId}
                          </span>
                        </div>
                      </td>
                      <td className="p-3">
                        <span className="text-gray-700">{email.subject}</span>
                      </td>
                      <td className="p-3 text-gray-500">
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
                            email.senderStatus === "IMPORTANT" ||
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
                          disabled={
                            email.senderStatus === "TRASH" ||
                            updateStatusMutation.isLoading
                          }
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
                    className="px-3 py-1 bg-teal-100 text-teal-600 rounded hover:bg-teal-200 disabled:bg-gray-200 disabled:text-gray-400"
                  >
                    Previous
                  </button>
                  <span className="text-gray-700">
                    Page {page} of {totalPages}
                  </span>
                  <button
                    onClick={() => setPage(page + 1)}
                    disabled={page === totalPages}
                    className="px-3 py-1 bg-teal-100 text-teal-600 rounded hover:bg-teal-200 disabled:bg-gray-200 disabled:text-gray-400"
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

export default SentEmails;
