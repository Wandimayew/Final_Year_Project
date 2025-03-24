"use client";
import { useState } from "react";
import { ChevronDownIcon } from "lucide-react";
import {
    User,
    Calendar,
    School,
    Phone,
    Mail,
    Home,
    CreditCard,
    TrendingUp,
    BookOpen,
    ClipboardList,
    MapPin
  } from 'lucide-react';
import { useStudent } from "@/lib/api/studentService/students";

const StudentProfile = ({ studentId }) => {
  const [activeSection, setActiveSection] = useState("basic");
  const { data: student, isLoading, error } = useStudent(studentId);
  console.log(student);

  const toggleSection = (section) => {
    setActiveSection(activeSection === section ? "" : section);
  };

  // Handle loading state
  if (isLoading) {
    return <div className="max-w-4xl mx-auto p-6">Loading...</div>;
  }

  // Handle error state
  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        Error loading student data: {error.message}
      </div>
    );
  }

  // Render only when student data is available
  if (!student) {
    return <div className="max-w-4xl mx-auto p-6">No student data found.</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Profile Card */}
      <div className="bg-gradient-to-r from-green-400 to-gray-600 rounded-lg p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Profile Image */}
          <div className="w-48 h-48 bg-white rounded-lg shadow-lg overflow-hidden">
            {student.photo === null ? (
              <svg
                // width=""
                // height="100"
                className="w-full h-full object-cover"
                viewBox="0 0 100 100"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                stroke="gray"
              >
                <circle cx="50" cy="30" r="20" stroke-width="4" />
                <path
                  d="M20 90c0-15 15-30 30-30s30 15 30 30"
                  stroke-width="4"
                />
              </svg>
            ) : (
              <img
                src={student.photoUrl}
                alt="Student"
                className="w-full h-full object-cover"
              />
            )}
          </div>

          {/* Profile Info */}
          <div className="text-white">
            <h1 className="text-3xl font-bold mb-2">
              {student.firstName + " " + student.lastName}
            </h1>
            <p className="text-lg mb-4">Student / General</p>

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <School className="w-5 h-5" />
                <span>Indiana</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                <span>{student.dateOfBirth}</span>
              </div>
              <div className="flex items-center gap-2">
                <User className="w-5 h-5" />
                <span>Six (A)</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-5 h-5" />
                <span>{student.contactInfo}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-5 h-5" />
                <span>{student.username}</span>
              </div>
              <div className="flex items-center gap-2">
                <Home className="w-5 h-5" />
                <span>
                  {student.address.city + ", " + student.address.state}
                </span>
                {/* <span>D/2684 Jefferson Street, Portsmouth, Virginia.</span> */}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Accordion Sections */}
      <div className="space-y-4">
        {/* Basic Details */}
        <div className="border rounded-lg">
          <button
            className="w-full px-4 py-3 flex items-center justify-between bg-white rounded-lg"
            onClick={() => toggleSection("basic")}
          >
            <div className="flex items-center gap-2">
              <User className="w-5 h-5 text-blue-500" />
              <span className="font-medium">Basic Details</span>
            </div>
            <ChevronDownIcon
              className={`w-5 h-5 transition-transform ${
                activeSection === "basic" ? "transform rotate-180" : ""
              }`}
            />
          </button>
          {activeSection === "basic" && (
            <div className="bg-gray-50 p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Academic Details */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-blue-500" />
                  Academic Details
                </h3>
                
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Academic Year</label>
                    <div className="mt-1 p-2 bg-white rounded border">2025-2026</div>
                    <div className="mt-1 p-2 bg-white rounded border">{student.registId}</div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Register No</label>
                      <div className="mt-1 p-2 bg-white rounded border">{student.registId}</div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Admission Date</label>
                      <div className="mt-1 p-2 bg-white rounded border">{student.admissionDate}</div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Class</label>
                      <div className="mt-1 p-2 bg-white rounded border">One</div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Section</label>
                      <div className="mt-1 p-2 bg-white rounded border">A</div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Stream</label>
                      <div className="mt-1 p-2 bg-white rounded border">Natural Science</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Student Details */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <ClipboardList className="w-5 h-5 text-blue-500" />
                  Student Details
                </h3>
                
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-500">First Name</label>
                      <div className="mt-1 p-2 bg-white rounded border">{student.firstName}</div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Last Name</label>
                      <div className="mt-1 p-2 bg-white rounded border">{student.lastName}</div>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Date of Birth</label>
                    <div className="mt-1 p-2 bg-white rounded border">{student.dateOfBirth}</div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Mobile No</label>
                      <div className="mt-1 p-2 bg-white rounded border">{student.contactInfo}</div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-500">City</label>
                      <div className="mt-1 p-2 bg-white rounded border">{student.address.city}</div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500">State</label>
                      <div className="mt-1 p-2 bg-white rounded border">{student.address.state}</div>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Username</label>
                    <div className="mt-1 p-2 bg-white rounded border">{student.username}</div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Guardian</label>
                    <div className="mt-1 p-2 bg-white rounded border">Binoya Naik</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          )}
        </div>

        {/* Fees */}
        <div className="border rounded-lg">
          <button
            className="w-full px-4 py-3 flex items-center justify-between bg-white rounded-lg"
            onClick={() => toggleSection("fees")}
          >
            <div className="flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-blue-500" />
              <span className="font-medium">Fees</span>
            </div>
            <ChevronDownIcon
              className={`w-5 h-5 transition-transform ${
                activeSection === "fees" ? "transform rotate-180" : ""
              }`}
            />
          </button>
          {activeSection === "fees" && (
            <div className="px-4 py-3 bg-gray-50">
              <p>Fees content goes here...</p>
            </div>
          )}
        </div>

        {/* Promotion History */}
        <div className="border rounded-lg">
          <button
            className="w-full px-4 py-3 flex items-center justify-between bg-white rounded-lg"
            onClick={() => toggleSection("promotion")}
          >
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-500" />
              <span className="font-medium">Promotion History</span>
            </div>
            <ChevronDownIcon
              className={`w-5 h-5 transition-transform ${
                activeSection === "promotion" ? "transform rotate-180" : ""
              }`}
            />
          </button>
          {activeSection === "promotion" && (
            <div className="px-4 py-3 bg-gray-50">
              <p>Promotion history content goes here...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentProfile;
