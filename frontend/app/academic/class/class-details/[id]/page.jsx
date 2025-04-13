"use client";

import { useParams } from "next/navigation";
import ViewClass from "@/components/academic/ViewClass";
export const dynamic = "force-dynamic";

const ClassDetailsPage = () => {
  const params = useParams();
  const id = params.id;

  console.log("id for detaisl", id);

  return <ViewClass id={id} />;
};

export default ClassDetailsPage;
