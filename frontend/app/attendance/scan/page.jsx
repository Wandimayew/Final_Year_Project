"use client";
import { useState } from "react";
import QRCodeScanner from "@/components/attendance/QRCodeScanner";
import Layout from "@/components/layout/Layout";
export const dynamic = 'force-dynamic';

const ScanPage = () => {
  return (
    <Layout>
      < QRCodeScanner />
    </Layout>
  );
};

export default ScanPage;