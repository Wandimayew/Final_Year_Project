"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import axios from "axios";

export default function SchoolList() {
  const [searchQuery, setSearchQuery] = useState("");
  const [schools, setSchools]= useState([]);

  const getSchoolList = async () => {
    try {
      const response = await axios.get(
        "http://10.194.61.74:8080/tenant/api/getAllSchools"
      );
      console.log("school Resposes : ",response.data);
      setSchools(response.data);
      
    } catch (error) {
      console.error("Error during submission:", error); // Log the full error
      toast.error(`Network error: ${error.message}`);
    }
  };
  useEffect(() => {
    getSchoolList();
  }, []);

  return (
    <div className="p-6">
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2 text-gray-600">
            <Link href="/">Home</Link>
            <span>-</span>
            <Link href="/schools">Schools</Link>
            <span>-</span>
            <span>School List</span>
          </div>
          <button className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600">
            + Add School
          </button>
        </div>

        <div className="flex justify-between items-center">
          <div className="relative">
            <input
              type="text"
              placeholder="Search School"
              className="pl-10 pr-4 py-2 border rounded-md w-[300px]"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <svg
              className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <button className="flex items-center gap-2 text-blue-500 hover:text-blue-600">
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
              />
            </svg>
            Export
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white">
          <thead>
            <tr className="border-b">
              <th className="text-left py-3 px-4">#</th>
              <th className="text-left py-3 px-4">Name</th>
              <th className="text-left py-3 px-4">Address</th>
              <th className="text-left py-3 px-4">Phone</th>
              <th className="text-left py-3 px-4">Info</th>
              <th className="text-left py-3 px-4">Status</th>
              <th className="text-left py-3 px-4">Action</th>
            </tr>
          </thead>
          <tbody>
            {schools.map((school) => (
              <tr key={school.school_id} className="border-b hover:bg-gray-50">
                <td className="py-3 px-4">{school.school_id}</td>
                <td className="py-3 px-4">{school.school_name}</td>
                <td className="py-3 px-4">
        {school.addresses && school.addresses.length > 0 
          ? school.addresses.map((address, index) => (
              <div key={index}>
                {address.address_line}, {address.city}, {address.zone},{address.region}, {address.country}
              </div>
            ))
          : 'No address available'}
      </td>
                <td className="py-3 px-4">{school.contact_number}</td>
                <td className="py-3 px-4">{school.school_information}</td>
                <td className="py-3 px-4">
                  <span className="px-2 py-1 rounded-full text-sm bg-green-100 text-green-600">
                    {school.status}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <button className="text-gray-600 hover:text-gray-800">
                    Actions ▼
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
