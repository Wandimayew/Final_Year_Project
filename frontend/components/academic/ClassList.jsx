"use client";

import axios from "axios";
import { useState, useEffect, use, useReducer } from "react";
import Link from "next/link";
import ViewClass from "./ViewClass";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";

const ClassList = ({ classListClicked, setClassListClicked }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [classes, setClasses] = useState([]);
  const [school, setSchool] = useState("");
  const [selectedClassId, setSelectedClassId] = useState(null); // Track selected class
  const [classDetails, setSelectedClassDetails] = useState([]);
  const [id, setId] = useState(null);
  const router=useRouter();

  const getClassList = async () => {
    try {
      console.log("school id is before sending the request [", school, "].");

      const response = await axios.get(
        `http://localhost:8084/academic/api/new/getAllClassBySchool`
      );
      console.log("Class Resposes : ", response.data);
      setClasses(response.data);
    } catch (error) {
      console.error("Error during submission:", error); // Log the full error
      toast.error(`Network error: ${error.message}`);
    }
  };
  useEffect(() => {
    console.log(
      "school id inside use effect before the request [",
      school,
      "]."
    );
    getClassList();
  }, [school]);
  useEffect(() => {
    const userData = localStorage.getItem("auth-store");
    if (userData) {
      try {
        // Parse the JSON data
        const parsedData = JSON.parse(userData);
        setSchool(parsedData.user.schoolId);
        console.log("parsed :", parsedData);
        console.log("users :", parsedData.user);

        // setToken(parsedData.token);
      } catch (error) {
        console.error("Error parsing user data:", error);
      }
    }
  }, []);

  const addClass = () => {
    setClassListClicked(false);
  };
  const handleClassView = async (id) => {
    console.log("view is clicked for id ::", id);
    setSelectedClassId(id); // Set the selected class ID
    try {
      const response = await axios.get(
        `http://localhost:8084/academic/api/new/getClassById/${id}`
      );
      console.log("Fetched Class Details: ", response.data);

      setSelectedClassDetails(response.data); // Save fetched details to state
      setSelectedClassId(id); // Navigate to the ViewClass component
      setId(id);
    } catch (error) {
      console.error("Error fetching class details:", error);
      toast.error("Failed to load class details. Please try again.");
    }
  };
  if (selectedClassId) {
    return (
      <ViewClass
        id={selectedClassId}
        setSelectedClassId={setSelectedClassId}
        classDetails={classDetails}
        setClassDetails={setSelectedClassDetails}
      />
    );
  }
  return (
    <div className="relative top-20 ">
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2 text-gray-600">
            <Link href="/">Home</Link>
            <span>-</span>
            <Link href="/class">Class</Link>
            <span>-</span>
            <span>Class List</span>
          </div>
          {/* <button
            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
            onClick={() => addClass()}
          >
            + Add Class
          </button> */}
          <Link
            href={`/academic/class/add-class`}
            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
          >
            + Add Class
          </Link>
        </div>

        <div className="flex justify-between items-center">
          <div className="relative">
            <input
              type="text"
              placeholder="Search Class"
              className="pl-10 pr-4 py-2 border rounded-md w-[300px]"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <svg
              className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <button className="flex items-center gap-2 text-blue-500 hover:text-blue-600">
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
              />
            </svg>
            Export
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white">
          <thead>
            <tr className="border-b">
              <th className="text-left py-3 px-4">#</th>
              <th className="text-left py-3 px-4">Name</th>
              <th className="text-left py-3 px-4">Academic Year</th>
              <th className="text-left py-3 px-4">Stream</th>
              {/* <th className="text-left py-3 px-4">Phone</th>
            <th className="text-left py-3 px-4">Info</th> */}
              <th className="text-left py-3 px-4">Status</th>
              <th className="text-left py-3 px-4">Action</th>
            </tr>
          </thead>
          <tbody>
            {classes.map((clas) => (
              <tr
                key={clas.classId}
                className="border-b hover:bg-gray-50"
                onClick={()=> router.push(`/academic/class/class-details/${clas.classId}`)}
              >
                <td className="py-3 px-4">{clas.classId}</td>
                <td className="py-3 px-4">{clas.className}</td>
                <td className="py-3 px-4">{clas.academicYear}</td>
                <td className="py-3 px-4">
                  {" "}
                  {clas.stream.map((streams) => (
                    <ul key={streams.streamId}>
                      {streams.streamName}
                      {/* {streams.active ? "Active" : "Inactive"} */}
                    </ul>
                  ))}
                </td>
                <td className="py-3 px-4">
                  <span className="px-2 py-1 rounded-full text-sm bg-green-100 text-green-600">
                    Active
                  </span>
                </td>
                <td className="py-3 px-4">
                  <button className="text-gray-600 hover:text-gray-800">
                    Actions ▼
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ClassList;
