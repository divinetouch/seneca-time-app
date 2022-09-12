import React, { useContext, useState } from 'react'
import HeaderTemplate from '../../templates/HeaderTemplate'
import {
  IonFab,
  IonFabButton,
  IonIcon,
  IonList,
  IonItem,
  IonLabel,
  IonContent,
  IonListHeader,
  IonCard,
  IonCardContent,
  useIonViewDidEnter,
} from '@ionic/react'
import { add } from 'ionicons/icons'
import './GoalList.scss'
import {
  Context as GoalContext,
  GoalState,
  Repeat,
} from '../../context/GoalContext'
import { useHistory } from 'react-router-dom'

type contextType = {
  state: GoalState[]
}

const GoalList: React.FC = () => {
  const { state } = useContext(GoalContext) as contextType
  const [list, setList] = useState<JSX.Element[]>([])
  const history = useHistory()

  const renderListItem = (repeatType: string) => {
    return state.map((data) => {
      if (data.repeat === repeatType) {
        return (
          <IonItem
            className='ion-margin-top'
            key={data.id}
            routerLink={`goals/${data.id}`}
          >
            <IonLabel>
              <h2>{data.title}</h2>
              <p>{data.description}</p>
            </IonLabel>
          </IonItem>
        )
      } else {
        return null
      }
    })
  }

  const generateSectionList = () => {
    const tempList: JSX.Element[] = []
    for (let repeat in Repeat) {
      if (repeat !== Repeat.Long_Term) {
        tempList.push(
          <IonList key={repeat}>
            <IonListHeader color='secondary'>
              <IonLabel>{repeat}</IonLabel>
            </IonListHeader>
            {renderListItem(repeat)}
            <div style={{ minHeight: 5, width: '100%' }} />
          </IonList>
        )
      } else {
        tempList.push(
          <IonList key={repeat}>
            <IonListHeader color='secondary'>
              <IonLabel>Long Term</IonLabel>
            </IonListHeader>
            {renderListItem(repeat)}
            <div style={{ minHeight: 5, width: '100%' }} />
          </IonList>
        )
      }
    }
    setList(tempList)
  }

  useIonViewDidEnter(() => {
    generateSectionList()
  }, [state])

  const handleAccountClick = () => {
    history.push('/account')
  }

  return (
    <HeaderTemplate
      headerTitle='Reminders'
      showLeftIcon={true}
      showRightIcon={true}
      handleRightIconClick={handleAccountClick}
    >
      <IonContent scrollEvents={true} scrollY={true}>
        {state.length === 0 ? (
          <div className='empty_list'>
            <IonCard>
              <IonCardContent>
                Click the add button below to add long term and repeated goal
                (daily, weekly, monthly, and yearly).
              </IonCardContent>
            </IonCard>
          </div>
        ) : (
          list
        )}
        <IonFab vertical='bottom' horizontal='end' slot='fixed'>
          <IonFabButton routerLink='/create'>
            <IonIcon icon={add} />
          </IonFabButton>
        </IonFab>
      </IonContent>
    </HeaderTemplate>
  )
}

export default React.memo(GoalList)
