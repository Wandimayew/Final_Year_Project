"use client";

import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useAuth } from "@/hooks/useAuth";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Calendar,
  Users,
  Tag,
  Clock,
  AlertCircle,
  FileText,
  XCircle,
  User,
  Calendar as CalendarIcon,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";

const API_BASE_URL = "http://10.194.61.74:8080/communication/api";

const StatusTabs = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { id: "DRAFT", icon: FileText, label: "Draft" },
    { id: "PENDING", icon: Clock, label: "Pending" },
    { id: "CANCELLED", icon: XCircle, label: "Cancelled" },
  ];

  return (
    <div className="flex flex-wrap gap-4 mb-8">
      {tabs.map(({ id, icon: Icon, label }) => (
        <button
          key={id}
          onClick={() => setActiveTab(id)}
          className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all transform hover:scale-105 ${
            activeTab === id
              ? "bg-blue-600 text-white shadow-lg"
              : "bg-white text-gray-700 hover:bg-blue-50"
          }`}
        >
          <Icon size={18} />
          <span>{label}</span>
        </button>
      ))}
    </div>
  );
};

const EmptyState = ({ status }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="flex flex-col items-center justify-center p-8 bg-white rounded-xl shadow-sm"
  >
    <AlertCircle className="w-16 h-16 text-gray-400 mb-4" />
    <h3 className="text-xl font-semibold text-gray-700 mb-2">
      No {status.toLowerCase()} announcements
    </h3>
    <p className="text-gray-500 text-center max-w-md">
      {status === "DRAFT"
        ? "Start creating announcements to keep your community informed."
        : `You don't have any ${status.toLowerCase()} announcements at the moment.`}
    </p>
  </motion.div>
);

const AnnouncementCard = ({
  announcement,
  onRequestApproval,
  onDelete,
  isProcessing,
}) => {
  const formatDate = (dateString) => {
    return format(new Date(dateString), "MMM dd, yyyy HH:mm");
  };

  const getAudienceBadgeColor = (audience) => {
    const colors = {
      Students: "bg-green-100 text-green-800",
      Teachers: "bg-purple-100 text-purple-800",
      Parents: "bg-orange-100 text-orange-800",
      Staff: "bg-blue-100 text-blue-800",
      default: "bg-gray-100 text-gray-800",
    };
    return colors[audience] || colors.default;
  };

  const getTypeBadgeColor = (type) => {
    const colors = {
      EVENT: "bg-indigo-100 text-indigo-800",
      NOTICE: "bg-yellow-100 text-yellow-800",
      ALERT: "bg-red-100 text-red-800",
      default: "bg-gray-100 text-gray-800",
    };
    return colors[type] || colors.default;
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow"
    >
      {/* Header with Status */}
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-lg font-semibold text-gray-800 line-clamp-2">
          {announcement.title || "Untitled Announcement"}
        </h3>
        <span
          className={`px-3 py-1 rounded-full text-sm font-medium
          ${
            announcement.status === "DRAFT"
              ? "bg-yellow-100 text-yellow-800"
              : announcement.status === "PENDING"
              ? "bg-blue-100 text-blue-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {announcement.status.charAt(0) +
            announcement.status.slice(1).toLowerCase()}
        </span>
      </div>

      {/* Description */}
      <p className="text-gray-600 mb-4 line-clamp-3">
        {announcement.message || "No description provided"}
      </p>

      {/* Meta Information */}
      <div className="space-y-3 mb-4">
        {/* Author and Date */}
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center text-gray-600">
            <User size={16} className="mr-2" />
            <span>Created by: {announcement.createdBy}</span>
          </div>
          <div className="flex items-center text-gray-600">
            <CalendarIcon size={16} className="mr-2" />
            <span>{formatDate(announcement.createdAt)}</span>
          </div>
        </div>

        {/* Audience and Type */}
        <div className="flex flex-wrap gap-2">
          <span
            className={`flex items-center px-3 py-1 rounded-full text-sm ${getAudienceBadgeColor(
              announcement.targetAudience
            )}`}
          >
            <Users size={14} className="mr-1" />
            {announcement.targetAudience}
          </span>
          <span
            className={`flex items-center px-3 py-1 rounded-full text-sm ${getTypeBadgeColor(
              announcement.type
            )}`}
          >
            <Tag size={14} className="mr-1" />
            {announcement.type}
          </span>
        </div>

        {/* Date Range */}
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Clock size={16} />
          <span>
            {formatDate(announcement.startDate)} -{" "}
            {formatDate(announcement.endDate)}
          </span>
        </div>

        {/* Cancellation Reason - Only show if status is CANCELLED */}
        {announcement.status === "CANCELLED" &&
          announcement.cancellationReason && (
            <div className="mt-3 p-3 bg-red-50 rounded-lg">
              <div className="flex items-start">
                <XCircle size={16} className="text-red-500 mr-2 mt-1" />
                <div>
                  <span className="font-medium text-red-800">
                    Cancellation Reason:
                  </span>
                  <p className="text-red-600 text-sm mt-1">
                    {announcement.cancellationReason}
                  </p>
                </div>
              </div>
            </div>
          )}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 mt-auto">
        {announcement.status === "DRAFT" && (
          <>
            <button
              onClick={() => onRequestApproval(announcement.announcementId)}
              disabled={isProcessing}
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Request Approval
            </button>
            <button
              onClick={() => onDelete(announcement.announcementId)}
              disabled={isProcessing}
              className="bg-red-50 text-red-600 py-2 px-4 rounded-lg hover:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Delete
            </button>
          </>
        )}
      </div>
    </motion.div>
  );
};
const CreatorAnnouncements = () => {
  const { auth, loading: authLoading } = useAuth();
  const [announcements, setAnnouncements] = useState([]);
  const [activeTab, setActiveTab] = useState("DRAFT");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const queryClient = useQueryClient();

  const fetchAnnouncements = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(
        `${API_BASE_URL}/${auth.user.schoolId}/announcements/my-announcements/status-draft?page=0&size=10`,
        { headers: { Authorization: `Bearer ${auth.token}` } }
      );
      setAnnouncements(response.data.data.content || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load announcements");
    } finally {
      setLoading(false);
    }
  }, [auth]); // Dependencies: auth

  useEffect(() => {
    if (!auth || authLoading) return;
    fetchAnnouncements();
  }, [auth, authLoading, fetchAnnouncements]);

  const requestApprovalMutation = useMutation({
    mutationFn: (announcementId) =>
      axios.put(
        `${API_BASE_URL}/${auth.user.schoolId}/announcements/${announcementId}/request-approval`,
        {},
        { headers: { Authorization: `Bearer ${auth.token}` } }
      ),
    onSuccess: fetchAnnouncements,
  });

  const deleteMutation = useMutation({
    mutationFn: (announcementId) =>
      axios.delete(
        `${API_BASE_URL}/${auth.user.schoolId}/announcements/${announcementId}`,
        { headers: { Authorization: `Bearer ${auth.token}` } }
      ),
    onSuccess: fetchAnnouncements,
  });

  const filtered = announcements.filter((a) => a.status === activeTab);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center p-8 bg-red-50 rounded-xl">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-red-700 mb-2">Error</h3>
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          My Announcements
        </h1>
        <StatusTabs activeTab={activeTab} setActiveTab={setActiveTab} />

        {filtered.length === 0 ? (
          <EmptyState status={activeTab} />
        ) : (
          <AnimatePresence>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((announcement) => (
                <AnnouncementCard
                  key={announcement.announcementId}
                  announcement={announcement}
                  onRequestApproval={requestApprovalMutation.mutate}
                  onDelete={deleteMutation.mutate}
                  isProcessing={
                    requestApprovalMutation.isLoading ||
                    deleteMutation.isLoading
                  }
                />
              ))}
            </div>
          </AnimatePresence>
        )}
      </div>
    </div>
  );
};

export default CreatorAnnouncements;
