import React from "react";

const Loader = () => (
  <div className="flex justify-center items-center py-10">
    <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-blue-600 border-opacity-75" />
  </div>
);

export default Loader;
