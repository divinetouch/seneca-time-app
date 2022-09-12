import React from 'react'
import { IonModal, IonButton, IonHeader, IonToolbar } from '@ionic/react'

type propsType = {
  showModal: boolean
  onDismiss: Function
  cancel?: string
}

const CustomModal: React.FC<propsType> = ({
  onDismiss,
  showModal,
  children,
  cancel,
}) => {
  const handleDismiss = () => {
    onDismiss()
  }
  return (
    <>
      <IonModal onDidDismiss={handleDismiss} isOpen={showModal}>
        <IonHeader>
          <IonToolbar>
            <IonButton slot='end' color='danger' onClick={handleDismiss}>
              {cancel ? cancel : 'CANCEL'}
            </IonButton>
          </IonToolbar>
        </IonHeader>
        {children}
      </IonModal>
    </>
  )
}

export default CustomModal
