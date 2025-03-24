"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addClassData } from "@/Redux/slices/ClassSlice";
import Link from "next/link";
import axios from "axios";
import { useRouter } from "next/navigation";

const AddClass = ({ setClassList, classListClicked }) => {
  const dispatch = useDispatch();
  const router=useRouter();

  const { loading, error } = useSelector((state) => state.class); // Get state from Redux

  const [formData, setFormData] = useState({
    className: "",
    academicYear: "",
    streamId: "",
  });

  const [streams, setStreams] = useState([]);
  const [successMessage, setSuccessMessage] = useState("");
  const [schoolId, setSchoolId] = useState("");

 // Fetch stream options
useEffect(() => {
  const fetchStreams = async () => {
    try {
      const response = await axios.get(
        `http://localhost:8084/academic/api/new/getAllStreamBySchool`
      );
      console.log("stream data: {", response.data, "}.");

      setStreams(response.data);
    } catch (error) {
      console.error("Failed to fetch streams:", error);
    }
  };

  fetchStreams();
}, [schoolId]);

  // Get schoolId from local storage
  useEffect(() => {
    const userData = localStorage.getItem("auth-store");
    if (userData) {
      try {
        const parsedData = JSON.parse(userData);
        setSchoolId(parsedData.user.schoolId);
      } catch (error) {
        console.error("Error parsing user data:", error);
      }
    }
  }, []);

  // Handle form field changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Handle form submission using Redux Toolkit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMessage(""); // Reset message before new submission

    try {
      const resultAction = await dispatch(addClassData(formData)).unwrap();
      console.log("Class added successfully:", resultAction);

      setSuccessMessage("Class added successfully!");
      setFormData({ className: "", academicYear: "", streamId: "" });

      // Introduce a short delay before updating class list
      setTimeout(()=> setClassList(true), 2000);
    } catch (err) {
      console.error("Error adding class:", err);
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow-md relative top-20">
      <h2 className="text-2xl font-bold mb-4">Add Class</h2>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      {successMessage && <p className="text-green-500 mb-4">{successMessage}</p>}

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-2" htmlFor="className">
            Class Name
          </label>
          <input
            type="text"
            id="className"
            name="className"
            value={formData.className}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring focus:ring-blue-300"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-2" htmlFor="academicYear">
            Academic Year
          </label>
          <input
            type="text"
            id="academicYear"
            name="academicYear"
            value={formData.academicYear}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring focus:ring-blue-300"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-2" htmlFor="streamId">
            Stream
          </label>
          <select
            id="streamId"
            name="streamId"
            value={formData.streamId}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring focus:ring-blue-300"
            required
          >
            <option value="">Select a Stream</option>
            {streams.map((stream) => (
              <option key={stream.streamId} value={stream.streamId}>
                {stream.streamName}
              </option>
            ))}
          </select>
        </div>

        <div className="flex w-full justify-between">
          {/* <Link href="/academic/class" className="bg-gray-300 text-black py-2 px-4 rounded-md hover:bg-gray-500 focus:outline-none focus:ring focus:ring-gray-300">
            Cancel
          </Link> */}
          <button onClick={()=> setClassList(true)} className="bg-gray-300 text-black py-2 px-4 rounded-md hover:bg-gray-500 focus:outline-none focus:ring focus:ring-gray-300">
            Cancel
          </button>
          <button
            type="submit"
            className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring focus:ring-blue-300"
            disabled={loading} // Disable button while loading
          >
            {loading ? "Adding..." : "Add Class"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddClass;


