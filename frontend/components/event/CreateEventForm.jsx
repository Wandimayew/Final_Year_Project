"use client";

import React, { useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/auth";
import { useCreateAnnouncement } from "@/lib/api/communicationService/announcement"; // Assuming this is where announcementApi is
import FormInput from "@/components/ui/FormInput";
import FormSelect from "@/components/ui/FormSelect";
import FormTextarea from "@/components/ui/FormTextarea";
import SubmitButton from "@/components/ui/SubmitButton";

const CreateEventForm = () => {
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
  const [error, setError] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      title: "",
      message: "",
      targetAudience: "",
      type: "EVENT",
      startDate: "",
      endDate: "",
      status: "DRAFT",
      templateId: "",
    },
  });

  const createMutation = useCreateAnnouncement(user?.schoolId);

  const onSubmit = (data) => {
    if (!isAuthenticated ) {
      setError("You must be logged in to create an event.");
      return;
    }

    const announcementData = {
      ...data,
      schoolId: user.schoolId,
      authorId: user.userId, // Assuming your backend needs this
      startDate: new Date(data.startDate).toISOString(),
      endDate: new Date(data.endDate).toISOString(),
      templateId: data.templateId ? Number(data.templateId) : null,
    };

    createMutation.mutate(announcementData, {
      onSuccess: () => router.push("/communication/event/my-pending"),
      onError: (err) => setError(err.message || "Failed to create event"),
    });
  };

  if (!isAuthenticated) {
    return <div className="text-center p-6 text-red-500">Please log in.</div>;
  }

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">
        Create New Event
      </h1>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <FormInput
          label="Title"
          name="title"
          register={register}
          errors={errors}
          required
          maxLength={200}
        />
        <FormTextarea label="Message" name="message" register={register} />
        <FormSelect
          label="Target Audience"
          name="targetAudience"
          register={register}
          options={["ROLE_STUDENT", "ROLE_ADMIN", "ROLE_TEACHER","ROLE_PARENT"].map((v) => ({
            value: v,
            label: v,
          }))}
          required
        />
        <FormSelect
          label="Type"
          name="type"
          register={register}
          options={["EVENT", "NOTICE", "ALERT", "ANNOUNCEMENT"].map((v) => ({
            value: v,
            label: v,
          }))}
          required
        />
        <FormInput
          label="Start Date"
          name="startDate"
          type="datetime-local"
          register={register}
          errors={errors}
          required
        />
        <FormInput
          label="End Date"
          name="endDate"
          type="datetime-local"
          register={register}
          errors={errors}
          required
        />
        <FormSelect
          label="Status"
          name="status"
          register={register}
          options={["DRAFT", "PENDING"].map((v) => ({
            value: v,
            label: v,
          }))}
          required
        />
        <SubmitButton
          label="Create Event"
          isLoading={createMutation.isLoading}
        />
      </form>
    </div>
  );
};

export default CreateEventForm;
