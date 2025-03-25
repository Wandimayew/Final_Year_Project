// "use client";
// import { FaUser, FaSchool, FaCalendar, FaPhone, FaMapMarker, FaIdCard } from "react-icons/fa";
// import { useStudent } from "@/lib/api/studentService/students";
// import { use } from "react";

// const StudentDetailPage = ({ params }) => {
// const { studentId } = use(params);
//   const {data: studentData, isLoading, error} = useStudent(studentId);

//   if (isLoading) return <div className="text-center py-8">Loading...</div>;
//   if (error) return <div className="text-center py-8 text-red-600">{error}</div>;
//   if (!studentData) return <div className="text-center py-8">No student data found.</div>;

//   return (
//     <div className="min-h-screen bg-gray-50 p-4 md:p-8">
//       <div className="max-w-7xl mx-auto bg-white rounded-lg shadow-lg p-6">
//         {/* Header */}
//         <div className="flex items-center justify-between mb-6">
//           <h1 className="text-3xl font-bold text-gray-800 flex items-center">
//             <FaUser className="mr-2 text-blue-600" />
//             Student Details
//           </h1>
//           <span
//             className={`px-3 py-1 text-sm font-semibold rounded-full ${
//                 studentData.active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
//             }`}
//           >
//             {studentData.active ? "Active" : "Inactive"}
//           </span>
//         </div>

//         {/* Personal Information Section */}
//         <section className="mb-8">
//           <h2 className="text-xl font-semibold text-gray-700 mb-4 flex items-center">
//             <FaUser className="mr-2 text-blue-600" />
//             Personal Information
//           </h2>
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//             <div>
//               <label className="block text-sm font-medium text-gray-500">First Name</label>
//               <p className="text-gray-900 font-semibold">{studentData.firstName}</p>
//             </div>
//             <div>
//               <label className="block text-sm font-medium text-gray-500">Middle Name</label>
//               <p className="text-gray-900 font-semibold">{studentData.middleName || "N/A"}</p>
//             </div>
//             <div>
//               <label className="block text-sm font-medium text-gray-500">Last Name</label>
//               <p className="text-gray-900 font-semibold">{studentData.lastName}</p>
//             </div>
//             <div>
//               <label className="block text-sm font-medium text-gray-500">Date of Birth</label>
//               <p className="text-gray-900 font-semibold">
//                 {new Date(studentData.dateOfBirth).toLocaleDateString()}
//               </p>
//             </div>
//             <div>
//               <label className="block text-sm font-medium text-gray-500">Gender</label>
//               <p className="text-gray-900 font-semibold">{studentData.gender}</p>
//             </div>
//             <div>
//               <label className="block text-sm font-medium text-gray-500">National ID</label>
//               <p className="text-gray-900 font-semibold">{studentData.nationalId}</p>
//             </div>
//           </div>
//         </section>

//         {/* Academic Information Section */}
//         <section className="mb-8">
//           <h2 className="text-xl font-semibold text-gray-700 mb-4 flex items-center">
//             <FaSchool className="mr-2 text-blue-600" />
//             Academic Information
//           </h2>
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//             <div>
//               <label className="block text-sm font-medium text-gray-500">Registration ID</label>
//               <p className="text-gray-900 font-semibold">{studentData.registId}</p>
//             </div>
//             <div>
//               <label className="block text-sm font-medium text-gray-500">School ID</label>
//               <p className="text-gray-900 font-semibold">{studentData.schoolId}</p>
//             </div>
//             <div>
//               <label className="block text-sm font-medium text-gray-500">Class ID</label>
//               <p className="text-gray-900 font-semibold">{studentData.classId}</p>
//             </div>
//             <div>
//               <label className="block text-sm font-medium text-gray-500">Section ID</label>
//               <p className="text-gray-900 font-semibold">{studentData.sectionId}</p>
//             </div>
//             <div>
//               <label className="block text-sm font-medium text-gray-500">Admission Date</label>
//               <p className="text-gray-900 font-semibold">
//                 {new Date(studentData.admissionDate).toLocaleDateString()}
//               </p>
//             </div>
//             <div>
//               <label className="block text-sm font-medium text-gray-500">Status</label>
//               <p
//                 className={`text-sm font-semibold ${
//                   studentData.passed ? "text-green-600" : "text-red-600"
//                 }`}
//               >
//                 {studentData.passed ? "Passed" : "Not Passed"}
//               </p>
//             </div>
//           </div>
//         </section>

//         {/* Contact Information Section */}
//         <section className="mb-8">
//           <h2 className="text-xl font-semibold text-gray-700 mb-4 flex items-center">
//             <FaPhone className="mr-2 text-blue-600" />
//             Contact Information
//           </h2>
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//             <div>
//               <label className="block text-sm font-medium text-gray-500">Contact Info</label>
//               <p className="text-gray-900 font-semibold">{studentData.contactInfo}</p>
//             </div>
//             <div>
//               <label className="block text-sm font-medium text-gray-500">Address</label>
//               <p className="text-gray-900 font-semibold">
//                 {studentData.address ? JSON.stringify(studentData.address) : "N/A"}
//               </p>
//             </div>
//           </div>
//         </section>

//         {/* Photo Section */}
//         <section className="mb-8">
//           <h2 className="text-xl font-semibold text-gray-700 mb-4 flex items-center">
//             <FaIdCard className="mr-2 text-blue-600" />
//             Student Photo
//           </h2>
//           <div className="flex justify-center">
//             <img
//               src={studentData.photo || "/default-avatar.png"}
//               alt="Student Photo"
//               className="w-48 h-48 rounded-full border-4 border-blue-100 shadow-md"
//             />
//           </div>
//         </section>
//       </div>
//     </div>
//   );
// };

// export default StudentDetailPage;

"use client";

import { useStudent } from "@/lib/api/studentService/students";
import { use } from "react";
import StudentProfile from '@/components/students/StudentDetails';

const StudentDetailPage = ({params}) => {
  const { studentId } = use(params);
  const {data: studentData, isLoading, error} = useStudent(studentId);
  return (
      <StudentProfile studentData={studentData} studentId={studentId} />
  )
}

export default StudentDetailPage;