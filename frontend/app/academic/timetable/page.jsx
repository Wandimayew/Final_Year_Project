"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation"; // Import router
import TimeTableList from "@/components/academic/schedule/TimeTableList";
import Breadcrumb from "@/components/constant/Breadcrumb";

const TimeTablePage = () => {
  const [timetable, setTimetable] = useState(null); // Initialize state as null
  const router = useRouter(); // Initialize router

  // Fetch timetable data on mount
  useEffect(() => {
    fetchTimetable();
  }, []); // Run only on mount

  // Function to fetch timetable data from the public folder
  const fetchTimetable = async () => {
    try {
      console.log("Fetching timetable...");

      const response = await fetch("/timetable.json"); // Fetch from public folder
      if (!response.ok) {
        throw new Error(`Failed to fetch timetable: ${response.statusText}`);
      }

      const data = await response.json();
      console.log("Fetching completed:", data);

      setTimetable(data); // Set the timetable data
    } catch (error) {
      console.error("Error fetching timetable:", error);
    }
  };

  // Optional: define callbacks if you want to handle confirm/cancel actions
  const handleConfirm = (updatedTimetable) => {
    console.log("Confirmed timetable:", updatedTimetable);
    // Do something with the updated timetable data.
  };

  const handleCancel = () => {
    console.log("Edit cancelled");
    // Optionally reset state or do other tasks.
  };

  return (
    <>
      <div className="relative top-20 px-6 py-10 max-w-6xl mx-auto">
        <Breadcrumb />
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

        {/* Pass the fetched timetable data to TimeTableList component */}
        {timetable ? (
          <TimeTableList
            timetable={timetable}
            editable={false} // set to true if editing is allowed
            onConfirm={handleConfirm}
            onCancel={handleCancel}
          />
        ) : (
          <p>Loading timetable...</p>
        )}
      </div>
    </>
  );
};

export default TimeTablePage;
