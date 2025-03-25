// components/event/CreateEventForm.jsx
"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import FormInput from "@/components/ui/FormInput";
import FormSelect from "@/components/ui/FormSelect";
import FormTextarea from "@/components/ui/FormTextarea";
import SubmitButton from "@/components/ui/SubmitButton";

const API_BASE_URL = "http://10.194.61.74:8080/communication/api";

const createAnnouncement = async ({ schoolId, token, data }) => {
  const { schoolId: _, authorId: __, ...payload } = data; // Exclude schoolId and authorId
  const response = await axios.post(
    `${API_BASE_URL}/${schoolId}/announcements`,
    payload,
    { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } }
  );
  return response.data;
};

const CreateEventForm = () => {
  const { auth, loading: authLoading } = useAuth();
  const router = useRouter();
  const [error, setError] = useState(null);

  const { register, handleSubmit, formState: { errors } } = useForm({
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

  const createMutation = useMutation({
    mutationFn: ({ data }) => createAnnouncement({ schoolId: auth.user.schoolId, token: auth.token, data }),
    onSuccess: () => router.push("/communication/event/my-pending"),
    onError: (err) => setError(err.response?.data?.message || "Failed to create event"),
  });

  const onSubmit = (data) => {
    if (!auth?.token) {
      setError("You must be logged in to create an event.");
      return;
    }
    const announcementData = {
      ...data,
      startDate: new Date(data.startDate).toISOString(),
      endDate: new Date(data.endDate).toISOString(),
      templateId: data.templateId ? Number(data.templateId) : null,
    };
    createMutation.mutate({ data: announcementData });
  };

  if (authLoading) return <div className="text-center p-6">Loading...</div>;
  if (!auth) return <div className="text-center p-6 text-red-500">Please log in.</div>;

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Create New Event</h1>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <FormInput label="Title" name="title" register={register} errors={errors} required maxLength={200} />
        <FormTextarea label="Message" name="message" register={register} />
        <FormSelect
          label="Target Audience"
          name="targetAudience"
          register={register}
          options={["Students", "Teachers", "Parents"].map((v) => ({ value: v, label: v }))} // Simplified for demo
          required
        />
        <FormSelect
          label="Type"
          name="type"
          register={register}
          options={["EVENT", "NOTICE", "ALERT", "ANNOUNCEMENT"].map((v) => ({ value: v, label: v }))}
          required
        />
        <FormInput label="Start Date" name="startDate" type="datetime-local" register={register} errors={errors} required />
        <FormInput label="End Date" name="endDate" type="datetime-local" register={register} errors={errors} required />
        <FormSelect
          label="Status"
          name="status"
          register={register}
          options={["DRAFT", "PENDING"].map((v) => ({ value: v, label: v }))}
          required
        />
        <SubmitButton label="Create Event" isLoading={createMutation.isLoading} />
      </form>
    </div>
  );
};

export default CreateEventForm;