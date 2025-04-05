import React from 'react'
import Layout from '@/components/layout/Layout'
import EditPlan from '@/components/school/EditPlan'
export const dynamic = "force-dynamic";

const EditPlanPage = () => {
  return (
    <Layout>
        <EditPlan />
    </Layout>
  )
}

export default EditPlanPage