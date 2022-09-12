import React, { useContext } from 'react'
import { useHistory } from 'react-router-dom'
import './GoalCreate.css'
import GoalForm from '../../components/goalForm/GoalForm'
import { Context as GoalContext, GoalState } from '../../context/GoalContext'
import {
  Context as SettingContext,
  SettingState,
} from '../../context/SettingContext'
import HeaderTemplate from '../../templates/HeaderTemplate'
import { IonContent } from '@ionic/react'

type contextType = {
  goal: GoalState
  state: GoalState[]
  addGoal: (goal: GoalState) => Promise<GoalState>
  pushGoalNotification: (goal: GoalState) => Promise<boolean>
}

type SettingContextType = {
  state: SettingState
}

const GoalCreate: React.FC = () => {
  const { addGoal, pushGoalNotification } = useContext(
    GoalContext
  ) as contextType
  const { state: settingState } = useContext(
    SettingContext
  ) as SettingContextType
  const history = useHistory()
  const handleSubmit = async (goal: GoalState) => {
    const result = (await addGoal(goal)) as GoalState
    if (settingState.notification) {
      await pushGoalNotification(result)
    }
    history.goBack()
  }

  return (
    <HeaderTemplate headerTitle='Create' showLeftIcon={true}>
      <IonContent>
        <GoalForm buttonName='save' onSubmit={handleSubmit} />
      </IonContent>
    </HeaderTemplate>
  )
}

export default React.memo(GoalCreate)
