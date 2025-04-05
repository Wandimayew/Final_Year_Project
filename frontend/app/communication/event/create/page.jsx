import React from 'react'
import CreateEventForm from '@/components/event/CreateEventForm'
export const dynamic = "force-dynamic";

const EventCreatePage = () => {
  return (
    <div className='relative top-20'>
        <CreateEventForm />
    </div>
  )
}

export default EventCreatePage