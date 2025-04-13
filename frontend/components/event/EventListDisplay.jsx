// components/communication/EventListDisplay.jsx
"use client";

import React, { useState, useMemo } from "react";
import { useAuthStore } from "@/lib/auth";
import {
  useMyAnnouncements,
  useAllAnnouncements,
} from "@/lib/api/communicationService/announcement";
import EventCard from "./EventCard"; // Your existing EventCard
import ActionButton from "../common/ActionButton";
import Loader from "../shared/Loader";

const EventListDisplay = () => {
  const authState = useMemo(() => {
    const state = useAuthStore.getState();
    return {
      user: state.user,
      isAuthenticated: state.isAuthenticated(),
    };
  }, []);

  const { user, isAuthenticated } = authState;
  const [expandedId, setExpandedId] = useState(null);
  const [activeTab, setActiveTab] = useState("all");

  const myAnnouncementsQuery = useMyAnnouncements(user?.schoolId, {
    page: 0,
    size: 10,
    sort: "createdAt,desc",
  });

  const allAnnouncementsQuery = useAllAnnouncements(user?.schoolId);

  const activeQuery = activeTab === "myEvents" ? myAnnouncementsQuery : allAnnouncementsQuery;

  const {
    data,
    isLoading,
    isError,
    error,
  } = activeQuery;

  // Handle the data structure safely
  const announcements = useMemo(() => {
    if (!data?.data) return [];
    // If it's a paginated response (myAnnouncements)
    if (data.data.content) {
      return data.data.content;
    }
    // If it's a list response (allAnnouncements)
    return data.data;
  }, [data]);

  const filteredAnnouncements = useMemo(() => {
    if (!Array.isArray(announcements)) return [];

    return activeTab === "all"
      ? announcements.filter(
          (a) => a.status === "PUBLISHED" // Show only published for "All Events"
        )
      : announcements; // Show all statuses for "My Events"
  }, [announcements, activeTab]);

  const toggleExpand = (id) => setExpandedId(expandedId === id ? null : id);

  if (!isAuthenticated) {
    return (
      <div className="text-center text-gray-500 p-6">
        Please log in to view events.
      </div>
    );
  }

  if (isLoading) return <Loader />;

  if (isError) {
    return (
      <div className="text-center text-red-500 p-6">
        Failed to load events: {error?.message || "Unknown error occurred"}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-800 mb-8">
          {activeTab === "myEvents" ? "My Events" : "All Events"}
        </h1>
        <div className="flex gap-4 mb-6">
          <ActionButton
            label="All Events"
            onClick={() => setActiveTab("all")}
            color={activeTab === "all" ? "blue" : "gray"}
            className="px-5 py-2"
          />
          <ActionButton
            label="My Events"
            onClick={() => setActiveTab("myEvents")}
            color={activeTab === "myEvents" ? "blue" : "gray"}
            className="px-5 py-2"
          />
        </div>
        {filteredAnnouncements.length === 0 ? (
          <p className="text-center text-gray-500 text-lg">
            {activeTab === "myEvents"
              ? "You haven't created any events yet."
              : "No published events available."}
          </p>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredAnnouncements.map((announcement) => (
              <EventCard
                key={announcement.announcementId}
                announcement={announcement}
                expandedId={expandedId}
                toggleExpand={toggleExpand}
                isCreator={announcement.authorId === user?.userId}
                showCreatorActions={activeTab === "myEvents"}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default EventListDisplay;