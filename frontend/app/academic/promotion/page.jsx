// components/StudentPromotionForm.jsx
"use client";

import StudentPromotionForm from '@/components/students/StudentPromotionFrom';
import { Toaster } from 'react-hot-toast';
export const dynamic = "force-dynamic";

export default function PromotionPage() {
  return (
    <>
      <Toaster position="top-right" />
      <StudentPromotionForm />
    </>
  );
}