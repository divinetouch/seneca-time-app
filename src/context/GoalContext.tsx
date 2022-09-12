import createDataContext from './createDataContext'
import { State, Reducer } from './interfaces'
import { Dispatch } from 'react'
import { Plugins, LocalNotificationSchedule } from '@capacitor/core'
import { Status } from './FocusContext'
import moment, { Moment, Duration } from 'moment'
import { config } from '../app_config'

const { Storage, LocalNotifications } = Plugins
const APP_TITLE = config.name

export enum GoalStatus {
  Progress = 'Progress',
  Done = 'Compelete for this period',
  Complete = 'Complete for good',
}

export enum Repeat {
  Daily = 'Daily',
  Weekly = 'Weekly',
  Monthly = 'Monthly',
  Yearly = 'Yearly',
  Long_Term = 'Long_Term',
}

export enum RepeatNotification {
  Daily = 'day',
  Weekly = 'week',
  Monthly = 'month',
  Yearly = 'year',
}

export const defaultCountDownColors = {
  backgroundColor: [
    { r: 244, g: 67, b: 54, a: 1 },
    { r: 248, g: 255, b: 225, a: 1 },
  ],
  yearColor: [
    { r: 244, g: 67, b: 54, a: 1 },
    { r: 248, g: 255, b: 225, a: 1 },
  ],
  monthColor: [
    { r: 178, g: 235, b: 242, a: 1 },
    { r: 209, g: 186, b: 183, a: 1 },
  ],
  dayColor: [
    { r: 255, g: 152, b: 0, a: 1 },
    { r: 255, g: 255, b: 255, a: 1 },
  ],
  hourColor: [
    { r: 220, g: 231, b: 117, a: 1 },
    { r: 234, g: 230, b: 255, a: 1 },
  ],
  minuteColor: [
    { r: 255, g: 193, b: 7, a: 1 },
    { r: 255, g: 255, b: 225, a: 1 },
  ],
  secondColor: [
    { r: 255, g: 87, b: 34, a: 1 },
    { r: 255, g: 255, b: 225, a: 1 },
  ],
}

export interface GoalState extends State {
  title: string
  description: string
  start: string
  end: string
  id: string
  status: GoalStatus
  isDaily: boolean
  repeat: Repeat
  config: {
    status: Status
    title: string
    backgroundColor: object[]
    yearColor: object[]
    monthColor: object[]
    dayColor: object[]
    hourColor: object[]
    minuteColor: object[]
    secondColor: object[]
    notify: boolean
    notifyBeforeStart: number
    notifyBeforeEnd: number
  }
}

export const defaultProps = {
  title: '',
  description: '',
  start: '',
  end: '',
  id: '',
  repeat: Repeat.Long_Term,
  isDaily: false,
  status: GoalStatus.Progress,
  config: {
    status: Status.Hide,
    title: '',
    ...defaultCountDownColors,
    notify: false,
    notifyBeforeStart: 0,
    notifyBeforeEnd: 0,
  },
}

type GoalAction =
  | {
      payload: GoalState[]
      type: 'update_state'
    }
  | {
      payload: GoalState
      type: 'add_goal' | 'update_goal' | 'delete_goal'
    }

const goalReducer: Reducer<GoalState[], GoalAction> = (
  state: GoalState[],
  action: GoalAction
) => {
  switch (action.type) {
    case 'add_goal':
      return [...state, action.payload]
    case 'update_goal':
      return state.map((goal) => {
        return goal.id === action.payload.id ? action.payload : goal
      })
    case 'delete_goal':
      return state.filter((goal) => {
        return goal.id !== action.payload.id
      })
    case 'update_state':
      return [...action.payload]
    default:
      return state
  }
}

const addGoal = (
  dispatch: Dispatch<GoalAction>,
  currentState: GoalState[]
) => async (goal: GoalState) => {
  const goalWithId = {
    ...goal,
    id: Date.now().toString(),
  }
  dispatch({
    type: 'add_goal',
    payload: goalWithId,
  })
  await Storage.set({
    key: 'goals',
    value: JSON.stringify([...currentState, goalWithId]),
  })
  return goalWithId
}

