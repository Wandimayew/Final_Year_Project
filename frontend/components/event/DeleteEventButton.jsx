// components/event/DeleteEventButton.js
"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { CircularProgress } from "@mui/material";
import { toast } from "react-toastify";

const API_BASE_URL = "http://localhost:8086/communication/api";

const DeleteEventButton = ({ announcementId }) => {
  const { auth } = useAuth();
  const queryClient = useQueryClient();
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const modalRef = useRef(null);

  const deleteMutation = useMutation({
    mutationFn: () =>
      fetch(`${API_BASE_URL}/${auth.user.schoolId}/announcements/${announcementId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${auth.token}` },
      }).then((res) => {
        if (!res.ok) throw new Error("Failed to delete event");
        return res.json();
      }),
    onMutate: async () => {
      await queryClient.cancelQueries(["announcements", auth.user.schoolId]);
      const previousAnnouncements = queryClient.getQueryData([
        "announcements",
        auth.user.schoolId,
      ]);
      queryClient.setQueryData(["announcements", auth.user.schoolId], (old) => {
        if (!old?.data) return old;
        return {
          ...old,
          data: old.data.filter((item) => item.announcementId !== announcementId),
        };
      });
      return { previousAnnouncements };
    },
    onSuccess: () => {
      setIsConfirmOpen(false);
      toast.success("Event deleted successfully!", {
        position: "top-right",
      });
    },
    onError: (err, variables, context) => {
      queryClient.setQueryData(
        ["announcements", auth.user.schoolId],
        context.previousAnnouncements
      );
      toast.error("Failed to delete event: " + err.message, {
        position: "top-right",
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries(["announcements", auth.user.schoolId]);
    },
    retry: 2,
    retryDelay: 1000,
  });

  const openModal = useCallback(() => setIsConfirmOpen(true), []);
  const closeModal = useCallback(() => setIsConfirmOpen(false), []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) closeModal();
    };
    if (isConfirmOpen) document.add, personally, addEventListener("mousedown", handleClickOutside);
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
          <div ref={modalRef} className="bg-white rounded-lg p-6 shadow-md w-full max-w-sm">
            <h2 className="text-lg font-semibold mb-4">Confirm Deletion</h2>
            <p className="mb-6">Are you sure you want to delete this event?</p>
            <div className="flex gap-2">
              <button
                onClick={() => deleteMutation.mutate()}
                disabled={deleteMutation.isLoading}
                className="flex-1 bg-red-600 text-white py-2 rounded hover:bg-red-700 disabled:bg-gray-400 flex items-center justify-center"
              >
                {deleteMutation.isLoading ? (
                  <CircularProgress size={20} color="inherit" className="mr-2" />
                ) : null}
                {deleteMutation.isLoading ? "Deleting..." : "Yes, Delete"}
              </button>
              <button
                onClick={closeModal}
                disabled={deleteMutation.isLoading}
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