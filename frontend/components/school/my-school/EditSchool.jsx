"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useAuthStore } from "@/lib/auth";
import { useUpdateSchool, useSchool } from "@/lib/api/tenantService/school";
import { useUpdateAddress } from "@/lib/api/tenantService/address";
import { useQueryClient } from "@tanstack/react-query"; // Added for refresh
import { useRouter } from "next/navigation";
import { FiSchool, FiArrowLeft } from "react-icons/fi";
import toast from "react-hot-toast";

const EditSchool = () => {
  const { getSchoolId, token } = useAuthStore();
  const router = useRouter();
  const queryClient = useQueryClient(); // For immediate refresh
  const [schoolId, setSchoolId] = useState(null);
  const [isHydrated, setIsHydrated] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);

  const authData = useMemo(() => useAuthStore.getState(), []);
  const userSchoolId = authData.user?.schoolId;

  // Fetch school data
  const {
    data: school,
    isLoading: isSchoolLoading,
    error: schoolError,
    refetch, // For manual refresh
  } = useSchool(userSchoolId);

  // State for editable fields
  const [schoolName, setSchoolName] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [emailAddress, setEmailAddress] = useState("");
  const [schoolType, setSchoolType] = useState("");
  const [schoolInformation, setSchoolInformation] = useState("");
  const [addressLine, setAddressLine] = useState("");
  const [city, setCity] = useState("");
  const [zone, setZone] = useState("");
  const [region, setRegion] = useState("");
  const [country, setCountry] = useState("");

  // Update school mutation
  const {
    mutateAsync: updateSchool,
    isPending: isSchoolUpdating,
    error: schoolUpdateError,
  } = useUpdateSchool();

  // Update address mutation
  const {
    mutateAsync: updateAddress,
    isPending: isAddressUpdating,
    error: addressUpdateError,
  } = useUpdateAddress();

  const isUpdating = isSchoolUpdating || isAddressUpdating;

  // School type options
  const schoolTypeOptions = ["Private", "Public"]; // Add more if needed

  useEffect(() => {
    const id = getSchoolId();
    console.log("EditSchool - Initial schoolId from getSchoolId:", id);
    console.log("EditSchool - userSchoolId from auth:", userSchoolId);
    console.log("EditSchool - token:", token);
    console.log("Stored auth data:", authData);

    const effectiveSchoolId = userSchoolId || id;
    setSchoolId(effectiveSchoolId);
    setIsHydrated(true);

    if (!effectiveSchoolId) {
      console.log("Redirecting to /login - missing schoolId");
      router.push("/login");
    }
  }, [getSchoolId, router, userSchoolId]);

  // Sync form fields with fetched school data
  useEffect(() => {
    if (school) {
      console.log("Fetched school data:", school);
      setSchoolName(school.school_name || "");
      setContactNumber(school.contact_number || "");
      setEmailAddress(school.email_address || "");
      setSchoolType(school.school_type || "");
      setSchoolInformation(school.school_information || "");
      const address = school.addresses?.[0];
      if (address) {
        setAddressLine(address.address_line || "");
        setCity(address.city || "");
        setZone(address.zone || "");
        setRegion(address.region || "");
        setCountry(address.country || "");
      }
    }
  }, [school]);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!schoolId) {
      toast.error("School ID is missing. Cannot update.");
      return;
    }

    setSuccessMessage(null);

    // School update data
    const schoolRequest = {};
    if (schoolName !== school?.school_name && schoolName !== "") {
      schoolRequest.school_name = schoolName;
    }
    if (contactNumber !== school?.contact_number && contactNumber !== "") {
      schoolRequest.contact_number = contactNumber;
    }
    // Email is not editable, so it's excluded from schoolRequest
    if (schoolType !== school?.school_type && schoolType !== "") {
      schoolRequest.school_type = schoolType;
    }
    if (
      schoolInformation !== school?.school_information &&
      schoolInformation !== ""
    ) {
      schoolRequest.school_information = schoolInformation;
    }

    // Address update data
    const addressRequest = {};
    const originalAddress = school?.addresses?.[0];
    if (addressLine !== originalAddress?.address_line && addressLine !== "") {
      addressRequest.address_line = addressLine;
    }
    if (city !== originalAddress?.city && city !== "") {
      addressRequest.city = city;
    }
    if (zone !== originalAddress?.zone && zone !== "") {
      addressRequest.zone = zone;
    }
    if (region !== originalAddress?.region && region !== "") {
      addressRequest.region = region;
    }
    if (country !== originalAddress?.country && country !== "") {
      addressRequest.country = country;
    }

    console.log("Submitting update - schoolId:", schoolId);
    console.log("School request payload:", schoolRequest);
    console.log("Address request payload:", addressRequest);

    try {
      // Update school if there are changes
      if (Object.keys(schoolRequest).length > 0) {
        await updateSchool({
          schoolId,
          schoolRequest,
        });
        toast.success("School details updated successfully!");
      }

      // Update address if there are changes
      const addressId = school?.addresses?.[0]?.address_id;
      if (Object.keys(addressRequest).length > 0 && addressId) {
        await updateAddress({
          schoolId,
          addressId,
          addressRequest,
        });
        toast.success("Address updated successfully!");
      }

      // Refresh data immediately
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["schools", schoolId] }),
        queryClient.invalidateQueries({ queryKey: ["schools"] }),
      ]);
      refetch(); // Force immediate refetch

      if (
        Object.keys(schoolRequest).length === 0 &&
        Object.keys(addressRequest).length === 0
      ) {
        setSuccessMessage("No changes to update.");
        toast.success("No changes to update.");
      } else {
        setSuccessMessage("School and/or address updated successfully!");
      }
    } catch (error) {
      console.error("Update failed:", error);
      const errorMsg = error.response?.data?.message || "Failed to update.";
      toast.error(errorMsg);
    }
  };

  // Handle back navigation
  const handleBack = () => {
    router.back();
  };

  if (!isHydrated || isSchoolLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex justify-center items-center">
        <svg
          className="animate-spin h-10 w-10 text-blue-500"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v8h8a8 8 0 01-8 8 8 8 0 01-8-8z"
          />
        </svg>
      </div>
    );
  }

  if (!schoolId) return null;

  if (schoolError) {
    return (
      <div className="min-h-screen bg-gray-100 py-8 px-4">
        <p className="text-center text-red-600 text-lg">
          Failed to load school: {schoolError.message}
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-lg mx-auto bg-white shadow-lg rounded-xl p-6 relative">
        {/* Progress Overlay */}
        {isUpdating && (
          <div className="absolute inset-0 bg-gray-200 bg-opacity-50 flex items-center justify-center rounded-xl">
            <svg
              className="animate-spin h-12 w-12 text-blue-500"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v8h8a8 8 0 01-8 8 8 8 0 01-8-8z"
              />
            </svg>
          </div>
        )}

        <div className="flex items-center justify-between mb-6">
          <button
            onClick={handleBack}
            className="flex items-center text-blue-600 hover:text-blue-800"
            disabled={isUpdating}
          >
            <FiArrowLeft className="h-6 w-6 mr-2" />
            Back
          </button>
          <h1 className="text-3xl font-bold text-gray-800 text-center flex-1">
            Edit School
          </h1>
          <div className="w-10" /> {/* Spacer for alignment */}
        </div>

        {/* Edit Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              School Name
            </label>
            <input
              type="text"
              value={schoolName}
              onChange={(e) => setSchoolName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter school name"
              disabled={isUpdating}
            />
          </div>
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Contact Number
            </label>
            <input
              type="text"
              value={contactNumber}
              onChange={(e) => setContactNumber(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter contact number"
              disabled={isUpdating}
            />
          </div>
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Email Address
            </label>
            <input
              type="email"
              value={emailAddress}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-700"
              disabled // Always disabled
            />
          </div>
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              School Type
            </label>
            <select
              value={schoolType}
              onChange={(e) => setSchoolType(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isUpdating}
            >
              <option value="" disabled>
                Select school type
              </option>
              {schoolTypeOptions.map((type) => (
                <option key={type} value={type.toLowerCase()}>
                  {type}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              School Information
            </label>
            <textarea
              value={schoolInformation}
              onChange={(e) => setSchoolInformation(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter school information"
              rows="3"
              disabled={isUpdating}
            />
          </div>
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Address Line
            </label>
            <input
              type="text"
              value={addressLine}
              onChange={(e) => setAddressLine(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter address line"
              disabled={isUpdating}
            />
          </div>
          <div>
            <label className="block text-gray-700 font-medium mb-2">City</label>
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter city"
              disabled={isUpdating}
            />
          </div>
          <div>
            <label className="block text-gray-700 font-medium mb-2">Zone</label>
            <input
              type="text"
              value={zone}
              onChange={(e) => setZone(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter zone"
              disabled={isUpdating}
            />
          </div>
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Region
            </label>
            <input
              type="text"
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter region"
              disabled={isUpdating}
            />
          </div>
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Country
            </label>
            <input
              type="text"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter country"
              disabled={isUpdating}
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition duration-200 flex items-center justify-center"
            disabled={isUpdating}
          >
            {isUpdating ? (
              <svg
                className="animate-spin h-5 w-5 mr-2 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v8h8a8 8 0 01-8 8 8 8 0 01-8-8z"
                />
              </svg>
            ) : null}
            {isUpdating ? "Updating..." : "Update School"}
          </button>
        </form>

        {/* Success Message */}
        {successMessage && (
          <p className="mt-4 text-center text-green-500">{successMessage}</p>
        )}

        {/* Error Messages */}
        {(schoolUpdateError || addressUpdateError) && (
          <p className="mt-4 text-center text-red-500">
            {schoolUpdateError?.message ||
              addressUpdateError?.message ||
              "Failed to update."}
          </p>
        )}
      </div>
    </div>
  );
};

export default EditSchool;
