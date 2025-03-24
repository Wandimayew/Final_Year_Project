"use client";

// import ClassList from "@/components/academic/ClassList"
import ClassList from "@/components/academic/ClassList/ClassList";
import AddClass from "@/components/academic/AddClass";
import { useState } from "react";

const ClassPage = () => {
  const [classList, setClassList] = useState(true);

  return (
    <>
      {classList ? (
        <ClassList
          classListClicked={classList}
          setClassListClicked={setClassList}
        />
      ) : (
        <AddClass setClassList={setClassList} classListClicked={classList} />
      )}
    </>
  );
};

export default ClassPage;
