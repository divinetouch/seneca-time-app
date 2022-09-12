import React, { useContext, useState, useEffect } from 'react'
import {
  IonContent,
  IonCardContent,
  IonCard,
  IonToolbar,
  IonTitle,
  useIonViewWillEnter,
  IonActionSheet,
} from '@ionic/react'
import HeaderTemplate from '../../templates/HeaderTemplate'
import './DailyGoal.scss'
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
import moment, { Moment, Duration } from 'moment'
import { Plugins, AppState } from '@capacitor/core'
import { useHistory } from 'react-router-dom'
import { checkmark, close, flashOutline } from 'ionicons/icons'

const { App } = Plugins

type GoalContextType = {
  state: GoalState[]
  updateGoal: (goal: GoalState) => Promise<GoalState>
}

const Focus: React.FC = () => {
  const { state, updateGoal } = useContext(GoalContext) as GoalContextType
  const [goaltoConfig, setGoalToConfig] = useState<GoalState>()
  const [modalStatus, setModalStatus] = useState(false)
  const [dailyList, setDailyList] = useState<(JSX.Element | null)[]>([])
  const [tempUpcomingList, setTempUpcomingList] = useState<GoalState[]>([])
  const [tempDailyList, setTempDailyList] = useState<GoalState[]>([])
  const [comingUpList, setComingUpList] = useState<(JSX.Element | null)[]>([])
  const [showActionSheet, setShowActionSheet] = useState(false)
  const history = useHistory()

  const handleConfigClick = (goal: GoalState) => {
    setGoalToConfig({ ...goal })
    setModalStatus(!modalStatus)
  }

  /**
    This is for daily focus.
    If weekly, monthly, quarterly, yearly task is is also today date then 
    all of them is going to show up in this list
   */
  const renderDailyList = () => {
    const current = new Date()
    const toDayList: JSX.Element[] = []
    for (let goal of tempDailyList) {
      if (
        goal.repeat !== Repeat.Long_Term &&
        goal.config.status === Status.Show &&
        goal.status === GoalStatus.Progress &&
        moment(goal.end).isAfter(moment(current))
      ) {
        toDayList.push(
          <CountDownComponent
            updateActionSheetStatus={handleUpdateStatus}
            onConfigClick={handleConfigClick}
            key={goal.id}
            goal={goal}
            className='daily-list'
          />
        )
      }
    }
    setDailyList(toDayList)
  }

  const handleUpdateStatus = (goal: GoalState) => {
    setGoalToConfig(goal)
    setShowActionSheet(true)
  }

  const renderUpcomingList = () => {
    const upcomming: JSX.Element[] = []
    for (let goal of tempUpcomingList) {
      if (
        goal.repeat !== Repeat.Long_Term &&
        goal.status !== GoalStatus.Complete &&
        goal.config.status === Status.Show
      ) {
        upcomming.push(
          <CountDownComponent
            onConfigClick={handleConfigClick}
            key={goal.id}
            goal={goal}
            className='upcoming-list'
          />
        )
      }
    }
    setComingUpList(upcomming)
  }

  const handleDismiss = () => {
    setModalStatus(false)
  }

  const handleUpdateConfig = (goal: GoalState) => {
    updateGoal(goal)
    setModalStatus(false)
  }

  const getNextOccurence = (
    now: Moment,
    start: Moment,
    durationStartToEnd: Duration,
    timeFrame: number,
    nextOccurance: 'days' | 'weeks' | 'months' | 'years'
  ): { start: string; end: string } => {
    if (nextOccurance === 'years') {
      const startToNow = Math.abs(moment.duration(start.diff(now)).asYears())
      const startAt = start.clone().add(timeFrame, nextOccurance)

      let startNextYear = startAt.clone()
      let endNextYear = startNextYear
        .clone()
        .add(Math.abs(durationStartToEnd.asMilliseconds()), 'milliseconds')

      // the accumulation from start till now is today but already passed
      // so let move it to the next day (period)
      if (now.isAfter(startNextYear) && now.isAfter(endNextYear)) {
        startNextYear = startAt.clone().add(timeFrame, nextOccurance)
        endNextYear = startNextYear
          .clone()
          .add(Math.abs(durationStartToEnd.asMilliseconds()), 'milliseconds')
      }
      return { start: startNextYear.toString(), end: endNextYear.toString() }
    } else if (nextOccurance === 'weeks') {
      const dayINeed = start.isoWeekday()
      const startToNow = Math.abs(moment.duration(start.diff(now)).asWeeks())
      const startAt = start.clone().add(startToNow, nextOccurance)

      let startNextWeek = startAt.clone().isoWeekday(dayINeed)
      let endNextWeek = startNextWeek
        .clone()
        .add(Math.abs(durationStartToEnd.asMilliseconds()), 'milliseconds')

      // the accumulation from start till now is today but already passed
      // so let move it to the next day (period)
      if (now.isAfter(startNextWeek) && now.isAfter(endNextWeek)) {
        startNextWeek = startAt
          .clone()
          .add(timeFrame, nextOccurance)
          .isoWeekday(dayINeed)
        endNextWeek = startNextWeek
          .clone()
          .add(Math.abs(durationStartToEnd.asMilliseconds()), 'milliseconds')
      }
      return { start: startNextWeek.toString(), end: endNextWeek.toString() }
    } else if (nextOccurance === 'months') {
      const dayINeed = start.date()
      const startToNow = Math.abs(moment.duration(start.diff(now)).asMonths())
      const startAt = start.clone().add(startToNow, nextOccurance)

      let startNextMonth = startAt.clone().date(dayINeed)
      let endNextMonth = startNextMonth
        .clone()
        .add(Math.abs(durationStartToEnd.asMilliseconds()), 'milliseconds')

      // the accumulation from start till now is now but already passed
      // so let move it to the next day (period)
      if (now.isAfter(startNextMonth) && now.isAfter(endNextMonth)) {
        startNextMonth = startAt
          .clone()
          .add(timeFrame, nextOccurance)
          .date(dayINeed)
        endNextMonth = startNextMonth
          .clone()
          .add(Math.abs(durationStartToEnd.asMilliseconds()), 'milliseconds')
      }

      return { start: startNextMonth.toString(), end: endNextMonth.toString() }
    } else {
      // days
      const startToNow = Math.abs(moment.duration(start.diff(now)).asDays())
      const startAt = start.clone().add(startToNow, nextOccurance)
      let startNextDay = startAt.clone()
      let endNextDay = startNextDay
        .clone()
        .add(Math.abs(durationStartToEnd.asMilliseconds()), 'milliseconds')
      // the accumulation from start till now is today but already passed
      // so let move it to the next day (period)
      if (now.isAfter(startNextDay) && now.isAfter(endNextDay)) {
        startNextDay = startAt.clone().add(timeFrame, nextOccurance)
        endNextDay = startNextDay
          .clone()
          .add(Math.abs(durationStartToEnd.asMilliseconds()), 'milliseconds')
      }
      return { start: startNextDay.toString(), end: endNextDay.toString() }
    }
  }

  /**
    Given the next occurance of the task determine whether it's in today or 
    actually in the future
   */
  const pushToList = (
    nextOccurance: { start: string; end: string },
    goal: GoalState,
    now: Moment,
    dList: GoalState[],
    tList: GoalState[]
  ) => {
    // The task is dued to day --> push to today list
    if (
      moment(nextOccurance.end).isAfter(now) &&
      moment(nextOccurance.start)
        .format('YYYY-MM-DD')
        .toString() === now.format('YYYY-MM-DD').toString()
    ) {
      dList.push({
        ...goal,
        ...nextOccurance,
      })
    } else {
      // The task is after today -> push to upcoming list
      tList.push({
        ...goal,
        ...nextOccurance,
      })
    }
  }

  /**
    Calculate all the tasks dates to determine whether any of them is dued to day.
    If any of them is dued today then push to today list, otherwise, push to 
    upcoming list.
   */
  const refreshDates = () => {
    const now = moment()
    const dList: GoalState[] = []
    const tList: GoalState[] = []

    for (let goal of state) {
      if (
        goal.repeat !== Repeat.Long_Term &&
        goal.status !== GoalStatus.Complete
      ) {
        const momentStart = moment(goal.start)
        const momentEnd = moment(goal.end)
        const durationStartToEnd = moment.duration(momentStart.diff(momentEnd))

        /**
          If start is before now and now is also before end
          -> the task is in progress
         */
        if (momentStart.isBefore(now) && now.isBefore(momentEnd)) {
          dList.push(goal)
        } else if (
          /**
          is the start is after now but it's the same day
           --> that's mean the goal is in progress
           */
          momentStart.isAfter(now) &&
          momentStart.format('YYYY-MM-DD') === now.format('YYYY-MM-DD')
        ) {
          dList.push(goal)
        } else if (
          /**
            The start is after now but the date is different that's mean
            The goal is in the future
           */
          momentStart.isAfter(now) &&
          momentStart.format('YYYY-MM-DD') !== now.format('YYYY-MM-DD')
        ) {
          tList.push(goal)
        }
        // start is in the future
        // or end was in the pass
        // -> push to upcoming tasks list
        else if (now.isAfter(momentEnd)) {
          let nextOccurance: any = {}
          switch (goal.repeat) {
            case Repeat.Daily:
              nextOccurance = getNextOccurence(
                now,
                momentStart,
                durationStartToEnd,
                1,
                'days'
              )
              pushToList(nextOccurance, goal, now, dList, tList)
              break
            case Repeat.Weekly:
              nextOccurance = getNextOccurence(
                now,
                momentStart,
                durationStartToEnd,
                1,
                'weeks'
              )
              pushToList(nextOccurance, goal, now, dList, tList)
              break
            case Repeat.Monthly:
              nextOccurance = getNextOccurence(
                now,
                momentStart,
                durationStartToEnd,
                1,
                'months'
              )
              pushToList(nextOccurance, goal, now, dList, tList)
              break
            case Repeat.Yearly:
              nextOccurance = getNextOccurence(
                now,
                momentStart,
                durationStartToEnd,
                1,
                'years'
              )
              pushToList(nextOccurance, goal, now, dList, tList)
              break
            default:
              break
          }
        }
      }
    }

    console.log(dList, tList)

    setTempDailyList(dList)
    setTempUpcomingList(tList)
  }

  const updateGoalStatus = async (
    upcomingList: GoalState[],
    dailyList: GoalState[]
  ) => {
    for (let g of upcomingList) {
      const gl = state.find((s) => s.id === g.id)
      if (gl && gl.status !== GoalStatus.Complete) {
        await updateGoal({ ...gl, status: GoalStatus.Progress })
      }
    }
    for (let g of dailyList) {
      const gl = state.find((s) => s.id === g.id)
      if (gl && gl.status !== GoalStatus.Complete) {
        await updateGoal({ ...gl, status: GoalStatus.Progress })
      }
    }
  }

  useEffect(() => {
    renderUpcomingList()
    renderDailyList()
  }, [tempUpcomingList, tempDailyList])

  useEffect(() => {
    console.log('use effect state change')
    refreshDates()
    const interval = setInterval(() => {
      refreshDates()
    }, 10000)
    return () => {
      clearInterval(interval)
    }
  }, [state])

  useIonViewWillEnter(() => {
    console.log('use ion will enter')
    refreshDates()
    updateGoalStatus(tempUpcomingList, tempDailyList)
  }, [state])

  useEffect(() => {
    App.addListener('appStateChange', (state: AppState) => {
      if (state.isActive) {
        console.log('app is active => refesh the state')
        refreshDates()
      }
    })
  }, [])

  const handleActionSheetDismiss = () => {
    setShowActionSheet(false)
  }

  const handleAccountClick = () => {
    history.push('/account')
  }

  if (dailyList.length === 0 && comingUpList.length === 0) {
    return (
      <HeaderTemplate
        headerTitle='daily goal'
        showLeftIcon={true}
        showRightIcon={true}
        handleRightIconClick={handleAccountClick}
      >
        <div className='empty_list'>
          <IonCard>
            <IonCardContent>
              Please create a daily, or weekly, or monthly, or yearly goal/task
              and turn on <i>"show on daily page"</i> to have them showing up
              here.
            </IonCardContent>
          </IonCard>
        </div>
      </HeaderTemplate>
    )
  }

  return (
    <>
      <HeaderTemplate
        headerTitle='daily'
        showLeftIcon={true}
        showRightIcon={true}
        handleRightIconClick={handleAccountClick}
      >
        <IonContent className='daily-task-section'>
          {dailyList.length === 0 ? (
            <IonCard>
              <IonCardContent style={{ textAlign: 'center' }}>
                Yay! You are done for today!
              </IonCardContent>
            </IonCard>
          ) : (
            <>
              <IonToolbar color='secondary'>
                <IonTitle>Today</IonTitle>
              </IonToolbar>
              {dailyList}
            </>
          )}
          {comingUpList.length !== 0 && (
            <>
              <IonToolbar color='secondary'>
                <IonTitle>comming up</IonTitle>
              </IonToolbar>
              {comingUpList}
            </>
          )}
        </IonContent>
        <IonActionSheet
          isOpen={showActionSheet}
          onDidDismiss={handleActionSheetDismiss}
          buttons={[
            {
              text: 'Done for today',
              role: 'destructive',
              icon: checkmark,
              handler: async () => {
                await updateGoal({ ...goaltoConfig!, status: GoalStatus!.Done })
              },
            },
            {
              text: 'Hide',
              role: 'destructive',
              icon: flashOutline,
              handler: async () => {
                await updateGoal({
                  ...goaltoConfig!,
                  config: { ...goaltoConfig!.config, status: Status.Hide },
                })
              },
            },
            {
              text: 'Cancel',
              icon: close,
              role: 'cancel',
              handler: () => {
                console.log('Cancel clicked')
              },
            },
          ]}
        />
      </HeaderTemplate>
      <CustomModal onDismiss={handleDismiss} showModal={modalStatus}>
        <GoalConfig goal={goaltoConfig!} onSubmit={handleUpdateConfig} />
      </CustomModal>
    </>
  )
}

export default Focus
