// components/StudentPromotionForm.jsx
"use client";

import StudentPromotionForm from '@/components/students/StudentPromotionFrom';
import { Toaster } from 'react-hot-toast';

export default function PromotionPage() {
  return (
    <>
      <Toaster position="top-right" />
      <StudentPromotionForm />
    </>
  );
}