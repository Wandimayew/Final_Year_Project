"use client"
import React, { useState } from "react";
import toast from "react-hot-toast";
import ActionButton from "../common/ActionButton";
import ConfirmationModal from "../common/ConfirmationModal";

const AnnouncementCard = ({
  announcement,
  onRequestApproval,
  onCancel,
  isProcessing,
  isAdmin = false, // For PendingApprovalList
}) => {
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const status = announcement.status;

  const handleRequestApproval = () => {
    const message =
      "The admin will review your request and approve it. Once approved, your audience can view your post, and it will be marked as published. Please wait for admin approval confirmation.";
    toast.success(message, { duration: 5000, position: "top-center" });
    onRequestApproval(announcement.announcementId);
  };

  const handleCancel = () => {
    if (!showCancelConfirm) {
      setShowCancelConfirm(true);
      return;
    }
    onCancel(announcement.announcementId);
    setShowCancelConfirm(false);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 transition-all duration-300 hover:shadow-lg">
      <h2 className="text-lg font-semibold text-gray-800 truncate">
        {announcement.title}
      </h2>
      <p className="text-gray-600 mt-2 line-clamp-2">{announcement.message}</p>
      <div className="mt-4 text-sm text-gray-600 space-y-2">
        <p><span className="font-medium text-blue-700">Audience:</span> {announcement.targetAudience}</p>
        <p><span className="font-medium text-blue-700">Type:</span> {announcement.type}</p>
        <p><span className="font-medium text-blue-700">Author:</span> {announcement.authorId}</p>
        <p><span className="font-medium text-blue-700">Start:</span> {new Date(announcement.startDate).toLocaleString()}</p>
        <p><span className="font-medium text-blue-700">End:</span> {new Date(announcement.endDate).toLocaleString()}</p>
        {announcement.rejectionReason && (
          <p><span className="font-medium text-red-700">Reason:</span> {announcement.rejectionReason}</p>
        )}
      </div>
      <div className="mt-4 flex gap-4">
        {/* Creator View */}
        {!isAdmin && status === "DRAFT" && (
          <ActionButton
            label="Request Approval"
            onClick={handleRequestApproval}
            isLoading={isProcessing}
            color="green"
            className="w-full"
          />
        )}
        {!isAdmin && (status === "DRAFT" || status === "PENDING") && (
          <ActionButton
            label="Cancel"
            onClick={handleCancel}
            isLoading={isProcessing}
            color="red"
            className="w-full"
          />
        )}
        {/* Admin View */}
        {isAdmin && status === "PENDING" && (
          <>
            <ActionButton
              label="Approve"
              onClick={() => onRequestApproval(announcement.announcementId)}
              isLoading={isProcessing}
              color="green"
              className="w-full"
            />
            <ActionButton
              label="Cancel"
              onClick={() => onCancel(announcement.announcementId)}
              isLoading={isProcessing}
              color="red"
              className="w-full"
            />
          </>
        )}
      </div>

      {/* Cancel Confirmation */}
      {showCancelConfirm && (
        <ConfirmationModal
          isOpen={true}
          onConfirm={handleCancel}
          onCancel={() => setShowCancelConfirm(false)}
          title="Confirm Cancellation"
          message="Your event will be deleted permanently. Are you sure?"
          confirmLabel="Yes"
          cancelLabel="No"
          confirmColor="red"
        />
      )}
    </div>
  );
};

export default AnnouncementCard;