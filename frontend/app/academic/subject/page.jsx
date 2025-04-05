"use client";

import SubjectList from "@/components/academic/SubjectList";
import AddSubject from "@/components/academic/AddSubject";
import AssignSubjects from "@/components/academic/AssignSubjects";
import Layout from "@/components/layout/Layout";
import { useState } from "react";
export const dynamic = "force-dynamic";

const SubjectPage = () => {
  const [subjectList, setSubjectList] = useState(true);
  const [assign, setAssign] = useState(false);

  return (
    <>
      {subjectList ? (
        <SubjectList
          setSubjectListClicked={setSubjectList}
          setAssign={setAssign}
        />
      ) : assign ? (
        <AssignSubjects
          setSubjectListClicked={setSubjectList}
          setAssign={setAssign}
        />
      ) : (
        <AddSubject
          setSubjectListClicked={setSubjectList}
          setAssign={setAssign}
        />
      )}
    </>
  );
};

export default SubjectPage;
