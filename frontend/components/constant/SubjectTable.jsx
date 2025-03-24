"use client"

import {useState} from 'react'
import { LuView } from "react-icons/lu";
import { MdDeleteForever } from "react-icons/md";

const SubjectTable = ({subjects}) => {
    console.log("Subjects on subject table", subjects);
    const [isDetails,setIsDetail]= useState(false);
    const [id,setId]=useState(null)
    
    const deleteSubject=async(Id)=>{
        console.log("subject id to be deleted ", Id);
        
    }

    const detailSubject= (Id)=>{
        console.log("id for detail is", Id);
        setId(Id);
        setIsDetail(true)
    }
    if (isDetails) {
        return(
            <div className='bg-gray-700 text-white' > yes this is that page for detailed subject with <span className='hover:cursor-pointer' onClick={()=> setIsDetail(false)}>id {id}</span></div>
        )
    }
  return (
    <div className="overflow-x-auto">
    <table className="min-w-full bg-white">
      <thead>
        <tr className="border-b">
          <th className="text-left py-3 px-4">#</th>
          <th className="text-left py-3 px-4">Subject Name</th>
          <th className="text-left py-3 px-4">Subject Code</th>
          <th className="text-left py-3 px-4">Credit Hour</th>
          <th className="text-left py-3 px-4">Status</th>
          <th className="text-left py-3 px-4">Actions</th>
        </tr>
      </thead>
      <tbody>
        {subjects.map((subject, index) => (
          <tr key={subject.subjectId} className="border-b hover:bg-gray-50  hover:cursor-pointer">
            <td className="py-3 px-4">{index + 1}</td>
            <td className="py-3 px-4">{subject.subjectName}</td>
            <td className="py-3 px-4">{subject.subjectCode}</td>
            <td className="py-3 px-4">{subject.creditHours}</td>
            <td className="py-3 px-4">
              <span className="px-2 py-1 rounded-full text-sm bg-green-100 text-green-600">
                Active
              </span>
            </td>
            <td className="py-3 px-4 flex gap-5">
                <LuView size={20} className='hover:text-green-600' onClick={()=>detailSubject(subject.subjectId)} />
                <MdDeleteForever size={20} className='hover:text-red-600' onClick={()=> deleteSubject(subject.subjectId)}/>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
  )
}

export default SubjectTable