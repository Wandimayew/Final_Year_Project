import React from 'react'
import Layout from '@/components/layout/Layout'
import AddSubscriptionPlan from '@/components/school/AddSubscriptionPlan'
export const dynamic = "force-dynamic";

const CreatePlanPage = () => {
  return (
    <Layout>
        <AddSubscriptionPlan />
    </Layout>
  )
}

export default CreatePlanPage