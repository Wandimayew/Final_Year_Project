import React from 'react'
import EventListDisplay from '@/components/event/EventListDisplay'
export const dynamic = "force-dynamic";

const EventPage = () => {
  return (
    <div className='relative top-20'>
      <EventListDisplay />
    </div>
  )
}

export default EventPage