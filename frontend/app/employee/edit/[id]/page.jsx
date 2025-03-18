"use client";
import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { staffService } from "@/services/api";
import { useRouter, useParams } from "next/navigation";
import {
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  HomeIcon,
  CalendarIcon,
  LockClosedIcon,
  BriefcaseIcon,
  AcademicCapIcon,
  CameraIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";

export default function EditForm({ staff: initialStaff, activeTab }) {
  const router = useRouter();
  const { id } = useParams();

  const [formData, setFormData] = useState({
    firstName: "",
    middleName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    address: { zone: "", city: "", region: "", country: "" },
    role: "TEACHER",
    status: "ACTIVE",
    dateOfJoining: "",
    username: "",
    password: "",
    photo: null,
    teacher: {
      streamId: "",
      experience: "",
      qualification: "",
      subjectSpecialization: "",
    },
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStaff = async () => {
      try {
        setLoading(true);
        const staffData = initialStaff || (await staffService.getStaffById(id)).data;
        console.log("Fetched staffData:", staffData);
        initializeFormData(staffData);
      } catch (error) {
        toast.error("Failed to load staff data");
        console.error("Error fetching staff:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStaff();
  }, [id, initialStaff]);

  const initializeFormData = (staffData) => {
    let address = { zone: "", city: "", region: "", country: "" };
    if (staffData?.addressJson) {
      if (typeof staffData.addressJson === "string") {
        try {
          const parsedAddress = JSON.parse(staffData.addressJson);
          address = Array.isArray(parsedAddress) ? parsedAddress[0] : parsedAddress;
        } catch (e) {
          console.error("Error parsing addressJson string:", e);
        }
      } else if (typeof staffData.addressJson === "object") {
        address = Array.isArray(staffData.addressJson) ? staffData.addressJson[0] : staffData.addressJson;
      }
    }

    setFormData({
      firstName: staffData?.firstName || "",
      middleName: staffData?.middleName || "",
      lastName: staffData?.lastName || "",
      email: staffData?.email || "",
      phoneNumber: staffData?.phoneNumber || "",
      address: address,
      role: staffData?.roles?.[0] || "TEACHER",
      status: staffData?.status || "ACTIVE",
      dateOfJoining: staffData?.dateOfJoining?.split("T")[0] || "",
      username: staffData?.username || "",
      password: "",
      photo: null,
      teacher: {
        streamId: staffData?.teacher?.streamId || "",
        experience: staffData?.teacher?.experience || "",
        qualification: staffData?.teacher?.qualification || "",
        subjectSpecialization: staffData?.teacher?.subjectSpecialization || "",
      },
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes(".")) {
      const [parent, child] = name.split(".");
      setFormData((prev) => ({
        ...prev,
        [parent]: { ...prev[parent], [child]: value },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handlePhotoChange = (e) => {
    setFormData((prev) => ({ ...prev, photo: e.target.files[0] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formDataToSend = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (key === "address") {
          formDataToSend.append("addressJson", JSON.stringify([value]));
        } else if (key === "teacher" && formData.role === "TEACHER") {
          Object.entries(value).forEach(([subKey, subValue]) => {
            if (subValue) formDataToSend.append(`teacher.${subKey}`, subValue);
          });
        } else if (key === "photo" && value) {
          formDataToSend.append(key, value);
        } else if (key !== "role" && value) {
          formDataToSend.append(key, value);
        }
      });
      if (formData.role) {
        formDataToSend.append("roles", formData.role);
      }

      await staffService.updateStaff(id || initialStaff.staffId, formDataToSend);
      toast.success("Staff updated successfully");
      router.push("/employee");
    } catch (error) {
      toast.error("Failed to update staff data");
      console.error("Error updating staff:", error);
    }
  };

  if (loading) return <div className="text-center py-8 text-gray-500">Loading...</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center p-6 mt-12">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-xl p-8 transform transition-all hover:shadow-2xl text-black">
        <h2 className="text-3xl font-bold text-indigo-700 mb-8 text-center flex items-center justify-center gap-2">
          <UserIcon className="h-8 w-8" />
          Edit {formData.role === "TEACHER" ? "Teacher" : "Staff"} Details
        </h2>
        <form onSubmit={handleSubmit} className="space-y-10">
          <section>
            <h3 className="text-xl font-semibold text-gray-800 mb-4 border-b-2 border-indigo-200 pb-2 flex items-center gap-2">
              <HomeIcon className="h-6 w-6 text-indigo-600" />
              Personal Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { label: "First Name", name: "firstName", type: "text", required: true, icon: UserIcon },
                { label: "Middle Name", name: "middleName", type: "text", icon: UserIcon },
                { label: "Last Name", name: "lastName", type: "text", required: true, icon: UserIcon },
                { label: "Email", name: "email", type: "email", required: true, icon: EnvelopeIcon },
                { label: "Phone Number", name: "phoneNumber", type: "tel", icon: PhoneIcon },
                { label: "Zone", name: "address.zone", type: "text", icon: HomeIcon },
                { label: "City", name: "address.city", type: "text", icon: HomeIcon },
                { label: "Region", name: "address.region", type: "text", icon: HomeIcon },
                { label: "Country", name: "address.country", type: "text", icon: HomeIcon },
                { label: "Date of Joining", name: "dateOfJoining", type: "date", icon: CalendarIcon },
                { label: "Username", name: "username", type: "text", icon: UserIcon },
                { label: "Password", name: "password", type: "password", icon: LockClosedIcon },
              ].map((field) => (
                <div key={field.name} className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                    <field.icon className="h-4 w-4 text-indigo-500" />
                    {field.label}
                    {field.required && <span className="text-red-500">*</span>}
                  </label>
                  <input
                    name={field.name}
                    type={field.type}
                    value={
                      field.name.includes(".")
                        ? field.name.split(".").reduce((o, i) => o[i] || "", formData)
                        : formData[field.name] || ""
                    }
                    onChange={handleChange}
                    className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 hover:border-indigo-400"
                    required={field.required}
                  />
                </div>
              ))}
            </div>
          </section>

          <section>
            <h3 className="text-xl font-semibold text-gray-800 mb-4 border-b-2 border-indigo-200 pb-2 flex items-center gap-2">
              <BriefcaseIcon className="h-6 w-6 text-indigo-600" />
              Professional Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                  <BriefcaseIcon className="h-4 w-4 text-indigo-500" />
                  Role
                </label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 hover:border-indigo-400 appearance-none"
                >
                  <option value="TEACHER">Teacher</option>
                  <option value="LIBRARIAN">Librarian</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>
              {formData.role === "TEACHER" && [
                { label: "Stream ID", name: "teacher.streamId", type: "text", icon: AcademicCapIcon },
                { label: "Experience", name: "teacher.experience", type: "text", icon: AcademicCapIcon },
                { label: "Qualification", name: "teacher.qualification", type: "text", icon: AcademicCapIcon },
                { label: "Subject Specialization", name: "teacher.subjectSpecialization", type: "text", icon: AcademicCapIcon },
              ].map((field) => (
                <div key={field.name} className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                    <field.icon className="h-4 w-4 text-indigo-500" />
                    {field.label}
                  </label>
                  <input
                    name={field.name}
                    type={field.type}
                    value={field.name.split(".").reduce((o, i) => o[i] || "", formData)}
                    onChange={handleChange}
                    className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 hover:border-indigo-400"
                  />
                </div>
              ))}
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                  <CheckCircleIcon className="h-4 w-4 text-indigo-500" />
                  Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 hover:border-indigo-400 appearance-none"
                >
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                </select>
              </div>
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                  <CameraIcon className="h-4 w-4 text-indigo-500" />
                  Photo
                </label>
                <input
                  name="photo"
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="w-full p-3 pl-10 border border-gray-300 rounded-lg file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 transition-all duration-200"
                />
              </div>
            </div>
          </section>

          <button
            type="submit"
            className="w-full py-3 px-6 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-300 flex items-center justify-center gap-2"
          >
            <CheckCircleIcon className="h-5 w-5" />
            Update {formData.role === "TEACHER" ? "Teacher" : "Staff"}
          </button>
        </form>
      </div>
    </div>
  );
}