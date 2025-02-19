"use client"

import Layout from "@/components/layout/Layout"
import { useParams } from "next/navigation"
import ViewClass from "@/components/academic/ViewClass"

const ClassDetailsPage = () => {
  const params=useParams();
  const id=params.id;

  console.log("id for detaisl",id);
  
  return (
    <Layout>
        <ViewClass  id={id}/>
    </Layout>
  )
}

export default ClassDetailsPage