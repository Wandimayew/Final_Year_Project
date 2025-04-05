"use client";
import { useState } from "react";
import QRCodeGenerator from "@/components/attendance/QRCodeGenerator";
import Layout from "@/components/layout/Layout";
export const dynamic = 'force-dynamic';
const GeneratePage = () => {
  return (
    <Layout>
      <QRCodeGenerator />
    </Layout>
  );
};

export default GeneratePage;
