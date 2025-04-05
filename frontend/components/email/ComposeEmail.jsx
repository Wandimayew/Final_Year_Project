"use client";

import React, { useState, useEffect, Suspense, useMemo } from "react";
import { useComposeEmail } from "@/lib/api/communicationService/email";
import { useUsersByRoles } from "@/lib/api/userManagementService/user";
import { useRoles } from "@/lib/api/userManagementService/role";
import { useAuthStore } from "@/lib/auth";
import { useUserStore } from "@/lib/store/userStore";
import { useRouter } from "next/navigation";
import {
  PaperAirplaneIcon,
  DocumentIcon,
  TrashIcon,
  XMarkIcon,
} from "@heroicons/react/24/solid";

const ComposeEmailContent = () => {
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
  const composeEmailMutation = useComposeEmail(user?.schoolId);
  const { usersByRoles, isLoading: usersLoading } = useUserStore();

  console.log(" ROLES TO BE SELECTED : ", usersByRoles);

  const [recipientId, setRecipientId] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [templateId, setTemplateId] = useState("");
  const [attachments, setAttachments] = useState([]);
  const [message, setMessage] = useState("");
  const [selectedRoleId, setSelectedRoleId] = useState("");

  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB limit
  const MAX_SUBJECT_LENGTH = 200;
  const MAX_BODY_LENGTH = 5000;

  const schoolId = user?.schoolId;
  const {
    data: rolesData,
    isLoading: rolesLoading,
    error: rolesError,
  } = useRoles(schoolId);

  const {
    data: usersData,
    refetch: refetchUsers,
    isLoading: usersFetching,
  } = useUsersByRoles(schoolId, selectedRoleId ? [selectedRoleId] : []);

  console.log(" USERS USING ROLES : ", usersData);

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/login");
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    if (selectedRoleId) {
      refetchUsers(); // Fetch users when role changes
    }
  }, [selectedRoleId, refetchUsers]);

  const resetForm = () => {
    setTimeout(() => {
      setMessage("");
      setRecipientId("");
      setSubject("");
      setBody("");
      setTemplateId("");
      setAttachments([]);
      setSelectedRoleId("");
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
    setAttachments((prev) => [...prev, ...newAttachments].slice(0, 5));
  };

  const handleRemoveAttachment = (index) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e, send = true) => {
    e.preventDefault();
    if (!user || composeEmailMutation.isLoading) return;

    const emailRequest = {
      senderId: user.userId,
      recipientId,
      subject: subject.trim(),
      body: body.trim(),
      templateId: templateId || null,
    };

    try {
      await composeEmailMutation.mutateAsync({
        emailRequest,
        attachments,
        send,
      });
      setMessage(
        send ? "Email sent successfully!" : "Email saved as draft successfully!"
      );
      resetForm();
    } catch (error) {
      setMessage(error.message || `Failed to ${send ? "send" : "save"} email.`);
    }
  };

  if (usersData) {
    usersData.map((user) =>
      console.log(" user email in map function : ", user.userId)
    );
  }
  const handleDraft = (e) => handleSubmit(e, false);

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-gray-100 pl-60">
      <div className="h-full p-4 md:p-8">
        <div className="bg-white rounded-xl shadow-lg p-6 h-full flex flex-col transition-all hover:shadow-xl">
          {/* Header */}
          <div className="flex items-center justify-between mb-6 flex-col md:flex-row gap-4">
            <div className="flex items-center gap-3">
              <PaperAirplaneIcon className="h-8 w-8 text-blue-600" />
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
                Compose Email
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

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex-1 flex flex-col gap-6">
            {/* Role Selection */}
            <div>
              <label
                htmlFor="roleId"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Select Role
              </label>
              {rolesLoading ? (
                <div className="flex items-center gap-2">
                  <svg
                    className="animate-spin h-5 w-5 text-blue-600"
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
                  <span>Loading roles...</span>
                </div>
              ) : rolesError ? (
                <p className="text-red-600 text-sm">
                  Failed to load roles: {rolesError.message}
                </p>
              ) : (
                <select
                  id="roleId"
                  value={selectedRoleId}
                  onChange={(e) => setSelectedRoleId(Number(e.target.value))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-gray-50"
                >
                  <option value="">-- Select a Role --</option>
                  {rolesData?.map((role) => (
                    <option key={role.roleId} value={role.roleId}>
                      {role.name}
                    </option>
                  ))}
                </select>
              )}
              <p className="mt-1 text-xs text-gray-500">
                Select a role to fetch users
              </p>
            </div>

            {/* Recipient Field */}
            <div>
              <label
                htmlFor="recipientId"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                To
              </label>
              {usersFetching && usersData ? (
                <div className="flex items-center gap-2">
                  <svg
                    className="animate-spin h-5 w-5 text-blue-600"
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
                  <span>Loading recipients...</span>
                </div>
              ) : (
                <select
                  id="recipientId"
                  value={recipientId}
                  onChange={(e) => setRecipientId(e.target.value)}
                  required
                  disabled={!selectedRoleId || usersData.length === 0}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-gray-50 disabled:bg-gray-200"
                >
                  <option value="">-- Select a Recipient --</option>
                  {usersData?.map((user) => (
                    <option key={user.userId} value={user.userId}>
                      {user.username}
                    </option>
                  ))}
                </select>
              )}
              <p className="mt-1 text-xs text-gray-500">
                {selectedRoleId
                  ? "Select a recipient by email"
                  : "Select a role first"}
              </p>
            </div>

            {/* Subject Field */}
            <div>
              <label
                htmlFor="subject"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Subject
              </label>
              <input
                id="subject"
                type="text"
                value={subject}
                onChange={(e) =>
                  setSubject(e.target.value.slice(0, MAX_SUBJECT_LENGTH))
                }
                required
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-gray-50"
                placeholder="Enter email subject"
              />
              <p className="mt-1 text-xs text-gray-500">
                {subject.length}/{MAX_SUBJECT_LENGTH} characters
              </p>
            </div>

            {/* Body Field */}
            <div className="flex-1">
              <label
                htmlFor="body"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Message
              </label>
              <textarea
                id="body"
                value={body}
                onChange={(e) =>
                  setBody(e.target.value.slice(0, MAX_BODY_LENGTH))
                }
                required
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-gray-50 resize-y h-full min-h-[200px]"
                placeholder="Type your message here..."
              />
              <p className="mt-1 text-xs text-gray-500">
                {body.length}/{MAX_BODY_LENGTH} characters
              </p>
            </div>

            {/* Template ID Field */}
            <div>
              <label
                htmlFor="templateId"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Template ID (Optional)
              </label>
              <input
                id="templateId"
                type="number"
                value={templateId}
                onChange={(e) => setTemplateId(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-gray-50"
                placeholder="Enter template ID if available"
              />
              <p className="mt-1 text-xs text-gray-500">
                Apply a styling template if available
              </p>
            </div>

            {/* Attachments */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Attachments
              </label>
              <div className="flex flex-col md:flex-row gap-4 items-start">
                <label className="flex items-center gap-2 px-4 py-2 bg-teal-100 text-teal-700 rounded-lg cursor-pointer hover:bg-teal-200 transition-colors">
                  <DocumentIcon className="h-5 w-5" />
                  Attach Files
                  <input
                    type="file"
                    multiple
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
                <div className="flex flex-wrap gap-2">
                  {attachments.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
                    >
                      <span>{`${file.name} (${(file.size / 1024).toFixed(
                        2
                      )} KB)`}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveAttachment(index)}
                        className="text-red-600 hover:text-red-800"
                        aria-label={`Remove ${file.name}`}
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Buttons and Message */}
            <div className="flex flex-col md:flex-row gap-4 items-center">
              <button
                type="submit"
                disabled={composeEmailMutation.isLoading}
                className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400 transition-all shadow-md"
              >
                {composeEmailMutation.isLoading ? (
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
                  <PaperAirplaneIcon className="h-5 w-5" />
                )}
                Send
              </button>
              <button
                type="button"
                onClick={handleDraft}
                disabled={composeEmailMutation.isLoading}
                className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-orange-100 text-orange-600 rounded-lg hover:bg-orange-200 disabled:bg-orange-50 transition-all"
              >
                {composeEmailMutation.isLoading ? (
                  <svg
                    className="animate-spin h-5 w-5 text-orange-600"
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
                  <DocumentIcon className="h-5 w-5" />
                )}
                Save Draft
              </button>
              {message && (
                <p
                  className={`text-sm animate-fade-in ${
                    message.includes("Failed")
                      ? "text-red-600"
                      : "text-teal-600"
                  }`}
                >
                  {message}
                </p>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

const ComposeEmail = () => {
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
      <ComposeEmailContent />
    </Suspense>
  );
};

export default ComposeEmail;
