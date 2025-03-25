"use client"

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useAuth } from "@/hooks/useAuth";
import EventCard from "./EventCard";
import ActionButton from "../common/ActionButton";
import Loader from "../shared/Loader";

const API_BASE_URL =
    `http://10.194.61.74:8080/communication/api`
const fetchAnnouncements = async (schoolId,token, isMyEvents, userId) => {
  
  console.log("school id", schoolId);
  
  const url = isMyEvents ? `${API_BASE_URL}/${schoolId}/announcements/my-announcements` : `${API_BASE_URL}/${schoolId}/announcements`;

  try {
    const response = await axios.get(url, {
      headers: { Authorization: `Bearer ${token}` },
    });

    // Handle different response structures
    const announcements = response.data.data;
    const extractedAnnouncements = Array.isArray(announcements)
      ? announcements
      : announcements?.content || [];

    if (isMyEvents) {
      return extractedAnnouncements;
    } else {
      return extractedAnnouncements.filter(
        (a) => a.authorId !== userId && a.status === "PUBLISHED"
      );
    }
  } catch (err) {
    console.error("Failed to fetch announcements:", err);
    return [];
  }
};

const EventListDisplay = () => {
  const { auth, loading: authLoading } = useAuth();
  const [expandedId, setExpandedId] = useState(null);
  const [activeTab, setActiveTab] = useState("all");

  const {
    data: announcements = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["announcements", activeTab,auth?.user?.schoolId, auth?.user?.userId],
    queryFn: () =>
      fetchAnnouncements(
        auth.user.schoolId,
        auth.token,
        activeTab === "myEvents",
        auth.user.userId
      ),
    enabled: !!auth && !authLoading,
  });

  const toggleExpand = (id) => setExpandedId(expandedId === id ? null : id);

  if (authLoading || isLoading) return <Loader />;
  if (!auth) {
    return (
      <div className="text-center text-gray-500 p-6">
        Please log in to view events.
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
        {announcements.length === 0 ? (
          <p className="text-center text-gray-500 text-lg">
            {activeTab === "myEvents"
              ? "You haven't created any events yet."
              : "No published events available."}
          </p>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {announcements.map((announcement) => (
              <EventCard
                key={announcement.announcementId}
                announcement={announcement}
                expandedId={expandedId}
                toggleExpand={toggleExpand}
                isCreator={announcement.authorId === auth.user.userId}
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
