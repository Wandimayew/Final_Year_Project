"use client";

import { useState, useCallback, useEffect } from "react";
import { toast } from "react-toastify";
import AddressPopup from "./AddressPopup";
import { useCreateSchool } from "@/lib/api/tenantService/school";
import { useCreateAdmin } from "@/lib/api/userManagementService/user";
import { useAuthStore } from "@/lib/auth";

const CreateSchool = () => {
  const [formData, setFormData] = useState({
    schoolName: "",
    schoolAddress: [],
    schoolEmail: "",
    schoolPhone: "",
    schoolType: "",
    establishmentDate: "",
    adminName: "",
    adminEmail: "",
    adminPassword: "",
    schoolLogo: null,
    schoolInfo: "",
    adminAddress: "",
    adminPhone: "",
    adminUsername: "",
  });

  const [addressClicked, setAddressClicked] = useState(false);
  const [addresses, setAddresses] = useState("");
  const [isMounted, setIsMounted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false); // Added loading state

  const rawToken = useAuthStore((state) => state.token);
  const token = isMounted ? rawToken : null;
  const createSchoolMutation = useCreateSchool();
  const createUserMutation = useCreateAdmin();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleChange = useCallback((e) => {
    const { name, value, type, files } = e.target;
    if (type === "file") {
      setFormData((prevState) => ({
        ...prevState,
        [name]: files[0],
      }));
    } else {
      setFormData((prevState) => ({
        ...prevState,
        [name]: value,
      }));
    }
  }, []);

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      console.log("Saving data");

      if (!token) {
        toast.error("You must be logged in to create a school.");
        return;
      }

      setIsSubmitting(true); // Set loading state to true

      const schoolRequest = {
        school_name: formData.schoolName,
        addresses: formData.schoolAddress,
        contact_number: formData.schoolPhone,
        email_address: formData.schoolEmail,
        school_type: formData.schoolType,
        establishment_date: formData.establishmentDate,
        logo: formData.schoolLogo,
        school_information: formData.schoolInfo,
      };

      try {
        await createSchoolMutation.mutateAsync(
          { schoolRequest },
          {
            onSuccess: async (schoolResponse) => {
              console.log("School created successfully:", schoolResponse);
              toast.success("School created successfully!");

              const schoolId = schoolResponse.school_id;

              const formUserData = {
                fullName: formData.adminName,
                username: formData.adminUsername,
                email: formData.adminEmail,
                password: formData.adminPassword,
                userAddress: formData.adminAddress,
                phoneNumber: formData.adminPhone,
                roles: ["ROLE_ADMIN"],
                schoolId: schoolId,
              };

              await createUserMutation.mutateAsync(formUserData, {
                onSuccess: (userResponse) => {
                  console.log("User registered successfully:", userResponse);
                  toast.success("Admin user registered successfully!");
                },
                onError: (error) => {
                  console.error("User registration failed:", error);
                  toast.error(
                    `User registration failed: ${
                      error.message || "Something went wrong"
                    }`
                  );
                },
              });
            },
            onError: (error) => {
              console.error("School creation failed:", error);
              toast.error(
                `School creation failed: ${
                  error.message || "Something went wrong"
                }`
              );
            },
          }
        );
      } catch (error) {
        console.error("Submission error:", error);
        toast.error(`Submission error: ${error.message}`);
      } finally {
        setIsSubmitting(false); // Reset loading state
      }
    },
    [formData, token, createSchoolMutation, createUserMutation]
  );

  const handleSaveAddress = useCallback((address) => {
    setFormData((prevState) => ({
      ...prevState,
      schoolAddress: [{ ...address }],
    }));
    const formattedAddress = `${address.address_line}, ${address.city}, ${address.zone}, ${address.region}, ${address.country}`;
    console.log("Address saved:", address);
    setAddressClicked(false);
    setAddresses(formattedAddress);
  }, []);

  if (!isMounted) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 top-20 relative">
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-6">SCHOOL INFO</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  School Name
                </label>
                <input
                  type="text"
                  name="schoolName"
                  value={formData.schoolName}
                  onChange={handleChange}
                  required
                  disabled={isSubmitting} // Disable during submission
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                {addressClicked ? (
                  <AddressPopup
                    show={addressClicked}
                    onClose={() => setAddressClicked(false)}
                    onSave={handleSaveAddress}
                  />
                ) : (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      School Address
                    </label>
                    <input
                      type="text"
                      name="schoolAddress"
                      value={addresses}
                      onChange={handleChange}
                      required
                      disabled={isSubmitting} // Disable during submission
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      onClick={() => setAddressClicked(true)}
                    />
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  School Email
                </label>
                <input
                  type="email"
                  name="schoolEmail"
                  value={formData.schoolEmail}
                  onChange={handleChange}
                  required
                  disabled={isSubmitting}
                  title="Please enter a valid email"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md" // Fixed line
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  School Phone
                </label>
                <input
                  type="tel"
                  name="schoolPhone"
                  value={formData.schoolPhone}
                  onChange={handleChange}
                  required
                  disabled={isSubmitting} // Disable during submission
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  School Type
                </label>
                <select
                  name="schoolType"
                  value={formData.schoolType}
                  onChange={handleChange}
                  disabled={isSubmitting} // Disable during submission
                  title="Please select the School Type"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="">Select School Type</option>
                  <option value="public">Public</option>
                  <option value="private">Private</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Establishment Date
                </label>
                <input
                  type="date"
                  name="establishmentDate"
                  value={formData.establishmentDate}
                  onChange={handleChange}
                  required
                  disabled={isSubmitting} // Disable during submission
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  School Info
                </label>
                <textarea
                  name="schoolInfo"
                  value={formData.schoolInfo}
                  title="Please fill out this field"
                  onChange={handleChange}
                  rows="4"
                  disabled={isSubmitting} // Disable during submission
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                ></textarea>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  School Logo
                </label>
                <input
                  type="file"
                  name="schoolLogo"
                  onChange={handleChange}
                  disabled={isSubmitting} // Disable during submission
                  className="w-full px-3 py-2 border"
                  title="Please select a file"
                  required
                />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-6">ADMIN INFO</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Admin Name
                </label>
                <input
                  type="text"
                  name="adminName"
                  value={formData.adminName}
                  onChange={handleChange}
                  required
                  disabled={isSubmitting} // Disable during submission
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Admin Email
                </label>
                <input
                  type="email"
                  name="adminEmail"
                  value={formData.adminEmail}
                  title="Please enter valid email"
                  onChange={handleChange}
                  required
                  disabled={isSubmitting} // Disable during submission
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Admin Password
                </label>
                <input
                  type="text" // Changed from "password" to "text"
                  name="adminPassword"
                  value={formData.adminPassword}
                  onChange={handleChange}
                  required
                  disabled={isSubmitting} // Disable during submission
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Username
                </label>
                <input
                  type="text"
                  name="adminUsername"
                  value={formData.adminUsername}
                  onChange={handleChange}
                  required
                  disabled={isSubmitting} // Disable during submission
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Admin Address
                </label>
                <input
                  type="text"
                  name="adminAddress"
                  value={formData.adminAddress}
                  onChange={handleChange}
                  disabled={isSubmitting} // Disable during submission
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Admin Phone Number
                </label>
                <input
                  type="tel"
                  name="adminPhone"
                  value={formData.adminPhone}
                  onChange={handleChange}
                  required
                  disabled={isSubmitting} // Disable during submission
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end mt-6">
          <button
            type="submit"
            className={`bg-blue-600 text-white py-2 px-6 rounded-md ${
              isSubmitting ? "opacity-50 cursor-not-allowed" : ""
            }`}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Submitting..." : "Submit"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateSchool;
