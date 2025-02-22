"use client";
import { useState } from "react";
import { toast } from "react-toastify";
import { staffService } from "../../services/api";
import { useRouter } from "next/navigation";

export default function EditForm({ staff, activeTab }) {
  const router = useRouter();

  const [formData, setFormData] = useState({
    firstName: staff?.firstName || "",
    middleName: staff?.middleName || "",
    lastName: staff?.lastName || "",
    email: staff?.email || "",
    phoneNumber: staff?.phoneNumber || "",
    address: {
      zone: staff?.address?.zone || "",
      city: staff?.address?.city || "",
      region: staff?.address?.region || "",
      country: staff?.address?.country || "",
    },
    role: staff?.role || "TEACHER",
    status: staff?.status || "ACTIVE",
    dateOfJoining: staff?.dateOfJoining || "",
    username: staff?.username || "",
    password: staff?.password || "",
    photo: null,
    teacher: {
      streamId: staff?.teacher?.streamId || "",
      experience: staff?.teacher?.experience || "",
      qualification: staff?.teacher?.qualification || "",
      subjectSpecialization: staff?.teacher?.subjectSpecialization || "",
    },
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith("staff.")) {
      const staffField = name.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        staff: {
          ...prev.staff,
          [staffField]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    setFormData((prev) => ({
      ...prev,
      staff: {
        ...prev.staff,
        photo: file,
      },
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formDataToSend = new FormData();
      Object.keys(formData).forEach((key) => {
        if (key === "teacher") {
          Object.keys(formData[key]).forEach((teacherKey) => {
            formDataToSend.append(
              `teacher.${teacherKey}`,
              formData[key][teacherKey]
            );
          });
        } else if (formData[key]) {
          formDataToSend.append(key, formData[key]);
        }
      });

      let response;
      if (activeTab === "teacher") {
        response = await staffService.updateTeacher(
          staff.staffId,
          formDataToSend
        );
      } else {
        response = await staffService.updateStaff(
          staff.staffId,
          formDataToSend
        );
      }

      toast.success(`${activeTab} updated successfully`);
      router.push("/employee");
    } catch (error) {
      toast.error("Failed to update staff data");
      console.error("Error updating staff data:", error);
    }
  };

  return (
    <div className="flex justify-center items-center bg-gray-100 p-4">
      <div className="w-full max-w-3xl bg-white shadow-lg rounded-lg p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Information Section */}
          <div className="text-lg font-semibold text-gray-700">
            Personal Information
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                First Name
              </label>
              <input
                name="firstName"
                type="text"
                value={formData.firstName}
                onChange={handleChange}
                className="mt-1 p-2 w-full border rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Middle Name
              </label>
              <input
                name="middleName"
                type="text"
                value={formData.middleName}
                onChange={handleChange}
                className="mt-1 p-2 w-full border rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Last Name
              </label>
              <input
                name="lastName"
                type="text"
                value={formData.lastName}
                onChange={handleChange}
                className="mt-1 p-2 w-full border rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                className="mt-1 p-2 w-full border rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Phone Number
              </label>
              <input
                name="phoneNumber"
                type="tel"
                value={formData.phoneNumber}
                onChange={handleChange}
                className="mt-1 p-2 w-full border rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Zone
              </label>
              <input
                name="address.zone"
                type="text"
                value={formData.address.zone}
                onChange={handleChange}
                className="mt-1 p-2 w-full border rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                City
              </label>
              <input
                name="address.city"
                type="text"
                value={formData.address.city}
                onChange={handleChange}
                className="mt-1 p-2 w-full border rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Region
              </label>
              <input
                name="address.region"
                type="text"
                value={formData.address.region}
                onChange={handleChange}
                className="mt-1 p-2 w-full border rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Country
              </label>
              <input
                name="address.country"
                type="text"
                value={formData.address.country}
                onChange={handleChange}
                className="mt-1 p-2 w-full border rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Date of Joining
              </label>
              <input
                name="dateOfJoining"
                type="date"
                value={formData.dateOfJoining}
                onChange={handleChange}
                className="mt-1 p-2 w-full border rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Username
              </label>
              <input
                name="username"
                type="text"
                value={formData.username}
                onChange={handleChange}
                className="mt-1 p-2 w-full border rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                className="mt-1 p-2 w-full border rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Professional Information Section */}
          <div className="text-lg font-semibold text-gray-700 mt-6">
            Professional Information
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Role
              </label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="mt-1 p-2 w-full border rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="TEACHER">Teacher</option>
                <option value="LIBRARIAN">Librarian</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Stream ID
              </label>
              <input
                name="streamId"
                type="text"
                value={formData.teacher.streamId}
                onChange={handleChange}
                className="mt-1 p-2 w-full border rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Experience
              </label>
              <input
                name="experience"
                type="text"
                value={formData.teacher.experience}
                onChange={handleChange}
                className="mt-1 p-2 w-full border rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Qualification
              </label>
              <input
                name="qualification"
                type="text"
                value={formData.teacher.qualification}
                onChange={handleChange}
                className="mt-1 p-2 w-full border rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Subject Specialization
              </label>
              <input
                name="subjectSpecialization"
                type="text"
                value={formData.teacher.subjectSpecialization}
                onChange={handleChange}
                className="mt-1 p-2 w-full border rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="mt-1 p-2 w-full border rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Photo
              </label>
              <input
                name="photo"
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                className="mt-1 p-2 w-full border rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition duration-300"
          >
            Update {activeTab}
          </button>
        </form>
      </div>
    </div>
  );
}
