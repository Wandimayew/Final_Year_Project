// components/event/ChangeStatusModal.jsx
"use client";

import React, { useState } from "react";
import { useUpdateAnnouncementStatus } from "@/lib/api/communicationService/announcement";
import { useAuthStore } from "@/lib/auth";
import Modal from "./Modal";
import ActionButton from "../common/ActionButton";
import { toast } from "react-toastify";

const ChangeStatusModal = ({ announcement }) => {
  const { getSchoolId } = useAuthStore();
  const schoolId = getSchoolId();
  const [isOpen, setIsOpen] = useState(false);
  const [newStatus, setNewStatus] = useState(announcement.status);

  const updateAnnouncementStatus = useUpdateAnnouncementStatus(schoolId);

  const handleStatusChange = () => {
    updateAnnouncementStatus.mutate(
      {
        announcementId: announcement.announcementId,
        status: newStatus,
      },
      {
        onSuccess: () => {
          setIsOpen(false);
          toast.success("Status updated successfully!", {
            position: "top-right",
          });
        },
        onError: (err) => {
          toast.error(err.message || "Failed to update status", {
            position: "top-right",
          });
        },
      }
    );
  };

  const statusOptions =
    announcement.status === "ARCHIVED"
      ? [{ value: "PUBLISHED", label: "Unarchive" }]
      : [
          { value: "ARCHIVED", label: "Archive" },
          { value: "CANCELLED", label: "Cancel" },
        ];

  return (
    <>
      <ActionButton
        label="Change Status"
        onClick={() => setIsOpen(true)}
        color="green"
        className="px-4 py-2"
      />
      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Change Status"
      >
        <div className="space-y-4">
          <select
            value={newStatus}
            onChange={(e) => setNewStatus(e.target.value)}
            className="w-full border rounded-md p-2 focus:ring-2 focus:ring-blue-400"
            disabled={updateAnnouncementStatus.isLoading}
          >
            {statusOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <div className="flex gap-4">
            <ActionButton
              label="Update"
              onClick={handleStatusChange}
              isLoading={updateAnnouncementStatus.isLoading}
              color="blue"
              className="w-full"
            />
            <ActionButton
              label="Cancel"
              onClick={() => setIsOpen(false)}
              color="gray"
              className="w-full"
            />
          </div>
        </div>
      </Modal>
    </>
  );
};

export default ChangeStatusModal;
