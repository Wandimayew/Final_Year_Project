import React from 'react'
import MailBoxFolder from '@/components/email/MailBoxFolder'
import Layout from '@/components/layout/Layout'

const layout = ({children}) => {
  return (
    <>
        <MailBoxFolder />
        {children}
    </>
   
  )
}

export default layout