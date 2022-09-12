import React, { useContext } from 'react'
import HeaderTemplate from '../../templates/HeaderTemplate'
import { IonList, IonItem, IonLabel, IonContent, IonToggle } from '@ionic/react'
import './AddFocus.scss'
import { Context as GoalContext, GoalState } from '../../context/GoalContext'
import { Status } from '../../context/FocusContext'

type GoalContextType = {
  state: GoalState[]
  updateGoal: Function
}

const AddFocus: React.FC = () => {
  const { state: goalState, updateGoal } = useContext(
    GoalContext
  ) as GoalContextType

  const handleStatusChange = (event: React.FormEvent) => {
    const on = event.currentTarget.getAttribute('aria-checked')
    const id = event.currentTarget.getAttribute('name')
    const goal = goalState.find((g) => g.id === id)

    updateGoal({
      ...goal,
      config: {
        ...goal!.config,
        status: on === 'false' ? Status.Show : Status.Hide,
      },
    })
  }

  const renderListItem = () => {
    return goalState.map((data) => {
      return (
        <IonItem className='ion-margin-top' key={data.id}>
          <IonLabel>
            <h2>{data.title}</h2>
          </IonLabel>
          <IonToggle
            checked={data.config!.status === Status.Show}
            color='success'
            onClick={handleStatusChange}
            value={data.id}
            name={data.id}
          />
        </IonItem>
      )
    })
  }
  return (
    <HeaderTemplate headerTitle='Focus List' showLeftIcon={true}>
      <IonContent className='focus-list'>
        <IonList class='ion-left-padding'>{renderListItem()}</IonList>
      </IonContent>
    </HeaderTemplate>
  )
}

export default React.memo(AddFocus)
