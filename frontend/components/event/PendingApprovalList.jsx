"use client";

import React, { useState, useCallback, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/lib/auth";
import {
  useAllPendingApprovals,
  useApproveAnnouncement,
  useCancelAnnouncement,
} from "@/lib/api/communicationService/announcement";
import { toast } from "react-toastify";
import AnnouncementCard from "./AnnouncementCard";
import ConfirmationModal from "../common/ConfirmationModal";
import Loader from "../shared/Loader";

const getAuthSnapshot = () => {
  const state = useAuthStore.getState();
  return {
    user: state.user,
    token: state.token,
    isAuthenticated: state.isAuthenticated(),
    loading: state.loading,
  };
};

const PendingApprovalList = () => {
  const queryClient = useQueryClient();
  const [authState, setAuthState] = useState(getAuthSnapshot());

  useEffect(() => {
    const unsubscribe = useAuthStore.subscribe((state) => {
      setAuthState({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated(),
        loading: state.loading,
      });
    });
    return () => unsubscribe();
  }, []);

  const { user, token, isAuthenticated, loading: authLoading } = authState;
  const [confirmation, setConfirmation] = useState(null);

  const { data, isLoading, isFetching, isError, error } = useAllPendingApprovals(
    user?.schoolId
  );
  const pendingAnnouncements = data?.data || [];

  const approveAnnouncement = useApproveAnnouncement(user?.schoolId);
  const cancelAnnouncement = useCancelAnnouncement(user?.schoolId);

  const handleApprove = useCallback(
    (announcementId) => setConfirmation({ action: "approve", announcementId }),
    []
  );

  const handleCancel = useCallback(
    (announcementId) =>
      setConfirmation({
        action: "cancel",
        announcementId,
        rejectionReason: "",
      }),
    []
  );

  console.log("Render state:", { authLoading, isLoading, isFetching, pendingAnnouncements });

  const confirmAction = useCallback(() => {
    if (confirmation.action === "approve") {
      queryClient.setQueryData(
        ["announcements", user?.schoolId, "pending-approval"],
        (old = { data: [] }) => ({
          ...old,
          data: old.data.filter(
            (ann) => ann.announcementId !== confirmation.announcementId
          ),
        })
      );
      approveAnnouncement.mutate(confirmation.announcementId, {
        onSuccess: () => {
          toast.success("Announcement approved successfully!", {
            position: "top-right",
          });
        },
        onError: (err) => {
          toast.error(err.message || "Failed to approve announcement", {
            position: "top-right",
          });
          queryClient.invalidateQueries([
            "announcements",
            user?.schoolId,
            "pending-approval",
          ]);
        },
      });
    } else if (confirmation.action === "cancel") {
      queryClient.setQueryData(
        ["announcements", user?.schoolId, "pending-approval"],
        (old = { data: [] }) => ({
          ...old,
          data: old.data.filter(
            (ann) => ann.announcementId !== confirmation.announcementId
          ),
        })
      );
      cancelAnnouncement.mutate(
        {
          announcementId: confirmation.announcementId,
          rejectionReason: confirmation.rejectionReason,
        },
        {
          onSuccess: () => {
            toast.success("Announcement canceled successfully!", {
              position: "top-right",
            });
          },
          onError: (err) => {
            toast.error(err.message || "Failed to cancel announcement", {
              position: "top-right",
            });
            queryClient.invalidateQueries([
              "announcements",
              user?.schoolId,
              "pending-approval",
            ]);
          },
        }
      );
    }
    setConfirmation(null);
  }, [
    confirmation,
    approveAnnouncement,
    cancelAnnouncement,
    queryClient,
    user?.schoolId,
  ]);

  if (authLoading) return <Loader />;
  console.log("Render state:", { authLoading, isLoading, isFetching, pendingAnnouncements });
  
  if (!isAuthenticated) {
    return <div className="text-center text-red-500 p-6">Please log in.</div>;
  }
  if (isError) {
    return (
      <div className="text-center text-red-500 p-6">
        {error?.message || "Failed to load pending announcements"}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-800 mb-8">Pending Approvals</h1>
        {isLoading && !data ? (
          <Loader />
        ) : pendingAnnouncements.length === 0 ? (
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
                  (approveAnnouncement.isLoading &&
                    approveAnnouncement.variables === a.announcementId) ||
                  (cancelAnnouncement.isLoading &&
                    cancelAnnouncement.variables?.announcementId ===
                      a.announcementId)
                }
                isAdmin
              />
            ))}
          </div>
        )}
        {isFetching && data && (
          <p className="text-center text-gray-500">Updating...</p>
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