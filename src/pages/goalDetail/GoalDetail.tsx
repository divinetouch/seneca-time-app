import React, { useContext, useState } from 'react'
import { IonContent, useIonViewWillEnter } from '@ionic/react'
import GoalForm from '../../components/goalForm/GoalForm'
import { Context as GoalContext, GoalState } from '../../context/GoalContext'
import { useParams, RouteComponentProps } from 'react-router-dom'
import HeaderTemplate from '../../templates/HeaderTemplate'
import {
  Context as SettingContext,
  SettingState,
} from '../../context/SettingContext'

type ParamType = {
  id: string
}

type contextType = {
  state: GoalState[]
  updateGoal: Function
  deleteGoal: (goal: GoalState) => void
  pushGoalNotification: (goal: GoalState) => Promise<boolean>
}

type SettingContextType = {
  state: SettingState
}

const GoalDetail: React.FC<RouteComponentProps> = ({ history }) => {
  const { state, updateGoal, deleteGoal, pushGoalNotification } = useContext(
    GoalContext
  ) as contextType

  const { state: settingState } = useContext(
    SettingContext
  ) as SettingContextType

  const [goal, setGoal] = useState<GoalState>()

  const param = useParams() as ParamType
  //const history = useHistory()

  const handleSubmit = async (goal: GoalState) => {
    const result = await updateGoal(goal)
    if (settingState.notification) {
      await pushGoalNotification(result)
    }
    history.goBack()
  }
  const handleDelete = (goal: GoalState) => {
    deleteGoal(goal)
    history.goBack()
  }

  useIonViewWillEnter(() => {
    const goal = state.find((g) => g.id === param.id) as GoalState
    setGoal(goal)
  }, [param.id])

  return (
    <HeaderTemplate headerTitle='Detail' showLeftIcon={true}>
      <IonContent className='ion-padding'>
        <GoalForm
          key={goal ? goal.id : ''}
          buttonName='update'
          onSubmit={handleSubmit}
          goal={goal}
          onDelete={handleDelete}
        />
      </IonContent>
    </HeaderTemplate>
  )
}

export default GoalDetail
