import React from 'react'
import Layout from '@/components/layout/Layout'
import UserActivity from '@/components/user/UserActivity'

const UserActivityPage = () => {
  return (
       <div className='relative top-20'>
         <Layout>
            <UserActivity />
        </Layout>
       </div>
  )
}

export default UserActivityPage