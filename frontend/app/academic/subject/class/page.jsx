"use client";


import { useState, useEffect } from "react";
import SubjectByClass from "@/components/academic/subject/SubjectByClass";
import axios from "axios";

const ClassSubjectPage = () => {
  const [subjectData, setSubjectData] = useState([]);
  const [contiue, setContinue] = useState(false);
  const [classId, setClassId] = useState(0);
  useEffect(() => {
    const fetchClass = async () => {
      const response = await axios.get(
        `http://localhost:8083/api/students?id=nsr/2506/13`
      );
      console.log("Responnse in class Subject page ", response.data[0].classId);
      setClassId(response.data[0].classId);
      setContinue(true);
    };

    fetchClass();
  }, []);

  useEffect(() => {
    if (contiue) {
        const fetchSubject = async () => {
            const response = await axios.get(
              `http://localhost:8084/academic/api/new/getAllSubjectByClass/${classId}`
            );
            setSubjectData(response.data);
          };
          fetchSubject();
    }
  }, [contiue,classId]);


  return (

      <SubjectByClass subjectData={subjectData} />
    
  );
};

export default ClassSubjectPage;
