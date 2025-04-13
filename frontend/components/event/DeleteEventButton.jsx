// components/event/DeleteEventButton.jsx
"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { useDeleteAnnouncement } from "@/lib/api/communicationService/announcement";
import { useAuthStore } from "@/lib/auth";
import { CircularProgress } from "@mui/material";
import { toast } from "react-toastify";

const DeleteEventButton = ({ announcementId }) => {
  const { getSchoolId } = useAuthStore();
  const schoolId = getSchoolId();
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const modalRef = useRef(null);

  const deleteAnnouncement = useDeleteAnnouncement(schoolId);

  const handleDelete = useCallback(() => {
    deleteAnnouncement.mutate(announcementId, {
      onSuccess: () => {
        setIsConfirmOpen(false);
        toast.success("Event deleted successfully!", { position: "top-right" });
      },
      onError: (err) => {
        toast.error("Failed to delete event: " + err.message, {
          position: "top-right",
        });
      },
    });
  }, [deleteAnnouncement, announcementId]);

  const openModal = useCallback(() => setIsConfirmOpen(true), []);
  const closeModal = useCallback(() => setIsConfirmOpen(false), []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        closeModal();
      }
    };
    if (isConfirmOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isConfirmOpen, closeModal]);

  return (
    <>
      <button
        onClick={openModal}
        className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600"
      >
        Delete
      </button>
      {isConfirmOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div
            ref={modalRef}
            className="bg-white rounded-lg p-6 shadow-md w-full max-w-sm"
          >
            <h2 className="text-lg font-semibold mb-4">Confirm Deletion</h2>
            <p className="mb-6">Are you sure you want to delete this event?</p>
            <div className="flex gap-2">
              <button
                onClick={handleDelete}
                disabled={deleteAnnouncement.isLoading}
                className="flex-1 bg-red-600 text-white py-2 rounded hover:bg-red-700 disabled:bg-gray-400 flex items-center justify-center"
              >
                {deleteAnnouncement.isLoading ? (
                  <CircularProgress
                    size={20}
                    color="inherit"
                    className="mr-2"
                  />
                ) : null}
                {deleteAnnouncement.isLoading ? "Deleting..." : "Yes, Delete"}
              </button>
              <button
                onClick={closeModal}
                disabled={deleteAnnouncement.isLoading}
                className="flex-1 bg-gray-300 text-gray-800 py-2 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default DeleteEventButton;
