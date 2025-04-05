import React from 'react'
import SubscriptionPlansList from '@/components/school/SubscriptionPlansList'
import Layout from '@/components/layout/Layout'
export const dynamic = "force-dynamic";

const PlanListPage = () => {
  return (
    <Layout>
        <SubscriptionPlansList />
    </Layout>
  )
}

export default PlanListPage