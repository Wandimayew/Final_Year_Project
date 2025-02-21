'use client';
import { useState } from 'react';
import AttendanceList from '@/components/attendance/AttendanceList';
import Layout from '@/components/layout/Layout'

const ListPage = () => {
  return (
    <Layout>
      <AttendanceList/>
    </Layout>
  )
}
export default ListPage