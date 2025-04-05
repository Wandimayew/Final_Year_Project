"use client";

import React, { useState, useEffect, Suspense, useMemo } from "react";
import {
  useEmailsByFolder,
  useUpdateEmailStatus,
} from "@/lib/api/communicationService/email";
import { useAuthStore } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { StarIcon, TrashIcon, XMarkIcon } from "@heroicons/react/24/solid";

const ImportantEmailsContent = () => {
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
  const [sortOrder, setSortOrder] = useState("desc");

  const schoolId = user?.schoolId;
  const folder = "IMPORTANT";
  const pagination = { page: 0, size: 10, sort: `sentAt,${sortOrder}` };

  const {
    data: emailsData,
    isLoading,
    error,
  } = useEmailsByFolder(schoolId, folder, pagination);
  const updateEmailStatus = useUpdateEmailStatus(schoolId);

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/login");
    }
  }, [isAuthenticated, router]);

  const handleSort = () => {
    setSortOrder(sortOrder === "desc" ? "asc" : "desc");
  };

  const handleMoveToTrash = (emailId) => {
    updateEmailStatus.mutate({ emailId, status: "TRASH" });
  };

  const handleRemoveFromImportant = (emailId) => {
    const email = filteredEmails.find((e) => e.emailId === emailId);
    if (!email) return;
    const newStatus = user.userId === email.senderId ? "SENT" : "INBOX";
    updateEmailStatus.mutate({ emailId, status: newStatus });
  };

  const filteredEmails =
    emailsData?.data?.filter(
      (email) =>
        email.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
        email.senderId.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-gray-100 pl-60 pt-4">
      <div className="p-4 md:p-8">
        <div className="bg-white rounded-xl shadow-lg p-6 transition-all hover:shadow-xl">
          {/* Header */}
          <div className="flex items-center justify-between mb-6 flex-col md:flex-row gap-4">
            <div className="flex items-center gap-3">
              <StarIcon className="h-8 w-8 text-yellow-500" />
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
                Important Emails
              </h1>
            </div>
            <button
              onClick={() => router.push("/communication/email")}
              className="p-2 rounded-full bg-red-100 text-red-600 hover:bg-red-200 transition-colors"
              aria-label="Close"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>

          {/* Search Bar */}
          <div className="mb-6">
            <input
              type="text"
              placeholder="Search important emails..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-gray-50 transition-all"
            />
          </div>

          {/* Emails Table */}
          {isLoading ? (
            <div className="flex justify-center items-center py-8">
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
          ) : error ? (
            <p className="text-center text-red-600 py-4">
              {error.message || "Failed to fetch important emails."}
            </p>
          ) : filteredEmails.length === 0 ? (
            <p className="text-center text-gray-500 py-4">
              No important emails found.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-200">
                  <tr>
                    <th className="p-3 text-sm font-semibold text-gray-700">
                      Sender
                    </th>
                    <th className="p-3 text-sm font-semibold text-gray-700">
                      Subject
                    </th>
                    <th className="p-3 text-sm font-semibold text-gray-700">
                      Message
                    </th>
                    <th className="p-3 text-sm font-semibold text-gray-700">
                      Attachments
                    </th>
                    <th className="p-3 text-sm font-semibold text-gray-700">
                      <button
                        onClick={handleSort}
                        className="flex items-center gap-1"
                      >
                        Time
                        <svg
                          className={`h-4 w-4 ${
                            sortOrder === "asc" ? "rotate-180" : ""
                          }`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      </button>
                    </th>
                    <th className="p-3 text-sm font-semibold text-gray-700">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEmails.map((email) => (
                    <tr
                      key={email.emailId}
                      onClick={() =>
                        router.push(
                          `/communication/email/detail/${email.emailId}`
                        )
                      }
                      className="border-b hover:bg-blue-50 transition-all cursor-pointer"
                    >
                      <td className="p-3 text-gray-800 font-medium">
                        {email.senderId}
                      </td>
                      <td
                        className="p-3 text-gray-800"
                        style={{ fontWeight: email.isRead ? 400 : 600 }}
                      >
                        {email.subject}
                      </td>
                      <td className="p-3 text-gray-600">
                        {email.body.substring(0, 30)}...
                      </td>
                      <td className="p-3">
                        {email.attachments && email.attachments.length > 0 ? (
                          email.attachments.map((att, idx) => (
                            <span
                              key={idx}
                              className="inline-block bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs mr-1 mb-1"
                            >
                              {att.fileName}
                            </span>
                          ))
                        ) : (
                          <span className="text-gray-500">None</span>
                        )}
                      </td>
                      <td className="p-3 text-gray-600">
                        {new Date(email.sentAt).toLocaleString()}
                      </td>
                      <td className="p-3 flex gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMoveToTrash(email.emailId);
                          }}
                          disabled={updateEmailStatus.isLoading}
                          className="p-2 text-red-600 hover:text-red-800 disabled:text-gray-400"
                          aria-label="Move to Trash"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveFromImportant(email.emailId);
                          }}
                          disabled={updateEmailStatus.isLoading}
                          className="p-2 text-blue-600 hover:text-blue-800 disabled:text-gray-400"
                          aria-label="Remove from Important"
                        >
                          <StarIcon className="h-5 w-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const ImportantEmails = () => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <div className="min-h-screen bg-gray-100 pl-60 flex items-center justify-center">
        <svg className="animate-spin h-8 w-8 text-teal-600" viewBox="0 0 24 24">
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
            <path fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
          </svg>
        </div>
      }
    >
      <ImportantEmailsContent />
    </Suspense>
  );
};

export default ImportantEmails;
