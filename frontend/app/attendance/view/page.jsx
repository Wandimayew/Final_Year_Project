"use client";
import { useState } from "react";
import AttendanceView from "@/components/attendance/AttendanceView";
import Layout from "@/components/layout/Layout";
const ViewPage = () => {
  return (
    <Layout>
      < AttendanceView />
    </Layout>
  );
};

export default ViewPage;