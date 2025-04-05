"use client";

import CreateSchool from "@/components/school/CreateSchool";
import Layout from "@/components/layout/Layout";
import React from "react";

// Mark the page as client-side only if Layout doesn't need SSR
export const dynamic = "force-dynamic"; // Prevents SSR for this page

const Create = () => {
  return <CreateSchool />;
};

export default Create;
