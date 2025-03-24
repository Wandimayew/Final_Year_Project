<<<<<<< HEAD
import { useState } from "react";
import {
  FaUser,
  FaEnvelope,
  FaPhone,
  FaBirthdayCake,
  FaVenusMars,
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaCamera,
  FaChalkboardTeacher,
  FaGraduationCap,
  FaBriefcase,
  FaStream,
  FaTimes,
  FaUserShield,
  FaSchool,
} from "react-icons/fa";
=======
'use client'

import Image from "next/image";
>>>>>>> 5f7cb358532ddc87b0dec9622e460731c27a18d7

const StaffModal = ({ staff, teacher, onClose, isTeacher }) => {
  const [isLoading, setIsLoading] = useState(false); // Optional: for future async enhancements

  if (!staff) return null;

  const formatDate = (dateString) => {
    if (!dateString) return "Not available";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatAddress = (addressJson) => {
    if (!addressJson) return "Not available";
    try {
      const address = typeof addressJson === "string" ? JSON.parse(addressJson) : addressJson;
      return `Zone: <span class="font-medium">${address.zone || "N/A"}</span>, City: <span class="font-medium">${address.city || "N/A"}</span>, Region: <span class="font-medium">${address.region || "N/A"}</span>, Country: <span class="font-medium">${address.country || "N/A"}</span>`;
    } catch (e) {
      return String(addressJson);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-70 flex items-center justify-center z-50 p-4 transition-opacity duration-300">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto transform transition-all duration-300 scale-95 hover:scale-100 relative">
        {/* Loading Overlay (Optional) */}
        {isLoading && (
          <div className="absolute inset-0 bg-gray-200 bg-opacity-50 flex items-center justify-center z-10">
            <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}

        <div className="p-6 md:p-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800 font-serif text-center flex-1">
              {isTeacher ? "Teacher Details" : "Staff Details"}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-indigo-600 text-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-full w-10 h-10 flex items-center justify-center transition-colors duration-200"
              aria-label="Close modal"
            >
              <FaTimes />
            </button>
          </div>

          {/* Content */}
          <div className="space-y-6">
            {/* Personal Information */}
            <div className="bg-gray-50 rounded-xl p-5 shadow-sm">
              <h3 className="text-xl font-semibold text-gray-700 font-serif flex items-center mb-4">
                <FaUser className="mr-2 text-indigo-500" /> Personal Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {[
                  { label: "Full Name", value: `${staff.firstName || ""} ${staff.middleName || ""} ${staff.lastName || ""}`, icon: <FaUser /> },
                  { label: "Email", value: staff.email || "Not available", icon: <FaEnvelope /> },
                  { label: "Username", value: staff.username || "Not available", icon: <FaUserShield /> },
                  { label: "Phone", value: staff.phoneNumber || "Not available", icon: <FaPhone /> },
                  { label: "Date of Birth", value: formatDate(staff.dob), icon: <FaBirthdayCake /> },
                  { label: "Gender", value: staff.gender || "Not available", icon: <FaVenusMars /> },
                  { label: "Date of Joining", value: formatDate(staff.dateOfJoining), icon: <FaCalendarAlt /> },
                  {
                    label: "Status",
                    value: (
                      <span
                        className={`inline-flex items-center px-3 py-1 text-sm font-medium rounded-full ${
                          staff.status === "ACTIVE"
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {staff.status || "Not available"}
                      </span>
                    ),
                    icon: <FaCalendarAlt />,
                  },
                  { label: "Role", value: staff.roles || "Not available", icon: <FaUserShield /> },
                  { label: "School ID", value: staff.schoolId || "Not available", icon: <FaSchool /> },
                ].map((item, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <span className="text-indigo-500 mt-1">{item.icon}</span>
                    <div>
                      <label className="text-sm font-semibold text-gray-600 font-serif">{item.label}:</label>
                      <p className="text-gray-800">{item.value}</p>
                    </div>
                  </div>
                ))}

                {/* Address */}
                <div className="col-span-1 md:col-span-2 flex items-start space-x-3">
                  <FaMapMarkerAlt className="text-indigo-500 mt-1" />
                  <div>
                    <label className="text-sm font-semibold text-gray-600 font-serif block">Address:</label>
                    <p
                      className="text-gray-800"
                      dangerouslySetInnerHTML={{ __html: formatAddress(staff.addressJson) }}
                    />
                  </div>
                </div>

                {/* Photo */}
                <div className="col-span-1 md:col-span-2 flex items-start space-x-3">
                  <FaCamera className="text-indigo-500 mt-1" />
                  <div>
                    <label className="text-sm font-semibold text-gray-600 font-serif block">Photo:</label>
                    {staff.photo ? (
                      <img
                        src={`data:image/jpeg;base64,${staff.photo}`}
                        alt="Staff Photo"
                        className="w-32 h-32 object-cover rounded-full border-4 border-indigo-100 shadow-md hover:scale-110 transition-transform duration-300"
                      />
                    ) : (
                      <p className="text-gray-500 italic">No photo available</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

<<<<<<< HEAD
            {/* Teacher-Specific Information */}
            {isTeacher && teacher && (
              <div className="bg-gray-50 rounded-xl p-5 shadow-sm">
                <h3 className="text-xl font-semibold text-gray-700 font-serif flex items-center mb-4">
                  <FaChalkboardTeacher className="mr-2 text-indigo-500" /> Teacher Specific Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {[
                    { label: "Subject Specialization", value: teacher.subjectSpecialization || "Not available", icon: <FaChalkboardTeacher /> },
                    { label: "Qualification", value: teacher.qualification || "Not available", icon: <FaGraduationCap /> },
                    { label: "Experience", value: `${teacher.experience || "Not available"} years`, icon: <FaBriefcase /> },
                    { label: "Stream ID", value: teacher.streamId || "Not available", icon: <FaStream /> },
                  ].map((item, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <span className="text-indigo-500 mt-1">{item.icon}</span>
                      <div>
                        <label className="text-sm font-semibold text-gray-600 font-serif">{item.label}:</label>
                        <p className="text-gray-800">{item.value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
=======
          <div>
            <label className="font-semibold block font-serif">Phone:</label>
            <p>{staff.phoneNumber || 'Not available'}</p>
          </div>

          <div>
            <label className="font-semibold block font-serif">Date of Birth:</label>
            <p>{formatDate(staff.dob)}</p>
          </div>

          <div>
            <label className="font-semibold block font-serif">Gender:</label>
            <p>{staff.gender || 'Not available'}</p>
          </div>

          <div>
            <label className="font-semibold block font-serif">Date of Joining:</label>
            <p>{formatDate(staff.dateOfJoining)}</p>
          </div>

          <div>
            <label className="font-semibold block font-serif">Status:</label>
            <p className={`inline-block px-2 py-1 rounded-full ${
              staff.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              {staff.status || 'Not available'}
            </p>
          </div>

          <div>
            <label className="font-semibold block font-serif">Role:</label>
            <p>{staff.role || 'Not available'}</p>
          </div>

          <div>
            <label className="font-semibold block font-serif">School ID:</label>
            <p>{staff.schoolId || 'Not available'}</p>
          </div>

          <div className="col-span-1 md:col-span-2">
            <label className="font-semibold block font-serif">Address:</label>
            <p dangerouslySetInnerHTML={{ __html: formatAddress(staff.addressJson) }} />
          </div>

          <div className="col-span-1 md:col-span-2">
            <label className="font-semibold block font-serif">Photo:</label>
            {staff.photo ? (
              <Image
                src={`data:image/jpeg;base64,${staff.photo}`}
                alt="Staff Photo"
                className="w-32 h-32 object-cover rounded-full"
              />
            ) : (
              <p>No photo available</p>
>>>>>>> 5f7cb358532ddc87b0dec9622e460731c27a18d7
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaffModal;