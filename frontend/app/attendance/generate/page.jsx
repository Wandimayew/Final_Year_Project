"use client";
import { useState } from "react";
import QRCodeGenerator from "@/components/attendance/QRCodeGenerator";
import Layout from "@/components/layout/Layout";
const GeneratePage = () => {
  return (
    <Layout>
      <QRCodeGenerator />
    </Layout>
  );
};

export default GeneratePage;
