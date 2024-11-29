"use client"

import { useState } from "react";
import { toast } from "react-toastify";

const CreateSchool = () => {
  const [formData, setFormData] = useState({
    schoolName: "",
    schoolAddress: "",
    schoolEmail: "",
    schoolPhone: "",
    adminName: "",
    gender: "",
    adminEmail: "",
    adminPassword: "",
    schoolLogo: null,
    adminPhoto: null,
    schoolInfo: "",
    adminAddress: "",
    adminPhone: "",
  });

  const handleChange = (e) => {
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
  };

  const validateForm = () => {
    const newErrors = {};
    const requiredFields = [
      "schoolName",
      "schoolAddress",
      "schoolEmail",
      "schoolPhone",
      "adminName",
      "gender",
      "adminEmail",
      "adminPassword",
      "schoolLogo",
      "adminPhoto",
      "schoolInfo",
      "adminAddress",
      "adminPhone",
    ];

    requiredFields.forEach((field) => {
      newErrors[field] = !formData[field];
    });

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.schoolEmail && !emailRegex.test(formData.schoolEmail)) {
      newErrors.schoolEmail = "Invalid email format";
    }
    if (formData.adminEmail && !emailRegex.test(formData.adminEmail)) {
      newErrors.adminEmail = "Invalid email format";
    }

    const phoneRegex = /^\+?[\d\s-]{10,}$/;
    if (formData.schoolPhone && !phoneRegex.test(formData.schoolPhone)) {
      newErrors.schoolPhone = "Invalid phone number";
    }

    if (formData.adminPassword && formData.adminPassword.length < 8) {
      newErrors.adminPassword = "Password must be at least 8 characters";
    }

    // setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fix the errors before submitting.", {
        icon: false, // This removes the icon
      });
      return;
    }
  };

  return (
    < div className="min-h-screen bg-gray-50 p-6 top-20 relative">
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
                  required // This triggers native validation
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  School Address
                </label>
                <input
                  type="text"
                  name="schoolAddress"
                  value={formData.schoolAddress}
                  onChange={handleChange}
                  required
                  className= "w-full px-3 py-2 border border-gray-300 rounded-md"
                />
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
                  title="Please enter a valid email"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                ></textarea>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  School logo
                </label>
                <input
                  type="file"
                  name="schoolLogo"
                  onChange={handleChange}
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
                  className= "w-full px-3 py-2 border border-gray-300 rounded-md"
                />
               
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Admin Password
                </label>
                <input
                  type="password"
                  name="adminPassword"
                  value={formData.adminPassword}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300rounded-md"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Gender
                </label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  title="Please select the gender"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md">
                  <option value="">Select a gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Admin Photo
                </label>
                <input
                  type="file"
                  name="adminPhoto"
                  onChange={handleChange}
                  className="w-full px-3 py-2 border"
                  title="Please select a file"
                  required
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end mt-6">
          <button
            type="submit"
            className="bg-blue-600 text-white py-2 px-6 rounded-md"
          >
            Submit
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateSchool;