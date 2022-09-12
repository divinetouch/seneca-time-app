import React, { useContext, useState, useEffect } from 'react'
import { useHistory } from 'react-router'
import { Plugins, AppState } from '@capacitor/core'
import HeaderTemplate from '../../templates/HeaderTemplate'
import {
  IonContent,
  IonItem,
  IonLabel,
  IonToggle,
  IonSelect,
  IonSelectOption,
  IonNote,
  useIonViewWillEnter,
} from '@ionic/react'

import {
  Context as SettingContext,
  SettingState,
} from '../../context/SettingContext'

import { Context as GoalContext, GoalState } from '../../context/GoalContext'

import './Setting.scss'

type SettingContextType = {
  state: SettingState
  updateSetting: (setting: SettingState) => Promise<void>
}

type GoalContextType = {
  state: GoalState[]
  updateAllNotifications: (goal: GoalState) => Promise<void>
}

const { LocalNotifications, Modals, App } = Plugins

const Setting: React.FC = () => {
  const history = useHistory()
  const handleAccountClick = () => {
    history.push('/account')
  }

  useIonViewWillEnter(() => {
    const enable = async () => {
      try {
        const result = await LocalNotifications.areEnabled()
        if (!result.value) {
          setShowNotificationMessage(true)
        } else {
          setShowNotificationMessage(false)
        }
      } catch (e) {
        console.log('error', e)
      }
    }
    enable()
  })

  useEffect(() => {
    App.addListener('appStateChange', async (state: AppState) => {
      if (state.isActive) {
        try {
          const result = await LocalNotifications.areEnabled()
          if (!result.value) {
            setShowNotificationMessage(true)
          } else {
            setShowNotificationMessage(false)
          }
        } catch (e) {
          console.log('error', e)
        }
      }
    })
  }, [])

  const { state, updateSetting } = useContext(
    SettingContext
  ) as SettingContextType

  const { updateAllNotifications } = useContext(GoalContext) as GoalContextType

  const [notification, setNotification] = useState(state.notification)
  const [showNotoficationMessage, setShowNotificationMessage] = useState(false)

  const handleStatusChange = async (event: CustomEvent) => {
    if (event.detail!.value === 'daily') {
      updateSetting({
        ...state,
        showDailyCountDown: event.detail!.checked,
      })
    } else if (event.detail!.value === 'life') {
      updateSetting({
        ...state,
        showLifeExpectency: event.detail!.checked,
      })
    } else if (event.detail!.value === 'notification') {
      try {
        const result = await LocalNotifications.areEnabled()
        if (result.value === false && event.detail!.checked) {
          await Modals.alert({
            title: 'Enable Notification',
            message:
              'Please turn on notification in your phone setting in order to use the nofifcation feature',
          })
          setNotification(event.detail!.checked)
          await updateSetting({
            ...state,
            notification: event.detail!.checked,
          })
        } else if (result.value) {
          setNotification(event.detail!.checked)
          await updateSetting({
            ...state,
            notification: event.detail!.checked,
          })
        }
      } catch (e) {
        if (event.detail!.checked) {
          await Modals.alert({
            title: 'enable notification',
            message: 'Please turn on notification in your phone setting first',
          })
        } else {
          setNotification(event.detail!.checked)
          updateSetting({
            ...state,
            notification: event.detail!.checked,
          })
        }
      } finally {
        // regardless -> always update all the notifications
        updateAllNotifications(event.detail!.checked)
      }
    }
  }

  const handleInputChange = (event: CustomEvent) => {
    updateSetting({ ...state, quoteUpdateFrequency: +event.detail!.value })
  }

  return (
    <HeaderTemplate
      headerTitle='Setting'
      showLeftIcon={false}
      showRightIcon={true}
      handleRightIconClick={handleAccountClick}
    >
      <IonContent className='ion-padding setting-form'>
        <IonItem>
          <IonLabel position='stacked'>
            Show Daily Life Expectency on Home Page
          </IonLabel>
          <IonToggle
            checked={state.showLifeExpectency}
            color='success'
            onIonChange={handleStatusChange}
            name='life'
            value='life'
          />
        </IonItem>
        <IonItem lines='inset'>
          <IonLabel position='stacked'>Allow Notifications</IonLabel>
          <IonToggle
            checked={notification && !showNotoficationMessage}
            color='success'
            onIonChange={handleStatusChange}
            name='notification'
            value='notification'
          />
          {showNotoficationMessage && (
            <IonNote
              color='primary'
              style={{ paddingBottom: 5, fontStyle: 'italic' }}
            >
              Please turn on notification in your phone setting first
            </IonNote>
          )}
        </IonItem>
        <IonItem>
          <IonLabel position='stacked'>
            How often should a quote be updated
          </IonLabel>
          <IonSelect
            name='frequency'
            onIonChange={handleInputChange}
            value={state.quoteUpdateFrequency}
          >
            <IonSelectOption value={10}>every 10 minutes</IonSelectOption>
            <IonSelectOption value={5}>every 5 minutes</IonSelectOption>
            <IonSelectOption value={1}>every 1 minutes</IonSelectOption>
          </IonSelect>
        </IonItem>
      </IonContent>
    </HeaderTemplate>
  )
}

export default Setting
