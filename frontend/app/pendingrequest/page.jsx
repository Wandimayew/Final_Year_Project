import React from 'react'
import Layout from '@/components/layout/Layout'
import SchoolSubscriptionsList from '@/components/school/PendingRequest'

export const dynamic = 'force-dynamic';

const PendingRequstPage = () => {
  return (
    <Layout>
        <SchoolSubscriptionsList />
    </Layout>
  )
}

export default PendingRequstPage