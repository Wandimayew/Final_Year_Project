import React from "react";
import Layout from "@/components/layout/Layout";
import SubscriptionPlanSelector from "@/components/school/SubscriptionPlanSelector";

export const dynamic = "force-dynamic";

const PackagePage = () => {
  return (
    <Layout>
      <SubscriptionPlanSelector />
    </Layout>
  );
};

export default PackagePage;
