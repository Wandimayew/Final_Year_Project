"use client";

import { useState } from "react";
import { toast } from "react-toastify";
import AddressPopup from "./AddressPopup";
import axios from "axios";

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
    adminUsername: ""
  });

  const [addressClicked, setAddressClicked] = useState(false);
  const [addresses, setAddresses] = useState("");

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
      "establishmentDate",
      "schooType",
      "adminName",
      "adminEmail",
      "adminPassword",
      "schoolLogo",
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

    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
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
    // const token = "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ3YW5kaSIsImp0aSI6ImYzNzU2NmRkLTRhZTEtNDgxMy1iNGM2LTFjYzdjNWU1OTA1MSIsImlhdCI6MTc0MjY0NzEyMCwiZXhwIjoxNzQyNzMzNTIwLCJlbWFpbCI6IndvbmRpbWF5ZXdhc2NoYWxld0BnbWFpbC5jb20iLCJzY2hvb2xfaWQiOiJhZG1pbiIsInVzZXJfaWQiOiJ3YW5kaS0xIiwicm9sZXMiOlsiUk9MRV9TVVBFUkFETUlOIl19.ewMiPQwERjeeX7rgHX4mieJF8XAtMFPxPJbtVgnJ-hw"
    // const token = "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ3YW5kaWkiLCJqdGkiOiIzMDI5OGI3My0zYjYwLTQ4YWEtODc3Mi1mY2IxNWY2M2FiNmUiLCJpYXQiOjE3NDI2NTE4MzUsImV4cCI6MTc0MjczODIzNSwiZW1haWwiOiJ3YW5kaWlAZ21haWwuY29tIiwic2Nob29sX2lkIjoiR0xPQkFMUyIsInVzZXJfaWQiOiJHTE9CQUxTMDAxIiwicm9sZXMiOlsiUk9MRV9BRE1JTiJdfQ.KRzlN7quZAnfwDSglGVvUQqZuk82_Bci7VF9cjtA1Hc"
    // const token = "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ3YW5kaWkiLCJqdGkiOiI1NTIwYTc3Yi1iYjRlLTRhMjUtOGRkZi1lMTBhY2ZjMWEzOTMiLCJpYXQiOjE3NDI2NTI4OTksImV4cCI6MTc0MjczOTI5OSwiZW1haWwiOiJ3YW5kaWlAZ21haWwuY29tIiwic2Nob29sX2lkIjoiR0xPQkFMUyIsInVzZXJfaWQiOiJHTE9CQUxTMDAxIiwicm9sZXMiOlsiUk9MRV9BRE1JTiJdfQ.oMGO51Wo-RZzmYVPdGbnkJk0SlS61vZeBh3mRxE03UI"
    // const token= "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ3YW5kaSIsImp0aSI6IjdiMjJhYWRhLWZjZTgtNDZiMi1iNDA0LTY3NmJhODUyY2JmZSIsImlhdCI6MTc0MjY1MzQxMSwiZXhwIjoxNzQyNzM5ODExLCJlbWFpbCI6IndvbmRpbWF5ZXdhc2NoYWxld0BnbWFpbC5jb20iLCJzY2hvb2xfaWQiOiJhZG1pbiIsInVzZXJfaWQiOiJ3YW5kaS0xIiwicm9sZXMiOlsiUk9MRV9TVVBFUkFETUlOIl19.boa3lbLbRT2vxI-M8z88309xoTuWhr6Bk6gK8ecjBDw"
    const token= "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ3YW5kaWkiLCJqdGkiOiI3MGFiMGE4Mi02Yjc3LTQ5ZTEtYTgxZi1kNmFkZWRmMzE5YWQiLCJpYXQiOjE3NDI2NTM1NDUsImV4cCI6MTc0MjczOTk0NSwiZW1haWwiOiJ3YW5kaWlAZ21haWwuY29tIiwic2Nob29sX2lkIjoiR0xPQkFMUyIsInVzZXJfaWQiOiJHTE9CQUxTMDAxIiwicm9sZXMiOlsiUk9MRV9BRE1JTiJdfQ.yiAoctTmaVHXmtvq9KWfVGBon-YmfLcNtecvWrjC3yM"
    e.preventDefault();
    console.log("Saveing data");

    // if (!validateForm()) {
    //   toast.error("Please fix the errors before submitting.", {
    //     icon: false, // This removes the icon
    //   });
    //   return;
    // }

    console.log("we are here");
    // Prepare FormData to match the DTO structure
    const formDataToSend = new FormData();
    formDataToSend.append("school_name", formData.schoolName);
    // Convert the address array to a JSON string if necessary
    formDataToSend.append("addresses", JSON.stringify(formData.schoolAddress)); // Sending as JSON string
    formDataToSend.append("contact_number", formData.schoolPhone);
    formDataToSend.append("email_address", formData.schoolEmail);
    formDataToSend.append("school_type", formData.schoolType);
    formDataToSend.append("establishment_date", formData.establishmentDate); // LocalDate, should be in yyyy-MM-dd format
    formDataToSend.append("logo", formData.schoolLogo); // File field for logo
    formDataToSend.append("school_information", formData.schoolInfo);
    console.log("we are there");
    try {
      console.log("Form Data being sent:");
      for (let pair of formDataToSend.entries()) {
        console.log(pair[0] + ": " + pair[1]);
      }
      // Sending the form data with Axios
      const response = await axios.post(
        "http://10.194.61.74:8080/tenant/api/addNewSchool",
        formDataToSend,
        {
          headers: {
            "Content-Type": "multipart/form-data", // Important for file uploads
            "Authorization": `Bearer ${token}`,    // Add the Authorization header with Bearer token
          },
        }
      );
      console.log("successfully registered :", response);

      if (response.status === 200) {
        console.log("school response :",response);
        
        const schoolId=response.data.school_id;
        const formUserData = {
          schoolId: schoolId,
          fullName: formData.adminName,
          username: formData.adminUsername,
          email: formData.adminEmail,
          password: formData.adminPassword,
          userAddress: formData.adminAddress,
          phoneNumber: formData.adminPhone,
          roles: ["ADMIN"],
        };
        try{
          const userResponse = await axios.post(
            "http://10.194.61.74:8080/auth/api/register",
            formUserData,
            {
              headers: {
                "Content-Type": "application/json", // Correct for JSON payloads
              },
            }
          );
          console.log("user one with school registered : ",userResponse);

          if (userResponse.status === 200) {

          console.log("user with school registered : ",userResponse);
          }

        }catch(error){
          console.error("Error during submission:", error); // Log the full error
          toast.error(`Network error: ${error.message}`);
        }

        toast.success("School created successfully!");
        
      } else {
        console.log("error is occured");

        const errorData = await response.json();
        toast.error(`Error: ${errorData.message || "Something went wrong"}`);
      }
    } catch (error) {
      console.error("Error during submission:", error); // Log the full error
      toast.error(`Network error: ${error.message}`);
    }
  };

  const handleSaveAddress = (address) => {
    // Add the address to the schoolAddress array
    setFormData((prevState) => ({
      ...prevState,
      schoolAddress: [{ ...address }], // Address saved as an array
    }));
    // Assuming address is an object with properties like street, city, state, zip, etc.
    const formattedAddress = `${address.address_line}, ${address.city}, ${address.zone}, ${address.region}, ${address.country}`;

    console.log("address is taken this data", address);
    setAddressClicked(false); // Close the popup
    setAddresses(formattedAddress);
  };

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
                  required // This triggers native validation
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>

              <div>
                {addressClicked ? (
                  <div>
                    <AddressPopup
                      show={addressClicked}
                      onClose={() => setAddressClicked(false)}
                      onSave={handleSaveAddress}
                    />
                  </div>
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      onClick={() => setAddressClicked(true)} // Show the popup when clicked
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
                  School Type
                </label>
                <select
                  name="schoolType"
                  value={formData.schoolType}
                  onChange={handleChange}
                  title="Please select the School Type"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="">Select School Type</option>
                  <option value="public">Public</option>
                  <option value="private">private</option>
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
                  required // This triggers native validation
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
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

              {/* <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Gender
                </label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  title="Please select the gender"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="">Select a gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div> */}
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

              {/* <div>
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
              </div> */}
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
