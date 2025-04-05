import React from 'react'
import SubjectTable from '@/components/constant/SubjectTable'

const SubjectByClass = ({ subjectData = [] }) => {
    console.log("Subjects in subject by class ", subjectData);
    
  return (
    <div className='relative top-20'>
        <SubjectTable subjects={subjectData} />
    </div>
  )
}

export default SubjectByClass