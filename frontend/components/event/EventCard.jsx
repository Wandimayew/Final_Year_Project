// components/event/EventCard.js
"use client";

import React, { useCallback } from "react";
import EditEventModal from "./EditEventModal";
import ChangeStatusModal from "./ChangeStatusModal";
import DeleteEventButton from "./DeleteEventButton";

const EventCard = React.memo(
  ({
    announcement,
    expandedId,
    toggleExpand,
    isCreator,
    showCreatorActions,
  }) => {
    const handleToggleExpand = useCallback(() => {
      toggleExpand(announcement.announcementId);
    }, [toggleExpand, announcement.announcementId]);

    return (
      <div className="bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg">
        <div className="bg-blue-600 px-6 py-4 relative">
          {announcement.title && (
            <h2 className="text-xl font-bold text-white tracking-tight truncate pr-20">
              {announcement.title}
            </h2>
          )}
          <button
            onClick={handleToggleExpand}
            className="absolute top-2 right-2 bg-blue-700 text-white px-3 py-1 rounded-md text-sm font-medium hover:bg-blue-800 transition-all duration-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50"
          >
            {expandedId === announcement.announcementId ? "Hide" : "Details"}
          </button>
        </div>
        <div className="p-6">
          {expandedId !== announcement.announcementId ? (
            <div className="bg-gray-100 rounded-md p-4 mb-4 border border-gray-200 transition-all duration-300">
              {announcement.message && (
                <p className="text-gray-600 text-base font-light line-clamp-1 mb-3 leading-relaxed">
                  {`${announcement.message.slice(0, 50)}${
                    announcement.message.length > 50 ? "..." : ""
                  }`}
                </p>
              )}
              <div className="grid grid-cols-2 gap-y-3 text-sm text-gray-700">
                {announcement.targetAudience && (
                  <div>
                    <span className="font-semibold text-blue-700">
                      Audience:
                    </span>{" "}
                    <span className="font-medium">
                      {announcement.targetAudience}
                    </span>
                  </div>
                )}
                {announcement.type && (
                  <div>
                    <span className="font-semibold text-blue-700">Type:</span>{" "}
                    <span className="font-medium">{announcement.type}</span>
                  </div>
                )}
                {announcement.status && (
                  <div>
                    <span className="font-semibold text-blue-700">Status:</span>{" "}
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium transition-all duration-200 ${
                        announcement.status === "PENDING"
                          ? "bg-yellow-100 text-yellow-800"
                          : announcement.status === "PUBLISHED"
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {announcement.status}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div
              className="space-y-4 animate-fadeIn"
              style={{
                animation: "fadeIn 0.3s ease-in-out",
              }}
            >
              {announcement.message && (
                <p className="text-gray-700 text-base font-light leading-relaxed">
                  {announcement.message}
                </p>
              )}
              <div className="space-y-3 text-sm text-gray-700">
                {announcement.targetAudience && (
                  <div className="flex justify-between">
                    <span className="font-semibold text-blue-700">
                      Audience:
                    </span>{" "}
                    <span className="font-medium">
                      {announcement.targetAudience}
                    </span>
                  </div>
                )}
                {announcement.type && (
                  <div className="flex justify-between">
                    <span className="font-semibold text-blue-700">Type:</span>{" "}
                    <span className="font-medium">{announcement.type}</span>
                  </div>
                )}
                {(announcement.startDate || announcement.endDate) && (
                  <div className="flex justify-between">
                    {announcement.startDate && (
                      <div>
                        <span className="font-semibold text-blue-700">
                          Start:
                        </span>{" "}
                        <span className="font-medium">
                          {new Date(
                            announcement.startDate
                          ).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                    {announcement.endDate && (
                      <div className="text-right">
                        <span className="font-semibold text-blue-700">
                          End:
                        </span>{" "}
                        <span className="font-medium">
                          {new Date(announcement.endDate).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                  </div>
                )}
                {announcement.status && (
                  <div className="flex justify-between">
                    <span className="font-semibold text-blue-700">Status:</span>
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium transition-all duration-200 ${
                        announcement.status === "PENDING"
                          ? "bg-yellow-100 text-yellow-800"
                          : announcement.status === "PUBLISHED"
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {announcement.status}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
          {isCreator && showCreatorActions && (
            <div className="mt-4 flex justify-end space-x-2">
              <EditEventModal announcement={announcement} />
              <ChangeStatusModal announcement={announcement} />
              <DeleteEventButton announcementId={announcement.announcementId} />
            </div>
          )}
        </div>
      </div>
    );
  }
);

EventCard.displayName = "EventCard"; // Added displayName

export default EventCard;

<style jsx global>{`
  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`}</style>;
