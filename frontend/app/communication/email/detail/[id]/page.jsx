"use client";

import React from "react";
import EmailDetail from "@/components/email/EmailDetail";
import MailBoxFolder from "@/components/email/MailBoxFolder";
import { useParams } from "next/navigation";
export const dynamic = "force-dynamic";

const EmailDetailPage = () => {
  const params = useParams();
  const emailId = params.id; // Correctly access the 'id' parameter

  console.log("email id in page object:", params);
  console.log("email id in page id:", emailId);

  return <EmailDetail emailId={emailId} />;
};

export default EmailDetailPage;
