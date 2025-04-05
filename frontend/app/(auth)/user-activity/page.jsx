import React from "react";
import Layout from "@/components/layout/Layout";
import UserActivity from "@/components/user/UserActivity";

// Force dynamic rendering for all pages using this layout
export const dynamic = "force-dynamic";

const UserActivityPage = () => {
  return (
    <Layout>
      <UserActivity />
    </Layout>
  );
};

export default UserActivityPage;
