import Layout from "@/components/layout/Layout";

import React from "react";

// Force dynamic rendering for all pages using this layout
export const dynamic = "force-dynamic";

function AssesmentLayout({ children }) {
  return <Layout>{children}</Layout>;
}

export default AssesmentLayout;
