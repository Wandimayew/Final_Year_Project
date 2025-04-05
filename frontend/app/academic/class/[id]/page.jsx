"use client"

import { useParams } from "next/navigation"
export const dynamic = "force-dynamic";

const EditClassPage = () => {
  const params = useParams(); // Retrieve parameters
  const id = params.id; // Access the 'id' parameter
  console.log("iddddddd",id);
  
  return (
    <div>EditClassPage for id {id}</div>
  )
}

export default EditClassPage