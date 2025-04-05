import React from "react";
import CreatorAnnouncements from "@/components/event/CreatorAnnouncements";
export const dynamic = "force-dynamic";

const MyPendingPage = () => {
  return <div className="relative top-20">
    <CreatorAnnouncements />
  </div>;
};

export default MyPendingPage;
