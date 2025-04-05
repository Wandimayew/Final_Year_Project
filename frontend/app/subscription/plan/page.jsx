import React from "react";
import Layout from "@/components/layout/Layout";
import MySubscription from "@/components/school/MySubscription";
export const dynamic = "force-dynamic";

const SubscriptionPlanPage = () => {
  return (
    <Layout>
      <MySubscription />
    </Layout>
  );
};

export default SubscriptionPlanPage;
