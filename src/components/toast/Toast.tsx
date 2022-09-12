import React, { useState, useEffect } from 'react'
import { IonToast } from '@ionic/react'

type PropsType = {
  toast: { status: boolean; message: string; color: string }
  dismissed: Function
  position: 'top' | 'bottom' | 'middle'
}

export enum Colors {
  success = 'success',
  danger = 'danger',
  primary = 'primary',
  warning = 'warning',
}

const Toast: React.FC<PropsType> = ({ toast, dismissed, position }) => {
  const [isOpen, setIsOpen] = useState(toast.status)

  useEffect(() => {
    setIsOpen(toast.status)
  }, [toast])

  const handleDismiss = () => {
    setIsOpen(false)
    console.log('Dismissed')
    dismissed()
  }
  return (
    <IonToast
      onDidDismiss={handleDismiss}
      isOpen={isOpen}
      message={toast.message}
      position={position}
      duration={500}
      color={toast.color}
    />
  )
}

export default Toast
