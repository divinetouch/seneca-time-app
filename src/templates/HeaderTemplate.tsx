import React from 'react'
import {
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonButtons,
  IonBackButton,
  IonIcon,
  IonButton,
} from '@ionic/react'
import './HeaderTemplate.scss'
import { person } from 'ionicons/icons'

interface TemplateInterface {
  headerTitle: string
  showLeftIcon: boolean
  showRightIcon?: boolean
  handleRightIconClick?: () => void
}

const HeaderTemplate: React.FC<TemplateInterface> = ({
  children,
  headerTitle,
  showLeftIcon,
  showRightIcon = false,
  handleRightIconClick,
}) => {
  return (
    <IonPage>
      <IonHeader className='header'>
        <IonToolbar color='primary'>
          {showLeftIcon ? (
            <IonButtons slot='start'>
              <IonBackButton />
            </IonButtons>
          ) : null}
          <IonTitle>{headerTitle}</IonTitle>
          {showRightIcon && (
            <IonButton slot='end' onClick={handleRightIconClick}>
              <IonIcon slot='icon-only' icon={person} />
            </IonButton>
          )}
        </IonToolbar>
      </IonHeader>
      <>{children}</>
    </IonPage>
  )
}

export default HeaderTemplate
