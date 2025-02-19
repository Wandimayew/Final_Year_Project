"use client"

import Layout from "@/components/layout/Layout"
import ClassList from "@/components/academic/ClassList"
import AddClass from "@/components/academic/AddClass"
import { useState } from "react"

const ClassPage = () => {
    const [classList,setClassList]= useState(true);

  return (
    <Layout >
        {
            classList ? <ClassList  classListClicked={classList} setClassListClicked={setClassList} /> : <AddClass setClassList={setClassList} classListClicked={classList}/>
        }
    </Layout>
  )
}

export default ClassPage