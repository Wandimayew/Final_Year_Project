import Layout from "@/components/layout/Layout";

import React from 'react'

function EmployeeLayout({ children }) {
  return (
    <Layout>
      {children}
    </Layout>
  )
}

export default EmployeeLayout