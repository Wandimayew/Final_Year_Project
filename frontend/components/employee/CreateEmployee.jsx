"use client";
import React, { useState } from "react";
import { toast } from "react-toastify";
import axios from "axios";
import AddressPopup from "./AddressPopup";
import {
  User,
  Mail,
  Phone,
  Lock,
  Calendar,
  School,
  Briefcase,
  Camera,
  MapPin,
  BookOpen,
  Award,
  Clock,
} from "lucide-react";

const CreateEmployee = () => {
  const [formData, setFormData] = useState({
    userId: "",
    schoolId: "",
    firstName: "",
    middleName: "",
    lastName: "",
    username: "",
    dateOfJoining: "",
    email: "",
    password: "",
    phoneNumber: "",
    status: "ACTIVE",
    dob: "",
    gender: "",
    role: "",
    address: [],
    photo: null,
    teacher: {
      subjectSpecialization: "",
      qualification: "",
      experience: "",
      streamId: "",
    },
  });

  const [addressClicked, setAddressClicked] = useState(false);
  const [addresses, setAddresses] = useState("");

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;

    if (name.startsWith("teacher.")) {
      const teacherField = name.split(".")[1];
      setFormData((prevState) => ({
        ...prevState,
        teacher: {
          ...prevState.teacher,
          [teacherField]: value,
        },
      }));
    } else if (type === "file") {
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const userResponse = await axios.get(`http://localhost:8083/api/users/${formData.userId}`);
      const existingUser = userResponse.data;

      if (!existingUser) {
        toast.error("User does not exist. Please create a user first.");
        return;
      }

      console.log("User found. Verifying attributes...");

      if (
        existingUser.username !== formData.username ||
        existingUser.email !== formData.email ||
        existingUser.password !== formData.password ||
        existingUser.role !== formData.role
      ) {
        toast.error("User attributes do not match. Please check username, email, password, and role.");
        return;
      }

      console.log("User attributes match. Proceeding with staff creation...");

      const formDataToSend = new FormData();
      Object.keys(formData).forEach((key) => {
        if (key !== "address" && key !== "teacher" && key !== "photo") {
          formDataToSend.append(key, formData[key]);
        }
      });
      formDataToSend.append("addressJson", JSON.stringify(formData.address[0] || {}));

      if (formData.photo) {
        formDataToSend.append("photo", formData.photo);
      }

      const response = await axios.post(
        "http://localhost:8083/staff/api/staff/create",
        formDataToSend,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (formData.role === "TEACHER" && response.data) {
        const teacherData = new FormData();
        teacherData.append("staffId", response.data.staffId);
        teacherData.append("schoolId", response.data.schoolId);
        Object.keys(formData.teacher).forEach((key) => {
          teacherData.append(key, formData.teacher[key]);
        });

        await axios.post(
          "http://localhost:8083/staff/api/teachers/create",
          teacherData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );
        toast.success("Teacher created successfully!");
      } else {
        toast.success("Staff created successfully!");
      }

      setFormData({
        userId: "",
        schoolId: "",
        firstName: "",
        middleName: "",
        lastName: "",
        username: "",
        dateOfJoining: "",
        email: "",
        password: "",
        phoneNumber: "",
        status: "ACTIVE",
        dob: "",
        gender: "",
        role: "",
        address: [],
        photo: null,
        teacher: {
          subjectSpecialization: "",
          qualification: "",
          experience: "",
          streamId: "",
        },
      });
      setAddresses("");
    } catch (error) {
      console.error("Error during submission:", error);
      toast.error(error.response?.data?.message || "An error occurred while creating the employee.");
    }
  };

  const handleSaveAddress = (address) => {
    setFormData((prevState) => ({
      ...prevState,
      address: [{ ...address }],
    }));
    const formattedAddress = `${address.city}, ${address.zone}, ${address.region}, ${address.country}`;
    setAddressClicked(false);
    setAddresses(formattedAddress);
  };

  return (
    <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <form onSubmit={handleSubmit} className="max-w-5xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Personal Information */}
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <h2 className="text-xl font-semibold text-indigo-700 mb-6 flex items-center gap-2">
              <User className="h-6 w-6" /> Personal Information
            </h2>
            <div className="space-y-4">
              {[
                { label: "User ID", name: "userId", type: "text", icon: User },
                { label: "First Name*", name: "firstName", type: "text", required: true, icon: User },
                { label: "Middle Name", name: "middleName", type: "text", icon: User },
                { label: "Last Name*", name: "lastName", type: "text", required: true, icon: User },
                { label: "Username*", name: "username", type: "text", required: true, minLength: 5, maxLength: 30, icon: User },
                { label: "Password*", name: "password", type: "password", required: true, icon: Lock },
                { label: "Email*", name: "email", type: "email", required: true, icon: Mail },
                { label: "Phone Number", name: "phoneNumber", type: "tel", icon: Phone },
              ].map((field) => (
                <div key={field.name}>
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                    <field.icon className="h-4 w-4 text-indigo-500" />
                    {field.label}
                    {field.required && <span className="text-red-500">*</span>}
                  </label>
                  <input
                    type={field.type}
                    name={field.name}
                    value={formData[field.name]}
                    onChange={handleChange}
                    required={field.required}
                    minLength={field.minLength}
                    maxLength={field.maxLength}
                    placeholder={field.label.replace("*", "")}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 hover:border-indigo-400 text-black"
                  />
                </div>
              ))}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                  <Briefcase className="h-4 w-4 text-indigo-500" />
                  Role*
                </label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  required
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 hover:border-indigo-400 text-black"
                >
                  <option value="">Select Role</option>
                  <option value="TEACHER">Teacher</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>
            </div>
          </div>

          {/* Employment Details */}
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <h2 className="text-xl font-semibold text-indigo-700 mb-6 flex items-center gap-2">
              <School className="h-6 w-6" /> Employment Details
            </h2>
            <div className="space-y-4">
              {[
                { label: "School ID", name: "schoolId", type: "number", icon: School },
                { label: "Date of Joining", name: "dateOfJoining", type: "date", icon: Calendar },
                { label: "Date of Birth", name: "dob", type: "date", icon: Calendar },
              ].map((field) => (
                <div key={field.name}>
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                    <field.icon className="h-4 w-4 text-indigo-500" />
                    {field.label}
                  </label>
                  <input
                    type={field.type}
                    name={field.name}
                    value={formData[field.name]}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 hover:border-indigo-400 text-black"
                  />
                </div>
              ))}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                  <User className="h-4 w-4 text-indigo-500" />
                  Gender
                </label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 hover:border-indigo-400 text-black"
                >
                  <option value="">Select Gender</option>
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                  <Briefcase className="h-4 w-4 text-indigo-500" />
                  Employment Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 hover:border-indigo-400 text-black"
                >
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                  <option value="ON_LEAVE">On Leave</option>
                  <option value="TERMINATED">Terminated</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                  <Camera className="h-4 w-4 text-indigo-500" />
                  Photo
                </label>
                <input
                  type="file"
                  name="photo"
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 transition-all duration-200 text-black"
                />
              </div>
            </div>
          </div>

          {/* Address Information */}
          <div className="bg-white p-6 rounded-xl shadow-lg md:col-span-2">
            <h2 className="text-xl font-semibold text-indigo-700 mb-6 flex items-center gap-2">
              <MapPin className="h-6 w-6" /> Address Information
            </h2>
            <div>
              {addressClicked ? (
                <AddressPopup
                  show={addressClicked}
                  onClose={() => setAddressClicked(false)}
                  onSave={handleSaveAddress}
                />
              ) : (
                <input
                  type="text"
                  name="address"
                  value={addresses}
                  onChange={handleChange}
                  required
                  onClick={() => setAddressClicked(true)}
                  placeholder="Click to add address"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 hover:border-indigo-400 text-black"
                />
              )}
            </div>
          </div>

          {/* Teacher Details */}
          {formData.role === "TEACHER" && (
            <div className="bg-white p-6 rounded-xl shadow-lg md:col-span-2">
              <h2 className="text-xl font-semibold text-indigo-700 mb-6 flex items-center gap-2">
                <BookOpen className="h-6 w-6" /> Teacher Details
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { label: "Stream ID", name: "teacher.streamId", type: "number", icon: BookOpen },
                  { label: "Subject Specialization*", name: "teacher.subjectSpecialization", type: "text", required: true, icon: BookOpen },
                  { label: "Qualification*", name: "teacher.qualification", type: "text", required: true, icon: Award },
                  { label: "Experience*", name: "teacher.experience", type: "text", required: true, icon: Clock },
                ].map((field) => (
                  <div key={field.name}>
                    <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                      <field.icon className="h-4 w-4 text-indigo-500" />
                      {field.label}
                      {field.required && <span className="text-red-500">*</span>}
                    </label>
                    <input
                      type={field.type}
                      name={field.name}
                      value={formData.teacher[field.name.split(".")[1]]}
                      onChange={handleChange}
                      required={field.required}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 hover:border-indigo-400 text-black"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="mt-8 flex justify-end">
          <button
            type="submit"
            className="py-3 px-6 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-300 flex items-center gap-2"
          >
            <User className="h-5 w-5" />
            Submit
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateEmployee;