"use client";

import localFont from "next/font/local";
import ReactQueryProvider from "@/lib/ReactQueryProvider";
import "./globals.css";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Toaster } from "react-hot-toast";
// import {  createTheme } from "@mui/material/styles";
import { ThemeProvider } from "@/lib/theme/ThemeContext";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

// Force dynamic rendering for all pages using this layout
export const dynamic = 'force-dynamic';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ReactQueryProvider>
          <ThemeProvider >
            {children}
            <ToastContainer position="top-right" autoClose={3000} />
            <Toaster position="top-right" toastOptions={{ duration: 5000 }} />
          </ThemeProvider>
        </ReactQueryProvider>
      </body>
    </html>
  );
}
