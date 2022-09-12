import React, { useContext, useState, useEffect } from 'react'
import { useHistory } from 'react-router-dom'
import { Plugins, AppState } from '@capacitor/core'
import {
  IonContent,
  useIonViewWillEnter,
  IonCard,
  IonCardContent,
  IonActionSheet,
} from '@ionic/react'
import HeaderTemplate from '../../templates/HeaderTemplate'
import './Focus.scss'
import CountDownComponent from '../../components/countdown/CountDown'
import {
  Context as GoalContext,
  GoalState,
  Repeat,
  GoalStatus,
} from '../../context/GoalContext'
import CustomModal from '../../components/modal/CustomModal'
import GoalConfig from '../goalConfig/GoalConfig'
import { Status } from '../../context/FocusContext'
import moment from 'moment'
import { checkmark, close } from 'ionicons/icons'

const { App } = Plugins

type GoalContextType = {
  state: GoalState[]
  updateGoal: (goal: GoalState) => Promise<void>
}

const Focus: React.FC = () => {
  const { state, updateGoal } = useContext(GoalContext) as GoalContextType
  const [goalToConfig, setGoalToConfig] = useState<GoalState>()
  const [modalStatus, setModalStatus] = useState(false)
  const [goalList, setGoalList] = useState<(JSX.Element | null)[]>([])
  const [showActionSheet, setShowActionSheet] = useState(false)

  const handleConfigClick = (goal: GoalState) => {
    setGoalToConfig({ ...goal })
    setModalStatus(!modalStatus)
  }

  const history = useHistory()

  const renderGoalFocus = () => {
    const now = new Date()
    setGoalList(
      state.map((goal) => {
        if (
          goal.config.status === Status.Show &&
          goal.repeat === Repeat.Long_Term &&
          goal.status !== GoalStatus.Complete &&
          moment(goal.end).isAfter(moment(now))
        ) {
          return (
            <CountDownComponent
              updateActionSheetStatus={handleUpdateStatus}
              onConfigClick={handleConfigClick}
              key={goal.id}
              goal={goal}
              className='long-term'
            />
          )
        } else {
          return null
        }
      })
    )
  }

  const handleDismiss = () => {
    setModalStatus(false)
  }

  const handleUpdateConfig = (goal: GoalState) => {
    updateGoal(goal)
    setModalStatus(false)
  }
  useEffect(() => {
    renderGoalFocus()
  }, [state])

  useIonViewWillEnter(() => {
    renderGoalFocus()
  }, [state])

  useEffect(() => {
    App.addListener('appStateChange', (state: AppState) => {
      if (state.isActive) {
        console.log('app is active => refesh the state')
        renderGoalFocus()
      }
    })
  }, [])

  const hasLongTermGoal = () => {
    return state.find((goal) => goal.repeat === Repeat.Long_Term)
  }

  const handleAccountClick = () => {
    history.push('/account')
  }

  const handleUpdateStatus = (goal: GoalState) => {
    setGoalToConfig(goal)
    setShowActionSheet(true)
  }

  const handleActionSheetDismiss = () => {
    setShowActionSheet(false)
  }

  return (
    <>
      <HeaderTemplate
        headerTitle='Long Term'
        showLeftIcon={true}
        showRightIcon={true}
        handleRightIconClick={handleAccountClick}
      >
        {hasLongTermGoal() === undefined ? (
          <div className='empty_list'>
            <IonCard>
              <IonCardContent>
                Please create a long term goal and turn on{' '}
                <i>"show on long term page"</i> to have them showing up here.
              </IonCardContent>
            </IonCard>
          </div>
        ) : (
          <IonContent>{goalList}</IonContent>
        )}
      </HeaderTemplate>
      <IonActionSheet
        isOpen={showActionSheet}
        onDidDismiss={handleActionSheetDismiss}
        buttons={[
          {
            text: 'Complete',
            role: 'destructive',
            icon: checkmark,
            handler: async () => {
              await updateGoal({
                ...goalToConfig!,
                status: GoalStatus.Complete,
              })
            },
          },
          {
            text: 'Cancel',
            icon: close,
            role: 'cancel',
            handler: handleActionSheetDismiss,
          },
        ]}
      />
      <CustomModal onDismiss={handleDismiss} showModal={modalStatus}>
        <GoalConfig goal={goalToConfig!} onSubmit={handleUpdateConfig} />
      </CustomModal>
    </>
  )
}

export default Focus
