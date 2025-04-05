import React from "react";
import PendingApprovalList from "@/components/event/PendingApprovalList";
export const dynamic = "force-dynamic";

const PendingApprovalsPage = () => {
  return <div className="relative top-20">
    <PendingApprovalList />
  </div>;
};

export default PendingApprovalsPage;
