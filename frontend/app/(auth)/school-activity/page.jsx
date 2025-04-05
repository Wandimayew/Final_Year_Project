import React from 'react'
import UserActivity from '@/components/user/UserActivity'
import Layout from '@/components/layout/Layout'
const SchoolActivityPage = () => {
  return (
    <Layout>
        <UserActivity globalView={true}  />
    </Layout>
  )
}

export default SchoolActivityPage