const updateGoal = (
  dispatch: Dispatch<GoalAction>,
  currentState: GoalState[]
) => async (goal: GoalState) => {
  dispatch({ type: 'update_goal', payload: goal })
  const newState = currentState.map((g) => {
    return goal.id === g.id ? goal : g
  })
  await Storage.set({ key: 'goals', value: JSON.stringify(newState) })
  return goal
}

const deleteGoal = (
  dispatch: Dispatch<GoalAction>,
  currentState: GoalState[]
) => async (goal: GoalState) => {
  dispatch({ type: 'delete_goal', payload: goal })
  const newState = currentState.filter((g) => {
    return goal.id !== g.id
  })
  await Storage.set({ key: 'goals', value: JSON.stringify(newState) })
  await deleteNotification(goal)
  return goal
}

const loadGoals = (
  dispatch: Dispatch<GoalAction>,
  _: GoalState[]
) => async () => {
  const goals = await Storage.get({ key: 'goals' })
  if (goals.value) {
    dispatch({ type: 'update_state', payload: JSON.parse(goals.value) })
  }
}

const updateAllNotifications = (
  dispatch: Dispatch<GoalAction>,
  currentState: GoalState[]
) => async (status: boolean) => {
  // reschedule everthing
  if (status === true) {
    console.log('\nActivate all notifications\n')
    for (let goal of currentState) {
      await pushGoalNotification(dispatch)(goal)
    }
  } else {
    console.log('\nDeactivate all notifications\n')
    for (let goal of currentState) {
      await deleteNotification(goal)
    }
  }
}

const _buildBodyText = (
  goal: GoalState,
  value: number,
  start?: boolean
): string => {
  if (value < 1440) {
    return start
      ? `${goal.title} will be started in ${value} minutes`
      : `${goal.title} is due in ${value} minutes`
  } else {
    return start
      ? `${goal.title} will be started in 1 day`
      : `${goal.title} is due in 1 day`
  }
}

const deleteNotification = async (goal: GoalState) => {
  try {
    const enabled = await LocalNotifications.areEnabled()
    if (enabled.value) {
      const notificationList = await LocalNotifications.getPending()
      const pending = notificationList.notifications.filter((notification) => {
        return (
          notification.id === goal.id ||
          notification.id === (+goal.id + 1).toString()
        )
      })

      // cancel all current pending notification before starting a new one
      if (pending.length) {
        await LocalNotifications.cancel({
          notifications: pending,
        })
      }

      console.log(
        '\n----------------------------------\n',
        'nofifcation deleted',
        pending,
        '\n----------------------------------\n'
      )
      return true
    }
  } catch (e) {
    console.log('device not support notification', e)
  }
  return false
}

const pushGoalNotification = (_: Dispatch<GoalAction>) => async (
  goal: GoalState
) => {
  try {
    const enabled = await LocalNotifications.areEnabled()

    await deleteNotification(goal)

    // If system allow notification
    if (enabled.value) {
      // get the notification time
      const notificationStartDate = moment(goal.start).subtract(
        goal.config.notifyBeforeStart,
        'minutes'
      )

      // get the notification time
      const notificationEndDate = moment(goal.end).subtract(
        goal.config.notifyBeforeEnd,
        'minutes'
      )

      // check to see whether the notification time is after now to avoid error
      const { start, end } = getValidNotificationDate(
        goal,
        notificationStartDate,
        notificationEndDate
      )

      console.log(
        '\n----------------------------------\n',
        'nofifcation dates',
        start,
        end,
        '\n----------------------------------\n'
      )

      // Notify Before goal start
      if (goal.config.notifyBeforeStart !== 0 && start) {
        console.log('\nLocal notification start\n')
        LocalNotifications.schedule({
          notifications: [
            {
              id: +goal.id,
              title: APP_TITLE,
              body: _buildBodyText(goal, goal.config.notifyBeforeStart, true),
              sound: 'default',
              schedule: { ...buildSchedule(start, goal.repeat) },
            },
          ],
        })
      }

      console.log('notification object', {
        id: +goal.id,
        title: APP_TITLE,
        body: _buildBodyText(goal, goal.config.notifyBeforeStart, true),
        sound: 'default',
        schedule: { ...buildSchedule(start, goal.repeat) },
      })

      // Notify before goal end
      if (goal.config.notifyBeforeEnd !== 0 && end) {
        console.log('\nLocal notification end\n')
        LocalNotifications.schedule({
          notifications: [
            {
              id: +goal.id + 1,
              title: APP_TITLE,
              body: _buildBodyText(goal, goal.config.notifyBeforeEnd, false),
              sound: 'default',
              schedule: { ...buildSchedule(end, goal.repeat) },
            },
          ],
        })
      }

      console.log({
        id: +goal.id + 1,
        title: APP_TITLE,
        body: _buildBodyText(goal, goal.config.notifyBeforeEnd, false),
        sound: 'default',
        schedule: { ...buildSchedule(end, goal.repeat) },
      })
    }
    return true
  } catch (e) {
    console.log('device not support notification', e)
  }
  return false
}

