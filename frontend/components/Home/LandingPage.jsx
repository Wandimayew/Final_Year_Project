// "use client";

// import React, { useState, useEffect } from "react";
// import Login from "./Login"; // Assuming Login is in the same directory
// import schoolLogo from "@/public/schoolLogo.svg";
// import Image from "next/image";
// import Link from "next/link";

// const LandingPage = () => {
//   const [isClient, setIsClient] = useState(false);
//   const [backgroundImage, setBackgroundImage] = useState(0);

//   const backgroundImages = [
//     "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3",
//     "https://images.unsplash.com/photo-1509062522246-3755977927d7?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3",
//     "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3",
//     "https://images.unsplash.com/photo-1558591710-4b4a1ae0f581?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3",
//   ];

//   useEffect(() => {
//     setIsClient(true); // Set to true on client-side mount
//     const interval = setInterval(() => {
//       setBackgroundImage((prev) => (prev + 1) % backgroundImages.length); // Increment by 1, not 2
//     }, 3000);
//     return () => clearInterval(interval); // Cleanup interval on unmount
//   }, []); // Empty dependency array since backgroundImages is static

//   return (
//     <div className="w-full min-h-screen flex items-center justify-center overflow-y-auto">
//       {/* Dynamic Background Images */}
//       <div
//         className="fixed inset-0 z-0 transition-opacity duration-1000 ease-in-out"
//         style={{
//           backgroundImage: `url(${backgroundImages[backgroundImage]})`,
//           backgroundSize: "cover",
//           backgroundPosition: "center",
//           backgroundRepeat: "no-repeat",
//           backgroundAttachment: "fixed",
//         }}
//       />

//       {/* Centered Rectangular Grid Box */}
//       <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-0 max-w-4xl w-full mx-auto my-12 bg-white text-black rounded-2xl shadow-2xl overflow-hidden">
//         {/* Welcome Section (Left, Gradient Background) with Clip Path */}
//         <div
//           className="p-8 bg-gradient-to-r from-[#FF1744] via-[#D81B60] to-[#8E24AA] text-white flex flex-col items-center justify-center h-full text-center"
//           style={{
//             clipPath: "polygon(0 0, 80% 0, 100% 50%, 80% 100%, 0 100%)",
//           }}
//         >
//           <h1 className="text-3xl font-extrabold mb-6">
//             Welcome to <span className="text-yellow-300">SaaS School Management System</span>
//           </h1>
//           <p className="text-lg max-w-md leading-relaxed mb-6">Wolkite University, Ethiopia</p>
//           <div className="flex justify-center md:justify-start gap-4">
//             <Link href="https://www.facebook.com" target="_blank" className="text-blue-200 hover:text-blue-100 transition-colors">
//               <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
//                 <path d="M22.675 0H1.325C.593 0 0 .593 0 1.325v21.351C0 23.407.593 24 1.325 24h11.494v-9.294H9.598v-3.626h3.221V8.413c0-3.184 1.944-4.917 4.781-4.917 1.359 0 2.525.102 2.867.147v3.326l-1.97.001c-1.544 0-1.843.735-1.843 1.812v2.369h3.677l-.478 3.626h-3.199V24h6.274c.732 0 1.325-.593 1.325-1.325V1.325C24 .593 23.407 0 22.675 0z" />
//               </svg>
//             </Link>
//             <Link href="https://www.twitter.com" target="_blank" className="text-blue-200 hover:text-blue-100 transition-colors">
//               <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
//                 <path d="M23.954 4.569c-.885.389-1.83.654-2.825.775 1.014-.611 1.794-1.574 2.163-2.723-.951.555-2.005.959-3.127 1.184-.896-.959-2.173-1.559-3.591-1.559-2.717 0-4.92 2.203-4.92 4.917 0 .385.045.762.127 1.124C7.691 8.094 4.066 6.13 1.64 3.161c-.427.722-.666 1.554-.666 2.475 0 1.71.87 3.213 2.188 4.096-.807-.026-1.566-.248-2.228-.616v.062c0 2.385 1.693 4.374 3.946 4.827-.413.111-.849.171-1.296.171-.314 0-.615-.03-.916-.086.631 1.953 2.445 3.377 4.604 3.417-1.68 1.319-3.809 2.105-6.102 2.105-.396 0-.788-.023-1.17-.068 2.216 1.42 4.861 2.25 7.698 2.25 9.224 0 14.27-7.663 14.27-14.27 0-.217-.005-.434-.014-.649.979-.708 1.83-1.593 2.496-2.604z" />
//               </svg>
//             </Link>
//             <Link href="https://www.linkedin.com" target="_blank" className="text-blue-200 hover:text-blue-100 transition-colors">
//               <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
//                 <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-1.366-.026-3.122-1.902-3.122-1.904 0-2.198 1.485-2.198 3.022v5.704h-3v-11h3v1.602c.504-.858 1.83-1.602 3.214-1.602 3.444 0 4.082 2.269 4.082 5.212v5.786z" />
//               </svg>
//             </Link>
//             <Link href="https://www.youtube.com" target="_blank" className="text-blue-200 hover:text-blue-100 transition-colors">
//               <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
//                 <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.377.505 9.377.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
//               </svg>
//             </Link>
//           </div>
//         </div>

//         {/* Login Section (Right, Black Background) */}
//         <div className="p-8 bg-black flex flex-col items-center">
//         {isClient && <Login />}
//           <p className="text-center text-gray-500 mt-6 text-xs">
//             © {new Date().getFullYear()} School Management System
//           </p>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default LandingPage;