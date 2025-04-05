"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useAuthStore } from "@/lib/auth";
import { useSchool } from "@/lib/api/tenantService/school";
import { useRouter } from "next/navigation";
import { FiMapPin, FiPhone, FiMail, FiInfo } from "react-icons/fi"; // Added icons for details
import { FaSchool } from "react-icons/fa";
import Image from "next/image";

const MySchool = () => {
  const { getSchoolId, token } = useAuthStore();
  const router = useRouter();
  const [schoolId, setSchoolId] = useState(null);
  const [isHydrated, setIsHydrated] = useState(false);

  const authData = useMemo(() => useAuthStore.getState(), []);
  const userSchoolId = authData.user?.schoolId;

  // Fetch school data
  const {
    data: school,
    isLoading: isSchoolLoading,
    error: schoolError,
  } = useSchool(userSchoolId);

  useEffect(() => {
    const id = getSchoolId();
    console.log("MySchool - schoolId:", id, "token:", token);
    console.log("Stored auth data:", authData);

    setSchoolId(id);
    setIsHydrated(true);

    if (!id) {
      console.log("Redirecting to /login - missing schoolId");
      router.push("/login");
    }
  }, [getSchoolId, router]);

  if (!isHydrated || isSchoolLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500"></div>
      </div>
    );
  }

  if (!schoolId) return null;

  if (schoolError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-red-100 text-red-700 p-4 rounded-lg shadow-md">
          <p className="text-lg font-medium">
            Failed to load school: {schoolError.message}
          </p>
        </div>
      </div>
    );
  }

  const address = school?.addresses?.[0];

  // Function to format Base64 logo as a data URL
  const getLogoSrc = (logo) => {
    if (!logo) return null;
    if (logo.startsWith("data:image")) return logo;
    return `data:image/jpeg;base64,${logo}`; // JPEG based on /9j/ prefix
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden transform transition-all hover:shadow-2xl">
        {/* Header with Gradient */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-center">
          <h1 className="text-3xl font-bold text-white flex items-center justify-center gap-2">
            {/* <> */}
            <FaSchool className="h-8 w-8" />
            My School
            {/* </> */}
          </h1>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <div className="relative w-20 h-20">
              {school?.logo ? (
                <Image
                  src={getLogoSrc(school.logo)}
                  alt="School Logo"
                  width={100} // Match w-20 (20 * 4 = 80px in Tailwind)
                  height={80} // Match h-20
                  className="rounded-full object-cover border-4 border-white shadow-md"
                  onError={(e) => {
                    console.error("Failed to load logo:", school.logo);
                    e.target.style.display = "none";
                    e.target.nextSibling.style.display = "flex";
                  }}
                />
              ) : (
                <div className="w-full h-full bg-gray-200 rounded-full flex items-center justify-center border-4 border-white shadow-md">
                  <FaSchool className="h-10 w-10 text-gray-500" />
                </div>
              )}
            </div>
          </div>

          {/* School Details */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <FaSchool className="h-5 w-5 text-blue-600" />
              <div>
                <span className="text-sm font-medium text-gray-500">
                  School Name
                </span>
                <p className="text-lg font-semibold text-gray-900">
                  {school?.school_name || "N/A"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <FiInfo className="h-5 w-5 text-blue-600" />
              <div>
                <span className="text-sm font-medium text-gray-500">
                  School ID
                </span>
                <p className="text-lg font-semibold text-gray-900">
                  {school?.school_id || "N/A"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <FiPhone className="h-5 w-5 text-blue-600" />
              <div>
                <span className="text-sm font-medium text-gray-500">
                  Contact Number
                </span>
                <p className="text-lg font-semibold text-gray-900">
                  {school?.contact_number || "N/A"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <FiMail className="h-5 w-5 text-blue-600" />
              <div>
                <span className="text-sm font-medium text-gray-500">Email</span>
                <p className="text-lg font-semibold text-gray-900">
                  {school?.email_address || "N/A"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <FiInfo className="h-5 w-5 text-blue-600" />
              <div>
                <span className="text-sm font-medium text-gray-500">Type</span>
                <p className="text-lg font-semibold text-gray-900">
                  {school?.school_type
                    ? school.school_type.charAt(0).toUpperCase() +
                      school.school_type.slice(1)
                    : "N/A"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <FiInfo className="h-5 w-5 text-blue-600" />
              <div>
                <span className="text-sm font-medium text-gray-500">
                  Information
                </span>
                <p className="text-lg font-semibold text-gray-900">
                  {school?.school_information || "N/A"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <FiMapPin className="h-5 w-5 text-blue-600" />
              <div>
                <span className="text-sm font-medium text-gray-500">
                  Address
                </span>
                <p className="text-lg font-semibold text-gray-900">
                  {address
                    ? `${address.address_line}, ${address.city}, ${address.zone}, ${address.region}, ${address.country}`
                    : "N/A"}
                </p>
              </div>
            </div>
          </div>

          {/* Edit Button */}
          <div className="mt-6">
            <button
              onClick={() => router.push("/school/my-school/edit")}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-200 shadow-md"
            >
              Edit School
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MySchool;
