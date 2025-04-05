"use client"

import { Suspense, useState } from "react";
import AddClass from "@/components/academic/AddClass";
export const dynamic = "force-dynamic";

const AddClassPage = () => {
  const [classList, setClassList] = useState(false); // State for parent control

  return (
    <Suspense fallback={<div>Loading class form...</div>}>
      <AddClass setClassList={setClassList} classListClicked={false} />
    </Suspense>
  );
};

export default AddClassPage;
