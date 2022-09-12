import React, { useContext, useState } from 'react'
import { Plugins } from '@capacitor/core'
import HeaderTemplate from '../../templates/HeaderTemplate'
import {
  IonContent,
  IonLoading,
  IonFab,
  IonFabButton,
  IonIcon,
} from '@ionic/react'
import AccountForm from '../../components/accountForm/AccountForm'
import {
  Context as AccountContext,
  AccountState,
} from '../../context/AccountContext'
import './SignUp.scss'
import CustomModal from '../../components/modal/CustomModal'
import { help } from 'ionicons/icons'
import Info from '../../components/information/Information'

const { LocalNotifications } = Plugins

type AccountContextType = {
  state: AccountState
  createAccount: (account: AccountState) => Promise<boolean>
}

const SignUp: React.FC = () => {
  const { createAccount } = useContext(AccountContext) as AccountContextType
  const [loading, setLoading] = useState(false)
  const [modalStatus, setModalStatus] = useState(false)

  const handleSubmit = async (account: AccountState) => {
    try {
      const permission = await LocalNotifications.requestPermission()
      if (permission.granted) {
        await LocalNotifications.schedule({
          notifications: [
            {
              title: 'Stoic Time',
              body: 'Thank You! Notification was set up!',
              id: Date.now(),
              schedule: { at: new Date(Date.now() + 1000) },
            },
          ],
        })
      }
    } catch (e) {
      console.log('device not supported notifications', e)
    } finally {
      await createAccount(account)
    }
  }

  const handleDismiss = () => {
    setLoading(false)
  }

  const handleDismissModal = () => {
    setModalStatus(false)
  }

  const openModal = () => {
    setModalStatus(true)
  }

  return (
    <HeaderTemplate headerTitle='Sign Up' showLeftIcon={false}>
      <IonContent>
        <AccountForm onSubmit={handleSubmit} buttonName='save' />
        <IonLoading
          onDidDismiss={handleDismiss}
          isOpen={loading}
          message='saving....'
          duration={1000}
        />
        <IonFab vertical='bottom' horizontal='start' slot='fixed'>
          <IonFabButton onClick={openModal}>
            <IonIcon icon={help} />
          </IonFabButton>
        </IonFab>
      </IonContent>
      <CustomModal
        cancel='DISMISS'
        onDismiss={handleDismissModal}
        showModal={modalStatus}
      >
        <Info />
      </CustomModal>
    </HeaderTemplate>
  )
}

export default SignUp
