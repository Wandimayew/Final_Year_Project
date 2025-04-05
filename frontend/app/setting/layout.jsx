import React from "react";
import Layout from "@/components/layout/Layout";

// Force dynamic rendering for all pages using this layout
export const dynamic = "force-dynamic";
const SettingLayout = ({ children }) => {
  return <Layout>{children}</Layout>;
};

export default SettingLayout;
