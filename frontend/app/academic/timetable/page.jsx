"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation"; // Import router
import Layout from "@/components/layout/Layout";
import TimeTableList from "@/components/academic/schedule/TimeTableList";

const TimeTablePage = () => {
  const [timetable, setTimetable] = useState({});
  const router = useRouter(); // Initialize router

  useEffect(() => {
    fetchTimetable();
  }, []);

  const fetchTimetable = async () => {
    try {
      console.log("fetchig timetable");
      
      const response = await fetch("/timetable.json"); // Fetch from public folder
      const data = await response.json();
      console.log("fetching endedd", data);
      
      setTimetable(data);
    } catch (error) {
      console.error("Error fetching timetable:", error);
    }
  };

  return (
    <Layout>
      <div className="relative top-20 px-6 py-10 max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-4xl font-bold text-gray-800">
            Classes Timetable
          </h1>
          <button
            onClick={() => router.push("/academic/timetable/add-timetable")} // Redirect on click
            className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-all"
          >
            Generate Timetable
          </button>
        </div>
        <TimeTableList timetable={timetable} />
      </div>
    </Layout>
  );
};

export default TimeTablePage;
