import React from 'react'
import { IonPopover } from '@ionic/react'
import './CustomPopup.scss'

type propsType = {
  showPopover: boolean
}

const CustomPopup: React.FC<propsType> = ({ showPopover, children }) => {
  return <IonPopover isOpen={showPopover}>{children}</IonPopover>
}

export default CustomPopup
