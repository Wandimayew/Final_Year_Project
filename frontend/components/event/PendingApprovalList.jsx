"use client";

import React, { useState, useEffect, useCallback } from "react"; // Added useCallback
import axios from "axios";
import { useAuth } from "@/hooks/useAuth";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import AnnouncementCard from "./AnnouncementCard";
import ConfirmationModal from "../common/ConfirmationModal";
import Loader from "../shared/Loader";

const API_BASE_URL = "http://localhost:8084/communication/api";

const approveAnnouncement = ({ schoolId, token, announcementId }) =>
  axios.put(
    `${API_BASE_URL}/${schoolId}/announcements/${announcementId}/approve`,
    {},
    { headers: { Authorization: `Bearer ${token}` } }
  );

const cancelAnnouncement = ({
  schoolId,
  token,
  announcementId,
  rejectionReason,
}) =>
  axios.put(
    `${API_BASE_URL}/${schoolId}/announcements/${announcementId}/cancel`,
    { status: "CANCELED", rejectionReason },
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );

const PendingApprovalList = () => {
  const { auth, loading: authLoading } = useAuth();
  const [pendingAnnouncements, setPendingAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [confirmation, setConfirmation] = useState(null);
  const queryClient = useQueryClient();

  const fetchPendingAnnouncements = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${API_BASE_URL}/${auth.user.schoolId}/announcements/pending-approval`,
        { headers: { Authorization: `Bearer ${auth.token}` } }
      );
      setPendingAnnouncements(response.data.data || []);
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to load pending announcements"
      );
    } finally {
      setLoading(false);
    }
  }, [auth]); // Dependencies: auth

  useEffect(() => {
    if (!authLoading && auth) fetchPendingAnnouncements();
  }, [auth, authLoading, fetchPendingAnnouncements]);

  const approveMutation = useMutation({
    mutationFn: approveAnnouncement,
    onSuccess: () => {
      toast.success("Announcement approved!");
      queryClient.invalidateQueries(["pendingAnnouncements"]);
      fetchPendingAnnouncements();
    },
    onError: (err) =>
      toast.error(err.response?.data?.message || "Failed to approve"),
  });

  const cancelMutation = useMutation({
    mutationFn: cancelAnnouncement,
    onSuccess: () => {
      toast.success("Announcement canceled!");
      queryClient.invalidateQueries(["pendingAnnouncements"]);
      fetchPendingAnnouncements();
    },
    onError: (err) =>
      toast.error(err.response?.data?.message || "Failed to cancel"),
  });

  const handleApprove = (announcementId) =>
    setConfirmation({ action: "approve", announcementId });
  const handleCancel = (announcementId) =>
    setConfirmation({ action: "cancel", announcementId, rejectionReason: "" });

  const confirmAction = () => {
    if (confirmation.action === "approve") {
      approveMutation.mutate({
        schoolId: auth.user.schoolId,
        token: auth.token,
        announcementId: confirmation.announcementId,
      });
    } else if (confirmation.action === "cancel") {
      cancelMutation.mutate({
        schoolId: auth.user.schoolId,
        token: auth.token,
        announcementId: confirmation.announcementId,
        rejectionReason: confirmation.rejectionReason,
      });
    }
    setConfirmation(null);
  };

  if (authLoading || loading) return <Loader />;
  if (!auth)
    return <div className="text-center text-red-500 p-6">Please log in.</div>;
  if (error) return <div className="text-center text-red-500 p-6">{error}</div>;

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-800 mb-8">
          Pending Approvals
        </h1>
        {pendingAnnouncements.length === 0 ? (
          <p className="text-center text-gray-500 text-lg">
            No pending announcements.
          </p>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {pendingAnnouncements.map((a) => (
              <AnnouncementCard
                key={a.announcementId}
                announcement={a}
                onRequestApproval={handleApprove}
                onCancel={handleCancel}
                isProcessing={
                  (approveMutation.isLoading &&
                    approveMutation.variables?.announcementId ===
                      a.announcementId) ||
                  (cancelMutation.isLoading &&
                    cancelMutation.variables?.announcementId ===
                      a.announcementId)
                }
                isAdmin
              />
            ))}
          </div>
        )}
        {confirmation && (
          <ConfirmationModal
            isOpen={true}
            onConfirm={confirmAction}
            onCancel={() => setConfirmation(null)}
            title={`Confirm ${
              confirmation.action === "approve" ? "Approval" : "Cancellation"
            }`}
            message={`Are you sure you want to ${confirmation.action} this announcement?`}
            confirmLabel="Yes"
            cancelLabel="No"
            confirmColor={confirmation.action === "approve" ? "green" : "red"}
            showReason={confirmation.action === "cancel"}
            reason={confirmation.rejectionReason || ""}
            setReason={(value) =>
              setConfirmation({ ...confirmation, rejectionReason: value })
            }
          />
        )}
      </div>
    </div>
  );
};

export default PendingApprovalList;
