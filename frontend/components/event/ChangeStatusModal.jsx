// components/event/ChangeStatusModal.js
"use client";

import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import Modal from "./Modal";
import ActionButton from "../common/ActionButton";
import toast from "react-hot-toast";

const API_BASE_URL = "http://localhost:8086/communication/api";

const changeStatus = async ({ schoolId, token, announcementId, status }) =>
  axios.put(
    `${API_BASE_URL}/${schoolId}/announcements/${announcementId}/status?status=${status}`,
    {},
    { headers: { Authorization: `Bearer ${token}` } }
  );

const ChangeStatusModal = ({ announcement }) => {
  const { auth } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [newStatus, setNewStatus] = useState(announcement.status);
  const queryClient = useQueryClient();

  const statusMutation = useMutation({
    mutationFn: ({ status }) => changeStatus({
      schoolId: auth.user.schoolId,
      token: auth.token,
      announcementId: announcement.announcementId,
      status,
    }),
    onSuccess: () => {
      setIsOpen(false);
      toast.success("Status updated!");
      queryClient.invalidateQueries(["announcements"]);
    },
    onError: (err) => toast.error(err.response?.data?.message || "Failed to update status"),
  });

  const statusOptions = announcement.status === "ARCHIVED"
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
      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Change Status">
        <div className="space-y-4">
          <select
            value={newStatus}
            onChange={(e) => setNewStatus(e.target.value)}
            className="w-full border rounded-md p-2 focus:ring-2 focus:ring-blue-400"
            disabled={statusMutation.isLoading}
          >
            {statusOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          <div className="flex gap-4">
            <ActionButton
              label="Update"
              onClick={() => statusMutation.mutate({ status: newStatus })}
              isLoading={statusMutation.isLoading}
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