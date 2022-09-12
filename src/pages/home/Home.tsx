import React, { useState, useContext } from 'react'
import { useHistory } from 'react-router-dom'
import HeaderTemplate from '../../templates/HeaderTemplate'
import './Home.scss'
import { Context as HomeContext, HomeState } from '../../context/HomeContext'
import {
  Context as SettingContext,
  SettingState,
} from '../../context/SettingContext'
import moment from 'moment'
import { GoalState } from '../../context/GoalContext'
import {
  IonContent,
  IonCard,
  IonCardContent,
  IonFabButton,
  IonFab,
  IonIcon,
  useIonViewDidEnter,
  useIonViewWillEnter,
} from '@ionic/react'
import CountDown from '../../components/countdown/CountDown'
import CustomModal from '../../components/modal/CustomModal'
import GoalConfig from '../goalConfig/GoalConfig'
import {
  AccountState,
  Context as AccountContext,
} from '../../context/AccountContext'
import { informationCircleOutline } from 'ionicons/icons'

type HomeContextType = {
  state: HomeState
  updateQuote: () => Promise<void>
  updateLife: (life: GoalState) => Promise<void>
}

type AccountContextType = {
  state: AccountState
}

type SettingContextType = {
  state: SettingState
}

const getLifeStartEnd = (date: string, lifeExpectency: number) => {
  if (date) {
    const startDob = moment(date).toString()
    const endDob = moment(date).add(lifeExpectency, 'year').toString()

    return { startDob, endDob }
  }
  return {}
}

const Home: React.FC = () => {
  const { state: accountState } = useContext(
    AccountContext
  ) as AccountContextType

  const { state: homeState, updateQuote, updateLife } = useContext(
    HomeContext
  ) as HomeContextType
  const { state: settingState } = useContext(
    SettingContext
  ) as SettingContextType

  const [modalStatus, setModalStatus] = useState(false)
  const [
    isMoreThanTwoYearsExpectency,
    setIsMoreThanTwoYearsExpectency,
  ] = useState(false)
  const history = useHistory()

  const [life, setLife] = useState(homeState.life)

  useIonViewWillEnter(() => {
    const { startDob, endDob } = getLifeStartEnd(
      accountState.dob,
      accountState.lifeExpectency
    )

    const load = async () => {
      if (startDob && endDob) {
        setLife({ ...homeState.life, start: startDob, end: endDob })
        detectIsMoreThanTwoYearsExpectency(endDob)
        await updateLife({ ...homeState.life, start: startDob, end: endDob })
      }
    }

    load()
  }, [accountState, homeState, updateQuote])

  /**
   * Detect whether a user age is actually less than 12 months older than the life expectency
   * If it's the case then just hide the life expectency countdown
   */
  const detectIsMoreThanTwoYearsExpectency = (endDate: string = '') => {
    const now = moment()
    const end = moment(new Date(endDate))
    if (
      Math.abs(moment.duration(end.diff(now)).asYears()) < 2 ||
      end.isBefore(now)
    ) {
      setIsMoreThanTwoYearsExpectency(false)
    } else {
      setIsMoreThanTwoYearsExpectency(true)
    }
  }

  // update quote every ten minutes && when setting was changed
  useIonViewDidEnter(() => {
    const interval = setInterval(() => {
      console.log('quote update')
      updateQuote()
    }, settingState.quoteUpdateFrequency * 60000)

    return () => {
      clearInterval(interval)
    }
  }, [settingState])

  const handleLifeConfigClick = () => {
    setModalStatus(!modalStatus)
  }

  const handleDismiss = () => {
    setModalStatus(false)
  }

  const handleUpdateConfig = (goal: GoalState) => {
    updateLife(goal)
    setModalStatus(false)
  }

  const handleAccountClick = () => {
    history.push('/account')
  }

  if (!homeState.life) return null

  return (
    <>
      <HeaderTemplate
        headerTitle='mortal being'
        showLeftIcon={true}
        showRightIcon={true}
        handleRightIconClick={handleAccountClick}
      >
        <IonContent>
          <div className='home'>
            <div>
              {settingState.showLifeExpectency &&
                accountState.dob &&
                isMoreThanTwoYearsExpectency && (
                  <CountDown
                    goal={life}
                    onConfigClick={handleLifeConfigClick}
                    className='life'
                  />
                )}
            </div>
            <IonCard>
              <IonCardContent>
                <div className='quote'>
                  <h3>{homeState.quote.name}</h3>
                  <q>{homeState.quote.quote}</q>
                </div>
              </IonCardContent>
            </IonCard>
          </div>
        </IonContent>
        {isMoreThanTwoYearsExpectency && settingState.showLifeExpectency && (
          <IonFab vertical='bottom' horizontal='start' slot='fixed'>
            <IonFabButton routerLink='/information'>
              <IonIcon icon={informationCircleOutline} />
            </IonFabButton>
          </IonFab>
        )}
      </HeaderTemplate>
      <CustomModal onDismiss={handleDismiss} showModal={modalStatus}>
        <GoalConfig goal={homeState.life} onSubmit={handleUpdateConfig} />
      </CustomModal>
    </>
  )
}

export default Home
