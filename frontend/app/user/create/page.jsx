import React from 'react'
import CreateUser from '@/components/user/CreateUser'
export const dynamic = "force-dynamic";

const CreateUserPage = () => {
  return (
   <div className='mt-3'>
     <CreateUser />
   </div>
  )
}

export default CreateUserPage