const getNextOccurence = (
  now: Moment,
  start: Moment,
  durationStartToEnd: Duration,
  timeFrame: number,
  nextOccurance: 'days' | 'weeks' | 'months' | 'years'
): { start: Moment; end: Moment } => {
  if (nextOccurance === 'years') {
    //const startToNow = Math.abs(moment.duration(start.diff(now)).asYears())
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
    return { start: startNextYear, end: endNextYear }
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
    return { start: startNextWeek, end: endNextWeek }
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

    return { start: startNextMonth, end: endNextMonth }
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
    return { start: startNextDay, end: endNextDay }
  }
}

const getValidNotificationDate = (
  goal: GoalState,
  notificationStartDate: Moment,
  notificationEndDate: Moment
): { start: Moment; end: Moment } => {
  const now = moment()
  const durationStartToEnd = moment.duration(
    notificationStartDate.diff(notificationEndDate)
  )

  if (goal.repeat === Repeat.Daily) {
    return getNextOccurence(
      now,
      moment(notificationStartDate),
      durationStartToEnd,
      1,
      'days'
    )
  } else if (goal.repeat === Repeat.Weekly) {
    // the set date notification is in the future
    if (notificationStartDate.isoWeekday() > now.isoWeekday()) {
      return { start: notificationStartDate, end: notificationEndDate }
    }
    return getNextOccurence(
      now,
      moment(notificationStartDate),
      durationStartToEnd,
      1,
      'weeks'
    )
  } else if (goal.repeat === Repeat.Monthly) {
    return getNextOccurence(
      now,
      moment(notificationStartDate),
      durationStartToEnd,
      1,
      'months'
    )
  } else {
    return getNextOccurence(
      now,
      moment(notificationStartDate),
      durationStartToEnd,
      1,
      'years'
    )
  }
}

const buildSchedule = (
  date: Moment,
  repeat: Repeat
): LocalNotificationSchedule => {
  switch (repeat) {
    case Repeat.Daily:
      return {
        every: RepeatNotification.Daily,
        on: {
          hour: date.hours(),
          minute: date.minutes(),
        },
      }
    case Repeat.Weekly:
      return {
        every: RepeatNotification.Weekly,
        at: date.toDate(),
        on: {
          day: date.isoWeekday(),
        },
      }
    case Repeat.Monthly:
      return {
        every: RepeatNotification.Monthly,
        at: date.toDate(),
        on: {
          day: date.days(),
        },
      }
    case Repeat.Yearly:
      return {
        every: RepeatNotification.Yearly,
        at: date.toDate(),
        on: {
          month: date.month(),
        },
      }
    case Repeat.Long_Term:
      return {
        at: date.toDate(),
      }
    default:
      return {}
  }
}

export const { Context, Provider } = createDataContext(
  goalReducer,
  {
    addGoal,
    updateGoal,
    loadGoals,
    deleteGoal,
    pushGoalNotification,
    updateAllNotifications,
  },
  []
)
