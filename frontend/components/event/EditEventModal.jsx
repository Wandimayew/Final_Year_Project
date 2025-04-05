"use client";
import React, { useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import Modal from "./Modal";
import { CircularProgress } from "@mui/material";
import { toast } from "react-toastify";

const API_BASE_URL = "http://localhost:8084/communication/api";

const editAnnouncement = async ({ schoolId, token, announcementId, data }) => {
  const response = await fetch(
    `${API_BASE_URL}/${schoolId}/announcements/${announcementId}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    }
  );
  if (!response.ok) throw new Error("Failed to update event");
  return response.json();
};

const EditEventModal = React.memo(({ announcement }) => {
  const { auth } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      title: announcement.title,
      message: announcement.message,
      startDate: announcement.startDate
        ? new Date(announcement.startDate).toISOString().slice(0, 16)
        : "",
      endDate: announcement.endDate
        ? new Date(announcement.endDate).toISOString().slice(0, 16)
        : "",
    },
  });

  const editMutation = useMutation({
    mutationFn: ({ data }) =>
      editAnnouncement({
        schoolId: auth.user.schoolId,
        token: auth.token,
        announcementId: announcement.announcementId,
        data,
      }),
    onMutate: async ({ data }) => {
      await queryClient.cancelQueries(["announcements", auth.user.schoolId]);
      const previousAnnouncements = queryClient.getQueryData([
        "announcements",
        auth.user.schoolId,
      ]);
      queryClient.setQueryData(["announcements", auth.user.schoolId], (old) => {
        if (!old?.data) return old;
        return {
          ...old,
          data: old.data.map((item) =>
            item.announcementId === announcement.announcementId
              ? { ...item, ...data }
              : item
          ),
        };
      });
      return { previousAnnouncements };
    },
    onSuccess: () => {
      setIsOpen(false);
      toast.success("Event updated successfully!", { position: "top-right" });
    },
    onError: (err, variables, context) => {
      queryClient.setQueryData(
        ["announcements", auth.user.schoolId],
        context.previousAnnouncements
      );
      toast.error("Failed to update event: " + err.message, {
        position: "top-right",
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries(["announcements", auth.user.schoolId]);
    },
  });

  const onSubmit = useCallback(
    (data) => {
      const updatedData = {
        ...announcement,
        ...data,
        startDate: new Date(data.startDate).toISOString(),
        endDate: new Date(data.endDate).toISOString(),
      };
      editMutation.mutate({ data: updatedData });
    },
    [editMutation, announcement]
  );

  const openModal = useCallback(() => {
    reset({
      title: announcement.title,
      message: announcement.message,
      startDate: announcement.startDate
        ? new Date(announcement.startDate).toISOString().slice(0, 16)
        : "",
      endDate: announcement.endDate
        ? new Date(announcement.endDate).toISOString().slice(0, 16)
        : "",
    });
    setIsOpen(true);
  }, [announcement, reset]);

  const closeModal = useCallback(() => setIsOpen(false), []);

  return (
    <>
      <button
        onClick={openModal}
        className="flex-1 bg-yellow-500 text-white py-2 rounded-md hover:bg-yellow-600 transition-colors duration-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-opacity-50"
      >
        Edit
      </button>
      <Modal isOpen={isOpen} onClose={closeModal} title="Edit Event">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <input
              type="text"
              {...register("title", { required: "Title is required" })}
              className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-400 focus:border-transparent"
              placeholder="Title"
              disabled={editMutation.isLoading}
            />
            {errors.title && (
              <p className="text-sm text-red-500">{errors.title.message}</p>
            )}
          </div>
          <div>
            <textarea
              {...register("message")}
              rows="3"
              placeholder="Message"
              className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-400 focus:border-transparent"
              disabled={editMutation.isLoading}
            />
          </div>
          <div>
            <input
              type="datetime-local"
              {...register("startDate", { required: "Start Date is required" })}
              className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-400 focus:border-transparent"
              disabled={editMutation.isLoading}
            />
            {errors.startDate && (
              <p className="text-sm text-red-500">{errors.startDate.message}</p>
            )}
          </div>
          <div>
            <input
              type="datetime-local"
              {...register("endDate", { required: "End Date is required" })}
              className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-400 focus:border-transparent"
              disabled={editMutation.isLoading}
            />
            {errors.endDate && (
              <p className="text-sm text-red-500">{errors.endDate.message}</p>
            )}
          </div>
          <div className="flex space-x-2">
            <button
              type="submit"
              disabled={editMutation.isLoading}
              className="flex-1 bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400 transition-colors duration-200 flex items-center justify-center"
            >
              {editMutation.isLoading ? (
                <CircularProgress size={20} color="inherit" className="mr-2" />
              ) : null}
              {editMutation.isLoading ? "Saving..." : "Save"}
            </button>
            <button
              type="button"
              onClick={closeModal}
              disabled={editMutation.isLoading}
              className="flex-1 bg-gray-300 text-gray-800 py-2 rounded-md hover:bg-gray-400 transition-colors duration-200"
            >
              Cancel
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
});

EditEventModal.displayName = "EditEventModal"; // Added displayName

export default EditEventModal;
