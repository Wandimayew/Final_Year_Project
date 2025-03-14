"use client";

import localFont from "next/font/local";
import { Provider } from "react-redux";
import { store } from "@/Redux/stores/store";
import Head from "next/head"; // Import next/head
import "./globals.css";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Toaster } from "react-hot-toast";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

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

export default function RootLayout({ children }) {

  const [queryClient] = useState(()=> new QueryClient({
    defaultOptions: {
      queries:{
        staleTime: 1000 * 60 , // Data is refresh for 1 minute
        cacheTime: 1000 * 60 * 5, // Data stays in cache for 5 minute
        refetchOnWindowFocus: false, // Don't Fetetch on window focus
      }
    }
  }))
  return (
    <html lang="en">
      <Head>
        <title>SSMS</title>
        <meta name="description" content="SaaS School management system" />
      </Head>
      <QueryClientProvider  client={queryClient}>
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          {children}
          <ToastContainer position="top-right" autoClose={3000} />
          <Toaster position="top-right" toastOptions={{ duration: 5000 }} />
        </body>
      </QueryClientProvider>
    </html>
  );
}
