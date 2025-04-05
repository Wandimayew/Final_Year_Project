import React from 'react'
import CommunicationPreference from '@/components/setting/communication/CommunicationPreference'
export const dynamic = "force-dynamic";

const PreferencePage = () => {
  return (
    <div className='relative top-20'>
        <CommunicationPreference />
    </div>
  )
}

export default PreferencePage