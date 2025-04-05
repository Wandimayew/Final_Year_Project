"use client";

import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useRouter } from "next/navigation";

// Force dynamic rendering
export const dynamic = 'force-dynamic';

const fetchStreams = async (schoolId) => {
  if (!schoolId) return []; // Avoid fetch if no schoolId
  const response = await axios.get(
    `http://localhost:8086/academic/api/new/getAllStreamBySchool`
  );
  return response.data;
};

const addClass = async (classData) => {
  const response = await axios.post(
    `http://localhost:8086/academic/api/new/add-class`, // Adjust endpoint as needed
    classData
  );
  return response.data;
};

const AddClass = ({ setClassList, classListClicked }) => {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    className: "",
    academicYear: "",
    streamId: "",
  });
  const [successMessage, setSuccessMessage] = useState("");
  const [schoolId, setSchoolId] = useState("");

  // Fetch schoolId from localStorage
  useEffect(() => {
    const userData = localStorage.getItem("auth-store");
    if (userData) {
      try {
        const parsedData = JSON.parse(userData);
        setSchoolId(parsedData.user?.schoolId || "");
      } catch (error) {
        console.error("Error parsing user data:", error);
      }
    }
  }, []);

  // Fetch streams using useQuery
  const {
    data: streams = [],
    isLoading: streamsLoading,
    error: streamsError,
  } = useQuery({
    queryKey: ["streams", schoolId],
    queryFn: () => fetchStreams(schoolId),
    enabled: !!schoolId, // Only fetch when schoolId is available
  });

  // Mutation for adding a class
  const mutation = useMutation({
    mutationFn: addClass,
    onSuccess: (data) => {
      setSuccessMessage("Class added successfully!");
      setFormData({ className: "", academicYear: "", streamId: "" });
      queryClient.invalidateQueries(["classes"]); // Invalidate class list if you fetch it elsewhere
      setTimeout(() => setClassList(true), 2000);
    },
    onError: (error) => {
      console.error("Error adding class:", error);
    },
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSuccessMessage("");
    mutation.mutate(formData);
  };

  return (
    <div className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow-md relative top-20">
      <h2 className="text-2xl font-bold mb-4">Add Class</h2>
      {streamsError && (
        <p className="text-red-500 mb-4">Failed to load streams</p>
      )}
      {mutation.isError && (
        <p className="text-red-500 mb-4">Error adding class</p>
      )}
      {successMessage && (
        <p className="text-green-500 mb-4">{successMessage}</p>
      )}

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label
            className="block text-gray-700 font-medium mb-2"
            htmlFor="className"
          >
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
          <label
            className="block text-gray-700 font-medium mb-2"
            htmlFor="academicYear"
          >
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
          <label
            className="block text-gray-700 font-medium mb-2"
            htmlFor="streamId"
          >
            Stream
          </label>
          <select
            id="streamId"
            name="streamId"
            value={formData.streamId}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring focus:ring-blue-300"
            required
            disabled={streamsLoading}
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
          <button
            onClick={() => setClassList(true)}
            type="button" // Prevent form submission
            className="bg-gray-300 text-black py-2 px-4 rounded-md hover:bg-gray-500 focus:outline-none focus:ring focus:ring-gray-300"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring focus:ring-blue-300"
            disabled={mutation.isPending || streamsLoading}
          >
            {mutation.isPending ? "Adding..." : "Add Class"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddClass;
